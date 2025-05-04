import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import { roundToDigits } from '@/renderer/components/flowchart/common/flowchartUtils';
import { LinearOutput, getDefaultLinearOutput } from '../common';

const simpleLinearActuatorNodeDefinition: NodeDefinition = {
  type: 'linearActuator',
  title: 'Simple Linear Actuator',
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
   * - outputSpecはLinearOutput型
   */
  getInitialData: () => ({
    model: '',
    manufacturer: '',
    stroke: 0,
    ratedForce: 0,
    ratedSpeed: 0,
    maxSpeed: 0,
    acceleration: 0,
    maxForce: 0,
    outputSpec: getDefaultLinearOutput(),
  }),
  handles: {
    target: false,
    source: true,
  },
  /**
   * fields: 入力値（parameters）と出力値（output）を分離して定義
   * - 入力値: 型式、メーカー、ストローク長さ、定格推力、定格速度、最大推力、最大速度、最大加減速度
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
      key: 'stroke',
      label: 'Stroke',
      unit: 'mm',
      type: 'number',
      step: 1,
      group: 'parameters',
      getValue: (data) => data.stroke,
      setValue: (value, data) => ({ ...data, stroke: parseFloat(value) }),
    },
    {
      key: 'ratedForce',
      label: 'Rated Force',
      unit: 'N',
      type: 'number',
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data.ratedForce,
      setValue: (value, data) => ({ ...data, ratedForce: parseFloat(value) }),
    },
    {
      key: 'ratedSpeed',
      label: 'Rated Speed',
      unit: 'mm/s',
      type: 'number',
      step: 1,
      group: 'parameters',
      getValue: (data) => data.ratedSpeed,
      setValue: (value, data) => ({ ...data, ratedSpeed: parseFloat(value) }),
    },
    {
      key: 'maxSpeed',
      label: 'Max Speed',
      unit: 'mm/s',
      type: 'number',
      step: 1,
      group: 'parameters',
      getValue: (data) => data.maxSpeed,
      setValue: (value, data) => ({ ...data, maxSpeed: parseFloat(value) }),
    },
    {
      key: 'acceleration',
      label: 'Acceleration',
      unit: 'mm/s²',
      type: 'number',
      step: 1,
      group: 'parameters',
      getValue: (data) => data.acceleration,
      setValue: (value, data) => ({ ...data, acceleration: parseFloat(value) }),
    },
    {
      key: 'maxForce',
      label: 'Max Force',
      unit: 'N',
      type: 'number',
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data.maxForce,
      setValue: (value, data) => ({ ...data, maxForce: parseFloat(value) }),
    },
    // 出力値（readonly）
    {
      key: 'ratedForceOut',
      label: 'Rated Force',
      type: 'readonly',
      unit: 'N',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedForce ?? '',
    },
    {
      key: 'ratedSpeedOut',
      label: 'Rated Speed',
      type: 'readonly',
      unit: 'mm/s',
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
      key: 'maxForceOut',
      label: 'Max Force',
      type: 'readonly',
      unit: 'N',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxForce ?? '',
    },
    {
      key: 'maxSpeedOut',
      label: 'Max Speed',
      type: 'readonly',
      unit: 'mm/s',
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
      key: 'strokeOut',
      label: 'Stroke',
      type: 'readonly',
      unit: 'mm',
      group: 'output',
      getValue: (data) => data.outputSpec?.stroke ?? '',
    },
    {
      key: 'maxAccelerationOut',
      label: 'Max Acceleration',
      type: 'readonly',
      unit: 'mm/s²',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxAcceleration ?? '',
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
    const ratedForce = parseFloat(data.ratedForce) || 0;
    const ratedSpeed = parseFloat(data.ratedSpeed) || 0;
    const maxSpeed = parseFloat(data.maxSpeed) || 0;
    const acceleration = parseFloat(data.acceleration) || 0;
    const stroke = parseFloat(data.stroke) || 0;

    // outputSpecが存在しない場合は初期化
    const currentOutputSpec = data.outputSpec || getDefaultLinearOutput();
    const efficiency = currentOutputSpec.efficiency ?? 0.9;

    // 定格出力[W] = 定格推力[N] × 定格速度[mm/s] / 1000
    const ratedPower = (ratedForce * ratedSpeed) / 1000;
    const maxPower = (ratedForce * maxSpeed) / 1000;
    const outputSpec: LinearOutput = {
      ratedForce,
      ratedSpeed,
      ratedPower: roundToDigits(ratedPower, 2),
      maxForce: ratedForce,
      maxSpeed,
      maxPower: roundToDigits(maxPower, 2),
      stroke,
      maxAcceleration: acceleration,
      efficiency,
    };
    if (JSON.stringify(data.outputSpec) !== JSON.stringify(outputSpec)) {
      update({ ...data, outputSpec });
    }
  },
};

export default simpleLinearActuatorNodeDefinition;
