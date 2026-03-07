import { mysqlTable, text, char, timestamp } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { garages } from "../admin/garages";
import { buses } from "../admin/Bus";
import { users } from "../admin/Users";

export const busCheckIns = mysqlTable("bus_check_ins", {
    id: char("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
    busId: char("bus_id", { length: 36 }).notNull().references(() => buses.id),
    garageId: char("garage_id", { length: 36 }).notNull().references(() => garages.id),
    securityUserId: char("security_user_id", { length: 36 }).notNull().references(() => users.id),
    driverId: char("driver_id", { length: 36 }).references(() => users.id),

    description: text("description"),

    checkInTime: timestamp("check_in_time").notNull(),
    checkOutTime: timestamp("check_out_time"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
