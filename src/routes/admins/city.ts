import { Router } from "express";
import { createCity, getCities, getCityById, updateCity, getCitiesWithZones, getCityWithZones, deleteCity } from "../../controllers/admin/city";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";

const router = Router();

// ✅ Create City
router.post("/", catchAsync(createCity));

// ✅ Get All Cities
router.get("/", catchAsync(getCities));

// ✅ Get All Cities With Zones
// (Must come before /:id to prevent "zones" being treated as an ID)
router.get("/zones", catchAsync(getCitiesWithZones));

// ✅ Get City By ID
router.get("/:id", catchAsync(getCityById));

// ✅ Update City
router.put("/:id", catchAsync(updateCity));

// ✅ Delete City
router.delete("/:id", catchAsync(deleteCity));

// ✅ Get City With Zones
router.get("/zones/:id", catchAsync(getCityWithZones));

export default router;