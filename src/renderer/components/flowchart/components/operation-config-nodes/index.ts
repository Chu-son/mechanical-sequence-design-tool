import SimpleTaskNode from '@/renderer/components/flowchart/components/operation-config-nodes/nodes/SimpleTaskNode';
import TaskStartNode from '@/renderer/components/flowchart/components/operation-config-nodes/nodes/TaskStartNode';
import TaskEndNode from '@/renderer/components/flowchart/components/operation-config-nodes/nodes/TaskEndNode';
import SimpleActuatorTaskNode from '@/renderer/components/flowchart/components/operation-config-nodes/nodes/SimpleActuatorTaskNode';
import VelocityChartNode from '@/renderer/components/flowchart/components/detail-nodes/VelocityChartNode';

export {
  SimpleTaskNode,
  TaskStartNode,
  TaskEndNode,
  SimpleActuatorTaskNode,
  VelocityChartNode,
};
export * from '@/renderer/components/flowchart/components/operation-config-nodes/common';

export const nodeTypes = {
  taskStart: TaskStartNode,
  task: SimpleTaskNode,
  taskEnd: TaskEndNode,
  actuatorTask: SimpleActuatorTaskNode,
  velocityChart: VelocityChartNode,
};
