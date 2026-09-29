import { Router } from "express";
import { DashboardController } from "../controllers/dashboardController.js";

const router = Router();

router.get("/stats", DashboardController.getStats);
router.get("/revenue-chart", DashboardController.getRevenueChart);
router.get("/top-products", DashboardController.getTopProducts);

export default router;
