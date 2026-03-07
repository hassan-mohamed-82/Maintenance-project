"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaintenanceReports = exports.getBusCheckinDetails = exports.getGarageBusesList = exports.getGaragesBusesStats = exports.getDashboardStats = void 0;
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
    // جلب كل الـ check-in IDs اللي لسه جوه الجراجات
    const allCheckIns = await db_1.db
        .select({
        garageId: schema_1.busCheckIns.garageId,
        checkInId: schema_1.busCheckIns.id,
    })
        .from(schema_1.busCheckIns)
        .where(isCheckedInCondition);
    const allCheckInIds = allCheckIns.map(c => c.checkInId);
    // جلب أنواع الأعطال لكل check-in
    let maintenancesMap = {};
    if (allCheckInIds.length > 0) {
        const maintenancesData = await db_1.db
            .select({
            checkInId: schema_1.checkInMaintenanceTypes.busCheckInId,
            maintenanceName: schema_1.maintenanceTypes.name,
        })
            .from(schema_1.checkInMaintenanceTypes)
            .innerJoin(schema_1.maintenanceTypes, (0, drizzle_orm_1.eq)(schema_1.maintenanceTypes.id, schema_1.checkInMaintenanceTypes.maintenanceTypeId))
            .where((0, drizzle_orm_1.inArray)(schema_1.checkInMaintenanceTypes.busCheckInId, allCheckInIds));
        for (const m of maintenancesData) {
            if (!maintenancesMap[m.checkInId]) {
                maintenancesMap[m.checkInId] = [];
            }
            maintenancesMap[m.checkInId].push(m.maintenanceName);
        }
    }
    // تجميع الأعطال حسب الجراج
    const garageMaintenancesMap = {};
    for (const c of allCheckIns) {
        const faults = maintenancesMap[c.checkInId] || [];
        if (!garageMaintenancesMap[c.garageId]) {
            garageMaintenancesMap[c.garageId] = [];
        }
        garageMaintenancesMap[c.garageId].push(...faults);
    }
    // إزالة الأعطال المكررة لكل جراج
    const result = stats.map(g => ({
        ...g,
        reportedMaintenances: [...new Set(garageMaintenancesMap[g.garageId] || [])],
    }));
    (0, response_1.SuccessResponse)(res, { garages: result }, 200);
};
exports.getGaragesBusesStats = getGaragesBusesStats;
const getGarageBusesList = async (req, res) => {
    const { garageId } = req.params;
    const garageBuses = await db_1.db
        .select({
        checkInId: schema_1.busCheckIns.id,
        busId: schema_1.buses.id,
        busNumber: schema_1.buses.busNumber,
        plateNumber: schema_1.buses.plateNumber,
        status: schema_1.buses.status,
        checkInTime: schema_1.busCheckIns.checkInTime,
        description: schema_1.busCheckIns.description,
        driverName: schema_1.users.name,
    })
        .from(schema_1.busCheckIns)
        .innerJoin(schema_1.buses, (0, drizzle_orm_1.eq)(schema_1.buses.id, schema_1.busCheckIns.busId))
        .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.users.id, schema_1.busCheckIns.driverId))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.busCheckIns.garageId, garageId), isCheckedInCondition))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.busCheckIns.checkInTime));
    // جلب أنواع الصيانة (الأعطال) لكل check-in
    const checkInIds = garageBuses.map(b => b.checkInId);
    let maintenancesMap = {};
    if (checkInIds.length > 0) {
        const maintenancesData = await db_1.db
            .select({
            checkInId: schema_1.checkInMaintenanceTypes.busCheckInId,
            maintenanceName: schema_1.maintenanceTypes.name,
        })
            .from(schema_1.checkInMaintenanceTypes)
            .innerJoin(schema_1.maintenanceTypes, (0, drizzle_orm_1.eq)(schema_1.maintenanceTypes.id, schema_1.checkInMaintenanceTypes.maintenanceTypeId))
            .where((0, drizzle_orm_1.inArray)(schema_1.checkInMaintenanceTypes.busCheckInId, checkInIds));
        for (const m of maintenancesData) {
            if (!maintenancesMap[m.checkInId]) {
                maintenancesMap[m.checkInId] = [];
            }
            maintenancesMap[m.checkInId].push(m.maintenanceName);
        }
    }
    const result = garageBuses.map(b => {
        const { checkInId, ...rest } = b;
        return {
            ...rest,
            reportedMaintenances: maintenancesMap[checkInId] || [],
        };
    });
    (0, response_1.SuccessResponse)(res, { buses: result }, 200);
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
        driverName: schema_1.users.name,
        checkInId: schema_1.busCheckIns.id,
    })
        .from(schema_1.buses)
        .leftJoin(schema_1.busCheckIns, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.busCheckIns.busId, schema_1.buses.id), isCheckedInCondition))
        .leftJoin(schema_1.garages, (0, drizzle_orm_1.eq)(schema_1.garages.id, schema_1.busCheckIns.garageId))
        .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.users.id, schema_1.busCheckIns.driverId))
        .where((0, drizzle_orm_1.eq)(schema_1.buses.id, busId))
        .limit(1);
    if (details.length === 0) {
        return res.status(404).json({ success: false, message: "Bus not found" });
    }
    const busDetails = details[0];
    let reportedMaintenances = [];
    if (busDetails.checkInId) {
        const maintenanceData = await db_1.db
            .select({
            name: schema_1.maintenanceTypes.name
        })
            .from(schema_1.checkInMaintenanceTypes)
            .innerJoin(schema_1.maintenanceTypes, (0, drizzle_orm_1.eq)(schema_1.maintenanceTypes.id, schema_1.checkInMaintenanceTypes.maintenanceTypeId))
            .where((0, drizzle_orm_1.eq)(schema_1.checkInMaintenanceTypes.busCheckInId, busDetails.checkInId));
        reportedMaintenances = maintenanceData.map(m => m.name);
    }
    const { checkInId, ...responseBusDetails } = busDetails;
    (0, response_1.SuccessResponse)(res, { bus: { ...responseBusDetails, reportedMaintenances } }, 200);
};
exports.getBusCheckinDetails = getBusCheckinDetails;
const getMaintenanceReports = async (req, res) => {
    const { garageId, maintenanceTypeId, busId } = req.query;
    const filters = [];
    if (garageId)
        filters.push((0, drizzle_orm_1.eq)(schema_1.busCheckIns.garageId, String(garageId)));
    if (busId)
        filters.push((0, drizzle_orm_1.eq)(schema_1.busCheckIns.busId, String(busId)));
    // If maintenanceTypeId is provided, we only want checkIns that have this maintenance type
    if (maintenanceTypeId) {
        const matchingCheckIns = await db_1.db
            .select({ busCheckInId: schema_1.checkInMaintenanceTypes.busCheckInId })
            .from(schema_1.checkInMaintenanceTypes)
            .where((0, drizzle_orm_1.eq)(schema_1.checkInMaintenanceTypes.maintenanceTypeId, String(maintenanceTypeId)));
        const matchedIds = matchingCheckIns.map(c => c.busCheckInId);
        if (matchedIds.length === 0) {
            return (0, response_1.SuccessResponse)(res, { reports: [] }, 200);
        }
        filters.push((0, drizzle_orm_1.inArray)(schema_1.busCheckIns.id, matchedIds));
    }
    // Fetch reports data based on filters
    const reportsData = await db_1.db
        .select({
        checkInId: schema_1.busCheckIns.id,
        busNumber: schema_1.buses.busNumber,
        plateNumber: schema_1.buses.plateNumber,
        busType: schema_1.busTypes.name,
        driverName: schema_1.users.name,
        checkInTime: schema_1.busCheckIns.checkInTime,
        garageName: schema_1.garages.name,
    })
        .from(schema_1.busCheckIns)
        .innerJoin(schema_1.buses, (0, drizzle_orm_1.eq)(schema_1.buses.id, schema_1.busCheckIns.busId))
        .leftJoin(schema_1.busTypes, (0, drizzle_orm_1.eq)(schema_1.busTypes.id, schema_1.buses.busTypeId))
        .innerJoin(schema_1.garages, (0, drizzle_orm_1.eq)(schema_1.garages.id, schema_1.busCheckIns.garageId))
        .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.users.id, schema_1.busCheckIns.driverId))
        .where(filters.length > 0 ? (0, drizzle_orm_1.and)(...filters) : undefined)
        .orderBy((0, drizzle_orm_1.desc)(schema_1.busCheckIns.checkInTime));
    if (reportsData.length === 0) {
        return (0, response_1.SuccessResponse)(res, { reports: [] }, 200);
    }
    // Fetch maintenance types for these check-ins
    const checkInIds = reportsData.map(r => r.checkInId);
    const maintenancesData = await db_1.db
        .select({
        checkInId: schema_1.checkInMaintenanceTypes.busCheckInId,
        maintenanceName: schema_1.maintenanceTypes.name,
    })
        .from(schema_1.checkInMaintenanceTypes)
        .innerJoin(schema_1.maintenanceTypes, (0, drizzle_orm_1.eq)(schema_1.maintenanceTypes.id, schema_1.checkInMaintenanceTypes.maintenanceTypeId))
        .where((0, drizzle_orm_1.inArray)(schema_1.checkInMaintenanceTypes.busCheckInId, checkInIds));
    const maintenancesMap = {};
    for (const m of maintenancesData) {
        if (!maintenancesMap[m.checkInId]) {
            maintenancesMap[m.checkInId] = [];
        }
        maintenancesMap[m.checkInId].push(m.maintenanceName);
    }
    // Only include check-ins that actually have reported maintenances (faults)
    const finalReports = reportsData
        .filter(r => maintenancesMap[r.checkInId] && maintenancesMap[r.checkInId].length > 0)
        .map(r => {
        const { checkInId, ...rest } = r;
        return {
            ...rest,
            reportedMaintenances: maintenancesMap[r.checkInId]
        };
    });
    (0, response_1.SuccessResponse)(res, { reports: finalReports }, 200);
};
exports.getMaintenanceReports = getMaintenanceReports;
