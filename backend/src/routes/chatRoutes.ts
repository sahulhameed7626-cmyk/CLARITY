import { Router } from 'express';
import { handleChatMessage, getUserConversations, getConversationById } from '../controllers/chatController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.post('/', handleChatMessage);
router.get('/conversations', getUserConversations);
router.get('/conversations/:id', getConversationById);

export default router;
