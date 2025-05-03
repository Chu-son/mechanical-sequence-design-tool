/**
 * SimpleActuatorTaskNodeの定義
 */
import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import { calculateDuration } from '@/renderer/components/flowchart/common/mechanicalCalculations';
import {
  roundToDigits,
  ROUND_DIGITS,
} from '@/renderer/components/flowchart/common/flowchartUtils';

/**
 * SimpleActuatorTaskNodeの定義
 */
const simpleActuatorTaskNodeDefinition: NodeDefinition = {
  type: 'actuatorTask',
  title: 'Simple Actuator Task',

  // グループのタイトル定義
  groupTitles: {
    parameters: 'Parameters',
    results: 'Calculated',
    output: 'Output',
  },

  // グループ表示オプション
  groupDisplayOptions: {
    parameters: { showTitle: true, showDivider: false },
    results: { showTitle: true, showDivider: true },
    output: { showTitle: true, showDivider: true },
  },

  // 前段ノードから伝播するフィールド
  propagateFields: { totalDuration: 'previousTotalDuration' },

  // 初期データ生成
  getInitialData: () => ({
    description: '',
    position: 0,
    velocity: 0,
    acceleration: 0,
    deceleration: 0,
    duration: 0,
    totalDuration: 0,
    previousTotalDuration: 0,
  }),

  // フィールド定義
  fields: [
    // 説明フィールド
    {
      key: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Enter description',
      group: 'parameters',
      getValue: (data) => data.description || '',
      setValue: (value, data) => ({ ...data, description: value }),
    },

    // 移動距離フィールド
    {
      key: 'position',
      label: 'Displacement',
      type: 'number',
      unit: 'mm',
      min: 0,
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data.position || 0,
      setValue: (value, data) => {
        // 数値型に変換
        const numValue = parseFloat(value as string) || 0;
        return { ...data, position: numValue };
      },
      // 値が変更されたときに実行するコールバック
      onChange: (value, data, update) => {
        // 持続時間を計算
        const newDuration = calculateDuration(
          data.position,
          data.velocity,
          data.acceleration,
          data.deceleration,
        );

        // 持続時間を更新
        update({
          ...data,
          duration: newDuration,
        });
      },
      validation: (value) => {
        const numValue = parseFloat(value as string);
        return numValue < 0 ? '値は0以上である必要があります' : null;
      },
    },

    // 速度フィールド
    {
      key: 'velocity',
      label: 'Velocity',
      type: 'number',
      unit: 'mm/s',
      min: 0,
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data.velocity || 0,
      setValue: (value, data) => {
        const numValue = parseFloat(value as string) || 0;
        return { ...data, velocity: numValue };
      },
      // 値が変更されたときに実行するコールバック
      onChange: (value, data, update) => {
        // 持続時間を計算
        const newDuration = calculateDuration(
          data.position,
          data.velocity,
          data.acceleration,
          data.deceleration,
        );

        // 持続時間を更新
        update({
          ...data,
          duration: newDuration,
        });
      },
      validation: (value) => {
        const numValue = parseFloat(value as string);
        return numValue < 0 ? '値は0以上である必要があります' : null;
      },
    },

    // 加速度フィールド
    {
      key: 'acceleration',
      label: 'Acceleration',
      type: 'number',
      unit: 'mm/s²',
      min: 0,
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data.acceleration || 0,
      setValue: (value, data) => {
        const numValue = parseFloat(value as string) || 0;
        return { ...data, acceleration: numValue };
      },
      // 値が変更されたときに実行するコールバック
      onChange: (value, data, update) => {
        // 持続時間を計算
        const newDuration = calculateDuration(
          data.position,
          data.velocity,
          data.acceleration,
          data.deceleration,
        );

        // 持続時間を更新
        update({
          ...data,
          duration: newDuration,
        });
      },
      validation: (value) => {
        const numValue = parseFloat(value as string);
        return numValue < 0 ? '値は0以上である必要があります' : null;
      },
    },

    // 減速度フィールド
    {
      key: 'deceleration',
      label: 'Deceleration',
      type: 'number',
      unit: 'mm/s²',
      min: 0,
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data.deceleration || 0,
      setValue: (value, data) => {
        const numValue = parseFloat(value as string) || 0;
        return { ...data, deceleration: numValue };
      },
      // 値が変更されたときに実行するコールバック
      onChange: (value, data, update) => {
        // 持続時間を計算
        const newDuration = calculateDuration(
          data.position,
          data.velocity,
          data.acceleration,
          data.deceleration,
        );

        // 持続時間を更新
        update({
          ...data,
          duration: newDuration,
        });
      },
      validation: (value) => {
        const numValue = parseFloat(value as string);
        return numValue < 0 ? '値は0以上である必要があります' : null;
      },
    },

    // 持続時間 (読み取り専用)
    {
      key: 'duration',
      label: 'Duration',
      type: 'readonly',
      unit: 'sec',
      group: 'results',
      getValue: (data) => data.duration,
      formatValue: (value) => roundToDigits(value, ROUND_DIGITS).toString(),
    },

    // 合計持続時間 (読み取り専用)
    {
      key: 'totalDuration',
      label: 'Total Duration',
      type: 'readonly',
      unit: 'sec',
      group: 'output',
      getValue: (data) => data.totalDuration,
      formatValue: (value) => roundToDigits(value, ROUND_DIGITS).toString(),
    },
  ],

  // 計算処理
  compute: (data, nodeId, update) => {
    // 入力値が変更された場合に持続時間を計算
    const newDuration = calculateDuration(
      data.position,
      data.velocity,
      data.acceleration,
      data.deceleration,
    );

    // 前の合計時間と新しい持続時間を考慮して合計持続時間を更新
    const newTotalDuration = data.previousTotalDuration + newDuration;

    // 合計時間が変わっていれば更新
    if (
      data.duration !== newDuration ||
      data.totalDuration !== newTotalDuration
    ) {
      update({
        ...data,
        duration: newDuration,
        totalDuration: roundToDigits(newTotalDuration, ROUND_DIGITS),
      });
    }
  },
};

export default simpleActuatorTaskNodeDefinition;
