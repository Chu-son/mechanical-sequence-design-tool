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
import BaseModal from '@/renderer/components/common/BaseModal';
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

export default function VTCurveEditor({
  value: vtCurveProp = { points: [] },
  onChange,
  readonly = false,
}: VTCurveEditorProps) {
  const vtCurve = vtCurveProp;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 原点合わせ・キャリブレーションstate
  const [calibration, setCalibration] = useState<CalibrationState>({
    origin: null,
    xAxis: null,
    yAxis: null,
    originValue: { rpm: 0, torque: 0 },
    xAxisValue: { rpm: 0 },
    yAxisValue: { torque: 0 },
    selectStep: null,
  });
  // XY軸範囲state
  const [axisRange, setAxisRange] = useState<AxisRangeState>({
    xMin: 0,
    xMax: 3000,
    yMin: 0,
    yMax: 10,
  });
  // 画像・グラフ描画state
  const [plot, setPlot] = useState<PlotState>({
    imageSize: null,
    plotArea: { width: 0, height: 0, left: 0, top: 0 },
    plotOrigin: null,
  });
  // モーダル表示・エラー
  const [showOriginModal, setShowOriginModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

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
    }));
  }, [
    vtCurve.backgroundImage, // 背景画像が変わったとき
    vtCurve.backgroundOrigin, // 原点位置が変わったとき
    vtCurve.points, // データ点が変わったとき
    axisRange.xMin, // X軸範囲が変わったとき
    axisRange.xMax,
    axisRange.yMin,
    axisRange.yMax,
  ]);

  // グラフ上の原点座標（plotOrigin）をSVGから取得し、plot stateに反映する
  // 依存配列: データ点・背景画像・原点が変化したときに再計算
  useEffect(() => {
    const svg = document.querySelector('.recharts-surface');
    if (!svg) return;
    const grid = svg.querySelector('g.recharts-cartesian-grid');
    if (!grid) return;
    const gridRect = grid.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    const originX = gridRect.left - svgRect.left;
    const originY = gridRect.bottom - svgRect.top;
    setPlot((prev) => ({ ...prev, plotOrigin: { x: originX, y: originY } }));
  }, [
    vtCurve.points, // データ点が変わったとき
    vtCurve.backgroundImage, // 背景画像が変わったとき
    vtCurve.backgroundOrigin, // 原点位置が変わったとき
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

  // 画像のスケール・位置をXY軸範囲・キャリブレーション値から計算
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

    const left =
      plot.plotArea.left + PLOT_AREA_MARGIN.left - imgOriginX * scaleX;
    const top =
      plot.plotArea.top +
      PLOT_AREA_MARGIN.top +
      plot.plotArea.height -
      imgOriginY * scaleY;

    return {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${vtCurve.backgroundScale?.width * scaleX}px`,
      height: `${vtCurve.backgroundScale?.height * scaleY}px`,
      objectFit: 'fill',
      opacity: 0.5,
      pointerEvents: 'none',
      zIndex: 1,
    };
  }

  // 背景画像アップロード
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...vtCurve, backgroundImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  // 背景画像削除
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

  // データポイント削除
  const deletePoint = (index: number) => {
    const points = vtCurve.points ? [...vtCurve.points] : [];
    points.splice(index, 1);
    onChange({ ...vtCurve, points });
  };

  // データポイント更新
  const updatePoint = (index: number, key: 'rpm' | 'torque', val: string) => {
    const numValue = parseFloat(val);
    if (Number.isNaN(numValue)) return;
    const points = vtCurve.points ? [...vtCurve.points] : [];
    points[index] = { ...points[index], [key]: numValue };
    points.sort((a, b) => a.rpm - b.rpm);
    onChange({ ...vtCurve, points });
  };

  // 背景画像スタイル計算
  let imgStyle: React.CSSProperties = { display: 'none' };
  if (vtCurve.backgroundImage) {
    if (
      vtCurve.backgroundScale &&
      vtCurve.backgroundOrigin &&
      vtCurve.backgroundXAxis &&
      vtCurve.backgroundYAxis &&
      plot.plotArea.width > 0 &&
      plot.plotArea.height > 0 &&
      !Number.isNaN(Number(axisRange.xMin)) &&
      !Number.isNaN(Number(axisRange.xMax)) &&
      !Number.isNaN(Number(axisRange.yMin)) &&
      !Number.isNaN(Number(axisRange.yMax))
    ) {
      imgStyle = getCalibratedImageStyle();
    } else if (vtCurve.backgroundOrigin && plot.plotOrigin) {
      imgStyle = {
        position: 'absolute',
        left: `${plot.plotArea.left + PLOT_AREA_MARGIN.left - vtCurve.backgroundOrigin.x}px`,
        top: `${plot.plotArea.top + PLOT_AREA_MARGIN.top + plot.plotArea.height - vtCurve.backgroundOrigin.y}px`,
        width: 'auto',
        height: 'auto',
        opacity: 0.5,
        pointerEvents: 'none',
        zIndex: 1,
      };
    } else {
      imgStyle = {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        opacity: 0.5,
        pointerEvents: 'none',
        zIndex: 1,
      };
    }
  }

  const chartData =
    vtCurve.points?.map((point) => ({
      rpm: point.rpm,
      torque: point.torque,
    })) || [];

  // XY軸範囲入力UI
  function renderAxisRangeInputs() {
    if (readonly) return null;
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
        <input
          type="number"
          value={axisRange.xMin}
          onChange={(e) =>
            setAxisRange({ ...axisRange, xMin: Number(e.target.value) })
          }
          style={{ width: 70 }}
          placeholder="最小"
        />
        <span>～</span>
        <input
          type="number"
          value={axisRange.xMax}
          onChange={(e) =>
            setAxisRange({ ...axisRange, xMax: Number(e.target.value) })
          }
          style={{ width: 70 }}
          placeholder="最大"
        />
        <span style={{ marginLeft: 16 }}>Y軸範囲:</span>
        <input
          type="number"
          value={axisRange.yMin}
          onChange={(e) =>
            setAxisRange({ ...axisRange, yMin: Number(e.target.value) })
          }
          style={{ width: 70 }}
          placeholder="最小"
        />
        <span>～</span>
        <input
          type="number"
          value={axisRange.yMax}
          onChange={(e) =>
            setAxisRange({ ...axisRange, yMax: Number(e.target.value) })
          }
          style={{ width: 70 }}
          placeholder="最大"
        />
      </div>
    );
  }

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
            style={imgStyle}
            onLoad={handleImageLoad}
          />
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
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
            {chartData.length > 0 && (
              <Line
                type="monotone"
                dataKey="torque"
                stroke="#8884d8"
                name="トルク"
                connectNulls
              />
            )}
            {chartData.length > 0 && (
              <Scatter
                name="データポイント"
                data={chartData}
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
            {(vtCurve.points || []).map((point) => (
              <tr key={`${point.rpm}-${point.torque}`}>
                <td>
                  {readonly ? (
                    point.rpm.toFixed(2)
                  ) : (
                    <input
                      type="number"
                      value={point.rpm}
                      onChange={(e) =>
                        updatePoint(
                          vtCurve.points.findIndex(
                            (p) =>
                              p.rpm === point.rpm && p.torque === point.torque,
                          ),
                          'rpm',
                          e.target.value,
                        )
                      }
                      className="form-group"
                    />
                  )}
                </td>
                <td>
                  {readonly ? (
                    point.torque.toFixed(2)
                  ) : (
                    <input
                      type="number"
                      value={point.torque}
                      onChange={(e) =>
                        updatePoint(
                          vtCurve.points.findIndex(
                            (p) =>
                              p.rpm === point.rpm && p.torque === point.torque,
                          ),
                          'torque',
                          e.target.value,
                        )
                      }
                      className="form-group"
                    />
                  )}
                </td>
                {!readonly && (
                  <td>
                    <button
                      type="button"
                      className="vt-curve-delete-button"
                      onClick={() =>
                        deletePoint(
                          vtCurve.points.findIndex(
                            (p) =>
                              p.rpm === point.rpm && p.torque === point.torque,
                          ),
                        )
                      }
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

  // 原点合わせモーダルUI
  function renderCalibrationModal() {
    return (
      <BaseModal
        isOpen={showOriginModal}
        onClose={() => setShowOriginModal(false)}
        title="原点・基準点合わせ"
      >
        <div style={{ textAlign: 'center' }}>
          {vtCurve.backgroundImage && (
            <img
              src={vtCurve.backgroundImage}
              alt="origin"
              style={{ border: '1px solid #ccc', cursor: 'crosshair' }}
              onClick={handleImageClick}
              onLoad={handleImageLoad}
            />
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
            <span style={{ marginLeft: 8 }}>
              原点:{' '}
              {calibration.origin
                ? `${calibration.origin.x.toFixed(0)}, ${calibration.origin.y.toFixed(0)}`
                : '未設定'}
            </span>
            <input
              type="number"
              placeholder="rpm"
              value={calibration.originValue.rpm}
              onChange={(e) =>
                setCalibration((prev) => ({
                  ...prev,
                  originValue: {
                    ...prev.originValue,
                    rpm: Number(e.target.value),
                  },
                }))
              }
              style={{ width: 70, marginLeft: 8 }}
            />
            <input
              type="number"
              placeholder="torque"
              value={calibration.originValue.torque}
              onChange={(e) =>
                setCalibration((prev) => ({
                  ...prev,
                  originValue: {
                    ...prev.originValue,
                    torque: Number(e.target.value),
                  },
                }))
              }
              style={{ width: 70, marginLeft: 4 }}
            />
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
            <span style={{ marginLeft: 8 }}>
              X軸:{' '}
              {calibration.xAxis
                ? `${calibration.xAxis.x.toFixed(0)}, ${calibration.xAxis.y.toFixed(0)}`
                : '未設定'}
            </span>
            <input
              type="number"
              placeholder="rpm"
              value={calibration.xAxisValue.rpm}
              onChange={(e) =>
                setCalibration((prev) => ({
                  ...prev,
                  xAxisValue: { rpm: Number(e.target.value) },
                }))
              }
              style={{ width: 70, marginLeft: 8 }}
            />
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
            <span style={{ marginLeft: 8 }}>
              Y軸:{' '}
              {calibration.yAxis
                ? `${calibration.yAxis.x.toFixed(0)}, ${calibration.yAxis.y.toFixed(0)}`
                : '未設定'}
            </span>
            <input
              type="number"
              placeholder="torque"
              value={calibration.yAxisValue.torque}
              onChange={(e) =>
                setCalibration((prev) => ({
                  ...prev,
                  yAxisValue: { torque: Number(e.target.value) },
                }))
              }
              style={{ width: 70, marginLeft: 4 }}
            />
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

  return (
    <div className="vt-curve-editor-container">
      <h3 className="header">V-T曲線エディタ</h3>
      {renderAxisRangeInputs()}
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
