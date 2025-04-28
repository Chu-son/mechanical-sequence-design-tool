import React, { memo } from 'react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import taskStartNodeDefinition from '@/renderer/components/flowchart/components/operation-config-nodes/nodes/TaskStartNodeDefinition';
import '@/renderer/components/flowchart/styles/common.css';

const TaskStartNode = ({
  id,
  data,
}: {
  id: string;
  data?: any;
}): JSX.Element => (
  <BaseNode
    id={id}
    data={data || {}}
    definition={taskStartNodeDefinition}
    updateNodeData={() => {}}
  />
);

export default memo(TaskStartNode);
