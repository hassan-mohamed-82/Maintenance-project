"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMaintenanceSchema = exports.createMaintenanceSchema = void 0;
const zod_1 = require("zod");
exports.createMaintenanceSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required").max(255),
        maintenanceTypeId: zod_1.z.string().uuid("Invalid Maintenance Type ID"),
    }),
});
exports.updateMaintenanceSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required").max(255).optional(),
        maintenanceTypeId: zod_1.z.string().uuid("Invalid Maintenance Type ID").optional(),
    }),
});
