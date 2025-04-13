import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './UnitDetail.css';
import '../styles/Common.css'; // 共通スタイルをインポート
import DatabaseFactory from '../utils/DatabaseFactory';

const ProjectsDB = DatabaseFactory.createDatabase();

export default function UnitDetail() {
  const { projectId, unitId } = useParams<{
    projectId: string;
    unitId: string;
  }>();
  const navigate = useNavigate();
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

      <div className="DetailPage">
        <div className="Header">
          <h1>駆動構成</h1>
          <button type="button" onClick={() => setShowDriveConfigModal(true)}>
            新規作成
          </button>
        </div>
        <div className="List">
          <div className="ListHeader">
            <span>駆動名</span>
          </div>
          <ul>
            {unit.driveConfigs.map((driveConfig) => (
              <li
                key={driveConfig.id}
                onClick={() =>
                  navigate(
                    `/projects/${projectId}/unit/${unit.id}/flowchart/driveConfigs/${driveConfig.id}`,
                  )
                }
              >
                {driveConfig.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="DetailPage">
        <div className="Header">
          <h1>動作構成</h1>
          <button
            type="button"
            onClick={() => setShowOperationConfigModal(true)}
          >
            新規作成
          </button>
        </div>

        <div className="List">
          <div className="ListHeader">
            <span>動作名</span>
          </div>
          <ul>
            {unit.operationConfigs.map((operationConfig) => (
              <li
                key={operationConfig.id}
                onClick={() =>
                  navigate(
                    `/projects/${projectId}/unit/${unit.id}/flowchart/operationConfigs/${operationConfig.id}`,
                  )
                }
              >
                {operationConfig.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="DetailPage">
        <div className="Header">
          <h1>サブユニット</h1>
          <button type="button" onClick={() => setShowSubUnitModal(true)}>
            新規作成
          </button>
        </div>
        <div className="List">
          <div className="ListHeader">
            <span>名前</span>
          </div>
          <ul>
            {subUnits.map((subUnit) => (
              <li key={subUnit.id}>{subUnit.name}</li>
            ))}
          </ul>
        </div>
      </div>

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
