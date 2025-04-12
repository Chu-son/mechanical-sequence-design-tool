import { DatabaseInterface } from '../types/databaseTypes';
import { JsonDatabase } from './database';
import { config } from '../config';
import CachedDatabase from './CachedDatabase';

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
