/**
 * 物理量と単位のマッピングを一元管理するファイル
 */

/**
 * 物理量の種類
 */
export enum PhysicalQuantityType {
  // 回転系
  TORQUE = 'torque',
  ROTATIONAL_SPEED = 'rotationalSpeed',
  ROTATIONAL_ACCELERATION = 'rotationalAcceleration',
  INERTIA = 'inertia',
  GEAR_RATIO = 'gearRatio',

  // 直動系
  FORCE = 'force',
  LINEAR_SPEED = 'linearSpeed',
  LINEAR_ACCELERATION = 'linearAcceleration',
  DISTANCE = 'distance',
  STROKE = 'stroke',
  CONVERSION_RATIO = 'conversionRatio',

  // 共通
  POWER = 'power',
  EFFICIENCY = 'efficiency',
  TIME = 'time',
  MASS = 'mass',
}

/**
 * 単位のラベル定義
 */
export const UNIT_LABELS: Record<PhysicalQuantityType, string> = {
  // 回転系
  [PhysicalQuantityType.TORQUE]: 'N・m',
  [PhysicalQuantityType.ROTATIONAL_SPEED]: 'rpm',
  [PhysicalQuantityType.ROTATIONAL_ACCELERATION]: 'rad/s²',
  [PhysicalQuantityType.INERTIA]: 'kg・m²',
  [PhysicalQuantityType.GEAR_RATIO]: '',

  // 直動系
  [PhysicalQuantityType.FORCE]: 'N',
  [PhysicalQuantityType.LINEAR_SPEED]: 'mm/s',
  [PhysicalQuantityType.LINEAR_ACCELERATION]: 'mm/s²',
  [PhysicalQuantityType.DISTANCE]: 'mm',
  [PhysicalQuantityType.STROKE]: 'mm',
  [PhysicalQuantityType.CONVERSION_RATIO]: '',

  // 共通
  [PhysicalQuantityType.POWER]: 'W',
  [PhysicalQuantityType.EFFICIENCY]: '%',
  [PhysicalQuantityType.TIME]: 's',
  [PhysicalQuantityType.MASS]: 'kg',
};

/**
 * 指定された物理量の単位を取得する
 * @param quantityType 物理量の種類
 * @returns 対応する単位
 */
export function getUnitLabel(quantityType: PhysicalQuantityType): string {
  return UNIT_LABELS[quantityType];
}

/**
 * 効率をパーセンテージ表示に変換する (0-1 → 0-100%)
 * @param value 0-1の間の効率値
 * @returns パーセンテージ表示の効率値
 */
export function formatEfficiencyAsPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * 値を指定された小数点以下桁数で丸める
 * @param value 丸める値
 * @param digits 小数点以下の桁数（デフォルト: 2）
 * @returns 丸められた値
 */
export function roundToDigits(value: number, digits: number = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
