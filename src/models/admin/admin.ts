// src/models/schema/admin.ts

import {
  mysqlTable,
  varchar,
  timestamp,
  mysqlEnum,
  json,
  char,
  primaryKey,
  text,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { roles } from "./roles";
import { Permission } from "../../types/custom";
export const admins = mysqlTable("admins", {
  id: char("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
    
  // الـ Role (اختياري - للـ Admin العادي)
  roleId: char("role_id", { length: 36 }).references(() => roles.id),

  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  avatar: varchar("avatar", { length: 500 }),

  // النوع: organizer أو admin
  type: mysqlEnum("type", ["superadmin", "admin"]).notNull().default("admin"),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});