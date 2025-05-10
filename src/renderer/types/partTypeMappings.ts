/**
 * 部品タイプやノードタイプ、表示名などのマッピングを一元管理するファイル
 */
import { DrivePartType } from './driveTypes';

/**
 * 部品タイプの日本語表示名マッピング
 */
export const PART_TYPE_LABELS: Record<DrivePartType, string> = {
  baseRotationalActuator: '回転アクチュエータ',
  baseLinearActuator: '直動アクチュエータ',
  baseRotToRotConverter: '回転→回転変換',
  baseRotToLinConverter: '回転→直動変換',
  baseLinToRotConverter: '直動→回転変換',
  baseLinToLinConverter: '直動→直動変換',
};
