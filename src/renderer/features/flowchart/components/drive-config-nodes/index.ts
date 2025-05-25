// Baseノードタイプのインポート
import BaseRotationalActuatorNode from '@/renderer/features/flowchart/components/drive-config-nodes/nodes/BaseRotationalActuatorNode';
import BaseLinearActuatorNode from '@/renderer/features/flowchart/components/drive-config-nodes/nodes/BaseLinearActuatorNode';
import BaseRotToRotConverterNode from '@/renderer/features/flowchart/components/drive-config-nodes/nodes/BaseRotToRotConverterNode';
import BaseRotToLinConverterNode from '@/renderer/features/flowchart/components/drive-config-nodes/nodes/BaseRotToLinConverterNode';
import OutputNode from '@/renderer/features/flowchart/components/drive-config-nodes/nodes/OutputNode';

// 個別にエクスポート
export { BaseRotationalActuatorNode };
export { BaseLinearActuatorNode };
export { BaseRotToRotConverterNode };
export { BaseRotToLinConverterNode };
export { OutputNode };

// Common
export * from '@/renderer/features/flowchart/components/drive-config-nodes/common';
export * from '@/renderer/features/flowchart/components/drive-config-nodes/DriveConfigBlocks';

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
