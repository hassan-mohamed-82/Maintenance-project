import { Request, Response } from "express";
import { db } from "../../models/db";
import { buses, garages, busCheckIns } from "../../models/schema";
import { count, eq, sql, and, isNull, desc } from "drizzle-orm";
import { SuccessResponse } from "../../utils/response";

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

    SuccessResponse(
        res,
        {
            dashboard: {
                totalBuses: totalBuses.count,
                activeBuses: activeBuses.count,
                maintenanceBuses: maintenanceBuses.count,
            }
        },
        200
    );
};

export const getGaragesBusesStats = async (req: Request, res: Response) => {
    const stats = await db
        .select({
            garageId: garages.id,
            garageName: garages.name,
            activeCount: sql<number>`CAST(SUM(CASE WHEN ${buses.status} = 'active' THEN 1 ELSE 0 END) AS SIGNED)`,
            inactiveCount: sql<number>`CAST(SUM(CASE WHEN ${buses.status} = 'inactive' THEN 1 ELSE 0 END) AS SIGNED)`,
            maintenanceCount: sql<number>`CAST(SUM(CASE WHEN ${buses.status} = 'maintenance' THEN 1 ELSE 0 END) AS SIGNED)`,
            totalBuses: sql<number>`CAST(COUNT(${busCheckIns.busId}) AS SIGNED)`
        })
        .from(garages)
        .leftJoin(
            busCheckIns,
            and(
                eq(busCheckIns.garageId, garages.id),
                isNull(busCheckIns.checkOutTime)
            )
        )
        .leftJoin(
            buses,
            eq(buses.id, busCheckIns.busId)
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
                isNull(busCheckIns.checkOutTime)
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
        })
        .from(buses)
        .leftJoin(
            busCheckIns,
            and(
                eq(busCheckIns.busId, buses.id),
                isNull(busCheckIns.checkOutTime)
            )
        )
        .leftJoin(
            garages,
            eq(garages.id, busCheckIns.garageId)
        )
        .where(eq(buses.id, busId))
        .limit(1);

    if (details.length === 0) {
        return res.status(404).json({ success: false, message: "Bus not found" });
    }

    SuccessResponse(res, { bus: details[0] }, 200);
};
