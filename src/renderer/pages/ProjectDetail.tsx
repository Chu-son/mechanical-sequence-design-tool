import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ProjectsDB } from '../utils/database';
import './ProjectDetail.css';
import '../styles/Common.css'; // 共通スタイルをインポート
import NewUnitModal from '../components/NewUnitModal';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const { projectId: stateProjectId } = location.state || {};
  const [project, setProject] = useState<{
    id: number;
    name: string;
    units: { id: number; name: string; parentId: number | null }[];
  } | null>(null);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      const data = await ProjectsDB.getById(Number(projectId));
      setProject(data);
    };
    fetchProject();
  }, [projectId]);

  const addUnit = async (name: string) => {
    if (project) {
      const newUnit = { id: Date.now(), name, parentId: null };
      const updatedProject = { ...project, units: [...project.units, newUnit] };
      await ProjectsDB.update(project.id, updatedProject);
      setProject(updatedProject);
    }
  };

  const getTopLevelUnits = (
    units: { id: number; name: string; parentId: number | null }[],
  ) => {
    return units.filter((unit) => unit.parentId === null);
  };

  if (!project) return <div>Loading...</div>;

  const topLevelUnits = getTopLevelUnits(project.units);

  return (
    <div className="DetailPage">
      <div className="Header">
        <h1>{project.name}</h1>
        <button type="button" onClick={() => setIsUnitModalOpen(true)}>
          新規作成
        </button>
      </div>
      <div className="List">
        <div className="ListHeader">
          <span>名前</span>
          <span>更新日時</span>
        </div>
        <ul>
          {topLevelUnits.map((unit) => (
            <li key={unit.id}>
              <span>
                <Link
                  to={`/unit/${unit.id}`}
                  state={{ projectId: stateProjectId, unitId: unit.id }}
                >
                  {unit.name}
                </Link>
              </span>
              <span>{new Date().toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
      <NewUnitModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        onSave={addUnit}
      />
    </div>
  );
}
