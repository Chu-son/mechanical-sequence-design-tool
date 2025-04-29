import React, { memo } from 'react';
import { type NodeProps, useReactFlow } from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleTaskNodeDefinition from '@/renderer/components/flowchart/components/operation-config-nodes/nodes/SimpleTaskNodeDefinition';
import { TaskNodeData } from '@/renderer/components/flowchart/components/operation-config-nodes/common';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/components/flowchart/styles/common.css';

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
