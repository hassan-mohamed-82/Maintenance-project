"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkInMaintenanceTypes = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const busCheckIns_1 = require("./busCheckIns");
const MaintenanceType_1 = require("../admin/MaintenanceType");
exports.checkInMaintenanceTypes = (0, mysql_core_1.mysqlTable)("checkin_maint_types", {
    id: (0, mysql_core_1.char)("id", { length: 36 }).primaryKey().default((0, drizzle_orm_1.sql) `(UUID())`),
    busCheckInId: (0, mysql_core_1.char)("checkin_id", { length: 36 })
        .notNull()
        .references(() => busCheckIns_1.busCheckIns.id),
    maintenanceTypeId: (0, mysql_core_1.char)("maint_type_id", { length: 36 })
        .notNull()
        .references(() => MaintenanceType_1.maintenanceTypes.id),
});
