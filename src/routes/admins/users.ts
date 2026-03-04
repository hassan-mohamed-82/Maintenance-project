import { Router } from "express";
import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUsersSelection
} from "../../controllers/admin/users";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";

const router = Router();

// ✅ Create User
router.post("/", catchAsync(createUser));

// ✅ Get All Users Selection
router.get("/selection", catchAsync(getUsersSelection));

// ✅ Get All Users
router.get("/", catchAsync(getUsers));

// ✅ Get User By ID
router.get("/:id", catchAsync(getUserById));

// ✅ Update User
router.put("/:id", catchAsync(updateUser));

// ✅ Delete User
router.delete("/:id", catchAsync(deleteUser));

export default router;
