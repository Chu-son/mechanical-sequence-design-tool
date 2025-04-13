import { useState } from 'react';
import '@/renderer/components/NewProjectModal.css';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function NewProjectModal({
  isOpen,
  onClose,
  onSave,
}: NewProjectModalProps) {
  const [projectName, setProjectName] = useState('');

  const handleSave = () => {
    onSave(projectName);
    setProjectName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>新規プロジェクト</h2>
        <label htmlFor="projectName">プロジェクト名</label>
        <input
          id="projectName"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={handleSave}>保存</button>
          <button onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </div>
  );
}
