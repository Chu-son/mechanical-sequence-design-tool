/**
 * 共通ユーティリティ関数と型定義を格納するファイル
 */

/**
 * 数値を丸める際の桁数
 */
export const ROUND_DIGITS = 2;

/**
 * 指定された桁数に数値を丸める関数
 * @param value - 丸める対象の数値
 * @param digits - 桁数
 * @returns 丸められた数値
 */
export function roundToDigits(value: number, digits: number): number {
  return parseFloat(value.toFixed(digits));
}

/**
 * タスクノードのデータ型
 */
export type TaskNodeData = {
  description: string;
  duration: number;
  totalDuration: number;
};
