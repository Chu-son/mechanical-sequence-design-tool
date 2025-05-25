import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';

const taskEndNodeDefinition: NodeDefinition = {
  type: 'taskEnd',
  title: 'Task End',

  groupTitles: {
    output: 'Output',
  },
  groupDisplayOptions: {
    output: { showTitle: true, showDivider: true },
  },

  handles: {
    target: true,
    source: false,
  },
  // 前段ノードから伝播するフィールド
  propagateFields: { totalDuration: 'totalDuration' },
  fields: [
    {
      key: 'totalDuration',
      label: 'Total Duration [sec]',
      type: 'readonly',
      group: 'output',
      getValue: (data) => data.totalDuration ?? 0,
      formatValue: (value) => value?.toString() ?? '',
    },
  ],
  getInitialData: () => ({
    totalDuration: 0,
  }),
};

export default taskEndNodeDefinition;
