import { Router } from "express";
import { MarketingController } from "../controllers/marketingController.js";

const router = Router();

// Root routes when mounted at /api/coupons or /api/marketing
router.get("/", MarketingController.getCoupons);
router.post("/", MarketingController.createCoupon);
router.put("/:id", MarketingController.updateCoupon);
router.delete("/:id", MarketingController.deleteCoupon);
router.post("/apply", MarketingController.applyCoupon);

// Subroutes when mounted at /api/marketing/coupons
router.get("/coupons", MarketingController.getCoupons);
router.post("/coupons", MarketingController.createCoupon);
router.put("/coupons/:id", MarketingController.updateCoupon);
router.delete("/coupons/:id", MarketingController.deleteCoupon);
router.post("/coupons/apply", MarketingController.applyCoupon);

export default router;
