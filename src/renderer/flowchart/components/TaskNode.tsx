import { memo, useEffect, useState, useCallback } from 'react';
import {
  Position,
  Handle,
  useReactFlow,
  type NodeProps,
  type Node,
  useNodeConnections,
  useNodesData,
} from '@xyflow/react';
import '../styles/common.css'; // flowchart共通スタイルを適用

const ROUND_DIGITS = 2;

function roundToDigits(value: number, digits: number): number {
  return parseFloat(value.toFixed(digits));
}

type TaskNodeData = {
  description: string;
  duration: number;
  totalDuration: number;
};

function SimpleTaskNode({ id, data }: NodeProps<Node<TaskNodeData, 'task'>>) {
  const { updateNodeData, getNode, getEdges } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const nodesData = useNodesData(connections?.[0]?.source) as
    | { data?: { totalDuration?: number } }
    | undefined;

  const [totalDuration, setTotalDuration] = useState(data.totalDuration || 0);
  const [taskNode, setTaskNode] = useState(data);
  const [inputValue, setInputValue] = useState(String(data.duration || 0));

  useEffect(() => {
    if (nodesData !== undefined) {
      const previousTotalDuration = nodesData?.data?.totalDuration ?? 0;

      const newTotalDuration = previousTotalDuration + (taskNode.duration || 0);
      const roundedTotalDuration = roundToDigits(
        newTotalDuration,
        ROUND_DIGITS,
      );

      setTotalDuration(roundedTotalDuration);
      updateNodeData(id, { ...taskNode, totalDuration: roundedTotalDuration });
    } else {
      setTotalDuration(0);
      updateNodeData(id, { ...taskNode, totalDuration: 0 });
    }
  }, [id, taskNode, updateNodeData, nodesData]);

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
    let value = parseFloat(event.target.value || '0');
    if (Number.isNaN(value)) {
      value = 0;
      value = roundToDigits(value, ROUND_DIGITS);
    }
    if (!Number.isNaN(value)) {
      setTaskNode({ ...taskNode, duration: value });
      updateNodeData(id, { ...taskNode, duration: value });
      setInputValue(value.toFixed(ROUND_DIGITS));
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(event.target.value);
  };

  return (
    <div className="node">
      <Handle type="target" position={Position.Top} />
      <div className="node-title">Simple Task</div>
      <div className="node-content">
        <div className="node-setting-field">
          <label>
            Description
            <br />
            <input
              type="text"
              value={taskNode.description || ''} // 初期値を空文字列に設定
              onChange={(event) => {
                const newDescription = event.target.value;
                setTaskNode({ ...taskNode, description: newDescription });
                updateNodeData(id, {
                  ...taskNode,
                  description: newDescription,
                });
              }}
            />
          </label>
          <label>
            Duration [sec] ({ROUND_DIGITS}digits)
            <br />
            <input
              type="text"
              value={inputValue}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </label>
        </div>
        <hr className="node-divider" />
        <div className="node-readonly-field">
          <div>Node ID: {id}</div>
          <div>Total Duration [sec]: {totalDuration}</div>
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    </div>
  );
}

const TaskStartNode = ({ id }: { id: string }): JSX.Element => (
  <div className="node">
    <div className="node-title">Task Start</div>

    <Handle type="source" position={Position.Bottom} />
  </div>
);

const TaskEndNode = ({
  id,
  data,
}: {
  id: string;
  data: { totalDuration: number };
}): JSX.Element => {
  const { getNode, getEdges } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const nodesData = useNodesData(connections?.[0]?.source) as
    | { data?: { totalDuration?: number } }
    | undefined;

  const calculateTotalDuration = () => {
    const edges = getEdges();
    let previousTotalDuration = 0;

    const incomingEdges = edges.filter((edge) => edge.target === id);
    if (incomingEdges.length > 0) {
      const previousNodeId = incomingEdges[0].source;
      const previousNode = getNode(previousNodeId);
      previousTotalDuration = previousNode?.data?.totalDuration || 0;
    }

    return previousTotalDuration;
  };

  const totalDuration = calculateTotalDuration() ?? 0;

  useEffect(() => {
    const roundedTotalDuration = calculateTotalDuration() ?? 0;
    data.totalDuration = roundedTotalDuration;
  }, [data, nodesData]);

  return (
    <div className="node">
      <Handle type="target" position={Position.Top} />

      <div className="node-title">Task End</div>
      <hr className="node-divider" />
      <div className="node-readonly-field">
        <div>Total Duration [sec]: {totalDuration}</div>
      </div>
    </div>
  );
};

export const MemoizedTaskStartNode = memo(TaskStartNode);
export const MemoizedTaskEndNode = memo(TaskEndNode);
export const SimpleActuatorTaskNode = memo(function SimpleActuatorTaskNode({
  id,
  data,
}: NodeProps<Node<TaskNodeData, 'task'>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const nodesData = useNodesData(connections?.[0]?.source) as
    | { data?: { totalDuration?: number } }
    | undefined;

  const [totalDuration, setTotalDuration] = useState(data.totalDuration || 0);
  const [taskNode, setTaskNode] = useState(data);
  const [position, setPosition] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [acceleration, setAcceleration] = useState(0);
  const [deceleration, setDeceleration] = useState(0);

  const calculateDuration = useCallback(() => {
    if (velocity > 0 && acceleration > 0) {
      const duration =
        (2 * position) /
        (velocity + Math.sqrt(velocity ** 2 + 2 * acceleration * position));
      return roundToDigits(duration, ROUND_DIGITS);
    }
    return 0;
  }, [position, velocity, acceleration]);

  useEffect(() => {
    if (nodesData !== undefined) {
      const previousTotalDuration = nodesData?.data?.totalDuration ?? 0;

      const newDuration = calculateDuration();
      const newTotalDuration = previousTotalDuration + newDuration;
      const roundedTotalDuration = roundToDigits(
        newTotalDuration,
        ROUND_DIGITS,
      );

      setTotalDuration(roundedTotalDuration);
      updateNodeData(id, {
        ...taskNode,
        duration: newDuration,
        totalDuration: roundedTotalDuration,
      });
    } else {
      setTotalDuration(0);
      updateNodeData(id, { ...taskNode, totalDuration: 0 });
    }
  }, [id, taskNode, updateNodeData, nodesData, calculateDuration]);

  return (
    <div className="node">
      <Handle type="target" position={Position.Top} />
      <div className="node-title">Simple Actuator Task</div>
      <div className="node-content">
        <div className="node-setting-field">
          <label>
            Displacement [mm]
            <br />
            <input
              type="number"
              value={position}
              onChange={(e) => setPosition(parseFloat(e.target.value) || 0)}
            />
          </label>
          <label>
            Velocity [mm/s]
            <br />
            <input
              type="number"
              value={velocity}
              onChange={(e) => setVelocity(parseFloat(e.target.value) || 0)}
            />
          </label>
          <label>
            Acceleration [mm/s²]
            <br />
            <input
              type="number"
              value={acceleration}
              onChange={(e) => setAcceleration(parseFloat(e.target.value) || 0)}
            />
          </label>
          <label>
            Deceleration [mm/s²]
            <br />
            <input
              type="number"
              value={deceleration}
              onChange={(e) => setDeceleration(parseFloat(e.target.value) || 0)}
            />
          </label>
        </div>
        <hr className="node-divider" />
        <div className="node-readonly-field">
          <div>Node ID: {id}</div>
          <div>Total Duration [sec]: {totalDuration}</div>
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    </div>
  );
});

export default memo(SimpleTaskNode);
