/**
 * 共通ユーティリティ関数と型定義を格納するファイル
 */

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
