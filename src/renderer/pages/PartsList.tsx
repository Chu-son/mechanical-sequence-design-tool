import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import { Manufacturer } from '@/renderer/types/databaseTypes';
import {
  DrivePart,
  DrivePartType,
  DrivePartSpec,
} from '@/renderer/types/driveTypes';
import { PART_TYPE_LABELS } from '@/renderer/types/partTypeMappings';
import { PART_TYPE_FORM_CONFIG_MAP } from '@/renderer/config/modalConfigs';
import { useFormModal } from '@/renderer/hooks/useModal';
import FormModal from '@/renderer/components/common/FormModal';
import ListComponent, {
  MenuItem,
} from '@/renderer/components/common/ListComponent';
import '@/renderer/styles/Common.css';

// フォームデータ型
interface PartFormData {
  model: string;
  manufacturerId: number | null;
  [key: string]: any;
}

// データ整形共通関数
function normalizePartFormData(
  data: Record<string, any>,
): PartFormData & { spec: DrivePartSpec } {
  return {
    ...data,
    manufacturerId:
      typeof data.manufacturerId === 'string'
        ? Number(data.manufacturerId)
        : data.manufacturerId,
    spec: Object.fromEntries(
      Object.entries(data)
        .filter(([k]) => k.startsWith('spec.'))
        .map(([k, v]) => [k.replace('spec.', ''), v]),
    ) as DrivePartSpec,
  };
}

// fields生成共通関数
function getPartFormFields(type: DrivePartType, manufacturers: Manufacturer[]) {
  return PART_TYPE_FORM_CONFIG_MAP[type].fields.map((f: any) =>
    f.id === 'manufacturerId'
      ? {
          ...f,
          options: manufacturers.map((m) => ({ value: m.id, label: m.nameJa })),
        }
      : f,
  );
}

// 部品一覧ページ
const PartsList: React.FC = () => {
  const [parts, setParts] = useState<DrivePart[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<DrivePartType | null>(null);
  const [editTarget, setEditTarget] = useState<DrivePart | null>(null);
  const navigate = useNavigate();

  // 新規追加モーダル
  const addModal = useFormModal<PartFormData>(async (data) => {
    try {
      const database = DatabaseFactory.createDatabase();
      const normalized = normalizePartFormData(data);
      await database.createPart({
        type: selectedType!,
        model: normalized.model,
        manufacturerId: normalized.manufacturerId,
        spec: normalized.spec,
      });
      await loadData();
      return true;
    } catch (err: any) {
      alert(err.message || '部品の追加に失敗しました。');
      return false;
    }
  });

  // 編集モーダル
  const editModal = useFormModal<PartFormData>(async (data) => {
    try {
      const database = DatabaseFactory.createDatabase();
      const normalized = normalizePartFormData(data);
      await database.updatePart(editTarget!.id, {
        model: normalized.model,
        manufacturerId: normalized.manufacturerId,
        spec: normalized.spec,
      });
      await loadData();
      return true;
    } catch (err: any) {
      alert(err.message || '部品の更新に失敗しました。');
      return false;
    }
  });

  // データ読み込み
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

  useEffect(() => {
    loadData();
  }, []);

  // 部品を種別ごとにグループ化
  const groupedParts: Record<DrivePartType, DrivePart[]> = {
    baseRotationalActuator: [],
    baseLinearActuator: [],
    baseRotToRotConverter: [],
    baseRotToLinConverter: [],
    baseLinToRotConverter: [],
    baseLinToLinConverter: [],
  };

  parts.forEach((part) => {
    if (groupedParts[part.type]) {
      groupedParts[part.type].push(part);
    }
  });

  // メーカー名を取得する関数
  const getManufacturerName = (manufacturerId: number): string => {
    const manufacturer = manufacturers.find((m) => m.id === manufacturerId);
    return manufacturer ? manufacturer.nameJa : '不明';
  };

  // 新規部品追加モーダルを開く
  const handleAddPart = (type: DrivePartType) => {
    setSelectedType(type);
    addModal.setFormData({
      model: '',
      manufacturerId: null,
      ...Object.fromEntries(
        PART_TYPE_FORM_CONFIG_MAP[type].fields
          .filter((f) => f.id.startsWith('spec.'))
          .map((f) => [f.id, '']),
      ),
    });
    addModal.open();
  };

  // 部品編集モーダルを開く
  const handleEditPart = (id: number) => {
    const part = parts.find((p) => p.id === id);
    if (!part) return;
    setEditTarget(part);
    const formData: any = {
      id: part.id,
      model: part.model,
      manufacturerId: part.manufacturerId,
    };
    Object.entries(part.spec || {}).forEach(([k, v]) => {
      formData[`spec.${k}`] = v;
    });
    editModal.setFormData(formData);
    editModal.open();
  };

  // 部品削除ハンドラ
  const handleDelete = async (partId: number) => {
    if (!window.confirm('この部品を削除してもよろしいですか？')) {
      return;
    }

    try {
      const database = DatabaseFactory.createDatabase();
      await database.deletePart(partId);
      // 削除後に部品一覧を再取得
      loadData();
    } catch (err) {
      console.error('部品削除エラー:', err);
      alert('部品の削除に失敗しました。');
    }
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
      onClick: (id) => handleDelete(Number(id)),
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
            title={PART_TYPE_LABELS[type as DrivePartType]}
            onAddNew={() => handleAddPart(type as DrivePartType)}
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
                { content: getManufacturerName(part.manufacturerId) },
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

      {/* 新規追加モーダル */}
      {selectedType && (
        <FormModal
          isOpen={addModal.isOpen}
          onClose={addModal.close}
          title={PART_TYPE_FORM_CONFIG_MAP[selectedType].title}
          fields={getPartFormFields(selectedType, manufacturers)}
          initialValues={addModal.formData}
          onSave={(data) => addModal.saveAndClose(normalizePartFormData(data))}
        />
      )}
      {/* 編集モーダル */}
      {editTarget && (
        <FormModal
          isOpen={editModal.isOpen}
          onClose={() => {
            editModal.close();
            setEditTarget(null);
          }}
          title={PART_TYPE_FORM_CONFIG_MAP[editTarget.type].title + '編集'}
          fields={getPartFormFields(editTarget.type, manufacturers)}
          initialValues={editModal.formData}
          onSave={(data) => editModal.saveAndClose(normalizePartFormData(data))}
        />
      )}
    </div>
  );
};

export default PartsList;
