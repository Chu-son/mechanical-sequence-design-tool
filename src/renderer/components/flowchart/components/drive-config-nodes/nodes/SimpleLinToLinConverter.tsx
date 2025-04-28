import React, { memo, useCallback, useEffect } from 'react';
import {
  useReactFlow,
  useNodeConnections,
  useNodesData,
  type NodeProps,
} from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleLinToLinConverterNodeDefinition from './SimpleLinToLinConverterNodeDefinition';
import '@/renderer/components/flowchart/styles/common.css';

function SimpleLinToLinConverterNode({
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
        simpleLinToLinConverterNodeDefinition.getInitialData?.() || {};
      updateNodeData(id, initialData);
      return;
    }

    // 接続元のデータが存在しない場合、計算できない
    if (!sourceNodeData?.data?.calculatedOutput?.linear) {
      return;
    }

    const { ratio, maxForce, efficiency } = data;

    // 入力のデータを取得
    const inputData = sourceNodeData.data.calculatedOutput.linear;

    // 直動→直動の変換（例：レバー機構、油圧システムなど）
    // 出力力 = 入力力 / 変換比 * 効率
    // 出力速度 = 入力速度 * 変換比
    const outputForce = (inputData.force / ratio) * efficiency;
    const outputVelocity = inputData.velocity * ratio;
    const outputPower = outputForce * outputVelocity; // W = N * m/s

    // 過負荷チェック
    const isOverloaded = outputForce > maxForce;

    const calculatedOutput = {
      linear: {
        force: outputForce,
        velocity: outputVelocity,
        power: outputPower,
        acceleration: inputData.acceleration * ratio, // 加速度も比率に応じて変換
        mass: inputData.mass / (ratio * ratio), // 質量も比率の二乗に応じて変換（慣性の法則）
        direction: inputData.direction, // 方向は入力の方向に依存
      },
      efficiency,
      maxLoad: maxForce,
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
      definition={simpleLinToLinConverterNodeDefinition}
      updateNodeData={updateNodeData}
      readonly={readonly}
    />
  );
}

export default memo(SimpleLinToLinConverterNode);
