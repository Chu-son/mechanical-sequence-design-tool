/**
 * ノードUIを宣言的に定義するための基本コンポーネント
 */
import React, { useEffect, useCallback } from 'react';
import {
  Handle,
  Position,
  useNodeConnections,
  useNodesData,
} from '@xyflow/react';
import {
  BaseNodeProps,
  NodeFieldDefinition,
  InputFieldDefinition,
  ReadonlyFieldDefinition,
  ChartFieldDefinition,
  DividerFieldDefinition,
} from './types';
import '@/renderer/components/flowchart/styles/common.css';

/**
 * 入力フィールドをレンダリングする関数
 */
const renderInputField = (
  field: InputFieldDefinition,
  data: any,
  updateData: (newData: any) => void,
  id: string,
  readonly?: boolean,
) => {
  const {
    key,
    label,
    type,
    placeholder,
    options,
    unit,
    min,
    max,
    step,
    required,
    getValue,
    setValue,
  } = field;
  const value = getValue(data);
  const fieldId = `${id}-${key}`;

  // ラベルと単位を組み合わせて表示用のラベルを作成
  const displayLabel = unit ? `${label} [${unit}]` : label;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (readonly) return;
    let newValue: string | number = e.target.value;

    if (type === 'number' && e.target.value) {
      newValue = parseFloat(e.target.value);
    }

    // 新しいデータを生成
    const newData = setValue(newValue, data);

    // データを更新
    updateData(newData);

    // 追加のコールバックを実行
    if (field.onChange) {
      field.onChange(newValue, newData, updateData);
    }
  };

  return (
    <div key={fieldId} className="node-setting-field">
      <label htmlFor={fieldId}>
        {displayLabel}
        {required && <span className="required">*</span>}
      </label>

      {type === 'select' ? (
        <div className="input-container">
          <select
            id={fieldId}
            value={value}
            onChange={handleChange}
            disabled={readonly}
          >
            {options?.map((option) => (
              <option key={`${fieldId}-${option.value}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="input-container">
          <input
            id={fieldId}
            type={type}
            value={value}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            onChange={handleChange}
            readOnly={readonly}
            disabled={readonly}
          />
        </div>
      )}
    </div>
  );
};

/**
 * 読み取り専用フィールドをレンダリングする関数
 */
const renderReadonlyField = (
  field: ReadonlyFieldDefinition,
  data: any,
  id: string,
) => {
  const { key, label, getValue, formatValue, unit } = field;
  const value = getValue(data);
  const displayValue = formatValue ? formatValue(value) : value;

  // ラベルと単位を組み合わせて表示用のラベルを作成
  const displayLabel = unit ? `${label} [${unit}]` : label;

  return (
    <div key={`${id}-${key}`} className="node-readonly-field">
      <div>
        {displayLabel}: {displayValue}
      </div>
    </div>
  );
};

/**
 * チャートフィールドをレンダリングする関数
 */
const renderChartField = (
  field: ChartFieldDefinition,
  data: any,
  id: string,
) => {
  const {
    key,
    label,
    getData,
    renderChart,
    height = 200,
    width = '100%',
  } = field;
  const chartData = getData(data);

  return (
    <div key={`${id}-${key}`} className="node-chart-field">
      {label && <div className="chart-label">{label}</div>}
      <div style={{ height, width }}>{renderChart(chartData, data)}</div>
    </div>
  );
};

/**
 * 区切り線をレンダリングする関数
 */
const renderDivider = (field: DividerFieldDefinition, id: string) => {
  const { key, label } = field;

  return (
    <div key={`${id}-${key}`} className="node-divider">
      <hr />
      {label && <div className="divider-label">{label}</div>}
    </div>
  );
};

const shouldFieldBeHidden = (field: NodeFieldDefinition, data: any) => {
  if (typeof field.hidden === 'function') return field.hidden(data);
  if (typeof field.hidden === 'boolean') return field.hidden;
  if (typeof field.condition === 'function') return !field.condition(data);
  return false;
};

// getFieldReadonlyの型ガード
function getFieldReadonly(
  field: NodeFieldDefinition,
  data: any,
  nodeReadonly: boolean,
): boolean {
  // 'readonly'プロパティを持つ型かどうかを判定
  if ('readonly' in field) {
    const f = field as { readonly?: boolean | ((data: any) => boolean) };
    if (typeof f.readonly === 'function')
      return f.readonly(data) || nodeReadonly;
    if (typeof f.readonly === 'boolean') return f.readonly || nodeReadonly;
  }
  return nodeReadonly;
}

const renderField = (
  field: NodeFieldDefinition,
  data: any,
  updateData: (newData: any) => void,
  id: string,
  nodeReadonly?: boolean,
) => {
  if (shouldFieldBeHidden(field, data)) return null;
  const readonly = getFieldReadonly(field, data, nodeReadonly);

  if ('customRender' in field && typeof field.customRender === 'function') {
    return (
      <div key={field.key} className="node-custom-field">
        {field.customRender(data, updateData, readonly)}
      </div>
    );
  }

  switch (field.type) {
    case 'text':
    case 'number':
    case 'select':
      return renderInputField(field, data, updateData, id, readonly);
    case 'readonly':
      if (field.customRender) return field.customRender(data);
      return renderReadonlyField(field, data, id);
    case 'chart':
      return renderChartField(field, data, id);
    case 'custom':
      return field.render(data, updateData, readonly);
    case 'divider':
      return renderDivider(field, id);
    default:
      return null;
  }
};

const groupFields = (fields: NodeFieldDefinition[], data: any) => {
  const groups: { [key: string]: NodeFieldDefinition[] } = {};
  fields.forEach((f: NodeFieldDefinition) => {
    if (shouldFieldBeHidden(f, data)) return;
    const group = f.group || '_default';
    if (!groups[group]) groups[group] = [];
    groups[group].push(f);
  });
  return groups;
};

/**
 * ノードの基本コンポーネント
 * 定義に基づいてUI要素を動的に生成する
 */
const BaseNode: React.FC<BaseNodeProps & { readonly?: boolean }> = ({
  id,
  data,
  definition,
  className = '',
  renderHandles,
  renderCustomUI,
  updateNodeData,
  readonly = false,
}) => {
  // 初期化前は何も描画しない
  if (!data || Object.keys(data).length === 0) {
    return <div className="node-loading">Loading...</div>;
  }

  // ノードデータの更新関数
  const handleUpdateData = useCallback(
    (newData: any) => {
      updateNodeData(id, newData);
    },
    [id, updateNodeData],
  );

  // 前段ノードからのデータ伝播を処理（propagateFieldsが定義されている場合）
  const connections = useNodeConnections({ nodeId: id, handleType: 'target' });
  const prevNodeId = connections?.[0]?.source;
  const prevNodeData = useNodesData(prevNodeId);

  // 前段ノードのデータを自ノードに伝播
  useEffect(() => {
    if (!definition.propagateFields || !prevNodeData || !prevNodeData.data)
      return;

    // 伝播対象フィールドの値を比較し、変更があれば更新
    let needsUpdate = false;
    const newData = { ...data };

    // 前段ノードのフィールドを指定されたマッピングに従って保存
    for (const [sourceField, targetField] of Object.entries(
      definition.propagateFields,
    )) {
      // 前段ノードのデータが存在し、現在のノードの値と異なる場合に更新
      if (
        prevNodeData.data[sourceField] !== undefined &&
        JSON.stringify(data[targetField]) !==
          JSON.stringify(prevNodeData.data[sourceField])
      ) {
        newData[targetField] = prevNodeData.data[sourceField];
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      updateNodeData(id, newData);
    }
  }, [id, data, prevNodeData, definition.propagateFields, updateNodeData]);

  // 計算処理を実行
  useEffect(() => {
    if (definition.compute) {
      definition.compute(data, id, handleUpdateData);
    }
  }, [data, id, definition, handleUpdateData]);

  const grouped = groupFields(definition.fields, data);

  return (
    <div className={`node ${className} ${readonly ? 'readonly' : ''}`}>
      {/* targetハンドル（デフォルトtrue） */}
      {(definition.handles?.target ?? true) && (
        <Handle type="target" position={Position.Top} id="top" />
      )}

      {/* カスタムハンドル */}
      {renderHandles && renderHandles(id, data)}

      {/* ノードタイトル */}
      <div className="node-title">{definition.title}</div>

      {/* ノードコンテンツ */}
      <div className="node-content">
        {/* グループごとにレンダリング */}
        {Object.entries(grouped).map(([group, fields], groupIndex) => {
          const groupTitle = definition.groupTitles?.[group];
          const groupOptions = definition.groupDisplayOptions?.[group] || {};
          const showTitle = groupOptions.showTitle && groupTitle;
          const showDivider =
            group !== '_default' &&
            (groupIndex > 0 || groupOptions.showDivider);
          const groupClassName = `${group !== '_default' ? `node-group node-group-${group}` : ''}`;

          return (
            <div key={group} className={groupClassName}>
              {/* グループ区切り線（1番目のグループ以外、または明示的に指定された場合） */}
              {showDivider && <hr className="node-group-divider" />}

              {/* グループタイトル（設定されている場合） */}
              {showTitle && <h4 className="node-group-title">{groupTitle}</h4>}

              {/* フィールドのレンダリング */}
              {fields.map((field: NodeFieldDefinition, fieldIndex: number) => {
                const rendered = renderField(
                  field,
                  data,
                  handleUpdateData,
                  id,
                  readonly,
                );
                return rendered
                  ? React.cloneElement(rendered as React.ReactElement, {
                      key: `${group}-${field.key ?? fieldIndex}`,
                    })
                  : null;
              })}
            </div>
          );
        })}

        {/* カスタムUI */}
        {renderCustomUI && renderCustomUI(id, data)}
      </div>

      {/* sourceハンドル（デフォルトtrue） */}
      {(definition.handles?.source ?? true) && (
        <Handle type="source" position={Position.Bottom} id="bottom" />
      )}
    </div>
  );
};

export default BaseNode;
