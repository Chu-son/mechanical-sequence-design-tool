import RootNode from '@/renderer/flowchart/components/drive-config-nodes/RootNode';
import OutputNode from '@/renderer/flowchart/components/drive-config-nodes/OutputNode';
import SimpleLinearActuatorNode from '@/renderer/flowchart/components/drive-config-nodes/SimpleLinearActuatorNode';

export { RootNode, OutputNode, SimpleLinearActuatorNode };
export * from '@/renderer/flowchart/components/drive-config-nodes/common';

export const nodeTypes = {
  rootNode: RootNode,
  outputNode: OutputNode,
  simpleLinearActuator: SimpleLinearActuatorNode,
};
