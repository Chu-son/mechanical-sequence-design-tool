import {
  FlowData,
  Config,
  Unit,
  Project,
  ConfigType,
  ConfigIdentifier,
} from '../types/databaseTypes';

const { ipcRenderer } = window.electron;

class Database {
  private fileName: string;

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  public async getFlowData(
    configIdentifier: ConfigIdentifier,
  ): Promise<any | null> {
    console.log(
      `Loading flow data for projectId: ${configIdentifier.projectId}, unitId: ${configIdentifier.unitId},
       configType: ${configIdentifier.configType}, configId: ${configIdentifier.configId}`,
    );
    const projects = await this.getAll();
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

  public async getAll(): Promise<Project[]> {
    const result = await ipcRenderer.invoke('getAll', this.fileName);
    return result;
  }

  public async getProjectById(projectId: number): Promise<Project | null> {
    const projects = await this.getAll();
    return projects.find((project) => project.id === projectId) || null;
  }

  public async getUnitById(
    projectId: number,
    unitId: number,
  ): Promise<Unit | null> {
    const project = await this.getProjectById(projectId);
    if (!project) return null;
    return project.units.find((unit) => unit.id === unitId) || null;
  }

  public async getById(id: number): Promise<any | null> {
    const result = await ipcRenderer.invoke('getById', this.fileName, id);
    return result;
  }

  public async create(item: any): Promise<void> {
    await ipcRenderer.invoke('create', this.fileName, item);
  }

  public async update(id: number, updatedItem: any): Promise<void> {
    await ipcRenderer.invoke('update', this.fileName, id, updatedItem);
  }

  public async delete(id: number): Promise<void> {
    await ipcRenderer.invoke('delete', this.fileName, id);
  }
}

export default new Database('projects.json');
