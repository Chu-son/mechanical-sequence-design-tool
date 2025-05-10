// Baseノードタイプのインポート
import BaseRotationalActuatorNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/BaseRotationalActuatorNode';
import BaseLinearActuatorNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/BaseLinearActuatorNode';
import BaseRotToRotConverterNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/BaseRotToRotConverterNode';
import BaseRotToLinConverterNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/BaseRotToLinConverterNode';
import OutputNode from '@/renderer/components/flowchart/components/drive-config-nodes/nodes/OutputNode';

// 個別にエクスポート
export { BaseRotationalActuatorNode };
export { BaseLinearActuatorNode };
export { BaseRotToRotConverterNode };
export { BaseRotToLinConverterNode };
export { OutputNode };

// Common
export * from './common';
export * from './DriveConfigBlocks';

// ノードタイプの登録 - baseNodeTypeのみで統一
export const nodeTypes = {
  // Baseノード - 実装の本体
  baseRotationalActuator: BaseRotationalActuatorNode,
  baseLinearActuator: BaseLinearActuatorNode,
  baseRotToRotConverter: BaseRotToRotConverterNode,
  baseRotToLinConverter: BaseRotToLinConverterNode,

  // 共通ノード
  outputNode: OutputNode,
};
