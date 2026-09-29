import { Request, Response } from "express";
import { db } from "../db/store.js";
import { Order } from "../types/index.js";

export class OrderController {
  public static getAll(req: Request, res: Response) {
    let orders = db.getOrders();
    const { status, search, paymentMethod } = req.query;

    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.customer.phone.toLowerCase().includes(q)
      );
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
    const order = db.getOrderById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: order });
  }

  public static create(req: Request, res: Response) {
    const { customer, items, totalAmount, paymentMethod = "COD", note } = req.body;

    if (!customer || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required order fields: customer, items, totalAmount",
      });
    }

    const orderNumber = `SPX-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      dateTime: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + ` • ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
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
      totalAmount: Number(totalAmount),
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Unpaid" : "Paid",
      fulfillmentStatus: "Processing",
      note,
      createdAt: new Date().toISOString(),
      transactionDetails:
        paymentMethod === "VNPAY"
          ? {
              gateway: "VNPAY",
              transactionCode: `VNP${Date.now()}`,
              timestamp: new Date().toISOString(),
              bankCode: "NCB / VNPAY-QR",
              responseMessage: "00 (Transaction Successful)",
            }
          : paymentMethod === "MoMo"
          ? {
              gateway: "MoMo",
              transactionCode: `MM${Date.now()}`,
              timestamp: new Date().toISOString(),
              bankCode: "MOMO_WALLET",
              responseMessage: "Success",
            }
          : undefined,
    };

    const created = db.addOrder(newOrder);

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

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: created,
    });
  }

  public static updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { fulfillmentStatus, paymentStatus, transactionDetails } = req.body;

    const existing = db.getOrderById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const updates: Partial<Order> = {};
    if (fulfillmentStatus) updates.fulfillmentStatus = fulfillmentStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (transactionDetails) updates.transactionDetails = transactionDetails;

    const updated = db.updateOrder(id, updates);
    res.json({
      success: true,
      message: "Order status updated successfully",
      data: updated,
    });
  }
}
