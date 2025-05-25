import React, { useEffect, useState } from 'react';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import { Manufacturer } from '@/renderer/types/databaseTypes';
import { useFormModal } from '@/renderer/hooks/useModal';
import FormModal from '@/renderer/features/common/FormModal';
import ListComponent, {
  MenuItem,
} from '@/renderer/features/common/ListComponent';
import '@/renderer/styles/Common.css';
import '@/renderer/styles/Modal.css';

const ManufacturerList: React.FC = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');

  const manufacturerModal = useFormModal<{ nameJa: string; nameEn: string }>(
    async (data) => {
      if (manufacturers.some((m) => m.nameJa === data.nameJa)) {
        alert('同じ日本語名のメーカーが既に存在します。');
        return false;
      }
      try {
        const database = DatabaseFactory.createDatabase();
        await database.createManufacturer({
          nameJa: data.nameJa,
          nameEn: data.nameEn,
        });
        await loadManufacturers();
        return true;
      } catch (err: any) {
        alert(err.message || 'メーカーの追加に失敗しました。');
        return false;
      }
    },
    { nameJa: '', nameEn: '' },
  );

  const editManufacturerModal = useFormModal<{
    id: number;
    nameJa: string;
    nameEn: string;
  }>(
    async (data) => {
      try {
        const database = DatabaseFactory.createDatabase();
        await database.updateManufacturer(Number(data.id), {
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

  const loadManufacturers = async () => {
    try {
      setLoading(true);
      const database = DatabaseFactory.createDatabase();
      let manufacturersList = await database.getManufacturers();
      if (!Array.isArray(manufacturersList)) manufacturersList = [];
      setManufacturers(manufacturersList);
      setError(null);
    } catch (err) {
      setManufacturers([]);
      setError('メーカーデータの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManufacturers();
  }, []);

  const filteredManufacturers = manufacturers.filter((manufacturer) => {
    const searchTerm = filter.toLowerCase();
    return (
      manufacturer.nameJa.toLowerCase().includes(searchTerm) ||
      manufacturer.nameEn.toLowerCase().includes(searchTerm)
    );
  });

  const handleAddManufacturer = () => {
    manufacturerModal.open();
  };

  const handleEditManufacturer = (manufacturerId: number) => {
    const manufacturer = manufacturers.find((m) => m.id === manufacturerId);
    if (!manufacturer) return;
    editManufacturerModal.setFormData({
      id: manufacturer.id,
      nameJa: manufacturer.nameJa,
      nameEn: manufacturer.nameEn,
    });
    editManufacturerModal.open();
  };

  const handleDeleteManufacturer = async (manufacturerId: number) => {
    if (
      !window.confirm(
        'このメーカーを削除してもよろしいですか？部品で使用されているメーカーは削除できません。',
      )
    )
      return;
    try {
      const database = DatabaseFactory.createDatabase();
      await database.deleteManufacturer(manufacturerId);
      await loadManufacturers();
    } catch (err: any) {
      alert(err.message || 'メーカーの削除に失敗しました。');
    }
  };

  const menuItems: MenuItem[] = [
    { label: '編集', onClick: handleEditManufacturer },
    { label: '削除', onClick: handleDeleteManufacturer, className: 'delete' },
  ];

  if (loading) return <div className="loading">読み込み中...</div>;
  if (error) return <div className="error">{error}</div>;

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
            key: 'nameJa',
            label: 'メーカー名（日本語）',
            type: 'text',
            getValue: (data) => data.nameJa || '',
            setValue: (value, data) => ({ ...data, nameJa: value }),
          },
          {
            key: 'nameEn',
            label: 'メーカー名（英語）',
            type: 'text',
            required: true,
            getValue: (data) => data.nameEn || '',
            setValue: (value, data) => ({ ...data, nameEn: value }),
            validation: (value) =>
              !value ? 'メーカー名（英語）は必須です' : null,
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
            key: 'id',
            label: 'ID',
            type: 'text',
            readonly: true,
            getValue: (data) => data.id || '',
            setValue: (value, data) => ({ ...data, id: value }),
          },
          {
            key: 'nameJa',
            label: 'メーカー名（日本語）',
            type: 'text',
            getValue: (data) => data.nameJa || '',
            setValue: (value, data) => ({ ...data, nameJa: value }),
          },
          {
            key: 'nameEn',
            label: 'メーカー名（英語）',
            type: 'text',
            required: true,
            getValue: (data) => data.nameEn || '',
            setValue: (value, data) => ({ ...data, nameEn: value }),
            validation: (value) =>
              !value ? 'メーカー名（英語）は必須です' : null,
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
