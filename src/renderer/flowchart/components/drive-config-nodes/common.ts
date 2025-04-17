import { Node } from '@xyflow/react';

/**
 * 共通ユーティリティ関数と型定義を格納するファイル
 */

/**
 * 数値を丸める際の桁数
 */
export const ROUND_DIGITS = 5;

/**
 * 数値を指定の桁数で丸める
 */
export function roundToDigits(
  value: number,
  digits: number = ROUND_DIGITS,
): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/**
 * ドライブノードのデータ型の基本インターフェース
 */
export interface DriveNodeData {
  id: string;
  type: 'rotational' | 'linear'; // 出力の種類（回転/直動）

  // 計算結果（次のノードへの入力として渡す）
  calculatedOutput: DriveCalculationResult;
}

/**
 * 計算結果の型定義
 */
export interface DriveCalculationResult {
  // 回転出力の場合
  rotational?: {
    torque: number; // トルク [N・m]
    speed: number; // 回転速度 [rpm]
    power: number; // 出力 [W]
    inertia: number; // 慣性モーメント [kg・m²]
    direction: 1 | -1; // 回転方向 (1:正転, -1:逆転)
  };

  // 直動出力の場合
  linear?: {
    force: number; // 推力/引力 [N]
    velocity: number; // 速度 [mm/s]
    acceleration: number; // 加速度 [mm/s²]
    power: number; // 出力 [W]
    mass: number; // 質量 [kg]
    direction: 1 | -1; // 方向 (1:正方向, -1:逆方向)
  };

  // 共通のパフォーマンス特性
  efficiency: number; // 効率 [0-1]
  maxLoad: number; // 最大負荷
  isOverloaded: boolean; // 過負荷フラグ
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
  type: 'rotational';
  ratedTorque: number; // 定格トルク [N・m]
  ratedSpeed: number; // 定格速度 [rpm]
  maxSpeed: number; // 最大速度 [rpm]
  rotorInertia: number; // ローター慣性モーメント [kg・m²]
}

/**
 * 直動アクチュエータ用データ型
 */
export interface LinearActuatorNodeData extends ActuatorNodeData {
  type: 'linear';
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
  inputType: 'rotational';
  outputType: 'rotational';
  gearRatio: number; // 減速比/増速比
  inertia: number; // 慣性モーメント [kg・m²]
  maxTorque: number; // 最大トルク [N・m]
}

/**
 * 回転→直動変換コンポーネント用データ型
 */
export interface RotToLinComponentNodeData extends DriveComponentNodeData {
  inputType: 'rotational';
  outputType: 'linear';
  leadPitch?: number; // リード/ピッチ [mm]
  conversionRatio: number; // 変換比 (mm/rev)
  maxForce: number; // 最大推力 [N]
  maxSpeed: number; // 最大速度 [mm/s]
}

/**
 * 直動→回転変換コンポーネント用データ型
 */
export interface LinToRotComponentNodeData extends DriveComponentNodeData {
  inputType: 'linear';
  outputType: 'rotational';
  conversionRatio: number; // 変換比 (rev/mm)
  maxTorque: number; // 最大トルク [N・m]
}

/**
 * 直動→直動変換コンポーネント用データ型
 */
export interface LinToLinComponentNodeData extends DriveComponentNodeData {
  inputType: 'linear';
  outputType: 'linear';
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
