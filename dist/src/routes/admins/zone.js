"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zone_1 = require("../../controllers/admin/zone");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
// ✅ Create Zone
router.post("/", (0, catchAsync_1.catchAsync)(zone_1.createZone));
// ✅ Get All Zones
router.get("/", (0, catchAsync_1.catchAsync)(zone_1.getZones));
// ✅ Get Zone By ID
router.get("/:id", (0, catchAsync_1.catchAsync)(zone_1.getZoneById));
// ✅ Update Zone
router.put("/:id", (0, catchAsync_1.catchAsync)(zone_1.updateZone));
// ✅ Delete Zone
router.delete("/:id", (0, catchAsync_1.catchAsync)(zone_1.deleteZone));
exports.default = router;
