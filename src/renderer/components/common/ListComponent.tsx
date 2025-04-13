import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import '@/renderer/styles/Common.css';

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
  // 固定幅が指定されていない場合は均等に配分
  const columnWidths = headers.map(
    (header) => header.width || `${100 / headers.length}%`,
  );

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
              style={{ width: columnWidths[headerIndex] }}
              className="list-column"
            >
              {header.label}
            </span>
          ))}
        </div>
        <ul className="ListItems">
          {items.map((item) => {
            // リンクとしてレンダリングする場合
            if (item.to) {
              return (
                <li key={`item-${item.id}`}>
                  <Link to={item.to} className="list-row">
                    {item.columns.map((column, colIndex) => (
                      <span
                        key={`col-${item.id}-${colIndex}`}
                        style={{
                          width:
                            columnWidths[
                              colIndex < columnWidths.length
                                ? colIndex
                                : columnWidths.length - 1
                            ],
                        }}
                        className="list-column"
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
                  <div className="list-row">
                    {item.columns.map((column, colIndex) => (
                      <span
                        key={`col-${item.id}-${colIndex}`}
                        style={{
                          width:
                            columnWidths[
                              colIndex < columnWidths.length
                                ? colIndex
                                : columnWidths.length - 1
                            ],
                        }}
                        className="list-column"
                      >
                        {column.content}
                      </span>
                    ))}
                  </div>
                </li>
              );
            }

            // 通常の項目
            return (
              <li key={`item-${item.id}`}>
                <div className="list-row">
                  {item.columns.map((column, colIndex) => (
                    <span
                      key={`col-${item.id}-${colIndex}`}
                      style={{
                        width:
                          columnWidths[
                            colIndex < columnWidths.length
                              ? colIndex
                              : columnWidths.length - 1
                          ],
                      }}
                      className="list-column"
                    >
                      {column.content}
                    </span>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ListComponent;
