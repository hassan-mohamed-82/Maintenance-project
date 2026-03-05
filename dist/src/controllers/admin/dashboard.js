"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const response_1 = require("../../utils/response");
const getDashboardStats = async (req, res) => {
    const [totalBuses] = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.buses);
    const [activeBuses] = await db_1.db
        .select({ count: (0, drizzle_orm_1.count)() })
        .from(schema_1.buses)
        .where((0, drizzle_orm_1.eq)(schema_1.buses.status, "active"));
    const [maintenanceBuses] = await db_1.db
        .select({ count: (0, drizzle_orm_1.count)() })
        .from(schema_1.buses)
        .where((0, drizzle_orm_1.eq)(schema_1.buses.status, "maintenance"));
    (0, response_1.SuccessResponse)(res, {
        dashboard: {
            totalBuses: totalBuses.count,
            activeBuses: activeBuses.count,
            maintenanceBuses: maintenanceBuses.count,
        }
    }, 200);
};
exports.getDashboardStats = getDashboardStats;
