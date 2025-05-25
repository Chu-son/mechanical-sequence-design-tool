import * as React from 'react';
import { memo } from 'react';
import { useReactFlow } from '@xyflow/react';
import BaseNode from '@/renderer/features/flowchart/components/base-nodes/BaseNode';
import taskEndNodeDefinition from '@/renderer/features/flowchart/components/operation-config-nodes/nodes/TaskEndNodeDefinition';
import { TaskNodeData } from '@/renderer/features/flowchart/components/operation-config-nodes/common';
import { useNodeInitialData } from '@/renderer/features/flowchart/components/common/useNodeInitialData';
import '@/renderer/styles/FlowchartTheme.css';

interface TaskEndNodeProps {
  id: string;
  data: TaskNodeData;
}

function TaskEndNode({ id, data }: TaskEndNodeProps) {
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
