/**
 * 共通ユーティリティ関数と型定義を格納するファイル
 */

// 共通化した関数・型は flowchart/common/common.ts からimport
// 使用しないものはimportしない
import type {
  ROUND_DIGITS,
  roundToDigits,
  VelocityProfilePoint,
  VelocityProfileResult,
  calculateVelocityProfile,
  calculateDuration,
  validateNumericInput,
} from '@/renderer/flowchart/common/common';

// タスクノード固有の型のみ残す
export type TaskNodeData = {
  description?: string;
  duration?: number;
  totalDuration?: number;
  position?: number;
  velocity?: number;
  acceleration?: number;
  deceleration?: number;
};
