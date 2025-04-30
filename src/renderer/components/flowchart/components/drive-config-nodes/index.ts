// ノードタイプのインポート
import SimpleRotationalActuatorNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/SimpleRotationalActuatorNode';
import SimpleLinearActuatorNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/SimpleLinearActuatorNode';
import SimpleRotToRotConverterNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/SimpleRotToRotConverterNode';
import SimpleRotToLinConverterNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/SimpleRotToLinConverter';
import OutputNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/OutputNode';

// 個別にエクスポート
export { SimpleRotationalActuatorNode };
export { SimpleLinearActuatorNode };
export { SimpleRotToRotConverterNode };
export { SimpleRotToLinConverterNode };
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
  simpleRotToLinConverter: SimpleRotToLinConverterNode,
};
