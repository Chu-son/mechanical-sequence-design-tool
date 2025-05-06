import ProjectContent from '@/renderer/components/Sidebar/ProjectContent';
import FlowchartNodeList from '@/renderer/components/flowchart/components/sidebar/FlowchartNodeList';
import { SidebarItem } from '@/renderer/components/Sidebar/types';
import { Link } from 'react-router-dom';
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
      isEnabled: (location) => location.pathname.includes('/flowchart'),
      shouldAutoOpen: (location) => location.pathname.includes('/flowchart'),
      shouldAutoPin: (location) => location.pathname.includes('/flowchart'),
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
