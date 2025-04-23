import SimpleTaskNode from '@/renderer/flowchart/components/operation-config-nodes/SimpleTaskNode';
import TaskStartNode from '@/renderer/flowchart/components/operation-config-nodes/TaskStartNode';
import TaskEndNode from '@/renderer/flowchart/components/operation-config-nodes/TaskEndNode';
import SimpleActuatorTaskNode from '@/renderer/flowchart/components/operation-config-nodes/SimpleActuatorTaskNode';
import VelocityFigureNode from '@/renderer/flowchart/components/operation-config-nodes/VelocityFigureNode';

export {
  SimpleTaskNode,
  TaskStartNode,
  TaskEndNode,
  SimpleActuatorTaskNode,
  VelocityFigureNode,
};
export * from '@/renderer/flowchart/components/operation-config-nodes/common';

export const nodeTypes = {
  taskStart: TaskStartNode,
  task: SimpleTaskNode,
  taskEnd: TaskEndNode,
  actuatorTask: SimpleActuatorTaskNode,
  velocityFigure: VelocityFigureNode,
};
