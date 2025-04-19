import React, { useState, useEffect } from 'react';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import { DriveConfig, ConfigIdentifier } from '@/renderer/types/databaseTypes';

import NodeBlockDisplay from './NodeBlockDisplay';
import { driveConfigBlocks } from './drive-config-nodes/DriveConfigBlocks';
import { getOperationConfigBlocks } from './operation-config-nodes/OperationConfigBlocks';

const ProjectsDB = DatabaseFactory.createDatabase();

interface FlowchartNodeListProps {
  configIdentifier: ConfigIdentifier;
}

function FlowchartNodeList({ configIdentifier }: FlowchartNodeListProps) {
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

  return (
    <div className="flowchart-node-list">
      {configIdentifier.configType === 'driveConfigs' && (
        <NodeBlockDisplay blocks={driveConfigBlocks.blocks} />
      )}

      {configIdentifier.configType === 'operationConfigs' && (
        <NodeBlockDisplay
          blocks={getOperationConfigBlocks(unitDriveConfigs).blocks}
        />
      )}
    </div>
  );
}

export default FlowchartNodeList;
