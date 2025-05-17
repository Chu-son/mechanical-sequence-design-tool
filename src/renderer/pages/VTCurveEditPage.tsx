import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VTCurveEditor from '@/renderer/components/parts/VTCurveEditor';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import { DrivePart, VTCurve } from '@/renderer/types/driveTypes';
import BaseModal from '@/renderer/components/common/BaseModal';

const VTCurveEditPage: React.FC = () => {
  const { partId } = useParams<{ partId: string }>();
  const navigate = useNavigate();
  const [part, setPart] = useState<DrivePart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vtCurve, setVtCurve] = useState<VTCurve>({ points: [] });
  const [saving, setSaving] = useState(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [calibOrigin, setCalibOrigin] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [calibX, setCalibX] = useState<{
    x: number;
    y: number;
    value: number;
  } | null>(null);
  const [calibY, setCalibY] = useState<{
    x: number;
    y: number;
    value: number;
  } | null>(null);
  const [calibStep, setCalibStep] = useState<'origin' | 'x' | 'y' | null>(null);
  const [calibXValue, setCalibXValue] = useState('');
  const [calibYValue, setCalibYValue] = useState('');
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const fetchPart = async () => {
      setLoading(true);
      try {
        const db = DatabaseFactory.createDatabase();
        const p = await db.getPartById(Number(partId));
        if (!p) {
          setError('部品が見つかりませんでした');
        } else {
          setPart(p);
          setVtCurve((p.spec as any).vtCurve || { points: [] });
        }
      } catch (e) {
        setError('データ取得エラー');
      } finally {
        setLoading(false);
      }
    };
    fetchPart();
  }, [partId]);

  const handleSave = async () => {
    if (!part) return;
    setSaving(true);
    try {
      const db = DatabaseFactory.createDatabase();
      await db.updatePart(part.id, {
        spec: {
          ...part.spec,
          vtCurve,
        },
      });
      navigate(-1);
    } catch (e) {
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  // 画像naturalWidth/naturalHeight取得
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // 画像クリックでピクセル座標取得
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageSize || !calibStep) return;
    const rect = (e.target as HTMLImageElement).getBoundingClientRect();
    console.log('rect', rect);
    console.log('imageSize', imageSize);
    console.log('e', e);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (calibStep === 'origin') setCalibOrigin({ x, y });
    if (calibStep === 'x') setCalibX({ x, y, value: calibX?.value ?? 0 });
    if (calibStep === 'y') setCalibY({ x, y, value: calibY?.value ?? 0 });
    setCalibStep(null);
  };

  // キャリブレーション値確定
  const confirmCalibValue = (axis: 'x' | 'y') => {
    if (axis === 'x' && calibX)
      setCalibX({ ...calibX, value: parseFloat(calibXValue) });
    if (axis === 'y' && calibY)
      setCalibY({ ...calibY, value: parseFloat(calibYValue) });
  };

  // キャリブレーション保存
  const saveCalibration = () => {
    if (!calibOrigin || !calibX || !calibY || !imageSize) return;
    const xDeltaPx = calibX.x - calibOrigin.x;
    const yDeltaPx = calibOrigin.y - calibY.y;
    const xDeltaVal = calibX.value;
    const yDeltaVal = calibY.value;
    if (xDeltaPx === 0 || yDeltaPx === 0 || xDeltaVal <= 0 || yDeltaVal <= 0)
      return;
    setVtCurve({
      ...vtCurve,
      backgroundOrigin: calibOrigin,
      backgroundScale: {
        xMin: 0,
        xMax: xDeltaVal,
        yMin: 0,
        yMax: yDeltaVal,
        width: Math.abs(xDeltaPx),
        height: Math.abs(yDeltaPx),
      },
    });
    setShowCalibrationModal(false);
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!part) return <div>部品が見つかりません</div>;

  return (
    <div className="container">
      <h2>V-T曲線編集（{part.model}）</h2>
      <button
        type="button"
        className="app-button"
        onClick={() => setShowCalibrationModal(true)}
      >
        画像キャリブレーション
      </button>
      <VTCurveEditor value={vtCurve} onChange={setVtCurve} />
      <div style={{ marginTop: 24 }}>
        <button
          type="button"
          className="vt-curve-button"
          onClick={handleSave}
          disabled={saving}
        >
          保存
        </button>
        <button
          type="button"
          className="vt-curve-button"
          onClick={() => navigate(-1)}
          style={{ marginLeft: 8 }}
        >
          キャンセル
        </button>
      </div>
      <BaseModal
        isOpen={showCalibrationModal}
        onClose={() => setShowCalibrationModal(false)}
      >
        <div style={{ textAlign: 'center' }}>
          <h3>画像キャリブレーション</h3>
          {vtCurve.backgroundImage && (
            <img
              src={vtCurve.backgroundImage}
              alt="calib"
              style={{
                maxWidth: 600,
                maxHeight: 400,
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
                calibStep === 'origin' ? 'app-button active' : 'app-button'
              }
              onClick={() => setCalibStep('origin')}
            >
              原点を選択
            </button>
            <span style={{ marginLeft: 8 }}>
              原点:{' '}
              {calibOrigin
                ? `${calibOrigin.x.toFixed(0)}, ${calibOrigin.y.toFixed(0)}`
                : '未設定'}
            </span>
          </div>
          <div style={{ margin: 12 }}>
            <button
              type="button"
              className={calibStep === 'x' ? 'app-button active' : 'app-button'}
              onClick={() => setCalibStep('x')}
            >
              X軸点を選択
            </button>
            <span style={{ marginLeft: 8 }}>
              X軸点:{' '}
              {calibX
                ? `${calibX.x.toFixed(0)}, ${calibX.y.toFixed(0)}`
                : '未設定'}
            </span>
            <input
              type="number"
              value={calibXValue}
              onChange={(e) => setCalibXValue(e.target.value)}
              placeholder="X軸物理値"
              style={{ marginLeft: 8 }}
            />
            <button type="button" onClick={() => confirmCalibValue('x')}>
              確定
            </button>
          </div>
          <div style={{ margin: 12 }}>
            <button
              type="button"
              className={calibStep === 'y' ? 'app-button active' : 'app-button'}
              onClick={() => setCalibStep('y')}
            >
              Y軸点を選択
            </button>
            <span style={{ marginLeft: 8 }}>
              Y軸点:{' '}
              {calibY
                ? `${calibY.x.toFixed(0)}, ${calibY.y.toFixed(0)}`
                : '未設定'}
            </span>
            <input
              type="number"
              value={calibYValue}
              onChange={(e) => setCalibYValue(e.target.value)}
              placeholder="Y軸物理値"
              style={{ marginLeft: 8 }}
            />
            <button type="button" onClick={() => confirmCalibValue('y')}>
              確定
            </button>
          </div>
          <div style={{ margin: 12 }}>
            <button
              type="button"
              className="app-button"
              onClick={saveCalibration}
              disabled={!(calibOrigin && calibX && calibY)}
            >
              キャリブレーション保存
            </button>
            <button
              type="button"
              className="app-button"
              onClick={() => setShowCalibrationModal(false)}
              style={{ marginLeft: 8 }}
            >
              閉じる
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
};

export default VTCurveEditPage;
