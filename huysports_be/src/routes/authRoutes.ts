import { Router } from "express";
import {
  register,
  login,
  getMe,
  changePassword,
  getUsers,
  updateUserRole,
  toggleUserStatus,
} from "../controllers/authController.js";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Authenticated user profile routes
router.get("/me", authenticate, getMe);
router.post("/change-password", authenticate, changePassword);

// Admin-only User & Staff Management routes
router.get("/users", authenticate, authorizeRoles("ADMIN"), getUsers);
router.patch("/users/:id/role", authenticate, authorizeRoles("ADMIN"), updateUserRole);
router.patch("/users/:id/status", authenticate, authorizeRoles("ADMIN"), toggleUserStatus);

export default router;
