// Baseノード実装 - 直動型アクチュエータの基本ノード
import React, { memo, useEffect } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import baseLinearActuatorNodeDefinition from './BaseLinearActuatorNodeDefinition';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/styles/FlowchartTheme.css';
import { LinearActuatorNodeData } from '@/renderer/types/driveTypes';

interface BaseLinearActuatorNodeProps
  extends NodeProps<LinearActuatorNodeData> {
  readonly?: boolean;
  displayName?: string; // 表示名をpropsで受け取れるように追加
}

function BaseLinearActuatorNode({
  id,
  data,
  readonly,
  displayName,
}: BaseLinearActuatorNodeProps) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: baseLinearActuatorNodeDefinition,
    updateNodeData,
  });

  // アクチュエータは前段ノードを持たないため、パラメータ変化時のみ計算
  useEffect(() => {
    if (!data) return;
    const {
      ratedForce = 1,
      ratedSpeed = 1,
      maxSpeed = 1,
      acceleration = 0,
    } = data;
    const force = ratedForce;
    const speed = Math.min(ratedSpeed, maxSpeed);
    const power = (force * speed) / 1000;
    const calculatedOutput = {
      linear: {
        force,
        velocity: speed,
        acceleration,
        power,
        mass: 1,
        direction: 1,
      },
      efficiency: 1,
      maxLoad: force,
      isOverloaded: false,
    };
    if (
      JSON.stringify(data.calculatedOutput) !== JSON.stringify(calculatedOutput)
    ) {
      updateNodeData(id, {
        ...data,
        displayName: displayName || data.displayName, // 表示名を優先的に使用
        calculatedOutput,
      });
    }
  }, [id, data, updateNodeData, displayName]);

  return (
    <BaseNode
      id={id}
      data={{
        ...data,
        displayName: displayName || data.displayName, // 表示名を優先的に使用
      }}
      definition={baseLinearActuatorNodeDefinition}
      updateNodeData={updateNodeData}
      readonly={readonly}
    />
  );
}

export default memo(BaseLinearActuatorNode);
