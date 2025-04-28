import React, { memo, useEffect } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleRotationalActuatorNodeDefinition from './SimpleRotationalActuatorNodeDefinition';
import '@/renderer/components/flowchart/styles/common.css';

function SimpleRotationalActuatorNode({
  id,
  data,
  readonly,
}: NodeProps<any> & { readonly?: boolean }) {
  const { updateNodeData } = useReactFlow();

  // 初期データの設定
  useEffect(() => {
    if (!data || Object.keys(data).length === 0) {
      const initialData =
        simpleRotationalActuatorNodeDefinition.getInitialData?.() || {};
      updateNodeData(id, initialData);
    }
  }, [id, data, updateNodeData]);

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
