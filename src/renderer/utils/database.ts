// database.ts は内部実装のためのものであり、直接使用すべきではありません。
// 代わりに DatabaseFactory.createDatabase() を使用してください。
import {
  FlowData,
  Config,
  Unit,
  Project,
  ConfigType,
  ConfigIdentifier,
  DatabaseInterface,
  ProjectIdentifier,
  UnitIdentifier,
  DriveConfig,
  OperationConfig,
  BaseEntity,
} from '@/renderer/types/databaseTypes';

// window.electronが存在する場合はipcRendererを使用し、テスト環境では代替を提供
const ipcRenderer =
  typeof window !== 'undefined' && window.electron
    ? window.electron.ipcRenderer
    : {
        // モック実装
        invoke: async (channel: string, ...args: any[]) => {
          console.log(`ipcRenderer.invoke mock called with: ${channel}`, args);
          if (channel === 'getAll') {
            return []; // 空の配列を返す
          }
          return null;
        },
      };

/**
 * 日時を ISO 文字列形式で取得
 */
function getCurrentDateTime(): string {
  return new Date().toISOString();
}

/**
 * 新しいエンティティの作成時に共通フィールドを設定
 */
function initializeBaseEntity(): Omit<BaseEntity, 'id'> {
  const now = getCurrentDateTime();
  return {
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * エンティティ更新時に更新日時を更新
 */
function updateEntity<T extends BaseEntity>(entity: T): T {
  return {
    ...entity,
    updatedAt: getCurrentDateTime(),
  };
}

/**
 * @internal
 * 内部使用のみを目的としたデータベース実装です。
 * このクラスは直接使用せず、DatabaseFactoryを通じてアクセスしてください。
 */
class JsonDatabase implements DatabaseInterface {
  private fileName: string;

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  public async getFlowData(
    configIdentifier: ConfigIdentifier,
  ): Promise<FlowData | null> {
    console.log(
      `Loading flow data for projectId: ${configIdentifier.projectId}, unitId: ${configIdentifier.unitId},
       configType: ${configIdentifier.configType}, configId: ${configIdentifier.configId}`,
    );
    const projects = await this.getAllProjects();
    const project = projects.find(
      (p: any) => p.id === configIdentifier.projectId,
    );
    if (!project) {
      console.error('Project not found');
      return null;
    }

    const unit = project.units.find((unit) =>
      unit[configIdentifier.configType].some(
        (config: any) => config.id === configIdentifier.configId,
      ),
    );
    if (!unit) {
      console.error('Unit not found');
      return null;
    }

    const config = unit[configIdentifier.configType].find(
      (c: any) => c.id === configIdentifier.configId,
    );
    return config?.flow_data || null;
  }

  public async getAllProjects(): Promise<Project[]> {
    const result = await ipcRenderer.invoke('getAll', this.fileName);
    return result;
  }

  public async getProjectById(
    identifier: ProjectIdentifier,
  ): Promise<Project | null> {
    const projects = await this.getAllProjects();
    return (
      projects.find((project) => project.id === identifier.projectId) || null
    );
  }

  public async getUnitById(identifier: UnitIdentifier): Promise<Unit | null> {
    const project = await this.getProjectById({
      projectId: identifier.projectId,
    });
    if (!project) return null;
    return project.units.find((unit) => unit.id === identifier.unitId) || null;
  }

  public async getDriveConfigById(
    identifier: ConfigIdentifier,
  ): Promise<DriveConfig | null> {
    const unit = await this.getUnitById({
      projectId: identifier.projectId,
      unitId: identifier.unitId,
    });
    if (!unit) return null;
    return (
      unit.driveConfigs.find((config) => config.id === identifier.configId) ||
      null
    );
  }

  public async getOperationConfigById(
    identifier: ConfigIdentifier,
  ): Promise<OperationConfig | null> {
    const unit = await this.getUnitById({
      projectId: identifier.projectId,
      unitId: identifier.unitId,
    });
    if (!unit) return null;
    return (
      unit.operationConfigs.find(
        (config) => config.id === identifier.configId,
      ) || null
    );
  }

  public async createProject(project: Partial<Project>): Promise<void> {
    const projects = await this.getAllProjects();
    const newProjectId =
      projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1;

    const newProject: Project = {
      id: newProjectId,
      name: project.name || 'New Project',
      description: project.description || '',
      units: [],
      ...initializeBaseEntity(),
    };

    projects.push(newProject);
    await ipcRenderer.invoke('save', this.fileName, projects);
  }

  public async updateProject(
    identifier: ProjectIdentifier,
    updatedProject: Partial<Project>,
  ): Promise<void> {
    const projects = await this.getAllProjects();
    const index = projects.findIndex(
      (project) => project.id === identifier.projectId,
    );
    if (index !== -1) {
      // 既存のプロジェクトを取得し、更新するフィールドだけを更新
      const existingProject = projects[index];
      projects[index] = updateEntity({
        ...existingProject,
        ...updatedProject,
        id: existingProject.id, // IDは変更不可
        createdAt: existingProject.createdAt, // 作成日は変更不可
      });

      await ipcRenderer.invoke('save', this.fileName, projects);
    }
  }

  public async deleteProject(identifier: ProjectIdentifier): Promise<void> {
    const projects = await this.getAllProjects();
    const updatedProjects = projects.filter(
      (project) => project.id !== identifier.projectId,
    );
    await ipcRenderer.invoke('save', this.fileName, updatedProjects);
  }

  public async createUnit(
    identifier: UnitIdentifier & {
      name: string;
      description?: string;
      parentId?: number | null;
    },
  ): Promise<void> {
    const project = await this.getProjectById({
      projectId: identifier.projectId,
    });
    if (project) {
      const units = project.units || [];
      const newUnitId =
        units.length > 0 ? Math.max(...units.map((u) => u.id)) + 1 : 1;

      const newUnit: Unit = {
        id: newUnitId,
        name: identifier.name,
        description: identifier.description || '',
        parentId:
          identifier.parentId === undefined ? null : identifier.parentId,
        driveConfigs: [],
        operationConfigs: [],
        ...initializeBaseEntity(),
      };

      project.units.push(newUnit);
      // プロジェクトの更新日時も更新
      await this.updateProject({ projectId: identifier.projectId }, {});
    }
  }

  public async updateUnit(
    identifier: UnitIdentifier,
    updatedUnit: Partial<Unit>,
  ): Promise<void> {
    const project = await this.getProjectById({
      projectId: identifier.projectId,
    });
    if (project) {
      const index = project.units.findIndex(
        (unit) => unit.id === identifier.unitId,
      );
      if (index !== -1) {
        // 既存のユニットを取得し、更新するフィールドだけを更新
        const existingUnit = project.units[index];
        project.units[index] = updateEntity({
          ...existingUnit,
          ...updatedUnit,
          id: existingUnit.id, // IDは変更不可
          createdAt: existingUnit.createdAt, // 作成日は変更不可
        });

        // プロジェクトの更新日時も更新
        await this.updateProject({ projectId: identifier.projectId }, {});
      }
    }
  }

  public async deleteUnit(identifier: UnitIdentifier): Promise<void> {
    const project = await this.getProjectById({
      projectId: identifier.projectId,
    });
    if (project) {
      project.units = project.units.filter(
        (unit) => unit.id !== identifier.unitId,
      );
      // プロジェクトの更新日時も更新
      await this.updateProject({ projectId: identifier.projectId }, {});
    }
  }

  public async createDriveConfig(
    identifier: UnitIdentifier & {
      label: string;
      description?: string;
    },
  ): Promise<void> {
    const unit = await this.getUnitById(identifier);
    if (unit) {
      const configs = unit.driveConfigs || [];
      const newConfigId =
        configs.length > 0 ? Math.max(...configs.map((c) => c.id)) + 1 : 1;

      const newConfig: DriveConfig = {
        id: newConfigId,
        label: identifier.label,
        description: identifier.description || '',
        flow_data: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
        ...initializeBaseEntity(),
      };

      unit.driveConfigs.push(newConfig);
      // ユニットとプロジェクトの更新日時も更新
      await this.updateUnit(
        { projectId: identifier.projectId, unitId: identifier.unitId },
        {},
      );
    }
  }

  public async createOperationConfig(
    identifier: UnitIdentifier & {
      label: string;
      description?: string;
    },
  ): Promise<void> {
    const unit = await this.getUnitById(identifier);
    if (unit) {
      const configs = unit.operationConfigs || [];
      const newConfigId =
        configs.length > 0 ? Math.max(...configs.map((c) => c.id)) + 1 : 1;

      const newConfig: OperationConfig = {
        id: newConfigId,
        label: identifier.label,
        description: identifier.description || '',
        flow_data: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
        ...initializeBaseEntity(),
      };

      unit.operationConfigs.push(newConfig);
      // ユニットとプロジェクトの更新日時も更新
      await this.updateUnit(
        { projectId: identifier.projectId, unitId: identifier.unitId },
        {},
      );
    }
  }

  public async updateDriveConfig(
    identifier: ConfigIdentifier,
    updatedConfig: Partial<DriveConfig>,
  ): Promise<void> {
    const unit = await this.getUnitById({
      projectId: identifier.projectId,
      unitId: identifier.unitId,
    });
    if (unit) {
      const index = unit.driveConfigs.findIndex(
        (config) => config.id === identifier.configId,
      );
      if (index !== -1) {
        // 既存の設定を取得し、更新するフィールドだけを更新
        const existingConfig = unit.driveConfigs[index];
        unit.driveConfigs[index] = updateEntity({
          ...existingConfig,
          ...updatedConfig,
          id: existingConfig.id, // IDは変更不可
          createdAt: existingConfig.createdAt, // 作成日は変更不可
        });

        // ユニットとプロジェクトの更新日時も更新
        await this.updateUnit(
          { projectId: identifier.projectId, unitId: identifier.unitId },
          {},
        );
      }
    }
  }

  public async updateOperationConfig(
    identifier: ConfigIdentifier,
    updatedConfig: Partial<OperationConfig>,
  ): Promise<void> {
    const unit = await this.getUnitById({
      projectId: identifier.projectId,
      unitId: identifier.unitId,
    });
    if (unit) {
      const index = unit.operationConfigs.findIndex(
        (config) => config.id === identifier.configId,
      );
      if (index !== -1) {
        // 既存の設定を取得し、更新するフィールドだけを更新
        const existingConfig = unit.operationConfigs[index];
        unit.operationConfigs[index] = updateEntity({
          ...existingConfig,
          ...updatedConfig,
          id: existingConfig.id, // IDは変更不可
          createdAt: existingConfig.createdAt, // 作成日は変更不可
        });

        // ユニットとプロジェクトの更新日時も更新
        await this.updateUnit(
          { projectId: identifier.projectId, unitId: identifier.unitId },
          {},
        );
      }
    }
  }

  public async deleteDriveConfig(identifier: ConfigIdentifier): Promise<void> {
    const unit = await this.getUnitById({
      projectId: identifier.projectId,
      unitId: identifier.unitId,
    });
    if (unit) {
      unit.driveConfigs = unit.driveConfigs.filter(
        (config) => config.id !== identifier.configId,
      );
      // ユニットとプロジェクトの更新日時も更新
      await this.updateUnit(
        { projectId: identifier.projectId, unitId: identifier.unitId },
        {},
      );
    }
  }

  public async deleteOperationConfig(
    identifier: ConfigIdentifier,
  ): Promise<void> {
    const unit = await this.getUnitById({
      projectId: identifier.projectId,
      unitId: identifier.unitId,
    });
    if (unit) {
      unit.operationConfigs = unit.operationConfigs.filter(
        (config) => config.id !== identifier.configId,
      );
      // ユニットとプロジェクトの更新日時も更新
      await this.updateUnit(
        { projectId: identifier.projectId, unitId: identifier.unitId },
        {},
      );
    }
  }

  public async saveFlowData(
    identifier: ConfigIdentifier,
    flowData: FlowData,
  ): Promise<void> {
    const unit = await this.getUnitById({
      projectId: identifier.projectId,
      unitId: identifier.unitId,
    });
    if (unit) {
      const configList = unit[identifier.configType];
      const config = configList.find(
        (c: Config) => c.id === identifier.configId,
      );
      if (config) {
        config.flow_data = flowData;
        // 更新日時を更新
        config.updatedAt = getCurrentDateTime();
        // ユニットとプロジェクトの更新日時も更新
        await this.updateUnit(
          { projectId: identifier.projectId, unitId: identifier.unitId },
          {},
        );
      }
    }
  }

  public async getUnitsByProjectId(
    identifier: ProjectIdentifier,
  ): Promise<Unit[]> {
    const project = await this.getProjectById(identifier);
    if (!project) return [];
    return project.units;
  }

  public async getDriveConfigsByUnitId(
    identifier: UnitIdentifier,
  ): Promise<DriveConfig[]> {
    const unit = await this.getUnitById(identifier);
    if (!unit) return [];
    return unit.driveConfigs;
  }

  public async getOperationConfigsByUnitId(
    identifier: UnitIdentifier,
  ): Promise<OperationConfig[]> {
    const unit = await this.getUnitById(identifier);
    if (!unit) return [];
    return unit.operationConfigs;
  }
}

// 内部使用のみを目的としています
// @internal
export { JsonDatabase };
