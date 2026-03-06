"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersSelection = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.createUser = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const response_1 = require("../../utils/response");
const NotFound_1 = require("../../Errors/NotFound");
const BadRequest_1 = require("../../Errors/BadRequest");
const handleImages_1 = require("../../utils/handleImages");
const deleteImage_1 = require("../../utils/deleteImage");
const bcrypt_1 = __importDefault(require("bcrypt"));
// ✅ Create User
const createUser = async (req, res) => {
    const { name, phone, avatar, role, hasAccount, username, password, garageId } = req.body;
    if (!name)
        throw new BadRequest_1.BadRequest("name is required");
    if (!phone)
        throw new BadRequest_1.BadRequest("phone is required");
    if (!role)
        throw new BadRequest_1.BadRequest("role is required");
    let finalUsername = null;
    let hashedPassword = null;
    if (hasAccount) {
        if (!username)
            throw new BadRequest_1.BadRequest("username is required when hasAccount is true");
        if (!password)
            throw new BadRequest_1.BadRequest("password is required when hasAccount is true");
        // Check if username is already taken
        const existingUser = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.username, username))
            .limit(1);
        if (existingUser.length > 0) {
            throw new BadRequest_1.BadRequest("Username already exists");
        }
        finalUsername = username;
        hashedPassword = await bcrypt_1.default.hash(password, 10);
    }
    let avatarUrl = null;
    if (avatar) {
        const result = await (0, handleImages_1.saveBase64Image)(req, avatar, "users/avatars");
        avatarUrl = result.url;
    }
    await db_1.db.insert(schema_1.users).values({
        name,
        phone,
        avatar: avatarUrl,
        role,
        hasAccount: hasAccount || false,
        username: finalUsername,
        password: hashedPassword,
        garageId: garageId || null,
    });
    return (0, response_1.SuccessResponse)(res, { message: "User created successfully" }, 201);
};
exports.createUser = createUser;
// ✅ Get All Users
const getUsers = async (req, res) => {
    const userList = await db_1.db
        .select({
        id: schema_1.users.id,
        name: schema_1.users.name,
        phone: schema_1.users.phone,
        avatar: schema_1.users.avatar,
        role: schema_1.users.role,
        hasAccount: schema_1.users.hasAccount,
        username: schema_1.users.username,
        status: schema_1.users.status,
        createdAt: schema_1.users.createdAt,
        garageId: schema_1.users.garageId,
    })
        .from(schema_1.users)
        .orderBy((0, drizzle_orm_1.desc)(schema_1.users.createdAt));
    return (0, response_1.SuccessResponse)(res, { users: userList }, 200);
};
exports.getUsers = getUsers;
// ✅ Get User By ID
const getUserById = async (req, res) => {
    const { id } = req.params;
    const user = await db_1.db
        .select({
        id: schema_1.users.id,
        name: schema_1.users.name,
        phone: schema_1.users.phone,
        avatar: schema_1.users.avatar,
        role: schema_1.users.role,
        hasAccount: schema_1.users.hasAccount,
        username: schema_1.users.username,
        status: schema_1.users.status,
        createdAt: schema_1.users.createdAt,
        garageId: schema_1.users.garageId,
    })
        .from(schema_1.users)
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
        .limit(1);
    if (user.length === 0) {
        throw new NotFound_1.NotFound("User not found");
    }
    return (0, response_1.SuccessResponse)(res, { user: user[0] }, 200);
};
exports.getUserById = getUserById;
// ✅ Update User
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, phone, avatar, role, hasAccount, username, password, status, garageId } = req.body;
    const user = await db_1.db
        .select()
        .from(schema_1.users)
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
        .limit(1);
    if (user.length === 0) {
        throw new NotFound_1.NotFound("User not found");
    }
    const updateData = {
        name: name || user[0].name,
        phone: phone || user[0].phone,
        role: role || user[0].role,
        status: status || user[0].status,
        hasAccount: hasAccount !== undefined ? hasAccount : user[0].hasAccount,
        garageId: garageId || user[0].garageId,
    };
    // Handle avatar update
    if (avatar) {
        // Delete old avatar if exists
        if (user[0].avatar) {
            await (0, deleteImage_1.deletePhotoFromServer)(user[0].avatar);
        }
        const result = await (0, handleImages_1.saveBase64Image)(req, avatar, "users/avatars");
        updateData.avatar = result.url;
    }
    if (updateData.hasAccount) {
        // If it has account, make sure username exists (either passed or already set)
        const finalUsername = username || user[0].username;
        if (!finalUsername) {
            throw new BadRequest_1.BadRequest("username is required to enable an account");
        }
        // Check duplicate username if being updated
        if (username && username !== user[0].username) {
            const existingUser = await db_1.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.username, username), (0, drizzle_orm_1.ne)(schema_1.users.id, id)))
                .limit(1);
            if (existingUser.length > 0) {
                throw new BadRequest_1.BadRequest("Username already exists");
            }
        }
        updateData.username = finalUsername;
        // Optional password update
        if (password) {
            updateData.password = await bcrypt_1.default.hash(password, 10);
        }
    }
    else {
        // If hasAccount is false, clear out login details to enforce simple data approach
        updateData.username = null;
        updateData.password = null;
    }
    await db_1.db
        .update(schema_1.users)
        .set(updateData)
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "User updated successfully" }, 200);
};
exports.updateUser = updateUser;
// ✅ Delete User
const deleteUser = async (req, res) => {
    const { id } = req.params;
    const user = await db_1.db
        .select()
        .from(schema_1.users)
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
        .limit(1);
    if (user.length === 0) {
        throw new NotFound_1.NotFound("User not found");
    }
    await db_1.db.delete(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "User deleted successfully" }, 200);
};
exports.deleteUser = deleteUser;
// ✅ Get Users Selection
const getUsersSelection = async (req, res) => {
    const { role } = req.query;
    const conditions = [];
    if (role && typeof role === "string") {
        conditions.push((0, drizzle_orm_1.eq)(schema_1.users.role, role));
    }
    const userList = await db_1.db
        .select({
        id: schema_1.users.id,
        name: schema_1.users.name,
        role: schema_1.users.role,
    })
        .from(schema_1.users)
        .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined)
        .orderBy(schema_1.users.name);
    return (0, response_1.SuccessResponse)(res, { users: userList }, 200);
};
exports.getUsersSelection = getUsersSelection;
