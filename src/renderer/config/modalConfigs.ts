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
