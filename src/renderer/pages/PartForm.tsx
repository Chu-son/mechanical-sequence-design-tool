import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import { Manufacturer, Part, PartType } from '@/renderer/types/databaseTypes';
import '@/renderer/styles/Common.css';
import '@/renderer/styles/Modal.css';
import { partTypeFormConfigMap } from '@/renderer/config/modalConfigs';

// 部品種別の表示名マッピング
const partTypeLabels: Record<DrivePartType, string> = {
  rotationalActuator: '回転アクチュエータ',
  linearActuator: '直動アクチュエータ',
  rotToRotConverter: '回転→回転変換',
  rotToLinConverter: '回転→直動変換',
  linToRotConverter: '直動→回転変換',
  linToLinConverter: '直動→直動変換',
};

// 空のスペックオブジェクトを生成する関数
function createEmptySpec(type: DrivePartType): any {
  switch (type) {
    case 'rotationalActuator':
      return {
        ratedTorque: 0,
        ratedSpeed: 0,
        maxTorque: 0,
        maxSpeed: 0,
        rotorInertia: 0,
      } as RotationalActuatorSpec;

    case 'linearActuator':
      return {
        stroke: 0,
        ratedForce: 0,
        ratedSpeed: 0,
        maxForce: 0,
        maxSpeed: 0,
        maxAcceleration: 0,
      } as LinearActuatorSpec;

    case 'rotToRotConverter':
      return {
        efficiency: 0,
        gearRatio: 0,
        inertia: 0,
        allowableTorque: 0,
      } as RotToRotConverterSpec;

    case 'rotToLinConverter':
      return {
        efficiency: 0,
        lead: 0,
        conversionRatio: 0,
        allowableForce: 0,
      } as RotToLinConverterSpec;

    case 'linToRotConverter':
      return {
        efficiency: 0,
        conversionRatio: 0,
        allowableTorque: 0,
      } as LinToRotConverterSpec;

    case 'linToLinConverter':
      return {
        efficiency: 0,
        conversionRatio: 0,
        allowableForce: 0,
      } as LinToLinConverterSpec;

    default:
      return {};
  }
}

