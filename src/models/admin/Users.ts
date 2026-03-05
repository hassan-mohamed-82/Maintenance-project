import {
    mysqlTable,
    varchar,
    timestamp,
    mysqlEnum,
    char,
    boolean,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { garages } from "../schema";

export const users = mysqlTable("users", {
    id: char("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
    phone: varchar("phone", { length: 255 }).notNull(),
    avatar: varchar("avatar", { length: 255 }),
    name: varchar("name", { length: 255 }).notNull(),
    garageId: char("garage_id", { length: 36 }).references(() => garages.id),

    // Role
    role: mysqlEnum("role", [
        "driver",
        "security",
        "engineer",
        "technical",
        "subadmin"
    ]).notNull(),

    // Account switch logic
    hasAccount: boolean("has_account").default(false).notNull(),

    // Optional Auth fields (Required only if hasAccount is true)
    // Note: NULL values are ignored by MySQL's UNIQUE constraint, so multiple users without accounts can have a NULL username
    username: varchar("username", { length: 255 }).unique(),
    email: varchar("email", { length: 255 }).unique(),
    password: varchar("password", { length: 255 }),

    status: mysqlEnum("status", ["active", "inactive"]).default("active"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
