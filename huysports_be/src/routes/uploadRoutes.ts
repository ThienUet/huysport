import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { imagesDir } from "../config/index.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { image, filename, type = "products", folder } = req.body;
    if (!image || typeof image !== "string") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp dữ liệu hình ảnh (base64 hoặc URL)",
      });
    }

    // If it's already an HTTP / HTTPS URL, just return it
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return res.json({ success: true, url: image });
    }

    // Handle base64 data URL
    const match = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Định dạng ảnh Base64 không hợp lệ",
      });
    }

    let ext = match[1].toLowerCase();
    if (ext === "jpeg") ext = "jpg";
    if (ext === "svg+xml") ext = "svg";

    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Determine target subfolder: avatars, products, or thumbnails
    const normalizedType = String(folder || type || "products").toLowerCase().trim();
    let subfolder = "products";
    if (normalizedType.includes("avatar")) {
      subfolder = "avatars";
    } else if (normalizedType.includes("thumb")) {
      subfolder = "thumbnails";
    } else {
      subfolder = "products";
    }

    const targetDir = path.join(imagesDir, subfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const safeName = filename
      ? `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      : `${uuidv4()}.${ext}`;

    const filePath = path.join(targetDir, safeName);
    fs.writeFileSync(filePath, buffer);

    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.get("host") || "localhost:5000";
    const fileUrl = `${protocol}://${host}/images/${subfolder}/${safeName}`;
    const relativeUrl = `/images/${subfolder}/${safeName}`;

    return res.json({
      success: true,
      message: `Tải ảnh vào thư mục ${subfolder} thành công`,
      url: fileUrl,
      relativeUrl,
      subfolder,
      filename: safeName,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi tải ảnh lên máy chủ",
    });
  }
});

export default router;
