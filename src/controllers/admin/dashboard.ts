import { Request, Response } from "express";
import { db } from "../../models/db";
import { buses, garages, busCheckIns, users, checkInMaintenanceTypes, maintenanceTypes } from "../../models/schema";
import { count, eq, sql, and, isNull, desc } from "drizzle-orm";
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

    SuccessResponse(res, { garages: stats }, 200);
};

export const getGarageBusesList = async (req: Request, res: Response) => {
    const { garageId } = req.params;

    const garageBuses = await db
        .select({
            busId: buses.id,
            busNumber: buses.busNumber,
            plateNumber: buses.plateNumber,
            status: buses.status,
            checkInTime: busCheckIns.checkInTime,
            description: busCheckIns.description,
        })
        .from(busCheckIns)
        .innerJoin(buses, eq(buses.id, busCheckIns.busId))
        .where(
            and(
                eq(busCheckIns.garageId, garageId),
                isCheckedInCondition
            )
        )
        .orderBy(desc(busCheckIns.checkInTime));

    SuccessResponse(res, { buses: garageBuses }, 200);
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