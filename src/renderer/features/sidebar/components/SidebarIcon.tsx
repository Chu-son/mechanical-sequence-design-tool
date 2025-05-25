import { DragEvent } from 'react';
import { SidebarItem } from '@/renderer/components/Sidebar/types';

interface SidebarIconProps {
  item: SidebarItem;
  isActive: boolean;
  disabled?: boolean; // アイコンを無効化するためのプロパティ
  onClick: (id: string) => void;
  onDragStart: (e: DragEvent<HTMLDivElement>, item: SidebarItem) => void;
}

const SidebarIcon = ({
  item,
  isActive,
  disabled = false, // デフォルトは無効化しない
  onClick,
  onDragStart,
}: SidebarIconProps) => {
  // ドラッグ開始ハンドラー
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (disabled) return; // 無効化されている場合はドラッグ不可
    onDragStart(e, item);
    // ドラッグ中のスタイルを適用
    e.currentTarget.classList.add('dragging');
  };

  // ドラッグ終了時にスタイルを元に戻す
  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('dragging');
  };

  // クリックハンドラー
  const handleClick = () => {
    if (disabled) return; // 無効化されている場合はクリック不可
    onClick(item.id);
  };

  return (
    <div
      className={`sidebar-icon ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-type={item.type}
      title={disabled ? `${item.title}（無効）` : item.title}
    >
      <span>{item.icon}</span>
    </div>
  );
};

export default SidebarIcon;
