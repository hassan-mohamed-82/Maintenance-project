import { z } from "zod";

export const createMaintenanceSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required").max(255),
        maintenanceTypeId: z.string().uuid("Invalid Maintenance Type ID"),
    }),
});

export const updateMaintenanceSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required").max(255).optional(),
        maintenanceTypeId: z.string().uuid("Invalid Maintenance Type ID").optional(),
    }),
});
