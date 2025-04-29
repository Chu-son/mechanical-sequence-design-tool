import React, { memo, useEffect } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleLinearActuatorNodeDefinition from './SimpleLinearActuatorNodeDefinition';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/components/flowchart/styles/common.css';

function SimpleLinearActuatorNode({ id, data }: NodeProps<any>) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: simpleLinearActuatorNodeDefinition,
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
      updateNodeData(id, { ...data, calculatedOutput });
    }
  }, [id, data, updateNodeData]);

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
