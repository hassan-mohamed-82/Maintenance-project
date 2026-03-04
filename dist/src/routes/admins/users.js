"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = require("../../controllers/admin/users");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
// ✅ Create User
router.post("/", (0, catchAsync_1.catchAsync)(users_1.createUser));
// ✅ Get All Users Selection
router.get("/selection", (0, catchAsync_1.catchAsync)(users_1.getUsersSelection));
// ✅ Get All Users
router.get("/", (0, catchAsync_1.catchAsync)(users_1.getUsers));
// ✅ Get User By ID
router.get("/:id", (0, catchAsync_1.catchAsync)(users_1.getUserById));
// ✅ Update User
router.put("/:id", (0, catchAsync_1.catchAsync)(users_1.updateUser));
// ✅ Delete User
router.delete("/:id", (0, catchAsync_1.catchAsync)(users_1.deleteUser));
exports.default = router;
