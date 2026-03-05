import { mysqlTable, char } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { busCheckIns } from "./busCheckIns";
import { maintenanceTypes } from "../admin/MaintenanceType";

export const checkInMaintenanceTypes = mysqlTable("checkin_maint_types", {
    id: char("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
    busCheckInId: char("checkin_id", { length: 36 })
        .notNull()
        .references(() => busCheckIns.id),
    maintenanceTypeId: char("maint_type_id", { length: 36 })
        .notNull()
        .references(() => maintenanceTypes.id),
});
