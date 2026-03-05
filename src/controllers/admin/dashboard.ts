import { Request, Response } from "express";
import { db } from "../../models/db";
import { buses } from "../../models/schema";
import { count, eq } from "drizzle-orm";
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
