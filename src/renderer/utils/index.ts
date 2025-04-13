/**
 * データベースアクセスの推奨方法です。
 * アプリケーション全体で一貫したデータベースインスタンスを取得するには、
 * DatabaseFactory.createDatabase() を使用してください。
 *
 * 例:
 * ```typescript
 * import { DatabaseFactory } from '@/renderer/utils';
 *
 * const db = DatabaseFactory.createDatabase();
 * const projects = await db.getAllProjects();
 * ```
 */
import DatabaseFactory from '@/renderer/utils/DatabaseFactory';

// 直接JsonDatabaseやCachedDatabaseをインポートすることは非推奨です
// 代わりに、DatabaseFactoryを使用してください

export {
  DatabaseFactory,
  // データベース実装クラスは直接エクスポートしません
};
