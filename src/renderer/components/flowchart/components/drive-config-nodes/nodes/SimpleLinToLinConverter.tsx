import React, { memo, useCallback, useEffect } from 'react';
import {
  useReactFlow,
  useNodeConnections,
  useNodesData,
  type NodeProps,
} from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleLinToLinConverterNodeDefinition from './SimpleLinToLinConverterNodeDefinition';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/components/flowchart/styles/common.css';

function SimpleLinToLinConverterNode({
  id,
  data,
  readonly,
}: NodeProps<any> & { readonly?: boolean }) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: simpleLinToLinConverterNodeDefinition,
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
    const { ratio = 1, maxForce = 1, efficiency = 1 } = data;
    const outputForce = (input.force / ratio) * efficiency;
    const outputVelocity = input.velocity * ratio;
    const outputPower = outputForce * outputVelocity;
    const isOverloaded = outputForce > maxForce;
    const calculatedOutput = {
      linear: {
        force: outputForce,
        velocity: outputVelocity,
        power: outputPower,
        acceleration: input.acceleration * ratio,
        mass: input.mass / (ratio * ratio),
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
      definition={simpleLinToLinConverterNodeDefinition}
      updateNodeData={updateNodeData}
      readonly={readonly}
    />
  );
}

export default memo(SimpleLinToLinConverterNode);
