// Baseノード実装 - 直動型アクチュエータの基本ノード
import React, { memo, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import BaseNode from '@/renderer/features/flowchart/components/base-nodes/BaseNode';
import baseLinearActuatorNodeDefinition from './BaseLinearActuatorNodeDefinition';
import { useNodeInitialData } from '@/renderer/features/flowchart/components/common/useNodeInitialData';
import '@/renderer/styles/FlowchartTheme.css';
import { LinearActuatorNodeData } from '@/renderer/types/driveTypes';

interface BaseLinearActuatorNodeProps {
  id: string;
  data: LinearActuatorNodeData;
  readonly?: boolean;
}

function BaseLinearActuatorNode({
  id,
  data,
  readonly = false,
}: BaseLinearActuatorNodeProps) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: baseLinearActuatorNodeDefinition,
    updateNodeData,
  });

  useEffect(() => {
    if (!data) return;
    const force = data.ratedForce ?? 1;
    const speed = Math.min(data.ratedSpeed ?? 1, data.maxSpeed ?? 1);
    const acceleration = (data as any).acceleration ?? 0;
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
      JSON.stringify((data as any).calculatedOutput) !== JSON.stringify(calculatedOutput)
    ) {
      updateNodeData(id, {
        ...data,
        calculatedOutput,
      });
    }
  }, [id, data, updateNodeData]);

  return (
    <BaseNode
      id={id}
      data={data}
      definition={baseLinearActuatorNodeDefinition}
      updateNodeData={updateNodeData}
      readonly={readonly}
    />
  );
}

BaseLinearActuatorNode.defaultProps = {
  readonly: false,
};

export default memo(BaseLinearActuatorNode);
