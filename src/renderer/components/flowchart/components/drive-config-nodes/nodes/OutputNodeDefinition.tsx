import { NodeDefinition } from '@/renderer/components/flowchart/components/base-nodes/types';
import {
  roundToDigits,
  ROUND_DIGITS,
} from '@/renderer/components/flowchart/common/flowchartUtils';

const outputNodeDefinition: NodeDefinition = {
  type: 'outputNode',
  title: 'Output',
  handles: { target: true, source: false },
  groupTitles: {
    rotational: 'Rotational Output',
    linear: 'Linear Output',
    common: 'Common',
  },
  groupDisplayOptions: {
    rotational: { showTitle: true, showDivider: false },
    linear: { showTitle: true, showDivider: false },
    common: { showTitle: false, showDivider: true },
  },
  fields: [
    // 回転出力パラメータ
    {
      key: 'rotational-params',
      label: '回転出力パラメーター',
      type: 'custom',
      group: 'rotational',
      hidden: (data) => data.type !== 'rotational',
      render: (data) => {
        const d = data.calculatedOutput?.rotational;
        if (!d) return null;
        return (
          <div>
            <div>トルク: {roundToDigits(d.torque, ROUND_DIGITS)} N・m</div>
            <div>回転速度: {roundToDigits(d.speed, ROUND_DIGITS)} rpm</div>
            <div>出力: {roundToDigits(d.power, ROUND_DIGITS)} W</div>
            <div>
              慣性モーメント: {roundToDigits(d.inertia, ROUND_DIGITS)} kg・m²
            </div>
            <div>回転方向: {d.direction > 0 ? '正転' : '逆転'}</div>
          </div>
        );
      },
    },
    // 直動出力パラメータ
    {
      key: 'linear-params',
      label: '直動出力パラメーター',
      type: 'custom',
      group: 'linear',
      hidden: (data) => data.type !== 'linear',
      render: (data) => {
        const d = data.calculatedOutput?.linear;
        if (!d) return null;
        return (
          <div>
            <div>推力: {roundToDigits(d.force, ROUND_DIGITS)} N</div>
            <div>速度: {roundToDigits(d.velocity, ROUND_DIGITS)} mm/s</div>
            {d.acceleration > 0 && (
              <div>
                加速度: {roundToDigits(d.acceleration, ROUND_DIGITS)} mm/s²
              </div>
            )}
            <div>出力: {roundToDigits(d.power, ROUND_DIGITS)} W</div>
            {d.mass > 0 && (
              <div>負荷質量: {roundToDigits(d.mass, ROUND_DIGITS)} kg</div>
            )}
            <div>方向: {d.direction > 0 ? '正方向' : '逆方向'}</div>
          </div>
        );
      },
    },
    // 共通: 入力システム効率
    {
      key: 'efficiency',
      label: '入力システム効率',
      type: 'custom',
      group: 'common',
      hidden: (data) => data.calculatedOutput?.sourceEfficiency === undefined,
      render: (data) => (
        <div>
          入力システム効率:{' '}
          {roundToDigits(
            (data.calculatedOutput?.sourceEfficiency ?? 0) * 100,
            ROUND_DIGITS,
          )}
          %
        </div>
      ),
    },
    // 警告
    {
      key: 'overload-warning',
      label: '警告',
      type: 'custom',
      group: 'common',
      hidden: (data) => !data.calculatedOutput?.isOverloaded,
      render: () => (
        <div className="error">⚠️ 警告: システムが過負荷状態です！</div>
      ),
    },
    // 未接続時の案内
    {
      key: 'no-input',
      label: '未接続',
      type: 'custom',
      group: 'common',
      hidden: (data) => data.type === 'rotational' || data.type === 'linear',
      render: () => <div className="info">入力ノードが接続されていません</div>,
    },
  ],
  compute: undefined,
};

export default outputNodeDefinition;
