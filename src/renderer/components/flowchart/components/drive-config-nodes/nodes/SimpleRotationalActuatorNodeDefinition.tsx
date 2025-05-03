import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import { roundToDigits } from '@/renderer/components/flowchart/common/flowchartUtils';
import { RotationalOutput } from '../common';

const simpleRotationalActuatorNodeDefinition: NodeDefinition = {
  type: 'rotationalActuator',
  title: 'Simple Rotational Actuator',
  groupTitles: {
    parameters: 'Parameters',
    output: 'Output',
  },
  groupDisplayOptions: {
    parameters: { showTitle: true, showDivider: false },
    output: { showTitle: true, showDivider: true },
  },
  getInitialData: () => ({
    ratedTorque: 0,
    ratedSpeed: 0,
    maxSpeed: 0,
    rotorInertia: 0,
    model: '',
    manufacturer: '',
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
  handles: {
    target: false,
    source: true,
  },
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
      key: 'ratedTorque',
      label: 'Rated Torque',
      unit: 'N・m',
      type: 'number',
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data.ratedTorque,
      setValue: (value, data) => ({
        ...data,
        ratedTorque: parseFloat(value),
      }),
    },
    {
      key: 'ratedSpeed',
      label: 'Rated Speed',
      unit: 'rpm',
      type: 'number',
      step: 1,
      group: 'parameters',
      getValue: (data) => data.ratedSpeed,
      setValue: (value, data) => ({
        ...data,
        ratedSpeed: parseFloat(value),
      }),
    },
    {
      key: 'maxSpeed',
      label: 'Max Speed',
      unit: 'rpm',
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
      key: 'rotorInertia',
      label: 'Rotor Inertia',
      unit: 'kg・m²',
      type: 'number',
      step: 0.0001,
      group: 'parameters',
      getValue: (data) => data.rotorInertia,
      setValue: (value, data) => ({
        ...data,
        rotorInertia: parseFloat(value),
      }),
    },
    // 出力値（readonly）
    {
      key: 'ratedTorqueOut',
      label: 'Rated Torque',
      type: 'readonly',
      unit: 'N・m',
      group: 'output',
      getValue: (data) => data.outputSpec?.ratedTorque ?? '',
    },
    {
      key: 'ratedSpeedOut',
      label: 'Rated Speed',
      type: 'readonly',
      unit: 'rpm',
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
      key: 'maxTorqueOut',
      label: 'Max Torque',
      type: 'readonly',
      unit: 'N・m',
      group: 'output',
      getValue: (data) => data.outputSpec?.maxTorque ?? '',
    },
    {
      key: 'maxSpeedOut',
      label: 'Max Speed',
      type: 'readonly',
      unit: 'rpm',
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
  compute: (data, nodeId, update) => {
    // 入力値から出力値を計算
    const ratedTorque = parseFloat(data.ratedTorque) || 0;
    const ratedSpeed = parseFloat(data.ratedSpeed) || 0;
    const maxSpeed = parseFloat(data.maxSpeed) || 0;
    const rotorInertia = parseFloat(data.rotorInertia) || 0;
    const efficiency = 0.95;
    // 定格出力[W] = 定格トルク[Nm] × 定格回転速度[rpm] × 2π / 60
    const ratedPower = (ratedTorque * ratedSpeed * 2 * Math.PI) / 60;
    // 最大出力は最大速度で同様に計算
    const maxPower = (ratedTorque * maxSpeed * 2 * Math.PI) / 60;
    const outputSpec: RotationalOutput = {
      ratedTorque,
      ratedSpeed,
      ratedPower: roundToDigits(ratedPower, 2),
      maxTorque: ratedTorque, // シンプルな場合は同値
      maxSpeed,
      maxPower: roundToDigits(maxPower, 2),
      allowableTorque: ratedTorque,
      totalGearRatio: 1,
      totalInertia: rotorInertia,
      efficiency,
    };
    if (JSON.stringify(data.outputSpec) !== JSON.stringify(outputSpec)) {
      update({ ...data, outputSpec });
    }
  },
};

export default simpleRotationalActuatorNodeDefinition;
