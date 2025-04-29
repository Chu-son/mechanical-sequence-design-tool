import React, { memo } from 'react';
import { useReactFlow } from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import taskStartNodeDefinition from '@/renderer/components/flowchart/components/operation-config-nodes/nodes/TaskStartNodeDefinition';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/components/flowchart/styles/common.css';

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
