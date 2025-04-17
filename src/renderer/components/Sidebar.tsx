import {
  useState,
  useEffect,
  CSSProperties,
  useRef,
  ReactNode,
  DragEvent,
} from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useGlobalFlag } from '@/renderer/context/GlobalFlagContext';
import '@/renderer/components/Sidebar.css';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import { Project, Unit, Config } from '@/renderer/types/databaseTypes';

// ファクトリーからデータベースインスタンスを取得
const ProjectsDB = DatabaseFactory.createDatabase();

// アイテムタイプの定義
type SidebarItemType = 'project' | 'drive' | 'operation' | 'subunit';

// サイドバーアイテムインターフェース
interface SidebarItem {
  id: string;
  type: SidebarItemType;
  title: string;
  icon: string; // 絵文字アイコン
  content?: ReactNode;
  isOpen?: boolean;
}

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

// サイドバーアイコンコンポーネント
const SidebarIcon = ({
  item,
  isActive,
  onIconClick,
  onDragStart,
}: {
  item: SidebarItem;
  isActive: boolean;
  onIconClick: (id: string) => void;
  onDragStart: (e: DragEvent<HTMLDivElement>, item: SidebarItem) => void;
}) => {
  return (
    <div
      className={`sidebar-icon ${isActive ? 'active' : ''}`}
      onClick={() => onIconClick(item.id)}
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      data-type={item.type}
      title={item.title}
    >
      <span>{item.icon}</span>
    </div>
  );
};

