import { Request, Response } from "express";
import { db } from "../db/store.js";
import { SizeEngine } from "../engine/sizeEngine.js";
import { FAQEngine } from "../engine/faqEngine.js";
import { SizeRule, FAQItem, ChatSession, ChatMessage } from "../types/index.js";

export class ChatbotController {
  // --- Size Rules ---
  public static getSizeRules(req: Request, res: Response) {
    const rules = db.getSizeRules();
    res.json({ success: true, data: rules, total: rules.length });
  }

  public static createSizeRule(req: Request, res: Response) {
    const { ruleCode, category, heightMin, heightMax, weightMin, weightMax, gender, suggestedSize, fitType, status, note } = req.body;

    if (!ruleCode || !suggestedSize || !heightMin || !heightMax) {
      return res.status(400).json({ success: false, message: "Missing required fields for size rule" });
    }

    const newRule: SizeRule = {
      id: `r-${Date.now()}`,
      ruleCode,
      category: category || "Apparel",
      heightMin: Number(heightMin),
      heightMax: Number(heightMax),
      weightMin: Number(weightMin),
      weightMax: Number(weightMax),
      gender: gender || "Unisex",
      suggestedSize,
      fitType: fitType || "Regular Fit",
      status: status || "Active",
      note,
    };

    const created = db.addSizeRule(newRule);
    res.status(201).json({ success: true, message: "Size rule created", data: created });
  }

  public static updateSizeRule(req: Request, res: Response) {
    const { id } = req.params;
    const updated = db.updateSizeRule(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Size rule not found" });
    }
    res.json({ success: true, message: "Size rule updated", data: updated });
  }

  public static deleteSizeRule(req: Request, res: Response) {
    const { id } = req.params;
    const deleted = db.deleteSizeRule(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Size rule not found" });
    }
    res.json({ success: true, message: "Size rule deleted" });
  }

  // --- FAQs ---
  public static getFAQs(req: Request, res: Response) {
    const faqs = db.getFAQs();
    res.json({ success: true, data: faqs, total: faqs.length });
  }

  public static createFAQ(req: Request, res: Response) {
    const { question, answer, intent, confidence, keywords } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: "Question and Answer are required" });
    }

    const newFAQ: FAQItem = {
      id: `faq-${Date.now()}`,
      question,
      answer,
      intent: intent || "General Inquiry",
      confidence: confidence ? Number(confidence) : 0.95,
      usageCount: 0,
      keywords: keywords || [],
    };

    const created = db.addFAQ(newFAQ);
    res.status(201).json({ success: true, message: "FAQ created", data: created });
  }

  public static updateFAQ(req: Request, res: Response) {
    const { id } = req.params;
    const updated = db.updateFAQ(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }
    res.json({ success: true, message: "FAQ updated", data: updated });
  }

  public static deleteFAQ(req: Request, res: Response) {
    const { id } = req.params;
    const deleted = db.deleteFAQ(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }
    res.json({ success: true, message: "FAQ deleted" });
  }

  // --- Size Recommendation Engine ---
  public static recommendSize(req: Request, res: Response) {
    const { height, weight, gender, category, fitPreference } = req.body;
    if (!height || !weight) {
      return res.status(400).json({ success: false, message: "Height (cm) and Weight (kg) are required" });
    }

    const result = SizeEngine.recommendSize({
      height: Number(height),
      weight: Number(weight),
      gender,
      category,
      fitPreference,
    });

    res.json({ success: true, data: result });
  }

  // --- Natural Language Chatbot Processor ---
  public static processMessage(req: Request, res: Response) {
    const { message, sessionId } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    const result = FAQEngine.processMessage(message);

    // If a session ID is provided, record the message and response
    if (sessionId) {
      const session = db.getChatSessionById(sessionId);
      if (session) {
        const userMsg: ChatMessage = {
          id: `m-${Date.now()}-user`,
          sender: "user",
          text: message,
          timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        };
        const botMsg: ChatMessage = {
          id: `m-${Date.now()}-bot`,
          sender: "bot",
          text: result.replyText,
          timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          productCard: result.suggestedProduct,
        };

        db.updateChatSession(sessionId, {
          lastMessage: result.replyText,
          status: result.suggestedProduct ? "Product Recommended" : "Bot Resolved",
          messages: [...session.messages, userMsg, botMsg],
        });
      }
    }

    res.json({
      success: true,
      data: result,
    });
  }

  // --- Chat Sessions ---
  public static getSessions(req: Request, res: Response) {
    const sessions = db.getChatSessions();
    res.json({ success: true, data: sessions, total: sessions.length });
  }

  public static getSessionById(req: Request, res: Response) {
    const { id } = req.params;
    const session = db.getChatSessionById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Chat session not found" });
    }
    res.json({ success: true, data: session });
  }
}
