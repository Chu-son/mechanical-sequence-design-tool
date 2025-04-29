import React, { useEffect, memo } from 'react';
import {
  Handle,
  Position,
  useReactFlow,
  useStore,
  type NodeProps,
} from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import velocityChartNodeDefinition from './VelocityChartNodeDefinition';
import { TaskNodeData } from '@/renderer/components/flowchart/components/operation-config-nodes/common';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/components/flowchart/styles/common.css';

/**
 * カスタムハンドルをレンダリングする関数
 */
const renderCustomHandles = (id: string, data: any) => {
  return <Handle type="target" position={Position.Left} id="detail-target" />;
};

function VelocityFigureNode({ id, data }: NodeProps<{ data: TaskNodeData }>) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: velocityChartNodeDefinition,
    updateNodeData,
  });

  // ReactFlowストアからエッジを取得
  const edges = useStore((state) => state.edges);

  // 接続元ノードのデータを取得
  const sourceNodeData = useStore((state) => {
    if (!data?.sourceNodeId) return null;
    const sourceNode = state.nodes.find(
      (node) => node.id === data.sourceNodeId,
    );
    return sourceNode?.data;
  });

  // エッジの変化を監視して接続元ノードを特定
  useEffect(() => {
    // 既に接続元が設定されている場合はスキップ
    if (data?.sourceNodeId) return;

    // このノードをターゲットとするエッジを検索
    const incomingEdges = edges.filter((edge) => edge.target === id);
    if (incomingEdges.length > 0) {
      const sourceId = incomingEdges[0].source;
      updateNodeData(id, {
        ...data,
        sourceNodeId: sourceId,
        debugInfo: `Source Node ID: ${sourceId}`,
      });
    } else {
      updateNodeData(id, {
        ...data,
        sourceNodeId: null,
        debugInfo: 'Not connected',
      });
    }
  }, [edges, id, data, updateNodeData]);

  // 接続元ノードのデータが変化した場合の同期処理
  useEffect(() => {
    if (!data?.sourceNodeId || !sourceNodeData) return;

    const newPosition =
      sourceNodeData.position !== undefined ? sourceNodeData.position : 0;
    const newVelocity =
      sourceNodeData.velocity !== undefined ? sourceNodeData.velocity : 0;
    const newAcceleration =
      sourceNodeData.acceleration !== undefined
        ? sourceNodeData.acceleration
        : 0;
    const newDeceleration =
      sourceNodeData.deceleration !== undefined
        ? sourceNodeData.deceleration
        : 0;

    // 値が変更された場合のみ更新
    if (
      newPosition !== data.position ||
      newVelocity !== data.velocity ||
      newAcceleration !== data.acceleration ||
      newDeceleration !== data.deceleration
    ) {
      updateNodeData(id, {
        ...data,
        position: newPosition,
        velocity: newVelocity,
        acceleration: newAcceleration,
        deceleration: newDeceleration,
        debugInfo: `Source: ${data.sourceNodeId}, Position: ${newPosition}, Velocity: ${newVelocity}, Acceleration: ${newAcceleration}, Deceleration: ${newDeceleration}`,
      });
    }
  }, [id, data, sourceNodeData, updateNodeData]);

  // BaseNodeを使用して描画
  return (
    <BaseNode
      id={id}
      data={data}
      definition={velocityChartNodeDefinition}
      renderHandles={renderCustomHandles}
      updateNodeData={(nodeId, newData) => updateNodeData(nodeId, newData)}
      className="velocity-chart-node"
    />
  );
}

export default memo(VelocityFigureNode);
