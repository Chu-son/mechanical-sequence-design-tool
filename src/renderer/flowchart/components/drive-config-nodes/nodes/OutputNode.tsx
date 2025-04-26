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
} from '@/renderer/flowchart/common/flowchartUtils';
import { OutputNodeData } from '@/renderer/flowchart/components/drive-config-nodes/common';
import '@/renderer/flowchart/styles/common.css';

function OutputNode({ id, data }: NodeProps<{ data: OutputNodeData }>) {
  const { updateNodeData } = useReactFlow();

  // 入力ノードとの接続情報を取得
  const connections = useNodeConnections({ nodeId: id, handleType: 'target' });
  const sourceNode = connections?.[0]?.source; // 接続元のノードID
  const sourceNodeData = useNodesData(sourceNode) as
    | { data?: { calculatedOutput?: any } }
    | undefined;

  // 入力データの型に応じてUIを切り替えるための状態
  const [inputDataType, setInputDataType] = useState<
    'rotational' | 'linear' | null
  >(null);

  // 計算結果を更新する関数
  const updateCalculation = useCallback(() => {
    // 入力が存在しない場合は処理しない
    if (!sourceNodeData?.data?.calculatedOutput) {
      setInputDataType(null);
      return;
    }

    const inputData = sourceNodeData.data.calculatedOutput;

    // 入力データが回転か直動かを判定
    if (inputData.rotational) {
      setInputDataType('rotational');

      // ノードデータを更新（そのまま受け渡し、効率などの値は計算に使わない）
      updateNodeData(id, {
        id,
        type: 'rotational',
        calculatedOutput: {
          rotational: { ...inputData.rotational },
          isOverloaded: inputData.isOverloaded,
          // 効率は表示だけのために保持
          sourceEfficiency: inputData.efficiency,
        },
      });
    } else if (inputData.linear) {
      setInputDataType('linear');

      // ノードデータを更新（そのまま受け渡し、効率などの値は計算に使わない）
      updateNodeData(id, {
        id,
        type: 'linear',
        calculatedOutput: {
          linear: { ...inputData.linear },
          isOverloaded: inputData.isOverloaded,
          // 効率は表示だけのために保持
          sourceEfficiency: inputData.efficiency,
        },
      });
    }
  }, [id, sourceNodeData, updateNodeData]);

  // 入力データが変更されたときに計算結果を更新
  useEffect(() => {
    updateCalculation();
  }, [updateCalculation]);

  // 入力パラメータに関するデータを取得
  const rotationalData = data?.calculatedOutput?.rotational;
  const linearData = data?.calculatedOutput?.linear;
  const sourceEfficiency = data?.calculatedOutput?.sourceEfficiency;
  const isOverloaded = data?.calculatedOutput?.isOverloaded;

  return (
    <div className="node">
      <Handle type="target" position={Position.Top} />
      <div className="node-title">Output</div>
      <div className="node-content">
        <div className="node-readonly-field output-display">
          <div>Node ID: {id}</div>

          {inputDataType === 'rotational' && rotationalData && (
            <>
              <h4>回転出力パラメーター</h4>
              <div>
                トルク: {roundToDigits(rotationalData.torque, ROUND_DIGITS)}{' '}
                N・m
              </div>
              <div>
                回転速度: {roundToDigits(rotationalData.speed, ROUND_DIGITS)}{' '}
                rpm
              </div>
              <div>
                出力: {roundToDigits(rotationalData.power, ROUND_DIGITS)} W
              </div>
              <div>
                慣性モーメント:{' '}
                {roundToDigits(rotationalData.inertia, ROUND_DIGITS)} kg・m²
              </div>
              <div>
                回転方向: {rotationalData.direction > 0 ? '正転' : '逆転'}
              </div>
            </>
          )}

          {inputDataType === 'linear' && linearData && (
            <>
              <h4>直動出力パラメーター</h4>
              <div>推力: {roundToDigits(linearData.force, ROUND_DIGITS)} N</div>
              <div>
                速度: {roundToDigits(linearData.velocity, ROUND_DIGITS)} mm/s
              </div>
              {linearData.acceleration > 0 && (
                <div>
                  加速度: {roundToDigits(linearData.acceleration, ROUND_DIGITS)}{' '}
                  mm/s²
                </div>
              )}
              <div>出力: {roundToDigits(linearData.power, ROUND_DIGITS)} W</div>
              {linearData.mass > 0 && (
                <div>
                  負荷質量: {roundToDigits(linearData.mass, ROUND_DIGITS)} kg
                </div>
              )}
              <div>方向: {linearData.direction > 0 ? '正方向' : '逆方向'}</div>
            </>
          )}

          {sourceEfficiency !== undefined && (
            <div>
              入力システム効率:{' '}
              {roundToDigits(sourceEfficiency * 100, ROUND_DIGITS)}%
            </div>
          )}

          {isOverloaded && (
            <div className="error">⚠️ 警告: システムが過負荷状態です！</div>
          )}

          {!inputDataType && (
            <div className="info">
              入力が接続されていません。上流のアクチュエータや変換要素を接続してください。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(OutputNode);
