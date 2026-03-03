"use strict";
// src/utils/auth.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateAdminToken = exports.generateSuperAdminToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Errors_1 = require("../Errors");
require("dotenv/config");
const JWT_SECRET = process.env.JWT_SECRET;
// للـ SuperAdmin (أنت - البائع)
const generateSuperAdminToken = (data) => {
    const payload = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: "superadmin",
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};
exports.generateSuperAdminToken = generateSuperAdminToken;
// للـ Admin (موظف بصلاحيات)
const generateAdminToken = (data) => {
    const payload = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: "admin",
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};
exports.generateAdminToken = generateAdminToken;
// التحقق من التوكن
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Errors_1.UnauthorizedError("Token has expired");
        }
        throw new Errors_1.UnauthorizedError("Invalid token");
    }
};
exports.verifyToken = verifyToken;
