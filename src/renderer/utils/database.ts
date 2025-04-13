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

  public async createProject(project: Project): Promise<void> {
    const projects = await this.getAllProjects();
    projects.push(project);
    await ipcRenderer.invoke('save', this.fileName, projects);
  }

  public async updateProject(
    identifier: ProjectIdentifier,
    updatedProject: Project,
  ): Promise<void> {
    const projects = await this.getAllProjects();
    const index = projects.findIndex(
      (project) => project.id === identifier.projectId,
    );
    if (index !== -1) {
      projects[index] = updatedProject;
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
    identifier: ProjectIdentifier,
    unit: Unit,
  ): Promise<void> {
    const project = await this.getProjectById(identifier);
    if (project) {
      project.units.push(unit);
      await this.updateProject(identifier, project);
    }
  }

  public async updateUnit(
    identifier: UnitIdentifier,
    updatedUnit: Unit,
  ): Promise<void> {
    const project = await this.getProjectById({
      projectId: identifier.projectId,
    });
    if (project) {
      const index = project.units.findIndex(
        (unit) => unit.id === identifier.unitId,
      );
      if (index !== -1) {
        project.units[index] = updatedUnit;
        await this.updateProject({ projectId: identifier.projectId }, project);
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
      await this.updateProject({ projectId: identifier.projectId }, project);
    }
  }

  public async createDriveConfig(
    identifier: UnitIdentifier,
    config: DriveConfig,
  ): Promise<void> {
    const unit = await this.getUnitById(identifier);
    if (unit) {
      unit.driveConfigs.push(config);
      await this.updateUnit(identifier, unit);
    }
  }

  public async createOperationConfig(
    identifier: UnitIdentifier,
    config: OperationConfig,
  ): Promise<void> {
    const unit = await this.getUnitById(identifier);
    if (unit) {
      unit.operationConfigs.push(config);
      await this.updateUnit(identifier, unit);
    }
  }

  public async updateDriveConfig(
    identifier: ConfigIdentifier,
    updatedConfig: DriveConfig,
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
        unit.driveConfigs[index] = updatedConfig;
        await this.updateUnit(
          { projectId: identifier.projectId, unitId: identifier.unitId },
          unit,
        );
      }
    }
  }

  public async updateOperationConfig(
    identifier: ConfigIdentifier,
    updatedConfig: OperationConfig,
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
        unit.operationConfigs[index] = updatedConfig;
        await this.updateUnit(
          { projectId: identifier.projectId, unitId: identifier.unitId },
          unit,
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
      await this.updateUnit(
        { projectId: identifier.projectId, unitId: identifier.unitId },
        unit,
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
      await this.updateUnit(
        { projectId: identifier.projectId, unitId: identifier.unitId },
        unit,
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
        await this.updateUnit(
          { projectId: identifier.projectId, unitId: identifier.unitId },
          unit,
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
