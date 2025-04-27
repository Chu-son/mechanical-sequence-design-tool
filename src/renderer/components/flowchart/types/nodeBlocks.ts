/**
 * ノードブロックの型定義
 * title: ブロックのタイトル
 * nodes: ブロックに含まれるノードの配列
 */
export interface NodeBlock {
  title: string;
  nodes: Array<NodeInfo>;
}

/**
 * ノード情報の型定義
 */
export interface NodeInfo {
  type: string;
  label: string;
  configId?: number; // 駆動軸構成のIDなど、オプションの追加情報
  [key: string]: any; // その他の追加情報を許容する
}

/**
 * 設定タイプごとのブロック定義の型
 */
export interface ConfigBlocks {
  blocks: NodeBlock[];
}
