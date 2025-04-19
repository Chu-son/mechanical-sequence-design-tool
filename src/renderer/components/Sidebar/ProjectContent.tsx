import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Project } from '@/renderer/types/databaseTypes';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import UnitItem from './items/UnitItem';

interface ProjectContentProps {
  projectId?: number; // 特定のプロジェクトIDを指定する場合（オプショナル）
}

const ProjectContent = ({ projectId }: ProjectContentProps) => {
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const projectsDB = DatabaseFactory.createDatabase();

  // 現在のページがプロジェクト一覧ページかどうか判定
  const isProjectsPage =
    location.pathname === '/' || location.pathname === '/projects';

  // すべてのプロジェクトの取得
  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        setIsLoading(true);
        const allProjects = await projectsDB.getAllProjects();
        setProjects(allProjects);

        // プロジェクト詳細ページの場合は特定のプロジェクトを取得
        if (!isProjectsPage) {
          fetchSpecificProject(allProjects);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('プロジェクト読み込みエラー:', error);
        setError('プロジェクトの読み込みに失敗しました');
        setIsLoading(false);
      }
    };

    fetchAllProjects();
  }, [isProjectsPage]);

  // 特定のプロジェクトデータの取得
  const fetchSpecificProject = async (availableProjects: Project[]) => {
    try {
      // URLからプロジェクトIDを取得するか、指定されたIDを使用
      let targetProjectId = projectId;

      if (!targetProjectId) {
        const currentPath = location.pathname;
        const matches = currentPath.match(/\/projects\/(\d+)/);
        targetProjectId = matches
          ? parseInt(matches[1], 10)
          : availableProjects.length > 0
            ? availableProjects[0].id
            : null;
      }

      if (targetProjectId && availableProjects.length > 0) {
        // 現在のプロジェクトをフィルタリング
        const currentProject =
          availableProjects.find((p) => p.id === targetProjectId) ||
          availableProjects[0];

        setProject(currentProject);

        // 展開状態の初期化
        const expanded: Record<string, boolean> = {};
        currentProject.units.forEach((unit) => {
          expanded[`unit-${unit.id}`] = true; // デフォルトですべて展開
          expanded[`drive-${unit.id}`] = true;
          expanded[`operation-${unit.id}`] = true;
          expanded[`subunits-${unit.id}`] = true;
        });
        setExpandedItems(expanded);
      } else {
        setError('プロジェクトが見つかりませんでした');
      }
    } catch (error) {
      console.error('プロジェクト読み込みエラー:', error);
      setError('プロジェクトの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 展開/折りたたみの切り替え処理
  const toggleExpand = (key: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (isLoading) {
    return (
      <div className="sidebar-project-content">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sidebar-project-content">
        <p>{error}</p>
      </div>
    );
  }

  // プロジェクト一覧ページの場合、プロジェクト選択を促す
  if (isProjectsPage) {
    return (
      <div className="sidebar-project-content">
        <h3>プロジェクト/ユニット</h3>
        <div className="project-selection-message">
          <p>プロジェクトを選択するとユニット一覧が表示されます</p>
          {projects.length > 0 ? (
            <ul className="sidebar-project-list">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link to={`/projects/${p.id}`}>{p.name}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>プロジェクトがありません</p>
          )}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="sidebar-project-content">
        <p>プロジェクトがロードされていません</p>
      </div>
    );
  }

  // プロジェクト詳細ページ以降の場合、ユニット一覧を表示
  // プロジェクトのルートユニットを取得
  const rootUnits = project.units.filter((unit) => !unit.parentId);

  return (
    <div className="sidebar-project-content">
      <h3>プロジェクト: {project.name}</h3>
      {rootUnits.length > 0 ? (
        <ul className="project-units">
          {rootUnits.map((unit) => (
            <UnitItem
              key={unit.id}
              unit={unit}
              depth={0}
              units={project.units}
              projectId={project.id}
              expandedItems={expandedItems}
              toggleExpand={toggleExpand}
            />
          ))}
        </ul>
      ) : (
        <p>ユニットがありません</p>
      )}
    </div>
  );
};

export default ProjectContent;
