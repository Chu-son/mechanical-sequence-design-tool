import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import DatabaseFactory from '../utils/DatabaseFactory';
import './ProjectDetail.css';
import '../styles/Common.css'; // 共通スタイルをインポート
import ListComponent from '../components/common/ListComponent';

const ProjectsDB = DatabaseFactory.createDatabase();

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const stateProjectId = location.state?.projectId || projectId;
  const [project, setProject] = useState<{
    id: number;
    name: string;
    units: { id: number; name: string; parentId: number | null }[];
    updatedAt: string; // updatedAt フィールドを追加
  } | null>(null);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      const data = await ProjectsDB.getProjectById({
        projectId: Number(projectId),
      });
      setProject(data);
    };
    fetchProject();
  }, [projectId]);

  const handleAddUnit = () => {
    // モーダルを表示する
    setIsUnitModalOpen(true);
  };

  const getTopLevelUnits = (
    units: { id: number; name: string; parentId: number | null }[],
  ) => {
    return units.filter((unit) => unit.parentId === null);
  };

  if (!project) return <div>Loading...</div>;

  const topLevelUnits = getTopLevelUnits(project.units);

  return (
    <>
      <ListComponent
        title={project.name}
        onAddNew={handleAddUnit}
        headers={[{ label: '名前' }, { label: '更新日時' }]}
        items={topLevelUnits.map((unit) => ({
          id: unit.id,
          to: `/projects/${stateProjectId}/unit/${unit.id}`,
          columns: [
            { content: unit.name },
            { content: project.updatedAt || new Date().toLocaleString() },
          ],
        }))}
        addButtonLabel="新規作成"
      />

      {/* モーダルは他のコンポーネントで実装する必要がある */}
      {isUnitModalOpen && (
        <div>
          {/* モーダル内容 */}
          <button onClick={() => setIsUnitModalOpen(false)}>閉じる</button>
        </div>
      )}
    </>
  );
}
