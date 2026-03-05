import { db } from "./src/models/db";
import { buses, garages, busCheckIns } from "./src/models/schema";
import { sql, eq, and, isNull, or, desc } from "drizzle-orm";

async function run() {
    try {
        console.log("Checking raw busCheckIns...");
        const raw = await db.select().from(busCheckIns).limit(5);
        console.log(raw);

        console.log("\nChecking getGaragesBusesStats query...");

        const isCheckedInCondition = or(
            isNull(busCheckIns.checkOutTime),
            sql`${busCheckIns.checkOutTime} = '0000-00-00 00:00:00'`
        );

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
                    // isCheckedInCondition
                )
            )
            .leftJoin(
                buses,
                eq(buses.id, busCheckIns.busId)
            )
            .groupBy(garages.id, garages.name);

        console.log(stats);

        console.log("SQL Query:", db.select().from(busCheckIns).toSQL());
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
