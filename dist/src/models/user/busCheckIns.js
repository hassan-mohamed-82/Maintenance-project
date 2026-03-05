"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.busCheckIns = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const garages_1 = require("../admin/garages");
const Bus_1 = require("../admin/Bus");
const Users_1 = require("../admin/Users");
exports.busCheckIns = (0, mysql_core_1.mysqlTable)("bus_check_ins", {
    id: (0, mysql_core_1.char)("id", { length: 36 }).primaryKey().default((0, drizzle_orm_1.sql) `(UUID())`),
    busId: (0, mysql_core_1.char)("bus_id", { length: 36 }).notNull().references(() => Bus_1.buses.id),
    garageId: (0, mysql_core_1.char)("garage_id", { length: 36 }).notNull().references(() => garages_1.garages.id),
    securityUserId: (0, mysql_core_1.char)("security_user_id", { length: 36 }).notNull().references(() => Users_1.users.id),
    description: (0, mysql_core_1.text)("description"),
    checkInTime: (0, mysql_core_1.timestamp)("check_in_time").notNull(),
    checkOutTime: (0, mysql_core_1.timestamp)("check_out_time"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow(),
});
