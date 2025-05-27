import React, { useEffect, useRef, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
} from 'recharts';
import {
  VTCurve,
  AxisRangeState,
  PlotState,
} from '@/renderer/types/driveTypes';
import BaseModal from '@/renderer/features/common/BaseModal';
import { validateNumericInput } from '@/renderer/features/flowchart/utils/common/flowchartUtils';
import ListComponent from '@/renderer/features/common/ListComponent';
import './VTCurveEditor.css';

interface VTCurveEditorProps {
  value?: VTCurve;
  onChange: (vtCurve: VTCurve) => void;
  readonly?: boolean;
}

// 原点合わせ・キャリブレーション関連のstate型
interface CalibrationModalState {
  origin: { x: number; y: number } | null;
  xAxis: { x: number; y: number } | null;
  yAxis: { x: number; y: number } | null;
  originValue: { rpm: number; torque: number };
  xAxisValue: { rpm: number };
  yAxisValue: { torque: number };
  selectStep: 'origin' | 'xAxis' | 'yAxis' | null;
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
  // axisRangeはVTCurveのaxisRangeプロパティと同期
  const [axisRange, setAxisRange] = useState<AxisRangeState>(
    vtCurve.axisRange ?? { xMin: 0, xMax: 3000, yMin: 0, yMax: 10 },
  );
  // calibrationはVTCurveのcalibrationプロパティと同期
  const [calibration, setCalibration] = useState<CalibrationModalState>(() => {
    if (vtCurve.calibration) {
      return {
        origin: vtCurve.calibration.origin ?? null,
        xAxis: vtCurve.calibration.xAxis ?? null,
        yAxis: vtCurve.calibration.yAxis ?? null,
        originValue: vtCurve.calibration.originValue ?? { rpm: 0, torque: 0 },
        xAxisValue: vtCurve.calibration.xAxisValue ?? { rpm: 0 },
        yAxisValue: vtCurve.calibration.yAxisValue ?? { torque: 0 },
        selectStep: null,
      };
    }
    return {
      origin: null,
      xAxis: null,
      yAxis: null,
      originValue: { rpm: 0, torque: 0 },
      xAxisValue: { rpm: 0 },
      yAxisValue: { torque: 0 },
      selectStep: null,
    };
  });

