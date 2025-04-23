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
  validateNumericInput,
} from '@/renderer/flowchart/common/flowchartUtils';
import { SimpleRotToRotConverterNodeData } from '@/renderer/flowchart/components/drive-config-nodes/common';
import '@/renderer/flowchart/styles/common.css';

function SimpleRotToRotConverterNode({
  id,
  data,
}: NodeProps<{ data: SimpleRotToRotConverterNodeData }>) {
  const { updateNodeData } = useReactFlow();

  // 入力ノードとの接続情報を取得
  const connections = useNodeConnections({ nodeId: id, handleType: 'target' });
  const sourceNode = connections?.[0]?.source; // 接続元のノードID
  const sourceNodeData = useNodesData(sourceNode) as
    | { data?: { calculatedOutput?: any } }
    | undefined;

  // ノードのデータ状態管理
  const [gearRatio, setGearRatio] = useState(data?.gearRatio || 10); // 減速比（例：10:1）
  const [inertia, setInertia] = useState(data?.inertia || 0.0005); // 慣性モーメント
  const [maxTorque, setMaxTorque] = useState(data?.maxTorque || 20); // 最大トルク
  const [efficiency, setEfficiency] = useState(data?.efficiency || 0.9); // 効率

  // 計算結果を更新する関数
  const updateCalculation = useCallback(() => {
    // 接続元のデータが存在しない場合、計算できない
    if (!sourceNodeData?.data?.calculatedOutput?.rotational) {
      return;
    }

    // 入力のデータを取得
    const inputData = sourceNodeData.data.calculatedOutput.rotational;

    // 回転→回転の変換
    // 出力トルク = 入力トルク * 減速比 * 効率
    // 出力速度 = 入力速度 / 減速比
    const outputTorque = inputData.torque * gearRatio * efficiency;
    const outputSpeed = inputData.speed / gearRatio;
    const outputPower = (outputTorque * outputSpeed * Math.PI) / 30; // W = N・m * rad/s

    // 過負荷チェック
    const isOverloaded = outputTorque > maxTorque;

    const calculatedOutput = {
      rotational: {
        torque: outputTorque,
        speed: outputSpeed,
        power: outputPower,
        inertia: inertia + inputData.inertia / (gearRatio * gearRatio), // 慣性モーメントの変換
        direction: inputData.direction, // 方向は維持
      },
      efficiency,
      maxLoad: maxTorque,
      isOverloaded,
    };

    // ノードデータを更新
    updateNodeData(id, {
      id,
      type: 'rotational',
      inputType: 'rotational',
      outputType: 'rotational',
      gearRatio,
      inertia,
      maxTorque,
      efficiency,
      calculatedOutput,
    });
  }, [
    id,
    sourceNodeData,
    gearRatio,
    inertia,
    maxTorque,
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
      <div className="node-title">Simple R→R Converter</div>
      <div className="node-content">
        <div className="node-setting-field">
          <label>
            Gear Ratio
            <br />
            <input
              type="number"
              value={gearRatio}
              step="0.1"
              min="0.1"
              onChange={(e) => setGearRatio(parseFloat(e.target.value) || 1)}
            />
          </label>

          <label>
            Inertia [kg・m²]
            <br />
            <input
              type="number"
              value={inertia}
              step="0.0001"
              min="0"
              onChange={(e) => setInertia(parseFloat(e.target.value) || 0)}
            />
          </label>

          <label>
            Max Torque [N・m]
            <br />
            <input
              type="number"
              value={maxTorque}
              step="0.1"
              min="0"
              onChange={(e) => setMaxTorque(parseFloat(e.target.value) || 0)}
            />
          </label>

          <label>
            Efficiency
            <br />
            <input
              type="number"
              value={efficiency}
              step="0.01"
              min="0"
              max="1"
              onChange={(e) => setEfficiency(parseFloat(e.target.value) || 0)}
            />
          </label>
        </div>
        <hr className="node-divider" />
        <div className="node-readonly-field">
          <div>Node ID: {id}</div>
          {data?.calculatedOutput?.rotational && (
            <>
              <div>
                Output Torque:{' '}
                {roundToDigits(
                  data.calculatedOutput.rotational.torque,
                  ROUND_DIGITS,
                )}{' '}
                N・m
              </div>
              <div>
                Output Speed:{' '}
                {roundToDigits(
                  data.calculatedOutput.rotational.speed,
                  ROUND_DIGITS,
                )}{' '}
                rpm
              </div>
              <div>
                Output Power:{' '}
                {roundToDigits(
                  data.calculatedOutput.rotational.power,
                  ROUND_DIGITS,
                )}{' '}
                W
              </div>
              {data.calculatedOutput.isOverloaded && (
                <div className="warning">Warning: Torque exceeds maximum!</div>
              )}
            </>
          )}
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    </div>
  );
}

export default memo(SimpleRotToRotConverterNode);
