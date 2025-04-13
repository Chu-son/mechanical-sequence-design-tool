import { useState, useEffect, CSSProperties, useRef, ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useGlobalFlag } from '@/renderer/context/GlobalFlagContext';
import '@/renderer/components/Sidebar.css';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import { Project, Unit, Config } from '@/renderer/types/databaseTypes';

// ファクトリーからデータベースインスタンスを取得
const ProjectsDB = DatabaseFactory.createDatabase();

// カテゴリタイプの定義
type CategoryType = 'drive' | 'operation' | 'subunit';

// 深さに応じたスタイルを動的に生成する関数
const getDepthStyles = (depth: number): CSSProperties => {
  // 基本的なインデント値（ピクセル単位）
  const baseIndent = 15;

  return {
    marginLeft: depth === 0 ? 0 : `${depth * baseIndent}px`,
    position: 'relative',
  };
};

// インデントラインのスタイルを生成する関数
const getIndentLineStyle = (): CSSProperties => ({
  position: 'absolute',
  left: '-10px',
  top: 0,
  bottom: 0,
  width: '1px',
  height: '100%',
  backgroundColor: '#555',
});

// 折りたたみアイコンを表示する共通コンポーネント
const ExpandIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <span className="expand-icon">{isExpanded ? '▼' : '►'}</span>
);

// カテゴリコンポーネント - 駆動構成、動作構成、サブユニットの共通表示部分
const CategoryItem = ({
  type,
  label,
  expandKey,
  isExpanded,
  hasItems,
  onToggle,
  children,
}: {
  type: CategoryType;
  label: string;
  expandKey: string;
  isExpanded: boolean;
  hasItems: boolean;
  onToggle: (key: string) => void;
  children: ReactNode;
}) => {
  return (
    <li className="category-item" data-type={type}>
      <div className="category-header" onClick={() => onToggle(expandKey)}>
        <ExpandIcon isExpanded={isExpanded} />
        <span>{label}</span>
      </div>

      {isExpanded && hasItems && (
        <ul className="category-contents">{children}</ul>
      )}
      {isExpanded && !hasItems && (
        <p className="empty-category-message">項目がありません</p>
      )}
    </li>
  );
};

// 設定項目を表示するコンポーネント
const ConfigItem = ({
  type,
  config,
  projectId,
  unitId,
  configType,
}: {
  type: CategoryType;
  config: Config;
  projectId: number;
  unitId: number;
  configType: string;
}) => {
  return (
    <li className="config-item" data-type={type}>
      <Link
        to={`/projects/${projectId}/unit/${unitId}/flowchart/${configType}/${config.id}`}
      >
        {config.label}
      </Link>
    </li>
  );
};

// ユニット項目を表示するコンポーネント
const UnitItem = ({
  unit,
  depth,
  units,
  projectId,
  expandedItems,
  toggleExpand,
}: {
  unit: Unit;
  depth: number;
  units: Unit[];
  projectId: number;
  expandedItems: Record<string, boolean>;
  toggleExpand: (key: string) => void;
}) => {
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

  return (
    <li className="tree-item" style={depthStyles}>
      {/* 縦線のための要素（深さが0以上の場合のみ表示） */}
      {depth > 0 && (
        <div className="indent-line" style={getIndentLineStyle()} />
      )}

      <div className="tree-item-header">
        <button
          type="button"
          className="toggle-button"
          onClick={() => toggleExpand(unitKey)}
        >
          <ExpandIcon isExpanded={isUnitExpanded} />
        </button>
        <Link
          to={`/projects/${projectId}/unit/${unit.id}`}
          className="unit-link"
        >
          {unit.name}
        </Link>
      </div>

      {isUnitExpanded && (
        <ul className="unit-contents">
          {/* 駆動構成カテゴリ */}
          <CategoryItem
            type="drive"
            label="駆動構成"
            expandKey={driveKey}
            isExpanded={isDriveExpanded}
            hasItems={hasDriveConfigs}
            onToggle={toggleExpand}
          >
            {unit.driveConfigs.map((config: Config) => (
              <ConfigItem
                key={`drive-${config.id}`}
                type="drive"
                config={config}
                projectId={projectId}
                unitId={unit.id}
                configType="driveConfigs"
              />
            ))}
          </CategoryItem>

          {/* 動作構成カテゴリ */}
          <CategoryItem
            type="operation"
            label="動作構成"
            expandKey={operationKey}
            isExpanded={isOperationExpanded}
            hasItems={hasOperationConfigs}
            onToggle={toggleExpand}
          >
            {unit.operationConfigs.map((config: Config) => (
              <ConfigItem
                key={`operation-${config.id}`}
                type="operation"
                config={config}
                projectId={projectId}
                unitId={unit.id}
                configType="operationConfigs"
              />
            ))}
          </CategoryItem>

          {/* サブユニットカテゴリ */}
          <CategoryItem
            type="subunit"
            label="サブユニット"
            expandKey={subunitsKey}
            isExpanded={isSubunitsExpanded}
            hasItems={hasChildUnits}
            onToggle={toggleExpand}
          >
            {childUnits.map((childUnit) => (
              <UnitItem
                key={childUnit.id}
                unit={childUnit}
                depth={depth + 1} // 親の深さに+1して子ユニットの深さを増加
                units={units}
                projectId={projectId}
                expandedItems={expandedItems}
                toggleExpand={toggleExpand}
              />
            ))}
          </CategoryItem>
        </ul>
      )}
    </li>
  );
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
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
          // デフォルトですべてのアイテムを折りたたむ
          const expanded: Record<string, boolean> = {};
          currentProject.units.forEach((unit) => {
            expanded[`unit-${unit.id}`] = false;
            expanded[`drive-${unit.id}`] = false;
            expanded[`operation-${unit.id}`] = false;
            expanded[`subunits-${unit.id}`] = false;
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

  const renderTree = (
    units: Unit[],
    parentId: number | null = null,
    depth = 0,
  ) => {
    const filteredUnits = units.filter((unit) => unit.parentId === parentId);
    if (filteredUnits.length === 0) return null;

    return (
      <ul className={`tree-level-${depth}`}>
        {filteredUnits.map((unit) => (
          <UnitItem
            key={unit.id}
            unit={unit}
            depth={depth}
            units={units}
            projectId={projects[0].id}
            expandedItems={expandedItems}
            toggleExpand={toggleExpand}
          />
        ))}
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