// 部品入力フォームページ
const PartForm: React.FC = () => {
  // URLパラメータ取得（partId: 編集時の部品ID、type: 新規作成時の部品種別）
  const { partId, type } = useParams<{
    partId: string;
    type?: DrivePartType;
  }>();
  const navigate = useNavigate();

  // 状態管理
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [formData, setFormData] = useState<any>({
    model: '',
    manufacturerId: '',
    spec: {},
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [partType, setPartType] = useState<DrivePartType | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // データ読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const database = DatabaseFactory.createDatabase();

        // メーカー一覧取得
        let manufacturersList = await database.getManufacturers();
        if (!Array.isArray(manufacturersList)) manufacturersList = [];
        setManufacturers(manufacturersList);

        // 編集モードなら部品データを取得
        if (partId && partId !== 'new') {
          setIsEditMode(true);
          const part = await database.getPartById(parseInt(partId, 10));

          if (part) {
            setPartType(part.type);
            setFormData({
              model: part.model,
              manufacturerId: part.manufacturerId.toString(),
              spec: part.spec,
            });
          } else {
            setError('指定された部品が見つかりません。');
          }
        }
        // 新規作成モード
        else if (type) {
          setIsEditMode(false);
          setPartType(type);
          setFormData({
            model: '',
            manufacturerId:
              manufacturersList.length > 0
                ? manufacturersList[0].id.toString()
                : '',
            spec: createEmptySpec(type),
          });
        } else {
          setError('部品種別が指定されていません。');
        }
      } catch (err) {
        console.error('データ読み込みエラー:', err);
        setError('データの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [partId, type]);

  // フォーム値変更ハンドラ
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    // spec内のフィールドかどうかを判定
    if (name.startsWith('spec.')) {
      const specField = name.replace('spec.', '');
      setFormData((prev) => ({
        ...prev,
        spec: {
          ...prev.spec,
          [specField]: value.includes('.')
            ? parseFloat(value)
            : parseInt(value, 10),
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // エラーをクリア
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // バリデーション
  const validate = (): boolean => {
    // 現在の部品種別に応じたフォーム設定を取得
    if (!partType) return false;
    const formConfig = partTypeFormConfigMap[partType];

    const errors: Record<string, string> = {};
    let isValid = true;

    // 各フィールドを検証
    formConfig.fields.forEach((field) => {
      const fieldId = field.id;
      let value: any;

      // spec内のフィールドかどうかを判定
      if (fieldId.startsWith('spec.')) {
        const specField = fieldId.replace('spec.', '');
        value = formData.spec?.[specField];
      } else {
        value = formData[fieldId];
      }

      // バリデーション関数があれば実行
      if (field.validation) {
        const error = field.validation(value?.toString() || '');
        if (error) {
          errors[fieldId] = error;
          isValid = false;
        }
      }

      // 必須フィールドの検証
      if (
        field.required &&
        (value === undefined || value === null || value === '')
      ) {
        errors[fieldId] = `${field.label}は必須です`;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  // 保存処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!partType) {
      setError('部品種別が指定されていません。');
      return;
    }

    // バリデーション
    if (!validate()) {
      return;
    }

    try {
      const database = DatabaseFactory.createDatabase();

      // 数値型への変換（DB保存前の処理）
      const processedFormData = {
        ...formData,
        manufacturerId: parseInt(formData.manufacturerId, 10),
      };

      if (isEditMode && partId) {
        // 更新
        await database.updatePart(parseInt(partId, 10), {
          model: processedFormData.model,
          manufacturerId: processedFormData.manufacturerId,
          spec: processedFormData.spec,
        });
      } else {
        // 新規作成
        await database.createPart({
          type: partType,
          model: processedFormData.model,
          manufacturerId: processedFormData.manufacturerId,
          spec: processedFormData.spec,
        });
      }

      // 成功したら部品一覧に戻る
      navigate('/parts');
    } catch (err) {
      console.error('保存エラー:', err);
      setError('部品の保存に失敗しました。');
    }
  };

  // 部品一覧に戻る
  const handleCancel = () => {
    navigate('/parts');
  };

  // 読み込み中表示
  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  // エラー表示
  if (error) {
    return <div className="error">{error}</div>;
  }

  // 部品種別が不明の場合
  if (!partType) {
    return <div className="error">部品種別が指定されていません。</div>;
  }

  // 現在の部品種別に応じたフォーム設定を取得
  const formConfig = partTypeFormConfigMap[partType];

  return (
    <div className="container">
      <h1>
        {isEditMode ? '部品編集' : '新規部品登録'} - {partTypeLabels[partType]}
      </h1>

      <form onSubmit={handleSubmit} className="part-form">
        {/* 共通フィールド（型式とメーカー）を先に表示 */}
        <div className="form-group">
          <label htmlFor="model">
            型式 <span className="required">*</span>
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
          />
          {formErrors.model && (
            <div className="error-message">{formErrors.model}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="manufacturerId">
            メーカー <span className="required">*</span>
          </label>
          <select
            id="manufacturerId"
            name="manufacturerId"
            value={formData.manufacturerId}
            onChange={handleChange}
            required
          >
            <option value="">メーカーを選択してください</option>
            {manufacturers.map((manufacturer) => (
              <option key={manufacturer.id} value={manufacturer.id}>
                {manufacturer.nameJa} ({manufacturer.nameEn})
              </option>
            ))}
          </select>
          {formErrors.manufacturerId && (
            <div className="error-message">{formErrors.manufacturerId}</div>
          )}
        </div>

        {/* スペック項目を動的に表示 */}
        <h2>スペック情報</h2>

        {formConfig.fields
          .filter((field) => field.id.startsWith('spec.'))
          .map((field) => {
            const fieldName = field.id;
            const specFieldName = field.id.replace('spec.', '');
            const value = formData.spec?.[specFieldName] || '';

            return (
              <div className="form-group" key={fieldName}>
                <label htmlFor={fieldName}>
                  {field.label}
                  {field.required && <span className="required">*</span>}
                  {field.unit && <span className="unit">({field.unit})</span>}
                </label>
                <input
                  type="number"
                  id={fieldName}
                  name={fieldName}
                  value={value}
                  onChange={handleChange}
                  min={field.min}
                  max={field.max}
                  step={field.step || 'any'}
                  required={field.required}
                />
                {formErrors[fieldName] && (
                  <div className="error-message">{formErrors[fieldName]}</div>
                )}
              </div>
            );
          })}

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
          >
            キャンセル
          </button>
          <button type="submit" className="save-button">
            {isEditMode ? '更新' : '登録'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PartForm;
