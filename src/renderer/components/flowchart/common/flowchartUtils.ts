// flowchart全体で共通利用するユーティリティ関数

/** 数値を丸める際の桁数（デフォルト） */
export const ROUND_DIGITS = 3; // デフォルト値は用途に応じて調整可

/**
 * 指定された桁数に数値を丸める関数
 * @param value - 丸める対象の数値
 * @param digits - 桁数（省略時はROUND_DIGITS）
 * @returns 丸められた数値
 */
export function roundToDigits(
  value: number,
  digits: number = ROUND_DIGITS,
): number {
  return Math.round(value * 10 ** digits) / 10 ** digits;
}

/**
 * 入力値のバリデーション関数
 */
export function validateNumericInput(
  value: string,
  minValue: number = 0,
): number {
  let numValue = parseFloat(value || '0');
  if (Number.isNaN(numValue)) {
    numValue = 0;
  }
  numValue = Math.max(numValue, minValue);
  return roundToDigits(numValue);
}
