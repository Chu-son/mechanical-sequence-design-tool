import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useGlobalFlag } from '../context/GlobalFlagContext';
import './Sidebar.css';
import DatabaseFactory from '../utils/DatabaseFactory';
import { Project, Unit, Config } from '../types/databaseTypes';

// ファクトリーからデータベースインスタンスを取得
const ProjectsDB = DatabaseFactory.createDatabase();

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const location = useLocation();

  useEffect(() => {
    const fetchCurrentProject = async () => {
      try {
        const data = await ProjectsDB.getAllProjects();
        const currentPath = location.pathname;
        const projectId = parseInt(currentPath.split('/')[2], 10); // Assuming URL structure includes project ID
        const currentProject = data.find((project) => project.id === projectId);
        setProjects(currentProject ? [currentProject] : []);
      } catch (error) {
        console.error('Failed to fetch current project:', error);
      }
    };

    fetchCurrentProject();
  }, [location]);

  const renderTree = (units: Unit[], parentId: number | null = null) => {
    return (
      <ul>
        {units
          .filter((unit) => unit.parentId === parentId)
          .map((unit) => (
            <li key={unit.id}>
              <Link to={`/projects/${projects[0].id}/unit/${unit.id}`}>
                {unit.name}
              </Link>
              {renderTree(units, unit.id)}
              <ul>
                {unit.driveConfigs.map((config: Config) => (
                  <li key={`drive-${config.id}`}>
                    <Link
                      to={`/projects/${projects[0].id}/unit/${unit.id}/flowchart/driveConfigs/${config.id}`}
                    >
                      {config.label}
                    </Link>
                  </li>
                ))}
                {unit.operationConfigs.map((config: Config) => (
                  <li key={`operation-${config.id}`}>
                    <Link
                      to={`/projects/${projects[0].id}/unit/${unit.id}/flowchart/operationConfigs/${config.id}`}
                    >
                      {config.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
      </ul>
    );
  };

  const { isSidebarVisible } = useGlobalFlag();

  if (!isSidebarVisible) {
    return null; // フラグが false の場合はレンダリングしない
  }

  return (
    <div className={`Sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="Hamburger"
        type="button"
      >
        ☰
      </button>
      <nav>
        {projects.length > 0 && (
          <div>
            <h3>{projects[0].name}</h3>
            {renderTree(projects[0].units)}
          </div>
        )}
      </nav>
    </div>
  );
}
