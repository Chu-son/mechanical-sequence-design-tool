import React, { useRef, useCallback, useEffect } from 'react';
import Dagre from '@dagrejs/dagre';
import type {
  Edge,
  Connection,
  Node,
  DefaultEdgeOptions,
  FlowData,
} from '@xyflow/react';
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
  Panel,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
} from '@xyflow/react';
import { useParams } from 'react-router-dom';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import { useDnD } from '@/renderer/flowchart/utils/DnDContext';
import { nodeTypes as operationNodeTypes } from '@/renderer/flowchart/components/operation-config-nodes';
import { nodeTypes as driveNodeTypes } from '@/renderer/flowchart/components/drive-config-nodes';

const defaultEdgeOptions: DefaultEdgeOptions = {
  interactionWidth: 75,
};

const combinedNodeTypes = { ...operationNodeTypes, ...driveNodeTypes };
import FlowchartSidebar from '@/renderer/flowchart/components/FlowchartSidebar';
import '@xyflow/react/dist/style.css';

const ProjectsDB = DatabaseFactory.createDatabase();

let idCounter = 0;
const getId = (): string => {
  idCounter += 1;
  return `${idCounter}`;
};

const initializeId = (nodes: Node[], edges: Edge[]) => {
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

const initialNodes: Node[] = [];

function DnDFlow() {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

  const { projectId, unitId, configType, configId } = useParams<{
    projectId: string;
    unitId: string;
    configType: string;
    configId: string;
  }>();

  const {
    fitView,
    getEdge,
    updateEdge,
    addEdges,
    screenToFlowPosition,
    toObject,
  } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>();
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

  const getLayoutedElements = (
    nodes: Node[],
    edges: Edge[],
    direction = 'TB',
  ) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: direction });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
      g.setNode(node.id, {
        ...node,
        width: node.measured?.width ?? 0,
        height: node.measured?.height ?? 0,
      }),
    );

    Dagre.layout(g);

    return {
      nodes: nodes.map((node) => {
        const position = g.node(node.id);
        const x = position.x - (node.measured?.width ?? 0) / 2;
        const y = position.y - (node.measured?.height ?? 0) / 2;

        return { ...node, position: { x, y } };
      }),
      edges,
    };
  };

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge),
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            })),
          );

          return [...remainingEdges, ...createdEdges];
        }, edges),
      );
    },
    [nodes, edges],
  );

  const onAlignNodes = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges, 'TB');
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);

    fitView({ padding: 0.2 });
  }, [nodes, edges, setNodes, setEdges]);

  const saveFlowData = async () => {
    const flow = toObject();

    try {
      const projects = await ProjectsDB.getAllProjects();

      const parsedProjectId = Number(projectId);
      const parsedUnitId = Number(unitId);
      const parsedConfigId = Number(configId);
      const parsedConfigType = configType as
        | 'driveConfigs'
        | 'operationConfigs';

      console.log('Debug: identifier:', {
        projectId: parsedProjectId,
        unitId: parsedUnitId,
        configType: parsedConfigType,
        configId: parsedConfigId,
      });

      const project = projects.find((p) => p.id === parsedProjectId);
      if (!project) throw new Error('Project not found');

      const unit = project.units.find((u) => u.id === parsedUnitId);
      if (!unit) throw new Error('Unit not found');

      const configList = unit[parsedConfigType];
      console.log('Debug: unit[configType]:', configList);
      if (!configList || configList.length === 0) {
        throw new Error(
          `No configurations found for type: ${parsedConfigType}`,
        );
      }
      const config = configList.find((c) => c.id === parsedConfigId);
      if (!config) throw new Error('Configuration not found');

      config.flow_data = {
        nodes: flow.nodes as unknown as FlowData['nodes'],
        edges: flow.edges,
        viewport: flow.viewport,
      };
      await ProjectsDB.updateProject({ projectId: parsedProjectId }, project);
      console.log('Flow data saved successfully');
    } catch (error) {
      console.error('Error saving flow data:', error);
    }
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const overlappedEdgeRef = useRef<string | null>(null);

  const onNodeDrag = useCallback(
    (e: React.DragEvent, node: Node) => {
      const nodeDiv = document.querySelector(
        `.react-flow__node[data-id="${node.id}"]`,
      );

      if (!nodeDiv) return;

      const rect = nodeDiv.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const edgeFound = document
        .elementsFromPoint(centerX, centerY)
        .find((el) =>
          el.classList.contains('react-flow__edge-interaction'),
        )?.parentElement;

      const edgeId = edgeFound?.dataset.id;

      if (edgeId) updateEdge(edgeId, { style: { stroke: 'black' } });
      else if (overlappedEdgeRef.current)
        updateEdge(overlappedEdgeRef.current, { style: {} });

      overlappedEdgeRef.current = edgeId || null;
    },
    [updateEdge],
  );

  const onNodeDragStop = useCallback(
    (event: React.DragEvent, node: Node) => {
      const edgeId = overlappedEdgeRef.current;
      if (!edgeId) return;
      const edge = getEdge(edgeId);
      if (!edge) return;

      updateEdge(edgeId, { source: edge.source, target: node.id, style: {} });

      addEdges({
        id: `${node.id}->${edge.target}`,
        source: node.id,
        target: edge.target,
      });

      overlappedEdgeRef.current = null;
    },
    [getEdge, addEdges, updateEdge],
  );

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
          onNodesDelete={onNodesDelete}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onReconnect={onReconnect}
          onReconnectStart={onReconnectStart}
          onReconnectEnd={onReconnectEnd}
          fitView
          nodeTypes={combinedNodeTypes}
          style={{ backgroundColor: '#F7F9FB' }}
          colorMode="system"
          defaultEdgeOptions={defaultEdgeOptions}
        >
          <Controls />
          <Panel position="top-left">
            <button
              onClick={onAlignNodes}
              style={{
                padding: '5px 10px',
                fontSize: '12px',
                marginRight: '5px',
              }}
            >
              Align Vertically
            </button>
            <button
              onClick={saveFlowData}
              style={{
                padding: '5px 10px',
                fontSize: '12px',
              }}
            >
              Save
            </button>
          </Panel>
          <Background />
        </ReactFlow>
      </div>
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
      <DnDFlow />
    </ReactFlowProvider>
  );
}
