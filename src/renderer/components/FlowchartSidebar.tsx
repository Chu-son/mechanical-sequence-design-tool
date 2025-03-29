import React from 'react';
import { useDnD } from '../utils/DnDContext';

export default () => {
  const [_, setType] = useDnD();

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar">
      <div className="description">Node</div>

      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'taskStart')}
        draggable
      >
        Task Start Node
      </div>

      <div
        className="dndnode task"
        onDragStart={(event) => onDragStart(event, 'task')}
        draggable
      >
        Task Node
      </div>

      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'taskEnd')}
        draggable
      >
        Task End Node
      </div>
    </aside>
  );
};
