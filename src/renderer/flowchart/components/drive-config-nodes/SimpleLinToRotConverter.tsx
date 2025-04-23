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
  ROUND_DIGITS,
} from '@/renderer/flowchart/common/flowchartUtils';
import { SimpleLinToRotConverterNodeData } from '@/renderer/flowchart/components/drive-config-nodes/common';
import '@/renderer/flowchart/styles/common.css';

function SimpleLinToRotConverterNode({
  id,
  data,
}: NodeProps<{ data: LinToRotComponentNodeData }>) {
  const { updateNodeData } = useReactFlow();

  // 入力ノードとの接続情報を取得
  const connections = useNodeConnections({ nodeId: id, handleType: 'target' });
  const sourceNode = connections?.[0]?.source; // 接続元のノードID
  const sourceNodeData = useNodesData(sourceNode) as
    | { data?: { calculatedOutput?: any } }
    | undefined;

  // ノードのデータ状態管理
  const [conversionRatio, setConversionRatio] = useState(
    data?.conversionRatio || 0.01,
  ); // rev/mm
  const [maxTorque, setMaxTorque] = useState(data?.maxTorque || 10); // N・m
  const [efficiency, setEfficiency] = useState(data?.efficiency || 0.8); // 効率

  // 計算結果を更新する関数
  const updateCalculation = useCallback(() => {
    // 接続元のデータが存在しない場合、計算できない
    if (!sourceNodeData?.data?.calculatedOutput?.linear) {
      return;
    }

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
      id,
      type: 'rotational',
      inputType: 'linear',
      outputType: 'rotational',
      conversionRatio,
      maxTorque,
      efficiency,
      calculatedOutput,
    });
  }, [
    id,
    sourceNodeData,
    conversionRatio,
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
      <div className="node-title">Simple L→R Converter</div>
      <div className="node-content">
        <div className="node-setting-field">
          <label>
            Conversion Ratio [rev/mm]
            <br />
            <input
              type="number"
              value={conversionRatio}
              step="0.001"
              min="0.001"
              onChange={(e) =>
                setConversionRatio(parseFloat(e.target.value) || 0.01)
              }
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

export default memo(SimpleLinToRotConverterNode);
