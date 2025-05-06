import {
  DriveNodeData,
  DriveOutput,
  LinearOutput,
  RotationalOutput,
  getDefaultLinearOutput,
  getDefaultRotationalOutput,
} from '@/renderer/types/driveTypes';

// 型をエクスポート（既存コードとの互換性維持のため）
export type { DriveNodeData, DriveOutput, LinearOutput, RotationalOutput };

// 関数をエクスポート（既存コードとの互換性維持のため）
export { getDefaultLinearOutput, getDefaultRotationalOutput };

// 初回作成時のみ必要な共通設定など、このファイルに残すべき内容があれば
// ここに実装してください
