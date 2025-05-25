// Baseノード実装 - 回転型アクチュエータの基本ノード
import React, { memo } from 'react';
import { useReactFlow } from '@xyflow/react';
import BaseNode from '@/renderer/features/flowchart/components/base-nodes/BaseNode';
import baseRotationalActuatorNodeDefinition from './BaseRotationalActuatorNodeDefinition';
import { useNodeInitialData } from '@/renderer/features/flowchart/components/common/useNodeInitialData';
import '@/renderer/styles/FlowchartTheme.css';
import { RotationalActuatorNodeData } from '@/renderer/types/driveTypes';

interface BaseRotationalActuatorNodeProps {
  id: string;
  data: RotationalActuatorNodeData;
  readonly?: boolean;
}

function BaseRotationalActuatorNode({
  id,
  data,
  readonly = false,
}: BaseRotationalActuatorNodeProps) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: baseRotationalActuatorNodeDefinition,
    updateNodeData,
  });

  return (
    <BaseNode
      id={id}
      data={data}
      definition={baseRotationalActuatorNodeDefinition}
      updateNodeData={updateNodeData}
      readonly={readonly}
    />
  );
}

BaseRotationalActuatorNode.defaultProps = {
  readonly: false,
};

export default memo(BaseRotationalActuatorNode);
