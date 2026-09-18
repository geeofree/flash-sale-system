import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema.js';

export class DbService {
  static resolveValue() {
    return drizzle(process.env['POSTGRES_DB_URL']!);
  }
}

export type Database = NodePgDatabase<typeof schema>
