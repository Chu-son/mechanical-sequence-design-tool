import React, { memo, useEffect } from 'react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import taskEndNodeDefinition from '@/renderer/components/flowchart/components/operation-config-nodes/nodes/TaskEndNodeDefinition';
import '@/renderer/components/flowchart/styles/common.css';

const TaskEndNode = ({
  id,
  data,
}: {
  id: string;
  data: { totalDuration: number };
}): JSX.Element => {
  // 合計持続時間はprops経由で渡す
  return (
    <BaseNode
      id={id}
      data={data}
      definition={taskEndNodeDefinition}
      updateNodeData={() => {}}
    />
  );
};

export default memo(TaskEndNode);
