import React, { memo, useEffect, useState, useCallback } from 'react';
import {
  Handle,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
  type NodeProps,
} from '@xyflow/react';
import {
  roundToDigits,
  TaskNodeData,
} from '@/renderer/flowchart/components/operation-config-nodes/common';
import '@/renderer/flowchart/styles/common.css'; // flowchart共通スタイルを適用

import { ROUND_DIGITS } from '@/renderer/flowchart/components/operation-config-nodes/common';

function SimpleActuatorTaskNode({
  id,
  data,
}: NodeProps<{ data: TaskNodeData }>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const nodesData = useNodesData(connections?.[0]?.source) as
    | { data?: { totalDuration?: number } }
    | undefined;

  const [totalDuration, setTotalDuration] = useState(data.totalDuration || 0);
  const [taskNode, setTaskNode] = useState(data);
  const [position, setPosition] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [acceleration, setAcceleration] = useState(0);
  const [deceleration, setDeceleration] = useState(0);

  const calculateDuration = useCallback(() => {
    if (velocity > 0 && acceleration > 0) {
      const duration =
        (2 * position) /
        (velocity + Math.sqrt(velocity ** 2 + 2 * acceleration * position));
      return roundToDigits(duration, ROUND_DIGITS);
    }
    return 0;
  }, [position, velocity, acceleration]);

  useEffect(() => {
    if (nodesData !== undefined) {
      const previousTotalDuration = nodesData?.data?.totalDuration ?? 0;

      const newDuration = calculateDuration();
      const newTotalDuration = previousTotalDuration + newDuration;
      const roundedTotalDuration = roundToDigits(
        newTotalDuration,
        ROUND_DIGITS,
      );

      setTotalDuration(roundedTotalDuration);
      updateNodeData(id, {
        ...taskNode,
        duration: newDuration,
        totalDuration: roundedTotalDuration,
      });
    } else {
      setTotalDuration(0);
      updateNodeData(id, { ...taskNode, totalDuration: 0 });
    }
  }, [id, taskNode, updateNodeData, nodesData, calculateDuration]);

  return (
    <div className="node">
      <Handle type="target" position={Position.Top} />
      <div className="node-title">Simple Actuator Task</div>
      <div className="node-content">
        <div className="node-setting-field">
          <label>
            Displacement [mm]
            <br />
            <input
              type="number"
              value={position}
              onChange={(e) => setPosition(parseFloat(e.target.value) || 0)}
            />
          </label>
          <label>
            Velocity [mm/s]
            <br />
            <input
              type="number"
              value={velocity}
              onChange={(e) => setVelocity(parseFloat(e.target.value) || 0)}
            />
          </label>
          <label>
            Acceleration [mm/s²]
            <br />
            <input
              type="number"
              value={acceleration}
              onChange={(e) => setAcceleration(parseFloat(e.target.value) || 0)}
            />
          </label>
          <label>
            Deceleration [mm/s²]
            <br />
            <input
              type="number"
              value={deceleration}
              onChange={(e) => setDeceleration(parseFloat(e.target.value) || 0)}
            />
          </label>
        </div>
        <hr className="node-divider" />
        <div className="node-readonly-field">
          <div>Node ID: {id}</div>
          <div>Total Duration [sec]: {totalDuration}</div>
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    </div>
  );
}

export default memo(SimpleActuatorTaskNode);
