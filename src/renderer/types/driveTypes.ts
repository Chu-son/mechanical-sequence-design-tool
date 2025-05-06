/**
 * 駆動部品・駆動ノード関連の型定義を一元管理するファイル
 */

// 出力仕様の基本型（共通プロパティ）
export interface OutputSpec {
  ratedPower: number; // 定格出力 [W]
  maxPower: number; // 最大出力 [W]
  efficiency: number; // 効率 [0-1]
}

/**
 * 回転系出力仕様
 */
export interface RotationalOutput extends OutputSpec {
  type: 'rotational'; // 明示的に種別を指定
  ratedTorque: number; // 定格トルク [N・m]
  ratedSpeed: number; // 定格回転速度 [rpm]
  maxTorque: number; // 最大トルク [N・m]
  maxSpeed: number; // 最大回転速度 [rpm]
  allowableTorque?: number; // 許容トルク [N・m]
  totalGearRatio?: number; // 全体の減速比
  totalInertia?: number; // 全体の慣性モーメント [kg・m²]
}

/**
 * 直動系出力仕様
 */
export interface LinearOutput extends OutputSpec {
  type: 'linear'; // 明示的に種別を指定
  ratedForce: number; // 定格推力 [N]
  ratedSpeed: number; // 定格速度 [mm/s]
  maxForce: number; // 最大推力 [N]
  maxSpeed: number; // 最大速度 [mm/s]
  stroke?: number; // ストローク [mm]
  maxAcceleration?: number; // 最大加速度 [mm/s²]
}

// 出力仕様の共用型
export type DriveOutput = RotationalOutput | LinearOutput;

/**
 * 駆動ノード共通データ型
 */
export interface DriveNodeData {
  /**
   * 出力スペック（回転系または直動系）
   */
  outputSpec?: DriveOutput;
  prevOutputSpec?: DriveOutput; // 前段ノードから受け取った出力仕様
}

/**
 * アクチュエータノード基本型
 */
export interface ActuatorNodeData extends DriveNodeData {
  model: string; // モデル名/型番
  manufacturer: string; // メーカー
}

/**
 * 回転アクチュエータノード型
 */
export interface RotationalActuatorNodeData extends ActuatorNodeData {
  ratedTorque: number; // 定格トルク [N・m]
  ratedSpeed: number; // 定格速度 [rpm]
  maxTorque: number; // 最大トルク [N・m]
  maxSpeed: number; // 最大速度 [rpm]
  rotorInertia: number; // ローター慣性モーメント [kg・m²]
}

/**
 * 直動アクチュエータノード型
 */
export interface LinearActuatorNodeData extends ActuatorNodeData {
  stroke: number; // ストローク長さ [mm]
  ratedForce: number; // 定格推力 [N]
  ratedSpeed: number; // 定格速度 [mm/s]
  maxForce: number; // 最大推力 [N]
  maxSpeed: number; // 最大速度 [mm/s]
  maxAcceleration: number; // 加速度 [mm/s²]
}

/**
 * 駆動コンポーネントノード基本型
 */
export interface DriveComponentNodeData extends DriveNodeData {
  model: string; // モデル名/型番
  manufacturer: string; // メーカー
  efficiency: number; // 効率 [0-1]
}

/**
 * 回転→回転変換用ノード型
 */
export interface RotToRotConverterNodeData extends DriveComponentNodeData {
  gearRatio: number; // 減速比/増速比
  inertia: number; // 慣性モーメント [kg・m²]
  allowableTorque: number; // 許容トルク [N・m]
}

/**
 * 回転→直動変換用ノード型
 */
export interface RotToLinConverterNodeData extends DriveComponentNodeData {
  leadPitch?: number; // リード/ピッチ [mm]
  conversionRatio: number; // 変換比 (mm/rev)
  maxForce: number; // 最大推力 [N]
  maxSpeed: number; // 最大速度 [mm/s]
}

/**
 * 直動→回転変換用ノード型
 */
export interface LinToRotConverterNodeData extends DriveComponentNodeData {
  conversionRatio: number; // 変換比 (rev/mm)
  allowableTorque: number; // 許容トルク [N・m]
}

/**
 * 直動→直動変換用ノード型
 */
