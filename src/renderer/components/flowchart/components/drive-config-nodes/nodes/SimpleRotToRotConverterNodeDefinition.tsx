import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import { roundToDigits } from '@/renderer/components/flowchart/common/flowchartUtils';
import { RotationalOutput } from '../common';

const simpleRotToRotConverterNodeDefinition: NodeDefinition = {
  type: 'rotToRotConverter',
  title: 'Simple Rot To Rot Converter',
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
    gearRatio: 1,
    inertia: 0,
    maxTorque: 0,
    efficiency: 0.95,
    outputSpec: {
      ratedTorque: 0,
      ratedSpeed: 0,
      ratedPower: 0,
      maxTorque: 0,
      maxSpeed: 0,
      maxPower: 0,
      allowableTorque: 0,
      totalGearRatio: 1,
      totalInertia: 0,
      efficiency: 0.95,
    } as RotationalOutput,
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
      key: 'gearRatio',
      label: 'Gear Ratio',
      type: 'number',
      step: 0.01,
      group: 'parameters',
      getValue: (data) => data.gearRatio,
      setValue: (value, data) => ({
        ...data,
        gearRatio: parseFloat(value),
      }),
    },
    {
      key: 'inertia',
      label: 'Inertia',
      unit: 'kg・m²',
      type: 'number',
      step: 0.0001,
      group: 'parameters',
      getValue: (data) => data.inertia,
      setValue: (value, data) => ({ ...data, inertia: parseFloat(value) }),
    },
    {
      key: 'maxTorque',
      label: 'Max Torque',
      unit: 'N・m',
      type: 'number',
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data.maxTorque,
      setValue: (value, data) => ({
        ...data,
        maxTorque: parseFloat(value),
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
      key: 'ratedTorqueOut',
      label: 'Rated Torque',
      type: 'readonly',
      unit: 'N・m',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedTorque,
    },
    {
      key: 'ratedSpeedOut',
      label: 'Rated Speed',
      type: 'readonly',
      unit: 'rpm',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedSpeed,
    },
    {
      key: 'ratedPowerOut',
      label: 'Rated Power',
      type: 'readonly',
      unit: 'W',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedPower,
    },
    {
      key: 'maxTorqueOut',
      label: 'Max Torque',
      type: 'readonly',
      unit: 'N・m',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxTorque,
    },
    {
      key: 'maxSpeedOut',
      label: 'Max Speed',
      type: 'readonly',
      unit: 'rpm',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxSpeed,
    },
    {
      key: 'maxPowerOut',
      label: 'Max Power',
      type: 'readonly',
      unit: 'W',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxPower,
    },
    {
      key: 'efficiencyOut',
      label: 'Efficiency',
      type: 'readonly',
      group: 'output',
      getValue: (data) => data.outputSpec?.efficiency,
    },
    {
      key: 'totalGearRatioOut',
      label: 'Total Gear Ratio',
      type: 'readonly',
      group: 'output',
      getValue: (data) => data.outputSpec?.totalGearRatio,
    },
    {
      key: 'totalInertiaOut',
      label: 'Total Inertia',
      type: 'readonly',
      unit: 'kg・m²',
      group: 'output',
      getValue: (data) => data.outputSpec?.totalInertia,
    },
  ],
  compute: (data: any, nodeId: string, update: (newData: any) => void) => {
    // 前段ノードの出力値を受け取り、変換
    const gearRatio = parseFloat(data.gearRatio) || 1;
    const efficiency = parseFloat(data.efficiency) || 0.95;
    const inertia = parseFloat(data.inertia) || 0;
    const maxTorque = parseFloat(data.maxTorque) || 0;
    let prev: RotationalOutput = data.prevOutputSpec as RotationalOutput;
    if (!prev)
      prev = {
        ratedTorque: 0,
        ratedSpeed: 0,
        ratedPower: 0,
        maxTorque: 0,
        maxSpeed: 0,
        maxPower: 0,
        allowableTorque: 0,
        totalGearRatio: 1,
        totalInertia: 0,
        efficiency: 1,
      };
    // 減速機の変換式例
    const ratedTorque = prev.ratedTorque * gearRatio * efficiency;
    const ratedSpeed = prev.ratedSpeed / gearRatio;
    const ratedPower = (ratedTorque * ratedSpeed * 2 * Math.PI) / 60;
    const maxSpeed = prev.maxSpeed / gearRatio;
    const maxPower = (ratedTorque * maxSpeed * 2 * Math.PI) / 60;
    const totalGearRatio = (prev.totalGearRatio ?? 1) * gearRatio;
    const totalInertia = (prev.totalInertia ?? 0) + inertia;
    const outputSpec: RotationalOutput = {
      ratedTorque: roundToDigits(ratedTorque, 2),
      ratedSpeed: roundToDigits(ratedSpeed, 2),
      ratedPower: roundToDigits(ratedPower, 2),
      maxTorque: maxTorque || roundToDigits(ratedTorque, 2),
      maxSpeed: roundToDigits(maxSpeed, 2),
      maxPower: roundToDigits(maxPower, 2),
      allowableTorque: maxTorque || roundToDigits(ratedTorque, 2),
      totalGearRatio,
      totalInertia,
      efficiency: prev.efficiency ? prev.efficiency * efficiency : efficiency,
    };
    if (JSON.stringify(data.outputSpec) !== JSON.stringify(outputSpec)) {
      update({ ...data, outputSpec });
    }
  },
};

export default simpleRotToRotConverterNodeDefinition;
