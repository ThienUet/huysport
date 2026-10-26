import { Router } from "express";
import { PaymentController } from "../controllers/paymentController.js";

const router = Router();

router.post("/vnpay/create-url", PaymentController.createVNPayUrl);
router.get("/vnpay/callback", PaymentController.vnpayCallback);
router.get("/vnpay/ipn", PaymentController.vnpayIpn);

export default router;
