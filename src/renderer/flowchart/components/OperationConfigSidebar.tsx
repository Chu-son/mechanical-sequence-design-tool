import React from 'react';
import { useDnD } from '../utils/DnDContext';

const OperationConfigSidebar: React.FC = () => {
  const dndContext = useDnD();
  if (!dndContext) {
    console.error('DnDContext is not initialized');
    return null;
  }
  const [, setType] = dndContext || [null, () => {}];

  return (
    <div>
      <h1 className="description">Node</h1>

      <div
        className="dndnode"
        onDragStart={() => setType('taskStart')}
        draggable
      >
        Start
      </div>

      <div className="dndnode" onDragStart={() => setType('taskEnd')} draggable>
        End
      </div>

      <div
        className="dndnode task"
        onDragStart={() => setType('task')}
        draggable
      >
        Simple Task
      </div>

      <div
        className="dndnode actuator-task"
        onDragStart={() => setType('actuatorTask')}
        draggable
      >
        Simple Actuator Task
      </div>
    </div>
  );
};

export default OperationConfigSidebar;
