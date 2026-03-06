import { db } from "./src/models/db";
import { buses, garages, users } from "./src/models/schema";
import { busCheckIns } from "./src/models/user/busCheckIns";
import { sql } from "drizzle-orm";

async function seedCheckins() {
    try {
        console.log("Fetching existing data...");
        const existingBuses = await db.select().from(buses).limit(3);
        const existingGarages = await db.select().from(garages).limit(1);
        const existingUsers = await db.select().from(users).limit(1);

        if (existingGarages.length === 0) {
            console.log("No garages found! Please create a garage first.");
            return;
        }

        if (existingUsers.length === 0) {
            console.log("No users found! Please create a user first.");
            return;
        }

        if (existingBuses.length === 0) {
            console.log("No buses found! Please create a bus first.");
            return;
        }

        const garageId = existingGarages[0].id;
        const securityUserId = existingUsers[0].id;

        console.log(`Using Garage ID: ${garageId}`);
        console.log(`Using Security User ID: ${securityUserId}`);

        for (const bus of existingBuses) {
            console.log(`Inserting check-in for Bus ID: ${bus.id} (${bus.busNumber})`);
            await db.insert(busCheckIns).values({
                busId: bus.id,
                garageId: garageId,
                securityUserId: securityUserId,
                description: `Routine check-in for bus ${bus.busNumber}`,
                checkInTime: new Date()
            });
            console.log(`Successfully checked in bus ${bus.busNumber}.`);
        }

        console.log("\nFinished seeding bus check-ins.");
    } catch (error) {
        console.error("Error inserting data:", error);
    } finally {
        process.exit(0);
    }
}

seedCheckins();
