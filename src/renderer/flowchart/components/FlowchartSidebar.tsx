import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { useDnD } from '../utils/DnDContext';
import Database from '../../utils/database';
import {
  ConfigType,
  Config,
  FlowData,
  ConfigIdentifier,
} from '../../types/databaseTypes';

const ProjectsDB = Database;

interface FlowchartSidebarProps {
  configIdentifier: ConfigIdentifier;
}

const FlowchartSidebar: React.FC<FlowchartSidebarProps> = ({
  configIdentifier,
}) => {
  const dndContext = useDnD();
  const [, setType] = dndContext ? dndContext : [null, () => {}];

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    if (setType) {
      setType(nodeType);
    }
    event.dataTransfer.effectAllowed = 'move';
  };

  const { toObject } = useReactFlow();

  const saveFlowData = async (configIdentifier: ConfigIdentifier) => {
    const flow = toObject();

    try {
      const projects = await ProjectsDB.getAll();

      console.log('Debug: configIdentifier:', configIdentifier);
      console.log('Debug: projects:', projects);

      const project = projects.find((p) => p.id === configIdentifier.projectId);
      if (!project) throw new Error('Project not found');

      const unit = project.units.find((u) => u.id === configIdentifier.unitId);
      if (!unit) throw new Error('Unit not found');

      const configList = unit[configIdentifier.configType];
      console.log('Debug: unit[configType]:', configList);
      if (!configList || configList.length === 0) {
        throw new Error(
          `No configurations found for type: ${configIdentifier.configType}`,
        );
      }
      const config = configList.find(
        (c: Config) => c.id === configIdentifier.configId,
      );
      if (!config) throw new Error('Configuration not found');

      config.flow_data = {
        nodes: flow.nodes as unknown as FlowData['nodes'],
        edges: flow.edges,
        viewport: flow.viewport,
      };
      await ProjectsDB.update(configIdentifier.projectId, project);
      console.log('Flow data saved successfully');
    } catch (error) {
      console.error('Error saving flow data:', error);
    }
  };

  return (
    <aside className="sidebar">
      <button
        type="button"
        onClick={() =>
          saveFlowData({
            ...configIdentifier,
          })
        }
        className="save-button align-right"
      >
        Save
      </button>

      <h1 className="description">Node</h1>

      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'taskStart')}
        draggable
      >
        Start
      </div>

      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'taskEnd')}
        draggable
      >
        End
      </div>

      <div
        className="dndnode task"
        onDragStart={(event) => onDragStart(event, 'task')}
        draggable
      >
        Simple Task
      </div>
    </aside>
  );
};

export default FlowchartSidebar;
