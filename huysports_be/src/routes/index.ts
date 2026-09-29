import { Router } from "express";
import dashboardRoutes from "./dashboardRoutes.js";
import productRoutes from "./productRoutes.js";
import orderRoutes from "./orderRoutes.js";
import customerRoutes from "./customerRoutes.js";
import chatbotRoutes from "./chatbotRoutes.js";
import marketingRoutes from "./marketingRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import authRoutes from "./authRoutes.js";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/dashboard", dashboardRoutes);
apiRouter.use("/products", productRoutes);
apiRouter.use("/orders", orderRoutes);
apiRouter.use("/customers", customerRoutes);
apiRouter.use("/chatbot", chatbotRoutes);
apiRouter.use("/marketing", marketingRoutes);
apiRouter.use("/coupons", marketingRoutes);
apiRouter.use("/analytics", analyticsRoutes);
apiRouter.use("/settings", settingsRoutes);
apiRouter.use("/payment", paymentRoutes);

// Health check endpoint
apiRouter.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "SportX E-Commerce API is running smoothly",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default apiRouter;
