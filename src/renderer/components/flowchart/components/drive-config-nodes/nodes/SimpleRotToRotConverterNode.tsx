import React, { memo } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleRotToRotConverterNodeDefinition from './SimpleRotToRotConverterNodeDefinition';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/styles/FlowchartTheme.css';
import { RotToRotConverterNodeData } from '@/renderer/types/driveTypes';

function SimpleRotToRotConverterNode({
  id,
  data,
  readonly = false,
}: NodeProps<RotToRotConverterNodeData> & { readonly?: boolean }) {
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
