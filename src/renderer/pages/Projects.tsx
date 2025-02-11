import { useState } from 'react';
import './Projects.css';

export default function Projects() {
  const [projects, setProjects] = useState<{ name: string; updatedAt: string }[]>([]);

  const addProject = () => {
    const newProject = prompt('新しいプロジェクト名を入力してください:');
    if (newProject) {
      const updatedAt = new Date().toLocaleString();
      setProjects([...projects, { name: newProject, updatedAt }]);
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
          {projects.map((project, index) => (
            <li key={index}>
              <span>{project.name}</span>
              <span>{project.updatedAt}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
