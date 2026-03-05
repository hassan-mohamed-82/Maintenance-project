"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_1 = require("../../controllers/admin/dashboard");
const catchAsync_1 = require("../../utils/catchAsync");
const dashboardRouter = (0, express_1.Router)();
// Route to get dashboard statistics
dashboardRouter.get("/", (0, catchAsync_1.catchAsync)(dashboard_1.getDashboardStats));
// Route to get garages and their buses stats
dashboardRouter.get("/garages-stats", (0, catchAsync_1.catchAsync)(dashboard_1.getGaragesBusesStats));
// Route to get a list of buses in a specific garage
dashboardRouter.get("/garages/:garageId/buses", (0, catchAsync_1.catchAsync)(dashboard_1.getGarageBusesList));
// Route to get check-in details for a specific bus
dashboardRouter.get("/buses/:busId/checkin-details", (0, catchAsync_1.catchAsync)(dashboard_1.getBusCheckinDetails));
exports.default = dashboardRouter;
