import React, { memo, useCallback, useEffect } from 'react';
import {
  useReactFlow,
  useNodeConnections,
  useNodesData,
  type NodeProps,
} from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleLinToRotConverterNodeDefinition from './SimpleLinToRotConverterNodeDefinition';
import '@/renderer/components/flowchart/styles/common.css';

function SimpleLinToRotConverterNode({
  id,
  data,
  readonly,
}: NodeProps<any> & { readonly?: boolean }) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ nodeId: id, handleType: 'target' });
  const sourceNode = connections?.[0]?.source;
  const sourceNodeData = useNodesData(sourceNode) as
    | { data?: { calculatedOutput?: any } }
    | undefined;

  // 計算ロジック - 外部データ依存のため、コンポーネントに残す
  const updateCalculation = useCallback(() => {
    // 初期データのロード
    if (!data) {
      const initialData =
        simpleLinToRotConverterNodeDefinition.getInitialData?.() || {};
      updateNodeData(id, initialData);
      return;
    }

    // 接続元のデータが存在しない場合、計算できない
    if (!sourceNodeData?.data?.calculatedOutput?.linear) {
      return;
    }

    const { conversionRatio, maxTorque, efficiency } = data;

    // 入力のデータを取得
    const inputData = sourceNodeData.data.calculatedOutput.linear;

    // 直動→回転の変換
    // 出力トルク = 入力力 * (変換比の逆数) * 効率
    // 出力速度 = 入力速度 * 変換比
    const outputTorque =
      (inputData.force * efficiency) / (2 * Math.PI * conversionRatio); // N・m
    const outputSpeed = inputData.velocity * conversionRatio * 60; // rpm (mm/s * rev/mm * 60s/min)
    const outputPower = (outputTorque * outputSpeed * Math.PI) / 30; // W = N・m * rad/s

    // 過負荷チェック
    const isOverloaded = outputTorque > maxTorque;

    const calculatedOutput = {
      rotational: {
        torque: outputTorque,
        speed: outputSpeed,
        power: outputPower,
        inertia: 0.001, // 仮の値
        direction: inputData.direction as 1 | -1, // 方向を維持
      },
      efficiency,
      maxLoad: maxTorque,
      isOverloaded,
    };

    // ノードデータを更新
    updateNodeData(id, {
      ...data,
      id,
      calculatedOutput,
    });
  }, [id, data, sourceNodeData, updateNodeData]);

  // 入力データまたはパラメータが変更されたときに計算結果を更新
  useEffect(() => {
    updateCalculation();
  }, [updateCalculation]);

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
