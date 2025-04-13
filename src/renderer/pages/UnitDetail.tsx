import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '@/renderer/pages/UnitDetail.css';
import '@/renderer/styles/Common.css'; // 共通スタイルをインポート
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import ListComponent from '@/renderer/components/common/ListComponent';
import FormModal from '@/renderer/components/common/FormModal';
import { useFormModal } from '@/renderer/hooks/useModal';
import {
  driveConfigModalConfig,
  operationConfigModalConfig,
  subUnitModalConfig,
} from '@/renderer/config/modalConfigs';

const ProjectsDB = DatabaseFactory.createDatabase();

export default function UnitDetail() {
  const { projectId, unitId } = useParams<{
    projectId: string;
    unitId: string;
  }>();
  const [unit, setUnit] = useState<{
    id: number;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    driveConfigs: {
      id: number;
      label: string;
      description?: string;
      createdAt: string;
      updatedAt: string;
    }[];
    operationConfigs: {
      id: number;
      label: string;
      description?: string;
      createdAt: string;
      updatedAt: string;
    }[];
  } | null>(null);
  const [subUnits, setSubUnits] = useState<
    {
      id: number;
      name: string;
      description?: string;
      createdAt: string;
      updatedAt: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true); // ローディング状態を追加

  // カスタムフックを使用してモーダルの状態を管理
  const driveConfigModal = useFormModal<{
    label: string;
    description?: string;
  }>(async (data) => {
    // 駆動構成の保存処理
    if (unit) {
      await ProjectsDB.createDriveConfig({
        projectId: Number(projectId),
        unitId: Number(unitId),
        label: data.label,
        description: data.description,
      });
      // データを再取得
      fetchUnit();
    }
  });

  const operationConfigModal = useFormModal<{
    label: string;
    description?: string;
  }>(async (data) => {
    // 動作構成の保存処理
    if (unit) {
      await ProjectsDB.createOperationConfig({
        projectId: Number(projectId),
        unitId: Number(unitId),
        label: data.label,
        description: data.description,
      });
      // データを再取得
      fetchUnit();
    }
  });

  const subUnitModal = useFormModal<{ name: string; description?: string }>(
    async (data) => {
      // サブユニットの保存処理
      await ProjectsDB.createUnit({
        projectId: Number(projectId),
        parentId: Number(unitId),
        name: data.name,
        description: data.description,
      });
      // データを再取得
      fetchUnit();
    },
  );

  const fetchUnit = async () => {
    const unitData = await ProjectsDB.getUnitById({
      projectId: Number(projectId),
      unitId: Number(unitId),
    });
    const allUnitsInProject = await ProjectsDB.getUnitsByProjectId({
      projectId: Number(projectId),
    });

    // 親IDが現在表示しているユニットのIDと一致するユニットのみをフィルタリング
    const childUnits = allUnitsInProject.filter(
      (u) => u.parentId === Number(unitId),
    );

    if (unitData) {
      setUnit(unitData);
      setSubUnits(childUnits);
    }
    setLoading(false); // データ取得後にローディングを終了
  };

  useEffect(() => {
    fetchUnit();
  }, [unitId, projectId]);

  if (loading) return <div>Loading...</div>; // ローディング中の表示

  if (!unit) return <div>ユニットが見つかりません</div>; // ユニットが存在しない場合の表示

  return (
    <div>
      <div className="unit-header">
        <h1>{unit.name}</h1>
        {unit.description && (
          <p className="unit-description">{unit.description}</p>
        )}
        <div className="unit-meta">
          <span>
            作成日: {new Date(unit.createdAt).toLocaleDateString('ja-JP')}
          </span>
          <span>
            更新日: {new Date(unit.updatedAt).toLocaleDateString('ja-JP')}
          </span>
        </div>
      </div>

      <ListComponent
        title="駆動構成"
        onAddNew={driveConfigModal.open}
        headers={[
          { label: '駆動名' },
          { label: '説明' },
          { label: '作成日' },
          { label: '更新日時' },
        ]}
        items={unit.driveConfigs.map((driveConfig) => ({
          id: driveConfig.id,
          to: `/projects/${projectId}/unit/${unit.id}/flowchart/driveConfigs/${driveConfig.id}`,
          columns: [
            { content: driveConfig.label },
            { content: driveConfig.description || '-' },
            {
              content: new Date(driveConfig.createdAt).toLocaleDateString(
                'ja-JP',
              ),
            },
            {
              content: new Date(driveConfig.updatedAt).toLocaleDateString(
                'ja-JP',
              ),
            },
          ],
        }))}
      />

      <ListComponent
        title="動作構成"
        onAddNew={operationConfigModal.open}
        headers={[
          { label: '動作名' },
          { label: '説明' },
          { label: '作成日' },
          { label: '更新日時' },
        ]}
        items={unit.operationConfigs.map((operationConfig) => ({
          id: operationConfig.id,
          to: `/projects/${projectId}/unit/${unit.id}/flowchart/operationConfigs/${operationConfig.id}`,
          columns: [
            { content: operationConfig.label },
            { content: operationConfig.description || '-' },
            {
              content: new Date(operationConfig.createdAt).toLocaleDateString(
                'ja-JP',
              ),
            },
            {
              content: new Date(operationConfig.updatedAt).toLocaleDateString(
                'ja-JP',
              ),
            },
          ],
        }))}
      />

      <ListComponent
        title="サブユニット"
        onAddNew={subUnitModal.open}
        headers={[
          { label: '名前' },
          { label: '説明' },
          { label: '作成日' },
          { label: '更新日時' },
        ]}
        items={subUnits.map((subUnit) => ({
          id: subUnit.id,
          to: `/projects/${projectId}/unit/${subUnit.id}`,
          columns: [
            { content: subUnit.name },
            { content: subUnit.description || '-' },
            {
              content: new Date(subUnit.createdAt).toLocaleDateString('ja-JP'),
            },
            {
              content: new Date(subUnit.updatedAt).toLocaleDateString('ja-JP'),
            },
          ],
        }))}
      />

      {/* 駆動構成モーダル */}
      <FormModal
        isOpen={driveConfigModal.isOpen}
        onClose={driveConfigModal.close}
        onSave={driveConfigModal.saveAndClose}
        {...driveConfigModalConfig}
      />

      {/* 動作構成モーダル */}
      <FormModal
        isOpen={operationConfigModal.isOpen}
        onClose={operationConfigModal.close}
        onSave={operationConfigModal.saveAndClose}
        {...operationConfigModalConfig}
      />

      {/* サブユニットモーダル */}
      <FormModal
        isOpen={subUnitModal.isOpen}
        onClose={subUnitModal.close}
        onSave={subUnitModal.saveAndClose}
        {...subUnitModalConfig}
      />
    </div>
  );
}
