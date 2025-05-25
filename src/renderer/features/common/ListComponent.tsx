import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactDOM from 'react-dom';
import '@/renderer/styles/Common.css';

// メニュー項目の型定義
export interface MenuItem {
  label: string;
  onClick: (itemId: number) => void;
  className?: string;
}

// リスト項目の型定義
export interface ListItemProps {
  id: number;
  columns: {
    content: ReactNode;
    width?: string;
    className?: string;
  }[];
  to?: string;
  onClick?: () => void;
}

// リストコンポーネントのプロパティ
interface ListComponentProps {
  headers: {
    label: string;
    width?: string;
    className?: string;
  }[];
  items: ListItemProps[];
  title?: string;
  onAddNew?: () => void;
  addButtonLabel?: string;
  menuItems?: MenuItem[]; // メニュー項目を追加
  menuColumnWidth?: string; // メニュー列の幅（デフォルト: 48px）
}

// メニューポップアップコンポーネント
interface MenuPopupProps {
  x: number;
  y: number;
  itemId: number;
  menuItems: MenuItem[];
  onClose: () => void;
}

// メニューポップアップ（ReactPortalで描画）
const MenuPopup: React.FC<MenuPopupProps> = ({
  x,
  y,
  itemId,
  menuItems,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // メニュー項目クリック
  const handleMenuItemClick = (menuItem: MenuItem) => {
    menuItem.onClick(itemId);
    onClose();
  };

  // bodyにポータルとして描画
  return ReactDOM.createPortal(
    <div
      className="list-menu-popup-portal"
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${y}px`,
        left: `${x}px`,
        zIndex: 9999,
      }}
    >
      <ul className="list-menu-items">
        {menuItems.map((menuItem, index) => (
          <li
            key={`menu-item-${index}`}
            className={`list-menu-item ${menuItem.className || ''}`}
            onClick={() => handleMenuItemClick(menuItem)}
          >
            {menuItem.label}
          </li>
        ))}
      </ul>
    </div>,
    document.body,
  );
};

// 共通リストコンポーネント
const ListComponent: React.FC<ListComponentProps> = ({
  headers,
  items,
  title,
  onAddNew,
  addButtonLabel = '新規作成',
  menuItems,
  menuColumnWidth = '48px',
}) => {
  // メニュー表示状態の管理
  const [menuPosition, setMenuPosition] = useState<{
    id: number;
    x: number;
    y: number;
  } | null>(null);

  // menuItemsが存在する場合は、自動的にメニュー列を追加する
  const hasMenu = menuItems && menuItems.length > 0;

  // ヘッダーにメニュー列を追加（menuItemsがある場合のみ）
  const displayHeaders = hasMenu
    ? [...headers, { label: '', width: menuColumnWidth }]
    : headers;

  // 固定幅が指定されていない場合は均等に配分
  const columnWidths = displayHeaders.map(
    (header) => header.width || `${100 / displayHeaders.length}%`,
  );

  // メニューを閉じる
  const closeMenu = () => {
    setMenuPosition(null);
  };

  // メニューの開閉を切り替え
  const toggleMenu = (itemId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // 親要素のクリックイベントを阻止

    if (menuPosition && menuPosition.id === itemId) {
      closeMenu();
    } else {
      // クリック位置を基準にメニューを表示
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setMenuPosition({
        id: itemId,
        x: rect.left,
        y: rect.bottom,
      });
    }
  };

  // メニュートグルボタンをレンダリング
  const renderMenuToggle = (itemId: number) => {
    if (!hasMenu) return null;

    return (
      <button
        className="list-menu-toggle"
        onClick={(e) => toggleMenu(itemId, e)}
        aria-label="メニューを開く"
      >
        ⋮
      </button>
    );
  };

  // カラムをレンダリング（メニュー列を自動追加）
  const renderColumns = (item: ListItemProps, isLink: boolean = false) => {
    // 通常の列を描画
    const columns = item.columns.map((column, colIndex) => (
      <span
        key={`col-${item.id}-${colIndex}`}
        style={{
          width:
            columnWidths[
              colIndex < columnWidths.length
                ? colIndex
                : columnWidths.length - 1
            ],
        }}
        className={`list-column ${column.className || ''}`}
      >
        {column.content}
      </span>
    ));

    // メニュー列が必要なら追加
    if (hasMenu) {
      columns.push(
        <span
          key={`col-menu-${item.id}`}
          style={{ width: menuColumnWidth }}
          className="list-column"
          onClick={(e) => (isLink ? null : e.stopPropagation())}
        >
          {renderMenuToggle(item.id)}
        </span>,
      );
    }

    return columns;
  };

  return (
    <div className="DetailPage">
      {(title || onAddNew) && (
        <div className="Header">
          {title && <h1>{title}</h1>}
          {onAddNew && (
            <button className="app-button" type="button" onClick={onAddNew}>
              {addButtonLabel}
            </button>
          )}
        </div>
      )}
      <div className="List">
        <div className="ListHeader">
          {displayHeaders.map((header, headerIndex) => (
            <span
              key={`header-${headerIndex}`}
              style={{ width: columnWidths[headerIndex] }}
              className={`list-column ${header.className || ''}`}
            >
              {header.label}
            </span>
          ))}
        </div>
        <ul className="ListItems">
          {items.map((item) => {
            // リンクとしてレンダリングする場合
            if (item.to) {
              return (
                <li key={`item-${item.id}`}>
                  <Link to={item.to} className="list-row">
                    {renderColumns(item, true)}
                  </Link>
                </li>
              );
            }

            // onClick イベントがある場合
            if (item.onClick) {
              return (
                <li
                  key={`item-${item.id}`}
                  onClick={item.onClick}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && item.onClick && item.onClick()
                  }
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="list-row">{renderColumns(item)}</div>
                </li>
              );
            }

            // 通常の項目
            return (
              <li key={`item-${item.id}`}>
                <div className="list-row">{renderColumns(item)}</div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* メニューポップアップ（body直下にポータルとして描画） */}
      {menuPosition && menuItems && (
        <MenuPopup
          x={menuPosition.x}
          y={menuPosition.y}
          itemId={menuPosition.id}
          menuItems={menuItems}
          onClose={closeMenu}
        />
      )}
    </div>
  );
};

export default ListComponent;
