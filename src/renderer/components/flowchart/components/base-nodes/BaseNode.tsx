/**
 * ノードUIを宣言的に定義するための基本コンポーネント
 */
import React, { useEffect, useCallback, useState } from 'react';
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
  PartSelectorFieldDefinition,
} from './types';
import '@/renderer/styles/FlowchartTheme.css';
import {
  roundToDigits,
  ROUND_DIGITS,
} from '@/renderer/components/flowchart/common/flowchartUtils';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import { DrivePart, Manufacturer } from '@/renderer/types/databaseTypes';

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
    displayDigits,
  } = field;
  let value = getValue(data);

  // 数値型の場合、表示時に丸める処理を追加
  if (type === 'number' && typeof value === 'number') {
    // displayDigitsが指定されていればその値で、なければROUND_DIGITSで丸める
    value = roundToDigits(value, displayDigits ?? ROUND_DIGITS);
  }

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
  const { key, label, getValue, formatValue, unit, displayDigits } = field;
  let value = getValue(data);

  // 数値の場合、表示時に丸める処理を追加
  if (typeof value === 'number') {
    // displayDigitsが指定されていればその値で、なければROUND_DIGITSで丸める
    value = roundToDigits(value, displayDigits ?? ROUND_DIGITS);
  }

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

/**
 * 駆動部品選択フィールドをレンダリングする関数
 */
const renderPartSelectorField = (
  field: PartSelectorFieldDefinition,
  data: any,
  updateData: (newData: any) => void,
  id: string,
  readonly?: boolean,
) => {
  const { key, label, partType, getValue, setValue, required } = field;
  const fieldId = `${id}-${key}`;
  const selectedPartId = getValue(data);

  const [parts, setParts] = useState<DrivePart[]>([]);
  const [selectedPart, setSelectedPart] = useState<DrivePart | null>(null);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);

  // 部品データとメーカーデータを読み込む
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const database = DatabaseFactory.createDatabase();
        // 部品種別が指定されていればフィルタリング
        const partsList = partType
          ? await database.getParts(partType as any)
          : await database.getParts();
        const manufacturersList = await database.getManufacturers();

        setParts(partsList);
        setManufacturers(manufacturersList);

        // 選択中の部品がある場合、詳細データを取得
        if (selectedPartId) {
          const part = await database.getPartById(selectedPartId);
          setSelectedPart(part);
        }
      } catch (err) {
        console.error('部品データ読み込みエラー:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedPartId, partType]);

  // メーカー名を取得する関数
  const getManufacturerName = (manufacturerId: number): string => {
    const manufacturer = manufacturers.find((m) => m.id === manufacturerId);
    return manufacturer ? manufacturer.nameJa : '不明';
  };

  // 部品選択ハンドラ
  const handlePartChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (readonly) return;

    const partId = e.target.value ? parseInt(e.target.value, 10) : null;

    try {
      if (partId) {
        const database = DatabaseFactory.createDatabase();
        const part = await database.getPartById(partId);
        setSelectedPart(part);

        // データを更新
        const newData = setValue(partId, data);
        updateData(newData);

        // 選択コールバックがあれば実行
        if (field.onPartSelect && part) {
          field.onPartSelect(partId, part, newData, updateData);
        }
      } else {
        setSelectedPart(null);
        const newData = setValue(null, data);
        updateData(newData);
      }
    } catch (err) {
      console.error('部品データ取得エラー:', err);
    }
  };

  // 部品詳細表示
  const renderPartDetails = () => {
    if (!selectedPart) return null;

    return (
      <div className="part-details">
        <div className="part-info">
          <span className="part-model">{selectedPart.model}</span>
          <span className="part-manufacturer">
            {getManufacturerName(selectedPart.manufacturerId)}
          </span>
        </div>
        <a
          className="view-details-link"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // メインウィンドウに部品詳細ページを開くよう要求
            if (window.electron) {
              window.electron.ipcRenderer.invoke(
                'open-part-details',
                selectedPart.id,
              );
            }
          }}
        >
          詳細を表示
        </a>
      </div>
    );
  };

  return (
    <div key={fieldId} className="node-setting-field part-selector-field">
      <label htmlFor={fieldId}>
        {label}
        {required && <span className="required">*</span>}
      </label>

      <div className="input-container">
        {loading ? (
          <div className="loading-indicator">読み込み中...</div>
        ) : (
          <>
            <select
              id={fieldId}
              value={selectedPartId?.toString() || ''}
              onChange={handlePartChange}
              disabled={readonly}
            >
              <option value="">部品を選択してください</option>
              {parts.map((part) => (
                <option key={part.id} value={part.id.toString()}>
                  {part.model} ({getManufacturerName(part.manufacturerId)})
                </option>
              ))}
            </select>
            {selectedPart && renderPartDetails()}
          </>
        )}
      </div>
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

// isPartがtrueなら全フィールドをreadonlyにする
function applyReadonlyForPart(
  fields: NodeFieldDefinition[],
  data: any,
): NodeFieldDefinition[] {
  if (!data?.isPart) return fields;
  return fields.map((field) => {
    // forceEditableがtrueならreadonly化しない
    if ((field as any).forceEditable) return field;
    return { ...field, readonly: true };
  });
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
    case 'partSelector':
      return renderPartSelectorField(field, data, updateData, id, readonly);
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

  // fieldsをisPartなら全readonly化
  const processedFields = applyReadonlyForPart(definition.fields, data);
  const grouped = groupFields(processedFields, data);

  return (
    <div className={`node ${className} ${readonly ? 'readonly' : ''}`}>
      {/* targetハンドル（デフォルトtrue） */}
      {(definition.handles?.target ?? true) && (
        <Handle type="target" position={Position.Top} id="top" />
      )}

      {/* カスタムハンドル */}
      {renderHandles && renderHandles(id, data)}

      {/* ノードタイトル */}
      <div className="node-title">
        {data.label ? data.label : definition.title}
      </div>

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
