import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import { roundToDigits } from '@/renderer/components/flowchart/common/flowchartUtils';
import { RotationalOutput, getDefaultRotationalOutput } from '../common';

const simpleRotationalActuatorNodeDefinition: NodeDefinition = {
  type: 'rotationalActuator',
  title: 'Simple Rotational Actuator',
  groupTitles: {
    parameters: 'Parameters',
    output: 'Output',
  },
  groupDisplayOptions: {
    parameters: { showTitle: true, showDivider: false },
    output: { showTitle: true, showDivider: true },
  },
  /**
   * 初期データ生成
   * - 入力値（ユーザー指定）と出力値（outputSpec）を明確に分離
   * - outputSpecはRotationalOutput型
   */
  getInitialData: () => ({
    ratedTorque: 0,
    ratedSpeed: 0,
    maxSpeed: 0,
    rotorInertia: 0,
    model: '',
    manufacturer: '',
    maxTorque: 0,
    outputSpec: getDefaultRotationalOutput(),
  }),
  handles: {
    target: false,
    source: true,
  },
  /**
   * fields: 入力値（parameters）と出力値（output）を分離して定義
   * - 入力値: 型式、メーカー、定格トルク、定格速度、最大トルク、最大速度、ローター慣性モーメント
   * - 出力値: outputSpecの各プロパティをreadonlyで表示
   */
  fields: [
    {
      key: 'model',
      label: 'Model',
      type: 'text',
      group: 'parameters',
      getValue: (data) => data.model,
      setValue: (value, data) => ({ ...data, model: value }),
    },
    {
      key: 'manufacturer',
      label: 'Manufacturer',
      type: 'text',
      group: 'parameters',
      getValue: (data) => data.manufacturer,
      setValue: (value, data) => ({ ...data, manufacturer: value }),
    },
    {
      key: 'ratedTorque',
      label: 'Rated Torque',
      unit: 'N・m',
      type: 'number',
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data.ratedTorque,
      setValue: (value, data) => ({
        ...data,
        ratedTorque: parseFloat(value),
      }),
    },
    {
      key: 'ratedSpeed',
      label: 'Rated Speed',
      unit: 'rpm',
      type: 'number',
      step: 1,
      group: 'parameters',
      getValue: (data) => data.ratedSpeed,
      setValue: (value, data) => ({
        ...data,
        ratedSpeed: parseFloat(value),
      }),
    },
    {
      key: 'maxTorque',
      label: 'Max Torque',
      unit: 'N・m',
      type: 'number',
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data.maxTorque,
      setValue: (value, data) => ({ ...data, maxTorque: parseFloat(value) }),
    },
    {
      key: 'maxSpeed',
      label: 'Max Speed',
      unit: 'rpm',
      type: 'number',
      step: 1,
      group: 'parameters',
      getValue: (data) => data.maxSpeed,
      setValue: (value, data) => ({
        ...data,
        maxSpeed: parseFloat(value),
      }),
    },
    {
      key: 'rotorInertia',
      label: 'Rotor Inertia',
      unit: 'kg・m²',
      type: 'number',
      step: 0.0001,
      group: 'parameters',
      getValue: (data) => data.rotorInertia,
      setValue: (value, data) => ({
        ...data,
        rotorInertia: parseFloat(value),
      }),
    },
    // 出力値（readonly）
    {
      key: 'ratedTorqueOut',
      label: 'Rated Torque',
      type: 'readonly',
      unit: 'N・m',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedTorque ?? '',
    },
    {
      key: 'ratedSpeedOut',
      label: 'Rated Speed',
      type: 'readonly',
      unit: 'rpm',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedSpeed ?? '',
    },
    {
      key: 'ratedPowerOut',
      label: 'Rated Power',
      type: 'readonly',
      unit: 'W',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedPower ?? '',
    },
    {
      key: 'maxTorqueOut',
      label: 'Max Torque',
      type: 'readonly',
      unit: 'N・m',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxTorque ?? '',
    },
    {
      key: 'maxSpeedOut',
      label: 'Max Speed',
      type: 'readonly',
      unit: 'rpm',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxSpeed ?? '',
    },
    {
      key: 'maxPowerOut',
      label: 'Max Power',
      type: 'readonly',
      unit: 'W',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxPower ?? '',
    },
    {
      key: 'efficiencyOut',
      label: 'Efficiency',
      type: 'readonly',
      group: 'output',
      getValue: (data) => data.outputSpec?.efficiency ?? '',
    },
  ],
  /**
   * compute: 入力値からoutputSpecを計算
   * - 設計ドキュメント「計算ロジック・データ伝播のポイント」に準拠
   */
  compute: (data, nodeId, update) => {
    // 入力値から出力値を計算
    const ratedTorque = parseFloat(data.ratedTorque);
    const ratedSpeed = parseFloat(data.ratedSpeed);
    const maxTorque = parseFloat(data.maxTorque);
    const maxSpeed = parseFloat(data.maxSpeed);
    const rotorInertia = parseFloat(data.rotorInertia);

    // outputSpecが存在しない場合は初期化
    const currentOutputSpec = data.outputSpec || getDefaultRotationalOutput();
    const efficiency = parseFloat(currentOutputSpec.efficiency);

    // 定格出力[W] = 定格トルク[Nm] × 定格回転速度[rpm] × 2π / 60
    const ratedPower = (ratedTorque * ratedSpeed * 2 * Math.PI) / 60;
    // 最大出力は最大速度で同様に計算
    const maxPower = (ratedTorque * maxSpeed * 2 * Math.PI) / 60;

    const outputSpec: RotationalOutput = {
      ratedTorque,
      ratedSpeed,
      ratedPower: roundToDigits(ratedPower, 2),
      maxTorque,
      maxSpeed,
      maxPower: roundToDigits(maxPower, 2),
      allowableTorque: ratedTorque,
      totalGearRatio: currentOutputSpec.totalGearRatio,
      totalInertia: rotorInertia,
      efficiency,
    };

    if (JSON.stringify(data.outputSpec) !== JSON.stringify(outputSpec)) {
      update({ ...data, outputSpec });
    }
  },
};

export default simpleRotationalActuatorNodeDefinition;
