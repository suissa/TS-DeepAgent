import { Router } from 'express';
import { customerController } from '../controllers/customerController';

const router = Router();

router.post('/', (req, res, next) => customerController.register(req, res, next));
router.post('/login', (req, res, next) => customerController.login(req, res, next));
router.get('/:id', (req, res, next) => customerController.getProfile(req, res, next));

export { router as customerRoutes };
