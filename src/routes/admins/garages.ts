import { Router } from "express";
import {
  createGarage,
  getGarages,
  getGarageById,
  updateGarage,
  deleteGarage,
  getCitiesWithZones,
  selectionGarages
} from "../../controllers/admin/garages";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";

const router = Router();

// ✅ Create Garage
router.post("/", catchAsync(createGarage));

// ✅ Get Cities With Zones Selection
router.get("/cities-zones", catchAsync(getCitiesWithZones));

// ✅ Get Selection Garages
router.get("/selection", catchAsync(selectionGarages));

// ✅ Get All Garages
router.get("/", catchAsync(getGarages));

// ✅ Get Garage By ID
router.get("/:id", catchAsync(getGarageById));

// ✅ Update Garage
router.put("/:id", catchAsync(updateGarage));

// ✅ Delete Garage
router.delete("/:id", catchAsync(deleteGarage));

export default router;
