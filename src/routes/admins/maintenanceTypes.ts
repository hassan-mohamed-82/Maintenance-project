import { Router } from "express";
import {
    getAllMaintenanceTypes,
    getMaintenanceTypeById,
    createMaintenanceType,
    updateMaintenanceType,
    deleteMaintenanceType,
} from "../../controllers/admin/maintenanceTypes";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { createMaintenanceTypeSchema, updateMaintenanceTypeSchema } from "../../validators/admin/maintenanceTypes";

const router = Router();

router.get("/", catchAsync(getAllMaintenanceTypes));
router.get("/:id", catchAsync(getMaintenanceTypeById));
router.post("/", validate(createMaintenanceTypeSchema), catchAsync(createMaintenanceType));
router.put("/:id", validate(updateMaintenanceTypeSchema), catchAsync(updateMaintenanceType));
router.delete("/:id", catchAsync(deleteMaintenanceType));

export default router;