// カテゴリコンポーネント - 駆動軸構成、動作シーケンス、サブユニットの共通表示部分
const CategoryItem = ({
  type,
  label,
  expandKey,
  isExpanded,
  hasItems,
  onToggle,
  children,
}: {
  type: SidebarItemType;
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
  type: SidebarItemType;
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
          {/* 駆動軸構成カテゴリ */}
          <CategoryItem
            type="drive"
            label="駆動軸構成"
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

          {/* 動作シーケンスカテゴリ */}
          <CategoryItem
            type="operation"
            label="動作シーケンス"
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

// サイドバーパネルコンポーネント
const SidebarPanel = ({
  activeItem,
  isPinned,
  onTogglePin,
  onDragOver,
  onDrop,
}: {
  activeItem: SidebarItem | null;
  isPinned: boolean;
  onTogglePin: () => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
}) => {
  if (!activeItem) return null;

  return (
    <div
      className={`sidebar-panel ${isPinned ? 'pinned' : ''}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="sidebar-panel-header">
        <h3>{activeItem.title}</h3>
        <div className="sidebar-panel-controls">
          <button
            className={`pin-button ${isPinned ? 'pinned' : ''}`}
            onClick={onTogglePin}
            aria-label={isPinned ? 'ピン留めを解除' : 'ピン留めする'}
            title={isPinned ? 'ピン留めを解除' : 'ピン留めする'}
          >
            {isPinned ? '📌' : '📍'}
          </button>
        </div>
      </div>
      <div className="sidebar-panel-content">{activeItem.content}</div>
    </div>
  );
};

export default function Sidebar() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [draggedItem, setDraggedItem] = useState<SidebarItem | null>(null);

  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { isSidebarVisible } = useGlobalFlag();

  // サイドバーアイテムの初期化
  useEffect(() => {
    // 初期のサイドバーアイテム設定
    const initialItems: SidebarItem[] = [
      {
        id: 'projects',
        type: 'project',
        title: 'プロジェクト/ユニット',
        icon: '📁',
        isOpen: false,
      },
      {
        id: 'drive',
        type: 'drive',
        title: '駆動軸構成',
        icon: '⚙️',
        isOpen: false,
      },
      {
        id: 'operation',
        type: 'operation',
        title: '動作シーケンス',
        icon: '▶️',
        isOpen: false,
      },
      {
        id: 'settings',
        type: 'subunit',
        title: '設定',
        icon: '🔧',
        isOpen: false,
      },
    ];

    setSidebarItems(initialItems);
  }, []);

  // 外部クリックで非ピン留めパネルを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isPinned &&
        activeItem &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setActiveItem(null);

        // サイドバー状態変更イベントを発火
        const changeEvent = new CustomEvent('sidebar-change', {
          detail: { isOpen: false },
        });
        window.dispatchEvent(changeEvent);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPinned, activeItem]);

  useEffect(() => {
    const fetchCurrentProject = async () => {
      try {
        const data = await ProjectsDB.getAllProjects();
        const currentPath = location.pathname;
        const projectId = parseInt(currentPath.split('/')[2], 10); // URL構造からプロジェクトIDを取得
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

          // プロジェクト用のコンテンツを更新
          updateProjectContent(currentProject);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error('Failed to fetch current project:', error);
      }
    };

    fetchCurrentProject();
  }, [location]);

  // プロジェクト用のコンテンツを更新
  const updateProjectContent = (project: Project) => {
    setSidebarItems((prev) =>
      prev.map((item) => {
        if (item.id === 'projects') {
          return {
            ...item,
            content: renderProjectTree(project),
          };
        }
        return item;
      }),
    );
  };

  // プロジェクトツリーのレンダリング
  const renderProjectTree = (project: Project) => {
    return (
      <div className="project-container">
        <h3 className="project-title">{project.name}</h3>
        {renderTree(project.units, null, 0)}
      </div>
    );
  };

  // ツリー構造のレンダリング
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
            projectId={projects[0]?.id}
            expandedItems={expandedItems}
            toggleExpand={toggleExpand}
          />
        ))}
      </ul>
    );
  };

  // アイテムの折りたたみ状態を切り替える関数
  const toggleExpand = (key: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // サイドバーアイコンクリック時の処理
  const handleIconClick = (id: string) => {
    const newState = activeItem === id ? null : id;
    setActiveItem(newState);

    // サイドバー状態変更イベントを発火
    const event = new CustomEvent('sidebar-change', {
      detail: { isOpen: newState !== null },
    });
    window.dispatchEvent(event);
  };

  // ピン留め状態の切り替え
  const togglePin = () => {
    setIsPinned(!isPinned);
  };

  // ドラッグ開始時の処理
  const handleDragStart = (e: DragEvent<HTMLDivElement>, item: SidebarItem) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // ドラッグオーバー時の処理
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // ドロップ時の処理
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!draggedItem) return;

    // ドラッグ中のアイテムの位置を取得
    const index = sidebarItems.findIndex((item) => item.id === draggedItem.id);

    // ドロップ先の位置を計算（シンプルな上から下への並び替えのみ）
    const dropY = e.clientY;
    const iconElements = document.querySelectorAll('.sidebar-icon');
    let dropIndex = sidebarItems.length;

    iconElements.forEach((icon, i) => {
      const rect = icon.getBoundingClientRect();
      const iconMiddle = rect.top + rect.height / 2;

      if (dropY < iconMiddle && i < dropIndex) {
        dropIndex = i;
      }
    });

    // 位置が変わらない場合は何もしない
    if (index === dropIndex) return;

    // アイテムを新しい位置に移動
    const newItems = [...sidebarItems];
    const [removed] = newItems.splice(index, 1);
    newItems.splice(dropIndex > index ? dropIndex - 1 : dropIndex, 0, removed);

    setSidebarItems(newItems);
    setDraggedItem(null);
  };

  // サイドバーを閉じる処理
  const handleClosePanel = () => {
    setActiveItem(null);

    // サイドバー状態変更イベントを発火
    const event = new CustomEvent('sidebar-change', {
      detail: { isOpen: false },
    });
    window.dispatchEvent(event);
  };

  // アクティブなアイテムを取得
  const getActiveItem = () => {
    return sidebarItems.find((item) => item.id === activeItem) || null;
  };

  if (!isSidebarVisible) {
    return null; // フラグがfalseの場合はレンダリングしない
  }

  return (
    <div className="sidebar-container" ref={sidebarRef}>
      {/* サイドバーアイコン領域 */}
      <div className="sidebar-icons">
        <div className="icons-container">
          {sidebarItems.map((item) => (
            <SidebarIcon
              key={item.id}
              item={item}
              isActive={activeItem === item.id}
              onIconClick={handleIconClick}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      </div>

      {/* サイドバーパネル */}
      <SidebarPanel
        activeItem={getActiveItem()}
        isPinned={isPinned}
        onTogglePin={togglePin}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />
    </div>
  );
}
