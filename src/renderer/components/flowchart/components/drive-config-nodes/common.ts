/**
 * 回転系出力（rotational）型定義
 */
export interface RotationalOutput {
  ratedTorque: number; // 定格トルク [N・m]
  ratedSpeed: number; // 定格回転速度 [rpm]
  ratedPower: number; // 定格出力 [W]
  maxTorque: number; // 最大トルク [N・m]
  maxSpeed: number; // 最大回転速度 [rpm]
  maxPower: number; // 最大出力 [W]
  allowableTorque?: number; // 許容トルク [N・m]
  totalGearRatio?: number; // 全体の減速比
  totalInertia?: number; // 全体の慣性モーメント [kg・m²]
  efficiency?: number; // 効率 [0-1]
}

/**
 * 直動系出力（linear）型定義
 */
export interface LinearOutput {
  ratedForce: number; // 定格推力 [N]
  ratedSpeed: number; // 定格速度 [mm/s]
  ratedPower: number; // 定格出力 [W]
  maxForce: number; // 最大推力 [N]
  maxSpeed: number; // 最大速度 [mm/s]
  maxPower: number; // 最大出力 [W]
  stroke?: number; // ストローク [mm]
  maxAcceleration?: number; // 最大加速度 [mm/s²]
  efficiency?: number; // 効率 [0-1]
}

/**
 * 駆動ノード共通データ型
 * 設計ドキュメント「6.5 駆動軸構成ノードの設計詳細」に準拠
 * - すべての駆動軸構成ノードはこの型を継承し、outputSpecプロパティを持つ
 * - outputSpecは回転系(RotationalOutput)または直動系(LinearOutput)のいずれか、または両方
 * - 入力値（ユーザー指定）と出力値（outputSpec）を明確に分離
 */
export interface DriveNodeData {
  /**
   * 出力スペック（回転系または直動系）
   * 設計ドキュメントの「outputSpec」
   */
  outputSpec?: RotationalOutput | LinearOutput;
  // ...ノードごとの入力値は各ノード型で拡張
}

/**
 * アクチュエータノード固有のデータ型
 */
export interface ActuatorNodeData extends DriveNodeData {
  model?: string; // モデル名/型番
  manufacturer?: string; // メーカー
}

/**
 * 回転アクチュエータ用データ型
 */
export interface RotationalActuatorNodeData extends ActuatorNodeData {
  ratedTorque: number; // 定格トルク [N・m]
  ratedSpeed: number; // 定格速度 [rpm]
  maxSpeed: number; // 最大速度 [rpm]
  rotorInertia: number; // ローター慣性モーメント [kg・m²]
}

/**
 * 直動アクチュエータ用データ型
 */
export interface LinearActuatorNodeData extends ActuatorNodeData {
  stroke: number; // ストローク長さ [mm]
  ratedForce: number; // 定格推力 [N]
  ratedSpeed: number; // 定格速度 [mm/s]
  maxSpeed: number; // 最大速度 [mm/s]
  acceleration: number; // 加速度 [mm/s²]
}

/**
 * ドライブコンポーネントノード固有のデータ型
 */
export interface DriveComponentNodeData extends DriveNodeData {
  inputType: 'rotational' | 'linear'; // 入力の種類
  outputType: 'rotational' | 'linear'; // 出力の種類
  efficiency: number; // 効率 [0-1]
}

/**
 * 回転→回転変換コンポーネント用データ型
 */
export interface RotToRotComponentNodeData extends DriveComponentNodeData {
  gearRatio: number; // 減速比/増速比
  inertia: number; // 慣性モーメント [kg・m²]
  maxTorque: number; // 最大トルク [N・m]
}

/**
 * 回転→直動変換コンポーネント用データ型
 */
export interface RotToLinComponentNodeData extends DriveComponentNodeData {
  leadPitch?: number; // リード/ピッチ [mm]
  conversionRatio: number; // 変換比 (mm/rev)
  maxForce: number; // 最大推力 [N]
  maxSpeed: number; // 最大速度 [mm/s]
}

/**
 * 直動→回転変換コンポーネント用データ型
 */
export interface LinToRotComponentNodeData extends DriveComponentNodeData {
  conversionRatio: number; // 変換比 (rev/mm)
  maxTorque: number; // 最大トルク [N・m]
}

/**
 * 直動→直動変換コンポーネント用データ型
 */
export interface LinToLinComponentNodeData extends DriveComponentNodeData {
  ratio: number; // 変換比 (出力変位/入力変位)
  maxForce: number; // 最大推力 [N]
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

/**
 * デフォルトの回転系出力設定を取得する共通関数
 * @returns 初期状態のRotationalOutput
 */
export function getDefaultRotationalOutput(): RotationalOutput {
  return {
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
