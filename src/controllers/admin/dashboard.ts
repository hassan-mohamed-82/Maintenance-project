import { Request, Response } from "express";
import { db } from "../../models/db";
import { buses, garages, busCheckIns, users, checkInMaintenanceTypes, maintenanceTypes, busTypes } from "../../models/schema";
import { count, eq, sql, and, isNull, desc, inArray } from "drizzle-orm";
import { SuccessResponse } from "../../utils/response";

// ✅ شيلنا حتة '0000-00-00 00:00:00' لأنها بتضرب إيرور في MySQL
// واعتمدنا بس إن الـ checkOutTime يكون null (يعني الباص لسه جوة)
const isCheckedInCondition = isNull(busCheckIns.checkOutTime);

export const getDashboardStats = async (req: Request, res: Response) => {
    const [totalBuses] = await db.select({ count: count() }).from(buses);

    const [activeBuses] = await db
        .select({ count: count() })
        .from(buses)
        .where(eq(buses.status, "active"));

    const [maintenanceBuses] = await db
        .select({ count: count() })
        .from(buses)
        .where(eq(buses.status, "maintenance"));


    const [inactive] = await db
        .select({ count: count() })
        .from(buses)
        .where(eq(buses.status, "inactive"));

    SuccessResponse(
        res,
        {
            dashboard: {
                totalBuses: totalBuses.count,
                activeBuses: activeBuses.count,
                inactiveBuses: inactive.count,
                maintenanceBuses: maintenanceBuses.count,
            }
        },
        200
    );
};

export const getGaragesBusesStats = async (req: Request, res: Response) => {
    // 💡 عدلنا اللوجيك بتاع حساب الإحصائيات عشان يشتغل صح مع الـ Group By
    const stats = await db
        .select({
            garageId: garages.id,
            garageName: garages.name,
            // 💡 استخدمنا COALESCE عشان لو مفيش باصات يرجع 0 بدل null
            activeCount: sql<number>`COALESCE(CAST(SUM(CASE WHEN ${buses.status} = 'active' THEN 1 ELSE 0 END) AS SIGNED), 0)`,
            inactiveCount: sql<number>`COALESCE(CAST(SUM(CASE WHEN ${buses.status} = 'inactive' THEN 1 ELSE 0 END) AS SIGNED), 0)`,
            maintenanceCount: sql<number>`COALESCE(CAST(SUM(CASE WHEN ${buses.status} = 'maintenance' THEN 1 ELSE 0 END) AS SIGNED), 0)`,
            totalBuses: sql<number>`COALESCE(CAST(COUNT(${busCheckIns.busId}) AS SIGNED), 0)`
        })
        .from(garages)
        .leftJoin(
            busCheckIns,
            and(
                eq(busCheckIns.garageId, garages.id),
                isCheckedInCondition // الباص اللي لسه متعملوش تسجيل خروج
            )
        )
        .leftJoin(
            buses,
            eq(buses.id, busCheckIns.busId) // بنجيب بيانات الباص بناءً على الـ CheckIn بتاعه
        )
        .groupBy(garages.id, garages.name);

    // جلب كل الـ check-in IDs اللي لسه جوه الجراجات
    const allCheckIns = await db
        .select({
            garageId: busCheckIns.garageId,
            checkInId: busCheckIns.id,
        })
        .from(busCheckIns)
        .where(isCheckedInCondition);

    const allCheckInIds = allCheckIns.map(c => c.checkInId);

    // جلب أنواع الأعطال لكل check-in
    let maintenancesMap: Record<string, string[]> = {};

    if (allCheckInIds.length > 0) {
        const maintenancesData = await db
            .select({
                checkInId: checkInMaintenanceTypes.busCheckInId,
                maintenanceName: maintenanceTypes.name,
            })
            .from(checkInMaintenanceTypes)
            .innerJoin(maintenanceTypes, eq(maintenanceTypes.id, checkInMaintenanceTypes.maintenanceTypeId))
            .where(inArray(checkInMaintenanceTypes.busCheckInId, allCheckInIds));

        for (const m of maintenancesData) {
            if (!maintenancesMap[m.checkInId]) {
                maintenancesMap[m.checkInId] = [];
            }
            maintenancesMap[m.checkInId].push(m.maintenanceName);
        }
    }

    // تجميع الأعطال حسب الجراج
    const garageMaintenancesMap: Record<string, string[]> = {};
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

    SuccessResponse(res, { garages: result }, 200);
};

