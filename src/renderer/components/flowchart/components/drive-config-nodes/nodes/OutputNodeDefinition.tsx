import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';

const outputNodeDefinition: NodeDefinition = {
  type: 'outputNode',
  title: 'Output',
  handles: { target: true, source: false },
  groupTitles: {
    output: 'Output',
  },
  groupDisplayOptions: {
    output: { showTitle: true, showDivider: false },
  },
  // 前段ノードから伝播するフィールド
  propagateFields: { outputSpec: 'prevOutputSpec' },
  /**
   * fields: 入力値なし。前段ノードの出力値（outputSpec）をreadonlyで表示するのみ。
   * 設計ドキュメント「出力ノード」仕様に準拠
   */
  fields: [
    // 回転系出力
    // outputSpecはRotationalOutputまたはLinearOutput型（両対応）
    {
      key: 'ratedTorqueOut',
      label: 'Rated Torque',
      type: 'readonly',
      unit: 'N・m',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedTorque,
    },
    {
      key: 'ratedSpeedOut',
      label: 'Rated Speed',
      type: 'readonly',
      unit: 'rpm',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedSpeed,
    },
    {
      key: 'ratedPowerOut',
      label: 'Rated Power',
      type: 'readonly',
      unit: 'W',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedPower,
    },
    {
      key: 'maxTorqueOut',
      label: 'Max Torque',
      type: 'readonly',
      unit: 'N・m',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxTorque,
    },
    {
      key: 'maxSpeedOut',
      label: 'Max Speed',
      type: 'readonly',
      unit: 'rpm',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxSpeed,
    },
    {
      key: 'maxPowerOut',
      label: 'Max Power',
      type: 'readonly',
      unit: 'W',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxPower,
    },
    {
      key: 'efficiencyOut',
      label: 'Efficiency',
      type: 'readonly',
      group: 'output',
      getValue: (data) => data.outputSpec?.efficiency,
    },
    // 直動系出力
    {
      key: 'ratedForceOut',
      label: 'Rated Force',
      type: 'readonly',
      unit: 'N',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedForce,
    },
    {
      key: 'ratedSpeedLinearOut',
      label: 'Rated Speed',
      type: 'readonly',
      unit: 'mm/s',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedSpeed,
    },
    {
      key: 'ratedPowerLinearOut',
      label: 'Rated Power',
      type: 'readonly',
      unit: 'W',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedPower,
    },
    {
      key: 'maxForceOut',
      label: 'Max Force',
      type: 'readonly',
      unit: 'N',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxForce,
    },
    {
      key: 'maxSpeedLinearOut',
      label: 'Max Speed',
      type: 'readonly',
      unit: 'mm/s',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxSpeed,
    },
    {
      key: 'maxPowerLinearOut',
      label: 'Max Power',
      type: 'readonly',
      unit: 'W',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxPower,
    },
    {
      key: 'strokeOut',
      label: 'Stroke',
      type: 'readonly',
      unit: 'mm',
      group: 'output',
      getValue: (data) => data.outputSpec?.stroke,
    },
    {
      key: 'maxAccelerationOut',
      label: 'Max Acceleration',
      type: 'readonly',
      unit: 'mm/s²',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxAcceleration,
    },
  ],
  compute: (data: any, nodeId: string, update: (newData: any) => void) => {
    // prevOutputSpecが存在する場合、そのままoutputSpecにコピー
    if (
      data.prevOutputSpec &&
      JSON.stringify(data.outputSpec) !== JSON.stringify(data.prevOutputSpec)
    ) {
      update({
        ...data,
        outputSpec: data.prevOutputSpec,
      });
    }
  },
};

export default outputNodeDefinition;
