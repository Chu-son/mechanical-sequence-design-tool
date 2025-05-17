import { roundToDigits } from '@/renderer/components/flowchart/common/flowchartUtils';
import { VTCurve } from '@/renderer/types/driveTypes';

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

// interpolateTorqueFromRPMはこのファイルでのみ実装し、他で使う場合もここからimportすること
/**
 * V-T曲線から回転数に対応するトルク値を線形補間で計算する関数
 * @param vtCurve V-T曲線データ
 * @param rpm 求めたい回転数
 * @returns 補間計算されたトルク値、曲線外やデータがない場合はnull
 */
export function interpolateTorqueFromRPM(
  vtCurve: VTCurve | undefined,
  rpm: number,
): number | null {
  if (!vtCurve || !vtCurve.points || vtCurve.points.length < 2) {
    return null;
  }

  // 点を回転数で昇順ソート
  const sortedPoints = [...vtCurve.points].sort((a, b) => a.rpm - b.rpm);

  // 範囲外チェック
  if (
    rpm < sortedPoints[0].rpm ||
    rpm > sortedPoints[sortedPoints.length - 1].rpm
  ) {
    return null;
  }

  // 線形補間
  for (let i = 0; i < sortedPoints.length - 1; i++) {
    const current = sortedPoints[i];
    const next = sortedPoints[i + 1];

    if (rpm >= current.rpm && rpm <= next.rpm) {
      // 線形補間
      const ratio = (rpm - current.rpm) / (next.rpm - current.rpm);
      return roundToDigits(
        current.torque + ratio * (next.torque - current.torque),
      );
    }
  }

  return null;
}

/**
 * モーターの速度-トルク曲線に基づいて性能が要求を満たしているか検証する関数
 * @param vtCurve 速度-トルク曲線
 * @param requiredSpeed 必要回転数
 * @param requiredTorque 必要トルク
 * @returns 性能を満たしているかの真偽値と説明
 */
export function validateMotorPerformance(
  vtCurve: VTCurve | undefined,
  requiredSpeed: number,
  requiredTorque: number,
): { isValid: boolean; explanation: string } {
  // V-T曲線が未設定の場合
  if (!vtCurve || !vtCurve.points || vtCurve.points.length < 2) {
    return { isValid: false, explanation: 'V-T曲線が設定されていません' };
  }

  // 要求速度でのトルク値を補間計算
  const torqueAtSpeed = interpolateTorqueFromRPM(vtCurve, requiredSpeed);

  // 速度範囲外
  if (torqueAtSpeed === null) {
    return {
      isValid: false,
      explanation: `要求速度(${requiredSpeed}rpm)がV-T曲線の範囲外です`,
    };
  }

  // トルク不足判定
  if (torqueAtSpeed < requiredTorque) {
    return {
      isValid: false,
      explanation: `速度${requiredSpeed}rpmでの出力トルク(${roundToDigits(torqueAtSpeed)}N・m)が要求トルク(${requiredTorque}N・m)を下回っています`,
    };
  }

  // 要件を満たしている
  return {
    isValid: true,
    explanation: `速度${requiredSpeed}rpmでのトルク出力(${roundToDigits(torqueAtSpeed)}N・m)は要求トルク(${requiredTorque}N・m)を満たしています`,
  };
}
