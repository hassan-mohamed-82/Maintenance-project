"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceTypes = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.maintenanceTypes = (0, mysql_core_1.mysqlTable)("maintenance_types", {
    id: (0, mysql_core_1.char)("id", { length: 36 }).primaryKey().notNull(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow(),
});
