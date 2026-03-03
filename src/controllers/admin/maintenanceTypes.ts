import { Request, Response } from "express";
import { db } from "../../models/db";
import { maintenanceTypes } from "../../models/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors/NotFound";

// ✅ Get All Maintenance Types
export const getAllMaintenanceTypes = async (req: Request, res: Response) => {
    const allTypes = await db.select().from(maintenanceTypes);
    SuccessResponse(res, { maintenanceTypes: allTypes }, 200);
};

// ✅ Get Maintenance Type By ID
export const getMaintenanceTypeById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const [type] = await db
        .select()
        .from(maintenanceTypes)
        .where(eq(maintenanceTypes.id, id))
        .limit(1);

    if (!type) {
        throw new NotFound("Maintenance Type not found");
    }

    SuccessResponse(res, { maintenanceType: type }, 200);
};

// ✅ Create Maintenance Type
export const createMaintenanceType = async (req: Request, res: Response) => {
    const { name } = req.body;
    const newId = uuidv4();

    await db.insert(maintenanceTypes).values({
        id: newId,
        name,
    });

    const [createdType] = await db
        .select()
        .from(maintenanceTypes)
        .where(eq(maintenanceTypes.id, newId))
        .limit(1);

    SuccessResponse(
        res,
        { message: "Maintenance Type created successfully", maintenanceType: createdType },
        201
    );
};

// ✅ Update Maintenance Type
export const updateMaintenanceType = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    const [existingType] = await db
        .select()
        .from(maintenanceTypes)
        .where(eq(maintenanceTypes.id, id))
        .limit(1);

    if (!existingType) {
        throw new NotFound("Maintenance Type not found");
    }

    await db.update(maintenanceTypes).set({ name }).where(eq(maintenanceTypes.id, id));

    const [updatedType] = await db
        .select()
        .from(maintenanceTypes)
        .where(eq(maintenanceTypes.id, id))
        .limit(1);

    SuccessResponse(
        res,
        { message: "Maintenance Type updated successfully", maintenanceType: updatedType },
        200
    );
};

// ✅ Delete Maintenance Type
export const deleteMaintenanceType = async (req: Request, res: Response) => {
    const { id } = req.params;

    const [existingType] = await db
        .select()
        .from(maintenanceTypes)
        .where(eq(maintenanceTypes.id, id))
        .limit(1);

    if (!existingType) {
        throw new NotFound("Maintenance Type not found");
    }

    await db.delete(maintenanceTypes).where(eq(maintenanceTypes.id, id));

    SuccessResponse(res, { message: "Maintenance Type deleted successfully" }, 200);
};
