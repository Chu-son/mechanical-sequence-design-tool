// ノードタイプのインポート
import SimpleRotationalActuatorNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/SimpleRotationalActuatorNode';
import SimpleLinearActuatorNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/SimpleLinearActuatorNode';
import SimpleRotToRotConverterNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/SimpleRotToRotConverterNode';
import SimpleLinToRotConverterNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/SimpleLinToRotConverter';
import SimpleRotToLinConverterNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/SimpleRotToLinConverter';
import SimpleLinToLinConverterNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/SimpleLinToLinConverter';
import OutputNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/OutputNode';

// 個別にエクスポート
export { SimpleRotationalActuatorNode };
export { SimpleLinearActuatorNode };
export { SimpleRotToRotConverterNode };
export { SimpleLinToRotConverterNode };
export { SimpleRotToLinConverterNode };
export { SimpleLinToLinConverterNode };
export { OutputNode };

// Common
export * from './common';
export * from './DriveConfigBlocks';

// ノードタイプの登録
export const nodeTypes = {
  // Common Nodes
  outputNode: OutputNode,

  // Actuator Nodes
  simpleRotationalActuator: SimpleRotationalActuatorNode,
  simpleLinearActuator: SimpleLinearActuatorNode,

  // Drive Component Nodes
  simpleRotToRotConverter: SimpleRotToRotConverterNode,
  simpleLinToRotConverter: SimpleLinToRotConverterNode,
  simpleRotToLinConverter: SimpleRotToLinConverterNode,
  simpleLinToLinConverter: SimpleLinToLinConverterNode,
};
