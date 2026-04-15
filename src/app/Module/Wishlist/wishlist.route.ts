import { Router } from 'express';
import { WishlistController } from './wishlist.controller';
import { auth, UserRole } from '../../middleware/auth';

const router = Router();

router.post('/toggle', auth(UserRole.STUDENT), WishlistController.toggleWishlist);
router.get('/my', auth(UserRole.STUDENT), WishlistController.getMyWishlist);

export const WishlistRoutes = router;
