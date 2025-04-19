import { SidebarItem } from '@/renderer/components/Sidebar/types';
import ProjectContent from '@/renderer/components/Sidebar/ProjectContent';
import FlowchartNodeList, {
  useFlowchartNodeListEnabled,
} from '@/renderer/flowchart/components/FlowchartNodeList';

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
      // プロジェクトアイコンは常に有効
      isEnabled: () => true,
    },
    {
      id: 'flowchart-nodes',
      type: 'flowchart-nodes',
      title: 'フローチャート',
      icon: '🧩',
      content: <FlowchartNodeList />,
      isEnabled: useFlowchartNodeListEnabled,
    },
  ];
};
