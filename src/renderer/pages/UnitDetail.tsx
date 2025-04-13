import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '@/renderer/pages/UnitDetail.css';
import '@/renderer/styles/Common.css'; // 共通スタイルをインポート
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import ListComponent from '@/renderer/components/common/ListComponent';

const ProjectsDB = DatabaseFactory.createDatabase();

export default function UnitDetail() {
  const { projectId, unitId } = useParams<{
    projectId: string;
    unitId: string;
  }>();
  const [unit, setUnit] = useState<{
    id: number;
    name: string;
    driveConfigs: { id: number; label: string }[];
    operationConfigs: { id: number; label: string }[];
  } | null>(null);
  const [subUnits, setSubUnits] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true); // ローディング状態を追加
  const [showDriveConfigModal, setShowDriveConfigModal] = useState(false);
  const [showOperationConfigModal, setShowOperationConfigModal] =
    useState(false);
  const [showSubUnitModal, setShowSubUnitModal] = useState(false);

  useEffect(() => {
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
    fetchUnit();
  }, [unitId, projectId]);

  if (loading) return <div>Loading...</div>; // ローディング中の表示

  if (!unit) return <div>ユニットが見つかりません</div>; // ユニットが存在しない場合の表示

  return (
    <div>
      <div className="DetailPage">
        <div className="Header">
          <h1>{unit.name}</h1>
        </div>
      </div>

      <ListComponent
        title="駆動構成"
        onAddNew={() => setShowDriveConfigModal(true)}
        headers={[{ label: '駆動名' }]}
        items={unit.driveConfigs.map((driveConfig) => ({
          id: driveConfig.id,
          to: `/projects/${projectId}/unit/${unit.id}/flowchart/driveConfigs/${driveConfig.id}`,
          columns: [{ content: driveConfig.label }],
        }))}
      />

      <ListComponent
        title="動作構成"
        onAddNew={() => setShowOperationConfigModal(true)}
        headers={[{ label: '動作名' }]}
        items={unit.operationConfigs.map((operationConfig) => ({
          id: operationConfig.id,
          to: `/projects/${projectId}/unit/${unit.id}/flowchart/operationConfigs/${operationConfig.id}`,
          columns: [{ content: operationConfig.label }],
        }))}
      />

      <ListComponent
        title="サブユニット"
        onAddNew={() => setShowSubUnitModal(true)}
        headers={[{ label: '名前' }]}
        items={subUnits.map((subUnit) => ({
          id: subUnit.id,
          to: `/projects/${projectId}/unit/${subUnit.id}`,
          columns: [{ content: subUnit.name }],
        }))}
      />

      {showDriveConfigModal && (
        <div className="modal">
          <div className="modal-content">
            <button
              type="button"
              className="close"
              aria-label="閉じる"
              onClick={() => setShowDriveConfigModal(false)}
            >
              &times;
            </button>
            <h2>駆動構成の新規作成</h2>
            {/* フォーム内容 */}
          </div>
        </div>
      )}

      {showOperationConfigModal && (
        <div className="modal">
          <div className="modal-content">
            <button
              type="button"
              className="close"
              aria-label="閉じる"
              onClick={() => setShowOperationConfigModal(false)}
            >
              &times;
            </button>
            <h2>動作構成の新規作成</h2>
            {/* フォーム内容 */}
          </div>
        </div>
      )}

      {showSubUnitModal && (
        <div className="modal">
          <div className="modal-content">
            <button
              type="button"
              className="close"
              aria-label="閉じる"
              onClick={() => setShowSubUnitModal(false)}
            >
              &times;
            </button>
            <h2>サブユニットの新規作成</h2>
            {/* フォーム内容 */}
          </div>
        </div>
      )}
    </div>
  );
}
