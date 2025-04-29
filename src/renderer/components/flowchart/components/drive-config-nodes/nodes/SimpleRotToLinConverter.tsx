import React, { memo, useCallback, useEffect } from 'react';
import {
  useReactFlow,
  useNodeConnections,
  useNodesData,
  type NodeProps,
} from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleRotToLinConverterNodeDefinition from './SimpleRotToLinConverterNodeDefinition';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/components/flowchart/styles/common.css';

function SimpleRotToLinConverterNode({
  id,
  data,
  readonly,
}: NodeProps<any> & { readonly?: boolean }) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: simpleRotToLinConverterNodeDefinition,
    updateNodeData,
  });

  const connections = useNodeConnections({ handleType: 'target' });
  const sourceNodeData = useNodesData(connections?.[0]?.source) as
    | { data?: { calculatedOutput?: any } }
    | undefined;

  useEffect(() => {
    if (!data) return;
    const input = sourceNodeData?.data?.calculatedOutput?.rotational;
    if (!input) return;
    const {
      conversionRatio = 1,
      maxForce = 1,
      maxSpeed = 1,
      efficiency = 1,
    } = data;
    const outputForce =
      (input.torque * 2 * Math.PI * efficiency) / conversionRatio;
    const outputVelocity = (input.speed * conversionRatio) / 60;
    const outputPower = outputForce * outputVelocity;
    const isOverloadedForce = outputForce > maxForce;
    const isOverloadedSpeed = outputVelocity > maxSpeed;
    const isOverloaded = isOverloadedForce || isOverloadedSpeed;
    const calculatedOutput = {
      linear: {
        force: outputForce,
        velocity: outputVelocity,
        power: outputPower,
        acceleration: 0,
        mass: 0,
        direction: input.direction,
      },
      efficiency,
      maxLoad: maxForce,
      isOverloaded,
    };
    if (
      JSON.stringify(data.calculatedOutput) !== JSON.stringify(calculatedOutput)
    ) {
      updateNodeData(id, { ...data, calculatedOutput });
    }
  }, [id, data, sourceNodeData, updateNodeData]);

  return (
    <BaseNode
      id={id}
      data={data}
      definition={simpleRotToLinConverterNodeDefinition}
      updateNodeData={updateNodeData}
      readonly={readonly}
    />
  );
}

export default memo(SimpleRotToLinConverterNode);
