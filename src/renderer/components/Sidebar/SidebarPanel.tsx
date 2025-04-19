import { SidebarItem } from '@/renderer/components/Sidebar/types';

interface SidebarPanelProps {
  activeItem: SidebarItem | null;
  isPinned: boolean;
  togglePin: () => void;
}

const SidebarPanel = ({
  activeItem,
  isPinned,
  togglePin,
}: SidebarPanelProps) => {
  if (!activeItem) return null;
  return (
    <div className={`sidebar-panel ${isPinned ? 'pinned' : ''}`}>
      <div className="sidebar-panel-header">
        <h3>{activeItem.title}</h3>
        <div className="sidebar-panel-controls">
          <button
            className={`pin-button ${isPinned ? 'pinned' : ''}`}
            onClick={togglePin}
            aria-label={isPinned ? 'ピン留めを解除' : 'ピン留めする'}
            title={isPinned ? 'ピン留めを解除' : 'ピン留めする'}
          >
            {isPinned ? '📌' : '📍'}
          </button>
        </div>
      </div>
      <div className="sidebar-panel-content">
        {activeItem.content ? (
          activeItem.content
        ) : (
          <p>コンテンツがありません</p>
        )}
      </div>
    </div>
  );
};

export default SidebarPanel;
