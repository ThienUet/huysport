import { Router } from "express";
import { OrderController } from "../controllers/orderController.js";

const router = Router();

router.get("/", OrderController.getAll);
router.get("/:id", OrderController.getById);
router.post("/", OrderController.create);
router.put("/:id/status", OrderController.updateStatus);

export default router;
