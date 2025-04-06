export interface FlowData {
  nodes: Node[];
  edges: { source: string; target: string }[];
  viewport: { x: number; y: number; zoom: number };
}

export interface Config {
  id: number;
  label: string;
  flow_data: FlowData;
}

export interface Unit {
  id: number;
  name: string;
  parentId: number | null;
  driveConfigs: Config[];
  operationConfigs: Config[];
}

export interface Project {
  id: number;
  name: string;
  updatedAt: string;
  units: Unit[];
}

export type ConfigType = 'driveConfigs' | 'operationConfigs';

export interface ConfigIdentifier {
  projectId: number;
  unitId: number;
  configType: ConfigType;
  configId: number;
}
