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

const chartMargin = { top: 20, right: 30, left: 20, bottom: 30 };

export default function VTCurveEditor({
  value = { points: [] },
  onChange,
  readonly = false,
}: VTCurveEditorProps) {
  const [newRpm, setNewRpm] = useState('');
  const [newTorque, setNewTorque] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // 原点合わせ用state
  const [showOriginModal, setShowOriginModal] = useState(false);
  // 原点・X軸・Y軸基準点の画像上座標と物理量を管理
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [xAxisPoint, setXAxisPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [yAxisPoint, setYAxisPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [originValue, setOriginValue] = useState<{
    rpm: string;
    torque: string;
  }>({ rpm: '', torque: '' });
  const [xAxisValue, setXAxisValue] = useState<{ rpm: string; torque: string }>(
    { rpm: '', torque: '' },
  );
  const [yAxisValue, setYAxisValue] = useState<{ rpm: string; torque: string }>(
    { rpm: '', torque: '' },
  );
  const [selectStep, setSelectStep] = useState<
    'origin' | 'xAxis' | 'yAxis' | null
  >(null);
  const [plotOrigin, setPlotOrigin] = useState<{ x: number; y: number } | null>(
    null,
  );
  // 画像サイズ管理用state
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  // エラーメッセージ表示用state
  const [modalError, setModalError] = useState<string | null>(null);

  // プロットエリアのXY軸の最大値・最小値をユーザーが設定できるようにするstate
  const [xMin, setXMin] = useState<string>('0');
  const [xMax, setXMax] = useState<string>('3000');
  const [yMin, setYMin] = useState<string>('0');
  const [yMax, setYMax] = useState<string>('10');

  useEffect(() => {
    const svg = document.querySelector('.recharts-surface');
    if (!svg) {
      console.warn('[plotOrigin] SVG not found');
      return;
    }
    const grid = svg.querySelector('g.recharts-cartesian-grid');
    if (!grid) {
      console.warn('[plotOrigin] recharts-cartesian-grid not found');
      return;
    }
    const gridRect = grid.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    const originX = gridRect.left - svgRect.left;
    const originY = gridRect.bottom - svgRect.top;
    console.log(
      '[plotOrigin] grid left-bottom originX:',
      originX,
      'originY:',
      originY,
    );
    setPlotOrigin({ x: originX, y: originY });
  }, [value.points, value.backgroundImage, value.backgroundOrigin]);

  const addPoint = () => {
    const rpm = parseFloat(newRpm);
    const torque = parseFloat(newTorque);
    if (isNaN(rpm) || isNaN(torque)) {
      alert('有効な数値を入力してください');
      return;
    }
    const points = [...(value.points || []), { rpm, torque }];
    points.sort((a, b) => a.rpm - b.rpm);
    onChange({ ...value, points });
    setNewRpm('');
    setNewTorque('');
  };

  const deletePoint = (index: number) => {
    const points = value.points ? [...value.points] : [];
    points.splice(index, 1);
    onChange({ ...value, points });
  };

  const updatePoint = (index: number, key: 'rpm' | 'torque', val: string) => {
    const numValue = parseFloat(val);
    if (isNaN(numValue)) return;
    const points = value.points ? [...value.points] : [];
    points[index] = { ...points[index], [key]: numValue };
    points.sort((a, b) => a.rpm - b.rpm);
    onChange({ ...value, points });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...value, backgroundImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const removeBackgroundImage = () => {
    onChange({
      ...value,
      backgroundImage: undefined,
      backgroundOrigin: undefined,
      backgroundScale: undefined,
    });
  };

  // 画像naturalWidth/naturalHeight取得
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // 画像クリックで原点/X軸/Y軸ピクセル座標取得
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageSize || !selectStep) return;
    const rect = (e.target as HTMLImageElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (selectStep === 'origin') {
      setOrigin({ x, y });
    } else if (selectStep === 'xAxis') {
      setXAxisPoint({ x, y });
    } else if (selectStep === 'yAxis') {
      setYAxisPoint({ x, y });
    }
    setSelectStep(null);
  };

  // 3点情報を保存しonChangeで親に渡す
  const saveOrigin = () => {
    setModalError(null);
    if (!origin || !xAxisPoint || !yAxisPoint) {
      setModalError('全ての座標を選択してください');
      return;
    }
    if (
      originValue.rpm === '' ||
      originValue.torque === '' ||
      xAxisValue.rpm === '' ||
      xAxisValue.torque === '' ||
      yAxisValue.rpm === '' ||
      yAxisValue.torque === ''
    ) {
      setModalError('全ての数値を入力してください');
      return;
    }
    // ピクセル座標と物理量からスケールを計算
    const ox = origin.x,
      oy = origin.y;
    const x1 = xAxisPoint.x,
      y1 = xAxisPoint.y;
    const x2 = yAxisPoint.x,
      y2 = yAxisPoint.y;
    const rpm0 = parseFloat(originValue.rpm),
      tq0 = parseFloat(originValue.torque);
    const rpm1 = parseFloat(xAxisValue.rpm),
      tq1 = parseFloat(xAxisValue.torque);
    const rpm2 = parseFloat(yAxisValue.rpm),
      tq2 = parseFloat(yAxisValue.torque);
    // X軸方向のスケール
    const xMin = rpm0 - (ox * (rpm1 - rpm0)) / (x1 - ox);
    const xMax =
      rpm0 +
      ((imageSize ? imageSize.width - ox : 0) * (rpm1 - rpm0)) / (x1 - ox);
    // Y軸方向のスケール
    const yMin =
      tq0 + ((imageSize ? imageSize.height - oy : 0) * (tq2 - tq0)) / (y2 - oy);
    const yMax = tq0 - (oy * (tq2 - tq0)) / (y2 - oy);
    onChange({
      ...value,
      backgroundOrigin: { x: ox, y: oy },
      backgroundXAxis: { x: x1, y: y1 },
      backgroundYAxis: { x: x2, y: y2 },
      backgroundScale: imageSize
        ? {
            xMin,
            xMax,
            yMin,
            yMax,
            width: imageSize.width,
            height: imageSize.height,
          }
        : undefined,
    });
    setShowOriginModal(false);
  };

  // グラフ描画エリアのサイズを取得
  const [plotArea, setPlotArea] = useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });
  useEffect(() => {
    if (graphContainerRef.current) {
      const rect = graphContainerRef.current.getBoundingClientRect();
      setPlotArea({
        width: rect.width - chartMargin.left - chartMargin.right,
        height: rect.height - chartMargin.top - chartMargin.bottom,
        left: chartMargin.left,
        top: chartMargin.top,
      });
    }
  }, [value.backgroundImage, value.backgroundOrigin]);

  // 背景画像の位置・サイズ調整（原点のみ考慮）
  let imgStyle: React.CSSProperties = { display: 'none' };
  if (value.backgroundImage) {
    if (value.backgroundOrigin && plotOrigin) {
      console.log('[plotOrigin] backgroundOrigin:', value.backgroundOrigin);
      console.log('[plotOrigin] plotArea:', plotArea);
      const { x: originX, y: originY } = value.backgroundOrigin;
      const { width: plotW, height: plotH, left: plotL, top: plotT } = plotArea;
      imgStyle = {
        position: 'absolute',
        left: `${plotL - originX + plotOrigin.x}px`,
        top: `${plotT + plotOrigin.y - originY}px`,
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
    value.points?.map((point) => ({ rpm: point.rpm, torque: point.torque })) ||
    [];

  return (
    <div className="vt-curve-editor-container">
      <h3 className="header">V-T曲線エディタ</h3>
      {/* XY軸範囲設定UI */}
      {!readonly && (
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
            value={xMin}
            onChange={(e) => setXMin(e.target.value)}
            style={{ width: 70 }}
            placeholder="最小"
          />
          <span>～</span>
          <input
            type="number"
            value={xMax}
            onChange={(e) => setXMax(e.target.value)}
            style={{ width: 70 }}
            placeholder="最大"
          />
          <span style={{ marginLeft: 16 }}>Y軸範囲:</span>
          <input
            type="number"
            value={yMin}
            onChange={(e) => setYMin(e.target.value)}
            style={{ width: 70 }}
            placeholder="最小"
          />
          <span>～</span>
          <input
            type="number"
            value={yMax}
            onChange={(e) => setYMax(e.target.value)}
            style={{ width: 70 }}
            placeholder="最大"
          />
        </div>
      )}
      <div
        className="container vt-curve-graph-container"
        ref={graphContainerRef}
        style={{ position: 'relative' }}
      >
        {value.backgroundImage && (
          <img
            src={value.backgroundImage}
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
                isNaN(Number(xMin)) ? 0 : Number(xMin),
                isNaN(Number(xMax)) ? 3000 : Number(xMax),
              ]}
            />
            <YAxis
              label={{ value: 'トルク [N・m]', angle: -90, position: 'left' }}
              type="number"
              domain={[
                isNaN(Number(yMin)) ? 0 : Number(yMin),
                isNaN(Number(yMax)) ? 10 : Number(yMax),
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
                plotOrigin ? (
                  <circle
                    cx={plotOrigin.x}
                    cy={plotOrigin.y}
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
          {value.backgroundImage && (
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
            {(value.points || []).map((point, index) => (
              <tr key={index}>
                <td>
                  {readonly ? (
                    point.rpm.toFixed(2)
                  ) : (
                    <input
                      type="number"
                      value={point.rpm}
                      onChange={(e) =>
                        updatePoint(index, 'rpm', e.target.value)
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
                        updatePoint(index, 'torque', e.target.value)
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
                      onClick={() => deletePoint(index)}
                    >
                      削除
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {(value.points || []).length === 0 && (
              <tr>
                <td colSpan={readonly ? 2 : 3} className="no-data">
                  データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <BaseModal
        isOpen={showOriginModal}
        onClose={() => setShowOriginModal(false)}
        title="原点・基準点合わせ"
      >
        <div style={{ textAlign: 'center' }}>
          {value.backgroundImage && (
            <img
              src={value.backgroundImage}
              alt="origin"
              style={{
                border: '1px solid #ccc',
                cursor: 'crosshair',
              }}
              onClick={handleImageClick}
              onLoad={handleImageLoad}
            />
          )}
          <div style={{ margin: 12 }}>
            <button
              type="button"
              className={
                selectStep === 'origin' ? 'app-button active' : 'app-button'
              }
              onClick={() => setSelectStep('origin')}
            >
              原点を選択
            </button>
            <span style={{ marginLeft: 8 }}>
              原点:{' '}
              {origin
                ? `${origin.x.toFixed(0)}, ${origin.y.toFixed(0)}`
                : '未設定'}
            </span>
            <input
              type="number"
              placeholder="rpm"
              value={originValue.rpm}
              onChange={(e) =>
                setOriginValue((v) => ({ ...v, rpm: e.target.value }))
              }
              style={{ width: 70, marginLeft: 8 }}
            />
            <input
              type="number"
              placeholder="torque"
              value={originValue.torque}
              onChange={(e) =>
                setOriginValue((v) => ({ ...v, torque: e.target.value }))
              }
              style={{ width: 70, marginLeft: 4 }}
            />
          </div>
          <div style={{ margin: 12 }}>
            <button
              type="button"
              className={
                selectStep === 'xAxis' ? 'app-button active' : 'app-button'
              }
              onClick={() => setSelectStep('xAxis')}
            >
              X軸基準点を選択
            </button>
            <span style={{ marginLeft: 8 }}>
              X軸:{' '}
              {xAxisPoint
                ? `${xAxisPoint.x.toFixed(0)}, ${xAxisPoint.y.toFixed(0)}`
                : '未設定'}
            </span>
            <input
              type="number"
              placeholder="rpm"
              value={xAxisValue.rpm}
              onChange={(e) =>
                setXAxisValue((v) => ({ ...v, rpm: e.target.value }))
              }
              style={{ width: 70, marginLeft: 8 }}
            />
            <input
              type="number"
              placeholder="torque"
              value={xAxisValue.torque}
              onChange={(e) =>
                setXAxisValue((v) => ({ ...v, torque: e.target.value }))
              }
              style={{ width: 70, marginLeft: 4 }}
            />
          </div>
          <div style={{ margin: 12 }}>
            <button
              type="button"
              className={
                selectStep === 'yAxis' ? 'app-button active' : 'app-button'
              }
              onClick={() => setSelectStep('yAxis')}
            >
              Y軸基準点を選択
            </button>
            <span style={{ marginLeft: 8 }}>
              Y軸:{' '}
              {yAxisPoint
                ? `${yAxisPoint.x.toFixed(0)}, ${yAxisPoint.y.toFixed(0)}`
                : '未設定'}
            </span>
            <input
              type="number"
              placeholder="rpm"
              value={yAxisValue.rpm}
              onChange={(e) =>
                setYAxisValue((v) => ({ ...v, rpm: e.target.value }))
              }
              style={{ width: 70, marginLeft: 8 }}
            />
            <input
              type="number"
              placeholder="torque"
              value={yAxisValue.torque}
              onChange={(e) =>
                setYAxisValue((v) => ({ ...v, torque: e.target.value }))
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
              disabled={!(origin && xAxisPoint && yAxisPoint)}
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
    </div>
  );
}