  // 初回マウント時にaxisRangeがundefinedならonChangeでaxisRangeをセット
  useEffect(() => {
    if (!vtCurve.axisRange) {
      onChange({ ...vtCurve, axisRange });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // axisRange変更時にVTCurveへ反映
  useEffect(() => {
    if (
      !vtCurve.axisRange ||
      axisRange.xMin !== vtCurve.axisRange.xMin ||
      axisRange.xMax !== vtCurve.axisRange.xMax ||
      axisRange.yMin !== vtCurve.axisRange.yMin ||
      axisRange.yMax !== vtCurve.axisRange.yMax
    ) {
      onChange({ ...vtCurve, axisRange });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axisRange]);
  // VTCurveのaxisRangeが外部から変化した場合にstateへ反映
  useEffect(() => {
    if (
      vtCurve.axisRange &&
      (axisRange.xMin !== vtCurve.axisRange.xMin ||
        axisRange.xMax !== vtCurve.axisRange.xMax ||
        axisRange.yMin !== vtCurve.axisRange.yMin ||
        axisRange.yMax !== vtCurve.axisRange.yMax)
    ) {
      setAxisRange(vtCurve.axisRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vtCurve.axisRange]);
  // CalibrationModalStateはモーダル一時保存用
  const [plot, setPlot] = useState<PlotState>({
    imageSize: null,
    plotArea: { width: 0, height: 0, left: 0, top: 0 },
    plotOrigin: null,
  });
  const [showOriginModal, setShowOriginModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showBackgroundImage, setShowBackgroundImage] = useState(true);
  const [addPointInputs, setAddPointInputs] = useState<{
    rpm: number;
    torque: number;
  }>({ rpm: 0, torque: 0 });
  const [directAddMode, setDirectAddMode] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // --- state定義ここまで ---

  // モーダルを開いたときにselectStepをoriginから順次進める
  useEffect(() => {
    if (showOriginModal) {
      if (!calibration.origin) {
        setCalibration((prev) => ({ ...prev, selectStep: 'origin' }));
      } else if (!calibration.xAxis) {
        setCalibration((prev) => ({ ...prev, selectStep: 'xAxis' }));
      } else if (!calibration.yAxis) {
        setCalibration((prev) => ({ ...prev, selectStep: 'yAxis' }));
      } else {
        setCalibration((prev) => ({ ...prev, selectStep: null }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOriginModal]);

  // プロット追加処理
  const addPoint = () => {
    const rpm = validateNumericInput(addPointInputs.rpm.toString(), 0);
    const torque = validateNumericInput(addPointInputs.torque.toString(), 0);
    if (Number.isNaN(rpm) || Number.isNaN(torque)) return;
    const points = vtCurve.points ? [...vtCurve.points] : [];
    points.push({ rpm, torque });
    points.sort((a, b) => a.rpm - b.rpm);
    onChange({ ...vtCurve, points });
    setAddPointInputs({ rpm: 0, torque: 0 });
  };

  // --- ここでロジック関数を宣言 ---
  const handleChartClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!directAddMode) return;
    const svg = document.querySelector('.recharts-surface');
    if (!svg) return;
    const svgRect = svg.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    const px = plot.plotArea.width;
    const py = plot.plotArea.height;
    if (px === 0 || py === 0) return;
    const rpm =
      axisRange.xMin +
      ((x - plot.plotArea.left) / px) * (axisRange.xMax - axisRange.xMin);
    const torque =
      axisRange.yMax -
      ((y - plot.plotArea.top) / py) * (axisRange.yMax - axisRange.yMin);
    const points = vtCurve.points ? [...vtCurve.points] : [];
    points.push({ rpm, torque });
    points.sort((a, b) => a.rpm - b.rpm);
    onChange({ ...vtCurve, points });
    setSelectedIndex(
      points.findIndex((p) => p.rpm === rpm && p.torque === torque),
    );
  };
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
      vtCurve.calibration?.scale &&
      typeof vtCurve.calibration.scale.width === 'number'
        ? vtCurve.calibration.scale.width * scaleX
        : 'auto';
    const height =
      vtCurve.calibration?.scale &&
      typeof vtCurve.calibration.scale.height === 'number'
        ? vtCurve.calibration.scale.height * scaleY
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
      calibration: undefined,
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
    vtCurve.calibration,
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
      calibration: {
        origin: { x: ox, y: oy },
        xAxis: { x: x1, y: y1 },
        yAxis: { x: x2, y: y2 },
        originValue: { ...originValue },
        xAxisValue: { ...xAxisValue },
        yAxisValue: { ...yAxisValue },
        scale: imgSize
          ? {
              xMin: calcXMin,
              xMax: calcXMax,
              yMin: calcYMin,
              yMax: calcYMax,
              width: imgSize.width,
              height: imgSize.height,
            }
          : undefined,
      },
    });
    setShowOriginModal(false);
  };

  // グラフUI
  function renderChart() {
    return (
      <div
        className="container vt-curve-graph-container"
        style={{ position: 'relative', overflow: 'hidden' }}
        onClick={handleChartClick}
        role="button"
        tabIndex={0}
        onKeyDown={() => {}}
        aria-label="グラフクリックでプロット追加"
      >
        {vtCurve.backgroundImage && showBackgroundImage && (
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
                dataKey="torque"
                fill="#8884d8"
                // rechartsのScatterはactiveIndex/activeShapeでハイライトを制御
                activeIndex={selectedIndex ?? -1}
                activeShape={(props: any) => {
                  const { cx, cy } = props;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={8}
                      fill="#ff9800"
                      stroke="#333"
                      strokeWidth={2}
                    />
                  );
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // テーブルUI（ListComponentで共通化）
  function renderTable() {
    // ListComponent用のヘッダー定義
    const headers = [
      { label: '回転数 (rpm)', width: '50%' },
      { label: 'トルク (N・m)', width: '50%' },
    ];
    // 小数点以下2桁で表示
    const formatNumber = (num: number) => Number(num).toFixed(2);
    // ListComponent用のデータ変換
    const items = (vtCurve.points || []).map((pt, idx) => ({
      id: idx,
      columns: [
        {
          content: (
            <PointInput
              value={Number(formatNumber(pt.rpm))}
              onChange={(v) => updatePoint(idx, 'rpm', v)}
              disabled={readonly}
            />
          ),
        },
        {
          content: (
            <PointInput
              value={Number(formatNumber(pt.torque))}
              onChange={(v) => updatePoint(idx, 'torque', v)}
              disabled={readonly}
            />
          ),
        },
      ],
      onClick: () => setSelectedIndex(idx),
      // 選択行のハイライト
      className: selectedIndex === idx ? 'selected-row' : '',
    }));
    // 削除メニュー
    const menuItems = !readonly
      ? [{ label: '削除', onClick: (itemId: number) => deletePoint(itemId) }]
      : undefined;
    return (
      <ListComponent headers={headers} items={items} menuItems={menuItems} />
    );
  }

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

  // プロット追加・直接指定UI・テーブルをまとめて下部に配置
  function renderPlotControls() {
    if (readonly) return renderTable();
    return (
      <div style={{ marginTop: 32 }}>
        <div
          className="actions vt-curve-button-row"
          style={{ display: 'flex', justifyContent: 'flex-start', gap: 8 }}
        >
          {/* 背景画像の選択/削除ボタンを切り替え */}
          {!vtCurve.backgroundImage ? (
            <>
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
            </>
          ) : (
            <>
              <button
                type="button"
                className="app-button"
                onClick={removeBackgroundImage}
              >
                背景画像を削除
              </button>
              {/* 背景画像の表示切り替えボタン */}
              <button
                type="button"
                className="app-button"
                onClick={() => setShowBackgroundImage((prev) => !prev)}
              >
                背景画像表示: {showBackgroundImage ? 'ON' : 'OFF'}
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
        <div style={{ height: 16 }} />
        {/* プロット追加UI */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span>回転数</span>
          <NumberInput
            value={addPointInputs.rpm}
            onChange={(v) =>
              setAddPointInputs((inputs) => ({ ...inputs, rpm: v }))
            }
            style={{ width: 80 }}
          />
          <span>rpm</span>
          <span style={{ marginLeft: 12 }}>トルク</span>
          <NumberInput
            value={addPointInputs.torque}
            onChange={(v) =>
              setAddPointInputs((inputs) => ({ ...inputs, torque: v }))
            }
            style={{ width: 80 }}
          />
          <span>N・m</span>
          <button
            type="button"
            className="app-button"
            onClick={addPoint}
            style={{ marginLeft: 12 }}
          >
            追加
          </button>
          <button
            type="button"
            className={directAddMode ? 'app-button active' : 'app-button'}
            style={{ marginLeft: 16 }}
            onClick={() => setDirectAddMode((mode) => !mode)}
          >
            直接指定モード: {directAddMode ? 'ON' : 'OFF'}
          </button>
        </div>
        {renderTable()}
      </div>
    );
  }

  // return部でプロット関連UIを下部に移動
  return (
    <div className="vt-curve-editor-container">
      <h3 className="header">V-T曲線エディタ</h3>
      {renderChart()}
      <AxisRangeInputs
        axisRangeValue={axisRange}
        setAxisRangeValue={setAxisRange}
        isReadonly={readonly}
      />
      {/* プロット関連UIを下部に集約 */}
      {renderPlotControls()}
      {renderCalibrationModal()}
    </div>
  );
}