export const getGarageBusesList = async (req: Request, res: Response) => {
    const { garageId } = req.params;

    const garageBuses = await db
        .select({
            checkInId: busCheckIns.id,
            busId: buses.id,
            busNumber: buses.busNumber,
            plateNumber: buses.plateNumber,
            status: buses.status,
            checkInTime: busCheckIns.checkInTime,
            description: busCheckIns.description,
            driverName: users.name,
        })
        .from(busCheckIns)
        .innerJoin(buses, eq(buses.id, busCheckIns.busId))
        .leftJoin(users, eq(users.id, busCheckIns.driverId))
        .where(
            and(
                eq(busCheckIns.garageId, garageId),
                isCheckedInCondition
            )
        )
        .orderBy(desc(busCheckIns.checkInTime));

    // جلب أنواع الصيانة (الأعطال) لكل check-in
    const checkInIds = garageBuses.map(b => b.checkInId);

    let maintenancesMap: Record<string, string[]> = {};

    if (checkInIds.length > 0) {
        const maintenancesData = await db
            .select({
                checkInId: checkInMaintenanceTypes.busCheckInId,
                maintenanceName: maintenanceTypes.name,
            })
            .from(checkInMaintenanceTypes)
            .innerJoin(maintenanceTypes, eq(maintenanceTypes.id, checkInMaintenanceTypes.maintenanceTypeId))
            .where(inArray(checkInMaintenanceTypes.busCheckInId, checkInIds));

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

    SuccessResponse(res, { buses: result }, 200);
};

export const getBusCheckinDetails = async (req: Request, res: Response) => {
    const { busId } = req.params;

    const details = await db
        .select({
            busId: buses.id,
            busNumber: buses.busNumber,
            plateNumber: buses.plateNumber,
            status: buses.status,
            licenseNumber: buses.licenseNumber,
            licenseExpiryDate: buses.licenseExpiryDate,
            busImage: buses.busImage,
            checkInTime: busCheckIns.checkInTime,
            description: busCheckIns.description,
            garageName: garages.name,
            driverName: users.name,
            checkInId: busCheckIns.id,
        })
        .from(buses)
        .leftJoin(
            busCheckIns,
            and(
                eq(busCheckIns.busId, buses.id),
                isCheckedInCondition
            )
        )
        .leftJoin(
            garages,
            eq(garages.id, busCheckIns.garageId)
        )
        .leftJoin(
            users,
            eq(users.id, busCheckIns.driverId)
        )
        .where(eq(buses.id, busId))
        .limit(1);

    if (details.length === 0) {
        return res.status(404).json({ success: false, message: "Bus not found" });
    }

    const busDetails = details[0];
    let reportedMaintenances: string[] = [];

    if (busDetails.checkInId) {
        const maintenanceData = await db
            .select({
                name: maintenanceTypes.name
            })
            .from(checkInMaintenanceTypes)
            .innerJoin(
                maintenanceTypes,
                eq(maintenanceTypes.id, checkInMaintenanceTypes.maintenanceTypeId)
            )
            .where(eq(checkInMaintenanceTypes.busCheckInId, busDetails.checkInId));

        reportedMaintenances = maintenanceData.map(m => m.name);
    }

    const { checkInId, ...responseBusDetails } = busDetails;

    SuccessResponse(res, { bus: { ...responseBusDetails, reportedMaintenances } }, 200);
};

export const getMaintenanceReports = async (req: Request, res: Response) => {
    const { garageId, maintenanceTypeId, busId } = req.query;

    const filters = [];

    if (garageId) filters.push(eq(busCheckIns.garageId, String(garageId)));
    if (busId) filters.push(eq(busCheckIns.busId, String(busId)));

    // If maintenanceTypeId is provided, we only want checkIns that have this maintenance type
    if (maintenanceTypeId) {
        const matchingCheckIns = await db
            .select({ busCheckInId: checkInMaintenanceTypes.busCheckInId })
            .from(checkInMaintenanceTypes)
            .where(eq(checkInMaintenanceTypes.maintenanceTypeId, String(maintenanceTypeId)));

        const matchedIds = matchingCheckIns.map(c => c.busCheckInId);
        if (matchedIds.length === 0) {
            return SuccessResponse(res, { reports: [] }, 200);
        }
        filters.push(inArray(busCheckIns.id, matchedIds));
    }

    // Fetch reports data based on filters
    const reportsData = await db
        .select({
            checkInId: busCheckIns.id,
            busNumber: buses.busNumber,
            plateNumber: buses.plateNumber,
            busType: busTypes.name,
            driverName: users.name,
            checkInTime: busCheckIns.checkInTime,
            garageName: garages.name,
        })
        .from(busCheckIns)
        .innerJoin(buses, eq(buses.id, busCheckIns.busId))
        .leftJoin(busTypes, eq(busTypes.id, buses.busTypeId))
        .innerJoin(garages, eq(garages.id, busCheckIns.garageId))
        .leftJoin(users, eq(users.id, busCheckIns.driverId))
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(busCheckIns.checkInTime));

    if (reportsData.length === 0) {
        return SuccessResponse(res, { reports: [] }, 200);
    }

    // Fetch maintenance types for these check-ins
    const checkInIds = reportsData.map(r => r.checkInId);

    const maintenancesData = await db
        .select({
            checkInId: checkInMaintenanceTypes.busCheckInId,
            maintenanceName: maintenanceTypes.name,
        })
        .from(checkInMaintenanceTypes)
        .innerJoin(maintenanceTypes, eq(maintenanceTypes.id, checkInMaintenanceTypes.maintenanceTypeId))
        .where(inArray(checkInMaintenanceTypes.busCheckInId, checkInIds));

    const maintenancesMap: Record<string, string[]> = {};
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

    SuccessResponse(res, { reports: finalReports }, 200);
};