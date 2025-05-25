import { DriveConfig } from '@/renderer/types/databaseTypes';
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
 * Visualization ブロック定義
 * グラフやデータ可視化用のノードを含む
 */
const visualizationBlock: NodeBlock = {
  title: 'Visualization',
  nodes: [{ type: 'velocityChart', label: 'Velocity Chart' }],
};

/**
 * DriveComponentsブロックを作成する関数
 * @param driveConfigs DriveConfigの配列（データベースから取得）
 * @returns DriveComponentsブロック
 */
const createDriveComponentsBlock = (
  driveConfigs: DriveConfig[] = [],
): NodeBlock => {
  return {
    title: 'Drive Components',
    nodes: driveConfigs.map((config) => ({
      type: 'simpleLinearActuator', // すべてSimpleLinearActuatorとして扱う
      label: config.label,
      configId: config.id, // 後で参照できるようにconfigIdを保持
    })),
  };
};

/**
 * OperationConfig用のブロック定義を生成する関数
 * @param driveConfigs DriveConfigの配列（データベースから取得）
 * @returns ConfigBlocks
 */
export const getOperationConfigBlocks = (
  driveConfigs: DriveConfig[] = [],
): ConfigBlocks => {
  const blocks = [commonBlock, conceptBlock, visualizationBlock];

  if (driveConfigs.length > 0) {
    blocks.push(createDriveComponentsBlock(driveConfigs));
  }

  return {
    blocks,
  };
};
