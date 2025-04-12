import React from 'react';
import { useReactFlow } from '@xyflow/react';
import DatabaseFactory from '../../utils/DatabaseFactory';
import { Config, FlowData, ConfigIdentifier } from '../../types/databaseTypes';

import DriveConfigSidebar from './DriveConfigSidebar';
import OperationConfigSidebar from './OperationConfigSidebar';

const ProjectsDB = DatabaseFactory.createDatabase();

interface FlowchartSidebarProps {
  configIdentifier: ConfigIdentifier;
}

function FlowchartSidebar({ configIdentifier }: FlowchartSidebarProps) {
  const { toObject } = useReactFlow();

  const saveFlowData = async (identifier: ConfigIdentifier) => {
    const flow = toObject();

    try {
      const projects = await ProjectsDB.getAllProjects();

      console.log('Debug: identifier:', identifier);
      console.log('Debug: projects:', projects);

      const project = projects.find((p) => p.id === identifier.projectId);
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
      await ProjectsDB.updateProject(
        { projectId: configIdentifier.projectId },
        project,
      );
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
      {configIdentifier.configType === 'driveConfigs' && <DriveConfigSidebar />}
      {configIdentifier.configType === 'operationConfigs' && (
        <OperationConfigSidebar />
      )}
    </aside>
  );
}

export default FlowchartSidebar;
