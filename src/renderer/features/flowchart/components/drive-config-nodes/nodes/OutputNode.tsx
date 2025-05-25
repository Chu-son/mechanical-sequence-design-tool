import React, { memo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useNodeInitialData } from '@/renderer/features/flowchart/components/common/useNodeInitialData';
import outputNodeDefinition from './OutputNodeDefinition';
import { OutputNodeData } from '@/renderer/types/driveTypes';
import '@/renderer/styles/FlowchartTheme.css';
import BaseNode from '@/renderer/features/flowchart/components/base-nodes/BaseNode';

interface OutputNodeProps {
  id: string;
  data: OutputNodeData;
}

function OutputNode({ id, data }: OutputNodeProps) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: outputNodeDefinition,
    updateNodeData,
  });

  // 前段ノードからのoutputSpec伝播はBaseNodeの共通処理に委任

  return (
    <BaseNode
      id={id}
      data={data}
      definition={outputNodeDefinition}
      updateNodeData={updateNodeData}
    />
  );
}

OutputNode.defaultProps = {};

export default memo(OutputNode);
