import React, { memo, JSX } from 'react';
import { Handle, Position } from '@xyflow/react';
import '@/renderer/flowchart/styles/common.css'; // flowchart共通スタイルを適用

function RootNode(): JSX.Element {
  return (
    <div className="node">
      <div className="node-title">Root Node</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
export default memo(RootNode);
