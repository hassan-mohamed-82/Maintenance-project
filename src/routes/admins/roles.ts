import { Router } from "express";
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,   
    deleteRole,
    getAvailablePermissions,
    getAdminPermissions
} from "../../controllers/admin/roles";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
const router = Router();

// ✅ Super Admin Role Routes
router.get("/permissions", catchAsync(getAvailablePermissions));
// ✅ Get All Roles
router.get("/",catchAsync(getAllRoles));
// ✅ Get Role By ID
router.get("/:id",catchAsync(getRoleById));
// ✅ Create Role
router.post("/", catchAsync(createRole));   
// ✅ Update Role
router.put("/:id", catchAsync(updateRole));
// ✅ Delete Role
router.delete("/:id", catchAsync(deleteRole));

export default router;