import React, { memo, useCallback, useEffect } from 'react';
import {
  useReactFlow,
  useNodeConnections,
  useNodesData,
  type NodeProps,
} from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleRotToLinConverterNodeDefinition from './SimpleRotToLinConverterNodeDefinition';
import '@/renderer/components/flowchart/styles/common.css';

function SimpleRotToLinConverterNode({
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
        simpleRotToLinConverterNodeDefinition.getInitialData?.() || {};
      updateNodeData(id, initialData);
      return;
    }

    // 接続元のデータが存在しない場合、計算できない
    if (!sourceNodeData?.data?.calculatedOutput?.rotational) {
      return;
    }

    const { conversionRatio, maxForce, maxSpeed, efficiency } = data;

    // 入力のデータを取得
    const inputData = sourceNodeData.data.calculatedOutput.rotational;

    // 回転→直動の変換
    // 入力トルクと回転数から直動の力と速度を計算
    // 出力力 = 入力トルク * 2π * 効率 / リード
    // 出力速度 = 入力回転数 * リード / 60
    const outputForce =
      (inputData.torque * 2 * Math.PI * efficiency) / conversionRatio;
    const outputVelocity = (inputData.speed * conversionRatio) / 60; // rpm → mm/s
    const outputPower = outputForce * outputVelocity; // W = N * m/s

    // 過負荷チェック
    const isOverloadedForce = outputForce > maxForce;
    const isOverloadedSpeed = outputVelocity > maxSpeed;
    const isOverloaded = isOverloadedForce || isOverloadedSpeed;

    const calculatedOutput = {
      linear: {
        force: outputForce,
        velocity: outputVelocity,
        power: outputPower,
        acceleration: 0, // 現時点では計算しない
        mass: 0, // 負荷質量は設定しない
        direction: inputData.direction, // 方向は入力の回転方向に依存
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
      definition={simpleRotToLinConverterNodeDefinition}
      updateNodeData={updateNodeData}
      readonly={readonly}
    />
  );
}

export default memo(SimpleRotToLinConverterNode);
