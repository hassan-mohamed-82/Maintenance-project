"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenances = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const MaintenanceType_1 = require("./MaintenanceType");
exports.maintenances = (0, mysql_core_1.mysqlTable)("maintenances", {
    id: (0, mysql_core_1.char)("id", { length: 36 }).primaryKey().notNull(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    maintenanceTypeId: (0, mysql_core_1.char)("maintenance_type_id", { length: 36 })
        .notNull()
        .references(() => MaintenanceType_1.maintenanceTypes.id),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow(),
});
