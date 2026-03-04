import { authenticated } from "../../middlewares/authenticated";
import { authorizeRoles } from "../../middlewares/authorized";
import { catchAsync } from "../../utils/catchAsync";
import AuthRoute from "./auth";
import rolesRouter from "./roles";
import busTypesRouter from "./busTypes";
import adminRouter from "./admin";
import busRouter from "./bus";
import cityRouter from "./city";
import zoneRouter from "./zone";
import maintenanceTypesRouter from "./maintenanceTypes";
import maintenancesRouter from "./maintenances";

import { Router } from "express";
const route = Router();
route.use("/auth", catchAsync(AuthRoute));
route.use(authenticated, authorizeRoles("admin", "superadmin"));
route.use("/roles", catchAsync(rolesRouter));
route.use("/admins", catchAsync(adminRouter));
route.use("/buses", catchAsync(busRouter));
route.use("/busTypes", catchAsync(busTypesRouter));
route.use("/maintenanceTypes", catchAsync(maintenanceTypesRouter));
route.use("/maintenances", catchAsync(maintenancesRouter));
route.use("/cities", catchAsync(cityRouter));
route.use("/zones", catchAsync(zoneRouter));

export default route;
