import React, { memo } from 'react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import taskEndNodeDefinition from '@/renderer/components/flowchart/components/operation-config-nodes/nodes/TaskEndNodeDefinition';
import '@/renderer/components/flowchart/styles/common.css';
import { useReactFlow } from '@xyflow/react';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';

function TaskEndNode({
  id,
  data,
}: {
  id: string;
  data: { totalDuration: number };
}): JSX.Element {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: taskEndNodeDefinition,
    updateNodeData,
  });
  return (
    <BaseNode
      id={id}
      data={data}
      definition={taskEndNodeDefinition}
      updateNodeData={updateNodeData}
    />
  );
}

export default memo(TaskEndNode);
