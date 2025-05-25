import React, { useEffect, useRef, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
  Customized,
} from 'recharts';
import { VTCurve } from '@/renderer/types/driveTypes';
import BaseModal from '@/renderer/features/common/BaseModal';
import { validateNumericInput } from '@/renderer/features/flowchart/utils/common/flowchartUtils';
import './VTCurveEditor.css';

interface VTCurveEditorProps {
  value?: VTCurve;
  onChange: (vtCurve: VTCurve) => void;
  readonly?: boolean;
}

// 原点合わせ・キャリブレーション関連のstate型
interface CalibrationState {
  origin: { x: number; y: number } | null;
  xAxis: { x: number; y: number } | null;
  yAxis: { x: number; y: number } | null;
  originValue: { rpm: number; torque: number };
  xAxisValue: { rpm: number };
  yAxisValue: { torque: number };
  selectStep: 'origin' | 'xAxis' | 'yAxis' | null;
}

// XY軸範囲state型
interface AxisRangeState {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

// 画像・グラフ描画関連state型
interface PlotState {
  imageSize: { width: number; height: number } | null;
  plotArea: { width: number; height: number; left: number; top: number };
  plotOrigin: { x: number; y: number } | null;
}

// プロットエリアのマージン（背景画像の位置合わせ等で使用）
const PLOT_AREA_MARGIN = { left: 20, top: 20 };

// 型定義を先にまとめる
interface PointInputProps {
  value: number;
  onChange: (v: string) => void;
  disabled: boolean;
}
interface NumberInputProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}
interface CalibrationNumberInputProps {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

// テーブルの入力欄共通化
const PointInput = ({ value, onChange, disabled }: PointInputProps) => {
  const [inputValue, setInputValue] = useState<string>(value.toString());
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);
  if (disabled) return value.toFixed(2);
  return (
    <input
      type="number"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={(e) => onChange(e.target.value)}
      className="form-group"
    />
  );
};

const NumberInput = ({
  value,
  onChange,
  min,
  max,
  step,
  placeholder,
  style,
  disabled,
}: NumberInputProps) => {
  const [inputValue, setInputValue] = useState<string>(value.toString());
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);
  return (
    <input
      type="number"
      value={inputValue}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      style={style}
      disabled={disabled}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={() => {
        const validated = validateNumericInput(inputValue, min ?? 0);
        onChange(validated);
      }}
    />
  );
};

const CalibrationNumberInput = ({
  value,
  onChange,
  placeholder,
  style,
}: CalibrationNumberInputProps) => {
  const [inputValue, setInputValue] = useState<string>(value.toString());
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);
  return (
    <input
      type="number"
      value={inputValue}
      placeholder={placeholder}
      style={style}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={() => {
        const validated = validateNumericInput(inputValue, 0);
        onChange(validated);
      }}
    />
  );
};

// AxisRangeInputsのProps型名を変更し、props名の衝突を避ける
interface AxisRangeInputsComponentProps {
  axisRangeValue: AxisRangeState;
  setAxisRangeValue: React.Dispatch<React.SetStateAction<AxisRangeState>>;
  isReadonly: boolean;
}

// XY軸範囲入力UI（分割代入でpropsを受け取る）
function AxisRangeInputs({
  axisRangeValue,
  setAxisRangeValue,
  isReadonly,
}: AxisRangeInputsComponentProps) {
  if (isReadonly) return null;
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        marginBottom: 8,
      }}
    >
      <span>X軸範囲:</span>
      <NumberInput
        value={axisRangeValue.xMin}
        onChange={(v: number) =>
          setAxisRangeValue((prev) => ({ ...prev, xMin: v }))
        }
        placeholder="最小"
        style={{ width: 70 }}
      />
      <span>～</span>
      <NumberInput
        value={axisRangeValue.xMax}
        onChange={(v: number) =>
          setAxisRangeValue((prev) => ({ ...prev, xMax: v }))
        }
        placeholder="最大"
        style={{ width: 70 }}
      />
      <span style={{ marginLeft: 16 }}>Y軸範囲:</span>
      <NumberInput
        value={axisRangeValue.yMin}
        onChange={(v: number) =>
          setAxisRangeValue((prev) => ({ ...prev, yMin: v }))
        }
        placeholder="最小"
        style={{ width: 70 }}
      />
      <span>～</span>
      <NumberInput
        value={axisRangeValue.yMax}
        onChange={(v: number) =>
          setAxisRangeValue((prev) => ({ ...prev, yMax: v }))
        }
        placeholder="最大"
        style={{ width: 70 }}
      />
    </div>
  );
}

