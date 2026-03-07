"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBusCheckinDetails = exports.getGarageBusesList = exports.getGaragesBusesStats = exports.getDashboardStats = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const response_1 = require("../../utils/response");
// ✅ شيلنا حتة '0000-00-00 00:00:00' لأنها بتضرب إيرور في MySQL
// واعتمدنا بس إن الـ checkOutTime يكون null (يعني الباص لسه جوة)
const isCheckedInCondition = (0, drizzle_orm_1.isNull)(schema_1.busCheckIns.checkOutTime);
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
    const [inactive] = await db_1.db
        .select({ count: (0, drizzle_orm_1.count)() })
        .from(schema_1.buses)
        .where((0, drizzle_orm_1.eq)(schema_1.buses.status, "inactive"));
    (0, response_1.SuccessResponse)(res, {
        dashboard: {
            totalBuses: totalBuses.count,
            activeBuses: activeBuses.count,
            inactiveBuses: inactive.count,
            maintenanceBuses: maintenanceBuses.count,
        }
    }, 200);
};
exports.getDashboardStats = getDashboardStats;
const getGaragesBusesStats = async (req, res) => {
    // 💡 عدلنا اللوجيك بتاع حساب الإحصائيات عشان يشتغل صح مع الـ Group By
    const stats = await db_1.db
        .select({
        garageId: schema_1.garages.id,
        garageName: schema_1.garages.name,
        // 💡 استخدمنا COALESCE عشان لو مفيش باصات يرجع 0 بدل null
        activeCount: (0, drizzle_orm_1.sql) `COALESCE(CAST(SUM(CASE WHEN ${schema_1.buses.status} = 'active' THEN 1 ELSE 0 END) AS SIGNED), 0)`,
        inactiveCount: (0, drizzle_orm_1.sql) `COALESCE(CAST(SUM(CASE WHEN ${schema_1.buses.status} = 'inactive' THEN 1 ELSE 0 END) AS SIGNED), 0)`,
        maintenanceCount: (0, drizzle_orm_1.sql) `COALESCE(CAST(SUM(CASE WHEN ${schema_1.buses.status} = 'maintenance' THEN 1 ELSE 0 END) AS SIGNED), 0)`,
        totalBuses: (0, drizzle_orm_1.sql) `COALESCE(CAST(COUNT(${schema_1.busCheckIns.busId}) AS SIGNED), 0)`
    })
        .from(schema_1.garages)
        .leftJoin(schema_1.busCheckIns, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.busCheckIns.garageId, schema_1.garages.id), isCheckedInCondition // الباص اللي لسه متعملوش تسجيل خروج
    ))
        .leftJoin(schema_1.buses, (0, drizzle_orm_1.eq)(schema_1.buses.id, schema_1.busCheckIns.busId) // بنجيب بيانات الباص بناءً على الـ CheckIn بتاعه
    )
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
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.busCheckIns.garageId, garageId), isCheckedInCondition))
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
        .leftJoin(schema_1.busCheckIns, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.busCheckIns.busId, schema_1.buses.id), isCheckedInCondition))
        .leftJoin(schema_1.garages, (0, drizzle_orm_1.eq)(schema_1.garages.id, schema_1.busCheckIns.garageId))
        .where((0, drizzle_orm_1.eq)(schema_1.buses.id, busId))
        .limit(1);
    if (details.length === 0) {
        return res.status(404).json({ success: false, message: "Bus not found" });
    }
    (0, response_1.SuccessResponse)(res, { bus: details[0] }, 200);
};
exports.getBusCheckinDetails = getBusCheckinDetails;
