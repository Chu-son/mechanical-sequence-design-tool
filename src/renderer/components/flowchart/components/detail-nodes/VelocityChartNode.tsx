import React, { memo, useState, useEffect } from 'react';
import {
  Handle,
  Position,
  useReactFlow,
  useStore,
  type NodeProps,
} from '@xyflow/react';
import {
  calculateVelocityProfile,
  VelocityProfilePoint,
} from '@/renderer/components/flowchart/common/mechanicalCalculations';
import '@/renderer/components/flowchart/styles/common.css';
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
import { TaskNodeData } from '@/renderer/components/flowchart/components/operation-config-nodes/common';

function VelocityFigureNode({ id, data }: NodeProps<{ data: TaskNodeData }>) {
  // propsまたは接続からデータを受け取る
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
    data?.sourceNodeId
      ? `Source Node ID: ${data.sourceNodeId}`
      : 'Waiting for connection...',
  );

  // ReactFlowストアからエッジを取得
  const edges = useStore((state) => state.edges);
  // 接続元ノードのデータを取得
  const sourceNodeData = useStore((state) => {
    if (!sourceNodeId) return null;
    const sourceNode = state.nodes.find((node) => node.id === sourceNodeId);
    return sourceNode?.data;
  });
  const { updateNodeData } = useReactFlow();

  // 初期化時にデータをセット
  useEffect(() => {
    if (data?.position !== undefined) {
      setPosition(data.position);
      setVelocity(data.velocity || 0);
      setAcceleration(data.acceleration || 0);
      setDeceleration(data.deceleration || 0);
    }
  }, [id, data]);

  // エッジの変化でsourceNodeIdを更新
  useEffect(() => {
    if (data?.sourceNodeId) {
      setSourceNodeId(data.sourceNodeId);
      setDebugInfo(`Source Node ID: ${data.sourceNodeId}`);
      return;
    }
    // このノードをターゲットとするエッジを検索
    const incomingEdges = edges.filter((edge) => edge.target === id);
    if (incomingEdges.length > 0) {
      const sourceId = incomingEdges[0].source;
      setSourceNodeId(sourceId);
      setDebugInfo(`Source Node ID: ${sourceId}`);
    } else {
      setSourceNodeId(null);
      setDebugInfo('Not connected');
      // 未接続時はリセット
      if (!data?.position) {
        setPosition(0);
        setVelocity(0);
        setAcceleration(0);
        setDeceleration(0);
        setVelocityProfile([]);
        setTotalTime(0);
      }
    }
  }, [edges, id, data]);

  // 接続元ノードのデータが変化したときにパラメータを更新
  useEffect(() => {
    if (!sourceNodeId || !sourceNodeData) return;
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
        `Source: ${sourceNodeId}, ` +
          `Position: ${newPosition}, ` +
          `Velocity: ${newVelocity}, ` +
          `Acceleration: ${newAcceleration}, ` +
          `Deceleration: ${newDeceleration}`,
      );
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
    setVelocityProfile(profileData);
    setTotalTime(totalTime);
  }, [position, velocity, acceleration, deceleration]);

  return (
    <div className="node" style={{ width: '300px' }}>
      <Handle type="target" position={Position.Left} id="target" />
      <div className="node-title">Velocity Chart</div>
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
                      return [`${value} mm/s`, 'Velocity'];
                    }
                    return [`${value}`, name];
                  }}
                />
                <Legend
                  formatter={(value) =>
                    value === 'velocity' ? 'Velocity' : value
                  }
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
              <div>Please connect a node to get data</div>
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
          <div>Position: {position} mm</div>
          <div>Max Velocity: {velocity} mm/s</div>
          <div>Acceleration: {acceleration} mm/s²</div>
          <div>Deceleration: {deceleration} mm/s²</div>
          <div>Total Time: {totalTime} s</div>
        </div>
      </div>
    </div>
  );
}

export default memo(VelocityFigureNode);
