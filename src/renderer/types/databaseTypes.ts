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

// DriveConfig と OperationConfig の型定義
export interface DriveConfig extends Config {}
export interface OperationConfig extends Config {}

export interface Unit {
  id: number;
  name: string;
  parentId: number | null;
  driveConfigs: DriveConfig[];
  operationConfigs: OperationConfig[];
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

export interface ProjectIdentifier {
  projectId: number;
}

export interface UnitIdentifier extends ProjectIdentifier {
  unitId: number;
}

export interface ConfigIdentifier extends UnitIdentifier {
  configId: number;
  configType: 'driveConfigs' | 'operationConfigs';
}

export interface DatabaseInterface {
  // プロジェクト操作
  getAllProjects(): Promise<Project[]>;
  getProjectById(identifier: ProjectIdentifier): Promise<Project | null>;
  createProject(project: Project): Promise<void>;
  updateProject(
    identifier: ProjectIdentifier,
    updatedProject: Project,
  ): Promise<void>;
  deleteProject(identifier: ProjectIdentifier): Promise<void>;

  // ユニット操作
  getUnitsByProjectId(identifier: ProjectIdentifier): Promise<Unit[]>;
  getUnitById(identifier: UnitIdentifier): Promise<Unit | null>;
  createUnit(identifier: ProjectIdentifier, unit: Unit): Promise<void>;
  updateUnit(identifier: UnitIdentifier, updatedUnit: Unit): Promise<void>;
  deleteUnit(identifier: UnitIdentifier): Promise<void>;

  // 駆動構成・動作構成操作
  getDriveConfigsByUnitId(identifier: UnitIdentifier): Promise<DriveConfig[]>;
  getOperationConfigsByUnitId(
    identifier: UnitIdentifier,
  ): Promise<OperationConfig[]>;
  getDriveConfigById(identifier: ConfigIdentifier): Promise<DriveConfig | null>;
  getOperationConfigById(
    identifier: ConfigIdentifier,
  ): Promise<OperationConfig | null>;
  createDriveConfig(
    identifier: UnitIdentifier,
    config: DriveConfig,
  ): Promise<void>;
  createOperationConfig(
    identifier: UnitIdentifier,
    config: OperationConfig,
  ): Promise<void>;
  updateDriveConfig(
    identifier: ConfigIdentifier,
    updatedConfig: DriveConfig,
  ): Promise<void>;
  updateOperationConfig(
    identifier: ConfigIdentifier,
    updatedConfig: OperationConfig,
  ): Promise<void>;
  deleteDriveConfig(identifier: ConfigIdentifier): Promise<void>;
  deleteOperationConfig(identifier: ConfigIdentifier): Promise<void>;

  // フローデータ操作
  getFlowData(identifier: ConfigIdentifier): Promise<FlowData | null>;
  saveFlowData(identifier: ConfigIdentifier, flowData: FlowData): Promise<void>;
}
