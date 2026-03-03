import { authenticated } from "../../middlewares/authenticated";
import { authorizeRoles } from "../../middlewares/authorized";
import { catchAsync } from "../../utils/catchAsync";
import AuthRoute from "./auth";
import rolesRouter from "./roles";
import adminRouter from "./admin";
import busRouter from "./bus";

import { Router } from "express";
const route = Router();
route.use("/auth", catchAsync(AuthRoute));
route.use(authenticated, authorizeRoles("admin", "organizer"));
route.use("/roles", catchAsync(rolesRouter));
route.use("/admins", catchAsync(adminRouter));
route.use("/buses", catchAsync(busRouter));

export default route;
