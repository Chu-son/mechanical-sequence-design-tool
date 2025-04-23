import React, { memo, useCallback, useState } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import {
  roundToDigits,
  validateNumericInput,
} from '@/renderer/flowchart/common/flowchartUtils';
import { SimpleRotationalActuatorNodeData } from '@/renderer/flowchart/components/drive-config-nodes/common';
import '@/renderer/flowchart/styles/common.css';

function SimpleRotationalActuatorNode({
  id,
  data,
}: NodeProps<{ data: RotationalActuatorNodeData }>) {
  const { updateNodeData } = useReactFlow();

  // ノードのデータ状態管理
  const [ratedTorque, setRatedTorque] = useState(data?.ratedTorque || 1.0);
  const [ratedSpeed, setRatedSpeed] = useState(data?.ratedSpeed || 3000);
  const [maxSpeed, setMaxSpeed] = useState(data?.maxSpeed || 5000);
  const [rotorInertia, setRotorInertia] = useState(
    data?.rotorInertia || 0.0001,
  );
  const [direction, setDirection] = useState<1 | -1>(1);
  const [efficiency, setEfficiency] = useState(0.95);

  // 計算結果を更新する関数
  const updateCalculation = useCallback(() => {
    // 回転アクチュエータの出力計算
    const torque = ratedTorque * efficiency;
    const speed = ratedSpeed;
    // トルクとスピードから出力パワーを計算 (W = T * ω)
    // rpmからrad/sへの変換: ω = rpm * 2π / 60
    const power = (torque * speed * Math.PI) / 30; // W = N・m * rad/s

    const calculatedOutput = {
      rotational: {
        torque,
        speed,
        power,
        inertia: rotorInertia,
        direction,
      },
      efficiency,
      maxLoad: ratedTorque,
      isOverloaded: false,
    };

    // ノードデータを更新
    updateNodeData(id, {
      id,
      type: 'rotational',
      ratedTorque,
      ratedSpeed,
      maxSpeed,
      rotorInertia,
      calculatedOutput,
    });
  }, [
    id,
    ratedTorque,
    ratedSpeed,
    maxSpeed,
    rotorInertia,
    direction,
    efficiency,
    updateNodeData,
  ]);

  // 入力値が変更されたときに計算結果を更新
  React.useEffect(() => {
    updateCalculation();
  }, [updateCalculation]);

  return (
    <div className="node">
      <div className="node-title">Simple Rotational Actuator</div>
      <div className="node-content">
        <div className="node-setting-field">
          <label>
            Rated Torque [N・m]
            <br />
            <input
              type="number"
              value={ratedTorque}
              step="0.1"
              onChange={(e) => setRatedTorque(parseFloat(e.target.value) || 0)}
            />
          </label>

          <label>
            Rated Speed [rpm]
            <br />
            <input
              type="number"
              value={ratedSpeed}
              step="10"
              onChange={(e) => setRatedSpeed(parseFloat(e.target.value) || 0)}
            />
          </label>

          <label>
            Max Speed [rpm]
            <br />
            <input
              type="number"
              value={maxSpeed}
              step="10"
              onChange={(e) => setMaxSpeed(parseFloat(e.target.value) || 0)}
            />
          </label>

          <label>
            Rotor Inertia [kg・m²]
            <br />
            <input
              type="number"
              value={rotorInertia}
              step="0.0001"
              onChange={(e) => setRotorInertia(parseFloat(e.target.value) || 0)}
            />
          </label>

          <label>
            Direction
            <br />
            <select
              value={direction}
              onChange={(e) => setDirection(parseInt(e.target.value) as 1 | -1)}
            >
              <option value={1}>Forward</option>
              <option value={-1}>Reverse</option>
            </select>
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
          <div>
            Output Power:{' '}
            {roundToDigits(
              data?.calculatedOutput?.rotational?.power || 0,
              ROUND_DIGITS,
            )}{' '}
            W
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    </div>
  );
}

export default memo(SimpleRotationalActuatorNode);
