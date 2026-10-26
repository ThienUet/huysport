import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/store.js";
import { User, UserRole, AuthUserResponse } from "../types/index.js";
import { AuthenticatedRequest, JWT_SECRET } from "../middlewares/authMiddleware.js";

function sanitizeUser(user: User): AuthUserResponse {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    status: user.status,
  };
}

function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, phone, role } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ email, mật khẩu và họ tên.",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Mật khẩu phải chứa ít nhất 6 ký tự.",
      });
      return;
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Email này đã được đăng ký trong hệ thống.",
      });
      return;
    }

    const assignedRole: UserRole = role && ["ADMIN", "STAFF", "CUSTOMER"].includes(role) ? role : "STAFF";
    const passwordHash = bcrypt.hashSync(password, 10);

    const newUser: User = {
      id: `usr-${uuidv4().slice(0, 8)}`,
      email: email.trim().toLowerCase(),
      passwordHash,
      fullName: fullName.trim(),
      phone: phone || "",
      role: assignedRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
      status: "Active",
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công!",
      data: {
        user: sanitizeUser(newUser),
        tokens: {
          accessToken: token,
          expiresIn: "7d",
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi trong quá trình đăng ký.",
      error: err.message,
    });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu.",
      });
      return;
    }

    const user = db.getUserByEmail(email.trim());
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác.",
      });
      return;
    }

    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác.",
      });
      return;
    }

    if (user.status === "Blocked") {
      res.status(403).json({
        success: false,
        message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      });
      return;
    }

    db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });
    const token = generateToken(user);

    res.json({
      success: true,
      message: `Đăng nhập thành công! Chào mừng ${user.fullName}`,
      data: {
        user: sanitizeUser(user),
        tokens: {
          accessToken: token,
          expiresIn: "7d",
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi trong quá trình đăng nhập.",
      error: err.message,
    });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Chưa đăng nhập.",
      });
      return;
    }

    res.json({
      success: true,
      data: req.user,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Chưa đăng nhập." });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới." });
      return;
    }

    const user = db.getUserById(req.user.id);
    if (!user || !bcrypt.compareSync(currentPassword, user.passwordHash)) {
      res.status(400).json({ success: false, message: "Mật khẩu hiện tại không chính xác." });
      return;
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10);
    db.updateUser(user.id, { passwordHash });

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công!",
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = db.getUsers().map(sanitizeUser);
    res.json({
      success: true,
      data: users,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["ADMIN", "STAFF", "CUSTOMER"].includes(role)) {
      res.status(400).json({ success: false, message: "Vai trò không hợp lệ." });
      return;
    }

    const updated = db.updateUser(id, { role });
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
      return;
    }

    res.json({
      success: true,
      message: `Đã cập nhật vai trò thành công cho ${updated.fullName}`,
      data: sanitizeUser(updated),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Chưa đăng nhập." });
      return;
    }

    const { fullName, phone, address, avatar } = req.body;
    const updateData: Partial<User> = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updated = db.updateUser(req.user.id, updateData);
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
      return;
    }

    res.json({
      success: true,
      message: "Cập nhật thông tin thành công!",
      data: sanitizeUser(updated),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = db.getUserById(id);
    if (!user) {
      res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
      return;
    }

    const nextStatus: "Active" | "Blocked" = user.status === "Active" ? "Blocked" : "Active";
    const updated = db.updateUser(id, { status: nextStatus });

    res.json({
      success: true,
      message: `Đã chuyển trạng thái tài khoản sang ${nextStatus === "Active" ? "Hoạt động" : "Bị khóa"}`,
      data: updated ? sanitizeUser(updated) : null,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
