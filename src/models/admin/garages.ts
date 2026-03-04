import { mysqlTable, varchar, timestamp, char } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { cities, zones } from "../schema";

export const garages = mysqlTable("garages", {
  id: char("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  cityId: char("city_id", { length: 36 }).notNull().references(() => cities.id),
  location: varchar("location", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});