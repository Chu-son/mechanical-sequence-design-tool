import { ReactNode } from 'react';
import ExpandIcon from '@/renderer/features/sidebar/components/ExpandIcon';
import { SidebarItemType } from '@/renderer/features/sidebar/components/types';

interface CategoryItemProps {
  type: SidebarItemType;
  label: string;
  expandKey: string;
  isExpanded: boolean;
  hasItems: boolean;
  onToggle: (key: string) => void;
  children: ReactNode;
}

const CategoryItem = ({
  type,
  label,
  expandKey,
  isExpanded,
  hasItems,
  onToggle,
  children,
}: CategoryItemProps) => {
  return (
    <li className="category-item" data-type={type}>
      <div className="category-header">
        <button
          type="button"
          className="toggle-button"
          onClick={() => onToggle(expandKey)}
        >
          <ExpandIcon isExpanded={isExpanded} />
        </button>
        <span>{label}</span>
      </div>
      {isExpanded && (
        <>
          {hasItems ? (
            <ul className="category-contents">{children}</ul>
          ) : (
            <div className="empty-category-message">項目がありません</div>
          )}
        </>
      )}
    </li>
  );
};

export default CategoryItem;
