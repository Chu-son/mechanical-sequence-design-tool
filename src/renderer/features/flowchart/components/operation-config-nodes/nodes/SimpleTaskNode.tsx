import React, { memo } from 'react';
import { useReactFlow } from '@xyflow/react';
import BaseNode from '@/renderer/features/flowchart/components/base-nodes/BaseNode';
import simpleTaskNodeDefinition from './SimpleTaskNodeDefinition';
import { TaskNodeData } from '@/renderer/features/flowchart/components/operation-config-nodes/common';
import { useNodeInitialData } from '@/renderer/features/flowchart/components/common/useNodeInitialData';
import '@/renderer/styles/FlowchartTheme.css';

interface SimpleTaskNodeProps {
  id: string;
  data: TaskNodeData;
}

function SimpleTaskNode({ id, data }: SimpleTaskNodeProps) {
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
