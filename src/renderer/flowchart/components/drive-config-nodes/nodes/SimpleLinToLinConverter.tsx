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
import { SimpleLinToLinConverterNodeData } from '@/renderer/flowchart/components/drive-config-nodes/common';
import '@/renderer/flowchart/styles/common.css';

function SimpleLinToLinConverterNode({
  id,
  data,
}: NodeProps<{ data: SimpleLinToLinConverterNodeData }>) {
  const { updateNodeData } = useReactFlow();

  // 入力ノードとの接続情報を取得
  const connections = useNodeConnections({ nodeId: id, handleType: 'target' });
  const sourceNode = connections?.[0]?.source; // 接続元のノードID
  const sourceNodeData = useNodesData(sourceNode) as
    | { data?: { calculatedOutput?: any } }
    | undefined;

  // ノードのデータ状態管理
  const [ratio, setRatio] = useState(data?.ratio || 2); // 変換比（出力/入力）
  const [maxForce, setMaxForce] = useState(data?.maxForce || 2000); // N
  const [efficiency, setEfficiency] = useState(data?.efficiency || 0.9); // 効率

  // 計算結果を更新する関数
  const updateCalculation = useCallback(() => {
    // 接続元のデータが存在しない場合、計算できない
    if (!sourceNodeData?.data?.calculatedOutput?.linear) {
      return;
    }

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
      id,
      type: 'linear',
      inputType: 'linear',
      outputType: 'linear',
      ratio,
      maxForce,
      efficiency,
      calculatedOutput,
    });
  }, [id, sourceNodeData, ratio, maxForce, efficiency, updateNodeData]);

  // 入力データまたはパラメータが変更されたときに計算結果を更新
  useEffect(() => {
    updateCalculation();
  }, [updateCalculation]);

  return (
    <div className="node">
      <Handle type="target" position={Position.Top} />
      <div className="node-title">Simple L→L Converter</div>
      <div className="node-content">
        <div className="node-setting-field">
          <label htmlFor={`ratio-${id}`}>Conversion Ratio (Out/In)</label>
          <input
            id={`ratio-${id}`}
            type="number"
            value={ratio}
            step="0.1"
            min="0.1"
            onChange={(e) => setRatio(parseFloat(e.target.value) || 1)}
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
          <div className="node-description">
            <small>
              Ratio &gt; 1: 変位増加・力減少
              <br />
              Ratio &lt; 1: 変位減少・力増加
            </small>
          </div>
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
                <div className="warning">Warning: Force exceeds maximum!</div>
              )}
            </>
          )}
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    </div>
  );
}

export default memo(SimpleLinToLinConverterNode);
