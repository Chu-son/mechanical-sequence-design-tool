import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DatabaseFactory from '../utils/DatabaseFactory';
import NewProjectModal from '../components/NewProjectModal';
import './Projects.css';
import { useGlobalFlag } from '../context/GlobalFlagContext';
import '../styles/Common.css'; // 共通スタイルをインポート

const ProjectsDB = DatabaseFactory.createDatabase();

export default function Projects() {
  const [projects, setProjects] = useState<
    { id: number; name: string; updatedAt: string }[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { setSidebarVisibility } = useGlobalFlag();

  useEffect(() => {
    setSidebarVisibility(false); // Sidebar を非表示に設定
    const fetchProjects = async () => {
      const data = await ProjectsDB.getAllProjects();
      setProjects(data);
    };
    fetchProjects();
    return () => {
      setSidebarVisibility(true); // クリーンアップ時に Sidebar を再表示
    };
  }, [setSidebarVisibility]);

  const addProject = async (name: string) => {
    const newProject = {
      id: Date.now(),
      name,
      updatedAt: new Date().toLocaleString(),
    };
    await ProjectsDB.createProject(newProject);
    setProjects([...projects, newProject]);
  };

  return (
    <div className="DetailPage">
      <div className="Header">
        <h1>プロジェクト一覧</h1>
        <button type="button" onClick={() => setIsModalOpen(true)}>
          新規作成
        </button>
      </div>
      <div className="List">
        <div className="ListHeader">
          <span>名前</span>
          <span>更新日時</span>
        </div>
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <Link to={`/projects/${project.id}`}>
                <span>{project.name}</span>
                <span>{project.updatedAt}</span>
              </Link>
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
