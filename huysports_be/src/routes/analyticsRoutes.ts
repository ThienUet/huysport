import { Router } from "express";
import { AnalyticsController } from "../controllers/analyticsController.js";

const router = Router();

router.get("/reports", AnalyticsController.getReports);

export default router;
