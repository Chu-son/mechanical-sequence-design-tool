import { DragEvent } from 'react';
import { SidebarItem } from './types';

interface SidebarIconProps {
  item: SidebarItem;
  isActive: boolean;
  onClick: (id: string) => void;
  onDragStart: (e: DragEvent<HTMLDivElement>, item: SidebarItem) => void;
}

const SidebarIcon = ({
  item,
  isActive,
  onClick,
  onDragStart,
}: SidebarIconProps) => {
  // ドラッグ開始ハンドラー
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    onDragStart(e, item);
    // ドラッグ中のスタイルを適用
    e.currentTarget.classList.add('dragging');
  };

  // ドラッグ終了時にスタイルを元に戻す
  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('dragging');
  };

  return (
    <div
      className={`sidebar-icon ${isActive ? 'active' : ''}`}
      onClick={() => onClick(item.id)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-type={item.type}
      title={item.title}
    >
      <span>{item.icon}</span>
    </div>
  );
};

export default SidebarIcon;
