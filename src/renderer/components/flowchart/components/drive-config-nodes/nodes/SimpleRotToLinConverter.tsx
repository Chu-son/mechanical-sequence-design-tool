import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  Handle,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
  type NodeProps,
} from '@xyflow/react';
import {
  roundToDigits,
  ROUND_DIGITS,
} from '@/renderer/components/flowchart/common/flowchartUtils';
import { RotToLinComponentNodeData } from '@/renderer/components/flowchart/components/drive-config-nodes/common';
import '@/renderer/components/flowchart/styles/common.css';

function SimpleRotToLinConverterNode({
  id,
  data,
}: NodeProps<RotToLinComponentNodeData>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ nodeId: id, handleType: 'target' });
  const sourceNode = connections?.[0]?.source;
  const sourceNodeData = useNodesData(sourceNode) as
    | { data?: { calculatedOutput?: any } }
    | undefined;

  // ノードのデータ状態管理
  const [conversionRatio, setConversionRatio] = useState(
    data?.conversionRatio || 5,
  ); // mm/rev
  const [maxForce, setMaxForce] = useState(data?.maxForce || 1000); // N
  const [maxSpeed, setMaxSpeed] = useState(data?.maxSpeed || 100); // mm/s
  const [efficiency, setEfficiency] = useState(data?.efficiency || 0.85); // 効率

  // 計算結果を更新する関数
  const updateCalculation = useCallback(() => {
    // 接続元のデータが存在しない場合、計算できない
    if (!sourceNodeData?.data?.calculatedOutput?.rotational) {
      return;
    }

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
      id,
      type: 'linear',
      inputType: 'rotational',
      outputType: 'linear',
      conversionRatio,
      maxForce,
      maxSpeed,
      efficiency,
      calculatedOutput,
    });
  }, [
    id,
    sourceNodeData,
    conversionRatio,
    maxForce,
    maxSpeed,
    efficiency,
    updateNodeData,
  ]);

  // 入力データまたはパラメータが変更されたときに計算結果を更新
  useEffect(() => {
    updateCalculation();
  }, [updateCalculation]);

  return (
    <div className="node">
      <Handle type="target" position={Position.Top} />
      <div className="node-title">Simple R→L Converter</div>
      <div className="node-content">
        <div className="node-setting-field">
          <label htmlFor={`conversionRatio-${id}`}>Lead/Pitch [mm/rev]</label>
          <input
            id={`conversionRatio-${id}`}
            type="number"
            value={conversionRatio}
            step="0.1"
            min="0.1"
            onChange={(e) =>
              setConversionRatio(parseFloat(e.target.value) || 5)
            }
          />
          <label htmlFor={`maxForce-${id}`}>Max Force [N]</label>
          <input
            id={`maxForce-${id}`}
            type="number"
            value={maxForce}
            step="10"
            min="0"
            onChange={(e) => setMaxForce(parseFloat(e.target.value) || 0)}
          />
          <label htmlFor={`maxSpeed-${id}`}>Max Speed [mm/s]</label>
          <input
            id={`maxSpeed-${id}`}
            type="number"
            value={maxSpeed}
            step="1"
            min="0"
            onChange={(e) => setMaxSpeed(parseFloat(e.target.value) || 0)}
          />
          <label htmlFor={`efficiency-${id}`}>Efficiency</label>
          <input
            id={`efficiency-${id}`}
            type="number"
            value={efficiency}
            step="0.01"
            min="0"
            max="1"
            onChange={(e) => setEfficiency(parseFloat(e.target.value) || 0)}
          />
        </div>
        <hr className="node-divider" />
        <div className="node-readonly-field">
          <div>Node ID: {id}</div>
          {data?.calculatedOutput?.linear && (
            <>
              <div>
                Output Force:{' '}
                {roundToDigits(
                  data.calculatedOutput.linear.force,
                  ROUND_DIGITS,
                )}{' '}
                N
              </div>
              <div>
                Output Speed:{' '}
                {roundToDigits(
                  data.calculatedOutput.linear.velocity,
                  ROUND_DIGITS,
                )}{' '}
                mm/s
              </div>
              <div>
                Output Power:{' '}
                {roundToDigits(
                  data.calculatedOutput.linear.power,
                  ROUND_DIGITS,
                )}{' '}
                W
              </div>
              {data.calculatedOutput.isOverloaded && (
                <div className="warning">
                  Warning: Force or speed exceeds maximum!
                </div>
              )}
            </>
          )}
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    </div>
  );
}

export default memo(SimpleRotToLinConverterNode);
