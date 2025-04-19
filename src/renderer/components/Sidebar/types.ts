import { ReactNode } from 'react';

export type SidebarItemType = 'project' | 'flowchart-nodes';

export interface SidebarItem {
  id: string;
  type: SidebarItemType;
  title: string;
  icon: string;
  content?: ReactNode;
  isOpen?: boolean;
}
