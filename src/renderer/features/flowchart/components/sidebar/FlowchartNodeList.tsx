import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';
import { DriveConfig, ConfigIdentifier, Manufacturer } from '@/renderer/types/databaseTypes';
import { DrivePart } from '@/renderer/types/driveTypes';
import { NodeBlock } from '@/renderer/features/flowchart/types/nodeBlocks';

import NodeBlockDisplay from '@/renderer/features/flowchart/components/sidebar/NodeBlockDisplay';
import { driveConfigBlocks } from '@/renderer/features/flowchart/components/drive-config-nodes/DriveConfigBlocks';
import { getOperationConfigBlocks } from '@/renderer/features/flowchart/components/operation-config-nodes/OperationConfigBlocks';

const ProjectsDB = DatabaseFactory.createDatabase();

interface FlowchartNodeListProps {
  configIdentifier?: ConfigIdentifier;
}

function FlowchartNodeList({
  configIdentifier: propConfigIdentifier,
}: FlowchartNodeListProps) {
  const [unitDriveConfigs, setUnitDriveConfigs] = useState<DriveConfig[]>([]);
  const [configIdentifier, setConfigIdentifier] =
    useState<ConfigIdentifier | null>(propConfigIdentifier || null);
  const location = useLocation();
  const [parts, setParts] = useState<DrivePart[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);

  // URLパスからconfigIdentifierを取得
  useEffect(() => {
    // propsからconfigIdentifierが提供されている場合はそれを使用
    if (propConfigIdentifier) {
      setConfigIdentifier(propConfigIdentifier);
      return;
    }

    // パスからパラメータを抽出 /projects/:projectId/unit/:unitId/flowchart/:configType/:configId
    const pathRegex =
      /\/projects\/(\d+)\/unit\/(\d+)\/flowchart\/(driveConfigs|operationConfigs)\/(\d+)/;
    const match = location.pathname.match(pathRegex);

    if (match) {
      const [, projectId, unitId, configType, configId] = match;
      setConfigIdentifier({
        projectId: parseInt(projectId, 10),
        unitId: parseInt(unitId, 10),
        configType: configType as 'driveConfigs' | 'operationConfigs',
        configId: parseInt(configId, 10),
      });
    } else {
      // パスからの取得に失敗した場合はデフォルト値を設定
      setConfigIdentifier(null);
    }
  }, [location.pathname, propConfigIdentifier]);

  // 現在のユニットからDriveConfigを読み込む
  useEffect(() => {
    const loadDriveConfigs = async () => {
      try {
        // configIdentifierがnullの場合、または取得できない場合は読み込みをスキップ
        if (!configIdentifier) return;

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

  useEffect(() => {
    const loadParts = async () => {
      const db = DatabaseFactory.createDatabase();
      setParts(await db.getParts());
      setManufacturers(await db.getManufacturers());
    };
    loadParts();
  }, []);

  // メーカー名を取得
  const getManufacturerName = (manufacturerId: number) => {
    const found = manufacturers.find((manu) => manu.id === manufacturerId);
    return found ? found.nameJa : '';
  };

  // 既存ブロックをコピーして部品ノードを追加
  const blocksWithParts: NodeBlock[] = driveConfigBlocks.blocks.map(
    (block: NodeBlock) => {
      const partNodes = parts
        .filter((p) => block.partTypes && block.partTypes.includes(p.type))
        .map((part) => {
          const label = `${part.model} (${getManufacturerName(part.manufacturerId)})`;
          return {
            baseNodeType: part.type,
            label,
            partId: part.id,
            isPart: true,
            displayName: label,
          };
        });
      return {
        ...block,
        nodes: [...block.nodes, ...partNodes],
      };
    },
  );

  // configIdentifierが無効な場合はプレースホルダーを表示
  if (!configIdentifier) {
    return (
      <div className="flowchart-node-list">
        フローチャートノードを読み込んでいます...
      </div>
    );
  }

  return (
    <div className="flowchart-node-list">
      {configIdentifier.configType === 'driveConfigs' && (
        <NodeBlockDisplay blocks={blocksWithParts} />
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
