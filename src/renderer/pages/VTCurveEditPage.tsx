import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import { DrivePart, VTCurve } from '@/renderer/types/driveTypes';
import VTCurveEditor from '@/renderer/features/parts/VTCurveEditor';

const VTCurveEditPage: React.FC = () => {
  const { partId } = useParams<{ partId: string }>();
  const navigate = useNavigate();
  const [part, setPart] = useState<DrivePart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vtCurve, setVtCurve] = useState<VTCurve>({ points: [] });
  const [saving, setSaving] = useState(false);

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

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!part) return <div>部品が見つかりません</div>;

  return (
    <div className="container">
      <h2>V-T曲線編集（{part.model}）</h2>
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
    </div>
  );
};

export default VTCurveEditPage;
