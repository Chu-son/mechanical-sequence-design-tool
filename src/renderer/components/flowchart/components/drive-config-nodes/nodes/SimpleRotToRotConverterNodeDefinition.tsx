import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import {
  roundToDigits,
  ROUND_DIGITS,
} from '@/renderer/components/flowchart/common/flowchartUtils';

const simpleRotToRotConverterNodeDefinition: NodeDefinition = {
  type: 'simpleRotToRotConverter',
  name: 'Simple Rot To Rot Converter',
  description: 'Converts rotation from one form to another',
  category: 'conversion',
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
  inputs: [
    {
      key: 'input1',
      label: 'Input 1',
      type: 'number',
    },
  ],
  outputs: [
    {
      key: 'output1',
      label: 'Output 1',
      type: 'number',
    },
  ],
  fields: [
    {
      key: 'conversionFactor',
      label: 'Conversion Factor',
      type: 'number',
      default: 1,
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
      default: ROUND_DIGITS,
      group: 'settings',
      formatter: (value) => roundToDigits(value, ROUND_DIGITS),
      getValue: (data) => data?.outputPrecision ?? ROUND_DIGITS,
      setValue: (value, data) => ({
        ...data,
        outputPrecision: parseFloat(value) || ROUND_DIGITS,
      }),
    },
  ],
  calculate: (data) => {
    // calculation logic
  },
};

export default simpleRotToRotConverterNodeDefinition;
