import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import {
  roundToDigits,
  ROUND_DIGITS,
} from '@/renderer/components/flowchart/common/flowchartUtils';

const simpleRotToLinConverterNodeDefinition: NodeDefinition = {
  type: 'simpleRotToLinConverter',
  title: 'Simple Rotational to Linear Converter',
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
  handles: {
    target: true,
    source: true,
  },
  getInitialData: () => ({
    rotationalInput: 0,
    conversionFactor: 1,
    linearOutput: 0,
    calculatedOutput: {
      linearOutput: 0,
      isOverloaded: false,
    },
    description: '',
    additionalInfo: '',
  }),
  fields: [
    {
      key: 'rotationalInput',
      label: 'Rotational Input [RPM]',
      type: 'number',
      unit: 'RPM',
      group: 'parameters',
      getValue: (data) => data?.rotationalInput ?? 0,
      setValue: (value, data) => ({
        ...data,
        rotationalInput: parseFloat(value) || 0,
      }),
    },
    {
      key: 'conversionFactor',
      label: 'Conversion Factor',
      type: 'number',
      group: 'parameters',
      getValue: (data) => data?.conversionFactor ?? 1,
      setValue: (value, data) => ({
        ...data,
        conversionFactor: parseFloat(value) || 1,
      }),
    },
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
      key: 'linearOutput',
      label: 'Linear Output [m/s]',
      type: 'readonly',
      unit: 'm/s',
      group: 'notes',
      getValue: (data) => data?.calculatedOutput?.linearOutput ?? 0,
      formatValue: (value, data) =>
        roundToDigits(value, data?.outputPrecision ?? ROUND_DIGITS).toString(),
    },
    {
      key: 'additionalInfo',
      label: 'Additional Info',
      type: 'text',
      group: 'notes',
      getValue: (data) => data?.additionalInfo ?? '',
      setValue: (value, data) => ({ ...data, additionalInfo: value }),
    },
  ],
  compute: (data, nodeId, update) => {
    const { rotationalInput = 0, conversionFactor = 1 } = data;
    const linearOutput = roundToDigits(
      (rotationalInput * conversionFactor) / 60,
      ROUND_DIGITS,
    );
    const isOverloaded = linearOutput > 100; // 仮の例
    const calculatedOutput = { linearOutput, isOverloaded };
    if (
      !data.calculatedOutput ||
      JSON.stringify(data.calculatedOutput) !== JSON.stringify(calculatedOutput)
    ) {
      update({ ...data, calculatedOutput });
    }
  },
};

export default simpleRotToLinConverterNodeDefinition;
