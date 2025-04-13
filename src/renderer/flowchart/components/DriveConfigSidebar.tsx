import React from 'react';
import { useDnD } from '@/renderer/flowchart/utils/DnDContext';

const DriveConfigSidebar: React.FC = () => {
  const dndContext = useDnD();
  if (!dndContext) {
    console.error('DnDContext is not initialized');
    return null;
  }
  const [, setType] = dndContext || [null, () => {}];

  return (
    <div>
      <h1 className="description">Drive Nodes</h1>

      <div
        className="dndnode"
        onDragStart={() => setType && setType('driveStart')}
        draggable
      >
        Start
      </div>

      <div
        className="dndnode"
        onDragStart={() => setType && setType('driveEnd')}
        draggable
      >
        End
      </div>

      <div
        className="dndnode"
        onDragStart={() => setType && setType('simpleLinearActuator')}
        draggable
      >
        Simple Linear Actuator
      </div>
    </div>
  );
};

export default DriveConfigSidebar;
