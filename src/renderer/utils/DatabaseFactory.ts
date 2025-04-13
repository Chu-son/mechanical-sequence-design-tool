import { DatabaseInterface } from '@/renderer/types/databaseTypes';
import { JsonDatabase } from '@/renderer/utils/database';
import { config } from '@/renderer/config';
import CachedDatabase from '@/renderer/utils/CachedDatabase';

class DatabaseFactory {
  static createDatabase(): DatabaseInterface {
    let database: DatabaseInterface;

    switch (config.databaseType) {
      case 'json':
        database = new JsonDatabase('projects.json');
        break;
      case 'sqlite':
        throw new Error('SQLite implementation not yet available');
      case 'server':
        throw new Error('Server implementation not yet available');
      default:
        throw new Error('Unsupported database type');
    }

    // キャッシュ付きデータベースを返す
    return new CachedDatabase(database);
  }
}

export default DatabaseFactory;
