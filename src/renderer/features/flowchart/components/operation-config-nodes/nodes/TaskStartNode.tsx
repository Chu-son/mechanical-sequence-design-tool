import * as React from 'react';
import { memo } from 'react';
import { useReactFlow } from '@xyflow/react';
import BaseNode from '@/renderer/features/flowchart/components/base-nodes/BaseNode';
import taskStartNodeDefinition from './TaskStartNodeDefinition';
import { TaskNodeData } from '@/renderer/features/flowchart/components/operation-config-nodes/common';
import { useNodeInitialData } from '@/renderer/features/flowchart/components/common/useNodeInitialData';
import '@/renderer/styles/FlowchartTheme.css';

interface TaskStartNodeProps {
  id: string;
  data?: TaskNodeData;
}

function TaskStartNode({ id, data = {} as TaskNodeData }: TaskStartNodeProps) {
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
      data={data}
      definition={taskStartNodeDefinition}
      updateNodeData={updateNodeData}
    />
  );
}

TaskStartNode.defaultProps = {
  data: {} as TaskNodeData,
};

export default memo(TaskStartNode);
