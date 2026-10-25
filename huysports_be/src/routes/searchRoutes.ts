import { Router } from "express";
import { SearchController } from "../controllers/searchController.js";

const router = Router();

router.get("/", SearchController.globalSearch);

export default router;
