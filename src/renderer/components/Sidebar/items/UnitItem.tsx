import { CSSProperties, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Unit } from '@/renderer/types/databaseTypes';
import { SidebarItemType } from '../types';
import CategoryItem from './CategoryItem';
import ConfigItem from './ConfigItem';
import ExpandIcon from '../ExpandIcon';

interface UnitItemProps {
  unit: Unit;
  depth: number;
  units: Unit[];
  projectId: number;
  expandedItems: Record<string, boolean>;
  toggleExpand: (key: string) => void;
}

const getDepthStyles = (depth: number): CSSProperties => {
  const baseIndent = 15;
  return {
    marginLeft: depth === 0 ? 0 : `${depth * baseIndent}px`,
    position: 'relative',
  };
};

const UnitItem = ({
  unit,
  depth,
  units,
  projectId,
  expandedItems,
  toggleExpand,
}: UnitItemProps) => {
  const unitKey = `unit-${unit.id}`;
  const driveKey = `drive-${unit.id}`;
  const operationKey = `operation-${unit.id}`;
  const subunitsKey = `subunits-${unit.id}`;

  const childUnits = units.filter((u) => u.parentId === unit.id);

  const driveConfigs = unit.driveConfigs;
  const operationConfigs = unit.operationConfigs;

  const hasDriveConfigs = driveConfigs.length > 0;
  const hasOperationConfigs = operationConfigs.length > 0;
  const hasChildUnits = childUnits.length > 0;

  // デバッグログ
  useEffect(() => {
    console.log(`UnitItem: ユニット "${unit.name}" (ID: ${unit.id})`);
    console.log(
      '- driveConfigs:',
      driveConfigs,
      hasDriveConfigs ? '（あり）' : '（なし）',
    );
    console.log(
      '- operationConfigs:',
      operationConfigs,
      hasOperationConfigs ? '（あり）' : '（なし）',
    );
    console.log(
      '- childUnits:',
      childUnits,
      hasChildUnits ? '（あり）' : '（なし）',
    );
    console.log('- unit object:', unit);
  }, [unit.id]);

  const isUnitExpanded = expandedItems[unitKey] !== false;
  const isDriveExpanded = expandedItems[driveKey] !== false;
  const isOperationExpanded = expandedItems[operationKey] !== false;
  const isSubunitsExpanded = expandedItems[subunitsKey] !== false;

  const depthStyles = getDepthStyles(depth);

  return (
    <li className="tree-item" style={depthStyles}>
      {depth > 0 && <div className="indent-line" />}
      <div className="tree-item-header">
        <button
          type="button"
          className="toggle-button"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(unitKey);
          }}
        >
          <ExpandIcon isExpanded={isUnitExpanded} />
        </button>
        <Link
          to={`/projects/${projectId}/unit/${unit.id}`}
          className={`unit-link ${depth > 0 ? 'subunit-link' : 'parent-unit-link'}`}
        >
          {unit.name}
        </Link>
      </div>
      {isUnitExpanded && (
        <ul className="unit-contents">
          <CategoryItem
            type="drive"
            label="駆動軸構成"
            expandKey={driveKey}
            isExpanded={isDriveExpanded}
            hasItems={hasDriveConfigs}
            onToggle={toggleExpand}
          >
            {driveConfigs.map((config) => (
              <ConfigItem
                key={`drive-${config.id}`}
                type="drive"
                config={config}
                projectId={projectId}
                unitId={unit.id}
                configType="driveConfigs"
              />
            ))}
          </CategoryItem>
          <CategoryItem
            type="operation"
            label="動作シーケンス"
            expandKey={operationKey}
            isExpanded={isOperationExpanded}
            hasItems={hasOperationConfigs}
            onToggle={toggleExpand}
          >
            {operationConfigs.map((config) => (
              <ConfigItem
                key={`operation-${config.id}`}
                type="operation"
                config={config}
                projectId={projectId}
                unitId={unit.id}
                configType="operationConfigs"
              />
            ))}
          </CategoryItem>
          <CategoryItem
            type="subunit"
            label="サブユニット"
            expandKey={subunitsKey}
            isExpanded={isSubunitsExpanded}
            hasItems={hasChildUnits}
            onToggle={toggleExpand}
          >
            {childUnits.map((childUnit) => (
              <UnitItem
                key={childUnit.id}
                unit={childUnit}
                depth={depth + 1}
                units={units}
                projectId={projectId}
                expandedItems={expandedItems}
                toggleExpand={toggleExpand}
              />
            ))}
          </CategoryItem>
        </ul>
      )}
    </li>
  );
};

export default UnitItem;
