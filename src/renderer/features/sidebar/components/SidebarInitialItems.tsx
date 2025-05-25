import ProjectContent from '@/renderer/features/sidebar/components/ProjectContent';
import FlowchartNodeList from '@/renderer/features/flowchart/components/sidebar/FlowchartNodeList';
import { Link } from 'react-router-dom';
import { SidebarItem } from '@/renderer/features/sidebar/components/types';
import PartsManagementContent from './items/PartsManagementContent';

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
    {
      id: 'flowchart-nodes',
      type: 'flowchart-nodes',
      title: 'フローチャート',
      icon: '🧩',
      content: <FlowchartNodeList />,
      isEnabled: (location: any) => location.pathname.includes('/flowchart'),
      shouldAutoOpen: (location: any) =>
        location.pathname.includes('/flowchart'),
      shouldAutoPin: (location: any) =>
        location.pathname.includes('/flowchart'),
    },
    {
      id: 'parts-management',
      type: 'parts-management',
      title: '駆動部品管理',
      icon: '⚙️',
      content: <PartsManagementContent />,
    },
  ];
};
