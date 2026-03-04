"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.garages = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../schema");
exports.garages = (0, mysql_core_1.mysqlTable)("garages", {
    id: (0, mysql_core_1.char)("id", { length: 36 }).primaryKey().default((0, drizzle_orm_1.sql) `(UUID())`),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    cityId: (0, mysql_core_1.char)("city_id", { length: 36 }).notNull().references(() => schema_1.cities.id),
    location: (0, mysql_core_1.varchar)("location", { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow(),
});
