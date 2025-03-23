import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectsDB } from '../database';
import './ProjectDetail.css';
import NewUnitModal from '../components/NewUnitModal';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<{
    id: number;
    name: string;
    units: { id: number; name: string }[];
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
      const newUnit = { id: Date.now(), name };
      const updatedProject = { ...project, units: [...project.units, newUnit] };
      await ProjectsDB.update(project.id, updatedProject);
      setProject(updatedProject);
    }
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="ProjectDetail">
      <div className="ProjectsHeader">
        <h1>{project.name}</h1>
        <button type="button" onClick={() => setIsUnitModalOpen(true)}>
          新規作成
        </button>
      </div>
      <div className="ProjectsList">
        <div className="ProjectsListHeader">
          <span>名前</span>
          <span>更新日時</span>
        </div>
        <ul>
          {project.units.map((unit) => (
            <li key={unit.id}>
              <span>{unit.name}</span>
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
