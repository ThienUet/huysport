import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Determine images folder at HuyHung/images with 3 subdirectories: avatars, products, thumbnails
const resolveImagesDir = () => {
  const current = process.cwd();
  const base = path.basename(current).toLowerCase();

  let root: string;
  if (process.env.IMAGES_DIR) {
    root = path.resolve(process.env.IMAGES_DIR);
  } else if (base === "huysports_be") {
    // Current is e:\USER\Desktop\HuyHung\huysports_be => .. is HuyHung => HuyHung/images
    root = path.resolve(current, "..", "images");
  } else if (base === "huyhung") {
    root = path.resolve(current, "images");
  } else {
    root = path.resolve(current, "images");
  }

  const avatars = path.join(root, "avatars");
  const products = path.join(root, "products");
  const thumbnails = path.join(root, "thumbnails");
  const thumbnailSingular = path.join(root, "thumbnail");

  [root, avatars, products, thumbnails, thumbnailSingular].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (e) {
        console.warn(`Could not create directory ${dir}:`, e);
      }
    }
  });

  return { root, avatars, products, thumbnails };
};

export const imagesPaths = resolveImagesDir();
export const imagesDir = imagesPaths.root;
export const uploadsDir = imagesPaths.root; // Alias for backward compatibility

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/sportx_db",
  imagesDir,
  uploadsDir,
  vnpay: {
    tmnCode: process.env.VNP_TMN_CODE || "SPORTX01",
    hashSecret: process.env.VNP_HASH_SECRET || "ABCXYZ1234567890SPORTXSECRETKEY",
    url: process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl: process.env.VNP_RETURN_URL || "http://localhost:5173/orders",
  },
};
