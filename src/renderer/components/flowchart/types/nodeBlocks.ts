/**
 * ノードブロックの型定義
 * title: ブロックのタイトル
 * nodes: ブロックに含まれるノードの配列
 */
export interface NodeBlock {
  title: string;
  nodes: Array<NodeInfo>;
  partTypes?: string[];
}

/**
 * ノード情報の型定義
 */
export interface NodeInfo {
  baseNodeType: string; // ノードの実装タイプ（コンポーネント指定用）
  label: string; // UI表示用のラベル
  configId?: number; // 駆動軸構成のIDなど、オプションの追加情報
  partId?: number; // 部品ID（parts.jsonからの部品の場合）
  isPart?: boolean; // 部品ノードかどうか
  displayName?: string; // 表示名（カスタム名称がある場合）
  [key: string]: any; // その他の追加情報を許容する
}

/**
 * 設定タイプごとのブロック定義の型
 */
export interface ConfigBlocks {
  blocks: NodeBlock[];
}
