import { Request, Response } from "express";
import { db } from "../../models/db";
import { maintenances, maintenanceTypes } from "../../models/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors/NotFound";
import { BadRequest } from "../../Errors/BadRequest";

// ✅ Get All Maintenances
export const getAllMaintenances = async (req: Request, res: Response) => {
    const allMaintenances = await db
        .select({
            id: maintenances.id,
            name: maintenances.name,
            maintenanceTypeId: maintenances.maintenanceTypeId,
            createdAt: maintenances.createdAt,
            updatedAt: maintenances.updatedAt,
            maintenanceType: {
                id: maintenanceTypes.id,
                name: maintenanceTypes.name,
            },
        })
        .from(maintenances)
        .leftJoin(maintenanceTypes, eq(maintenances.maintenanceTypeId, maintenanceTypes.id));

    SuccessResponse(res, { maintenances: allMaintenances }, 200);
};

// ✅ Get Maintenance By ID
export const getMaintenanceById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const [maintenance] = await db
        .select({
            id: maintenances.id,
            name: maintenances.name,
            maintenanceTypeId: maintenances.maintenanceTypeId,
            createdAt: maintenances.createdAt,
            updatedAt: maintenances.updatedAt,
            maintenanceType: {
                id: maintenanceTypes.id,
                name: maintenanceTypes.name,
            },
        })
        .from(maintenances)
        .leftJoin(maintenanceTypes, eq(maintenances.maintenanceTypeId, maintenanceTypes.id))
        .where(eq(maintenances.id, id))
        .limit(1);

    if (!maintenance) {
        throw new NotFound("Maintenance not found");
    }

    SuccessResponse(res, { maintenance }, 200);
};

// ✅ Create Maintenance
export const createMaintenance = async (req: Request, res: Response) => {
    const { name, maintenanceTypeId } = req.body;

    // Validate Maintenance Type ID
    const [typeExists] = await db
        .select()
        .from(maintenanceTypes)
        .where(eq(maintenanceTypes.id, maintenanceTypeId))
        .limit(1);

    if (!typeExists) {
        throw new BadRequest("Invalid Maintenance Type ID");
    }

    const newId = uuidv4();

    await db.insert(maintenances).values({
        id: newId,
        name,
        maintenanceTypeId,
    });

    const [createdMaintenance] = await db
        .select()
        .from(maintenances)
        .where(eq(maintenances.id, newId))
        .limit(1);

    SuccessResponse(
        res,
        { message: "Maintenance created successfully", maintenance: createdMaintenance },
        201
    );
};

// ✅ Update Maintenance
export const updateMaintenance = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, maintenanceTypeId } = req.body;

    const [existingMaintenance] = await db
        .select()
        .from(maintenances)
        .where(eq(maintenances.id, id))
        .limit(1);

    if (!existingMaintenance) {
        throw new NotFound("Maintenance not found");
    }

    if (maintenanceTypeId) {
        const [typeExists] = await db
            .select()
            .from(maintenanceTypes)
            .where(eq(maintenanceTypes.id, maintenanceTypeId))
            .limit(1);

        if (!typeExists) {
            throw new BadRequest("Invalid Maintenance Type ID");
        }
    }

    await db.update(maintenances).set({
        name: name ?? existingMaintenance.name,
        maintenanceTypeId: maintenanceTypeId ?? existingMaintenance.maintenanceTypeId
    }).where(eq(maintenances.id, id));

    const [updatedMaintenance] = await db
        .select()
        .from(maintenances)
        .where(eq(maintenances.id, id))
        .limit(1);

    SuccessResponse(
        res,
        { message: "Maintenance updated successfully", maintenance: updatedMaintenance },
        200
    );
};

// ✅ Delete Maintenance
export const deleteMaintenance = async (req: Request, res: Response) => {
    const { id } = req.params;

    const [existingMaintenance] = await db
        .select()
        .from(maintenances)
        .where(eq(maintenances.id, id))
        .limit(1);

    if (!existingMaintenance) {
        throw new NotFound("Maintenance not found");
    }

    await db.delete(maintenances).where(eq(maintenances.id, id));

    SuccessResponse(res, { message: "Maintenance deleted successfully" }, 200);
};
