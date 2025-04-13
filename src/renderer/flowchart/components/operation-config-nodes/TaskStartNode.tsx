import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import '@/renderer/flowchart/styles/common.css'; // flowchart共通スタイルを適用

const TaskStartNode = ({ id }: { id: string }): JSX.Element => (
  <div className="node">
    <div className="node-title">Task Start</div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

export default memo(TaskStartNode);
