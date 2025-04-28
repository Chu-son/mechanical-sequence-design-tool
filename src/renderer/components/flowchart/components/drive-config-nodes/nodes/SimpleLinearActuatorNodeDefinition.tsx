import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import {
  roundToDigits,
  ROUND_DIGITS,
} from '@/renderer/components/flowchart/common/flowchartUtils';

const calculateDuration = (
  position: number,
  velocity: number,
  acceleration: number,
) => {
  if (velocity > 0 && acceleration > 0) {
    const duration =
      (2 * position) /
      (velocity + Math.sqrt(velocity ** 2 + 2 * acceleration * position));
    return roundToDigits(duration, ROUND_DIGITS);
  }
  return 0;
};

const simpleLinearActuatorNodeDefinition: NodeDefinition = {
  type: 'linearActuator',
  title: 'Simple Linear Actuator',
  groupTitles: {
    parameters: 'Parameters',
    results: 'Calculated',
    output: 'Output',
  },
  groupDisplayOptions: {
    parameters: { showTitle: true, showDivider: false },
    results: { showTitle: true, showDivider: true },
    output: { showTitle: true, showDivider: true },
  },
  getInitialData: () => ({
    position: 0,
    velocity: 0,
    acceleration: 0,
    deceleration: 0,
    duration: 0,
    totalDuration: 0,
  }),
  fields: [
    {
      key: 'position',
      label: 'Displacement [mm]',
      type: 'number',
      group: 'parameters',
      getValue: (data) => data.position || 0,
      setValue: (value, data) => ({
        ...data,
        position: parseFloat(value) || 0,
      }),
    },
    {
      key: 'velocity',
      label: 'Velocity [mm/s]',
      type: 'number',
      group: 'parameters',
      getValue: (data) => data.velocity || 0,
      setValue: (value, data) => ({
        ...data,
        velocity: parseFloat(value) || 0,
      }),
    },
    {
      key: 'acceleration',
      label: 'Acceleration [mm/s²]',
      type: 'number',
      group: 'parameters',
      getValue: (data) => data.acceleration || 0,
      setValue: (value, data) => ({
        ...data,
        acceleration: parseFloat(value) || 0,
      }),
    },
    {
      key: 'deceleration',
      label: 'Deceleration [mm/s²]',
      type: 'number',
      group: 'parameters',
      getValue: (data) => data.deceleration || 0,
      setValue: (value, data) => ({
        ...data,
        deceleration: parseFloat(value) || 0,
      }),
    },
    {
      key: 'duration',
      label: 'Duration [sec]',
      type: 'readonly',
      group: 'results',
      getValue: (data) => data.duration || 0,
      formatValue: (v) => roundToDigits(v, ROUND_DIGITS).toString(),
    },
    {
      key: 'totalDuration',
      label: 'Total Duration [sec]',
      type: 'readonly',
      group: 'output',
      getValue: (data) => data.totalDuration || 0,
      formatValue: (v) => roundToDigits(v, ROUND_DIGITS).toString(),
    },
  ],
  compute: (data, nodeId, update) => {
    const duration = calculateDuration(
      data.position,
      data.velocity,
      data.acceleration,
    );
    const totalDuration = duration; // 前ノードの合計時間を加味する場合は外部から渡す
    if (data.duration !== duration || data.totalDuration !== totalDuration) {
      update({ ...data, duration, totalDuration });
    }
  },
};

export default simpleLinearActuatorNodeDefinition;
