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

function roundToDigits(value, digits) {
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
  const nodesData = useNodesData(connections?.[0].source);

  const [totalDuration, setTotalDuration] = useState(data.totalDuration || 0);
  const [taskNode, setTaskNode] = useState(data);
  const [inputValue, setInputValue] = useState(String(data.duration || 0));

  useEffect(() => {
    const previousTotalDuration = nodesData?.data?.totalDuration || 0;

    const newTotalDuration = previousTotalDuration + taskNode.duration;
    const roundedTotalDuration = roundToDigits(newTotalDuration, ROUND_DIGITS);

    setTotalDuration(roundedTotalDuration);
    updateNodeData(id, { ...taskNode, totalDuration: roundedTotalDuration });
  }, [id, taskNode, updateNodeData, nodesData]);

  const handleBlur = (event) => {
    let value = event.target.value;
    if (value === '') {
      value = 0;
    } else {
      value = parseFloat(value);
      value = roundToDigits(value, ROUND_DIGITS);
    }
    if (!isNaN(value)) {
      setTaskNode({ ...taskNode, duration: value });
      updateNodeData(id, { ...taskNode, duration: value });
      setInputValue(value.toFixed(ROUND_DIGITS));
    }
  };

  const handleChange = (event) => {
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

const TaskStartNode = ({ id }) => (
  <div className="node">
    <div className="node-title">Task Start</div>

    <Handle type="source" position={Position.Bottom} />
  </div>
);

const TaskEndNode = ({ id, data }) => {
  const { getNode, getEdges } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const nodesData = useNodesData(connections?.[0].source);

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

  const totalDuration = calculateTotalDuration();

  useEffect(() => {
    const roundedTotalDuration = calculateTotalDuration();
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
export default memo(SimpleTaskNode);
