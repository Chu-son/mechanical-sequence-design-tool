import React, { memo } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import outputNodeDefinition from './OutputNodeDefinition';
import { OutputNodeData } from '@/renderer/types/driveTypes';
import '@/renderer/components/flowchart/styles/common.css';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';

function OutputNode({ id, data }: NodeProps<OutputNodeData>) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id: id as string,
    data,
    definition: outputNodeDefinition,
    updateNodeData,
  });

  // 前段ノードからのoutputSpec伝播はBaseNodeの共通処理に委任

  return (
    <BaseNode
      id={id as string}
      data={data}
      definition={outputNodeDefinition}
      updateNodeData={updateNodeData}
    />
  );
}

export default memo(OutputNode);
