import { Request, Response } from "express";
import { db } from "../db/store.js";
import { Customer } from "../types/index.js";

export class CustomerController {
  public static getAll(req: Request, res: Response) {
    let customers = db.getCustomers();
    const { search, tier, status } = req.query;

    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
      );
    }

    if (tier && typeof tier === "string" && tier !== "all") {
      customers = customers.filter((c) => c.tier.toLowerCase() === tier.toLowerCase());
    }

    if (status && typeof status === "string" && status !== "all") {
      customers = customers.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }

    res.json({
      success: true,
      data: customers,
      total: customers.length,
    });
  }

  public static getById(req: Request, res: Response) {
    const { id } = req.params;
    const customer = db.getCustomerById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.json({ success: true, data: customer });
  }

  public static updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["Active", "Blocked"].includes(status)) {
      return res.status(400).json({ success: false, message: "Valid status is 'Active' or 'Blocked'" });
    }

    const updated = db.updateCustomer(id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.json({
      success: true,
      message: `Customer status updated to ${status}`,
      data: updated,
    });
  }

  public static update(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body;
    const updated = db.updateCustomer(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.json({
      success: true,
      message: "Customer profile updated successfully",
      data: updated,
    });
  }
}
