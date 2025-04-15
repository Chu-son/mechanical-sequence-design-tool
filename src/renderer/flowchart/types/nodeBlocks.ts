/**
 * ノードブロックの型定義
 * title: ブロックのタイトル
 * nodes: ブロックに含まれるノードの配列
 */
export interface NodeBlock {
  title: string;
  nodes: Array<{
    type: string;
    label: string;
  }>;
}

/**
 * 設定タイプごとのブロック定義の型
 */
export interface ConfigBlocks {
  blocks: NodeBlock[];
}
