import { ReactNode } from 'react';

export type SidebarItemType = 'project' | 'drive' | 'operation' | 'subunit';

export interface SidebarItem {
  id: string;
  type: SidebarItemType;
  title: string;
  icon: string;
  content?: ReactNode;
  isOpen?: boolean;
}
