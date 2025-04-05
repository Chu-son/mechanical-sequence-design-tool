const { ipcRenderer } = window.electron;

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

class Database {
  private fileName: string;

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  public async getFlowData(
    projectId: number,
    configType: ConfigType,
    configId: number,
  ): Promise<any | null> {
    const projects = await this.getAll();
    const project = projects.find((p: any) => p.id === projectId);
    if (!project) return null;

    const unit = project.units.find((unit) =>
      unit[configType].some((config: any) => config.id === configId),
    );
    if (!unit) return null;

    const config = unit[configType].find((c: any) => c.id === configId);
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
