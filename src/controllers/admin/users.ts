import { Request, Response } from "express";
import { db } from "../../models/db";
import { garages, users } from "../../models/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors/NotFound";
import { BadRequest } from "../../Errors/BadRequest";
import { saveBase64Image } from "../../utils/handleImages";
import { deletePhotoFromServer } from "../../utils/deleteImage";
import bcrypt from "bcrypt";

// ✅ Create User
export const createUser = async (req: Request, res: Response) => {
    const { name, phone, avatar, role, hasAccount, username, password, garageId } = req.body;

    if (!name) throw new BadRequest("name is required");
    if (!phone) throw new BadRequest("phone is required");
    if (!role) throw new BadRequest("role is required");

    let finalUsername = null;
    let hashedPassword = null;

    if (hasAccount) {
        if (!username) throw new BadRequest("username is required when hasAccount is true");
        if (!password) throw new BadRequest("password is required when hasAccount is true");

        // Check if username is already taken
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

        if (existingUser.length > 0) {
            throw new BadRequest("Username already exists");
        }

        finalUsername = username;
        hashedPassword = await bcrypt.hash(password, 10);
    }

    let avatarUrl = null;
    if (avatar) {
        const result = await saveBase64Image(req, avatar, "users/avatars");
        avatarUrl = result.url;
    }

    await db.insert(users).values({
        name,
        phone,
        avatar: avatarUrl,
        role,
        hasAccount: hasAccount || false,
        username: finalUsername,
        password: hashedPassword,
        garageId: garageId || null,
    });

    return SuccessResponse(res, { message: "User created successfully" }, 201);
};

// ✅ Get All Users
export const getUsers = async (req: Request, res: Response) => {
    const userList = await db
        .select({
            id: users.id,
            name: users.name,
            phone: users.phone,
            avatar: users.avatar,
            role: users.role,
            hasAccount: users.hasAccount,
            username: users.username,
            status: users.status,
            createdAt: users.createdAt,
            garageId: users.garageId,
        })
        .from(users)
        .orderBy(desc(users.createdAt));

    return SuccessResponse(res, { users: userList }, 200);
};

// ✅ Get User By ID
export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await db
        .select({
            id: users.id,
            name: users.name,
            phone: users.phone,
            avatar: users.avatar,
            role: users.role,
            hasAccount: users.hasAccount,
            username: users.username,
            status: users.status,
            createdAt: users.createdAt,
            garageId: users.garageId,
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

    if (user.length === 0) {
        throw new NotFound("User not found");
    }

    return SuccessResponse(res, { user: user[0] }, 200);
};

// ✅ Update User
export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, phone, avatar, role, hasAccount, username, password, status, garageId } = req.body;

    const user = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

    if (user.length === 0) {
        throw new NotFound("User not found");
    }

    const updateData: any = {
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
            await deletePhotoFromServer(user[0].avatar);
        }
        const result = await saveBase64Image(req, avatar, "users/avatars");
        updateData.avatar = result.url;
    }

    if (updateData.hasAccount) {
        // If it has account, make sure username exists (either passed or already set)
        const finalUsername = username || user[0].username;
        if (!finalUsername) {
            throw new BadRequest("username is required to enable an account");
        }

        // Check duplicate username if being updated
        if (username && username !== user[0].username) {
            const existingUser = await db
                .select()
                .from(users)
                .where(and(eq(users.username, username), ne(users.id, id)))
                .limit(1);

            if (existingUser.length > 0) {
                throw new BadRequest("Username already exists");
            }
        }

        updateData.username = finalUsername;

        // Optional password update
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
    } else {
        // If hasAccount is false, clear out login details to enforce simple data approach
        updateData.username = null;
        updateData.password = null;
    }

    await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id));

    return SuccessResponse(res, { message: "User updated successfully" }, 200);
};

// ✅ Delete User
export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

    if (user.length === 0) {
        throw new NotFound("User not found");
    }

    await db.delete(users).where(eq(users.id, id));

    return SuccessResponse(res, { message: "User deleted successfully" }, 200);
};

// ✅ Get Users Selection
export const getUsersSelection = async (req: Request, res: Response) => {
    const { role } = req.query;

    const conditions = [];
    if (role && typeof role === "string") {
        conditions.push(eq(users.role, role as any));
    }

    const userList = await db
        .select({
            id: users.id,
            name: users.name,
            role: users.role,
        })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(users.name);

    return SuccessResponse(res, { users: userList }, 200);
};


export const selectgarages = async (req: Request, res: Response) => {
    const garagesList = await db
        .select({
            id: garages.id,
            name: garages.name,
        })
        .from(garages);

    return SuccessResponse(res, { garages: garagesList }, 200);
};