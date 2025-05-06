import {
  DatabaseInterface,
  Project,
  Unit,
  DriveConfig,
  OperationConfig,
  ProjectIdentifier,
  UnitIdentifier,
  ConfigIdentifier,
  FlowData,
  DrivePartType,
  DrivePart,
  Manufacturer,
} from '@/renderer/types/databaseTypes';

class CachedDatabase implements DatabaseInterface {
  private database: DatabaseInterface;

  private cache: Map<string, { data: any; timestamp: number }>;

  private cacheTTL: number; // キャッシュの有効期限 (ミリ秒)

  constructor(database: DatabaseInterface, cacheTTL = 60000) {
    this.database = database;
    this.cache = new Map();
    this.cacheTTL = cacheTTL;
  }

  private isCacheValid(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    const isValid = Date.now() - entry.timestamp < this.cacheTTL;
    if (!isValid) this.cache.delete(key); // 有効期限切れの場合は削除
    return isValid;
  }

  async getFlowData(
    configIdentifier: ConfigIdentifier,
  ): Promise<FlowData | null> {
    const cacheKey = `getFlowData-${JSON.stringify(configIdentifier)}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }
    const data = await this.database.getFlowData(configIdentifier);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getAllProjects(): Promise<Project[]> {
    const cacheKey = 'getAllProjects';
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }
    const data = await this.database.getAllProjects();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getProjectById(identifier: ProjectIdentifier): Promise<Project | null> {
    const cacheKey = `getProjectById-${identifier.projectId}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }
    const data = await this.database.getProjectById(identifier);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async createProject(project: Project): Promise<void> {
    await this.database.createProject(project);
    this.cache.clear(); // キャッシュをクリア
  }

  async updateProject(
    identifier: ProjectIdentifier,
    updatedProject: Project,
  ): Promise<void> {
    await this.database.updateProject(identifier, updatedProject);
    this.cache.clear(); // キャッシュをクリア
  }

  async deleteProject(identifier: ProjectIdentifier): Promise<void> {
    await this.database.deleteProject(identifier);
    this.cache.clear(); // キャッシュをクリア
  }

  async getUnitsByProjectId(identifier: ProjectIdentifier): Promise<Unit[]> {
    const cacheKey = `getUnitsByProjectId-${identifier.projectId}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }
    const data = await this.database.getUnitsByProjectId(identifier);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getUnitById(identifier: UnitIdentifier): Promise<Unit | null> {
    const cacheKey = `getUnitById-${identifier.projectId}-${identifier.unitId}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }
    const data = await this.database.getUnitById(identifier);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async createUnit(identifier: ProjectIdentifier, unit: Unit): Promise<void> {
    await this.database.createUnit(identifier, unit);
    this.cache.clear(); // キャッシュをクリア
  }

  async updateUnit(
    identifier: UnitIdentifier,
    updatedUnit: Unit,
  ): Promise<void> {
    await this.database.updateUnit(identifier, updatedUnit);
    this.cache.clear(); // キャッシュをクリア
  }

  async deleteUnit(identifier: UnitIdentifier): Promise<void> {
    await this.database.deleteUnit(identifier);
    this.cache.clear(); // キャッシュをクリア
  }

  async createDriveConfig(
    identifier: UnitIdentifier,
    config: DriveConfig,
  ): Promise<void> {
    await this.database.createDriveConfig(identifier, config);
    this.cache.clear(); // キャッシュをクリア
  }

  async createOperationConfig(
    identifier: UnitIdentifier,
    config: OperationConfig,
  ): Promise<void> {
    await this.database.createOperationConfig(identifier, config);
    this.cache.clear(); // キャッシュをクリア
  }

  async updateDriveConfig(
    identifier: ConfigIdentifier,
    updatedConfig: DriveConfig,
  ): Promise<void> {
    await this.database.updateDriveConfig(identifier, updatedConfig);
    this.cache.clear(); // キャッシュをクリア
  }

  async updateOperationConfig(
    identifier: ConfigIdentifier,
    updatedConfig: OperationConfig,
  ): Promise<void> {
    await this.database.updateOperationConfig(identifier, updatedConfig);
    this.cache.clear(); // キャッシュをクリア
  }

  async deleteDriveConfig(identifier: ConfigIdentifier): Promise<void> {
    await this.database.deleteDriveConfig(identifier);
    this.cache.clear(); // キャッシュをクリア
  }

