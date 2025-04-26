// ノードタイプのインポート
import SimpleRotationalActuatorNode from './nodes/SimpleRotationalActuatorNode';
import SimpleLinearActuatorNode from './nodes/SimpleLinearActuatorNode';
import SimpleRotToRotConverterNode from './nodes/SimpleRotToRotConverterNode';
import SimpleLinToRotConverterNode from './nodes/SimpleLinToRotConverter';
import SimpleRotToLinConverterNode from './nodes/SimpleRotToLinConverter';
import SimpleLinToLinConverterNode from './nodes/SimpleLinToLinConverter';
import OutputNode from './nodes/OutputNode';

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
