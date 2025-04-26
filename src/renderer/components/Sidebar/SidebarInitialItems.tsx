import { SidebarItem } from '@/renderer/components/Sidebar/types';
import ProjectContent from '@/renderer/components/Sidebar/ProjectContent';
import FlowchartNodeList, {
  useFlowchartNodeListEnabled,
} from '@/renderer/flowchart/components/FlowchartNodeList';
import { useLocation } from 'react-router-dom';

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
      isEnabled: () => true,
    },
    {
      id: 'flowchart-nodes',
      type: 'flowchart-nodes',
      title: 'フローチャート',
      icon: '🧩',
      content: <FlowchartNodeList />,
      isEnabled: useFlowchartNodeListEnabled,
      shouldAutoOpen: (location) => location.pathname.includes('/flowchart'),
      shouldAutoPin: (location) => location.pathname.includes('/flowchart'),
    },
  ];
};
