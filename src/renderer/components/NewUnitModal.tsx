import { useState } from 'react';
import '@/renderer/components/NewUnitModal.css';

interface NewUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function NewUnitModal({
  isOpen,
  onClose,
  onSave,
}: NewUnitModalProps) {
  const [unitName, setUnitName] = useState('');

  const handleSave = () => {
    onSave(unitName);
    setUnitName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>新規ユニット</h2>
        <label htmlFor="unitName">ユニット名</label>
        <input
          id="unitName"
          type="text"
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
        />
        <div className="modal-buttons">
          <button type="button" onClick={handleSave}>
            保存
          </button>
          <button type="button" onClick={onClose}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
