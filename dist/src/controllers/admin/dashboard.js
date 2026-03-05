"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBusCheckinDetails = exports.getGarageBusesList = exports.getGaragesBusesStats = exports.getDashboardStats = void 0;
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
const getGaragesBusesStats = async (req, res) => {
    const stats = await db_1.db
        .select({
        garageId: schema_1.garages.id,
        garageName: schema_1.garages.name,
        activeCount: (0, drizzle_orm_1.sql) `CAST(SUM(CASE WHEN ${schema_1.buses.status} = 'active' THEN 1 ELSE 0 END) AS SIGNED)`,
        inactiveCount: (0, drizzle_orm_1.sql) `CAST(SUM(CASE WHEN ${schema_1.buses.status} = 'inactive' THEN 1 ELSE 0 END) AS SIGNED)`,
        maintenanceCount: (0, drizzle_orm_1.sql) `CAST(SUM(CASE WHEN ${schema_1.buses.status} = 'maintenance' THEN 1 ELSE 0 END) AS SIGNED)`,
        totalBuses: (0, drizzle_orm_1.sql) `CAST(COUNT(${schema_1.busCheckIns.busId}) AS SIGNED)`
    })
        .from(schema_1.garages)
        .leftJoin(schema_1.busCheckIns, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.busCheckIns.garageId, schema_1.garages.id), (0, drizzle_orm_1.isNull)(schema_1.busCheckIns.checkOutTime)))
        .leftJoin(schema_1.buses, (0, drizzle_orm_1.eq)(schema_1.buses.id, schema_1.busCheckIns.busId))
        .groupBy(schema_1.garages.id, schema_1.garages.name);
    (0, response_1.SuccessResponse)(res, { garages: stats }, 200);
};
exports.getGaragesBusesStats = getGaragesBusesStats;
const getGarageBusesList = async (req, res) => {
    const { garageId } = req.params;
    const garageBuses = await db_1.db
        .select({
        busId: schema_1.buses.id,
        busNumber: schema_1.buses.busNumber,
        plateNumber: schema_1.buses.plateNumber,
        status: schema_1.buses.status,
        checkInTime: schema_1.busCheckIns.checkInTime,
        description: schema_1.busCheckIns.description,
    })
        .from(schema_1.busCheckIns)
        .innerJoin(schema_1.buses, (0, drizzle_orm_1.eq)(schema_1.buses.id, schema_1.busCheckIns.busId))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.busCheckIns.garageId, garageId), (0, drizzle_orm_1.isNull)(schema_1.busCheckIns.checkOutTime)))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.busCheckIns.checkInTime));
    (0, response_1.SuccessResponse)(res, { buses: garageBuses }, 200);
};
exports.getGarageBusesList = getGarageBusesList;
const getBusCheckinDetails = async (req, res) => {
    const { busId } = req.params;
    const details = await db_1.db
        .select({
        busId: schema_1.buses.id,
        busNumber: schema_1.buses.busNumber,
        plateNumber: schema_1.buses.plateNumber,
        status: schema_1.buses.status,
        licenseNumber: schema_1.buses.licenseNumber,
        licenseExpiryDate: schema_1.buses.licenseExpiryDate,
        busImage: schema_1.buses.busImage,
        checkInTime: schema_1.busCheckIns.checkInTime,
        description: schema_1.busCheckIns.description,
        garageName: schema_1.garages.name,
    })
        .from(schema_1.buses)
        .leftJoin(schema_1.busCheckIns, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.busCheckIns.busId, schema_1.buses.id), (0, drizzle_orm_1.isNull)(schema_1.busCheckIns.checkOutTime)))
        .leftJoin(schema_1.garages, (0, drizzle_orm_1.eq)(schema_1.garages.id, schema_1.busCheckIns.garageId))
        .where((0, drizzle_orm_1.eq)(schema_1.buses.id, busId))
        .limit(1);
    if (details.length === 0) {
        return res.status(404).json({ success: false, message: "Bus not found" });
    }
    (0, response_1.SuccessResponse)(res, { bus: details[0] }, 200);
};
exports.getBusCheckinDetails = getBusCheckinDetails;
