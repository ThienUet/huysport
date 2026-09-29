import { Router } from "express";
import { CustomerController } from "../controllers/customerController.js";

const router = Router();

router.get("/", CustomerController.getAll);
router.get("/:id", CustomerController.getById);
router.put("/:id/status", CustomerController.updateStatus);
router.put("/:id", CustomerController.update);

export default router;
