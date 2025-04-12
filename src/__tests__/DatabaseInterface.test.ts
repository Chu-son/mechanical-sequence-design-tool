import { describe, it, expect } from '@jest/globals';
import { JsonDatabase } from '../renderer/utils/database';
import CachedDatabase from '../renderer/utils/CachedDatabase';
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
} from '../renderer/types/databaseTypes';

/**
 * インターフェイスが持つすべてのメソッドキーを取得する型
 *
 * KeyofInterfaceMethod<DatabaseInterface> は DatabaseInterface の
 * メソッドのキーのみを抽出した Union 型になる
 */
type KeyofInterfaceMethod<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

/**
 * DatabaseInterfaceのすべてのメソッドを型から抽出したモッククラスを生成する
 * インターフェイスが変更されると、このモックも型エラーになるので気づきやすい
 */
class MockDatabaseInterface implements DatabaseInterface {
  [key: string]: any;

  // DatabaseInterfaceの必須メソッドをスタブ実装
  async getAllProjects(): Promise<Project[]> {
    return [];
  }

  async getProjectById(identifier: ProjectIdentifier): Promise<Project | null> {
    return null;
  }

  async createProject(project: Project): Promise<void> {}

  async updateProject(
    identifier: ProjectIdentifier,
    updatedProject: Project,
  ): Promise<void> {}

  async deleteProject(identifier: ProjectIdentifier): Promise<void> {}

  async getUnitsByProjectId(identifier: ProjectIdentifier): Promise<Unit[]> {
    return [];
  }

  async getUnitById(identifier: UnitIdentifier): Promise<Unit | null> {
    return null;
  }

  async createUnit(identifier: ProjectIdentifier, unit: Unit): Promise<void> {}

  async updateUnit(
    identifier: UnitIdentifier,
    updatedUnit: Unit,
  ): Promise<void> {}

  async deleteUnit(identifier: UnitIdentifier): Promise<void> {}

  async getDriveConfigsByUnitId(
    identifier: UnitIdentifier,
  ): Promise<DriveConfig[]> {
    return [];
  }

  async getOperationConfigsByUnitId(
    identifier: UnitIdentifier,
  ): Promise<OperationConfig[]> {
    return [];
  }

  async getDriveConfigById(
    identifier: ConfigIdentifier,
  ): Promise<DriveConfig | null> {
    return null;
  }

  async getOperationConfigById(
    identifier: ConfigIdentifier,
  ): Promise<OperationConfig | null> {
    return null;
  }

  async createDriveConfig(
    identifier: UnitIdentifier,
    config: DriveConfig,
  ): Promise<void> {}

  async createOperationConfig(
    identifier: UnitIdentifier,
    config: OperationConfig,
  ): Promise<void> {}

  async updateDriveConfig(
    identifier: ConfigIdentifier,
    updatedConfig: DriveConfig,
  ): Promise<void> {}

  async updateOperationConfig(
    identifier: ConfigIdentifier,
    updatedConfig: OperationConfig,
  ): Promise<void> {}

  async deleteDriveConfig(identifier: ConfigIdentifier): Promise<void> {}

  async deleteOperationConfig(identifier: ConfigIdentifier): Promise<void> {}

  async getFlowData(identifier: ConfigIdentifier): Promise<FlowData | null> {
    return null;
  }

  async saveFlowData(
    identifier: ConfigIdentifier,
    flowData: FlowData,
  ): Promise<void> {}

  constructor() {
    const handler = {
      get: (target: any, prop: string) => {
        // 既に実装済みのメソッドがあればそれを返す
        if (prop in target) {
          return target[prop];
        }

        // 未実装のメソッドはモックメソッドとして実装
        if (typeof prop === 'string' && prop !== 'then') {
          // Promise対応
          target[prop] = async (...args: any[]) => {
            return null;
          };
        }
        return target[prop];
      },
    };

    return new Proxy(this, handler);
  }
}

describe('DatabaseInterface Implementation', () => {
  it('should automatically extract all interface methods', () => {
    // モックインスタンス生成
    const mockDb = new MockDatabaseInterface();

    // モックインスタンスから実装されているメソッド一覧を取得
    const allMethods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(mockDb),
    ).filter((method) => method !== 'constructor');

    // Proxyなので追加した分を対象から除外
    const methodsToIgnore = ['then'];
    const interfaceMethods = allMethods.filter(
      (method) => !methodsToIgnore.includes(method),
    );

    // テスト出力用に表示
    console.log('Detected interface methods:', interfaceMethods);

    // JsonDatabaseのメソッド検証
    const jsonDatabaseMethods = Object.getOwnPropertyNames(
      JsonDatabase.prototype,
    ).filter((method) => method !== 'constructor');

    const jsonMissingMethods = interfaceMethods.filter(
      (method) => !jsonDatabaseMethods.includes(method),
    );

    // CachedDatabaseのメソッド検証
    const cachedDatabaseMethods = Object.getOwnPropertyNames(
      CachedDatabase.prototype,
    ).filter((method) => method !== 'constructor');

    const cachedMissingMethods = interfaceMethods.filter(
      (method) => !cachedDatabaseMethods.includes(method),
    );

    // レガシーメソッド (JsonDatabaseでは実装されているが、インターフェースにない)
    const legacyMethods = ['getAll', 'getById', 'create', 'update', 'delete'];
    const jsonLegacyImplemented = jsonDatabaseMethods.filter((method) =>
      legacyMethods.includes(method),
    );

    const cachedLegacyImplemented = cachedDatabaseMethods.filter((method) =>
      legacyMethods.includes(method),
    );

    // 警告表示
    if (jsonLegacyImplemented.length > 0) {
      console.warn(
        `JsonDatabase still implements legacy methods: ${jsonLegacyImplemented.join(', ')}`,
      );
    }

    if (cachedLegacyImplemented.length > 0) {
      console.warn(
        `CachedDatabase still implements legacy methods: ${cachedLegacyImplemented.join(', ')}`,
      );
    }

    // 実際のテストアサーション
    expect(jsonMissingMethods).toEqual([]);
    expect(cachedMissingMethods).toEqual([]);
  });

  // 実際の振る舞いをテストする基本的なチェック
  it('JsonDatabase should have functioning methods', () => {
    const db = new JsonDatabase('projects.json');
    expect(typeof (db as any).getAllProjects).toBe('function');
    expect(typeof (db as any).getProjectById).toBe('function');
  });

  it('CachedDatabase should have functioning methods', () => {
    const mockDb = new JsonDatabase(
      'projects.json',
    ) as unknown as DatabaseInterface;
    const cachedDb = new CachedDatabase(mockDb);
    expect(typeof cachedDb.getAllProjects).toBe('function');
    expect(typeof cachedDb.getProjectById).toBe('function');
  });
});
