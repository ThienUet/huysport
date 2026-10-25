import { Router } from "express";
import { OrderController } from "../controllers/orderController.js";

const router = Router();

router.get("/", OrderController.getAll);
router.get("/:id", OrderController.getById);
router.post("/", OrderController.create);
router.post("/:id/cancel", OrderController.cancel);
router.post("/:id/return-request", OrderController.requestReturn);
router.put("/:id/return-process", OrderController.processReturn);
router.put("/:id/status", OrderController.updateStatus);

export default router;
