import React, { memo } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleLinearActuatorNodeDefinition from './SimpleLinearActuatorNodeDefinition';
import '@/renderer/components/flowchart/styles/common.css';

function SimpleLinearActuatorNode({ id, data }: NodeProps<any>) {
  const { updateNodeData } = useReactFlow();
  return (
    <BaseNode
      id={id}
      data={data}
      definition={simpleLinearActuatorNodeDefinition}
      updateNodeData={updateNodeData}
    />
  );
}

export default memo(SimpleLinearActuatorNode);
