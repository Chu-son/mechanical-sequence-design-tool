import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import {
  roundToDigits,
  ROUND_DIGITS,
} from '@/renderer/components/flowchart/common/flowchartUtils';

const simpleLinToLinConverterNodeDefinition: NodeDefinition = {
  type: 'simpleLinToLinConverter',
  name: '単純直線変換器',
  icon: 'line',
  group: 'basic',
  version: 1,
  description: '入力信号を単純に直線的に変換します。',
  groupTitles: {
    parameters: 'Parameters',
    description: 'Description',
  },
  groupDisplayOptions: {
    parameters: { showTitle: true, showDivider: false },
    description: { showTitle: false, showDivider: true },
  },
  inputs: [
    {
      key: 'input',
      label: '入力',
      type: 'number',
    },
  ],
  outputs: [
    {
      key: 'output',
      label: '出力',
      type: 'number',
    },
  ],
  fields: [
    {
      key: 'ratio',
      label: '比率',
      type: 'number',
      min: 0,
      step: 0.01,
      default: 1,
      group: 'parameters',
      getValue: (data) => data?.ratio ?? 1,
      setValue: (value, data) => ({ ...data, ratio: parseFloat(value) || 1 }),
    },
    {
      key: 'description',
      label: '',
      type: 'custom',
      group: 'description',
      render: () => (
        <div className="node-description">
          <small>
            Ratio &gt; 1: 変位増加・力減少
            <br />
            Ratio &lt; 1: 変位減少・力増加
          </small>
        </div>
      ),
    },
  ],
  calculate: (inputs, fields) => {
    const input = inputs.input || 0;
    const ratio = fields.ratio || 1;
    const output = roundToDigits(input * ratio, ROUND_DIGITS);
    return {
      output,
    };
  },
};

export default simpleLinToLinConverterNodeDefinition;
