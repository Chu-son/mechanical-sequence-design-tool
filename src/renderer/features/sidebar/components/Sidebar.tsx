import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalFlag } from '@/renderer/context/GlobalFlagContext';
import useSidebarDragDrop from '@/renderer/hooks/useSidebarDragDrop';
import '@/renderer/styles/Sidebar.css';
import SidebarIcon from '@/renderer/features/sidebar/components/SidebarIcon';
import SidebarPanel from '@/renderer/features/sidebar/components/SidebarPanel';
import { getInitialItems } from '@/renderer/features/sidebar/components/SidebarInitialItems';

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState<string | null>(null); // 初期値で'projects'を選択
  const [isPinned, setIsPinned] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { isSidebarVisible } = useGlobalFlag();
  const location = useLocation();

  // 初期アイテムを取得
  const initialItems = getInitialItems();

  const {
    items: sidebarItems,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = useSidebarDragDrop(initialItems);

  // location.pathnameの変化時にshouldAutoOpen/shouldAutoPinを判定
  useEffect(() => {
    // すでにactiveItem/pinが正しい場合は何もしない
    const autoSidebarItem = sidebarItems.find(
      (sidebarItem) =>
        sidebarItem.shouldAutoOpen && sidebarItem.shouldAutoOpen(location),
    );
    if (autoSidebarItem) {
      let changed = false;
      if (activeItem !== autoSidebarItem.id) {
        setActiveItem(autoSidebarItem.id);
        changed = true;
      }
      if (
        !isPinned &&
        autoSidebarItem.shouldAutoPin &&
        autoSidebarItem.shouldAutoPin(location)
      ) {
        setIsPinned(true);
        changed = true;
      }
      // 自動展開時にもsidebar-changeイベントを必ず発火
      if (changed) {
        const event = new CustomEvent('sidebar-change', {
          detail: { isOpen: true },
        });
        window.dispatchEvent(event);
      }
    } else {
      // ピン留めされていなければサイドバーを閉じる
      if (!isPinned && activeItem !== null) {
        setActiveItem(null);
        const event = new CustomEvent('sidebar-change', {
          detail: { isOpen: false },
        });
        window.dispatchEvent(event);
      }
    }
  }, [location.pathname]);

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

  // サイドバーアイコンクリック時の処理
  const handleIconClick = (id: string) => {
    const newState = activeItem === id ? null : id;
    setActiveItem(newState);

    // パネルを閉じる場合はピン留めも解除
    if (newState === null && isPinned) {
      setIsPinned(false);
    }

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

  // アクティブなアイテムを取得
  const getActiveItem = () => {
    const found =
      sidebarItems.find((sidebarItem) => sidebarItem.id === activeItem) || null;
    return found;
  };

  if (!isSidebarVisible) {
    return null; // フラグがfalseの場合はレンダリングしない
  }

  return (
    <div
      className="sidebar-container"
      ref={sidebarRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* サイドバーアイコン領域 */}
      <div className="sidebar-icons">
        <div className="icons-container">
          {sidebarItems.map((item) => {
            // 各アイコンの有効/無効状態を判定関数から取得
            const isEnabled = item.isEnabled ? item.isEnabled(location) : true;

            return (
              <SidebarIcon
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
                disabled={!isEnabled}
                onClick={handleIconClick}
                onDragStart={handleDragStart}
              />
            );
          })}
        </div>
      </div>

      {/* サイドバーパネル領域 */}
      {activeItem && (
        <SidebarPanel
          isPinned={isPinned}
          togglePin={togglePin}
          activeItem={getActiveItem()}
        />
      )}
    </div>
  );
}
