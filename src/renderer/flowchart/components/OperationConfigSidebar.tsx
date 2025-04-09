import React from 'react';

const OperationConfigSidebar: React.FC = () => {
  return (
    <div>
      <h1 className="description">Node</h1>

      <div
        className="dndnode"
        onDragStart={(event) => console.log('Drag Start: taskStart')}
        draggable
      >
        Start
      </div>

      <div
        className="dndnode"
        onDragStart={(event) => console.log('Drag Start: taskEnd')}
        draggable
      >
        End
      </div>

      <div
        className="dndnode task"
        onDragStart={(event) => console.log('Drag Start: task')}
        draggable
      >
        Simple Task
      </div>

      <div
        className="dndnode actuator-task"
        onDragStart={(event) => console.log('Drag Start: actuatorTask')}
        draggable
      >
        Simple Actuator Task
      </div>
    </div>
  );
};

export default OperationConfigSidebar;
