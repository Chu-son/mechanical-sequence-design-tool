import React, { useRef, useCallback } from 'react';
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

import '@xyflow/react/dist/style.css';

import Sidebar from '../components/Sidebar';
import { DnDProvider, useDnD } from '../utils/DnDContext';

import TaskNode, { MemoizedTaskStartNode, MemoizedTaskEndNode } from '../components/TaskNode';
import FlowchartSidebar from '../components/FlowchartSidebar';

const nodeTypes = {
  taskStart: MemoizedTaskStartNode,
  task: TaskNode,
  taskEnd: MemoizedTaskEndNode,
};

let id = 0;
const getId = () => `${id++}`;

const initialNodes = [
  {
    id: getId(),
    type: 'taskStart',
    data: { label: 'Task Start Node' },
    position: { x: 250, y: 5 },
  },
];

function DnDFlow() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
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
    [screenToFlowPosition, type],
  );

  return (
    <div
      className="dndflow"
      style={{ height: '100vh', width: '100vw', display: 'flex' }}
    >
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
      <FlowchartSidebar />
    </div>
  );
}

export default function Flowchart() {
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <DnDFlow />
      </DnDProvider>
    </ReactFlowProvider>
  );
}
