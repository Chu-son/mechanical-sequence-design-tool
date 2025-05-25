import React, { memo } from 'react';
import { useReactFlow, Handle, Position } from '@xyflow/react';
import BaseNode from '@/renderer/features/flowchart/components/base-nodes/BaseNode';
import RenderNodeSideToolbar from '@/renderer/features/flowchart/utils/common/renderNodeSideToolbar';
import simpleActuatorTaskNodeDefinition from '@/renderer/features/flowchart/components/operation-config-nodes/nodes/SimpleActuatorTaskNodeDefinition';
import { TaskNodeData } from '@/renderer/features/flowchart/components/operation-config-nodes/common';
import { useNodeInitialData } from '@/renderer/features/flowchart/components/common/useNodeInitialData';
import '@/renderer/styles/FlowchartTheme.css';

interface SimpleActuatorTaskNodeProps {
  id: string;
  data: TaskNodeData;
}

const renderCustomHandles = () => (
  <Handle type="source" position={Position.Right} id="detail-source" />
);

const renderCustomUI = (id: string) => (
  <RenderNodeSideToolbar
    options={[{ label: 'V-Chart', nodeType: 'velocityChart' }]}
    currentNodeId={id}
  />
);

function SimpleActuatorTaskNode({ id, data }: SimpleActuatorTaskNodeProps) {
  const { updateNodeData } = useReactFlow();
  useNodeInitialData({
    id,
    data,
    definition: simpleActuatorTaskNodeDefinition,
    updateNodeData,
  });

  return (
    <BaseNode
      id={id}
      data={data}
      definition={simpleActuatorTaskNodeDefinition}
      renderHandles={renderCustomHandles}
      renderCustomUI={() => renderCustomUI(id)}
      updateNodeData={updateNodeData}
      className="simple-actuator-task-node"
    />
  );
}

export default memo(SimpleActuatorTaskNode);
