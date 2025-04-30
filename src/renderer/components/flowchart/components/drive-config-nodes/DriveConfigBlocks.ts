import { ConfigBlocks, NodeBlock } from '@/renderer/flowchart/types/nodeBlocks';

/**
 * Actuatorブロック定義
 * 駆動源となるノード（回転または直動の出力を持つ）
 */
const actuatorBlock: NodeBlock = {
  title: 'Actuator',
  nodes: [
    { type: 'simpleRotationalActuator', label: 'Simple Rotational Actuator' },
    { type: 'simpleLinearActuator', label: 'Simple Linear Actuator' },
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
    { type: 'simpleRotToRotConverter', label: 'Simple R→R Converter' },
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
    { type: 'simpleRotToLinConverter', label: 'Simple R→L Converter' },
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
    // simpleLinToRotConverterノードを削除
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
    // simpleLinToLinConverterノードを削除
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
