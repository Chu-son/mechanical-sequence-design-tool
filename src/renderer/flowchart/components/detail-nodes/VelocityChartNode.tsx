import React, {
  memo,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
} from 'react';
import {
  Handle,
  Position,
  useReactFlow,
  useStore,
  NodeToolbar,
  type NodeProps,
} from '@xyflow/react';
import * as d3 from 'd3';
import { calculateVelocityProfile } from '@/renderer/flowchart/common/mechanicalCalculations';
import { roundToDigits } from '@/renderer/flowchart/common/flowchartUtils';
import '@/renderer/flowchart/styles/common.css';
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

function VelocityFigureNode({ id, data }: NodeProps<{ data: TaskNodeData }>) {
  // データを直接propsから受け取るか、接続を通じて取得
  const [position, setPosition] = useState(data?.position || 0);
  const [velocity, setVelocity] = useState(data?.velocity || 0);
  const [acceleration, setAcceleration] = useState(data?.acceleration || 0);
  const [deceleration, setDeceleration] = useState(data?.deceleration || 0);
  const [velocityProfile, setVelocityProfile] = useState<
    VelocityProfilePoint[]
  >([]);
  const [totalTime, setTotalTime] = useState(0);
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(
    data?.sourceNodeId || null,
  );
  const [debugInfo, setDebugInfo] = useState<string>(
    data?.sourceNodeId ? `接続元ノードID: ${data.sourceNodeId}` : '接続待ち...',
  );

  // ReactFlowのストアから直接エッジとノードを取得
  const edges = useStore((state) => state.edges);
  const nodes = useStore((state) => state.nodes);
  // ソースノードの監視に使用するセレクタ
  const sourceNodeData = useStore((state) => {
    if (!sourceNodeId) return null;
    const sourceNode = state.nodes.find((node) => node.id === sourceNodeId);
    return sourceNode?.data;
  });
  const { updateNodeData } = useReactFlow();

  // 初期起動時にノードの情報をログ出力
  useEffect(() => {
    console.log(`[VelocityFigureNode] ノード初期化 - ID: ${id}`);
    console.log(`[VelocityFigureNode] 初期データ:`, data);

    if (data?.position !== undefined) {
      setPosition(data.position);
      setVelocity(data.velocity || 0);
      setAcceleration(data.acceleration || 0);
      setDeceleration(data.deceleration || 0);

      console.log(
        `[VelocityFigureNode] 初期パラメータ設定 - position: ${data.position}, velocity: ${data.velocity}, acceleration: ${data.acceleration}, deceleration: ${data.deceleration}`,
      );
    }
  }, [id, data]);

  // エッジの変更を検出してソースノードIDを更新
  useEffect(() => {
    // データから直接sourceNodeIdが提供されている場合はそれを優先
    if (data?.sourceNodeId) {
      setSourceNodeId(data.sourceNodeId);
      setDebugInfo(`接続元ノードID: ${data.sourceNodeId}`);
      return;
    }

    // このノードをターゲットとするエッジを検索
    const incomingEdges = edges.filter((edge) => edge.target === id);

    if (incomingEdges.length > 0) {
      const sourceId = incomingEdges[0].source;
      setSourceNodeId(sourceId);
      console.log(
        `[VelocityFigureNode] エッジ接続検出 - ソースID: ${sourceId}, ターゲットID: ${id}`,
      );
      setDebugInfo(`接続元ノードID: ${sourceId}`);
    } else {
      setSourceNodeId(null);
      setDebugInfo('接続されていません');
      // 接続が無い場合はリセット
      if (!data?.position) {
        setPosition(0);
        setVelocity(0);
        setAcceleration(0);
        setDeceleration(0);
        setVelocityProfile([]);
        setTotalTime(0);
      }
      console.log(`[VelocityFigureNode] 接続なし - ノードID: ${id}`);
    }
  }, [edges, id, data]);

  // ソースノードのデータが変更された時にパラメータを更新
  useEffect(() => {
    if (!sourceNodeId || !sourceNodeData) return;

    // SimpleActuatorTaskNodeのパラメータを取得
    const newPosition =
      sourceNodeData.position !== undefined ? sourceNodeData.position : 0;
    const newVelocity =
      sourceNodeData.velocity !== undefined ? sourceNodeData.velocity : 0;
    const newAcceleration =
      sourceNodeData.acceleration !== undefined
        ? sourceNodeData.acceleration
        : 0;
    const newDeceleration =
      sourceNodeData.deceleration !== undefined
        ? sourceNodeData.deceleration
        : 0;

    // 実際に値が変わった場合のみ更新を行う
    if (
      newPosition !== position ||
      newVelocity !== velocity ||
      newAcceleration !== acceleration ||
      newDeceleration !== deceleration
    ) {
      setPosition(newPosition);
      setVelocity(newVelocity);
      setAcceleration(newAcceleration);
      setDeceleration(newDeceleration);

      setDebugInfo(
        `接続元: ${sourceNodeId}, ` +
          `位置: ${newPosition}, ` +
          `速度: ${newVelocity}, ` +
          `加速度: ${newAcceleration}, ` +
          `減速度: ${newDeceleration}`,
      );

      // データを更新して保存
      updateNodeData(id, {
        ...data,
        position: newPosition,
        velocity: newVelocity,
        acceleration: newAcceleration,
        deceleration: newDeceleration,
        sourceNodeId,
      });
    }
  }, [
    sourceNodeId,
    sourceNodeData,
    id,
    updateNodeData,
    data,
    position,
    velocity,
    acceleration,
    deceleration,
  ]);

  // 速度プロファイルを計算
  useEffect(() => {
    const { profileData, totalTime } = calculateVelocityProfile(
      position,
      velocity,
      acceleration,
      deceleration,
    );

    console.log(
      `[VelocityFigureNode] 速度プロファイル計算結果 - データ点数: ${profileData.length}, 総時間: ${totalTime}`,
    );

    setVelocityProfile(profileData);
    setTotalTime(totalTime);
  }, [position, velocity, acceleration, deceleration]);

  return (
    <div className="node" style={{ width: '300px' }}>
      <Handle type="target" position={Position.Left} id="target" />
      <div className="node-title">Velocity Figure</div>
      <div className="node-content">
        <div style={{ height: '200px', width: '100%' }}>
          {velocityProfile.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={velocityProfile}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  label={{
                    value: 'Time [sec]',
                    position: 'insideBottomRight',
                    offset: -5,
                  }}
                />
                <YAxis
                  label={{
                    value: 'Velocity [mm/s]',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'velocity') {
                      return [`${value} mm/s`, '速度'];
                    }
                    return [`${value}`, name];
                  }}
                />
                <Legend
                  formatter={(value) => (value === 'velocity' ? '速度' : value)}
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
          ) : (
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
              <div>接続ノードからデータを取得してください</div>
              <div
                style={{ fontSize: '10px', marginTop: '10px', color: '#666' }}
              >
                {debugInfo}
              </div>
            </div>
          )}
        </div>
        <hr className="node-divider" />
        <div className="node-readonly-field">
          <div>移動量: {position} mm</div>
          <div>最大速度: {velocity} mm/s</div>
          <div>加速度: {acceleration} mm/s²</div>
          <div>減速度: {deceleration} mm/s²</div>
          <div>全体時間: {totalTime} 秒</div>
        </div>
      </div>
    </div>
  );
}

export default memo(VelocityFigureNode);
