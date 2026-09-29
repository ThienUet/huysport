import { Request, Response } from "express";
import { db } from "../db/store.js";

export class SettingsController {
  public static get(req: Request, res: Response) {
    const settings = db.getSettings();
    res.json({ success: true, data: settings });
  }

  public static update(req: Request, res: Response) {
    const updates = req.body;
    const updated = db.updateSettings(updates);
    res.json({
      success: true,
      message: "Cài đặt hệ thống đã được cập nhật thành công",
      data: updated,
    });
  }
}
