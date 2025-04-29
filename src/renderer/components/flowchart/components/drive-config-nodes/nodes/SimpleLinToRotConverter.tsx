import React, { memo, useCallback, useEffect } from 'react';
import {
  useReactFlow,
  useNodeConnections,
  useNodesData,
  type NodeProps,
} from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleLinToRotConverterNodeDefinition from './SimpleLinToRotConverterNodeDefinition';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/components/flowchart/styles/common.css';

function SimpleLinToRotConverterNode({
  id,
  data,
  readonly,
}: NodeProps<any> & { readonly?: boolean }) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: simpleLinToRotConverterNodeDefinition,
    updateNodeData,
  });

  const connections = useNodeConnections({ handleType: 'target' });
  const sourceNodeData = useNodesData(connections?.[0]?.source) as
    | { data?: { calculatedOutput?: any } }
    | undefined;

  useEffect(() => {
    if (!data) return;
    const input = sourceNodeData?.data?.calculatedOutput?.linear;
    if (!input) return;
    const { conversionRatio = 1, maxTorque = 1, efficiency = 1 } = data;
    const outputTorque =
      (input.force * efficiency) / (2 * Math.PI * conversionRatio);
    const outputSpeed = input.velocity * conversionRatio * 60;
    const outputPower = (outputTorque * outputSpeed * Math.PI) / 30;
    const isOverloaded = outputTorque > maxTorque;
    const calculatedOutput = {
      rotational: {
        torque: outputTorque,
        speed: outputSpeed,
        power: outputPower,
        inertia: 0.001,
        direction: input.direction,
      },
      efficiency,
      maxLoad: maxTorque,
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
      definition={simpleLinToRotConverterNodeDefinition}
      updateNodeData={updateNodeData}
      readonly={readonly}
    />
  );
}

export default memo(SimpleLinToRotConverterNode);
