import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const UsersTable = pgTable('users', {
  id: integer().primaryKey().notNull().unique().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).unique().notNull(),
  role: varchar({ enum: ["Admin", "User"] }).notNull(),
  password: varchar({ length: 255 }).notNull(),
});

export const SalesTable = pgTable('sales', {
  id: integer().primaryKey().notNull().unique().generatedAlwaysAsIdentity(),
  startTime: timestamp({ withTimezone: true }).notNull(),
  endTime: timestamp({ withTimezone: true }).notNull(),
});

export const ProductsTable = pgTable('products', {
  id: integer().primaryKey().notNull().unique().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).unique().notNull(),
  stock: integer().notNull().default(0)
});
