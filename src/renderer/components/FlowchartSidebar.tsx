import React from 'react';
import { useDnD } from '../utils/DnDContext';
import { useReactFlow } from '@xyflow/react';
import { ProjectsDB } from '../utils/database';
export default ({
  projectId,
  unitId,
  configType,
  configId,
}: {
  projectId: number;
  unitId: number;
  configType: string;
  configId: number;
}) => {
  const [_, setType] = useDnD();

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const { toObject } = useReactFlow();

  const saveFlowData = async () => {
    const flow = toObject();

    try {
      const projects = await ProjectsDB.getAll();
      console.log(
        'Debug: projectId:',
        projectId,
        'unitId:',
        unitId,
        'configType:',
        configType,
        'configId:',
        configId,
      );
      console.log('Debug: projects:', projects);

      const project = projects.find((p) => p.id === projectId);
      if (!project) throw new Error('Project not found');

      const unit = project.units.find((u) => u.id === unitId);
      if (!unit) throw new Error('Unit not found');

      console.log('Debug: unit[configType]:', unit[configType]);
      if (!unit[configType] || unit[configType].length === 0) {
        throw new Error(`No configurations found for type: ${configType}`);
      }
      const config = unit[configType].find((c) => c.id === configId);
      if (!config) throw new Error('Configuration not found');

      config.flow_data = flow;
      await ProjectsDB.update(projectId, project);
      console.log('Flow data saved successfully');
    } catch (error) {
      console.error('Error saving flow data:', error);
    }
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
      <button onClick={saveFlowData} style={{ marginBottom: '10px' }}>
        Save
      </button>
    </aside>
  );
};
