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
};

export default taskEndNodeDefinition;
