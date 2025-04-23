import React, { memo, useState, useEffect, useCallback } from 'react';
import {
  Handle,
  Position,
  useReactFlow,
  useNodeConnections,
  useNodesData,
  NodeToolbar,
  type NodeProps,
} from '@xyflow/react';
import {
  roundToDigits,
  ROUND_DIGITS,
  validateNumericInput,
} from '@/renderer/flowchart/common/flowchartUtils';
import { calculateDuration } from '@/renderer/flowchart/common/mechanicalCalculations';
import { TaskNodeData } from '@/renderer/flowchart/components/operation-config-nodes/common';
import '@/renderer/flowchart/styles/common.css';

function SimpleActuatorTaskNode({
  id,
  data,
}: NodeProps<{ data: TaskNodeData }>) {
  const { updateNodeData, addNodes, addEdges, getNode } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const nodesData = useNodesData(connections?.[0]?.source) as
    | { data?: { totalDuration?: number } }
    | undefined;

  const [totalDuration, setTotalDuration] = useState(data.totalDuration || 0);
  const [taskNode, setTaskNode] = useState(data);
  // 初期値をdataから取得するよう修正
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

  // パラメータ変更時にDurationを再計算
  useEffect(() => {
    const newDuration = calculateDuration(
      position,
      velocity,
      acceleration,
      deceleration,
    );
    setDuration(newDuration);

    console.log(
      `[SimpleActuatorTaskNode] 所要時間更新 - id: ${id}, duration: ${newDuration}秒`,
    );
  }, [id, position, velocity, acceleration, deceleration]);

  // パラメータ変更時にノードデータを更新する
  useEffect(() => {
    console.log(
      `[SimpleActuatorTaskNode] パラメータ更新 - id: ${id}, position: ${position}, velocity: ${velocity}, acceleration: ${acceleration}, deceleration: ${deceleration}`,
    );
    updateNodeData(id, {
      ...taskNode,
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
    taskNode,
    updateNodeData,
  ]);

  // 前のノードからTotalDurationを取得し、このノードのDurationを加算する
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
        ...taskNode,
        duration: duration,
        totalDuration: roundedTotalDuration,
        position,
        velocity,
        acceleration,
        deceleration,
      });

      console.log(
        `[SimpleActuatorTaskNode] 累積時間更新 - 前のノード: ${previousTotalDuration}秒, このノード: ${duration}秒, 合計: ${roundedTotalDuration}秒`,
      );
    } else {
      setTotalDuration(duration);
      updateNodeData(id, {
        ...taskNode,
        duration: duration,
        totalDuration: duration,
        position,
        velocity,
        acceleration,
        deceleration,
      });

      console.log(
        `[SimpleActuatorTaskNode] 前のノードなし - このノード: ${duration}秒`,
      );
    }
  }, [
    id,
    taskNode,
    updateNodeData,
    nodesData,
    duration,
    position,
    velocity,
    acceleration,
    deceleration,
  ]);

  // 共通のバリデーション関数
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

  // 入力変更ハンドラ
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

  // フォーカス外れた時のバリデーションハンドラ
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

  // Detailボタンクリック時のハンドラ
  const handleDetailClick = useCallback(() => {
    // 現在のノードの位置を取得
    const currentNode = getNode(id);
    if (!currentNode) return;

    // 新しいVelocityFigureNodeを作成
    const newNodeId = `velocity-${id}`;
    const newNode = {
      id: newNodeId,
      type: 'velocityFigure', // 小文字のノードタイプ名に修正
      position: {
        x: currentNode.position.x + 300,
        y: currentNode.position.y,
      },
      data: {
        // 現在のノードのデータを引き継ぐ
        position,
        velocity,
        acceleration,
        deceleration,
        duration,
        sourceNodeId: id,
      },
    };

    // 新しいノードを追加
    addNodes(newNode);

    // エッジを追加して接続
    const newEdge = {
      id: `edge-${id}-${newNodeId}`,
      source: id,
      sourceHandle: 'right', // 右側のHandleのID
      target: newNodeId,
      targetHandle: 'target',
    };
    addEdges(newEdge);

    console.log(
      `[SimpleActuatorTaskNode] VelocityFigureNodeを作成しました - ID: ${newNodeId}`,
    );
  }, [
    id,
    addNodes,
    addEdges,
    getNode,
    position,
    velocity,
    acceleration,
    deceleration,
    duration,
  ]);

  return (
    <div className="node">
      <NodeToolbar
        position={Position.Right}
        align="start"
        isVisible={true}
        className="node-toolbar"
      >
        <button onClick={handleDetailClick}>Detail</button>
      </NodeToolbar>
      <Handle type="target" position={Position.Top} />
      <div className="node-title">Simple Actuator Task</div>
      <div className="node-content">
        <div className="node-setting-field">
          <label htmlFor={`position-${id}`}>
            Displacement [mm]
            <br />
            <input
              id={`position-${id}`}
              type="text"
              value={positionInput}
              onChange={handlePositionInputChange}
              onBlur={handlePositionBlur}
            />
          </label>
          <label htmlFor={`velocity-${id}`}>
            Velocity [mm/s]
            <br />
            <input
              id={`velocity-${id}`}
              type="text"
              value={velocityInput}
              onChange={handleVelocityInputChange}
              onBlur={handleVelocityBlur}
            />
          </label>
          <label htmlFor={`acceleration-${id}`}>
            Acceleration [mm/s²]
            <br />
            <input
              id={`acceleration-${id}`}
              type="text"
              value={accelerationInput}
              onChange={handleAccelerationInputChange}
              onBlur={handleAccelerationBlur}
            />
          </label>
          <label htmlFor={`deceleration-${id}`}>
            Deceleration [mm/s²]
            <br />
            <input
              id={`deceleration-${id}`}
              type="text"
              value={decelerationInput}
              onChange={handleDecelerationInputChange}
              onBlur={handleDecelerationBlur}
            />
          </label>
        </div>
        <hr className="node-divider" />
        <div className="node-readonly-field">
          <div>Node ID: {id}</div>
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
