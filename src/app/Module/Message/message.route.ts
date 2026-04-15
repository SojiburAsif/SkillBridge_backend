import { Router } from 'express';

import { auth, UserRole } from '../../middleware/auth';
import { MessageController } from './message.controller';

const router = Router();

router.post('/', auth(), MessageController.sendMessage);
router.get('/unread-count', auth(), MessageController.getUnreadCount);
router.get('/:userId', auth(), MessageController.getConversation);

export const MessageRoutes = router;
