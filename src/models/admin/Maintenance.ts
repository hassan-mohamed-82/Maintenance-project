import { mysqlTable, varchar, char, timestamp } from "drizzle-orm/mysql-core";
import { maintenanceTypes } from "./MaintenanceType";

export const maintenances = mysqlTable("maintenances", {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    maintenanceTypeId: char("maintenance_type_id", { length: 36 })
        .notNull()
        .references(() => maintenanceTypes.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
