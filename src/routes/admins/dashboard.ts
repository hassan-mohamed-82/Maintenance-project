import { Router } from "express";
import {
    getDashboardStats,
    getGaragesBusesStats,
    getGarageBusesList,
    getBusCheckinDetails,
    getMaintenanceReports
} from "../../controllers/admin/dashboard";
import { catchAsync } from "../../utils/catchAsync";

const dashboardRouter = Router();

// Route to get dashboard statistics
dashboardRouter.get("/", catchAsync(getDashboardStats));

// Route to get garages and their buses stats
dashboardRouter.get("/garages-stats", catchAsync(getGaragesBusesStats));

// Route to get a list of buses in a specific garage
dashboardRouter.get("/garages/:garageId/buses", catchAsync(getGarageBusesList));

// Route to get check-in details for a specific bus
dashboardRouter.get("/buses/:busId/checkin-details", catchAsync(getBusCheckinDetails));

// Route to get maintenance reports with optional filters
dashboardRouter.get("/reports/maintenance", catchAsync(getMaintenanceReports));

export default dashboardRouter;
