import { Router } from "express";
import { ChatbotController } from "../controllers/chatbotController.js";

const router = Router();

// Size Rules
router.get("/size-rules", ChatbotController.getSizeRules);
router.post("/size-rules", ChatbotController.createSizeRule);
router.put("/size-rules/:id", ChatbotController.updateSizeRule);
router.delete("/size-rules/:id", ChatbotController.deleteSizeRule);

// FAQs
router.get("/faqs", ChatbotController.getFAQs);
router.post("/faqs", ChatbotController.createFAQ);
router.put("/faqs/:id", ChatbotController.updateFAQ);
router.delete("/faqs/:id", ChatbotController.deleteFAQ);

// AI Size Recommendation & Chat Processor
router.post("/recommend-size", ChatbotController.recommendSize);
router.post("/message", ChatbotController.processMessage);

// Chat Sessions
router.get("/sessions", ChatbotController.getSessions);
router.get("/sessions/:id", ChatbotController.getSessionById);

export default router;
