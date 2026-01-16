import { Router } from 'express';
import { productController } from '../controllers/productController';

const router = Router();

router.post('/', (req, res, next) => productController.create(req, res, next));
router.get('/', (req, res, next) => productController.list(req, res, next));
router.get('/:id', (req, res, next) => productController.getById(req, res, next));
router.put('/:id', (req, res, next) => productController.update(req, res, next));
router.delete('/:id', (req, res, next) => productController.delete(req, res, next));

export { router as productRoutes };
