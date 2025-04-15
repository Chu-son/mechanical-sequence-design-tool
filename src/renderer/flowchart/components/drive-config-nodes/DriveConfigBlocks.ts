import { ConfigBlocks, NodeBlock } from '@/renderer/flowchart/types/nodeBlocks';

/**
 * Common ブロック定義
 * Start と End ノードを含む
 */
const commonBlock: NodeBlock = {
  title: 'Common',
  nodes: [
    { type: 'rootNode', label: 'Start' },
    { type: 'outputNode', label: 'End' },
  ],
};

/**
 * Concept ブロック定義
 * 接頭語が Simple のノードを含む
 */
const conceptBlock: NodeBlock = {
  title: 'Concept',
  nodes: [{ type: 'simpleLinearActuator', label: 'Simple Linear Actuator' }],
};

/**
 * DriveConfig用のブロック定義をエクスポート
 */
export const driveConfigBlocks: ConfigBlocks = {
  blocks: [commonBlock, conceptBlock],
};
