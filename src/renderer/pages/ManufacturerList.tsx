import React, { useEffect, useState } from 'react';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import { Manufacturer } from '@/renderer/types/databaseTypes';
import { useFormModal } from '@/renderer/hooks/useModal';
import FormModal from '@/renderer/components/common/FormModal';
import ListComponent, {
  MenuItem,
} from '@/renderer/components/common/ListComponent';
import '@/renderer/styles/Common.css';
import '@/renderer/styles/Modal.css';

// メーカー一覧ページ
const ManufacturerList: React.FC = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');

  // useFormModalを利用
  const manufacturerModal = useFormModal<{
    nameJa: string;
    nameEn: string;
  }>(
    async (data) => {
      // manufacturersがundefinedの場合でも必ず空配列でガード
      console.log('ManufacturerModal:', data);
      console.log('manufacturers:', manufacturers);
      if ((manufacturers ?? []).some((m) => m.nameJa === data.nameJa)) {
        alert('同じ日本語名のメーカーが既に存在します。');
        return false;
      }
      try {
        console.log('Adding manufacturer:', data);
        const database = DatabaseFactory.createDatabase();
        await database.createManufacturer({
          nameJa: data.nameJa,
          nameEn: data.nameEn,
        });
        console.log('Manufacturer added successfully');
        await loadManufacturers();
        return true;
      } catch (err: any) {
        alert(err.message || 'メーカーの追加に失敗しました。');
        return false;
      }
    },
    { nameJa: '', nameEn: '' },
  );

  // 編集用モーダルの状態
  const editManufacturerModal = useFormModal<{
    id: number;
    nameJa: string;
    nameEn: string;
  }>(
    async (data) => {
      try {
        const database = DatabaseFactory.createDatabase();
        const id = Number(data.id);
        console.log('Editing manufacturer:', id, data);
        await database.updateManufacturer(id, {
          nameJa: data.nameJa,
          nameEn: data.nameEn,
        });
        await loadManufacturers();
        return true;
      } catch (err: any) {
        alert(err.message || 'メーカーの更新に失敗しました。');
        return false;
      }
    },
    { id: 0, nameJa: '', nameEn: '' },
  );

  // データ読み込み
  const loadManufacturers = async () => {
    try {
      setLoading(true);
      const database = DatabaseFactory.createDatabase();
      let manufacturersList = await database.getManufacturers();
      if (!Array.isArray(manufacturersList)) manufacturersList = [];
      setManufacturers(manufacturersList);
      setError(null);
    } catch (err) {
      console.error('メーカーデータ読み込みエラー:', err);
      setManufacturers([]);
      setError('メーカーデータの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManufacturers();
  }, []);

  // フィルタリングされたメーカーリスト
  const filteredManufacturers = (manufacturers ?? []).filter((manufacturer) => {
    const searchTerm = filter.toLowerCase();
    return (
      manufacturer.nameJa.toLowerCase().includes(searchTerm) ||
      manufacturer.nameEn.toLowerCase().includes(searchTerm)
    );
  });

  // 新規メーカー追加
  const handleAddManufacturer = () => {
    manufacturerModal.open();
  };

  // メーカー編集
  const handleEditManufacturer = (manufacturerId: number) => {
    // IDに一致するメーカーを探す
    const manufacturer = manufacturers.find((m) => m.id === manufacturerId);
    if (!manufacturer) return;

    console.log('Editing manufacturer:', manufacturer);
    editManufacturerModal.setFormData({
      id: manufacturer.id,
      nameJa: manufacturer.nameJa,
      nameEn: manufacturer.nameEn,
    });
    editManufacturerModal.open();
  };

  // メーカー削除
  const handleDeleteManufacturer = async (manufacturerId: number) => {
    if (
      !window.confirm(
        'このメーカーを削除してもよろしいですか？部品で使用されているメーカーは削除できません。',
      )
    ) {
      return;
    }

    try {
      const database = DatabaseFactory.createDatabase();
      await database.deleteManufacturer(manufacturerId);
      await loadManufacturers(); // リスト再読み込み
    } catch (err: any) {
      alert(err.message || 'メーカーの削除に失敗しました。');
    }
  };

  // メニュー項目の定義
  const menuItems: MenuItem[] = [
    {
      label: '編集',
      onClick: handleEditManufacturer,
    },
    {
      label: '削除',
      onClick: handleDeleteManufacturer,
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
      <div className="actions">
        <div className="search-container">
          <input
            type="text"
            placeholder="メーカー名で検索..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      <FormModal
        isOpen={manufacturerModal.isOpen}
        onClose={manufacturerModal.close}
        title="メーカー追加"
        fields={[
          {
            id: 'nameJa',
            label: 'メーカー名（日本語）',
            type: 'text',
          },
          {
            id: 'nameEn',
            label: 'メーカー名（英語）',
            type: 'text',
            required: true,
          },
        ]}
        initialValues={manufacturerModal.formData}
        onSave={manufacturerModal.saveAndClose}
      />
      <FormModal
        isOpen={editManufacturerModal.isOpen}
        onClose={editManufacturerModal.close}
        title="メーカー編集"
        fields={[
          {
            id: 'nameJa',
            label: 'メーカー名（日本語）',
            type: 'text',
          },
          {
            id: 'nameEn',
            label: 'メーカー名（英語）',
            type: 'text',
            required: true,
          },
        ]}
        initialValues={editManufacturerModal.formData}
        onSave={editManufacturerModal.saveAndClose}
      />
      {filteredManufacturers.length === 0 ? (
        <p className="no-data">
          {filter
            ? '検索条件に一致するメーカーがありません'
            : '登録されたメーカーがありません'}
        </p>
      ) : (
        <ListComponent
          title="メーカー一覧"
          onAddNew={handleAddManufacturer}
          addButtonLabel="新規メーカー追加"
          headers={[
            { label: 'ID' },
            { label: 'メーカー名（日本語）' },
            { label: 'メーカー名（英語）' },
            { label: '登録日' },
            { label: '更新日' },
          ]}
          items={filteredManufacturers.map((manufacturer) => ({
            id: manufacturer.id,
            columns: [
              { content: manufacturer.id },
              { content: manufacturer.nameJa },
              { content: manufacturer.nameEn },
              {
                content: new Date(manufacturer.createdAt).toLocaleDateString(
                  'ja-JP',
                ),
              },
              {
                content: new Date(manufacturer.updatedAt).toLocaleDateString(
                  'ja-JP',
                ),
              },
            ],
          }))}
          menuItems={menuItems}
          menuColumnWidth="48px"
        />
      )}
    </div>
  );
};

export default ManufacturerList;
