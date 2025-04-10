import SimpleTaskNode from './SimpleTaskNode';
import TaskStartNode from './TaskStartNode';
import TaskEndNode from './TaskEndNode';
import SimpleActuatorTaskNode from './SimpleActuatorTaskNode';

export { SimpleTaskNode, TaskStartNode, TaskEndNode, SimpleActuatorTaskNode };
export * from './common';

export const nodeTypes = {
  taskStart: TaskStartNode,
  task: SimpleTaskNode,
  taskEnd: TaskEndNode,
  actuatorTask: SimpleActuatorTaskNode,
};
