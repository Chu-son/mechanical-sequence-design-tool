/**
 * 速度チャートノードの定義
 */
import { ReactNode } from 'react';
import { NodeDefinition } from '@/renderer/features/flowchart/components/base-nodes/types';
import {
  calculateVelocityProfile,
  VelocityProfilePoint,
} from '@/renderer/features/flowchart/utils/common/mechanicalCalculations';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  PhysicalQuantityType,
  getUnitLabel,
} from '@/renderer/types/unitMappings';

/**
 * 速度プロファイルチャートを描画する関数
 */
const renderVelocityChart = (
  chartData: VelocityProfilePoint[],
  data: any,
): ReactNode => {
  if (chartData.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#999',
          border: '1px dashed #ccc',
          borderRadius: '4px',
          padding: '10px',
        }}
      >
        <div>Please connect a node to get data</div>
        <div style={{ fontSize: '10px', marginTop: '10px', color: '#666' }}>
          {data.debugInfo || 'Waiting for connection...'}
        </div>
      </div>
    );
  }

  const timeUnitLabel = getUnitLabel(PhysicalQuantityType.TIME);
  const velocityUnitLabel = getUnitLabel(PhysicalQuantityType.LINEAR_SPEED);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          label={{
            value: `Time [${timeUnitLabel}]`,
            position: 'insideBottomRight',
            offset: -5,
          }}
        />
        <YAxis
          label={{
            value: `Velocity [${velocityUnitLabel}]`,
            angle: -90,
            position: 'insideLeft',
          }}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === 'velocity') {
              return [`${value} ${velocityUnitLabel}`, 'Velocity'];
            }
            return [`${value}`, name];
          }}
        />
        <Legend
          formatter={(value) => (value === 'velocity' ? 'Velocity' : value)}
        />
        <Line
          type="monotone"
          dataKey="velocity"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * 速度プロファイルデータを計算する関数
 */
const calculateVelocityData = (data: any): VelocityProfilePoint[] => {
  if (!data) return [];

  const { position, velocity, acceleration, deceleration } = data;

  // いずれかのパラメータが不足している場合は空配列を返す
  if (
    position === undefined ||
    velocity === undefined ||
    acceleration === undefined ||
    deceleration === undefined
  ) {
    return [];
  }

  const { profileData } = calculateVelocityProfile(
    position,
    velocity,
    acceleration,
    deceleration,
  );

  return profileData;
};

/**
 * 速度チャートノードの定義
 */
const velocityChartNodeDefinition: NodeDefinition = {
  type: 'velocityChart',
  title: 'Velocity Chart',
  groupTitles: {
    chart: 'Velocity Profile',
    parameters: 'Parameters',
    results: 'Results',
  },
  groupDisplayOptions: {
    chart: { showTitle: false, showDivider: false },
    parameters: { showTitle: true, showDivider: true },
    results: { showTitle: true, showDivider: true },
  },
  // 前段ノードから伝播するフィールド
  propagateFields: {
    position: 'position',
    velocity: 'velocity',
    acceleration: 'acceleration',
    deceleration: 'deceleration',
  },
  // 初期データ設定
  getInitialData: () => ({
    position: 0,
    velocity: 0,
    acceleration: 0,
    deceleration: 0,
    totalTime: 0,
    sourceNodeId: null,
    debugInfo: 'Waiting for connection...',
  }),
  // フィールド定義
  fields: [
    {
      key: 'velocityChart',
      label: '',
      type: 'chart',
      height: 200,
      group: 'chart',
      getData: calculateVelocityData,
      renderChart: renderVelocityChart,
    },
    {
      key: 'position',
      label: 'Position',
      type: 'readonly',
      unit: 'mm',
      group: 'parameters',
      getValue: (data) => data.position,
    },
    {
      key: 'velocity',
      label: 'Max Velocity',
      type: 'readonly',
      unit: 'mm/s',
      group: 'parameters',
      getValue: (data) => data.velocity,
    },
    {
      key: 'acceleration',
      label: 'Acceleration',
      type: 'readonly',
      unit: 'mm/s²',
      group: 'parameters',
      getValue: (data) => data.acceleration,
    },
    {
      key: 'deceleration',
      label: 'Deceleration',
      type: 'readonly',
      unit: 'mm/s²',
      group: 'parameters',
      getValue: (data) => data.deceleration,
    },
    {
      key: 'totalTime',
      label: 'Total Time',
      type: 'readonly',
      unit: 's',
      group: 'results',
      getValue: (data) => data.totalTime,
    },
  ],

  // 計算処理（プロパティ変更時に実行）
  compute: (data, nodeId, update) => {
    if (!data) return;

    const { position, velocity, acceleration, deceleration } = data;

    // 速度プロファイルを計算
    const { totalTime } = calculateVelocityProfile(
      position,
      velocity,
      acceleration,
      deceleration,
    );

    // 合計時間が変わっていれば更新
    if (data.totalTime !== totalTime) {
      update({
        ...data,
        totalTime,
      });
    }
  },
};

export default velocityChartNodeDefinition;
