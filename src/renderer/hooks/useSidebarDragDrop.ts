import { useState, DragEvent } from 'react';
import { SidebarItem } from '@/renderer/components/Sidebar/types';

/**
 * サイドバーのドラッグアンドドロップ機能を提供するカスタムフック
 */
export default function useSidebarDragDrop(initialItems: SidebarItem[]) {
  const [items, setItems] = useState<SidebarItem[]>(initialItems);
  const [draggedItem, setDraggedItem] = useState<SidebarItem | null>(null);

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
    const index = items.findIndex((item) => item.id === draggedItem.id);

    // ドロップ先の位置を計算（シンプルな上から下への並び替えのみ）
    const dropY = e.clientY;
    const iconElements = document.querySelectorAll('.sidebar-icon');
    let dropIndex = items.length;

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
    const newItems = [...items];
    const [removed] = newItems.splice(index, 1);
    newItems.splice(dropIndex > index ? dropIndex - 1 : dropIndex, 0, removed);

    setItems(newItems);
    setDraggedItem(null);
  };

  return {
    items,
    setItems,
    draggedItem,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
}
