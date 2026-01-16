import express from 'express';
import { productRoutes } from './routes/productRoutes';
import { customerRoutes } from './routes/customerRoutes';
import { orderRoutes } from './routes/orderRoutes';
import { cartRoutes } from './routes/cartRoutes';
import { errorHandler } from './middleware/errorMiddleware';
import { initializeDatabase, seedDatabase, closeDb } from './database/schema';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

app.use(errorHandler);

async function start() {
  await initializeDatabase();

  if (process.env.NODE_ENV !== 'test') {
    seedDatabase();
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  process.on('SIGINT', () => {
    console.log('Shutting down...');
    closeDb();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

start().catch(console.error);

export { app };
