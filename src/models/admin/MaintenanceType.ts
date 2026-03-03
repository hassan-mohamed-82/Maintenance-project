import { mysqlTable, varchar, char, timestamp } from "drizzle-orm/mysql-core";

export const maintenanceTypes = mysqlTable("maintenance_types", {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
