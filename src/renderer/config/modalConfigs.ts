/**
 * モーダル定義を中央管理するモジュール
 * 再利用可能なモーダル設定を提供する
 */

import { FieldDefinition } from '@/renderer/components/common/FormModal';

/**
 * プロジェクトモーダルの設定
 */
export const projectModalConfig = {
  title: '新規プロジェクト',
  fields: [
    {
      id: 'name',
      label: 'プロジェクト名',
      type: 'text' as const,
      required: true,
      placeholder: 'プロジェクト名を入力してください',
      validation: (value: string) => {
        if (!value || value.trim() === '') {
          return 'プロジェクト名は必須です';
        }
        return null;
      },
    },
    {
      id: 'description',
      label: '説明',
      type: 'textarea' as const,
      placeholder: 'プロジェクトの説明を入力してください（任意）',
    },
  ],
  saveButtonLabel: '保存',
  cancelButtonLabel: 'キャンセル',
};

/**
 * ユニットモーダルの設定
 */
export const unitModalConfig = {
  title: '新規ユニット',
  fields: [
    {
      id: 'name',
      label: 'ユニット名',
      type: 'text' as const,
      required: true,
      placeholder: 'ユニット名を入力してください',
      validation: (value: string) => {
        if (!value || value.trim() === '') {
          return 'ユニット名は必須です';
        }
        return null;
      },
    },
    {
      id: 'description',
      label: '説明',
      type: 'textarea' as const,
      placeholder: 'ユニットの説明を入力してください（任意）',
    },
  ],
  saveButtonLabel: '保存',
  cancelButtonLabel: 'キャンセル',
};

/**
 * 駆動軸構成モーダルの設定
 */
export const driveConfigModalConfig = {
  title: '駆動軸構成の新規作成',
  fields: [
    {
      id: 'label',
      label: '構成名',
      type: 'text' as const,
      required: true,
      placeholder: '駆動軸構成の名前を入力してください',
      validation: (value: string) => {
        if (!value || value.trim() === '') {
          return '構成名は必須です';
        }
        return null;
      },
    },
    {
      id: 'description',
      label: '説明',
      type: 'textarea' as const,
      placeholder: '駆動軸構成の説明を入力してください（任意）',
    },
  ],
  saveButtonLabel: '作成',
  cancelButtonLabel: 'キャンセル',
};

/**
 * 動作シーケンスモーダルの設定
 */
export const operationConfigModalConfig = {
  title: '動作シーケンスの新規作成',
  fields: [
    {
      id: 'label',
      label: 'シーケンス名',
      type: 'text' as const,
      required: true,
      placeholder: '動作シーケンスの名前を入力してください',
      validation: (value: string) => {
        if (!value || value.trim() === '') {
          return 'シーケンス名は必須です';
        }
        return null;
      },
    },
    {
      id: 'description',
      label: '説明',
      type: 'textarea' as const,
      placeholder: '動作シーケンスの説明を入力してください（任意）',
    },
  ],
  saveButtonLabel: '作成',
  cancelButtonLabel: 'キャンセル',
};

/**
 * サブユニットモーダルの設定
 */
export const subUnitModalConfig = {
  title: 'サブユニットの新規作成',
  fields: [
    {
      id: 'name',
      label: 'ユニット名',
      type: 'text' as const,
      required: true,
      placeholder: 'サブユニット名を入力してください',
      validation: (value: string) => {
        if (!value || value.trim() === '') {
          return 'ユニット名は必須です';
        }
        return null;
      },
    },
    {
      id: 'description',
      label: '説明',
      type: 'textarea' as const,
      placeholder: 'サブユニットの説明を入力してください（任意）',
    },
  ],
  saveButtonLabel: '作成',
  cancelButtonLabel: 'キャンセル',
};

/**
 * メーカー入力フォームの設定
 */
