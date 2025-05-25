// Baseノード定義 - 回転から回転への変換コンバーターの基本ノード定義
import { NodeDefinition } from '@/renderer/features/flowchart/components/base-nodes/types';
import { roundToDigits } from '@/renderer/features/flowchart/utils/common/flowchartUtils';
import {
  RotationalOutput,
  getDefaultRotationalOutput,
} from '@/renderer/types/driveTypes';
import { createRotationalOutputFields } from '../fields/OutputSpecFields';
import {
  PhysicalQuantityType,
  getUnitLabel,
} from '@/renderer/types/unitMappings';

const baseRotToRotConverterNodeDefinition: NodeDefinition = {
  type: 'rotToRotConverter',
  title: 'Rot To Rot Converter Base',
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
   * - outputSpecはRotationalOutput型
   */
  getInitialData: () => ({
    model: '',
    manufacturer: '',
    gearRatio: 1,
    inertia: 0,
    allowableTorque: 0,
    efficiency: 1,
    inputType: 'rotational', // 設計ドキュメント準拠
    outputType: 'rotational', // 設計ドキュメント準拠
    displayName: '', // 表示名フィールドを追加
    outputSpec: getDefaultRotationalOutput(),
  }),
  /**
   * fields: 入力値（parameters）と出力値（output）を分離して定義
   * - 入力値: 型式、メーカー、効率、減速比、慣性モーメント、許容トルク
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
      key: 'gearRatio',
      label: 'Gear Ratio',
      type: 'number',
      step: 0.01,
      group: 'parameters',
      getValue: (data) => data.gearRatio,
      setValue: (value, data) => ({
        ...data,
        gearRatio: parseFloat(value),
      }),
    },
    {
      key: 'inertia',
      label: 'Inertia',
      unit: getUnitLabel(PhysicalQuantityType.INERTIA),
      type: 'number',
      step: 0.0001,
      group: 'parameters',
      getValue: (data) => data.inertia,
      setValue: (value, data) => ({ ...data, inertia: parseFloat(value) }),
    },
    {
      key: 'allowableTorque',
      label: 'Allowable Torque',
      unit: getUnitLabel(PhysicalQuantityType.TORQUE),
      type: 'number',
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data.allowableTorque,
      setValue: (value, data) => ({
        ...data,
        allowableTorque: parseFloat(value),
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
    // 出力値（rotationalOutputFieldsを使用）
    ...createRotationalOutputFields(),
  ],
  /**
   * compute: 前段ノードの出力値と入力値からoutputSpecを計算
   * - 設計ドキュメント「計算ロジック・データ伝播のポイント」に準拠
   */
  compute: (data: any, nodeId: string, update: (newData: any) => void) => {
    // 前段ノードの出力値を受け取り、変換
    const gearRatio = parseFloat(data.gearRatio);
    const efficiency = parseFloat(data.efficiency);
    const inertia = parseFloat(data.inertia);
    const allowableTorque = parseFloat(data.allowableTorque);

    // 前段ノードからのoutputSpecは自ノードのprevOutputSpecに伝播されている
    let prev: RotationalOutput = data.prevOutputSpec as RotationalOutput;

    if (!prev) {
      console.warn(
        'Node ID:',
        nodeId,
        'has no previous output spec. Using default values.',
      );
      prev = getDefaultRotationalOutput();
    }

    // 減速機の変換式
    const ratedTorque = prev.ratedTorque * gearRatio * efficiency;
    const ratedSpeed = prev.ratedSpeed / gearRatio;
    const ratedPower = (ratedTorque * ratedSpeed * 2 * Math.PI) / 60;

    const maxTorque = prev.maxTorque * gearRatio * efficiency;
    const maxSpeed = prev.maxSpeed / gearRatio;
    const maxPower = (ratedTorque * maxSpeed * 2 * Math.PI) / 60;

    const totalGearRatio = prev.totalGearRatio * gearRatio;
    const totalInertia = prev.totalInertia + inertia;

    const outputSpec: RotationalOutput = {
      type: 'rotational',
      ratedTorque: roundToDigits(ratedTorque, 2),
      ratedSpeed: roundToDigits(ratedSpeed, 2),
      ratedPower: roundToDigits(ratedPower, 2),
      maxTorque: maxTorque || roundToDigits(ratedTorque, 2),
      maxSpeed: roundToDigits(maxSpeed, 2),
      maxPower: roundToDigits(maxPower, 2),
      allowableTorque,
      totalGearRatio,
      totalInertia,
      efficiency: prev.efficiency ? prev.efficiency * efficiency : efficiency,
    };

    const newData = {
      ...data,
      outputSpec,
    };
    if (JSON.stringify(data.outputSpec) !== JSON.stringify(outputSpec)) {
      update(newData);
    }
  },
};

export default baseRotToRotConverterNodeDefinition;
