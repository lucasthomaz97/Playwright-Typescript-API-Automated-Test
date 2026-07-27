import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const result = await query(
    `SELECT orders.*, users.name AS user_name, users.email AS user_email,
            products.name AS product_name, products.price AS product_price
     FROM orders
     JOIN users ON orders.user_id = users.id
     JOIN products ON orders.product_id = products.id
     ORDER BY orders.id`
  );
  res.json(result.rows);
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (id === undefined || isNaN(Number(id)) || Number(id) < 0 || id === '' || id.includes('.')) {
    res.status(400).json({ error: 'Invalid order ID' });
    return;
  }

  const result = await query(
    `SELECT orders.*, users.name AS user_name, users.email AS user_email,
            products.name AS product_name, products.price AS product_price
     FROM orders
     JOIN users ON orders.user_id = users.id
     JOIN products ON orders.product_id = products.id
     WHERE orders.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json(result.rows[0]);
});

router.post('/', async (req: Request, res: Response) => {
  const { user_id, product_id, quantity, total } = req.body;

  if (user_id === undefined || user_id === null) {
    res.status(400).json({ error: 'user_id is required' });
    return;
  }

  if (product_id === undefined || product_id === null) {
    res.status(400).json({ error: 'product_id is required' });
    return;
  }

  if (quantity === undefined || quantity === null) {
    res.status(400).json({ error: 'quantity is required' });
    return;
  }

  if (total === undefined || total === null) {
    res.status(400).json({ error: 'total is required' });
    return;
  }

  if (typeof user_id !== 'number' || !Number.isInteger(user_id) || user_id <= 0) {
    res.status(400).json({ error: 'user_id must be a positive integer' });
    return;
  }

  if (typeof product_id !== 'number' || !Number.isInteger(product_id) || product_id <= 0) {
    res.status(400).json({ error: 'product_id must be a positive integer' });
    return;
  }

  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) {
    res.status(400).json({ error: 'quantity must be a positive integer' });
    return;
  }

  if (typeof total !== 'string' || isNaN(Number(total)) || Number(total) <= 0) {
    res.status(400).json({ error: 'total must be a positive numeric string' });
    return;
  }

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
    const pgErr = err as { code?: string; constraint?: string };
    if (pgErr.code === '23503') {
      res.status(400).json({ error: 'Referenced user or product does not exist' });
      return;
    }
    if (pgErr.code === '23502') {
      res.status(400).json({ error: 'A required field is missing' });
      return;
    }
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user_id, product_id, quantity, total } = req.body;

  if (id === undefined || isNaN(Number(id)) || id.includes('.') || Number(id) <= 0) {
    res.status(400).json({ error: 'Invalid order ID' });
    return;
  }

  if (user_id === undefined && product_id === undefined && quantity === undefined && total === undefined) {
    res.status(400).json({ error: 'At least one field must be provided' });
    return;
  }

  if (user_id !== undefined && (typeof user_id !== 'number' || !Number.isInteger(user_id) || user_id <= 0)) {
    res.status(400).json({ error: 'user_id must be a positive integer' });
    return;
  }

  if (product_id !== undefined && (typeof product_id !== 'number' || !Number.isInteger(product_id) || product_id <= 0)) {
    res.status(400).json({ error: 'product_id must be a positive integer' });
    return;
  }

  if (quantity !== undefined && (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0)) {
    res.status(400).json({ error: 'quantity must be a positive integer' });
    return;
  }

  if (total !== undefined && (typeof total !== 'string' || isNaN(Number(total)) || Number(total) <= 0)) {
    res.status(400).json({ error: 'total must be a positive numeric string' });
    return;
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  if (user_id !== undefined) {
    fields.push(`user_id = $${index++}`);
    values.push(user_id);
  }
  if (product_id !== undefined) {
    fields.push(`product_id = $${index++}`);
    values.push(product_id);
  }
  if (quantity !== undefined) {
    fields.push(`quantity = $${index++}`);
    values.push(quantity);
  }
  if (total !== undefined) {
    fields.push(`total = $${index++}`);
    values.push(total);
  }

  values.push(id);

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

    const result = await query(
      `UPDATE orders SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err: unknown) {
    const pgErr = err as { code?: string; constraint?: string };
    if (pgErr.code === '23503') {
      res.status(400).json({ error: 'Referenced user or product does not exist' });
      return;
    }
    console.error('Error updating order:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (id === undefined || isNaN(Number(id)) || Number(id) < 0 || id === '' || id.includes('.')) {
    res.status(400).json({ error: 'Invalid order ID' });
    return;
  }

  const result = await query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json({ message: 'Order deleted', order: result.rows[0] });
});

export default router;
