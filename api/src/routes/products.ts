import { Router, Request, Response } from 'express';
import { query } from '../db';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateId } from '../middleware/validateId';
import { validateProductPost, validateProductPut } from '../utils/validators';
import { buildUpdateQuery } from '../utils/queryBuilder';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const result = await query('SELECT * FROM products ORDER BY id');
  res.json(result.rows);
}));

router.get('/:id', validateId('product', true), asyncHandler(async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json(result.rows[0]);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  if (!validateProductPost(req.body, res)) return;

  const { name, price, description } = req.body;

  const result = await query(
    'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING *',
    [name, price, description]
  );

  res.status(201).json(result.rows[0]);
}));

router.put('/:id', validateId('product', false), asyncHandler(async (req: Request, res: Response) => {
  if (!validateProductPut(req.body, res)) return;

  const { name, price, description } = req.body;
  const { sql, params } = buildUpdateQuery('products', req.params.id as string, { name, price, description });

  const result = await query(sql, params);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json(result.rows[0]);
}));

router.delete('/:id', validateId('product', true), asyncHandler(async (req: Request, res: Response) => {
  const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json({ message: 'Product deleted', product: result.rows[0] });
}));

export default router;
