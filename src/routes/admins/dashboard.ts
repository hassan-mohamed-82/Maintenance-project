import { Router } from "express";
import { getDashboardStats } from "../../controllers/admin/dashboard";
import { catchAsync } from "../../utils/catchAsync";

const dashboardRouter = Router();

// Route to get dashboard statistics
dashboardRouter.get("/", catchAsync(getDashboardStats));

export default dashboardRouter;
