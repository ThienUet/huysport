import express from "express";
import cors from "cors";
import morgan from "morgan";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { imagesDir, uploadsDir } from "./config/index.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev"));

// Static media directory at HuyHung/images with subfolders (avatars, products, thumbnails)
app.use("/images", express.static(imagesDir));
app.use("/uploads", express.static(imagesDir)); // backward compatibility

// API Root
app.use("/api", apiRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central Error Handler
app.use(errorHandler);

export default app;
