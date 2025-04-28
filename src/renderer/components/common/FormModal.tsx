import React, { useState, useEffect } from 'react';
import BaseModal from '@/renderer/components/common/BaseModal';
import './FormModal.css';

// フィールドの型定義
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea';

export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[]; // select タイプの場合の選択肢
  defaultValue?: any;
  validation?: (value: any) => string | null; // バリデーション関数（エラーメッセージまたはnullを返す）
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: Record<string, any>) => void;
  title: string;
  fields: FieldDefinition[];
  saveButtonLabel?: string;
  cancelButtonLabel?: string;
}

/**
 * フォーム要素を持つ汎用モーダルコンポーネント
 * 動的にフィールドを生成し、フォームの状態を管理する
 */
export default function FormModal({
  isOpen,
  onClose,
  onSave,
  title,
  fields,
  saveButtonLabel = '保存',
  cancelButtonLabel = 'キャンセル',
}: FormModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // フィールドの初期値を設定
  useEffect(() => {
    if (isOpen) {
      const initialData: Record<string, any> = {};
      fields.forEach((field) => {
        initialData[field.id] = field.defaultValue || '';
      });
      setFormData(initialData);
      setErrors({});
    }
  }, [isOpen, fields]);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // 入力時にバリデーションを実行
    const field = fields.find((f) => f.id === fieldId);
    if (field?.validation) {
      const error = field.validation(value);
      setErrors((prev) => ({
        ...prev,
        [fieldId]: error || '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach((field) => {
      // 必須フィールドの検証
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label}は必須です`;
        isValid = false;
      }

      // カスタムバリデーション
      if (field.validation) {
        const error = field.validation(formData[field.id]);
        if (error) {
          newErrors[field.id] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  // フィールドのレンダリング
  const renderField = (field: FieldDefinition) => {
    const { id, label, type, placeholder, options, required } = field;
    const value = formData[id] || '';
    const error = errors[id];

    switch (type) {
      case 'text':
        return (
          <div key={id} className="form-field">
            <label htmlFor={id}>
              {label}
              {required && <span className="required">*</span>}
            </label>
            <input
              id={id}
              type="text"
              value={value}
              placeholder={placeholder}
              onChange={(e) => handleInputChange(id, e.target.value)}
              className={error ? 'error' : ''}
            />
            {error && <div className="error-message">{error}</div>}
          </div>
        );

      case 'number':
        return (
          <div key={id} className="form-field">
            <label htmlFor={id}>
              {label}
              {required && <span className="required">*</span>}
            </label>
            <input
              id={id}
              type="number"
              value={value}
              placeholder={placeholder}
              onChange={(e) => handleInputChange(id, e.target.value)}
              className={error ? 'error' : ''}
            />
            {error && <div className="error-message">{error}</div>}
          </div>
        );

      case 'date':
        return (
          <div key={id} className="form-field">
            <label htmlFor={id}>
              {label}
              {required && <span className="required">*</span>}
            </label>
            <input
              id={id}
              type="date"
              value={value}
              onChange={(e) => handleInputChange(id, e.target.value)}
              className={error ? 'error' : ''}
            />
            {error && <div className="error-message">{error}</div>}
          </div>
        );

      case 'select':
        return (
          <div key={id} className="form-field">
            <label htmlFor={id}>
              {label}
              {required && <span className="required">*</span>}
            </label>
            <select
              id={id}
              value={value}
              onChange={(e) => handleInputChange(id, e.target.value)}
              className={error ? 'error' : ''}
            >
              <option value="">選択してください</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <div className="error-message">{error}</div>}
          </div>
        );

      case 'textarea':
        return (
          <div key={id} className="form-field">
            <label htmlFor={id}>
              {label}
              {required && <span className="required">*</span>}
            </label>
            <textarea
              id={id}
              value={value}
              placeholder={placeholder}
              onChange={(e) => handleInputChange(id, e.target.value)}
              className={error ? 'error' : ''}
            />
            {error && <div className="error-message">{error}</div>}
          </div>
        );

      default:
        return null;
    }
  };

  const renderFooter = () => (
    <>
      <button type="button" onClick={handleSave}>
        {saveButtonLabel}
      </button>
      <button type="button" onClick={onClose}>
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
      <form>{fields.map((field) => renderField(field))}</form>
    </BaseModal>
  );
}
