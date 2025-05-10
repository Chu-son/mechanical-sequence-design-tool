// Baseノード実装 - 回転型アクチュエータの基本ノード
import React, { memo } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import baseRotationalActuatorNodeDefinition from './BaseRotationalActuatorNodeDefinition';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/styles/FlowchartTheme.css';
import { RotationalActuatorNodeData } from '@/renderer/types/driveTypes';

interface BaseRotationalActuatorNodeProps
  extends NodeProps<RotationalActuatorNodeData> {
  readonly?: boolean;
  displayName?: string; // 表示名をpropsで受け取れるように追加
}

function BaseRotationalActuatorNode({
  id,
  data,
  readonly,
  displayName,
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
      data={{
        ...data,
        displayName: displayName || data.displayName, // 表示名を優先的に使用
      }}
      definition={baseRotationalActuatorNodeDefinition}
      updateNodeData={updateNodeData}
      readonly={readonly}
    />
  );
}

export default memo(BaseRotationalActuatorNode);
