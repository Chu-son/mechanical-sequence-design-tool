import React from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleRotToLinConverterNodeDefinition from './SimpleRotToLinConverterNodeDefinition';
import '@/renderer/components/flowchart/styles/common.css';

function SimpleRotToLinConverterNode({
  id,
  data,
  readonly = false,
}: NodeProps<any> & { readonly?: boolean }) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: simpleRotToLinConverterNodeDefinition,
    updateNodeData,
  });

  return (
    <BaseNode
      id={id}
      data={data}
      definition={simpleRotToLinConverterNodeDefinition}
      updateNodeData={updateNodeData}
      readonly={readonly}
    />
  );
}

export default React.memo(SimpleRotToLinConverterNode);
