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
 * Actuatorブロック定義
 * 駆動源となるノード（回転または直動の出力を持つ）
 */
const actuatorBlock: NodeBlock = {
  title: 'Actuator',
  nodes: [
    // 抽象的なノード（構想設計用）- 実装済み
    { type: 'simpleRotationalActuator', label: 'Simple Rotational Actuator' },
    { type: 'simpleLinearActuator', label: 'Simple Linear Actuator' },

    // 具体的なノード - 未実装
    /* TODO: 以下のノードは未実装
    { type: 'motorActuator', label: 'Motor' },
    { type: 'steppingMotorActuator', label: 'Stepping Motor' },
    { type: 'servoMotorActuator', label: 'Servo Motor' },
    { type: 'electricCylinder', label: 'Electric Cylinder' },
    { type: 'airCylinder', label: 'Air Cylinder' },
    */
  ],
};

/**
 * 回転→回転の変換ブロック定義
 */
const rotationalToRotationalBlock: NodeBlock = {
  title: 'Rotational to Rotational',
  nodes: [
    // 抽象的なノード（構想設計用）- 実装済み
    { type: 'simpleRotToRotConverter', label: 'Simple R→R Converter' },

    // 具体的なノード - 未実装
    /* TODO: 以下のノードは未実装
    { type: 'gearbox', label: 'Gearbox' },
    { type: 'pulleySystem', label: 'Pulley System' },
    { type: 'chainDrive', label: 'Chain Drive' },
    { type: 'beltDrive', label: 'Belt Drive' },
    */
  ],
};

/**
 * 回転→直動の変換ブロック定義
 */
const rotationalToLinearBlock: NodeBlock = {
  title: 'Rotational to Linear',
  nodes: [
    // 抽象的なノード（構想設計用）- 実装済み
    { type: 'simpleRotToLinConverter', label: 'Simple R→L Converter' },

    // 具体的なノード - 未実装
    /* TODO: 以下のノードは未実装
    { type: 'ballScrew', label: 'Ball Screw' },
    { type: 'leadScrew', label: 'Lead Screw' },
    { type: 'rackPinion', label: 'Rack & Pinion' },
    { type: 'cam', label: 'Cam' },
    */
  ],
};

/**
 * 直動→回転の変換ブロック定義
 */
const linearToRotationalBlock: NodeBlock = {
  title: 'Linear to Rotational',
  nodes: [
    // 抽象的なノード（構想設計用）- 実装済み
    { type: 'simpleLinToRotConverter', label: 'Simple L→R Converter' },

    // 具体的なノード - 未実装
    /* TODO: 以下のノードは未実装
    { type: 'crankMechanism', label: 'Crank Mechanism' },
    { type: 'rackPinionReverse', label: 'Rack & Pinion (Reverse)' },
    */
  ],
};

/**
 * 直動→直動の変換ブロック定義
 */
const linearToLinearBlock: NodeBlock = {
  title: 'Linear to Linear',
  nodes: [
    // 抽象的なノード（構想設計用）- 実装済み
    { type: 'simpleLinToLinConverter', label: 'Simple L→L Converter' },

    // 具体的なノード - 未実装
    /* TODO: 以下のノードは未実装
    { type: 'leverMechanism', label: 'Lever Mechanism' },
    { type: 'linkageMechanism', label: 'Linkage Mechanism' },
    { type: 'hydraulicSystem', label: 'Hydraulic System' },
    */
  ],
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