  async deleteOperationConfig(identifier: ConfigIdentifier): Promise<void> {
    await this.database.deleteOperationConfig(identifier);
    this.cache.clear(); // キャッシュをクリア
  }

  async saveFlowData(
    identifier: ConfigIdentifier,
    flowData: FlowData,
  ): Promise<void> {
    await this.database.saveFlowData(identifier, flowData);
    this.cache.clear(); // キャッシュをクリア
  }

  async getDriveConfigsByUnitId(
    identifier: UnitIdentifier,
  ): Promise<DriveConfig[]> {
    const cacheKey = `getDriveConfigsByUnitId-${identifier.projectId}-${identifier.unitId}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }
    const data = await this.database.getDriveConfigsByUnitId(identifier);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getOperationConfigsByUnitId(
    identifier: UnitIdentifier,
  ): Promise<OperationConfig[]> {
    const cacheKey = `getOperationConfigsByUnitId-${identifier.projectId}-${identifier.unitId}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }
    const data = await this.database.getOperationConfigsByUnitId(identifier);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getDriveConfigById(
    identifier: ConfigIdentifier,
  ): Promise<DriveConfig | null> {
    const cacheKey = `getDriveConfigById-${identifier.projectId}-${identifier.unitId}-${identifier.configId}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }
    const data = await this.database.getDriveConfigById(identifier);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getOperationConfigById(
    identifier: ConfigIdentifier,
  ): Promise<OperationConfig | null> {
    const cacheKey = `getOperationConfigById-${identifier.projectId}-${identifier.unitId}-${identifier.configId}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }
    const data = await this.database.getOperationConfigById(identifier);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  /* --- 部品管理メソッド --- */

  /**
   * 全ての部品を取得（オプションで種別フィルタリング）
   */
  async getAllParts(type?: DrivePartType): Promise<DrivePart[]> {
    const cacheKey = `getAllParts-${type || 'all'}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }
    const data = await this.database.getAllParts(type);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * 設計書準拠のメソッド名のエイリアス
   */
  async getParts(type?: DrivePartType): Promise<DrivePart[]> {
    return this.getAllParts(type);
  }

  /**
   * 部品IDで部品を取得
   */
  async getPartById(partId: number): Promise<DrivePart | null> {
    const cacheKey = `getPartById-${partId}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }
    const data = await this.database.getPartById(partId);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * 新しい部品を作成
   */
  async createPart(
    part: Omit<DrivePart, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    await this.database.createPart(part);
    this.cache.clear(); // キャッシュをクリア
  }

  /**
   * 部品を更新
   */
  async updatePart(partId: number, part: Partial<DrivePart>): Promise<void> {
    await this.database.updatePart(partId, part);
    this.cache.clear(); // キャッシュをクリア
  }

  /**
   * 部品を削除
   */
  async deletePart(partId: number): Promise<void> {
    await this.database.deletePart(partId);
    this.cache.clear(); // キャッシュをクリア
  }

  /* --- メーカー管理メソッド --- */

  /**
   * 全てのメーカーを取得
   */
  async getAllManufacturers(): Promise<Manufacturer[]> {
    const cacheKey = 'getAllManufacturers';
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }
    const data = await this.database.getAllManufacturers();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * 設計書準拠のメソッド名のエイリアス
   */
  async getManufacturers(): Promise<Manufacturer[]> {
    return this.getAllManufacturers();
  }

  /**
   * メーカーIDでメーカーを取得
   */
  async getManufacturerById(
    manufacturerId: number,
  ): Promise<Manufacturer | null> {
    const cacheKey = `getManufacturerById-${manufacturerId}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }
    const data = await this.database.getManufacturerById(manufacturerId);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * 新しいメーカーを作成
   */
  async createManufacturer(
    manufacturer: Omit<Manufacturer, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    await this.database.createManufacturer(manufacturer);
    this.cache.clear(); // キャッシュをクリア
  }

  /**
   * メーカーを更新
   */
  async updateManufacturer(
    manufacturerId: number,
    manufacturer: Partial<Manufacturer>,
  ): Promise<void> {
    await this.database.updateManufacturer(manufacturerId, manufacturer);
    this.cache.clear(); // キャッシュをクリア
  }

  /**
   * メーカーを削除
   */
  async deleteManufacturer(manufacturerId: number): Promise<void> {
    await this.database.deleteManufacturer(manufacturerId);
    this.cache.clear(); // キャッシュをクリア
  }
}

export default CachedDatabase;
