"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catchAsync_1 = require("../../utils/catchAsync");
const roles_1 = __importDefault(require("./roles"));
const busTypes_1 = __importDefault(require("./busTypes"));
const admin_1 = __importDefault(require("./admin"));
const bus_1 = __importDefault(require("./bus"));
const express_1 = require("express");
const route = (0, express_1.Router)();
// route.use("/auth", catchAsync(AuthRoute));
// route.use(authenticated, authorizeRoles("admin", "superadmin"));
route.use("/roles", (0, catchAsync_1.catchAsync)(roles_1.default));
route.use("/admins", (0, catchAsync_1.catchAsync)(admin_1.default));
route.use("/buses", (0, catchAsync_1.catchAsync)(bus_1.default));
route.use("/busTypes", (0, catchAsync_1.catchAsync)(busTypes_1.default));
exports.default = route;
