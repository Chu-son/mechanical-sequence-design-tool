import React from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleRotToRotConverterNodeDefinition from './SimpleRotToRotConverterNodeDefinition';
import '@/renderer/components/flowchart/styles/common.css';

function SimpleRotToRotConverterNode({
  id,
  data,
  readonly = false,
}: NodeProps<any> & { readonly?: boolean }) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: simpleRotToRotConverterNodeDefinition,
    updateNodeData,
  });

  return (
    <BaseNode
      id={id}
      data={data}
      definition={simpleRotToRotConverterNodeDefinition}
      updateNodeData={updateNodeData}
      readonly={readonly}
    />
  );
}

export default React.memo(SimpleRotToRotConverterNode);