export default function VTCurveEditor({
  value: vtCurveProp = { points: [] },
  onChange,
  readonly = false,
}: VTCurveEditorProps) {
  const vtCurve = vtCurveProp;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- state定義ここから ---
  const [calibration, setCalibration] = useState<CalibrationState>({
    origin: null,
    xAxis: null,
    yAxis: null,
    originValue: { rpm: 0, torque: 0 },
    xAxisValue: { rpm: 0 },
    yAxisValue: { torque: 0 },
    selectStep: null,
  });
  const [axisRange, setAxisRange] = useState<AxisRangeState>({
    xMin: 0,
    xMax: 3000,
    yMin: 0,
    yMax: 10,
  });
  const [plot, setPlot] = useState<PlotState>({
    imageSize: null,
    plotArea: { width: 0, height: 0, left: 0, top: 0 },
    plotOrigin: null,
  });
  const [showOriginModal, setShowOriginModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  // --- state定義ここまで ---

  // --- ここでロジック関数を宣言 ---
  function getCalibratedImageStyle(): React.CSSProperties {
    const pxPerX = (axisRange.xMax - axisRange.xMin) / plot.plotArea.width;
    const pxPerY = (axisRange.yMax - axisRange.yMin) / plot.plotArea.height;
    const imgXPixel =
      (calibration.xAxis?.x || 0) - (calibration.origin?.x || 0);
    const imgXValue =
      (calibration.xAxisValue.rpm || 0) - (calibration.originValue.rpm || 0);
    const imgPxPerX = Math.abs(imgXValue / imgXPixel);
    const imgYPixel =
      (calibration.yAxis?.y || 0) - (calibration.origin?.y || 0);
    const imgYValue =
      (calibration.yAxisValue.torque || 0) -
      (calibration.originValue.torque || 0);
    const imgPxPerY = Math.abs(imgYValue / imgYPixel);
    const scaleX = pxPerX === 0 ? 1 : imgPxPerX / pxPerX;
    const scaleY = pxPerY === 0 ? 1 : imgPxPerY / pxPerY;
    const imgOriginX = calibration.origin?.x || 0;
    const imgOriginY = calibration.origin?.y || 0;
    const width =
      vtCurve.backgroundScale &&
      typeof vtCurve.backgroundScale.width === 'number'
        ? vtCurve.backgroundScale.width * scaleX
        : 'auto';
    const height =
      vtCurve.backgroundScale &&
      typeof vtCurve.backgroundScale.height === 'number'
        ? vtCurve.backgroundScale.height * scaleY
        : 'auto';
    const left =
      plot.plotArea.left + PLOT_AREA_MARGIN.left - imgOriginX * scaleX;
    const top =
      plot.plotArea.top +
      PLOT_AREA_MARGIN.top +
      plot.plotArea.height -
      imgOriginY * scaleY;
    return {
      position: 'absolute',
      left: typeof left === 'number' ? `${left}px` : left,
      top: typeof top === 'number' ? `${top}px` : top,
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      objectFit: 'fill',
      opacity: 0.5,
      pointerEvents: 'none',
      zIndex: 1,
    };
  }
  const updatePoint = (index: number, key: 'rpm' | 'torque', val: string) => {
    const numValue = validateNumericInput(val, 0);
    const points = vtCurve.points ? [...vtCurve.points] : [];
    points[index] = { ...points[index], [key]: numValue };
    points.sort((a, b) => a.rpm - b.rpm);
    onChange({ ...vtCurve, points });
  };
  const deletePoint = (index: number) => {
    const points = vtCurve.points ? [...vtCurve.points] : [];
    points.splice(index, 1);
    onChange({ ...vtCurve, points });
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...vtCurve, backgroundImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };
  const removeBackgroundImage = () => {
    onChange({
      ...vtCurve,
      backgroundImage: undefined,
      backgroundOrigin: undefined,
      backgroundXAxis: undefined,
      backgroundYAxis: undefined,
      backgroundScale: undefined,
    });
  };
  // --- ここまで ---

  // グラフ描画領域（plotArea）のサイズと位置をSVGから取得し、plot stateに反映する
  // 依存配列: 背景画像・原点・データ点・軸範囲が変化したときに再計算
  useEffect(() => {
    const svg = document.querySelector('.recharts-surface');
    if (!svg) return;
    const grid = svg.querySelector('g.recharts-cartesian-grid');
    if (!grid) return;
    const gridRect = grid.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    setPlot((prev) => ({
      ...prev,
      plotArea: {
        width: gridRect.width,
        height: gridRect.height,
        left: gridRect.left - svgRect.left,
        top: gridRect.top - svgRect.top,
      },
      plotOrigin: {
        x: gridRect.left - svgRect.left,
        y: gridRect.bottom - svgRect.top,
      },
    }));
  }, [
    vtCurve.backgroundImage,
    vtCurve.backgroundOrigin,
    vtCurve.points,
    axisRange.xMin,
    axisRange.xMax,
    axisRange.yMin,
    axisRange.yMax,
  ]);

  // 画像ロード時のサイズ取得
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setPlot((prev) => ({
      ...prev,
      imageSize: { width: img.naturalWidth, height: img.naturalHeight },
    }));
  };

  // 画像クリック時のキャリブレーション点選択
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!plot.imageSize || !calibration.selectStep) return;
    const rect = (e.target as HTMLImageElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCalibration((prev) => {
      if (prev.selectStep === 'origin') {
        return { ...prev, origin: { x, y }, selectStep: null };
      } else if (prev.selectStep === 'xAxis') {
        return { ...prev, xAxis: { x, y }, selectStep: null };
      } else if (prev.selectStep === 'yAxis') {
        return { ...prev, yAxis: { x, y }, selectStep: null };
      }
      return prev;
    });
  };

  // 原点合わせ情報を保存
  const saveOrigin = () => {
    setModalError(null);

    const { origin, xAxis, yAxis, originValue, xAxisValue, yAxisValue } =
      calibration;
    if (!origin || !xAxis || !yAxis) {
      setModalError('全ての座標を選択してください');
      return;
    }
    if (
      Number.isNaN(originValue.rpm) ||
      Number.isNaN(originValue.torque) ||
      Number.isNaN(xAxisValue.rpm) ||
      Number.isNaN(yAxisValue.torque)
    ) {
      setModalError('全ての数値を入力してください');
      return;
    }
    const ox = origin.x;
    const oy = origin.y;
    const x1 = xAxis.x;
    const y1 = xAxis.y;
    const x2 = yAxis.x;
    const y2 = yAxis.y;
    const rpm0 = originValue.rpm;
    const tq0 = originValue.torque;
    const rpm1 = xAxisValue.rpm;
    const tq2 = yAxisValue.torque;
    const imgSize = plot.imageSize;
    const calcXMin = rpm0 - (ox * (rpm1 - rpm0)) / (x1 - ox);
    const calcXMax =
      rpm0 + ((imgSize ? imgSize.width - ox : 0) * (rpm1 - rpm0)) / (x1 - ox);
    const calcYMin =
      tq0 + ((imgSize ? imgSize.height - oy : 0) * (tq2 - tq0)) / (y2 - oy);
    const calcYMax = tq0 - (oy * (tq2 - tq0)) / (y2 - oy);
    onChange({
      ...vtCurve,
      backgroundOrigin: { x: ox, y: oy },
      backgroundXAxis: { x: x1, y: y1 },
      backgroundYAxis: { x: x2, y: y2 },
      backgroundScale: imgSize
        ? {
            xMin: calcXMin,
            xMax: calcXMax,
            yMin: calcYMin,
            yMax: calcYMax,
            width: imgSize.width,
            height: imgSize.height,
          }
        : undefined,
    });
    setShowOriginModal(false);
  };

  // グラフUI
  function renderChart() {
    return (
      <div
        className="container vt-curve-graph-container"
        style={{ position: 'relative' }}
      >
        {vtCurve.backgroundImage && (
          <img
            src={vtCurve.backgroundImage}
            alt="Background"
            className="vt-curve-background-image"
            style={getCalibratedImageStyle()}
            onLoad={handleImageLoad}
          />
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={vtCurve.points || []}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="rpm"
              label={{ value: '回転数 [rpm]', position: 'bottom' }}
              type="number"
              domain={[
                Number.isNaN(axisRange.xMin) ? 0 : axisRange.xMin,
                Number.isNaN(axisRange.xMax) ? 3000 : axisRange.xMax,
              ]}
            />
            <YAxis
              label={{ value: 'トルク [N・m]', angle: -90, position: 'left' }}
              type="number"
              domain={[
                Number.isNaN(axisRange.yMin) ? 0 : axisRange.yMin,
                Number.isNaN(axisRange.yMax) ? 10 : axisRange.yMax,
              ]}
            />
            <Tooltip />
            <Legend />
            {(vtCurve.points || []).length > 0 && (
              <Line
                type="monotone"
                dataKey="torque"
                stroke="#8884d8"
                name="トルク"
                connectNulls
              />
            )}
            {(vtCurve.points || []).length > 0 && (
              <Scatter
                name="データポイント"
                data={vtCurve.points || []}
                fill="#8884d8"
                shape="circle"
                dataKey="torque"
              />
            )}
            <Customized
              component={() =>
                plot.plotOrigin ? (
                  <circle
                    cx={plot.plotOrigin.x}
                    cy={plot.plotOrigin.y}
                    r={6}
                    fill="red"
                    stroke="black"
                    strokeWidth={2}
                  />
                ) : null
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // テーブルUI
  function renderTable() {
    return (
      <div className="vt-curve-table-container container">
        <table className="vt-curve-table">
          <thead>
            <tr>
              <th>回転数 (rpm)</th>
              <th>トルク (N・m)</th>
              {!readonly && <th>操作</th>}
            </tr>
          </thead>
          <tbody>
            {(vtCurve.points || []).map((point, idx) => (
              <tr key={`${point.rpm}-${point.torque}`}>
                <td>
                  <PointInput
                    value={point.rpm}
                    onChange={(val) => updatePoint(idx, 'rpm', val)}
                    disabled={readonly}
                  />
                </td>
                <td>
                  <PointInput
                    value={point.torque}
                    onChange={(val) => updatePoint(idx, 'torque', val)}
                    disabled={readonly}
                  />
                </td>
                {!readonly && (
                  <td>
                    <button
                      type="button"
                      className="vt-curve-delete-button"
                      onClick={() => deletePoint(idx)}
                    >
                      削除
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {(vtCurve.points || []).length === 0 && (
              <tr>
                <td colSpan={readonly ? 2 : 3} className="no-data">
                  データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // showOriginModalがtrueになったときにselectStepを初期化
  useEffect(() => {
    if (showOriginModal) {
      setCalibration((prev) => {
        if (!prev.origin) return { ...prev, selectStep: 'origin' };
        if (!prev.xAxis) return { ...prev, selectStep: 'xAxis' };
        if (!prev.yAxis) return { ...prev, selectStep: 'yAxis' };
        return { ...prev, selectStep: null };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOriginModal]);

  // 原点合わせモーダルUI
  function renderCalibrationModal() {
    // 画像上に選択済み点を描画するコンポーネント
    const renderCalibrationPoints = () => {
      if (!plot.imageSize) return null;
      const pointStyle = (color: string): React.CSSProperties => ({
        position: 'absolute',
        width: 14,
        height: 14,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        background: color,
        opacity: 0.7,
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
        pointerEvents: 'none' as 'none',
      });
      const labelStyle: React.CSSProperties = {
        position: 'absolute',
        fontSize: 12,
        color: '#222',
        background: 'rgba(255,255,255,0.8)',
        padding: '0 2px',
        borderRadius: 2,
        transform: 'translate(-50%, -120%)',
        zIndex: 3,
        pointerEvents: 'none' as 'none',
      };
      return (
        <>
          {calibration.origin && (
            <>
              <div
                style={{
                  ...pointStyle('red'),
                  left: calibration.origin.x,
                  top: calibration.origin.y,
                }}
              />
              <div
                style={{
                  ...labelStyle,
                  left: calibration.origin.x,
                  top: calibration.origin.y,
                }}
              >
                原点
              </div>
            </>
          )}
          {calibration.xAxis && (
            <>
              <div
                style={{
                  ...pointStyle('blue'),
                  left: calibration.xAxis.x,
                  top: calibration.xAxis.y,
                }}
              />
              <div
                style={{
                  ...labelStyle,
                  left: calibration.xAxis.x,
                  top: calibration.xAxis.y,
                }}
              >
                X軸
              </div>
            </>
          )}
          {calibration.yAxis && (
            <>
              <div
                style={{
                  ...pointStyle('green'),
                  left: calibration.yAxis.x,
                  top: calibration.yAxis.y,
                }}
              />
              <div
                style={{
                  ...labelStyle,
                  left: calibration.yAxis.x,
                  top: calibration.yAxis.y,
                }}
              >
                Y軸
              </div>
            </>
          )}
        </>
      );
    };

    // 画像クリック時のキャリブレーション点選択（順次遷移）
    const handleCalibrationImageClick = (
      e: React.MouseEvent<HTMLImageElement>,
    ) => {
      if (!plot.imageSize || !calibration.selectStep) return;
      const rect = (e.target as HTMLImageElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCalibration((prev) => {
        if (prev.selectStep === 'origin') {
          return { ...prev, origin: { x, y }, selectStep: 'xAxis' };
        } else if (prev.selectStep === 'xAxis') {
          return { ...prev, xAxis: { x, y }, selectStep: 'yAxis' };
        } else if (prev.selectStep === 'yAxis') {
          return { ...prev, yAxis: { x, y }, selectStep: null };
        }
        return prev;
      });
    };

    return (
      <BaseModal
        isOpen={showOriginModal}
        onClose={() => setShowOriginModal(false)}
        title="原点・基準点合わせ"
      >
        <div style={{ textAlign: 'center' }}>
          {vtCurve.backgroundImage && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={vtCurve.backgroundImage}
                alt="origin"
                style={{
                  border: '1px solid #ccc',
                  cursor: 'crosshair',
                  display: 'block',
                }}
                onClick={handleCalibrationImageClick}
                onLoad={handleImageLoad}
              />
              {renderCalibrationPoints()}
            </div>
          )}
          <div style={{ margin: 12 }}>
            <button
              type="button"
              className={
                calibration.selectStep === 'origin'
                  ? 'app-button active'
                  : 'app-button'
              }
              onClick={() =>
                setCalibration((prev) => ({ ...prev, selectStep: 'origin' }))
              }
            >
              原点を選択
            </button>
            <span
              style={{
                fontWeight:
                  calibration.selectStep === 'origin' ? 'bold' : undefined,
                marginLeft: 8,
              }}
            >
              原点
            </span>
            <span style={{ marginLeft: 8 }}>
              {calibration.origin
                ? `${calibration.origin.x.toFixed(0)}, ${calibration.origin.y.toFixed(0)}`
                : '未設定'}
            </span>
            <CalibrationNumberInput
              value={calibration.originValue.rpm}
              onChange={(v) =>
                setCalibration((prev) => ({
                  ...prev,
                  originValue: { ...prev.originValue, rpm: v },
                }))
              }
              placeholder="rpm"
              style={{ width: 70, marginLeft: 8 }}
            />
            <span style={{ marginLeft: 2 }}>rpm</span>
            <CalibrationNumberInput
              value={calibration.originValue.torque}
              onChange={(v) =>
                setCalibration((prev) => ({
                  ...prev,
                  originValue: { ...prev.originValue, torque: v },
                }))
              }
              placeholder="torque"
              style={{ width: 70, marginLeft: 4 }}
            />
            <span style={{ marginLeft: 2 }}>N・m</span>
          </div>
          <div style={{ margin: 12 }}>
            <button
              type="button"
              className={
                calibration.selectStep === 'xAxis'
                  ? 'app-button active'
                  : 'app-button'
              }
              onClick={() =>
                setCalibration((prev) => ({ ...prev, selectStep: 'xAxis' }))
              }
            >
              X軸基準点を選択
            </button>
            <span
              style={{
                fontWeight:
                  calibration.selectStep === 'xAxis' ? 'bold' : undefined,
                marginLeft: 8,
              }}
            >
              X軸基準点
            </span>
            <span style={{ marginLeft: 8 }}>
              {calibration.xAxis
                ? `${calibration.xAxis.x.toFixed(0)}, ${calibration.xAxis.y.toFixed(0)}`
                : '未設定'}
            </span>
            <CalibrationNumberInput
              value={calibration.xAxisValue.rpm}
              onChange={(v) =>
                setCalibration((prev) => ({
                  ...prev,
                  xAxisValue: { rpm: v },
                }))
              }
              placeholder="rpm"
              style={{ width: 70, marginLeft: 8 }}
            />
            <span style={{ marginLeft: 2 }}>rpm</span>
          </div>
          <div style={{ margin: 12 }}>
            <button
              type="button"
              className={
                calibration.selectStep === 'yAxis'
                  ? 'app-button active'
                  : 'app-button'
              }
              onClick={() =>
                setCalibration((prev) => ({ ...prev, selectStep: 'yAxis' }))
              }
            >
              Y軸基準点を選択
            </button>
            <span
              style={{
                fontWeight:
                  calibration.selectStep === 'yAxis' ? 'bold' : undefined,
                marginLeft: 8,
              }}
            >
              Y軸基準点
            </span>
            <span style={{ marginLeft: 8 }}>
              {calibration.yAxis
                ? `${calibration.yAxis.x.toFixed(0)}, ${calibration.yAxis.y.toFixed(0)}`
                : '未設定'}
            </span>
            <CalibrationNumberInput
              value={calibration.yAxisValue.torque}
              onChange={(v) =>
                setCalibration((prev) => ({
                  ...prev,
                  yAxisValue: { torque: v },
                }))
              }
              placeholder="torque"
              style={{ width: 70, marginLeft: 4 }}
            />
            <span style={{ marginLeft: 2 }}>N・m</span>
          </div>
          {modalError && (
            <div style={{ color: 'red', marginBottom: 8 }}>{modalError}</div>
          )}
          <div style={{ margin: 12 }}>
            <button
              type="button"
              className="app-button"
              onClick={saveOrigin}
              disabled={
                !(calibration.origin && calibration.xAxis && calibration.yAxis)
              }
            >
              保存
            </button>
            <button
              type="button"
              className="app-button"
              onClick={() => setShowOriginModal(false)}
              style={{ marginLeft: 8 }}
            >
              閉じる
            </button>
          </div>
        </div>
      </BaseModal>
    );
  }

  // ...state定義、UI部品、return...
  return (
    <div className="vt-curve-editor-container">
      <h3 className="header">V-T曲線エディタ</h3>
      <AxisRangeInputs
        axisRangeValue={axisRange}
        setAxisRangeValue={setAxisRange}
        isReadonly={readonly}
      />
      {renderChart()}
      {!readonly && (
        <div className="actions vt-curve-button-row">
          <button
            type="button"
            className="app-button"
            onClick={() => fileInputRef.current?.click()}
          >
            背景画像を選択
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          {vtCurve.backgroundImage && (
            <>
              <button
                type="button"
                className="app-button"
                onClick={removeBackgroundImage}
              >
                背景画像を削除
              </button>
              <button
                type="button"
                className="app-button"
                onClick={() => setShowOriginModal(true)}
              >
                原点合わせ
              </button>
            </>
          )}
        </div>
      )}
      {renderTable()}
      {renderCalibrationModal()}
    </div>
  );
}
