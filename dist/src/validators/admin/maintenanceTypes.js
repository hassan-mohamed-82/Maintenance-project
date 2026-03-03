"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMaintenanceTypeSchema = exports.createMaintenanceTypeSchema = void 0;
const zod_1 = require("zod");
exports.createMaintenanceTypeSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required").max(255),
    }),
});
exports.updateMaintenanceTypeSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required").max(255).optional(),
    }),
});
