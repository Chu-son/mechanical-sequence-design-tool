import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';

const taskStartNodeDefinition: NodeDefinition = {
  type: 'taskStart',
  title: 'Task Start',
  handles: {
    target: false,
    source: true,
  },
  groupTitles: {
    main: 'Start',
  },
  groupDisplayOptions: {
    main: { showTitle: false, showDivider: false },
  },
  fields: [],
};

export default taskStartNodeDefinition;
