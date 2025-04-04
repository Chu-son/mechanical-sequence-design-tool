import { memo, useEffect, useState } from 'react';
import {
  Position,
  Handle,
  useReactFlow,
  type NodeProps,
  type Node,
} from '@xyflow/react';

type TaskNodeData = {
  duration: number;
  totalDuration: number;
};

function TaskNode({ id, data }: NodeProps<Node<TaskNodeData, 'task'>>) {
  const { updateNodeData, getNode, getEdges } = useReactFlow();
  const [totalDuration, setTotalDuration] = useState(data.totalDuration || 0);
  const [taskNode, setTaskNode] = useState(data);

  useEffect(() => {
    console.log(`TaskNode ${id} created`);
  }, [id]);

  useEffect(() => {
    const edges = getEdges();
    const incomingEdges = edges.filter(edge => edge.target === id);
    let previousTotalDuration = 0;

    if (incomingEdges.length > 0) {
      const previousNodeId = incomingEdges[0].source;
      const previousNode = getNode(previousNodeId);
      previousTotalDuration = previousNode?.data?.totalDuration || 0;
    }

    const newTotalDuration = previousTotalDuration + taskNode.duration;
    setTotalDuration(newTotalDuration);
    updateNodeData(id, { ...taskNode, totalDuration: newTotalDuration });
  }, [taskNode.duration, id, getNode, getEdges, updateNodeData]);

  const handleBlur = (event) => {
    let value = event.target.value;
    if (value === '') {
      value = 0;
    } else {
      value = parseFloat(value);
    }
    if (!isNaN(value)) {
      setTaskNode({ ...taskNode, duration: value });
      updateNodeData(id, { ...taskNode, duration: value });
    }
  };

  return (
    <div>
      <Handle type="target" position={Position.Top} />
      <div>node {id}</div>
      <label>
        Duration:
        <input type="text" value={taskNode.duration} onBlur={handleBlur} />
      </label>
      <div>Total Duration: {totalDuration}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const TaskStartNode = ({ id }) => (
  <div>
    <div>Task Start Node {id}</div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const TaskEndNode = ({ id }) => (
  <div>
    <Handle type="target" position={Position.Top} />
    <div>Task End Node {id}</div>
  </div>
);

export const MemoizedTaskStartNode = memo(TaskStartNode);
export const MemoizedTaskEndNode = memo(TaskEndNode);
export default memo(TaskNode);
