import { TaskNodeData } from '@/renderer/components/flowchart/components/operation-config-nodes/common';
import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import {
  roundToDigits,
  validateNumericInput,
  ROUND_DIGITS,
} from '@/renderer/components/flowchart/common/flowchartUtils';

const simpleTaskNodeDefinition: NodeDefinition = {
  type: 'task',
  title: 'Simple Task',
  groupTitles: {
    parameters: 'Parameters',
    results: 'Results',
  },
  groupDisplayOptions: {
    parameters: { showTitle: true, showDivider: false },
    results: { showTitle: true, showDivider: true },
  },
  // 前段ノードから伝播するフィールド
  propagateFields: { totalDuration: 'previousTotalDuration' },
  getInitialData: () => ({
    description: '',
    duration: 0,
    totalDuration: 0,
  }),
  fields: [
    {
      key: 'description',
      label: 'Description',
      type: 'text',
      group: 'parameters',
      getValue: (data) => data.description,
      setValue: (value, data) => ({ ...data, description: value }),
    },
    {
      key: 'duration',
      label: 'Duration [sec]',
      type: 'number',
      group: 'parameters',
      getValue: (data) => data.duration,
      setValue: (value, data) => {
        const validated = validateNumericInput(value);
        return { ...data, duration: validated };
      },
      validation: (value) => {
        const v = validateNumericInput(value);
        return v < 0 ? '0以上で入力してください' : null;
      },
    },
    {
      key: 'totalDuration',
      label: 'Total Duration [sec]',
      type: 'readonly',
      group: 'results',
      getValue: (data) => data.totalDuration,
      formatValue: (v) => roundToDigits(v, ROUND_DIGITS).toString(),
    },
  ],
  compute: (data, nodeId, update) => {
    // 前ノードのtotalDurationを参照する場合は外部から渡す必要あり
    // ここではdurationのみでtotalDurationを計算
    const totalDuration = data.duration || 0;
    if (data.totalDuration !== totalDuration) {
      update({ ...data, totalDuration });
    }
  },
};

export default simpleTaskNodeDefinition;
