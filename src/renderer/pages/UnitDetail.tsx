import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectsDB } from '../database'; // ProjectsDBをインポート
import './UnitDetail.css';
import '../styles/Common.css'; // 共通スタイルをインポート

export default function UnitDetail() {
  const { unitId } = useParams<{ unitId: string }>();
  const [unit, setUnit] = useState<{
    id: number;
    name: string;
    driveConfig: string;
    operationConfig: string;
    subUnits: { id: number; name: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true); // ローディング状態を追加
  const [showDriveConfigModal, setShowDriveConfigModal] = useState(false);
  const [showOperationConfigModal, setShowOperationConfigModal] =
    useState(false);
  const [showSubUnitModal, setShowSubUnitModal] = useState(false);

  useEffect(() => {
    const fetchUnit = async () => {
      const projects = await ProjectsDB.getAll();
      for (const project of projects) {
        const foundUnit = project.units.find((u) => u.id === Number(unitId));
        if (foundUnit) {
          setUnit(foundUnit);
          break;
        }
      }
      setLoading(false); // データ取得後にローディングを終了
    };
    fetchUnit();
  }, [unitId]);

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
          <button onClick={() => setShowDriveConfigModal(true)}>
            新規作成
          </button>
        </div>
        <div className="List">
          <div className="ListHeader">
            <span>駆動名</span>
          </div>
          <ul>
            <li>{unit.driveConfig}</li>
          </ul>
        </div>
      </div>

      <div className="DetailPage">
        <div className="Header">
          <h1>動作構成</h1>
          <button onClick={() => setShowOperationConfigModal(true)}>
            新規作成
          </button>
        </div>

        <div className="List">
          <div className="ListHeader">
            <span>動作名</span>
          </div>
          <ul>
            <li>{unit.operationConfig}</li>
          </ul>
        </div>
      </div>

      <div className="DetailPage">
        <div className="Header">
          <h1>サブユニット</h1>
          <button onClick={() => setShowSubUnitModal(true)}>新規作成</button>
        </div>
        <div className="List">
          <div className="ListHeader">
            <span>名前</span>
          </div>
          <ul>
            {unit.subUnits.map((subUnit) => (
              <li key={subUnit.id}>{subUnit.name}</li>
            ))}
          </ul>
        </div>
      </div>

      {showDriveConfigModal && (
        <div className="modal">
          <div className="modal-content">
            <span
              className="close"
              onClick={() => setShowDriveConfigModal(false)}
            >
              &times;
            </span>
            <h2>駆動構成の新規作成</h2>
            {/* フォーム内容 */}
          </div>
        </div>
      )}

      {showOperationConfigModal && (
        <div className="modal">
          <div className="modal-content">
            <span
              className="close"
              onClick={() => setShowOperationConfigModal(false)}
            >
              &times;
            </span>
            <h2>動作構成の新規作成</h2>
            {/* フォーム内容 */}
          </div>
        </div>
      )}

      {showSubUnitModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowSubUnitModal(false)}>
              &times;
            </span>
            <h2>サブユニットの新規作成</h2>
            {/* フォーム内容 */}
          </div>
        </div>
      )}
    </div>
  );
}
