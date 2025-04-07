import React, { useRef, useCallback, useEffect } from 'react';
import type { Edge, Connection } from '@xyflow/react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  Background,
  reconnectEdge,
} from '@xyflow/react';
import { useParams } from 'react-router-dom';
import Database from '../../utils/database';
import { DnDProvider, useDnD } from '../utils/DnDContext';
import SimpleTaskNode, {
  MemoizedTaskStartNode,
  MemoizedTaskEndNode,
} from '../components/TaskNode';
import FlowchartSidebar from '../components/FlowchartSidebar';
import '@xyflow/react/dist/style.css';

const ProjectsDB = Database;

const nodeTypes = {
  taskStart: MemoizedTaskStartNode,
  task: SimpleTaskNode,
  taskEnd: MemoizedTaskEndNode,
};

let idCounter = 0;
const getId = (): string => {
  idCounter += 1;
  return `${idCounter}`;
};

const initializeId = (nodes: any[], edges: any[]) => {
  const nodeIds = nodes
    .map((node) => parseInt(node.id, 10))
    .filter((nodeId) => !Number.isNaN(nodeId));
  const edgeIds = edges
    .map((edge) => parseInt(edge.id, 10))
    .filter((edgeId) => !Number.isNaN(edgeId));
  const maxNodeId = Math.max(0, ...nodeIds);
  const maxEdgeId = Math.max(0, ...edgeIds);
  idCounter = Math.max(maxNodeId, maxEdgeId);
};

const initialNodes: any[] = [];

function DnDFlow() {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

  const { projectId, unitId, configType, configId } = useParams<{
    projectId: string;
    unitId: string;
    configType: string;
    configId: string;
  }>();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>();
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  useEffect(() => {
    if (!projectId || !configType || !configId) {
      return;
    }

    const loadFlowData = async () => {
      const flowData = await ProjectsDB.getFlowData({
        projectId: Number(projectId),
        unitId: Number(unitId),
        configType: configType as 'driveConfigs' | 'operationConfigs',
        configId: Number(configId),
      });
      if (flowData) {
        setNodes(flowData.nodes || []);
        setEdges(flowData.edges || []);
        initializeId(flowData.nodes || [], flowData.edges || []);
      } else {
        setNodes(initialNodes);
      }
    };

    loadFlowData();
  }, [projectId, unitId, configType, configId, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const edgeReconnectSuccessful = useRef<boolean>(true);

  const onReconnectStart = useCallback((): void => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection): void => {
      edgeReconnectSuccessful.current = true;
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els as Edge[]));
    },
    [],
  );

  const onReconnectEnd = useCallback((_: unknown, edge: Edge): void => {
    console.log('onReconnectEnd', edge);
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => (e as Edge).id !== edge.id));
    }
    edgeReconnectSuccessful.current = true;
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type, setNodes],
  );

  return (
    <div className="dndflow">
      <div
        className="reactflow-wrapper"
        ref={reactFlowWrapper}
        style={{ height: '100%', width: '100%' }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onReconnect={onReconnect}
          onReconnectStart={onReconnectStart}
          onReconnectEnd={onReconnectEnd}
          fitView
          nodeTypes={nodeTypes}
          style={{ backgroundColor: '#F7F9FB' }}
          colorMode="system"
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <FlowchartSidebar
        configIdentifier={{
          projectId: Number(projectId),
          unitId: Number(unitId),
          configType: configType as 'driveConfigs' | 'operationConfigs',
          configId: Number(configId),
        }}
      />
    </div>
  );
}

export default function Flowchart({
  projectId = 1,
  configType = 'driveConfigs',
  configId = 1,
}: {
  projectId?: number;
  configType?: 'driveConfigs' | 'operationConfigs';
  configId?: number;
}) {
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <DnDFlow />
      </DnDProvider>
    </ReactFlowProvider>
  );
}
