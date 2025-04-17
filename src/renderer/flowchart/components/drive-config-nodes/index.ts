// ノードタイプのインポート
import SimpleRotationalActuatorNode from './SimpleRotationalActuatorNode';
import SimpleLinearActuatorNode from './SimpleLinearActuatorNode';
import SimpleRotToRotConverterNode from './SimpleRotToRotConverterNode';
import SimpleLinToRotConverterNode from './SimpleLinToRotConverter';
import SimpleRotToLinConverterNode from './SimpleRotToLinConverter';
import SimpleLinToLinConverterNode from './SimpleLinToLinConverter';
import OutputNode from './OutputNode';

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
