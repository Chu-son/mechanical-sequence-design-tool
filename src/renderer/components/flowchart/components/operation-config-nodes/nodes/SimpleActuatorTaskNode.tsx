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
} from '@/renderer/components/flowchart/common/flowchartUtils';
import { calculateDuration } from '@/renderer/components/flowchart/common/mechanicalCalculations';
import { TaskNodeData } from '@/renderer/components/flowchart/components/operation-config-nodes/common';
import RenderNodeSideToolbar from '@/renderer/components/flowchart/common/renderNodeSideToolbar';
import '@/renderer/components/flowchart/styles/common.css';

function SimpleActuatorTaskNode({
  id,
  data,
}: NodeProps<{ data: TaskNodeData }>) {
  const { updateNodeData } = useReactFlow();
  const nodeData = data;
  const connections = useNodeConnections({ handleType: 'target' });
  const nodesData = useNodesData(connections?.[0]?.source) as
    | { data?: { totalDuration?: number } }
    | undefined;

  // 各パラメータの状態
  const [description, setDescription] = useState(nodeData.description || '');
  const [position, setPosition] = useState(nodeData.position || 0);
  const [velocity, setVelocity] = useState(nodeData.velocity || 0);
  const [acceleration, setAcceleration] = useState(nodeData.acceleration || 0);
  const [deceleration, setDeceleration] = useState(nodeData.deceleration || 0);
  const [duration, setDuration] = useState(nodeData.duration || 0);
  const [totalDuration, setTotalDuration] = useState(
    nodeData.totalDuration || 0,
  );

  // 入力フォーム用の文字列値
  const [positionInput, setPositionInput] = useState(
    String(nodeData.position || 0),
  );
  const [velocityInput, setVelocityInput] = useState(
    String(nodeData.velocity || 0),
  );
  const [accelerationInput, setAccelerationInput] = useState(
    String(nodeData.acceleration || 0),
  );
  const [decelerationInput, setDecelerationInput] = useState(
    String(nodeData.deceleration || 0),
  );

  // 入力値バリデーション&状態更新
  const validateAndUpdateValue = useCallback(
    (
      value: string,
      setValue: (value: number) => void,
      setInputValue: (value: string) => void,
      minValue = 0,
    ) => {
      const validValue = validateNumericInput(value, minValue);
      setValue(validValue);
      setInputValue(validValue.toString());
    },
    [],
  );

  // 入力イベント
  const handleInputChange = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        setter(e.target.value),
    [],
  );
  const handleBlur = useCallback(
    (
      value: string,
      setValue: (value: number) => void,
      setInputValue: (value: string) => void,
      minValue = 0.1,
    ) =>
      () =>
        validateAndUpdateValue(value, setValue, setInputValue, minValue),
    [validateAndUpdateValue],
  );

  // duration計算
  useEffect(() => {
    setDuration(
      calculateDuration(position, velocity, acceleration, deceleration),
    );
  }, [position, velocity, acceleration, deceleration]);

  // ノードデータ更新
  useEffect(() => {
    updateNodeData(id, {
      ...nodeData,
      position,
      velocity,
      acceleration,
      deceleration,
      duration,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, position, velocity, acceleration, deceleration, duration]);

  // totalDuration計算
  useEffect(() => {
    let newTotalDuration = duration;
    if (nodesData !== undefined) {
      const previousTotalDuration = nodesData?.data?.totalDuration ?? 0;
      newTotalDuration = previousTotalDuration + duration;
    }
    const roundedTotalDuration = roundToDigits(newTotalDuration, ROUND_DIGITS);
    setTotalDuration(roundedTotalDuration);
    updateNodeData(id, {
      ...nodeData,
      position,
      velocity,
      acceleration,
      deceleration,
      duration,
      totalDuration: roundedTotalDuration,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, duration, nodesData, position, velocity, acceleration, deceleration]);

  return (
    <div className="node">
      <RenderNodeSideToolbar
        options={[{ label: 'V-Chart', nodeType: 'velocityChart' }]}
        currentNodeId={id}
      />
      <Handle type="target" position={Position.Top} />
      <div className="node-title">Simple Actuator Task</div>
      <div className="node-content">
        <div className="node-setting-field">
          <label htmlFor={`description-${id}`}>Description</label>
          <input
            id={`description-${id}`}
            type="text"
            value={description}
            onChange={(e) => {
              const newDescription = e.target.value;
              setDescription(newDescription);
              updateNodeData(id, { ...nodeData, description: newDescription });
            }}
          />
          <label htmlFor={`position-${id}`}>Displacement [mm]</label>
          <input
            id={`position-${id}`}
            type="text"
            value={positionInput}
            onChange={handleInputChange(setPositionInput)}
            onBlur={handleBlur(positionInput, setPosition, setPositionInput)}
          />
          <label htmlFor={`velocity-${id}`}>Velocity [mm/s]</label>
          <input
            id={`velocity-${id}`}
            type="text"
            value={velocityInput}
            onChange={handleInputChange(setVelocityInput)}
            onBlur={handleBlur(velocityInput, setVelocity, setVelocityInput)}
          />
          <label htmlFor={`acceleration-${id}`}>Acceleration [mm/s²]</label>
          <input
            id={`acceleration-${id}`}
            type="text"
            value={accelerationInput}
            onChange={handleInputChange(setAccelerationInput)}
            onBlur={handleBlur(
              accelerationInput,
              setAcceleration,
              setAccelerationInput,
            )}
          />
          <label htmlFor={`deceleration-${id}`}>Deceleration [mm/s²]</label>
          <input
            id={`deceleration-${id}`}
            type="text"
            value={decelerationInput}
            onChange={handleInputChange(setDecelerationInput)}
            onBlur={handleBlur(
              decelerationInput,
              setDeceleration,
              setDecelerationInput,
            )}
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
