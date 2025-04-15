import { ConfigBlocks, NodeBlock } from '@/renderer/flowchart/types/nodeBlocks';

/**
 * Common ブロック定義
 * Start と End ノードを含む
 */
const commonBlock: NodeBlock = {
  title: 'Common',
  nodes: [
    { type: 'taskStart', label: 'Start' },
    { type: 'taskEnd', label: 'End' },
  ],
};

/**
 * Concept ブロック定義
 * 接頭語が Simple のノードを含む
 */
const conceptBlock: NodeBlock = {
  title: 'Concept',
  nodes: [
    { type: 'task', label: 'Simple Task' },
    { type: 'actuatorTask', label: 'Simple Actuator Task' },
  ],
};

/**
 * OperationConfig用のブロック定義をエクスポート
 */
export const operationConfigBlocks: ConfigBlocks = {
  blocks: [commonBlock, conceptBlock],
};
