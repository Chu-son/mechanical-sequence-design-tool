import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import {
  roundToDigits,
  ROUND_DIGITS,
} from '@/renderer/components/flowchart/common/flowchartUtils';

const simpleRotToRotConverterNodeDefinition: NodeDefinition = {
  type: 'simpleRotToRotConverter',
  title: 'Simple Rot To Rot Converter',
  groupTitles: {
    parameters: 'Parameters',
    warning: 'Warning',
    settings: 'Settings',
  },
  groupDisplayOptions: {
    parameters: { showTitle: true, showDivider: false },
    warning: { showTitle: false, showDivider: true },
    settings: { showTitle: true, showDivider: true },
  },
  handles: {
    target: true,
    source: true,
  },
  getInitialData: () => ({
    conversionFactor: 1,
    outputPrecision: ROUND_DIGITS,
    calculatedOutput: {
      output1: 0,
      isOverloaded: false,
    },
  }),
  fields: [
    {
      key: 'conversionFactor',
      label: 'Conversion Factor',
      type: 'number',
      defaultValue: 1,
      group: 'parameters',
      getValue: (data) => data?.conversionFactor ?? 1,
      setValue: (value, data) => ({
        ...data,
        conversionFactor: parseFloat(value) || 1,
      }),
    },
    {
      key: 'overloadWarning',
      label: '',
      type: 'custom',
      group: 'warning',
      render: (data) =>
        data?.calculatedOutput?.isOverloaded ? (
          <div className="warning">Warning: Torque exceeds maximum!</div>
        ) : null,
      condition: (data) => !!data?.calculatedOutput?.isOverloaded,
    },
    {
      key: 'outputPrecision',
      label: 'Output Precision',
      type: 'number',
      defaultValue: ROUND_DIGITS,
      group: 'settings',
      getValue: (data) => data?.outputPrecision ?? ROUND_DIGITS,
      setValue: (value, data) => ({
        ...data,
        outputPrecision: parseFloat(value) || ROUND_DIGITS,
      }),
    },
    {
      key: 'output1',
      label: 'Output 1',
      type: 'readonly',
      group: 'settings',
      getValue: (data) => data?.calculatedOutput?.output1 ?? 0,
      formatValue: (value, data) =>
        roundToDigits(value, data?.outputPrecision ?? ROUND_DIGITS).toString(),
    },
  ],
  compute: (data, nodeId, update) => {
    const { conversionFactor = 1, outputPrecision = ROUND_DIGITS } = data;
    const input1 = data.input1 ?? 0;
    const output1 = roundToDigits(input1 * conversionFactor, outputPrecision);
    const isOverloaded = false; // 必要に応じて条件を追加
    const calculatedOutput = { output1, isOverloaded };
    if (
      !data.calculatedOutput ||
      JSON.stringify(data.calculatedOutput) !== JSON.stringify(calculatedOutput)
    ) {
      update({ ...data, calculatedOutput });
    }
  },
};

export default simpleRotToRotConverterNodeDefinition;
