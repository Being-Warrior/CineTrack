import { Router } from 'express';
import {
  addContent,
  updateContent,
  deleteContent,
  getUserContent,
  getNews,
} from '../controllers/contentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/',        authMiddleware, getUserContent);
router.post('/',       authMiddleware, addContent);
router.patch('/:id',   authMiddleware, updateContent);
router.delete('/:id',  authMiddleware, deleteContent);
router.get('/news',    authMiddleware, getNews);

export default router;
