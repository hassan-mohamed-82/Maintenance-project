import { Router } from "express";
import {
    getAllMaintenances,
    getMaintenanceById,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
} from "../../controllers/admin/maintenances";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { createMaintenanceSchema, updateMaintenanceSchema } from "../../validators/admin/maintenance";

const router = Router();

router.get("/", catchAsync(getAllMaintenances));
router.get("/:id", catchAsync(getMaintenanceById));
router.post("/", validate(createMaintenanceSchema), catchAsync(createMaintenance));
router.put("/:id", validate(updateMaintenanceSchema), catchAsync(updateMaintenance));
router.delete("/:id", catchAsync(deleteMaintenance));

export default router;
