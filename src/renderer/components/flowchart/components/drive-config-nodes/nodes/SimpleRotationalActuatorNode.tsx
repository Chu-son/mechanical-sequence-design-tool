import React, { memo } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleRotationalActuatorNodeDefinition from './SimpleRotationalActuatorNodeDefinition';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/components/flowchart/styles/common.css';

function SimpleRotationalActuatorNode({
  id,
  data,
  readonly,
}: NodeProps<any> & { readonly?: boolean }) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: simpleRotationalActuatorNodeDefinition,
    updateNodeData,
  });

  return (
    <BaseNode
      id={id}
      data={data}
      definition={simpleRotationalActuatorNodeDefinition}
      updateNodeData={updateNodeData}
      readonly={readonly}
    />
  );
}

export default memo(SimpleRotationalActuatorNode);
