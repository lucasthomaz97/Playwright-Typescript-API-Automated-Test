import { Router, Request, Response } from 'express';
import { query } from '../db';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateId } from '../middleware/validateId';
import { validateOrderPost, validateOrderPut } from '../utils/validators';
import { buildUpdateQuery } from '../utils/queryBuilder';
import { handlePgError } from '../utils/pgErrorHandler';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const result = await query(
    `SELECT orders.*, users.name AS user_name, users.email AS user_email,
            products.name AS product_name, products.price AS product_price
     FROM orders
     JOIN users ON orders.user_id = users.id
     JOIN products ON orders.product_id = products.id
     ORDER BY orders.id`
  );
  res.json(result.rows);
}));

router.get('/:id', validateId('order', true), asyncHandler(async (req: Request, res: Response) => {
  const result = await query(
    `SELECT orders.*, users.name AS user_name, users.email AS user_email,
            products.name AS product_name, products.price AS product_price
     FROM orders
     JOIN users ON orders.user_id = users.id
     JOIN products ON orders.product_id = products.id
     WHERE orders.id = $1`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json(result.rows[0]);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  if (!validateOrderPost(req.body, res)) return;

  const { user_id, product_id, quantity, total } = req.body;

  try {
    const userResult = await query('SELECT id FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      res.status(400).json({ error: 'User not found' });
      return;
    }

    const productResult = await query('SELECT id FROM products WHERE id = $1', [product_id]);
    if (productResult.rows.length === 0) {
      res.status(400).json({ error: 'Product not found' });
      return;
    }

    const result = await query(
      'INSERT INTO orders (user_id, product_id, quantity, total) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, product_id, quantity, total]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    handlePgError(err, res, 'creating order');
  }
}));

router.put('/:id', validateId('order', false), asyncHandler(async (req: Request, res: Response) => {
  if (!validateOrderPut(req.body, res)) return;

  const { user_id, product_id, quantity, total } = req.body;
  const { sql, params } = buildUpdateQuery('orders', req.params.id as string, { user_id, product_id, quantity, total });

  try {
    if (user_id !== undefined) {
      const userResult = await query('SELECT id FROM users WHERE id = $1', [user_id]);
      if (userResult.rows.length === 0) {
        res.status(400).json({ error: 'User not found' });
        return;
      }
    }

    if (product_id !== undefined) {
      const productResult = await query('SELECT id FROM products WHERE id = $1', [product_id]);
      if (productResult.rows.length === 0) {
        res.status(400).json({ error: 'Product not found' });
        return;
      }
    }

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err: unknown) {
    handlePgError(err, res, 'updating order');
  }
}));

router.delete('/:id', validateId('order', true), asyncHandler(async (req: Request, res: Response) => {
  const result = await query('DELETE FROM orders WHERE id = $1 RETURNING *', [req.params.id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json({ message: 'Order deleted', order: result.rows[0] });
}));

export default router;
