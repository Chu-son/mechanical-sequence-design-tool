import { useState, useEffect } from 'react';
import { ProjectsDB } from '../database';
import './Projects.css';

export default function Projects() {
  const [projects, setProjects] = useState<{ id: number; name: string; updatedAt: string }[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await ProjectsDB.getAll();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  const addProject = async () => {
    const newProjectName = prompt('新しいプロジェクト名を入力してください:');
    if (newProjectName) {
      const newProject = {
        id: Date.now(),
        name: newProjectName,
        updatedAt: new Date().toLocaleString(),
      };
      await ProjectsDB.create(newProject);
      setProjects([...projects, newProject]);
    }
  };

  return (
    <div className="Projects">
      <div className="ProjectsHeader">
        <h1>プロジェクト一覧</h1>
        <button onClick={addProject}>新規作成</button>
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
    </div>
  );
}
