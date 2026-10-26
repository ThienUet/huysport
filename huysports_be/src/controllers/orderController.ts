import { Request, Response } from "express";
import { db } from "../db/store.js";
import { Order } from "../types/index.js";
import { formatDateTime } from "../utils/formatUtils.js";
import { PaymentController } from "./paymentController.js";

export class OrderController {
  public static getAll(req: Request, res: Response) {
    let orders = db.getOrders();
    const { status, search, paymentMethod } = req.query;

    if (search && typeof search === "string") {
      const rawQ = search.trim().toLowerCase();
      const cleanQ = rawQ.replace(/^#/, "");
      orders = orders.filter((o) => {
        const rawOrderNum = o.orderNumber.toLowerCase();
        const cleanOrderNum = rawOrderNum.replace(/^#/, "");
        return (
          rawOrderNum.includes(rawQ) ||
          cleanOrderNum.includes(cleanQ) ||
          rawOrderNum.includes(cleanQ) ||
          o.customer.name.toLowerCase().includes(rawQ) ||
          o.customer.email.toLowerCase().includes(rawQ) ||
          o.customer.phone.toLowerCase().includes(cleanQ)
        );
      });
    }

    if (status && typeof status === "string" && status !== "all") {
      if (status === "pending_approval") {
        orders = orders.filter((o) => o.fulfillmentStatus === "Pending Approval");
      } else if (status === "paid") {
        orders = orders.filter((o) => o.paymentStatus === "Paid");
      } else if (status === "shipping") {
        orders = orders.filter((o) => o.fulfillmentStatus === "Shipping");
      } else if (status === "completed") {
        orders = orders.filter((o) => o.fulfillmentStatus === "Completed");
      } else if (status === "canceled") {
        orders = orders.filter((o) => o.fulfillmentStatus === "Canceled");
      } else {
        orders = orders.filter(
          (o) =>
            o.fulfillmentStatus.toLowerCase().replace(/\s+/g, "_") === status.toLowerCase() ||
            o.paymentStatus.toLowerCase() === status.toLowerCase()
        );
      }
    }

    if (paymentMethod && typeof paymentMethod === "string" && paymentMethod !== "all") {
      orders = orders.filter((o) => o.paymentMethod.toLowerCase() === paymentMethod.toLowerCase());
    }

    res.json({
      success: true,
      data: orders,
      total: orders.length,
    });
  }

  public static getById(req: Request, res: Response) {
    const { id } = req.params;
    const cleanId = id.replace(/^#/, "").toUpperCase();
    const order =
      db.getOrderById(id) ||
      db.getOrders().find((o) => {
        const cleanOrderNumber = o.orderNumber.replace(/^#/, "").toUpperCase();
        return cleanOrderNumber === cleanId || o.id === id || o.orderNumber.toUpperCase() === id.toUpperCase();
      });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: order });
  }

  public static create(req: Request, res: Response) {
    const {
      customer,
      items,
      totalAmount,
      paymentMethod = "COD",
      note,
      subtotal,
      shippingFee,
      discountAmount,
      couponCode,
    } = req.body;

    if (!customer || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required order fields: customer, items, totalAmount",
      });
    }

    // 1. Validate stock availability for all items before placing the order
    for (const item of items) {
      const product =
        db.getProductById(item.id) ||
        db.getProducts().find(
          (p) =>
            p.sku === item.sku ||
            p.variants?.some((v) => v.sku === item.sku) ||
            p.title.toLowerCase() === (item.name || "").toLowerCase()
        );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${item.name}" không tồn tại hoặc đã ngừng kinh doanh.`,
        });
      }

      const itemQty = Number(item.qty || 1);
      if (itemQty <= 0) {
        return res.status(400).json({
          success: false,
          message: `Số lượng đặt mua cho sản phẩm "${item.name}" không hợp lệ.`,
        });
      }

      if (product.variants && product.variants.length > 0) {
        const variant =
          product.variants.find((v) => item.sku && v.sku === item.sku) ||
          product.variants.find(
            (v) =>
              item.size &&
              v.size.toLowerCase() === item.size.toLowerCase() &&
              item.color &&
              v.color.toLowerCase() === item.color.toLowerCase()
          ) ||
          product.variants.find((v) => item.size && v.size.toLowerCase() === item.size.toLowerCase()) ||
          product.variants[0];

        if (variant) {
          if (variant.stock < itemQty) {
            return res.status(400).json({
              success: false,
              message: `Sản phẩm "${product.title}" (${variant.color ? `màu ${variant.color}, ` : ""}size ${variant.size}) chỉ còn ${variant.stock} cái trong kho (bạn đang đặt ${itemQty} cái).`,
            });
          }
        } else if (product.totalStock < itemQty) {
          return res.status(400).json({
            success: false,
            message: `Sản phẩm "${product.title}" chỉ còn ${product.totalStock} cái trong kho.`,
          });
        }
      } else if (product.totalStock < itemQty) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${product.title}" chỉ còn ${product.totalStock} cái trong kho.`,
        });
      }
    }

    // 2. Deduct stock from inventory
    for (const item of items) {
      const product =
        db.getProductById(item.id) ||
        db.getProducts().find(
          (p) =>
            p.sku === item.sku ||
            p.variants?.some((v) => v.sku === item.sku) ||
            p.title.toLowerCase() === (item.name || "").toLowerCase()
        );

      if (product) {
        const itemQty = Number(item.qty || 1);
        if (product.variants && product.variants.length > 0) {
          let variantIndex = product.variants.findIndex((v) => item.sku && v.sku === item.sku);
          if (variantIndex === -1) {
            variantIndex = product.variants.findIndex(
              (v) =>
                item.size &&
                v.size.toLowerCase() === item.size.toLowerCase() &&
                item.color &&
                v.color.toLowerCase() === item.color.toLowerCase()
            );
          }
          if (variantIndex === -1) {
            variantIndex = product.variants.findIndex(
              (v) => item.size && v.size.toLowerCase() === item.size.toLowerCase()
            );
          }
          if (variantIndex === -1) {
            variantIndex = 0;
          }

          if (variantIndex !== -1 && product.variants[variantIndex]) {
            product.variants[variantIndex].stock = Math.max(
              0,
              product.variants[variantIndex].stock - itemQty
            );
          }
          product.totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        } else {
          product.totalStock = Math.max(0, product.totalStock - itemQty);
        }

        db.updateProduct(product.id, {
          variants: product.variants,
          totalStock: product.totalStock,
        });
      }
    }

    const orderNumber = `SPX-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      dateTime: formatDateTime(new Date()),
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        avatar: customer.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        address: customer.address || customer.shippingAddress || "Vietnam",
      },
      items,
      subtotal: subtotal ? Number(subtotal) : undefined,
      shippingFee: typeof shippingFee === "number" ? Number(shippingFee) : undefined,
      discountAmount: discountAmount ? Number(discountAmount) : undefined,
      couponCode: couponCode ? String(couponCode).trim().toUpperCase() : undefined,
      totalAmount: Number(totalAmount),
      paymentMethod,
      paymentStatus: "Unpaid",
      fulfillmentStatus: "Pending Approval",
      note,
      createdAt: new Date().toISOString(),
      transactionDetails: undefined,
    };

    const created = db.addOrder(newOrder);

    // Increment coupon usage count if a coupon was used
    if (couponCode) {
      const cleanCode = String(couponCode).trim().toUpperCase();
      const appliedCoupon = db.getCoupons().find((c) => c.code.toUpperCase() === cleanCode);
      if (appliedCoupon) {
        db.updateCoupon(appliedCoupon.id, {
          usedCount: (appliedCoupon.usedCount || 0) + 1,
        });
      }
    }

    // Update customer spending & order count if customer exists
    if (customer.id) {
      const existingCust = db.getCustomerById(customer.id);
      if (existingCust) {
        db.updateCustomer(customer.id, {
          totalOrders: existingCust.totalOrders + 1,
          lifetimeSpent: existingCust.lifetimeSpent + Number(totalAmount),
          orderHistory: [
            {
              id: created.id,
              orderNumber: created.orderNumber,
              date: created.dateTime,
              itemsSummary: items.map((i: any) => `${i.name} (x${i.qty})`).join(", "),
              totalAmount: Number(totalAmount),
              status: "Processing",
            },
            ...existingCust.orderHistory,
          ],
        });
      }
    }

    // Generate VNPAY payment URL if payment method is VNPAY
    let paymentUrl: string | undefined;
    if (paymentMethod === "VNPAY") {
      const ipAddr =
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        "127.0.0.1";
      paymentUrl = PaymentController.generatePaymentUrl({
        orderNumber: created.orderNumber,
        amount: Number(totalAmount),
        ipAddr: String(ipAddr),
      });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: created,
      paymentUrl,
    });
  }

  public static updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { fulfillmentStatus, paymentStatus, transactionDetails } = req.body;

    const existing = db.getOrderById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const previousStatus = existing.fulfillmentStatus;

    // 1. If transitioning TO Canceled from an active status => RESTORE STOCK
    if (fulfillmentStatus === "Canceled" && previousStatus !== "Canceled") {
      for (const item of existing.items) {
        const product =
          db.getProductById(item.id) ||
          db.getProducts().find(
            (p) =>
              p.sku === (item as any).sku ||
              p.variants?.some((v) => v.sku === (item as any).sku) ||
              p.title.toLowerCase() === item.name.toLowerCase()
          );

        if (product) {
          const itemQty = Number(item.qty || 1);
          if (product.variants && product.variants.length > 0) {
            let variantIndex = product.variants.findIndex((v) => (item as any).sku && v.sku === (item as any).sku);
            if (variantIndex === -1) {
              variantIndex = product.variants.findIndex(
                (v) =>
                  item.size &&
                  v.size.toLowerCase() === item.size.toLowerCase() &&
                  item.color &&
                  v.color.toLowerCase() === item.color.toLowerCase()
              );
            }
            if (variantIndex === -1) {
              variantIndex = product.variants.findIndex(
                (v) => item.size && v.size.toLowerCase() === item.size.toLowerCase()
              );
            }
            if (variantIndex === -1) {
              variantIndex = 0;
            }

            if (variantIndex !== -1 && product.variants[variantIndex]) {
              product.variants[variantIndex].stock += itemQty;
            }
            product.totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
          } else {
            product.totalStock += itemQty;
          }

          db.updateProduct(product.id, {
            variants: product.variants,
            totalStock: product.totalStock,
          });
        }
      }
    }

    // 2. If transitioning FROM Canceled to an active status => RE-DEDUCT STOCK
    if (previousStatus === "Canceled" && fulfillmentStatus && fulfillmentStatus !== "Canceled") {
      for (const item of existing.items) {
        const product =
          db.getProductById(item.id) ||
          db.getProducts().find(
            (p) =>
              p.sku === (item as any).sku ||
              p.variants?.some((v) => v.sku === (item as any).sku) ||
              p.title.toLowerCase() === item.name.toLowerCase()
          );

        if (product) {
          const itemQty = Number(item.qty || 1);
          if (product.variants && product.variants.length > 0) {
            let variantIndex = product.variants.findIndex((v) => (item as any).sku && v.sku === (item as any).sku);
            if (variantIndex === -1) {
              variantIndex = product.variants.findIndex(
                (v) =>
                  item.size &&
                  v.size.toLowerCase() === item.size.toLowerCase() &&
                  item.color &&
                  v.color.toLowerCase() === item.color.toLowerCase()
              );
            }
            if (variantIndex === -1) {
              variantIndex = product.variants.findIndex(
                (v) => item.size && v.size.toLowerCase() === item.size.toLowerCase()
              );
            }
            if (variantIndex === -1) {
              variantIndex = 0;
            }

            if (variantIndex !== -1 && product.variants[variantIndex]) {
              product.variants[variantIndex].stock = Math.max(0, product.variants[variantIndex].stock - itemQty);
            }
            product.totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
          } else {
            product.totalStock = Math.max(0, product.totalStock - itemQty);
          }

          db.updateProduct(product.id, {
            variants: product.variants,
            totalStock: product.totalStock,
          });
        }
      }
    }

    const updates: Partial<Order> = {};
    if (fulfillmentStatus) updates.fulfillmentStatus = fulfillmentStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (transactionDetails) updates.transactionDetails = transactionDetails;

    const {
      shippingCarrier,
      trackingCode,
      cancelReason,
      failedDeliveryAttempts,
    } = req.body;

    if (shippingCarrier) updates.shippingCarrier = shippingCarrier;
    if (trackingCode) updates.trackingCode = trackingCode;
    if (cancelReason) updates.cancelReason = cancelReason;
    if (failedDeliveryAttempts !== undefined) updates.failedDeliveryAttempts = Number(failedDeliveryAttempts);

    // Auto set timestamps and COD status
    if (fulfillmentStatus === "Processing") {
      // Dispatched / warehouse note generated
    } else if (fulfillmentStatus === "Shipping") {
      updates.dispatchedAt = new Date().toISOString();
    } else if (fulfillmentStatus === "Completed") {
      updates.deliveredAt = new Date().toISOString();
      if (existing.paymentMethod === "COD") {
        updates.paymentStatus = "Paid";
      }
    } else if (fulfillmentStatus === "Canceled") {
      updates.cancelledAt = new Date().toISOString();
      if (!updates.cancelReason) {
        updates.cancelReason = cancelReason || "Hủy đơn hàng / Hoàn kho";
      }
    }

    const updated = db.updateOrder(id, updates);
    res.json({
      success: true,
      message: "Order status updated successfully",
      data: updated,
    });
  }

  public static cancel(req: Request, res: Response) {
    const { id } = req.params;
    const { reason, cancelledBy = "customer" } = req.body;

    const cleanId = (id || "").replace(/^#/, "").toUpperCase();
    const order =
      db.getOrderById(id) ||
      db.getOrderById(cleanId) ||
      db.getOrders().find((o) => {
        const cleanOrderNumber = (o.orderNumber || "").replace(/^#/, "").toUpperCase();
        return (
          cleanOrderNumber === cleanId ||
          o.id === id ||
          (o.orderNumber && o.orderNumber.toUpperCase() === id.toUpperCase())
        );
      });

    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    const normStatus = (order.fulfillmentStatus || "").toUpperCase();

    if (normStatus === "CANCELLED" || normStatus === "CANCELED") {
      return res.status(400).json({ success: false, message: "Đơn hàng này đã được hủy trước đó." });
    }

    if (normStatus === "COMPLETED" || normStatus === "DELIVERED") {
      return res.status(400).json({ success: false, message: "Đơn hàng đã giao thành công, không thể hủy." });
    }

    if (normStatus === "SHIPPING") {
      return res.status(400).json({ success: false, message: "Đang giao hàng, bạn không được hủy đơn hàng." });
    }

    // Restore stock for all items
    for (const item of order.items) {
      const product =
        db.getProductById(item.id) ||
        db.getProducts().find(
          (p) =>
            p.sku === (item as any).sku ||
            p.variants?.some((v) => v.sku === (item as any).sku) ||
            p.title.toLowerCase() === item.name.toLowerCase()
        );

      if (product) {
        const itemQty = Number(item.qty || 1);
        if (product.variants && product.variants.length > 0) {
          let variantIndex = product.variants.findIndex((v) => (item as any).sku && v.sku === (item as any).sku);
          if (variantIndex === -1) {
            variantIndex = product.variants.findIndex(
              (v) =>
                item.size &&
                v.size.toLowerCase() === item.size.toLowerCase() &&
                item.color &&
                v.color.toLowerCase() === item.color.toLowerCase()
            );
          }
          if (variantIndex === -1) {
            variantIndex = product.variants.findIndex(
              (v) => item.size && v.size.toLowerCase() === item.size.toLowerCase()
            );
          }
          if (variantIndex === -1) {
            variantIndex = 0;
          }

          if (variantIndex !== -1 && product.variants[variantIndex]) {
            product.variants[variantIndex].stock += itemQty;
          }
          product.totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        } else {
          product.totalStock += itemQty;
        }

        db.updateProduct(product.id, {
          variants: product.variants,
          totalStock: product.totalStock,
        });
      }
    }

    const updated = db.updateOrder(order.id, {
      fulfillmentStatus: "Canceled",
      cancelReason: reason || (cancelledBy === "customer" ? "Khách yêu cầu hủy / Sai thông tin" : "Hủy đơn hàng"),
      cancelledAt: new Date().toISOString(),
      cancelledBy: cancelledBy as "customer" | "admin" | "system",
    });

    res.json({
      success: true,
      message: "Đã hủy đơn hàng và hoàn trả lại số lượng tồn kho thành công.",
      data: updated,
    });
  }

  public static requestReturn(req: Request, res: Response) {
    const { id } = req.params;
    const { reason, detailedReason, bankName, bankAccount, accountHolder, refundAmount } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn lý do hoàn hàng / đổi trả" });
    }

    const cleanId = (id || "").replace(/^#/, "").toUpperCase();
    const order =
      db.getOrderById(id) ||
      db.getOrderById(cleanId) ||
      db.getOrders().find((o) => {
        const cleanOrderNumber = (o.orderNumber || "").replace(/^#/, "").toUpperCase();
        return (
          cleanOrderNumber === cleanId ||
          o.id === id ||
          (o.orderNumber && o.orderNumber.toUpperCase() === id.toUpperCase())
        );
      });

    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng cần yêu cầu hoàn trả" });
    }

    if (order.fulfillmentStatus !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "Chỉ đơn hàng đã giao thành công mới có thể gửi yêu cầu đổi trả / hoàn hàng",
      });
    }

    if (
      order.returnRequest &&
      (order.returnRequest.status === "Pending" || order.returnRequest.status === "Approved")
    ) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng này đã có yêu cầu hoàn trả đang ở trạng thái: ${
          order.returnRequest.status === "Pending" ? "Chờ duyệt" : "Đã duyệt"
        }`,
      });
    }

    const returnRequest = {
      reason,
      detailedReason: detailedReason || "",
      bankName: bankName || "",
      bankAccount: bankAccount || "",
      accountHolder: accountHolder || "",
      refundAmount: Number(refundAmount) || order.totalAmount,
      status: "Pending" as const,
      requestedAt: new Date().toISOString(),
    };

    const updated = db.updateOrder(order.id, {
      returnRequest,
    });

    res.json({
      success: true,
      message: "Đã gửi yêu cầu đổi trả / hoàn hàng thành công! Đội ngũ SportX sẽ liên hệ hỗ trợ bạn sớm nhất.",
      data: updated,
    });
  }

  public static processReturn(req: Request, res: Response) {
    const { id } = req.params;
    const { action, adminNote } = req.body;

    const order =
      db.getOrderById(id) ||
      db.getOrders().find((o) => o.orderNumber.toUpperCase() === id.toUpperCase());

    if (!order || !order.returnRequest) {
      return res.status(404).json({ success: false, message: "Không tìm thấy yêu cầu hoàn trả cho đơn hàng này" });
    }

    const now = new Date().toISOString();

    if (action === "approve") {
      order.returnRequest.status = "Approved";
      order.returnRequest.processedAt = now;
      order.returnRequest.adminNote =
        adminNote ||
        "Yêu cầu hoàn trả đã được duyệt. Quý khách vui lòng đóng gói hàng và gửi về địa chỉ shop để tiến hành kiểm tra & hoàn tiền.";
    } else if (action === "reject") {
      order.returnRequest.status = "Rejected";
      order.returnRequest.processedAt = now;
      order.returnRequest.adminNote =
        adminNote || "Yêu cầu hoàn trả không đáp ứng điều kiện đổi trả của cửa hàng (quá thời hạn hoặc sản phẩm không còn nguyên vẹn).";
    } else if (action === "complete") {
      order.returnRequest.status = "Completed";
      order.returnRequest.completedAt = now;
      order.returnRequest.adminNote =
        adminNote || "Shop đã nhận được kiện hàng hoàn trả, kiểm tra chất lượng đạt yêu cầu và đã hoàn tất hoàn tiền cho khách.";

      // Restore stock for all items
      for (const item of order.items) {
        const product =
          db.getProductById(item.id) ||
          db.getProducts().find(
            (p) =>
              p.sku === (item as any).sku ||
              p.variants?.some((v) => v.sku === (item as any).sku) ||
              p.title.toLowerCase() === item.name.toLowerCase()
          );

        if (product) {
          const itemQty = Number(item.qty || 1);
          if (product.variants && product.variants.length > 0) {
            let variantIndex = product.variants.findIndex((v) => (item as any).sku && v.sku === (item as any).sku);
            if (variantIndex === -1) {
              variantIndex = product.variants.findIndex(
                (v) =>
                  item.size &&
                  v.size.toLowerCase() === item.size.toLowerCase() &&
                  item.color &&
                  v.color.toLowerCase() === item.color.toLowerCase()
              );
            }
            if (variantIndex === -1) {
              variantIndex = product.variants.findIndex(
                (v) => item.size && v.size.toLowerCase() === item.size.toLowerCase()
              );
            }
            if (variantIndex === -1) {
              variantIndex = 0;
            }

            if (variantIndex !== -1 && product.variants[variantIndex]) {
              product.variants[variantIndex].stock += itemQty;
            }
            product.totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
          } else {
            product.totalStock += itemQty;
          }

          db.updateProduct(product.id, {
            variants: product.variants,
            totalStock: product.totalStock,
          });
        }
      }
    } else {
      return res.status(400).json({ success: false, message: "Hành động không hợp lệ: 'approve', 'reject' hoặc 'complete'" });
    }

    const updated = db.updateOrder(order.id, {
      returnRequest: order.returnRequest,
    });

    res.json({
      success: true,
      message:
        action === "approve"
          ? "Đã duyệt yêu cầu hoàn hàng"
          : action === "reject"
          ? "Đã từ chối yêu cầu hoàn hàng"
          : "Đã xác nhận nhận hàng hoàn & hoàn kho sản phẩm thành công",
      data: updated,
    });
  }
}
