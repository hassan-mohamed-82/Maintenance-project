import { Router } from "express";
import { createZone, updateZone, getZoneById, getZones, deleteZone } from "../../controllers/admin/zone";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
const router = Router();
// ✅ Create Zone
router.post("/", catchAsync(createZone));
// ✅ Get All Zones
router.get("/", catchAsync(getZones));
// ✅ Get Zone By ID
router.get("/:id", catchAsync(getZoneById));
// ✅ Update Zone
router.put("/:id", catchAsync(updateZone));
// ✅ Delete Zone
router.delete("/:id", catchAsync(deleteZone));
export default router;