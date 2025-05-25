import React, { useEffect, memo } from 'react';
import { Handle, Position, useReactFlow, useStore } from '@xyflow/react';
import { useNodeInitialData } from '@/renderer/features/flowchart/components/common/useNodeInitialData';
import { TaskNodeData } from '@/renderer/features/flowchart/components/operation-config-nodes/common';
import BaseNode from '@/renderer/features/flowchart/components/base-nodes/BaseNode';
import velocityChartNodeDefinition from './VelocityChartNodeDefinition';
import '@/renderer/styles/FlowchartTheme.css';

/**
 * カスタムハンドルをレンダリングする関数
 */
const renderCustomHandles = () => {
  return <Handle type="target" position={Position.Left} id="detail-target" />;
};

interface VelocityFigureNodeProps {
  id: string;
  data: TaskNodeData;
}

function VelocityFigureNode({ id, data }: VelocityFigureNodeProps) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: velocityChartNodeDefinition,
    updateNodeData,
  });

  // ReactFlowストアからエッジを取得
  const edges = useStore((state) => state.edges);

  // エッジの変化を監視して接続元ノードIDを特定
  useEffect(() => {
    // このノードをターゲットとするエッジを検索
    const incomingEdges = edges.filter((edge) => edge.target === id);
    if (incomingEdges.length > 0) {
      // const sourceId = incomingEdges[0].source;
      // if (data?.sourceNodeId !== sourceId) {
      //   updateNodeData(id, {
      //     ...data,
      //     sourceNodeId: sourceId,
      //     debugInfo: `Source Node ID: ${sourceId}`,
      //   });
      // }
      // } else if (data?.sourceNodeId) {
      //   updateNodeData(id, {
      //     ...data,
      //     sourceNodeId: null,
      //     debugInfo: 'Not connected',
      //   });
      // }
    }
  }, [edges, id, data, updateNodeData]);

  // 前段ノードからのデータ伝播はBaseNodeの共通処理に委任

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
