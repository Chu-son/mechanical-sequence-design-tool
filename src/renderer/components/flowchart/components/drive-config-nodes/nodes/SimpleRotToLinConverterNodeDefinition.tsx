import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import {
  roundToDigits,
  ROUND_DIGITS,
} from '@/renderer/components/flowchart/common/flowchartUtils';

const simpleRotToLinConverterNodeDefinition: NodeDefinition = {
  type: 'simpleRotToLinConverter',
  name: 'Simple Rotational to Linear Converter',
  description: 'Converts rotational motion to linear motion.',
  category: 'mechanical',
  groupTitles: {
    parameters: 'Parameters',
    warning: 'Warning',
    notes: 'Notes',
  },
  groupDisplayOptions: {
    parameters: { showTitle: true, showDivider: false },
    warning: { showTitle: false, showDivider: true },
    notes: { showTitle: true, showDivider: true },
  },
  inputs: [
    {
      key: 'rotationalInput',
      label: 'Rotational Input [RPM]',
      type: 'number',
      unit: 'RPM',
    },
    {
      key: 'conversionFactor',
      label: 'Conversion Factor [N/A]',
      type: 'number',
      unit: 'N/A',
    },
  ],
  outputs: [
    {
      key: 'linearOutput',
      label: 'Linear Output [m/s]',
      type: 'number',
      unit: 'm/s',
    },
    {
      key: 'calculatedOutput',
      label: 'Calculated Output',
      type: 'json',
    },
  ],
  fields: [
    {
      key: 'description',
      label: 'Description',
      type: 'text',
      group: 'parameters',
      getValue: (data) => data?.description ?? '',
      setValue: (value, data) => ({ ...data, description: value }),
    },
    {
      key: 'overloadWarning',
      label: '',
      type: 'custom',
      group: 'warning',
      render: (data) =>
        data?.calculatedOutput?.isOverloaded ? (
          <div className="warning">
            Warning: Force or speed exceeds maximum!
          </div>
        ) : null,
      condition: (data) => !!data?.calculatedOutput?.isOverloaded,
    },
    {
      key: 'additionalInfo',
      label: 'Additional Info',
      type: 'textarea',
      group: 'notes',
      getValue: (data) => data?.additionalInfo ?? '',
      setValue: (value, data) => ({ ...data, additionalInfo: value }),
    },
  ],
  calculate: (inputs) => {
    const { rotationalInput, conversionFactor } = inputs;
    const linearOutput = roundToDigits(
      (rotationalInput * conversionFactor) / 60,
      ROUND_DIGITS,
    );
    return {
      linearOutput,
      isOverloaded: linearOutput > 100, // example overload condition
    };
  },
};

export default simpleRotToLinConverterNodeDefinition;
