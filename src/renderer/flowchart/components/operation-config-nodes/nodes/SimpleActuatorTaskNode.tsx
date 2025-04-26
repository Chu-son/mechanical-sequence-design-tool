import React, { memo, useState, useEffect, useCallback } from 'react';
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
  ROUND_DIGITS,
  validateNumericInput,
} from '@/renderer/flowchart/common/flowchartUtils';
import { calculateDuration } from '@/renderer/flowchart/common/mechanicalCalculations';
import { TaskNodeData } from '@/renderer/flowchart/components/operation-config-nodes/common';
import { renderNodeSideToolbar } from '@/renderer/flowchart/common/renderNodeSideToolbar';
import '@/renderer/flowchart/styles/common.css';

function SimpleActuatorTaskNode({ id, data }: NodeProps<TaskNodeData>) {
  const { updateNodeData, addNodes, addEdges, getNode } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const nodesData = useNodesData(connections?.[0]?.source) as
    | { data?: { totalDuration?: number } }
    | undefined;

  const [totalDuration, setTotalDuration] = useState(data.totalDuration || 0);
  const [position, setPosition] = useState(data.position || 0);
  const [velocity, setVelocity] = useState(data.velocity || 0);
  const [acceleration, setAcceleration] = useState(data.acceleration || 0);
  const [deceleration, setDeceleration] = useState(data.deceleration || 0);
  const [duration, setDuration] = useState(data.duration || 0);

  // 入力フォーム用の文字列値
  const [positionInput, setPositionInput] = useState(
    String(data.position || 0),
  );
  const [velocityInput, setVelocityInput] = useState(
    String(data.velocity || 0),
  );
  const [accelerationInput, setAccelerationInput] = useState(
    String(data.acceleration || 0),
  );
  const [decelerationInput, setDecelerationInput] = useState(
    String(data.deceleration || 0),
  );

  useEffect(() => {
    const newDuration = calculateDuration(
      position,
      velocity,
      acceleration,
      deceleration,
    );
    setDuration(newDuration);
  }, [id, position, velocity, acceleration, deceleration]);

  useEffect(() => {
    updateNodeData(id, {
      ...data,
      position,
      velocity,
      acceleration,
      deceleration,
      duration,
    });
  }, [
    id,
    position,
    velocity,
    acceleration,
    deceleration,
    duration,
    data,
    updateNodeData,
  ]);

  useEffect(() => {
    if (nodesData !== undefined) {
      const previousTotalDuration = nodesData?.data?.totalDuration ?? 0;
      const newTotalDuration = previousTotalDuration + duration;
      const roundedTotalDuration = roundToDigits(
        newTotalDuration,
        ROUND_DIGITS,
      );
      setTotalDuration(roundedTotalDuration);
      updateNodeData(id, {
        ...data,
        duration,
        totalDuration: roundedTotalDuration,
        position,
        velocity,
        acceleration,
        deceleration,
      });
    } else {
      setTotalDuration(duration);
      updateNodeData(id, {
        ...data,
        duration,
        totalDuration: duration,
        position,
        velocity,
        acceleration,
        deceleration,
      });
    }
  }, [
    id,
    data,
    updateNodeData,
    nodesData,
    duration,
    position,
    velocity,
    acceleration,
    deceleration,
  ]);

  const validateAndUpdateValue = (
    value: string,
    setValue: (value: number) => void,
    setInputValue: (value: string) => void,
    minValue = 0,
  ) => {
    const validValue = validateNumericInput(value, minValue);
    setValue(validValue);
    setInputValue(validValue.toString());
  };

  const handlePositionInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPositionInput(e.target.value);
  };
  const handleVelocityInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setVelocityInput(e.target.value);
  };
  const handleAccelerationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setAccelerationInput(e.target.value);
  };
  const handleDecelerationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setDecelerationInput(e.target.value);
  };

  const handlePositionBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validateAndUpdateValue(e.target.value, setPosition, setPositionInput, 0.1);
  };
  const handleVelocityBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validateAndUpdateValue(e.target.value, setVelocity, setVelocityInput, 0.1);
  };
  const handleAccelerationBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validateAndUpdateValue(
      e.target.value,
      setAcceleration,
      setAccelerationInput,
      0.1,
    );
  };
  const handleDecelerationBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validateAndUpdateValue(
      e.target.value,
      setDeceleration,
      setDecelerationInput,
      0.1,
    );
  };

  // velocityFigureノード用のdata生成関数
  const getNodeData = useCallback(
    (nodeType: string, currentNodeId: string) => {
      if (nodeType === 'velocityFigure') {
        return {
          position,
          velocity,
          acceleration,
          deceleration,
          duration,
          sourceNodeId: currentNodeId,
        };
      }
      return { sourceNodeId: currentNodeId };
    },
    [position, velocity, acceleration, deceleration, duration],
  );

  return (
    <div className="node">
      {renderNodeSideToolbar(
        [{ label: 'V-Chart', nodeType: 'velocityChart' }],
        id,
        getNodeData,
      )}
      <Handle type="target" position={Position.Top} />
      <div className="node-title">Simple Actuator Task</div>
      <div className="node-content">
        <div className="node-setting-field">
          <label htmlFor={`position-${id}`}>Displacement [mm]</label>
          <input
            id={`position-${id}`}
            type="text"
            value={positionInput}
            onChange={handlePositionInputChange}
            onBlur={handlePositionBlur}
          />
          <label htmlFor={`velocity-${id}`}>Velocity [mm/s]</label>
          <input
            id={`velocity-${id}`}
            type="text"
            value={velocityInput}
            onChange={handleVelocityInputChange}
            onBlur={handleVelocityBlur}
          />
          <label htmlFor={`acceleration-${id}`}>Acceleration [mm/s²]</label>
          <input
            id={`acceleration-${id}`}
            type="text"
            value={accelerationInput}
            onChange={handleAccelerationInputChange}
            onBlur={handleAccelerationBlur}
          />
          <label htmlFor={`deceleration-${id}`}>Deceleration [mm/s²]</label>
          <input
            id={`deceleration-${id}`}
            type="text"
            value={decelerationInput}
            onChange={handleDecelerationInputChange}
            onBlur={handleDecelerationBlur}
          />
        </div>
        <hr className="node-divider" />
        <div className="node-readonly-field">
          <div>Node ID: {String(id)}</div>
          <div>Duration [sec]: {duration}</div>
          <div>Total Duration [sec]: {totalDuration}</div>
        </div>
        <Handle type="source" position={Position.Bottom} id="bottom" />
        <Handle type="source" position={Position.Right} id="right" />
      </div>
    </div>
  );
}

export default memo(SimpleActuatorTaskNode);
