import { useState, useEffect } from 'react';
import { ProjectsDB } from '../database';
import NewProjectModal from '../components/NewProjectModal';
import './Projects.css';

export default function Projects() {
  const [projects, setProjects] = useState<{ id: number; name: string; updatedAt: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await ProjectsDB.getAll();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  const addProject = async (name: string) => {
    const newProject = {
      id: Date.now(),
      name,
      updatedAt: new Date().toLocaleString(),
    };
    await ProjectsDB.create(newProject);
    setProjects([...projects, newProject]);
  };

  return (
    <div className="Projects">
      <div className="ProjectsHeader">
        <h1>プロジェクト一覧</h1>
        <button onClick={() => setIsModalOpen(true)}>新規作成</button>
      </div>
      <div className="ProjectsList">
        <div className="ProjectsListHeader">
          <span>名前</span>
          <span>更新日時</span>
        </div>
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <span>{project.name}</span>
              <span>{project.updatedAt}</span>
            </li>
          ))}
        </ul>
      </div>
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addProject}
      />
    </div>
  );
}