export const manufacturerFormConfig = {
  title: 'メーカー登録',
  fields: [
    {
      id: 'nameJa',
      label: 'メーカー名（日本語）',
      type: 'text' as const,
      required: true,
      placeholder: 'メーカーの日本語名を入力してください',
      validation: (value: string) => {
        if (!value || value.trim() === '') {
          return 'メーカー名（日本語）は必須です';
        }
        return null;
      },
    },
    {
      id: 'nameEn',
      label: 'メーカー名（英語）',
      type: 'text' as const,
      required: true,
      placeholder: 'メーカーの英語名を入力してください',
      validation: (value: string) => {
        if (!value || value.trim() === '') {
          return 'メーカー名（英語）は必須です';
        }
        return null;
      },
    },
  ],
  saveButtonLabel: '保存',
  cancelButtonLabel: 'キャンセル',
};

/**
 * 回転アクチュエータ入力フォームの設定
 */
export const rotationalActuatorFormConfig = {
  title: '回転アクチュエータ登録',
  fields: [
    {
      id: 'model',
      label: '型式',
      type: 'text' as const,
      required: true,
      placeholder: '型式を入力してください',
      validation: (value: string) => {
        if (!value || value.trim() === '') {
          return '型式は必須です';
        }
        return null;
      },
    },
    {
      id: 'manufacturerId',
      label: 'メーカー',
      type: 'select' as const,
      required: true,
      options: [], // 実行時にメーカー一覧を動的に設定
      validation: (value: string) => {
        if (!value) {
          return 'メーカーは必須です';
        }
        return null;
      },
    },
    {
      id: 'spec.ratedTorque',
      label: '定格トルク',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'N・m',
      validation: (value: string) => {
        if (!value) {
          return '定格トルクは必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.ratedSpeed',
      label: '定格回転速度',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'rpm',
      validation: (value: string) => {
        if (!value) {
          return '定格回転速度は必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.maxTorque',
      label: '最大トルク',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'N・m',
      validation: (value: string) => {
        if (!value) {
          return '最大トルクは必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.maxSpeed',
      label: '最大回転速度',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'rpm',
      validation: (value: string) => {
        if (!value) {
          return '最大回転速度は必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.rotorInertia',
      label: 'ローター慣性モーメント',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'kg・m²',
      validation: (value: string) => {
        if (!value) {
          return 'ローター慣性モーメントは必須です';
        }
        if (parseFloat(value) < 0) {
          return '0以上の値を入力してください';
        }
        return null;
      },
    },
  ],
  saveButtonLabel: '保存',
  cancelButtonLabel: 'キャンセル',
};

/**
 * 直動アクチュエータ入力フォームの設定
 */
export const linearActuatorFormConfig = {
  title: '直動アクチュエータ登録',
  fields: [
    {
      id: 'model',
      label: '型式',
      type: 'text' as const,
      required: true,
      placeholder: '型式を入力してください',
      validation: (value: string) => {
        if (!value || value.trim() === '') {
          return '型式は必須です';
        }
        return null;
      },
    },
    {
      id: 'manufacturerId',
      label: 'メーカー',
      type: 'select' as const,
      required: true,
      options: [], // 実行時にメーカー一覧を動的に設定
      validation: (value: string) => {
        if (!value) {
          return 'メーカーは必須です';
        }
        return null;
      },
    },
    {
      id: 'spec.stroke',
      label: 'ストローク',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'mm',
      validation: (value: string) => {
        if (!value) {
          return 'ストロークは必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.ratedForce',
      label: '定格推力',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'N',
      validation: (value: string) => {
        if (!value) {
          return '定格推力は必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.ratedSpeed',
      label: '定格速度',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'mm/s',
      validation: (value: string) => {
        if (!value) {
          return '定格速度は必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.maxForce',
      label: '最大推力',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'N',
      validation: (value: string) => {
        if (!value) {
          return '最大推力は必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.maxSpeed',
      label: '最大速度',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'mm/s',
      validation: (value: string) => {
        if (!value) {
          return '最大速度は必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.maxAcceleration',
      label: '最大加減速度',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'm/s²',
      validation: (value: string) => {
        if (!value) {
          return '最大加減速度は必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
  ],
  saveButtonLabel: '保存',
  cancelButtonLabel: 'キャンセル',
};

/**
 * 回転→回転変換入力フォームの設定
 */
export const rotToRotConverterFormConfig = {
  title: '回転→回転変換部品登録',
  fields: [
    {
      id: 'model',
      label: '型式',
      type: 'text' as const,
      required: true,
      placeholder: '型式を入力してください',
      validation: (value: string) => {
        if (!value || value.trim() === '') {
          return '型式は必須です';
        }
        return null;
      },
    },
    {
      id: 'manufacturerId',
      label: 'メーカー',
      type: 'select' as const,
      required: true,
      options: [], // 実行時にメーカー一覧を動的に設定
      validation: (value: string) => {
        if (!value) {
          return 'メーカーは必須です';
        }
        return null;
      },
    },
    {
      id: 'spec.efficiency',
      label: '効率',
      type: 'number' as const,
      required: true,
      min: 0,
      max: 100,
      unit: '%',
      validation: (value: string) => {
        if (!value) {
          return '効率は必須です';
        }
        const val = parseFloat(value);
        if (val <= 0 || val > 100) {
          return '0より大きく100以下の値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.gearRatio',
      label: '減速比',
      type: 'number' as const,
      required: true,
      min: 0,
      validation: (value: string) => {
        if (!value) {
          return '減速比は必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.inertia',
      label: '慣性モーメント',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'kg・m²',
      validation: (value: string) => {
        if (!value) {
          return '慣性モーメントは必須です';
        }
        if (parseFloat(value) < 0) {
          return '0以上の値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.allowableTorque',
      label: '許容トルク',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'N・m',
      validation: (value: string) => {
        if (!value) {
          return '許容トルクは必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
  ],
  saveButtonLabel: '保存',
  cancelButtonLabel: 'キャンセル',
};

/**
 * 回転→直動変換入力フォームの設定
 */
export const rotToLinConverterFormConfig = {
  title: '回転→直動変換部品登録',
  fields: [
    {
      id: 'model',
      label: '型式',
      type: 'text' as const,
      required: true,
      placeholder: '型式を入力してください',
      validation: (value: string) => {
        if (!value || value.trim() === '') {
          return '型式は必須です';
        }
        return null;
      },
    },
    {
      id: 'manufacturerId',
      label: 'メーカー',
      type: 'select' as const,
      required: true,
      options: [], // 実行時にメーカー一覧を動的に設定
      validation: (value: string) => {
        if (!value) {
          return 'メーカーは必須です';
        }
        return null;
      },
    },
    {
      id: 'spec.efficiency',
      label: '効率',
      type: 'number' as const,
      required: true,
      min: 0,
      max: 100,
      unit: '%',
      validation: (value: string) => {
        if (!value) {
          return '効率は必須です';
        }
        const val = parseFloat(value);
        if (val <= 0 || val > 100) {
          return '0より大きく100以下の値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.lead',
      label: 'リード',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'mm',
      validation: (value: string) => {
        if (!value) {
          return 'リードは必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.conversionRatio',
      label: '変換比',
      type: 'number' as const,
      required: true,
      min: 0,
      validation: (value: string) => {
        if (!value) {
          return '変換比は必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.allowableForce',
      label: '許容推力',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'N',
      validation: (value: string) => {
        if (!value) {
          return '許容推力は必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
  ],
  saveButtonLabel: '保存',
  cancelButtonLabel: 'キャンセル',
};

/**
 * 直動→回転変換入力フォームの設定
 */
export const linToRotConverterFormConfig = {
  title: '直動→回転変換部品登録',
  fields: [
    {
      id: 'model',
      label: '型式',
      type: 'text' as const,
      required: true,
      placeholder: '型式を入力してください',
      validation: (value: string) => {
        if (!value || value.trim() === '') {
          return '型式は必須です';
        }
        return null;
      },
    },
    {
      id: 'manufacturerId',
      label: 'メーカー',
      type: 'select' as const,
      required: true,
      options: [], // 実行時にメーカー一覧を動的に設定
      validation: (value: string) => {
        if (!value) {
          return 'メーカーは必須です';
        }
        return null;
      },
    },
    {
      id: 'spec.efficiency',
      label: '効率',
      type: 'number' as const,
      required: true,
      min: 0,
      max: 100,
      unit: '%',
      validation: (value: string) => {
        if (!value) {
          return '効率は必須です';
        }
        const val = parseFloat(value);
        if (val <= 0 || val > 100) {
          return '0より大きく100以下の値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.conversionRatio',
      label: '変換比',
      type: 'number' as const,
      required: true,
      min: 0,
      validation: (value: string) => {
        if (!value) {
          return '変換比は必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.allowableTorque',
      label: '許容トルク',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'N・m',
      validation: (value: string) => {
        if (!value) {
          return '許容トルクは必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
  ],
  saveButtonLabel: '保存',
  cancelButtonLabel: 'キャンセル',
};

/**
 * 直動→直動変換入力フォームの設定
 */
export const linToLinConverterFormConfig = {
  title: '直動→直動変換部品登録',
  fields: [
    {
      id: 'model',
      label: '型式',
      type: 'text' as const,
      required: true,
      placeholder: '型式を入力してください',
      validation: (value: string) => {
        if (!value || value.trim() === '') {
          return '型式は必須です';
        }
        return null;
      },
    },
    {
      id: 'manufacturerId',
      label: 'メーカー',
      type: 'select' as const,
      required: true,
      options: [], // 実行時にメーカー一覧を動的に設定
      validation: (value: string) => {
        if (!value) {
          return 'メーカーは必須です';
        }
        return null;
      },
    },
    {
      id: 'spec.efficiency',
      label: '効率',
      type: 'number' as const,
      required: true,
      min: 0,
      max: 100,
      unit: '%',
      validation: (value: string) => {
        if (!value) {
          return '効率は必須です';
        }
        const val = parseFloat(value);
        if (val <= 0 || val > 100) {
          return '0より大きく100以下の値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.conversionRatio',
      label: '変換比',
      type: 'number' as const,
      required: true,
      min: 0,
      validation: (value: string) => {
        if (!value) {
          return '変換比は必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
    {
      id: 'spec.allowableForce',
      label: '許容推力',
      type: 'number' as const,
      required: true,
      min: 0,
      unit: 'N',
      validation: (value: string) => {
        if (!value) {
          return '許容推力は必須です';
        }
        if (parseFloat(value) <= 0) {
          return '0より大きい値を入力してください';
        }
        return null;
      },
    },
  ],
  saveButtonLabel: '保存',
  cancelButtonLabel: 'キャンセル',
};

/**
 * モーダル設定をカスタマイズするためのヘルパー関数
 * @param baseConfig ベースとなるモーダル設定
 * @param customConfig カスタマイズ設定
 * @returns カスタマイズされたモーダル設定
 */
export function customizeModalConfig<T extends { fields: FieldDefinition[] }>(
  baseConfig: T,
  customConfig: Partial<T> & { additionalFields?: FieldDefinition[] },
): T {
  const { additionalFields, ...customProps } = customConfig;

  // 新しいフィールド配列を作成（既存のフィールドと追加フィールドをマージ）
  const mergedFields = additionalFields
    ? [...baseConfig.fields, ...additionalFields]
    : baseConfig.fields;

  // ベース設定とカスタム設定をマージ
  return {
    ...baseConfig,
    ...customProps,
    fields: mergedFields,
  } as T;
}

/**
 * 部品種別ごとのフォーム設定マッピング
 */
export const partTypeFormConfigMap = {
  rotationalActuator: rotationalActuatorFormConfig,
  linearActuator: linearActuatorFormConfig,
  rotToRotConverter: rotToRotConverterFormConfig,
  rotToLinConverter: rotToLinConverterFormConfig,
  linToRotConverter: linToRotConverterFormConfig,
  linToLinConverter: linToLinConverterFormConfig,
};
