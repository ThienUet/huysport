import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/store.js";
import { UserRole, AuthUserResponse } from "../types/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "SPORTX_SUPER_SECRET_JWT_KEY_2026_DH";

export interface AuthenticatedRequest extends Request {
  user?: AuthUserResponse;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Không tìm thấy token xác thực. Vui lòng đăng nhập lại.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
    };

    const user = db.getUserById(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Tài khoản không tồn tại hoặc đã bị xóa.",
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

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      status: user.status,
    };

    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn.",
    });
    return;
  }
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Yêu cầu đăng nhập để truy cập tài nguyên này.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: ${allowedRoles.join(", ")}`,
      });
      return;
    }

    next();
  };
};

export { JWT_SECRET };
