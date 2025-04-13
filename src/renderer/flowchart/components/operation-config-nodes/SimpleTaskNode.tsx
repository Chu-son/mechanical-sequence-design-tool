import React, { memo, useEffect, useState } from 'react';
import {
  Position,
  Handle,
  useReactFlow,
  type NodeProps,
  useNodeConnections,
  useNodesData,
} from '@xyflow/react';
import {
  roundToDigits,
  TaskNodeData,
} from '@/renderer/flowchart/components/operation-config-nodes/common';
import '@/renderer/flowchart/styles/common.css'; // flowchart共通スタイルを適用

import { ROUND_DIGITS } from '@/renderer/flowchart/components/operation-config-nodes/common';

function SimpleTaskNode({ id, data }: NodeProps<{ data: TaskNodeData }>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const nodesData = useNodesData(connections?.[0]?.source) as
    | { data?: { totalDuration?: number } }
    | undefined;

  const [totalDuration, setTotalDuration] = useState(data.totalDuration || 0);
  const [taskNode, setTaskNode] = useState(data as TaskNodeData);
  const [inputValue, setInputValue] = useState(String(data.duration || 0));

  useEffect(() => {
    if (nodesData !== undefined) {
      const previousTotalDuration = nodesData?.data?.totalDuration ?? 0;

      const newTotalDuration = previousTotalDuration + (taskNode.duration || 0);
      const roundedTotalDuration = roundToDigits(
        newTotalDuration,
        ROUND_DIGITS,
      );

      setTotalDuration(roundedTotalDuration);
      updateNodeData(id, {
        ...taskNode,
        totalDuration: roundedTotalDuration,
      } as TaskNodeData);
    } else {
      setTotalDuration(0);
      updateNodeData(id, { ...taskNode, totalDuration: 0 });
    }
  }, [id, taskNode, updateNodeData, nodesData]);

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
    let value = parseFloat(event.target.value || '0');
    if (Number.isNaN(value)) {
      value = 0;
      value = roundToDigits(value, ROUND_DIGITS);
    }
    if (!Number.isNaN(value)) {
      setTaskNode({ ...taskNode, duration: value });
      updateNodeData(id, { ...taskNode, duration: value });
      setInputValue(value.toFixed(ROUND_DIGITS));
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(event.target.value);
  };

  return (
    <div className="node">
      <Handle type="target" position={Position.Top} />
      <div className="node-title">Simple Task</div>
      <div className="node-content">
        <div className="node-setting-field">
          <label htmlFor={`description-${id}`}>Description</label>
          <input
            id={`description-${id}`}
            type="text"
            value={taskNode.description || ''} // 初期値を空文字列に設定
            onChange={(event) => {
              const newDescription = event.target.value;
              setTaskNode({
                ...taskNode,
                description: newDescription,
              } as TaskNodeData);
              updateNodeData(id, {
                ...taskNode,
                description: newDescription,
              });
            }}
          />
          <label htmlFor={`duration-${id}`}>
            Duration [sec] ({ROUND_DIGITS} digits)
          </label>
          <input
            id={`duration-${id}`}
            type="text"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
          />
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

export default memo(SimpleTaskNode);
