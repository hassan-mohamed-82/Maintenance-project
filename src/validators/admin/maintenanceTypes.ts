import { z } from "zod";

export const createMaintenanceTypeSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required").max(255),
    }),
});

export const updateMaintenanceTypeSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required").max(255).optional(),
    }),
});
