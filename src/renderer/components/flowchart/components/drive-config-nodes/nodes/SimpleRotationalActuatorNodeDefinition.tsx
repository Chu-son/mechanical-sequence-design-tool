import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import {
  roundToDigits,
  ROUND_DIGITS,
} from '@/renderer/components/flowchart/common/flowchartUtils';
import { RotationalActuatorNodeData } from '../common';

const simpleRotationalActuatorNodeDefinition: NodeDefinition = {
  type: 'rotationalActuator',
  title: 'Simple Rotational Actuator',

  groupTitles: {
    parameters: 'Parameters',
    results: 'Calculated',
  },
  groupDisplayOptions: {
    parameters: { showTitle: true, showDivider: false },
    results: { showTitle: true, showDivider: true },
  },

  getInitialData: () => ({
    ratedTorque: 1.0,
    ratedSpeed: 3000,
    maxSpeed: 5000,
    rotorInertia: 0.0001,
    direction: 1 as 1 | -1,
    efficiency: 0.95,
    calculatedOutput: {
      rotational: {
        torque: 0,
        speed: 0,
        power: 0,
        inertia: 0,
        direction: 1,
      },
      efficiency: 0.95,
      maxLoad: 0,
      isOverloaded: false,
    },
  }),

  handles: {
    target: false,
    source: true,
  },

  fields: [
    {
      key: 'ratedTorque',
      label: 'Rated Torque',
      unit: 'N・m',
      type: 'number',
      step: 0.1,
      group: 'parameters',
      getValue: (data) => data.ratedTorque || 1.0,
      setValue: (value, data) => ({
        ...data,
        ratedTorque: parseFloat(value) || 0,
      }),
    },
    {
      key: 'ratedSpeed',
      label: 'Rated Speed',
      unit: 'rpm',
      type: 'number',
      step: 1,
      group: 'parameters',
      getValue: (data) => data.ratedSpeed || 3000,
      setValue: (value, data) => ({
        ...data,
        ratedSpeed: parseFloat(value) || 0,
      }),
    },
    {
      key: 'maxSpeed',
      label: 'Max Speed',
      unit: 'rpm',
      type: 'number',
      step: 1,
      group: 'parameters',
      getValue: (data) => data.maxSpeed || 5000,
      setValue: (value, data) => ({
        ...data,
        maxSpeed: parseFloat(value) || 0,
      }),
    },
    {
      key: 'rotorInertia',
      label: 'Rotor Inertia',
      unit: 'kg・m²',
      type: 'number',
      step: 0.0001,
      group: 'parameters',
      getValue: (data) => data.rotorInertia || 0.0001,
      setValue: (value, data) => ({
        ...data,
        rotorInertia: parseFloat(value) || 0,
      }),
    },
    {
      key: 'direction',
      label: 'Direction',
      type: 'select',
      options: [
        { value: 1, label: 'Forward' },
        { value: -1, label: 'Reverse' },
      ],
      group: 'parameters',
      getValue: (data) => data.direction || 1,
      setValue: (value, data) => ({
        ...data,
        direction: parseInt(value as string) as 1 | -1,
      }),
    },
    {
      key: 'efficiency',
      label: 'Efficiency',
      type: 'number',
      step: 0.01,
      min: 0,
      max: 1,
      group: 'parameters',
      getValue: (data) => data.efficiency || 0.95,
      setValue: (value, data) => ({
        ...data,
        efficiency: parseFloat(value) || 0,
      }),
    },
    {
      key: 'outputPower',
      label: 'Output Power [W]',
      type: 'readonly',
      group: 'results',
      getValue: (data) => data?.calculatedOutput?.rotational?.power || 0,
      formatValue: (value) => roundToDigits(value, ROUND_DIGITS).toString(),
    },
  ],

  compute: (data, nodeId, update) => {
    const { ratedTorque, ratedSpeed, rotorInertia, direction, efficiency } =
      data;

    // 回転アクチュエータの出力計算
    const torque = ratedTorque * efficiency;
    const speed = ratedSpeed;
    // トルクとスピードから出力パワーを計算 (W = T * ω)
    // rpmからrad/sへの変換: ω = rpm * 2π / 60
    const power = (torque * speed * Math.PI) / 30; // W = N・m * rad/s

    const calculatedOutput = {
      rotational: {
        torque,
        speed,
        power,
        inertia: rotorInertia,
        direction,
      },
      efficiency,
      maxLoad: ratedTorque,
      isOverloaded: false,
    };

    // ノードデータを更新
    update({
      ...data,
      id: nodeId,
      type: 'rotational',
      calculatedOutput,
    });
  },
};

export default simpleRotationalActuatorNodeDefinition;
