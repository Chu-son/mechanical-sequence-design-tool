import { useState, useEffect, CSSProperties, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useGlobalFlag } from '../context/GlobalFlagContext';
import './Sidebar.css';
import DatabaseFactory from '../utils/DatabaseFactory';
import { Project, Unit, Config } from '../types/databaseTypes';

// ファクトリーからデータベースインスタンスを取得
const ProjectsDB = DatabaseFactory.createDatabase();

// 深さに応じたスタイルを動的に生成する関数
const getDepthStyles = (depth: number): CSSProperties => {
  // 基本的なインデント値（ピクセル単位）
  const baseIndent = 15;

  return {
    marginLeft: depth === 0 ? 0 : `${depth * baseIndent}px`,
    position: 'relative',
  };
};

// 深さに応じたインデントラインを表示するスタイルを生成
const getIndentLineStyles = (depth: number): CSSProperties => {
  if (depth === 0) return {};

  return {
    position: 'relative',
    '::before': {
      content: '""',
      position: 'absolute',
      left: '-10px',
      top: 0,
      bottom: 0,
      borderLeft: '1px solid #555',
      height: '100%',
    },
  } as CSSProperties;
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  // 折りたたみ状態を管理するための状態
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );

  const sidebarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // サイドバー外のクリックを検知する
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        isOpen &&
        !isPinned
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isPinned]);

  // ページ遷移時にサイドバーを閉じる（ピン留めしていない場合）
  useEffect(() => {
    if (!isPinned) {
      setIsOpen(false);
    }
  }, [location.pathname, isPinned]);

  useEffect(() => {
    const fetchCurrentProject = async () => {
      try {
        const data = await ProjectsDB.getAllProjects();
        const currentPath = location.pathname;
        const projectId = parseInt(currentPath.split('/')[2], 10); // Assuming URL structure includes project ID
        const currentProject = data.find((project) => project.id === projectId);

        if (currentProject) {
          setProjects([currentProject]);
          // デフォルトで全てのユニットを展開状態にする
          const expanded: Record<string, boolean> = {};
          currentProject.units.forEach((unit) => {
            expanded[`unit-${unit.id}`] = true;
            expanded[`drive-${unit.id}`] = true;
            expanded[`operation-${unit.id}`] = true;
            expanded[`subunits-${unit.id}`] = true;
          });
          setExpandedItems(expanded);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error('Failed to fetch current project:', error);
      }
    };

    fetchCurrentProject();
  }, [location]);

  // ピン留め状態を切り替える
  const togglePinned = () => {
    setIsPinned(!isPinned);
  };

  // アイテムの折りたたみ状態を切り替える関数
  const toggleExpand = (key: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 折りたたみアイコンのレンダリング
  const renderExpandIcon = (isExpanded: boolean) => {
    return <span className="expand-icon">{isExpanded ? '▼' : '►'}</span>;
  };

  const renderTree = (
    units: Unit[],
    parentId: number | null = null,
    depth = 0,
  ) => {
    const filteredUnits = units.filter((unit) => unit.parentId === parentId);
    if (filteredUnits.length === 0) return null;

    return (
      <ul className={`tree-level-${depth}`}>
        {filteredUnits.map((unit) => {
          const unitKey = `unit-${unit.id}`;
          const driveKey = `drive-${unit.id}`;
          const operationKey = `operation-${unit.id}`;
          const subunitsKey = `subunits-${unit.id}`;

          const childUnits = units.filter((u) => u.parentId === unit.id);
          const hasChildUnits = childUnits.length > 0;
          const hasDriveConfigs = unit.driveConfigs.length > 0;
          const hasOperationConfigs = unit.operationConfigs.length > 0;

          const isUnitExpanded = expandedItems[unitKey] !== false;
          const isDriveExpanded = expandedItems[driveKey] !== false;
          const isOperationExpanded = expandedItems[operationKey] !== false;
          const isSubunitsExpanded = expandedItems[subunitsKey] !== false;

          // 深さに応じたスタイルを動的に生成
          const depthStyles = getDepthStyles(depth);

          // CSS in JSではなくDOM要素に直接スタイルを適用するため、
          // ::beforeのような疑似要素を処理できない

          return (
            <li key={unit.id} className="tree-item" style={depthStyles}>
              {/* 縦線のための要素（深さが0以上の場合のみ表示） */}
              {depth > 0 && (
                <div
                  className="indent-line"
                  style={{
                    position: 'absolute',
                    left: '-10px',
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    height: '100%',
                    backgroundColor: '#555',
                  }}
                />
              )}

              <div className="tree-item-header">
                {(hasChildUnits || hasDriveConfigs || hasOperationConfigs) && (
                  <button
                    type="button"
                    className="toggle-button"
                    onClick={() => toggleExpand(unitKey)}
                  >
                    {renderExpandIcon(isUnitExpanded)}
                  </button>
                )}
                <Link
                  to={`/projects/${projects[0].id}/unit/${unit.id}`}
                  className="unit-link"
                >
                  {unit.name}
                </Link>
              </div>

              {isUnitExpanded && (
                <ul className="unit-contents">
                  {/* 駆動構成カテゴリ - 常に表示 */}
                  <li className="category-item" data-type="drive">
                    <div
                      className="category-header"
                      onClick={() => toggleExpand(driveKey)}
                    >
                      {renderExpandIcon(isDriveExpanded)}
                      <span>駆動構成</span>
                    </div>

                    {isDriveExpanded && hasDriveConfigs && (
                      <ul className="category-contents">
                        {unit.driveConfigs.map((config: Config) => (
                          <li
                            key={`drive-${config.id}`}
                            className="config-item"
                            data-type="drive"
                          >
                            <Link
                              to={`/projects/${projects[0].id}/unit/${unit.id}/flowchart/driveConfigs/${config.id}`}
                            >
                              {config.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    {isDriveExpanded && !hasDriveConfigs && (
                      <p className="empty-category-message">項目がありません</p>
                    )}
                  </li>

                  {/* 動作構成カテゴリ - 常に表示 */}
                  <li className="category-item" data-type="operation">
                    <div
                      className="category-header"
                      onClick={() => toggleExpand(operationKey)}
                    >
                      {renderExpandIcon(isOperationExpanded)}
                      <span>動作構成</span>
                    </div>

                    {isOperationExpanded && hasOperationConfigs && (
                      <ul className="category-contents">
                        {unit.operationConfigs.map((config: Config) => (
                          <li
                            key={`operation-${config.id}`}
                            className="config-item"
                            data-type="operation"
                          >
                            <Link
                              to={`/projects/${projects[0].id}/unit/${unit.id}/flowchart/operationConfigs/${config.id}`}
                            >
                              {config.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    {isOperationExpanded && !hasOperationConfigs && (
                      <p className="empty-category-message">項目がありません</p>
                    )}
                  </li>

                  {/* サブユニットカテゴリ - 常に表示 */}
                  <li className="category-item" data-type="subunit">
                    <div
                      className="category-header"
                      onClick={() => toggleExpand(subunitsKey)}
                    >
                      {renderExpandIcon(isSubunitsExpanded)}
                      <span>サブユニット</span>
                    </div>

                    {isSubunitsExpanded &&
                      hasChildUnits &&
                      renderTree(units, unit.id, depth + 1)}
                    {isSubunitsExpanded && !hasChildUnits && (
                      <p className="empty-category-message">項目がありません</p>
                    )}
                  </li>
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const { isSidebarVisible } = useGlobalFlag();

  if (!isSidebarVisible) {
    return null; // フラグが false の場合はレンダリングしない
  }

  return (
    <div
      ref={sidebarRef}
      className={`Sidebar ${isOpen ? 'open' : 'closed'} ${isPinned ? 'pinned' : ''}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="Hamburger"
        type="button"
        aria-label="サイドバーを切り替え"
      >
        ☰
      </button>

      {isOpen && (
        <button
          onClick={togglePinned}
          className={`pin-button ${isPinned ? 'pinned' : ''}`}
          type="button"
          aria-label={isPinned ? 'ピン留めを解除' : 'ピン留め'}
        >
          {isPinned ? '📌' : '📍'}
        </button>
      )}

      <nav className="sidebar-nav">
        {projects.length > 0 && (
          <div className="project-container">
            <h3 className="project-title">{projects[0].name}</h3>
            {renderTree(projects[0].units, null, 0)}
          </div>
        )}
      </nav>
    </div>
  );
}
