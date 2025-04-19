import { SidebarItemType } from '../types';
import { Link } from 'react-router-dom';

interface ConfigItemProps {
  type: SidebarItemType;
  config: {
    id: number;
    label: string;
  };
  projectId: number;
  unitId: number;
  configType: string;
}

const ConfigItem = ({
  type,
  config,
  projectId,
  unitId,
  configType,
}: ConfigItemProps) => {
  // パスにflowchartセグメントを追加
  const url = `/projects/${projectId}/unit/${unitId}/flowchart/${configType}/${config.id}`;

  return (
    <li className="config-item" data-type={type}>
      <Link to={url}>{config.label}</Link>
    </li>
  );
};

export default ConfigItem;
