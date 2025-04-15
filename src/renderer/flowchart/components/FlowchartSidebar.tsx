import React, { useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import {
  Config,
  FlowData,
  ConfigIdentifier,
  DriveConfig,
} from '@/renderer/types/databaseTypes';

import NodeBlockDisplay from './NodeBlockDisplay';
import { driveConfigBlocks } from './drive-config-nodes/DriveConfigBlocks';
import { getOperationConfigBlocks } from './operation-config-nodes/OperationConfigBlocks';

const ProjectsDB = DatabaseFactory.createDatabase();

interface FlowchartSidebarProps {
  configIdentifier: ConfigIdentifier;
}

function FlowchartSidebar({ configIdentifier }: FlowchartSidebarProps) {
  const { toObject } = useReactFlow();
  const [unitDriveConfigs, setUnitDriveConfigs] = useState<DriveConfig[]>([]);

  // 現在のユニットからDriveConfigを読み込む
  useEffect(() => {
    const loadDriveConfigs = async () => {
      try {
        // OperationConfig表示時のみDriveConfigを読み込む
        if (configIdentifier.configType !== 'operationConfigs') return;

        const projects = await ProjectsDB.getAllProjects();
        const project = projects.find(
          (p) => p.id === configIdentifier.projectId,
        );
        if (!project) return;

        const unit = project.units.find(
          (u) => u.id === configIdentifier.unitId,
        );
        if (!unit) return;

        // 現在のユニットの駆動軸構成をセット
        setUnitDriveConfigs(unit.driveConfigs || []);
      } catch (error) {
        console.error('Failed to load drive configurations:', error);
      }
    };

    loadDriveConfigs();
  }, [configIdentifier]);

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

      {configIdentifier.configType === 'driveConfigs' && (
        <NodeBlockDisplay blocks={driveConfigBlocks.blocks} />
      )}

      {configIdentifier.configType === 'operationConfigs' && (
        <NodeBlockDisplay
          blocks={getOperationConfigBlocks(unitDriveConfigs).blocks}
        />
      )}
    </aside>
  );
}

export default FlowchartSidebar;