export interface LinToLinConverterNodeData extends DriveComponentNodeData {
  conversionRatio: number; // 変換比 (出力変位/入力変位)
  allowableForce: number; // 許容推力 [N]
}

/**
 * 出力ノード用データ型
 */
export interface OutputNodeData extends DriveNodeData {
  requiredTorque?: number; // 必要トルク [N・m] (回転出力の場合)
  requiredForce?: number; // 必要推力 [N] (直動出力の場合)
  requiredSpeed?: number; // 必要速度 [rpm or mm/s]
  load?: number; // 負荷 [kg]
  inertia?: number; // 慣性モーメント [kg・m²] (回転出力の場合)
}

// 駆動部品関連の型定義
/**
 * 部品種別
 */
export type DrivePartType =
  | 'rotationalActuator' // 回転アクチュエータ
  | 'linearActuator' // 直動アクチュエータ
  | 'rotToRotConverter' // 回転→回転変換
  | 'rotToLinConverter' // 回転→直動変換
  | 'linToRotConverter' // 直動→回転変換
  | 'linToLinConverter'; // 直動→直動変換

/**
 * 回転アクチュエータ用スペック
 */
export interface RotationalActuatorSpec {
  ratedTorque: number; // 定格トルク
  ratedSpeed: number; // 定格回転速度
  maxTorque: number; // 最大トルク
  maxSpeed: number; // 最大回転速度
  rotorInertia: number; // ローター慣性モーメント
  ratedPower?: number; // 定格出力
  maxPower?: number; // 最大出力
}

/**
 * 直動アクチュエータ用スペック
 */
export interface LinearActuatorSpec {
  stroke: number; // ストローク長さ
  ratedForce: number; // 定格推力
  ratedSpeed: number; // 定格速度
  maxForce: number; // 最大推力
  maxSpeed: number; // 最大速度
  maxAcceleration: number; // 最大加減速度
  ratedPower?: number; // 定格出力
  maxPower?: number; // 最大出力
}

/**
 * 回転→回転変換用スペック
 */
export interface RotToRotConverterSpec {
  efficiency: number; // 効率
  gearRatio: number; // 減速比
  inertia: number; // 慣性モーメント
  allowableTorque: number; // 許容トルク
}

/**
 * 回転→直動変換用スペック
 */
export interface RotToLinConverterSpec {
  efficiency: number; // 効率
  lead: number; // リード
  conversionRatio: number; // 変換比
  allowableForce: number; // 許容推力
}

/**
 * 直動→回転変換用スペック
 */
export interface LinToRotConverterSpec {
  efficiency: number; // 効率
  conversionRatio: number; // 変換比
  allowableTorque: number; // 許容トルク
}

/**
 * 直動→直動変換用スペック
 */
export interface LinToLinConverterSpec {
  efficiency: number; // 効率
  conversionRatio: number; // 変換比
  allowableForce: number; // 許容推力
}

/**
 * 駆動部品型
 */
export interface DrivePart {
  id: number;
  type: DrivePartType;
  model: string;
  manufacturerId: number;
  spec:
    | RotationalActuatorSpec
    | LinearActuatorSpec
    | RotToRotConverterSpec
    | RotToLinConverterSpec
    | LinToRotConverterSpec
    | LinToLinConverterSpec;
  createdAt: string;
  updatedAt: string;
}

/**
 * デフォルトの回転系出力設定を取得する共通関数
 * @returns 初期状態のRotationalOutput
 */
export function getDefaultRotationalOutput(): RotationalOutput {
  return {
    type: 'rotational',
    ratedTorque: 0,
    ratedSpeed: 0,
    ratedPower: 0,
    maxTorque: 0,
    maxSpeed: 0,
    maxPower: 0,
    allowableTorque: 0,
    totalGearRatio: 1,
    totalInertia: 0,
    efficiency: 1,
  };
}

/**
 * デフォルトの直動系出力設定を取得する共通関数
 * @returns 初期状態のLinearOutput
 */
export function getDefaultLinearOutput(): LinearOutput {
  return {
    type: 'linear',
    ratedForce: 0,
    ratedSpeed: 0,
    ratedPower: 0,
    maxForce: 0,
    maxSpeed: 0,
    maxPower: 0,
    stroke: 0,
    maxAcceleration: 0,
    efficiency: 0.9,
  };
}
