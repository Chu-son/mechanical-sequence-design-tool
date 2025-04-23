// メカニカルな計算を行うユーティリティ関数
import { roundToDigits } from './flowchartUtils';

/**
 * 速度プロファイルの点データ型
 */
export interface VelocityProfilePoint {
  time: number;
  velocity: number;
}

/**
 * 速度プロファイル計算結果の型
 */
export interface VelocityProfileResult {
  profileData: VelocityProfilePoint[];
  totalTime: number;
}

/**
 * 台形速度プロファイルに基づいて所要時間とプロファイルデータを計算する関数
 */
export function calculateVelocityProfile(
  position: number,
  maxVelocity: number,
  acceleration: number,
  deceleration: number,
): VelocityProfileResult {
  if (
    position <= 0 ||
    maxVelocity <= 0 ||
    acceleration <= 0 ||
    deceleration <= 0
  ) {
    return { profileData: [], totalTime: 0 };
  }
  const accelTime = maxVelocity / acceleration;
  const accelDist = 0.5 * acceleration * accelTime * accelTime;
  const decelTime = maxVelocity / deceleration;
  const decelDist = 0.5 * deceleration * decelTime * decelTime;
  if (accelDist + decelDist > position) {
    const peakTime = Math.sqrt(
      position /
        (0.5 * acceleration +
          0.5 * deceleration * (acceleration / deceleration)),
    );
    const peakVelocity = acceleration * peakTime;
    const totalTime = peakTime * (1 + acceleration / deceleration);
    const profileData: VelocityProfilePoint[] = [
      { time: 0, velocity: 0 },
      {
        time: roundToDigits(peakTime),
        velocity: roundToDigits(peakVelocity),
      },
      { time: roundToDigits(totalTime), velocity: 0 },
    ];
    return {
      profileData,
      totalTime: roundToDigits(totalTime),
    };
  }
  const constVelDist = position - (accelDist + decelDist);
  const constVelTime = constVelDist / maxVelocity;
  const t1 = accelTime;
  const t2 = t1 + constVelTime;
  const t3 = t2 + decelTime;
  const profileData: VelocityProfilePoint[] = [
    { time: 0, velocity: 0 },
    {
      time: roundToDigits(t1),
      velocity: roundToDigits(maxVelocity),
    },
    {
      time: roundToDigits(t2),
      velocity: roundToDigits(maxVelocity),
    },
    { time: roundToDigits(t3), velocity: 0 },
  ];
  return {
    profileData,
    totalTime: roundToDigits(t3),
  };
}

/**
 * 速度プロファイルから所要時間のみを計算する関数
 */
export function calculateDuration(
  position: number,
  maxVelocity: number,
  acceleration: number,
  deceleration: number,
): number {
  const result = calculateVelocityProfile(
    position,
    maxVelocity,
    acceleration,
    deceleration,
  );
  return result.totalTime;
}
