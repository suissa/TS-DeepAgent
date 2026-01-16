import { db } from '../database/schema';

export interface DatabaseConfig {
  path?: string;
}

export class Database {
  private static instance: Database | null = null;

  static getInstance(): typeof db {
    return db;
  }

  static transaction<T>(callback: () => T): T {
    return db.transaction(callback)();
  }

  static close(): void {
    db.close();
  }
}

export { db };
