import React, { memo, useEffect } from 'react';
import {
  useReactFlow,
  useNodeConnections,
  useNodesData,
  type NodeProps,
} from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import outputNodeDefinition from './OutputNodeDefinition';
import { OutputNodeData } from '@/renderer/components/flowchart/components/drive-config-nodes/common';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/components/flowchart/styles/common.css';

function OutputNode({ id, data }: NodeProps<{ data: OutputNodeData }>) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: outputNodeDefinition,
    updateNodeData,
  });
  const connections = useNodeConnections({ nodeId: id, handleType: 'target' });
  const sourceNode = connections?.[0]?.source;
  const sourceNodeData = useNodesData(sourceNode) as
    | { data?: { calculatedOutput?: any } }
    | undefined;

  // 入力データが変更されたときに計算結果を更新
  useEffect(() => {
    if (!data) return;
    // 入力が存在しない場合はnull
    if (!sourceNodeData?.data?.calculatedOutput) {
      if (
        data.type !== null ||
        Object.keys(data.calculatedOutput || {}).length !== 0
      ) {
        updateNodeData(id, { ...data, type: null, calculatedOutput: {} });
      }
      return;
    }
    const inputData = sourceNodeData.data.calculatedOutput;
    if (inputData.rotational) {
      if (
        data.type !== 'rotational' ||
        JSON.stringify(data.calculatedOutput?.rotational) !==
          JSON.stringify(inputData.rotational)
      ) {
        updateNodeData(id, {
          ...data,
          type: 'rotational',
          calculatedOutput: {
            rotational: { ...inputData.rotational },
            isOverloaded: inputData.isOverloaded,
            sourceEfficiency: inputData.efficiency,
          },
        });
      }
    } else if (inputData.linear) {
      if (
        data.type !== 'linear' ||
        JSON.stringify(data.calculatedOutput?.linear) !==
          JSON.stringify(inputData.linear)
      ) {
        updateNodeData(id, {
          ...data,
          type: 'linear',
          calculatedOutput: {
            linear: { ...inputData.linear },
            isOverloaded: inputData.isOverloaded,
            sourceEfficiency: inputData.efficiency,
          },
        });
      }
    }
  }, [id, data, sourceNodeData, updateNodeData]);

  return (
    <BaseNode
      id={id}
      data={data}
      definition={outputNodeDefinition}
      updateNodeData={updateNodeData}
    />
  );
}

export default memo(OutputNode);
