import { ReactNode } from 'react';
import { Location } from 'react-router-dom';

export type SidebarItemType = 'project' | 'flowchart-nodes';

// サイドバーアイコンの有効/無効判定に使用するコンテキスト情報の型
export interface SidebarContext {
  currentPath: string;
  // 将来的に追加される可能性のある情報
  [key: string]: any;
}

export interface SidebarItem {
  id: string;
  type: SidebarItemType;
  title: string;
  icon: string;
  content?: ReactNode;
  isOpen?: boolean;
  // 有効/無効状態を判定する関数
  isEnabled?: () => boolean;
  // サイドバーを自動で開くか判定する関数
  shouldAutoOpen?: (location: Location) => boolean;
  // サイドバーを自動でピン留めするか判定する関数
  shouldAutoPin?: (location: Location) => boolean;
}
