import { db } from "./src/models/db";
import { buses } from "./src/models/schema";
import { count, eq } from "drizzle-orm";

async function run() {
    try {
        const [totalBuses] = await db.select({ count: count() }).from(buses);

        const [activeBuses] = await db
            .select({ count: count() })
            .from(buses)
            .where(eq(buses.status, "active"));

        const [maintenanceBuses] = await db
            .select({ count: count() })
            .from(buses)
            .where(eq(buses.status, "maintenance"));

        console.log("Stats:");
        console.log({
            totalBuses: totalBuses?.count,
            activeBuses: activeBuses?.count,
            maintenanceBuses: maintenanceBuses?.count,
        });
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
