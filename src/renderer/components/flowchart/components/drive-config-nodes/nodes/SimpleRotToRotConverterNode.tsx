import React, { memo, useCallback, useEffect } from 'react';
import {
  useReactFlow,
  useNodeConnections,
  useNodesData,
  type NodeProps,
} from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleRotToRotConverterNodeDefinition from './SimpleRotToRotConverterNodeDefinition';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/components/flowchart/styles/common.css';

function SimpleRotToRotConverterNode({
  id,
  data,
  readonly,
}: NodeProps<any> & { readonly?: boolean }) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: simpleRotToRotConverterNodeDefinition,
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
    const { gearRatio = 1, inertia = 0, maxTorque = 1, efficiency = 1 } = data;
    const outputTorque = input.torque * gearRatio * efficiency;
    const outputSpeed = input.speed / gearRatio;
    const outputPower = (outputTorque * outputSpeed * Math.PI) / 30;
    const calculatedOutput = {
      rotational: {
        torque: outputTorque,
        speed: outputSpeed,
        power: outputPower,
        inertia: inertia + input.inertia / (gearRatio * gearRatio),
        direction: input.direction,
      },
      efficiency,
      maxLoad: maxTorque,
      isOverloaded: outputTorque > maxTorque,
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
      definition={simpleRotToRotConverterNodeDefinition}
      updateNodeData={updateNodeData}
      readonly={readonly}
    />
  );
}

export default memo(SimpleRotToRotConverterNode);
