import React, { memo } from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import taskStartNodeDefinition from './TaskStartNodeDefinition';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/styles/FlowchartTheme.css';

function TaskStartNode({ id, data }: { id: string; data?: any }): JSX.Element {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: taskStartNodeDefinition,
    updateNodeData,
  });
  return (
    <BaseNode
      id={id}
      data={data || {}}
      definition={taskStartNodeDefinition}
      updateNodeData={updateNodeData}
    />
  );
}

export default memo(TaskStartNode);
