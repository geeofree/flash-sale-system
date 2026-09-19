import 'express-session';
import type { UsersTable } from '../db/schema.ts';

declare module 'express-session' {
  interface SessionData {
    user: Omit<typeof UsersTable.$inferSelect, "password">
  }
}

