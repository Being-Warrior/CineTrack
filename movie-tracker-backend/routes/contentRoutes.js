import { Router } from "express";
import {
  addContent,
  updateContent,
  deleteContent,
  getUserContent,
  searchTMDB,
  getOMDBDetails,
  getNews,
} from "../controllers/contentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// ⚠️ specific routes must come before /:id routes
router.get("/search", authMiddleware, searchTMDB);
router.get("/details/:tmdb_id", authMiddleware, getOMDBDetails);
router.get("/news", authMiddleware, getNews);

router.get("/", authMiddleware, getUserContent);
router.post("/", authMiddleware, addContent);
router.patch("/:id", authMiddleware, updateContent);
router.delete("/:id", authMiddleware, deleteContent);

export default router;
