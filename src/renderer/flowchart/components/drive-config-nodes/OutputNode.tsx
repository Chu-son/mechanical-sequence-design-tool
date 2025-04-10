import React, { memo, useEffect, useCallback, JSX } from 'react';
import {
  Handle,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
} from '@xyflow/react';
import '../../styles/common.css'; // flowchart共通スタイルを適用

function OutputNode({
  id,
  data,
}: {
  id: string;
  data: { totalDuration: number };
}): JSX.Element {
  const { getNode, getEdges } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const rawNodesData = useNodesData(connections?.[0]?.source) as
    | { data?: { totalDuration?: number } }
    | undefined;

  const nodesData =
    rawNodesData?.data?.totalDuration !== undefined
      ? rawNodesData
      : { data: { totalDuration: 0 } };

  const calculateTotalDuration = useCallback(() => {
    const edges = getEdges();
    let previousTotalDuration = 0;

    const incomingEdges = edges.filter((edge) => edge.target === id);
    if (incomingEdges.length > 0) {
      const previousNodeId = incomingEdges[0].source;
      const previousNode = getNode(previousNodeId);
      previousTotalDuration = previousNode?.data?.totalDuration || 0;
    }

    return previousTotalDuration || 0;
  }, [getEdges, getNode, id]);

  const totalDuration = calculateTotalDuration();

  useEffect(() => {
    const roundedTotalDuration = calculateTotalDuration();
    data.totalDuration = roundedTotalDuration;
  }, [data, rawNodesData, calculateTotalDuration]);

  return (
    <div className="node">
      <Handle type="target" position={Position.Top} />
      <div className="node-title">Output Node</div>
      <hr className="node-divider" />
      <div className="node-readonly-field">
        <div>Total Duration [sec]: {totalDuration}</div>
      </div>
    </div>
  );
}

export default memo(OutputNode);
