import app from "./app.js";
import { config } from "./config/index.js";
import { connectMongoDB } from "./db/mongo.js";

const PORT = config.port;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectMongoDB();
  } catch (error: any) {
    console.warn("⚠️ [MongoDB Warning]: Could not connect to MongoDB initially. Will retry in background:", error.message);
  }

  // 2. Start Express Server
  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  🚀 SportX E-Commerce Backend is running!`);
    console.log(`  🔗 Server URL: http://localhost:${PORT}`);
    console.log(`  🩺 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`  🌿 MongoDB Database: sportx_db (Port 27017)`);
    console.log(`  📦 Environment: ${config.nodeEnv}`);
    console.log(`=======================================================`);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully...");
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  });
};

startServer();
