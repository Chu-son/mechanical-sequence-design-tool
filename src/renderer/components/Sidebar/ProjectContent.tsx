import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Project } from '@/renderer/types/databaseTypes';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import UnitItem from './items/UnitItem';

interface ProjectContentProps {
  projectId?: number; // 特定のプロジェクトIDを指定する場合（オプショナル）
}

const ProjectContent = ({ projectId }: ProjectContentProps) => {
  const [project, setProject] = useState<Project | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const projectsDB = DatabaseFactory.createDatabase();

  // プロジェクトデータの取得
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        // すべてのプロジェクトを取得
        const projects = await projectsDB.getAllProjects();
        console.log('ProjectContent: すべてのプロジェクト', projects);

        if (projects && projects.length > 0) {
          // URLからプロジェクトIDを取得するか、指定されたIDを使用
          let targetProjectId = projectId;

          if (!targetProjectId) {
            const currentPath = location.pathname;
            const matches = currentPath.match(/\/projects\/(\d+)/);
            targetProjectId = matches
              ? parseInt(matches[1], 10)
              : projects[0].id;
          }

          // 現在のプロジェクトをフィルタリング
          const currentProject =
            projects.find((p) => p.id === targetProjectId) || projects[0];

          console.log('ProjectContent: 現在のプロジェクト', currentProject);
          console.log('ProjectContent: ユニット一覧', currentProject.units);
          // 各ユニットの駆動軸構成と動作シーケンスをログに出力
          currentProject.units.forEach((unit) => {
            console.log(
              `ProjectContent: ユニット "${unit.name}" (ID: ${unit.id})`,
            );
            console.log('- driveConfigs:', unit.driveConfigs);
            console.log('- operationConfigs:', unit.operationConfigs);
          });

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

    fetchProject();
  }, [projectId, location.pathname]);

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

  if (!project) {
    return (
      <div className="sidebar-project-content">
        <p>プロジェクトがロードされていません</p>
      </div>
    );
  }

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
