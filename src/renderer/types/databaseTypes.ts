export interface FlowData {
  nodes: Node[];
  edges: { source: string; target: string }[];
  viewport: { x: number; y: number; zoom: number };
}

// 基本的なエンティティの型定義（共通フィールド）
export interface BaseEntity {
  id: number;
  createdAt: string; // 作成日
  updatedAt: string; // 最終更新日
}

export interface Config extends BaseEntity {
  label: string;
  description?: string; // 説明を追加
  flow_data: FlowData;
}

// DriveConfig と OperationConfig の型定義
export interface DriveConfig extends Config {}
export interface OperationConfig extends Config {}

export interface Unit extends BaseEntity {
  name: string;
  description?: string; // 説明を追加
  parentId: number | null;
  driveConfigs: DriveConfig[];
  operationConfigs: OperationConfig[];
}

export interface Project extends BaseEntity {
  name: string;
  description?: string; // 説明を追加
  units: Unit[];
}

export type ConfigType = 'driveConfigs' | 'operationConfigs';

// 以下はそのまま
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
  createProject(project: Partial<Project>): Promise<void>;
  updateProject(
    identifier: ProjectIdentifier,
    updatedProject: Partial<Project>,
  ): Promise<void>;
  deleteProject(identifier: ProjectIdentifier): Promise<void>;

  // ユニット操作
  getUnitsByProjectId(identifier: ProjectIdentifier): Promise<Unit[]>;
  getUnitById(identifier: UnitIdentifier): Promise<Unit | null>;
  createUnit(
    identifier: UnitIdentifier & {
      name: string;
      description?: string;
      parentId?: number | null;
    },
  ): Promise<void>;
  updateUnit(
    identifier: UnitIdentifier,
    updatedUnit: Partial<Unit>,
  ): Promise<void>;
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
    identifier: UnitIdentifier & {
      label: string;
      description?: string;
    },
  ): Promise<void>;
  createOperationConfig(
    identifier: UnitIdentifier & {
      label: string;
      description?: string;
    },
  ): Promise<void>;
  updateDriveConfig(
    identifier: ConfigIdentifier,
    updatedConfig: Partial<DriveConfig>,
  ): Promise<void>;
  updateOperationConfig(
    identifier: ConfigIdentifier,
    updatedConfig: Partial<OperationConfig>,
  ): Promise<void>;
  deleteDriveConfig(identifier: ConfigIdentifier): Promise<void>;
  deleteOperationConfig(identifier: ConfigIdentifier): Promise<void>;

  // フローデータ操作
  getFlowData(identifier: ConfigIdentifier): Promise<FlowData | null>;
  saveFlowData(identifier: ConfigIdentifier, flowData: FlowData): Promise<void>;
}
