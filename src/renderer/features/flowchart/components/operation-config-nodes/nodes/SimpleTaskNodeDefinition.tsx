import { TaskNodeData } from '@/renderer/features/flowchart/components/operation-config-nodes/common';
import { NodeDefinition } from '@/renderer/features/flowchart/components/base-nodes/types';
import {
  roundToDigits,
  validateNumericInput,
  ROUND_DIGITS,
} from '@/renderer/features/flowchart/utils/common/flowchartUtils';
import {
  PhysicalQuantityType,
  getUnitLabel,
} from '@/renderer/types/unitMappings';

const timeUnitLabel = getUnitLabel(PhysicalQuantityType.TIME);

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
      getValue: (data: any) => data.description,
      setValue: (value: any, data: any) => ({ ...data, description: value }),
    },
    {
      key: 'duration',
      label: `Duration [${timeUnitLabel}]`,
      type: 'number',
      group: 'parameters',
      getValue: (data: any) => data.duration,
      setValue: (value: any, data: any) => {
        const validated = validateNumericInput(value);
        return { ...data, duration: validated };
      },
      validation: (value: any) => {
        const v = validateNumericInput(value);
        return v < 0 ? '0以上で入力してください' : null;
      },
    },
    {
      key: 'totalDuration',
      label: `Total Duration [${timeUnitLabel}]`,
      type: 'readonly',
      group: 'results',
      getValue: (data: any) => data.totalDuration,
      formatValue: (v: any) => roundToDigits(v, ROUND_DIGITS).toString(),
    },
  ],
  compute: (data: any, nodeId: any, update: any) => {
    // 前ノードのtotalDurationを参照する場合は外部から渡す必要あり
    // ここではdurationのみでtotalDurationを計算
    const totalDuration = data.duration || 0;
    if (data.totalDuration !== totalDuration) {
      update({ ...data, totalDuration });
    }
  },
};

export default simpleTaskNodeDefinition;
