import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import {
  roundToDigits,
  ROUND_DIGITS,
} from '@/renderer/components/flowchart/common/flowchartUtils';

const simpleLinToRotConverterNodeDefinition: NodeDefinition = {
  type: 'simpleLinToRotConverter',
  name: 'Simple Linear to Rotational Converter',
  description: 'Converts simple linear motion to rotational motion.',
  groupTitles: {
    parameters: 'Parameters',
    results: 'Results',
    warning: 'Warning',
  },
  groupDisplayOptions: {
    parameters: { showTitle: true, showDivider: false },
    results: { showTitle: true, showDivider: true },
    warning: { showTitle: false, showDivider: true },
  },
  fields: [
    {
      key: 'inputValue',
      label: 'Input Value',
      type: 'number',
      min: 0,
      max: 100,
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data?.inputValue ?? 0,
      setValue: (value, data) => ({
        ...data,
        inputValue: parseFloat(value) || 0,
      }),
    },
    {
      key: 'conversionFactor',
      label: 'Conversion Factor',
      type: 'number',
      min: 0,
      max: 10,
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data?.conversionFactor ?? 0,
      setValue: (value, data) => ({
        ...data,
        conversionFactor: parseFloat(value) || 0,
      }),
    },
    {
      key: 'outputValue',
      label: 'Output Value',
      type: 'number',
      min: 0,
      max: 1000,
      step: 1,
      group: 'results',
      calculate: (data) => {
        const inputValue = data?.inputValue || 0;
        const conversionFactor = data?.conversionFactor || 0;
        return roundToDigits(inputValue * conversionFactor, ROUND_DIGITS);
      },
      getValue: (data) => {
        const inputValue = data?.inputValue || 0;
        const conversionFactor = data?.conversionFactor || 0;
        return roundToDigits(inputValue * conversionFactor, ROUND_DIGITS);
      },
      setValue: (value) => ({}), // 読み取り専用フィールド
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
  ],
};

export default simpleLinToRotConverterNodeDefinition;
