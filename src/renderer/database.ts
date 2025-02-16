const { ipcRenderer } = window.electron;

class Database {
  private fileName: string;

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  public async getAll(): Promise<any[]> {
    try {
      const result = await ipcRenderer.invoke('getAll', this.fileName);
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async getById(id: number): Promise<any | null> {
    try {
      const result = await ipcRenderer.invoke('getById', this.fileName, id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async create(item: any): Promise<void> {
    try {
      await ipcRenderer.invoke('create', this.fileName, item);
    } catch (error) {
      throw error;
    }
  }

  public async update(id: number, updatedItem: any): Promise<void> {
    try {
      await ipcRenderer.invoke('update', this.fileName, id, updatedItem);
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: number): Promise<void> {
    try {
      await ipcRenderer.invoke('delete', this.fileName, id);
    } catch (error) {
      throw error;
    }
  }
}

export const ProjectsDB = new Database('projects.json');
export const UnitsDB = new Database('units.json');
export const DriveConfigurationsDB = new Database('drive_configurations.json');
export const OperationsDB = new Database('operations.json');
export const DevicesDB = new Database('devices.json');
export const MotorsDB = new Database('motors.json');
export const LinearUnitsDB = new Database('linear_units.json');
export const SensorsDB = new Database('sensors.json');
