import React, { memo } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleTaskNodeDefinition from './SimpleTaskNodeDefinition';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/styles/FlowchartTheme.css';

function SimpleTaskNode({ id, data }: NodeProps<{ data: TaskNodeData }>) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: simpleTaskNodeDefinition,
    updateNodeData,
  });
  return (
    <BaseNode
      id={id}
      data={data}
      definition={simpleTaskNodeDefinition}
      updateNodeData={updateNodeData}
    />
  );
}

export default memo(SimpleTaskNode);
