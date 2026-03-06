"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const garages_1 = require("../../controllers/admin/garages");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
// ✅ Create Garage
router.post("/", (0, catchAsync_1.catchAsync)(garages_1.createGarage));
// ✅ Get Cities With Zones Selection
router.get("/cities-zones", (0, catchAsync_1.catchAsync)(garages_1.getCitiesWithZones));
// ✅ Get Selection Garages
router.get("/selection", (0, catchAsync_1.catchAsync)(garages_1.selectionGarages));
// ✅ Get All Garages
router.get("/", (0, catchAsync_1.catchAsync)(garages_1.getGarages));
// ✅ Get Garage By ID
router.get("/:id", (0, catchAsync_1.catchAsync)(garages_1.getGarageById));
// ✅ Update Garage
router.put("/:id", (0, catchAsync_1.catchAsync)(garages_1.updateGarage));
// ✅ Delete Garage
router.delete("/:id", (0, catchAsync_1.catchAsync)(garages_1.deleteGarage));
exports.default = router;
