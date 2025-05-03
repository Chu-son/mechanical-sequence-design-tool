import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import { roundToDigits } from '@/renderer/components/flowchart/common/flowchartUtils';
import { LinearOutput } from '../common';

const simpleRotToLinConverterNodeDefinition: NodeDefinition = {
  type: 'rotToLinConverter',
  title: 'Simple Rotational to Linear Converter',
  groupTitles: {
    parameters: 'Parameters',
    output: 'Output',
  },
  groupDisplayOptions: {
    parameters: { showTitle: true, showDivider: false },
    output: { showTitle: true, showDivider: true },
  },
  handles: {
    target: true,
    source: true,
  },
  getInitialData: () => ({
    model: '',
    manufacturer: '',
    leadPitch: 0,
    conversionRatio: 1,
    maxForce: 0,
    maxSpeed: 0,
    efficiency: 0.9,
    outputSpec: {
      ratedForce: 0,
      ratedSpeed: 0,
      ratedPower: 0,
      maxForce: 0,
      maxSpeed: 0,
      maxPower: 0,
      stroke: 0,
      maxAcceleration: 0,
      efficiency: 0.9,
    } as LinearOutput,
  }),
  fields: [
    {
      key: 'model',
      label: 'Model',
      type: 'text',
      group: 'parameters',
      getValue: (data) => data.model,
      setValue: (value, data) => ({ ...data, model: value }),
    },
    {
      key: 'manufacturer',
      label: 'Manufacturer',
      type: 'text',
      group: 'parameters',
      getValue: (data) => data.manufacturer,
      setValue: (value, data) => ({ ...data, manufacturer: value }),
    },
    {
      key: 'leadPitch',
      label: 'Lead/Pitch',
      unit: 'mm',
      type: 'number',
      step: 0.01,
      group: 'parameters',
      getValue: (data) => data.leadPitch,
      setValue: (value, data) => ({
        ...data,
        leadPitch: parseFloat(value),
      }),
    },
    {
      key: 'conversionRatio',
      label: 'Conversion Ratio',
      type: 'number',
      step: 0.01,
      group: 'parameters',
      getValue: (data) => data.conversionRatio,
      setValue: (value, data) => ({
        ...data,
        conversionRatio: parseFloat(value),
      }),
    },
    {
      key: 'maxForce',
      label: 'Max Force',
      unit: 'N',
      type: 'number',
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data.maxForce,
      setValue: (value, data) => ({
        ...data,
        maxForce: parseFloat(value),
      }),
    },
    {
      key: 'maxSpeed',
      label: 'Max Speed',
      unit: 'mm/s',
      type: 'number',
      step: 1,
      group: 'parameters',
      getValue: (data) => data.maxSpeed,
      setValue: (value, data) => ({
        ...data,
        maxSpeed: parseFloat(value),
      }),
    },
    {
      key: 'efficiency',
      label: 'Efficiency',
      type: 'number',
      step: 0.01,
      group: 'parameters',
      getValue: (data) => data.efficiency,
      setValue: (value, data) => ({
        ...data,
        efficiency: parseFloat(value),
      }),
    },
    // 出力値（readonly）
    {
      key: 'ratedForceOut',
      label: 'Rated Force',
      type: 'readonly',
      unit: 'N',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedForce ?? '',
    },
    {
      key: 'ratedSpeedOut',
      label: 'Rated Speed',
      type: 'readonly',
      unit: 'mm/s',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedSpeed ?? '',
    },
    {
      key: 'ratedPowerOut',
      label: 'Rated Power',
      type: 'readonly',
      unit: 'W',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedPower ?? '',
    },
    {
      key: 'maxForceOut',
      label: 'Max Force',
      type: 'readonly',
      unit: 'N',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxForce ?? '',
    },
    {
      key: 'maxSpeedOut',
      label: 'Max Speed',
      type: 'readonly',
      unit: 'mm/s',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxSpeed ?? '',
    },
    {
      key: 'maxPowerOut',
      label: 'Max Power',
      type: 'readonly',
      unit: 'W',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxPower ?? '',
    },
    {
      key: 'efficiencyOut',
      label: 'Efficiency',
      type: 'readonly',
      group: 'output',
      getValue: (data) => data.outputSpec?.efficiency ?? '',
    },
  ],
  compute: (data: any, nodeId: string, update: (newData: any) => void) => {
    // 前段ノードの出力値（回転）を受け取り、直動系に変換
    const conversionRatio = parseFloat(data.conversionRatio) || 1;
    const efficiency = parseFloat(data.efficiency) || 0.9;
    const maxForce = parseFloat(data.maxForce) || 0;
    const maxSpeed = parseFloat(data.maxSpeed) || 0;
    let prev: any = data.prevOutputSpec;
    if (!prev)
      prev = { ratedTorque: 0, ratedSpeed: 0, ratedPower: 0, efficiency: 1 };
    // 例: 回転→直動変換（ボールねじ等）
    // 速度変換: ratedSpeed[rpm] * conversionRatio[mm/rev] = [mm/min] → [mm/s]
    const ratedSpeed = ((prev.ratedSpeed || 0) * conversionRatio) / 60;
    // 推力変換: ratedTorque[Nm] * 2π / conversionRatio[mm/rev] = [N]
    const ratedForce =
      ((prev.ratedTorque || 0) * 2 * Math.PI) / (conversionRatio || 1);
    const ratedPower = (ratedForce * ratedSpeed) / 1000;
    const outputSpec: LinearOutput = {
      ratedForce: roundToDigits(ratedForce, 2),
      ratedSpeed: roundToDigits(ratedSpeed, 2),
      ratedPower: roundToDigits(ratedPower, 2),
      maxForce: maxForce || roundToDigits(ratedForce, 2),
      maxSpeed: maxSpeed || roundToDigits(ratedSpeed, 2),
      maxPower: roundToDigits(
        (ratedForce * (maxSpeed || ratedSpeed)) / 1000,
        2,
      ),
      stroke: 0,
      maxAcceleration: 0,
      efficiency: prev.efficiency ? prev.efficiency * efficiency : efficiency,
    };
    if (JSON.stringify(data.outputSpec) !== JSON.stringify(outputSpec)) {
      update({ ...data, outputSpec });
    }
  },
};

export default simpleRotToLinConverterNodeDefinition;
