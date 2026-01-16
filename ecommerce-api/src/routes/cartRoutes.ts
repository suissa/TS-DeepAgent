import { Router } from 'express';
import { cartController } from '../controllers/cartController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => cartController.getCart(req, res, next));
router.post('/', (req, res, next) => cartController.addItem(req, res, next));
router.put('/:productId', (req, res, next) => cartController.updateQuantity(req, res, next));
router.delete('/:productId', (req, res, next) => cartController.removeItem(req, res, next));
router.delete('/', (req, res, next) => cartController.clear(req, res, next));

export { router as cartRoutes };
