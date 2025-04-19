import { ReactNode } from 'react';
import { SidebarItem } from '@/renderer/components/Sidebar/types';
import ProjectContent from '@/renderer/components/Sidebar/ProjectContent';

// サイドバーの初期アイテム
export const getInitialItems = (): SidebarItem[] => {
  return [
    {
      id: 'projects',
      type: 'project',
      title: 'プロジェクト/ユニット',
      icon: '📁',
      isOpen: true,
      content: <ProjectContent />,
    },
  ];
};
