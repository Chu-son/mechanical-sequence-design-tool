/**
 * outputSpecフィールドの共通定義
 * 各ノード定義で重複している出力フィールドをここで一元管理
 */
import { NodeFieldDefinition } from '../../base-nodes/types';

/**
 * 回転系出力(RotationalOutput)用の共通フィールド定義を生成するファクトリ関数
 * 異なるグループ名で再利用できるよう、グループ名を引数で受け取る
 * @param group 表示するグループ名（デフォルトは'output'）
 * @returns 回転系出力用のフィールド定義配列
 */
export function createRotationalOutputFields(
  group: string = 'output',
): NodeFieldDefinition[] {
  return [
    {
      key: 'ratedTorqueOut',
      label: 'Rated Torque',
      type: 'readonly',
      unit: 'N・m',
      group,
      getValue: (data) => data.outputSpec?.ratedTorque,
      hidden: (data) => data.outputSpec?.type !== 'rotational',
    },
    {
      key: 'ratedSpeedOut',
      label: 'Rated Speed',
      type: 'readonly',
      unit: 'rpm',
      group,
      getValue: (data) => data.outputSpec?.ratedSpeed,
      hidden: (data) => data.outputSpec?.type !== 'rotational',
    },
    {
      key: 'ratedPowerOut',
      label: 'Rated Power',
      type: 'readonly',
      unit: 'W',
      group,
      getValue: (data) => data.outputSpec?.ratedPower,
      hidden: (data) => data.outputSpec?.type !== 'rotational',
    },
    {
      key: 'maxTorqueOut',
      label: 'Max Torque',
      type: 'readonly',
      unit: 'N・m',
      group,
      getValue: (data) => data.outputSpec?.maxTorque,
      hidden: (data) => data.outputSpec?.type !== 'rotational',
    },
    {
      key: 'maxSpeedOut',
      label: 'Max Speed',
      type: 'readonly',
      unit: 'rpm',
      group,
      getValue: (data) => data.outputSpec?.maxSpeed,
      hidden: (data) => data.outputSpec?.type !== 'rotational',
    },
    {
      key: 'maxPowerOut',
      label: 'Max Power',
      type: 'readonly',
      unit: 'W',
      group,
      getValue: (data) => data.outputSpec?.maxPower,
      hidden: (data) => data.outputSpec?.type !== 'rotational',
    },
    {
      key: 'totalGearRatioOut',
      label: 'Total Gear Ratio',
      type: 'readonly',
      group,
      getValue: (data) => data.outputSpec?.totalGearRatio,
      hidden: (data) => data.outputSpec?.type !== 'rotational',
    },
    {
      key: 'totalInertiaOut',
      label: 'Total Inertia',
      type: 'readonly',
      unit: 'kg・m²',
      group,
      getValue: (data) => data.outputSpec?.totalInertia,
      hidden: (data) => data.outputSpec?.type !== 'rotational',
    },
    {
      key: 'efficiencyRotOut',
      label: 'Efficiency',
      type: 'readonly',
      group,
      getValue: (data) => data.outputSpec?.efficiency,
      hidden: (data) => data.outputSpec?.type !== 'rotational',
    },
  ];
}

/**
 * 直動系出力(LinearOutput)用の共通フィールド定義を生成するファクトリ関数
 * 異なるグループ名で再利用できるよう、グループ名を引数で受け取る
 * @param group 表示するグループ名（デフォルトは'output'）
 * @returns 直動系出力用のフィールド定義配列
 */
export function createLinearOutputFields(
  group: string = 'output',
): NodeFieldDefinition[] {
  return [
    {
      key: 'ratedForceOut',
      label: 'Rated Force',
      type: 'readonly',
      unit: 'N',
      group,
      getValue: (data) => data.outputSpec?.ratedForce,
      hidden: (data) => data.outputSpec?.type !== 'linear',
    },
    {
      key: 'ratedSpeedLinearOut',
      label: 'Rated Speed',
      type: 'readonly',
      unit: 'mm/s',
      group,
      getValue: (data) => data.outputSpec?.ratedSpeed,
      hidden: (data) => data.outputSpec?.type !== 'linear',
    },
    {
      key: 'ratedPowerLinearOut',
      label: 'Rated Power',
      type: 'readonly',
      unit: 'W',
      group,
      getValue: (data) => data.outputSpec?.ratedPower,
      hidden: (data) => data.outputSpec?.type !== 'linear',
    },
    {
      key: 'maxForceOut',
      label: 'Max Force',
      type: 'readonly',
      unit: 'N',
      group,
      getValue: (data) => data.outputSpec?.maxForce,
      hidden: (data) => data.outputSpec?.type !== 'linear',
    },
    {
      key: 'maxSpeedLinearOut',
      label: 'Max Speed',
      type: 'readonly',
      unit: 'mm/s',
      group,
      getValue: (data) => data.outputSpec?.maxSpeed,
      hidden: (data) => data.outputSpec?.type !== 'linear',
    },
    {
      key: 'maxPowerLinearOut',
      label: 'Max Power',
      type: 'readonly',
      unit: 'W',
      group,
      getValue: (data) => data.outputSpec?.maxPower,
      hidden: (data) => data.outputSpec?.type !== 'linear',
    },
    {
      key: 'strokeOut',
      label: 'Stroke',
      type: 'readonly',
      unit: 'mm',
      group,
      getValue: (data) => data.outputSpec?.stroke,
      hidden: (data) => data.outputSpec?.type !== 'linear',
    },
    {
      key: 'maxAccelerationOut',
      label: 'Max Acceleration',
      type: 'readonly',
      unit: 'mm/s²',
      group,
      getValue: (data) => data.outputSpec?.maxAcceleration,
      hidden: (data) => data.outputSpec?.type !== 'linear',
    },
    {
      key: 'efficiencyLinOut',
      label: 'Efficiency',
      type: 'readonly',
      group,
      getValue: (data) => data.outputSpec?.efficiency,
      hidden: (data) => data.outputSpec?.type !== 'linear',
    },
  ];
}

/**
 * 両方の出力フィールドを組み合わせた配列を生成するファクトリ関数
 * OutputNodeなど両方のフィールドが必要なノードで使用
 * @param group 表示するグループ名（デフォルトは'output'）
 * @returns 回転系・直動系の両方を含むフィールド定義配列
 */
export function createAllOutputFields(
  group: string = 'output',
): NodeFieldDefinition[] {
  return [
    ...createRotationalOutputFields(group),
    ...createLinearOutputFields(group),
  ];
}
