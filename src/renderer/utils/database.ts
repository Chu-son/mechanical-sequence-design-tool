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
  DrivePartType,
  DrivePart,
  Manufacturer,
  PartsDatabase,
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

  private partsFileName: string = 'parts.json';

  constructor(fileName: string) {
    this.fileName = fileName;
    this.partsFileName = 'parts.json'; // 部品データは別ファイルで管理
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

  /* --- 部品データベース関連メソッド --- */

  /**
   * 部品データベースを取得
   */
  private async getPartsDatabase(): Promise<PartsDatabase> {
    try {
      const result = await ipcRenderer.invoke('getAll', this.partsFileName);
      return {
        parts: result.parts || [],
        manufacturers: result.manufacturers || [],
      } as PartsDatabase;
    } catch (error) {
      console.error('Error loading parts database:', error);
      return { parts: [], manufacturers: [] };
    }
  }

  /**
   * 部品データベースを保存
   */
  private async savePartsDatabase(database: PartsDatabase): Promise<void> {
    await ipcRenderer.invoke('save', this.partsFileName, database);
  }

  /* --- 部品管理メソッド --- */

  /**
   * 全ての部品を取得（オプションで種別フィルタリング）
   */
  public async getAllParts(type?: DrivePartType): Promise<DrivePart[]> {
    const database = await this.getPartsDatabase();
    if (type) {
      return database.parts.filter((part) => part.type === type);
    }
    return database.parts;
  }

  /**
   * 設計書に準拠したメソッド名のエイリアス
   * getAllPartsと同じ機能
   */
  public async getParts(type?: DrivePartType): Promise<DrivePart[]> {
    return this.getAllParts(type);
  }

  /**
   * 部品IDで部品を取得
   */
  public async getPartById(partId: number): Promise<DrivePart | null> {
    const database = await this.getPartsDatabase();
    return database.parts.find((part) => part.id === partId) || null;
  }

  /**
   * 新しい部品を作成
   */
  public async createPart(
    part: Omit<DrivePart, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    const database = await this.getPartsDatabase();
    const newPartId =
      database.parts.length > 0
        ? Math.max(...database.parts.map((p) => p.id)) + 1
        : 1;

    const newPart: DrivePart = {
      id: newPartId,
      type: part.type,
      model: part.model,
      manufacturerId: part.manufacturerId,
      spec: part.spec,
      ...initializeBaseEntity(),
    };

    database.parts.push(newPart);
    await this.savePartsDatabase(database);
  }

  /**
   * 部品を更新
   */
  public async updatePart(
    partId: number,
    part: Partial<DrivePart>,
  ): Promise<void> {
    const database = await this.getPartsDatabase();
    const index = database.parts.findIndex((p) => p.id === partId);

    if (index !== -1) {
      const existingPart = database.parts[index];
      database.parts[index] = updateEntity({
        ...existingPart,
        ...part,
        id: existingPart.id, // IDは変更不可
        createdAt: existingPart.createdAt, // 作成日は変更不可
      });

      await this.savePartsDatabase(database);
    }
  }

  /**
   * 部品を削除
   */
  public async deletePart(partId: number): Promise<void> {
    const database = await this.getPartsDatabase();
    database.parts = database.parts.filter((part) => part.id !== partId);
    await this.savePartsDatabase(database);
  }

  /* --- メーカー管理メソッド --- */

  /**
   * 全てのメーカーを取得
   */
  public async getAllManufacturers(): Promise<Manufacturer[]> {
    const database = await this.getPartsDatabase();
    return database.manufacturers;
  }

  /**
   * 設計書に準拠したメソッド名のエイリアス
   * getAllManufacturersと同じ機能
   */
  public async getManufacturers(): Promise<Manufacturer[]> {
    return this.getAllManufacturers();
  }

  /**
   * メーカーIDでメーカーを取得
   */
  public async getManufacturerById(
    manufacturerId: number,
  ): Promise<Manufacturer | null> {
    const database = await this.getPartsDatabase();
    return (
      database.manufacturers.find((mfr) => mfr.id === manufacturerId) || null
    );
  }

  /**
   * 新しいメーカーを作成
   */
  public async createManufacturer(
    manufacturer: Omit<Manufacturer, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    const database = (await this.getPartsDatabase()) || [];

    // メーカー名の重複チェック（日本語名・英語名）
    const isDuplicate = (database.manufacturers ?? []).some(
      (mfr) =>
        mfr.nameJa === manufacturer.nameJa ||
        mfr.nameEn === manufacturer.nameEn,
    );

    if (isDuplicate) {
      throw new Error('同じ名前のメーカーが既に存在します。');
    }

    const newManufacturerId =
      database.manufacturers.length > 0
        ? Math.max(...database.manufacturers.map((m) => m.id)) + 1
        : 1;

    const newManufacturer: Manufacturer = {
      id: newManufacturerId,
      nameJa: manufacturer.nameJa,
      nameEn: manufacturer.nameEn,
      ...initializeBaseEntity(),
    };

    database.manufacturers.push(newManufacturer);
    await this.savePartsDatabase(database);
  }

  /**
   * メーカーを更新
   */
  public async updateManufacturer(
    manufacturerId: number,
    manufacturer: Partial<Manufacturer>,
  ): Promise<void> {
    console.log('Updating manufacturer:', manufacturerId, manufacturer);
    const database = await this.getPartsDatabase();
    const index = database.manufacturers.findIndex(
      (m) => m.id === manufacturerId,
    );

    if (index !== -1) {
      console.log('Manufacturer found:', database.manufacturers[index]);
      const existingManufacturer = database.manufacturers[index];

      // 名前変更時の重複チェック
      if (manufacturer.nameJa || manufacturer.nameEn) {
        const isDuplicate = database.manufacturers.some(
          (mfr) =>
            mfr.id !== manufacturerId &&
            ((manufacturer.nameJa && mfr.nameJa === manufacturer.nameJa) ||
              (manufacturer.nameEn && mfr.nameEn === manufacturer.nameEn)),
        );

        if (isDuplicate) {
          throw new Error('同じ名前のメーカーが既に存在します。');
        }
      }

      database.manufacturers[index] = updateEntity({
        ...existingManufacturer,
        ...manufacturer,
        id: existingManufacturer.id, // IDは変更不可
        createdAt: existingManufacturer.createdAt, // 作成日は変更不可
      });

      await this.savePartsDatabase(database);
    }
  }

  /**
   * メーカーを削除
   */
  public async deleteManufacturer(manufacturerId: number): Promise<void> {
    const database = await this.getPartsDatabase();

    // このメーカーを参照している部品があるかチェック
    const hasReferences = (database.parts ?? []).some(
      (part) => part.manufacturerId === manufacturerId,
    );

    if (hasReferences) {
      throw new Error('このメーカーは部品で使用されているため削除できません。');
    }

    database.manufacturers = (database.manufacturers ?? []).filter(
      (mfr) => mfr.id !== manufacturerId,
    );
    await this.savePartsDatabase(database);
  }
}

// 内部使用のみを目的としています
// @internal
export { JsonDatabase };
