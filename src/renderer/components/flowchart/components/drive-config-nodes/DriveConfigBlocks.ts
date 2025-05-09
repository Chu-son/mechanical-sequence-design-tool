import { ConfigBlocks, NodeBlock } from '@/renderer/flowchart/types/nodeBlocks';

/**
 * Actuatorブロック定義
 * 駆動源となるノード（回転または直動の出力を持つ）
 */
const actuatorBlock: NodeBlock = {
  title: 'Actuator',
  partTypes: ['rotationalActuator', 'linearActuator'],
  nodes: [
    { type: 'simpleRotationalActuator', label: 'Simple Rotational Actuator' },
    { type: 'simpleLinearActuator', label: 'Simple Linear Actuator' },
  ],
};

/**
 * 回転→回転の変換ブロック定義
 */
const rotationalToRotationalBlock: NodeBlock = {
  title: 'Rotational to Rotational',
  partTypes: ['rotToRotConverter'],
  nodes: [{ type: 'simpleRotToRotConverter', label: 'Simple R→R Converter' }],
};

/**
 * 回転→直動の変換ブロック定義
 */
const rotationalToLinearBlock: NodeBlock = {
  title: 'Rotational to Linear',
  partTypes: ['rotToLinConverter'],
  nodes: [{ type: 'simpleRotToLinConverter', label: 'Simple R→L Converter' }],
};

/**
 * 直動→回転の変換ブロック定義
 */
const linearToRotationalBlock: NodeBlock = {
  title: 'Linear to Rotational',
  partTypes: ['linToRotConverter'],
  nodes: [],
};

/**
 * 直動→直動の変換ブロック定義
 */
const linearToLinearBlock: NodeBlock = {
  title: 'Linear to Linear',
  partTypes: ['linToLinConverter'],
  nodes: [],
};

/**
 * 出力ブロック定義
 */
const outputBlock: NodeBlock = {
  title: 'Output',
  nodes: [{ type: 'outputNode', label: 'Output' }],
};

/**
 * DriveConfig用のブロック定義をエクスポート
 */
export const driveConfigBlocks: ConfigBlocks = {
  blocks: [
    actuatorBlock,
    rotationalToRotationalBlock,
    rotationalToLinearBlock,
    linearToRotationalBlock,
    linearToLinearBlock,
    outputBlock,
  ],
};
