import { ConfigBlocks, NodeBlock } from '@/renderer/flowchart/types/nodeBlocks';

/**
 * Actuatorブロック定義
 * 駆動源となるノード（回転または直動の出力を持つ）
 */
const actuatorBlock: NodeBlock = {
  title: 'Actuator',
  partTypes: ['baseRotationalActuator', 'baseLinearActuator'],
  nodes: [
    // Simpleノード（baseNodeTypeのみで定義）
    {
      baseNodeType: 'baseRotationalActuator',
      label: 'Simple Rotational Actuator',
    },
    {
      baseNodeType: 'baseLinearActuator',
      label: 'Simple Linear Actuator',
    },
  ],
};

/**
 * 回転→回転の変換ブロック定義
 */
const rotationalToRotationalBlock: NodeBlock = {
  title: 'Rotational to Rotational',
  partTypes: ['baseRotToRotConverter'],
  nodes: [
    {
      baseNodeType: 'baseRotToRotConverter',
      label: 'Simple R→R Converter',
    },
  ],
};

/**
 * 回転→直動の変換ブロック定義
 */
const rotationalToLinearBlock: NodeBlock = {
  title: 'Rotational to Linear',
  partTypes: ['baseRotToLinConverter'],
  nodes: [
    {
      baseNodeType: 'baseRotToLinConverter',
      label: 'Simple R→L Converter',
    },
  ],
};

/**
 * 直動→回転の変換ブロック定義
 */
const linearToRotationalBlock: NodeBlock = {
  title: 'Linear to Rotational',
  partTypes: ['baseLinToRotConverter'],
  nodes: [],
};

/**
 * 直動→直動の変換ブロック定義
 */
const linearToLinearBlock: NodeBlock = {
  title: 'Linear to Linear',
  partTypes: ['baseLinToLinConverter'],
  nodes: [],
};

/**
 * 出力ブロック定義
 */
const outputBlock: NodeBlock = {
  title: 'Output',
  nodes: [{ baseNodeType: 'outputNode', label: 'Output' }],
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
