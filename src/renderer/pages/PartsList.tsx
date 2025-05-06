import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import { Manufacturer, Part } from '@/renderer/types/databaseTypes';
import '@/renderer/styles/Common.css';

import ListComponent, {
  MenuItem,
} from '@/renderer/components/common/ListComponent';

// 部品種別の表示名マッピング
const partTypeLabels: Record<DrivePartType, string> = {
  rotationalActuator: '回転アクチュエータ',
  linearActuator: '直動アクチュエータ',
  rotToRotConverter: '回転→回転変換',
  rotToLinConverter: '回転→直動変換',
  linToRotConverter: '直動→回転変換',
  linToLinConverter: '直動→直動変換',
};

// 部品一覧ページ
const PartsList: React.FC = () => {
  const [parts, setParts] = useState<DrivePart[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // メーカー名を取得する関数
  const getManufacturerName = (manufacturerId: string): string => {
    const manufacturer = manufacturers.find((m) => m.id === manufacturerId);
    return manufacturer ? manufacturer.nameJa : '不明';
  };

  // データ読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const database = DatabaseFactory.createDatabase();
        let partsList = await database.getParts();
        let manufacturersList = await database.getManufacturers();
        // データベースが空や未初期化の場合は空配列で初期化
        if (!Array.isArray(partsList)) partsList = [];
        if (!Array.isArray(manufacturersList)) manufacturersList = [];
        setParts(partsList);
        setManufacturers(manufacturersList);
        setError(null);
      } catch (err) {
        console.error('部品データ読み込みエラー:', err);
        setParts([]);
        setManufacturers([]);
        setError('部品データの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 部品を種別ごとにグループ化
  const groupedParts: Record<DrivePartType, DrivePart[]> = {
    rotationalActuator: [],
    linearActuator: [],
    rotToRotConverter: [],
    rotToLinConverter: [],
    linToRotConverter: [],
    linToLinConverter: [],
  };

  parts.forEach((part) => {
    if (groupedParts[part.type]) {
      groupedParts[part.type].push(part);
    }
  });

  // 部品削除ハンドラ
  const handleDelete = async (partId: string) => {
    if (!window.confirm('この部品を削除してもよろしいですか？')) {
      return;
    }

    try {
      const database = DatabaseFactory.createDatabase();
      await database.deletePart(partId);
      // 削除後に部品一覧を再取得
      const updatedParts = await database.getParts();
      setParts(updatedParts);
    } catch (err) {
      console.error('部品削除エラー:', err);
      alert('部品の削除に失敗しました。');
    }
  };

  // 新規部品追加
  const handleAddPart = () => {
    navigate('/part-type-select');
  };

  // 部品編集
  const handleEditPart = (partId: number) => {
    navigate(`/part-form/${partId}`);
  };

  // メーカー管理ページへ
  const handleManageManufacturers = () => {
    navigate('/manufacturers');
  };

  // メニュー項目の定義
  const menuItems: MenuItem[] = [
    {
      label: '編集',
      onClick: handleEditPart,
    },
    {
      label: '削除',
      onClick: (id) => handleDelete(String(id)),
      className: 'delete',
    },
  ];

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="container">
      <h1>駆動部品一覧</h1>

      <div className="actions">
        <button
          type="button"
          className="action-button"
          onClick={handleManageManufacturers}
        >
          メーカー管理
        </button>
      </div>

      {Object.entries(groupedParts).map(([type, typeParts]) => (
        <div key={type} className="section">
          <ListComponent
            title={partTypeLabels[type as DrivePartType]}
            onAddNew={handleAddPart}
            addButtonLabel="新規部品追加"
            headers={[
              { label: '型式' },
              { label: 'メーカー' },
              { label: '登録日' },
              { label: '更新日' },
            ]}
            items={typeParts.map((part) => ({
              id: part.id,
              columns: [
                { content: part.model },
                { content: getManufacturerName(String(part.manufacturerId)) },
                {
                  content: new Date(part.createdAt).toLocaleDateString('ja-JP'),
                },
                {
                  content: new Date(part.updatedAt).toLocaleDateString('ja-JP'),
                },
              ],
            }))}
            menuItems={menuItems}
            menuColumnWidth="100px"
          />
        </div>
      ))}
    </div>
  );
};

export default PartsList;
