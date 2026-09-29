import { Request, Response } from "express";
import crypto from "crypto";
import { config } from "../config/index.js";
import { db } from "../db/store.js";

export class PaymentController {
  // Sort an object alphabetically by keys for VNPAY checksum
  private static sortObject(obj: Record<string, any>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const str: string[] = [];
    let key: string;
    for (key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (let i = 0; i < str.length; i++) {
      sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, "+");
    }
    return sorted;
  }

  // Create VNPAY Payment URL
  public static createVNPayUrl(req: Request, res: Response) {
    const { orderId, amount, bankCode, orderInfo, locale = "vn" } = req.body;

    const order = orderId ? db.getOrderById(orderId) : null;
    const finalAmount = amount || (order ? order.totalAmount * 25000 : 500000); // convert USD to VND standard if needed, or in VND
    const orderRef = order ? order.orderNumber : `SPX-${Date.now().toString().slice(-6)}`;

    const date = new Date();
    const createDate =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    const tmnCode = config.vnpay.tmnCode;
    const secretKey = config.vnpay.hashSecret;
    let vnpUrl = config.vnpay.url;
    const returnUrl = config.vnpay.returnUrl;

    let vnp_Params: Record<string, any> = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderRef;
    vnp_Params["vnp_OrderInfo"] = orderInfo || `Thanh toan don hang ${orderRef} tai SportX`;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = Math.round(finalAmount * 100);
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = String(ipAddr);
    vnp_Params["vnp_CreateDate"] = createDate;

    if (bankCode) {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    vnp_Params = PaymentController.sortObject(vnp_Params);

    const querystring = Object.entries(vnp_Params)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");

    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(querystring, "utf-8")).digest("hex");
    vnpUrl += "?" + querystring + "&vnp_SecureHash=" + signed;

    res.json({
      success: true,
      data: {
        paymentUrl: vnpUrl,
        orderRef,
        amount: finalAmount,
      },
    });
  }

  // Handle Return / Callback from VNPAY
  public static vnpayCallback(req: Request, res: Response) {
    let vnp_Params = req.query as Record<string, string>;
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = PaymentController.sortObject(vnp_Params);
    const secretKey = config.vnpay.hashSecret;
    const querystring = Object.entries(vnp_Params)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");

    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(querystring, "utf-8")).digest("hex");

    const isSuccess = vnp_Params["vnp_ResponseCode"] === "00";
    const txnRef = vnp_Params["vnp_TxnRef"];

    // Update order if found
    if (txnRef) {
      const order = db.getOrders().find((o) => o.orderNumber === txnRef);
      if (order && isSuccess) {
        db.updateOrder(order.id, {
          paymentStatus: "Paid",
          fulfillmentStatus: "Processing",
          transactionDetails: {
            gateway: "VNPAY",
            transactionCode: vnp_Params["vnp_TransactionNo"] || `VNP${Date.now()}`,
            timestamp: new Date().toISOString(),
            bankCode: vnp_Params["vnp_BankCode"] || "VNPAY",
            responseMessage: "00 (Transaction Successful)",
          },
        });
      }
    }

    res.json({
      success: true,
      message: isSuccess ? "Giao dịch VNPAY thành công" : "Giao dịch không thành công hoặc bị hủy",
      data: {
        responseCode: vnp_Params["vnp_ResponseCode"],
        txnRef,
        amount: Number(vnp_Params["vnp_Amount"] || 0) / 100,
        bankCode: vnp_Params["vnp_BankCode"],
        isSignatureValid: signed === secureHash,
      },
    });
  }
}
