import { useState } from 'react';

/**
 * モーダルの表示状態を管理するカスタムフック
 * @returns モーダル表示制御用のフック
 */
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

/**
 * フォームモーダルの状態と処理を管理するカスタムフック
 * @param onSave 保存処理関数
 * @param initialState 初期状態
 * @returns モーダルとフォームの状態管理用のフック
 */
export function useFormModal<T extends Record<string, any>>(
  onSave: (data: T) => void,
  initialState: T = {} as T,
) {
  const { isOpen, open, close, toggle } = useModal();
  const [formData, setFormData] = useState<T>(initialState);

  // モーダルを開く
  const openModal = () => {
    open();
  };

  // フォームデータを保存して閉じる
  const saveAndClose = (data: T) => {
    onSave(data);
    close();
  };

  return {
    isOpen,
    open: openModal,
    close,
    toggle,
    formData,
    setFormData,
    saveAndClose,
  };
}
