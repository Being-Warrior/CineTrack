import { Router } from 'express';
import {
  addOrUpdate,
  getUserList,
  updateEntry,
  removeEntry,
} from '../controllers/userContentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, getUserList);
router.post('/', authMiddleware, addOrUpdate);
router.patch('/:id', authMiddleware, updateEntry);
router.delete('/:id', authMiddleware, removeEntry);

export default router;
