"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_1 = require("../../controllers/admin/dashboard");
const catchAsync_1 = require("../../utils/catchAsync");
const dashboardRouter = (0, express_1.Router)();
// Route to get dashboard statistics
dashboardRouter.get("/", (0, catchAsync_1.catchAsync)(dashboard_1.getDashboardStats));
exports.default = dashboardRouter;
