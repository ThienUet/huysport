import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/sportx_db",
  vnpay: {
    tmnCode: process.env.VNP_TMN_CODE || "SPORTX01",
    hashSecret: process.env.VNP_HASH_SECRET || "ABCXYZ1234567890SPORTXSECRETKEY",
    url: process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl: process.env.VNP_RETURN_URL || "http://localhost:5173/orders",
  },
};
