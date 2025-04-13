import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Common.css';

// リスト項目の型定義
export interface ListItemProps {
  id: number;
  columns: {
    content: ReactNode;
    width?: string;
  }[];
  to?: string;
  onClick?: () => void;
}

// リストコンポーネントのプロパティ
interface ListComponentProps {
  headers: {
    label: string;
    width?: string;
  }[];
  items: ListItemProps[];
  title?: string;
  onAddNew?: () => void;
  addButtonLabel?: string;
}

// 共通リストコンポーネント
const ListComponent: React.FC<ListComponentProps> = ({
  headers,
  items,
  title,
  onAddNew,
  addButtonLabel = '新規作成',
}) => {
  return (
    <div className="DetailPage">
      {(title || onAddNew) && (
        <div className="Header">
          {title && <h1>{title}</h1>}
          {onAddNew && (
            <button type="button" onClick={onAddNew}>
              {addButtonLabel}
            </button>
          )}
        </div>
      )}
      <div className="List">
        <div className="ListHeader">
          {headers.map((header, headerIndex) => (
            <span
              key={`header-${headerIndex}`}
              style={header.width ? { width: header.width } : undefined}
            >
              {header.label}
            </span>
          ))}
        </div>
        <ul>
          {items.map((item) => {
            // リンクとしてレンダリングする場合
            if (item.to) {
              return (
                <li key={`item-${item.id}`}>
                  <Link to={item.to}>
                    {item.columns.map((column, colIndex) => (
                      <span
                        key={`col-${item.id}-${colIndex}`}
                        style={
                          column.width ? { width: column.width } : undefined
                        }
                      >
                        {column.content}
                      </span>
                    ))}
                  </Link>
                </li>
              );
            }

            // onClick イベントがある場合
            if (item.onClick) {
              return (
                <li
                  key={`item-${item.id}`}
                  onClick={item.onClick}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && item.onClick && item.onClick()
                  }
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                >
                  {item.columns.map((column, colIndex) => (
                    <span
                      key={`col-${item.id}-${colIndex}`}
                      style={column.width ? { width: column.width } : undefined}
                    >
                      {column.content}
                    </span>
                  ))}
                </li>
              );
            }

            // 通常の項目
            return (
              <li key={`item-${item.id}`}>
                {item.columns.map((column, colIndex) => (
                  <span
                    key={`col-${item.id}-${colIndex}`}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.content}
                  </span>
                ))}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ListComponent;
