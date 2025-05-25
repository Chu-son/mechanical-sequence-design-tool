// Baseノード定義 - 回転から直動への変換コンバーターの基本ノード定義
import { NodeDefinition } from '@/renderer/features/flowchart/components/base-nodes/types';
import { roundToDigits } from '@/renderer/features/flowchart/utils/common/flowchartUtils';
import {
  LinearOutput,
  RotationalOutput,
  getDefaultLinearOutput,
  getDefaultRotationalOutput,
} from '@/renderer/types/driveTypes';
import { createLinearOutputFields } from '../fields/OutputSpecFields';
import {
  PhysicalQuantityType,
  getUnitLabel,
} from '@/renderer/types/unitMappings';

const baseRotToLinConverterNodeDefinition: NodeDefinition = {
  type: 'rotToLinConverter',
  title: 'Rotational to Linear Converter Base',
  groupTitles: {
    parameters: 'Parameters',
    output: 'Output',
  },
  groupDisplayOptions: {
    parameters: { showTitle: true, showDivider: false },
    output: { showTitle: true, showDivider: true },
  },
  handles: {
    target: true,
    source: true,
  },
  // 前段ノードから伝播するフィールド
  propagateFields: { outputSpec: 'prevOutputSpec' },
  /**
   * 初期データ生成
   * - 入力値（ユーザー指定）と出力値（outputSpec）を明確に分離
   * - outputSpecはLinearOutput型
   */
  getInitialData: () => ({
    model: '',
    manufacturer: '',
    leadPitch: 0,
    conversionRatio: 1,
    maxForce: 0,
    maxSpeed: 0,
    efficiency: 0.9,
    inputType: 'rotational', // 設計ドキュメント準拠
    outputType: 'linear', // 設計ドキュメント準拠
    displayName: '', // 表示名フィールドを追加
    outputSpec: getDefaultLinearOutput(),
  }),
  /**
   * fields: 入力値（parameters）と出力値（output）を分離して定義
   * - 入力値: 型式、メーカー、効率、リード/ピッチ、変換比、許容推力
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
      key: 'leadPitch',
      label: 'Lead/Pitch',
      unit: getUnitLabel(PhysicalQuantityType.DISTANCE),
      type: 'number',
      step: 0.01,
      group: 'parameters',
      getValue: (data) => data.leadPitch,
      setValue: (value, data) => ({
        ...data,
        leadPitch: parseFloat(value),
      }),
    },
    {
      key: 'conversionRatio',
      label: 'Conversion Ratio',
      type: 'number',
      step: 0.01,
      group: 'parameters',
      getValue: (data) => data.conversionRatio,
      setValue: (value, data) => ({
        ...data,
        conversionRatio: parseFloat(value),
      }),
    },
    {
      key: 'maxForce',
      label: 'Max Force',
      unit: getUnitLabel(PhysicalQuantityType.FORCE),
      type: 'number',
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data.maxForce,
      setValue: (value, data) => ({
        ...data,
        maxForce: parseFloat(value),
      }),
    },
    {
      key: 'maxSpeed',
      label: 'Max Speed',
      unit: getUnitLabel(PhysicalQuantityType.LINEAR_SPEED),
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
      key: 'efficiency',
      label: 'Efficiency',
      type: 'number',
      step: 0.01,
      group: 'parameters',
      getValue: (data) => data.efficiency,
      setValue: (value, data) => ({
        ...data,
        efficiency: parseFloat(value),
      }),
    },
    // 出力値（linearOutputFieldsを使用）
    ...createLinearOutputFields(),
  ],
  /**
   * compute: 前段ノードの出力値と入力値からoutputSpecを計算
   * - 設計ドキュメント「計算ロジック・データ伝播のポイント」に準拠
   */
  compute: (data: any, nodeId: string, update: (newData: any) => void) => {
    // 前段ノードの出力値（回転）を受け取り、直動系に変換
    const conversionRatio = parseFloat(data.conversionRatio) || 1;
    const efficiency = parseFloat(data.efficiency) || 0.9;
    const maxForce = parseFloat(data.maxForce) || 0;
    const maxSpeed = parseFloat(data.maxSpeed) || 0;

    // 前段ノードからのoutputSpecは自ノードのprevOutputSpecに伝播されている
    let prev: any = data.prevOutputSpec;
    if (!prev) {
      console.warn(
        'Node ID:',
        nodeId,
        'has no previous output spec. Using default values.',
      );
      prev = getDefaultRotationalOutput();
    }

    // 例: 回転→直動変換（ボールねじ等）
    // 速度変換: ratedSpeed[rpm] * conversionRatio[mm/rev] = [mm/min] → [mm/s]
    const ratedSpeed = ((prev.ratedSpeed || 0) * conversionRatio) / 60;
    // 推力変換: ratedTorque[Nm] * 2π / conversionRatio[mm/rev] = [N]
    const ratedForce =
      ((prev.ratedTorque || 0) * 2 * Math.PI) / (conversionRatio || 1);
    const ratedPower = (ratedForce * ratedSpeed) / 1000;
    const outputSpec: LinearOutput = {
      type: 'linear',
      ratedForce: roundToDigits(ratedForce, 2),
      ratedSpeed: roundToDigits(ratedSpeed, 2),
      ratedPower: roundToDigits(ratedPower, 2),
      maxForce: maxForce || roundToDigits(ratedForce, 2),
      maxSpeed: maxSpeed || roundToDigits(ratedSpeed, 2),
      maxPower: roundToDigits(
        (ratedForce * (maxSpeed || ratedSpeed)) / 1000,
        2,
      ),
      stroke: 0,
      maxAcceleration: 0,
      efficiency: prev.efficiency ? prev.efficiency * efficiency : efficiency,
    };
    // inputType/outputType/efficiencyを明示的に保持
    const newData = {
      ...data,
      inputType: 'rotational',
      outputType: 'linear',
      efficiency,
      outputSpec,
    };
    if (JSON.stringify(data.outputSpec) !== JSON.stringify(outputSpec)) {
      update(newData);
    }
  },
};

export default baseRotToLinConverterNodeDefinition;
