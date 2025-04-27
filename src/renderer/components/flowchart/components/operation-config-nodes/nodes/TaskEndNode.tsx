import React, { memo, useEffect } from 'react';
import {
  Handle,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from '@xyflow/react';
import '@/renderer/components/flowchart/styles/common.css'; // flowchart共通スタイルを適用

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

export default memo(TaskEndNode);
