import React, { useRef, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  Background,
} from '@xyflow/react';
import { useParams } from 'react-router-dom';
import Database from '../../utils/database';

const ProjectsDB = Database;
import { DnDProvider, useDnD } from '../utils/DnDContext';
import TaskNode, {
  MemoizedTaskStartNode,
  MemoizedTaskEndNode,
} from '../components/TaskNode';
import FlowchartSidebar from '../components/FlowchartSidebar';
import '@xyflow/react/dist/style.css';

const nodeTypes = {
  taskStart: MemoizedTaskStartNode,
  task: TaskNode,
  taskEnd: MemoizedTaskEndNode,
};

let id = 0;
const getId = (): string => {
  id += 1;
  return `${id}`;
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
  const [edges, setEdges, onEdgesChange] = useEdgesState<any[]>([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  useEffect(() => {
    if (!projectId || !configType || !configId) {
      console.error('Missing parameters: projectId, configType, or configId');
      return;
    }
    console.log(
      `Loading flow data for projectId: ${projectId}, configType: ${configType}, configId: ${configId}`,
    );

    const loadFlowData = async () => {
      const flowData = await ProjectsDB.getFlowData(
        Number(projectId),
        configType as 'driveConfigs' | 'operationConfigs',
        Number(configId),
      );
      if (flowData) {
        setNodes(flowData.nodes || []);
        setEdges(flowData.edges || []);
      } else {
        setNodes(initialNodes);
      }
    };

    loadFlowData();
  }, [projectId, configType, configId, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

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
        projectId={Number(projectId)}
        unitId={Number(unitId)}
        configType={configType as 'driveConfigs' | 'operationConfigs'}
        configId={Number(configId)}
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
