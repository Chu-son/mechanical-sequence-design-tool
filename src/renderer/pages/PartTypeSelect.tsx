import React from 'react';
import { useNavigate } from 'react-router-dom';
import '@/renderer/styles/Common.css';
import { DrivePartType } from '@/renderer/types/databaseTypes';

// 部品種別の表示名マッピング
const partTypeLabels: Record<DrivePartType, string> = {
  rotationalActuator: '回転アクチュエータ',
  linearActuator: '直動アクチュエータ',
  rotToRotConverter: '回転→回転変換',
  rotToLinConverter: '回転→直動変換',
  linToRotConverter: '直動→回転変換',
  linToLinConverter: '直動→直動変換',
};

// 部品種別説明
const partTypeDescriptions: Record<DrivePartType, string> = {
  rotationalActuator: 'モーター等の回転運動を出力する駆動部品',
  linearActuator: 'リニアモーター等の直線運動を出力する駆動部品',
  rotToRotConverter: '減速機等の回転運動を変換する部品',
  rotToLinConverter: 'ボールねじ等の回転を直線運動に変換する部品',
  linToRotConverter: '直線運動を回転に変換する部品',
  linToLinConverter: 'レバー等の直線運動を変換する部品',
};

// 部品種別選択アイコン（簡易表現）
const partTypeIcons: Record<DrivePartType, string> = {
  rotationalActuator: '🔄',
  linearActuator: '⟷',
  rotToRotConverter: '⚙️',
  rotToLinConverter: '🔄→⟷',
  linToRotConverter: '⟷→🔄',
  linToLinConverter: '⟷→⟷',
};

// 部品種別選択ページ
const PartTypeSelect: React.FC = () => {
  const navigate = useNavigate();

  // 部品種別選択時の処理
  const handleSelectType = (type: DrivePartType) => {
    navigate(`/part-form/new/${type}`);
  };

  // 部品一覧に戻る
  const handleBack = () => {
    navigate('/parts');
  };

  return (
    <div className="container">
      <h1>部品種別選択</h1>
      <p className="description">追加する部品の種別を選択してください</p>

      <div className="part-type-grid">
        {(Object.entries(partTypeLabels) as [DrivePartType, string][]).map(
          ([type, label]) => (
            <div
              key={type}
              className="part-type-card"
              onClick={() => handleSelectType(type)}
            >
              <div className="part-type-icon">{partTypeIcons[type]}</div>
              <h3>{label}</h3>
              <p>{partTypeDescriptions[type]}</p>
            </div>
          ),
        )}
      </div>

      <div className="actions">
        <button className="cancel-button" onClick={handleBack}>
          戻る
        </button>
      </div>
    </div>
  );
};

export default PartTypeSelect;
