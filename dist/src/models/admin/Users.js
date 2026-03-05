"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../schema");
exports.users = (0, mysql_core_1.mysqlTable)("users", {
    id: (0, mysql_core_1.char)("id", { length: 36 }).primaryKey().default((0, drizzle_orm_1.sql) `(UUID())`),
    phone: (0, mysql_core_1.varchar)("phone", { length: 255 }).notNull(),
    avatar: (0, mysql_core_1.varchar)("avatar", { length: 255 }),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    garageId: (0, mysql_core_1.char)("garage_id", { length: 36 }).references(() => schema_1.garages.id),
    // Role
    role: (0, mysql_core_1.mysqlEnum)("role", [
        "driver",
        "security",
        "engineer",
        "technical",
        "subadmin"
    ]).notNull(),
    // Account switch logic
    hasAccount: (0, mysql_core_1.boolean)("has_account").default(false).notNull(),
    // Optional Auth fields (Required only if hasAccount is true)
    // Note: NULL values are ignored by MySQL's UNIQUE constraint, so multiple users without accounts can have a NULL username
    username: (0, mysql_core_1.varchar)("username", { length: 255 }).unique(),
    password: (0, mysql_core_1.varchar)("password", { length: 255 }),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("active"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow(),
});
