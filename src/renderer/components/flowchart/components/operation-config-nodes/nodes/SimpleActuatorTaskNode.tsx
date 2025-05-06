import React, { memo } from 'react';
import { useReactFlow, type NodeProps, Handle, Position } from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleActuatorTaskNodeDefinition from '@/renderer/components/flowchart/components/operation-config-nodes/nodes/SimpleActuatorTaskNodeDefinition';
import RenderNodeSideToolbar from '@/renderer/components/flowchart/common/renderNodeSideToolbar';
import { TaskNodeData } from '@/renderer/components/flowchart/components/operation-config-nodes/common';
import { useNodeInitialData } from '@/renderer/components/flowchart/components/common/useNodeInitialData';
import '@/renderer/styles/FlowchartTheme.css';

const renderCustomHandles = (id: string) => (
  <>
    <Handle type="source" position={Position.Right} id="detail-source" />
  </>
);

const renderCustomUI = (id: string) => (
  <RenderNodeSideToolbar
    options={[{ label: 'V-Chart', nodeType: 'velocityChart' }]}
    currentNodeId={id}
  />
);

function SimpleActuatorTaskNode({
  id,
  data,
}: NodeProps<{ data: TaskNodeData }>) {
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
      renderHandles={() => renderCustomHandles(id)}
      renderCustomUI={() => renderCustomUI(id)}
      updateNodeData={updateNodeData}
      className="simple-actuator-task-node"
    />
  );
}

export default memo(SimpleActuatorTaskNode);
