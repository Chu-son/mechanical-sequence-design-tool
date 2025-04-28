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
import '@/renderer/components/flowchart/styles/common.css';

function OutputNode({ id, data }: NodeProps<{ data: OutputNodeData }>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ nodeId: id, handleType: 'target' });
  const sourceNode = connections?.[0]?.source;
  const sourceNodeData = useNodesData(sourceNode) as
    | { data?: { calculatedOutput?: any } }
    | undefined;

  // 入力データが変更されたときに計算結果を更新
  useEffect(() => {
    // 入力が存在しない場合はnull
    if (!sourceNodeData?.data?.calculatedOutput) {
      updateNodeData(id, { ...data, type: null, calculatedOutput: {} });
      return;
    }
    const inputData = sourceNodeData.data.calculatedOutput;
    if (inputData.rotational) {
      updateNodeData(id, {
        ...data,
        type: 'rotational',
        calculatedOutput: {
          rotational: { ...inputData.rotational },
          isOverloaded: inputData.isOverloaded,
          sourceEfficiency: inputData.efficiency,
        },
      });
    } else if (inputData.linear) {
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
