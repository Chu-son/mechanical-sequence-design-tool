import React, { useState, useEffect, useRef } from 'react';
import BaseModal from './BaseModal';
import {
  roundToDigits,
  ROUND_DIGITS,
  validateNumericInput,
} from '@/renderer/features/flowchart/utils/common/flowchartUtils';
import { NodeFieldDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import '@/renderer/styles/Modal.css';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: Record<string, any>) => Promise<boolean> | boolean;
  title: string;
  fields: NodeFieldDefinition[];
  saveButtonLabel?: string;
  cancelButtonLabel?: string;
  initialValues?: Record<string, any>;
}

/**
 * フォーム要素を持つ汎用モーダルコンポーネント
 * ノード定義のNodeFieldDefinitionを利用し、flowchartノードと共通のフィールド定義を使用する
 */
export default function FormModal({
  isOpen,
  onClose,
  onSave,
  title,
  fields,
  saveButtonLabel = '保存',
  cancelButtonLabel = 'キャンセル',
  initialValues = {},
}: FormModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialValues || {});
      setErrors({});
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 0);
    }
  }, [isOpen, initialValues]);

  // NodeFieldDefinitionのvalue取得関数
  const getFieldValue = (
    field: NodeFieldDefinition,
    data: Record<string, any>,
  ): any => {
    if ('getValue' in field) {
      return field.getValue(data);
    }
    return data[field.id];
  };

  // NodeFieldDefinitionのvalue設定関数
  const setFieldValue = (
    field: NodeFieldDefinition,
    value: any,
    data: Record<string, any>,
  ): Record<string, any> => {
    if ('setValue' in field) {
      return field.setValue(value, data);
    }
    return { ...data, [field.id]: value };
  };

  // フィールドがreadonlyかどうかを判定
  const isFieldReadonly = (field: NodeFieldDefinition): boolean => {
    if ('readonly' in field) {
      return typeof field.readonly === 'function'
        ? field.readonly(formData)
        : !!field.readonly;
    }
    return false;
  };

  // 入力変更ハンドラ
  const handleInputChange = (field: NodeFieldDefinition, value: any) => {
    if (isFieldReadonly(field)) return;

    // フィールドタイプがnumberの場合は数値変換
    if (field.type === 'number' && value !== '') {
      value = parseFloat(value);
    }

    // データを更新
    const newData = setFieldValue(field, value, formData);
    setFormData(newData);

    // バリデーション
    if ('validation' in field && typeof field.validation === 'function') {
      const error = field.validation(value, newData);
      setErrors((prev) => ({
        ...prev,
        [field.id]: error || '',
      }));
    }

    // 追加のコールバックがあれば実行
    if ('onChange' in field && typeof field.onChange === 'function') {
      field.onChange(value, newData, (updatedData) => {
        setFormData(updatedData);
      });
    }
  };

  // フォームバリデーション
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach((field) => {
      const value = getFieldValue(field, formData);

      // 必須フィールドのチェック
      if (
        field.required &&
        (value === undefined || value === null || value === '')
      ) {
        newErrors[field.id] = `${field.label}は必須です`;
        isValid = false;
      }

      // カスタムバリデーション
      if ('validation' in field && typeof field.validation === 'function') {
        const error = field.validation(value, formData);
        if (error) {
          newErrors[field.id] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // 保存処理
  const handleSave = async () => {
    if (validateForm()) {
      try {
        const result = await onSave(formData);
        if (result !== false) {
          onClose();
        }
      } catch (error) {
        console.error('Form save error:', error);
      }
    }
  };

  // フィールドのレンダリング
  const renderField = (field: NodeFieldDefinition, idx: number) => {
    if ('hidden' in field) {
      const isHidden =
        typeof field.hidden === 'function'
          ? field.hidden(formData)
          : !!field.hidden;
      if (isHidden) return null;
    }

    if ('condition' in field && typeof field.condition === 'function') {
      if (!field.condition(formData)) return null;
    }

    const { id, label, type, required } = field;
    const value = getFieldValue(field, formData);
    const error = errors[id];
    const readonly = isFieldReadonly(field);
    const placeholder = 'placeholder' in field ? field.placeholder : undefined;
    const unit = 'unit' in field ? field.unit : undefined;

    // 数値型の場合、表示時に丸める処理を追加
    let displayValue = value;
    if (
      type === 'number' &&
      typeof value === 'number' &&
      'displayDigits' in field
    ) {
      displayValue = roundToDigits(value, field.displayDigits ?? ROUND_DIGITS);
    }

    // ラベルと単位を組み合わせて表示用のラベルを作成
    const displayLabel = unit ? `${label} (${unit})` : label;

    // カスタムレンダリング
    if ('customRender' in field && typeof field.customRender === 'function') {
      return (
        <div key={id} className="form-field custom-field">
          {field.customRender(
            formData,
            (newData) => setFormData(newData),
            readonly,
          )}
          {error && <div className="error-message">{error}</div>}
        </div>
      );
    }

    switch (type) {
      case 'text':
        return (
          <div key={id + '-' + idx} className="form-field">
            <label htmlFor={id}>
              {displayLabel}
              {required && <span className="required">*</span>}
            </label>
            <input
              id={id}
              type="text"
              value={displayValue || ''}
              placeholder={placeholder}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={error ? 'error' : ''}
              readOnly={readonly}
              disabled={readonly}
              ref={idx === 0 ? firstInputRef : undefined}
            />
            {error && <div className="error-message">{error}</div>}
          </div>
        );

      case 'number':
        return (
          <div key={id + '-' + idx} className="form-field">
            <label htmlFor={id}>
              {displayLabel}
              {required && <span className="required">*</span>}
            </label>
            <input
              id={id}
              type="number"
              value={
                displayValue !== undefined && displayValue !== null
                  ? displayValue
                  : ''
              }
              placeholder={placeholder}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={error ? 'error' : ''}
              min={'min' in field ? field.min : undefined}
              max={'max' in field ? field.max : undefined}
              step={'step' in field ? field.step : 'any'}
              readOnly={readonly}
              disabled={readonly}
            />
            {error && <div className="error-message">{error}</div>}
          </div>
        );

      case 'select':
        return (
          <div key={id + '-' + idx} className="form-field">
            <label htmlFor={id}>
              {displayLabel}
              {required && <span className="required">*</span>}
            </label>
            <select
              id={id}
              value={displayValue || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={error ? 'error' : ''}
              disabled={readonly}
            >
              <option value="">選択してください</option>
              {'options' in field &&
                field.options?.map((option, optIdx) => (
                  <option
                    key={`${id}-${option.value}-${optIdx}`}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
            </select>
            {error && <div className="error-message">{error}</div>}
          </div>
        );

      case 'readonly':
        const formattedValue =
          'formatValue' in field && field.formatValue
            ? field.formatValue(displayValue, formData)
            : displayValue;
        return (
          <div key={id + '-' + idx} className="form-field readonly-field">
            <label htmlFor={id}>{displayLabel}</label>
            <div className="readonly-value">{formattedValue}</div>
            {error && <div className="error-message">{error}</div>}
          </div>
        );

      case 'textarea':
        return (
          <div key={id + '-' + idx} className="form-field">
            <label htmlFor={id}>
              {displayLabel}
              {required && <span className="required">*</span>}
            </label>
            <textarea
              id={id}
              value={displayValue || ''}
              placeholder={placeholder}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={error ? 'error' : ''}
              readOnly={readonly}
              disabled={readonly}
            />
            {error && <div className="error-message">{error}</div>}
          </div>
        );

      default:
        return null;
    }
  };

  // フッターのレンダリング
  const renderFooter = () => (
    <>
      <button className="app-button" type="button" onClick={handleSave}>
        {saveButtonLabel}
      </button>
      <button className="app-button" type="button" onClick={onClose}>
        {cancelButtonLabel}
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={renderFooter()}
    >
      <form>{fields.map((field, idx) => renderField(field, idx))}</form>
    </BaseModal>
  );
}
