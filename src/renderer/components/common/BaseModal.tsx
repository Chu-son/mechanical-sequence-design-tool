import React, { ReactNode } from 'react';
import './BaseModal.css';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * 基本的なモーダルコンポーネント
 * モーダルの基本構造を提供し、コンテンツは children として受け取る
 */
export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: BaseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>{title}</h2>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
