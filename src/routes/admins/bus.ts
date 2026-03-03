// src/routes/admin/busRoutes.ts

import { Router } from "express";
import {
  createBus,
  deleteBus,
  getAllBuses,
  getBusById,
  updateBus,
  updateBusStatus,
  getBusesByStatus,
  getBusDetails,
  getBusTypes
} from "../../controllers/admin/bus";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { createBusSchema, updateBusSchema } from "../../validators/admin/bus";

const router = Router();

// ✅ Static Routes أولاً
router.get("/types", catchAsync(getBusTypes));

// ✅ CRUD Routes
router.get("/", catchAsync(getAllBuses));
router.post("/", validate(createBusSchema), catchAsync(createBus));

// ✅ Dynamic Routes آخراً
router.get("/:id", catchAsync(getBusById));
router.put("/:id/data", validate(updateBusSchema), catchAsync(updateBus));
router.put("/:id", catchAsync(updateBusStatus));
router.delete("/:id", catchAsync(deleteBus));

export default router;