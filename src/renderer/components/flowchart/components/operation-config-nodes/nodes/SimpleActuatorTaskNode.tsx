import React, { memo, useEffect } from 'react';
import {
  useReactFlow,
  useNodeConnections,
  useNodesData,
  type NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import BaseNode from '@/renderer/components/flowchart/components/base-nodes/BaseNode';
import simpleActuatorTaskNodeDefinition from '@/renderer/components/flowchart/components/operation-config-nodes/nodes/SimpleActuatorTaskNodeDefinition';
import RenderNodeSideToolbar from '@/renderer/components/flowchart/common/renderNodeSideToolbar';
import { TaskNodeData } from '@/renderer/components/flowchart/components/operation-config-nodes/common';
import '@/renderer/components/flowchart/styles/common.css';

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
  const connections = useNodeConnections({ handleType: 'target' });
  const previousNodeData = useNodesData(connections?.[0]?.source) as
    | { data?: { totalDuration?: number } }
    | undefined;

  useEffect(() => {
    if (!data) {
      const initialData =
        simpleActuatorTaskNodeDefinition.getInitialData?.() || {};
      updateNodeData(id, { data: initialData });
    }
  }, [id, data, updateNodeData]);

  useEffect(() => {
    if (!data) return;
    const previousTotalDuration = previousNodeData?.data?.totalDuration || 0;
    if (data.previousTotalDuration !== previousTotalDuration) {
      updateNodeData(id, {
        ...data,
        previousTotalDuration,
      });
    }
  }, [id, data, previousNodeData, updateNodeData]);

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
