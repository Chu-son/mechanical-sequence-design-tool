// Baseノード定義 - 直動型アクチュエータの基本ノード定義
import { NodeDefinition } from '@/renderer/features/flowchart/components/base-nodes/types';
import { roundToDigits } from '@/renderer/features/flowchart/utils/common/flowchartUtils';
import {
  LinearOutput,
  getDefaultLinearOutput,
} from '@/renderer/types/driveTypes';
import { createLinearOutputFields } from '../fields/OutputSpecFields';
import {
  PhysicalQuantityType,
  getUnitLabel,
} from '@/renderer/types/unitMappings';

const baseLinearActuatorNodeDefinition: NodeDefinition = {
  type: 'linearActuator',
  title: 'Linear Actuator Base',
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
    displayName: '', // 表示名フィールドを追加
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
      unit: getUnitLabel(PhysicalQuantityType.STROKE),
      type: 'number',
      step: 1,
      group: 'parameters',
      getValue: (data) => data.stroke,
      setValue: (value, data) => ({ ...data, stroke: parseFloat(value) }),
    },
    {
      key: 'ratedForce',
      label: 'Rated Force',
      unit: getUnitLabel(PhysicalQuantityType.FORCE),
      type: 'number',
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data.ratedForce,
      setValue: (value, data) => ({ ...data, ratedForce: parseFloat(value) }),
    },
    {
      key: 'ratedSpeed',
      label: 'Rated Speed',
      unit: getUnitLabel(PhysicalQuantityType.LINEAR_SPEED),
      type: 'number',
      step: 1,
      group: 'parameters',
      getValue: (data) => data.ratedSpeed,
      setValue: (value, data) => ({ ...data, ratedSpeed: parseFloat(value) }),
    },
    {
      key: 'maxSpeed',
      label: 'Max Speed',
      unit: getUnitLabel(PhysicalQuantityType.LINEAR_SPEED),
      type: 'number',
      step: 1,
      group: 'parameters',
      getValue: (data) => data.maxSpeed,
      setValue: (value, data) => ({ ...data, maxSpeed: parseFloat(value) }),
    },
    {
      key: 'acceleration',
      label: 'Acceleration',
      unit: getUnitLabel(PhysicalQuantityType.LINEAR_ACCELERATION),
      type: 'number',
      step: 1,
      group: 'parameters',
      getValue: (data) => data.acceleration,
      setValue: (value, data) => ({ ...data, acceleration: parseFloat(value) }),
    },
    {
      key: 'maxForce',
      label: 'Max Force',
      unit: getUnitLabel(PhysicalQuantityType.FORCE),
      type: 'number',
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data.maxForce,
      setValue: (value, data) => ({ ...data, maxForce: parseFloat(value) }),
    },
    // 出力値（linearOutputFieldsを使用）
    ...createLinearOutputFields(),
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
      type: 'linear',
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

export default baseLinearActuatorNodeDefinition;
