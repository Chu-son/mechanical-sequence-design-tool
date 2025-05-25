/**
 * ノードUIを宣言的に定義するための型定義
 */
import { ReactNode } from 'react';

/**
 * フィールドの型に応じた値の型を取得するユーティリティ型
 */
export type FieldValueType<T extends FieldType> = T extends 'number'
  ? number
  : T extends 'text'
    ? string
    : T extends 'select'
      ? string
      : any;

/**
 * フィールドの種類
 */
export type FieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'readonly'
  | 'chart'
  | 'custom'
  | 'divider'
  | 'partSelector'; // 駆動部品選択用フィールドタイプを追加

/**
 * フィールド定義の基本インターフェース
 */
interface BaseFieldDefinition {
  key: string;
  label: string;
  description?: string;
  required?: boolean;
}

/**
 * 入力フィールド定義
 */
export interface InputFieldDefinition extends BaseFieldDefinition {
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  defaultValue?: any;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  displayDigits?: number; // 数値表示時の丸め桁数（省略時はROUND_DIGITS）
  getValue: (data: any) => any;
  setValue: (value: any, data: any) => any;
  validation?: (value: any, data: any) => string | null;
  onChange?: (value: any, data: any, update: (newData: any) => void) => void;
  readonly?: boolean | ((data: any) => boolean);
  hidden?: boolean | ((data: any) => boolean);
  customRender?: (
    data: any,
    update: (newData: any) => void,
    readonly?: boolean,
  ) => ReactNode;
  group?: string;
  condition?: (data: any) => boolean;
}

export interface ReadonlyFieldDefinition extends BaseFieldDefinition {
  type: 'readonly';
  unit?: string;
  displayDigits?: number; // 数値表示時の丸め桁数（省略時はROUND_DIGITS）
  getValue: (data: any) => any;
  formatValue?: (value: any, data?: any) => string;
  hidden?: boolean | ((data: any) => boolean);
  customRender?: (data: any) => ReactNode;
  group?: string;
  condition?: (data: any) => boolean;
}

export interface ChartFieldDefinition extends BaseFieldDefinition {
  type: 'chart';
  height?: number;
  width?: number;
  getData: (data: any) => any[];
  renderChart: (chartData: any[], data: any) => ReactNode;
  hidden?: boolean | ((data: any) => boolean);
  group?: string;
  condition?: (data: any) => boolean;
}

export interface CustomFieldDefinition extends BaseFieldDefinition {
  type: 'custom';
  render: (
    data: any,
    update: (newData: any) => void,
    readonly?: boolean,
  ) => ReactNode;
  hidden?: boolean | ((data: any) => boolean);
  group?: string;
  condition?: (data: any) => boolean;
}

/**
 * 区切り線フィールド定義
 */
export interface DividerFieldDefinition
  extends Omit<BaseFieldDefinition, 'label'> {
  type: 'divider';
  label?: string; // 区切り線に表示する任意のラベル
  hidden?: boolean | ((data: any) => boolean);
  group?: string;
  condition?: (data: any) => boolean;
}

/**
 * 駆動部品選択フィールド定義
 * 部品データベースから部品を選択してノードデータと連携するためのフィールド
 */
export interface PartSelectorFieldDefinition extends BaseFieldDefinition {
  type: 'partSelector';
  partType?: string; // 部品種別（フィルタリング用）
  getValue: (data: any) => number | null; // 選択された部品ID
  setValue: (value: number | null, data: any) => any; // 部品IDを設定
  onPartSelect?: (
    partId: number,
    partData: any,
    nodeData: any,
    update: (newData: any) => void,
  ) => void; // 部品選択時のコールバック
  hidden?: boolean | ((data: any) => boolean);
  readonly?: boolean | ((data: any) => boolean);
  group?: string;
  condition?: (data: any) => boolean;
}

/**
 * ノードフィールド定義の共用型
 */
export type NodeFieldDefinition =
  | InputFieldDefinition
  | ReadonlyFieldDefinition
  | ChartFieldDefinition
  | CustomFieldDefinition
  | DividerFieldDefinition
  | PartSelectorFieldDefinition; // 駆動部品選択フィールドを追加

/**
 * グループの表示オプション
 */
export interface GroupDisplayOptions {
  showTitle?: boolean;
  showDivider?: boolean;
  className?: string;
}

/**
 * ノード定義インターフェース
 */
export interface NodeDefinition {
  type: string; // ノードタイプ
  title: string; // ノードタイトル
  // フィールド定義の配列
  fields: NodeFieldDefinition[];
  // グループのタイトル定義（オプション）
  groupTitles?: Record<string, string>;
  // グループの表示オプション（オプション）
  groupDisplayOptions?: Record<string, GroupDisplayOptions>;
  // target/sourceハンドルの有効・無効
  handles?: {
    target?: boolean;
    source?: boolean;
  };
  // 前段ノードから伝播するフィールド名と保存先のマッピング
  // { 前段ノードのフィールド名: 自ノードでの保存先フィールド名 } という形式
  // 例: { 'outputSpec': 'prevOutputSpec' } で前段ノードのoutputSpecを自ノードのprevOutputSpecとして格納
  propagateFields?: Record<string, string>;
  // 初期データ生成関数
  getInitialData?: () => any;
  // データ更新後の計算処理
  compute?: (data: any, nodeId: string, update: (newData: any) => void) => void;
}

/**
 * BaseNodeのProps
 */
export interface BaseNodeProps {
  id: string;
  data: any;
  definition: NodeDefinition;
  className?: string;
  // 追加のハンドルなどをレンダリングするための関数
  renderHandles?: (id: string, data: any) => ReactNode;
  // 追加のカスタムUIをレンダリングするための関数
  renderCustomUI?: (id: string, data: any) => ReactNode;
  // ノードデータの更新関数
  updateNodeData: (nodeId: string, newData: any) => void;
}
