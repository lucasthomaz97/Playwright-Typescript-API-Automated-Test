import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const result = await query('SELECT * FROM products ORDER BY id');
  res.json(result.rows);
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (id === undefined || isNaN(Number(id)) || Number(id) < 0 || id === '' || id.includes('.')) {
    res.status(400).json({ error: 'Invalid product ID' });
    return;
  }

  const result = await query('SELECT * FROM products WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json(result.rows[0]);
});

router.post('/', async (req: Request, res: Response) => {
  const { name, price, description } = req.body;

  if (!name || !price) {
    res.status(400).json({ error: 'Name and price are required' });
    return;
  }

  if (typeof name !== 'string') {
    res.status(400).json({ error: 'Name must be a string' });
    return;
  }

  if (typeof price !== 'string' || isNaN(Number(price)) || Number(price) <= 0) {
    res.status(400).json({ error: 'Price must be a positive numeric string' });
    return;
  }

  if (typeof description !== 'string') {
    res.status(400).json({ error: 'Description must be a string' });
    return;
  }

  const result = await query(
    'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING *',
    [name, price, description]
  );

  res.status(201).json(result.rows[0]);
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, description } = req.body;

  if (id === undefined || isNaN(Number(id)) || id.includes('.') || Number(id) <= 0) {
    res.status(400).json({ error: 'Invalid product ID' });
    return;
  }

  if (!name && !price && !description) {
    res.status(400).json({ error: 'At least one field must be provided' });
    return;
  }

  if (name !== undefined && typeof name !== 'string') {
    res.status(400).json({ error: 'Name must be a string' });
    return;
  }

  if (price !== undefined && (typeof price !== 'string' || isNaN(Number(price)) || Number(price) <= 0)) {
    res.status(400).json({ error: 'Price must be a positive numeric string' });
    return;
  }

  if (description !== undefined && typeof description !== 'string') {
    res.status(400).json({ error: 'Description must be a string' });
    return;
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  if (name) {
    fields.push(`name = $${index++}`);
    values.push(name);
  }
  if (price) {
    fields.push(`price = $${index++}`);
    values.push(price);
  }
  if (description !== undefined) {
    fields.push(`description = $${index++}`);
    values.push(description);
  }

  values.push(id);

  const result = await query(
    `UPDATE products SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json(result.rows[0]);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (id === undefined || isNaN(Number(id)) || Number(id) < 0 || id === '' || id.includes('.')) {
    res.status(400).json({ error: 'Invalid product ID' });
    return;
  }

  const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json({ message: 'Product deleted', product: result.rows[0] });
});

export default router;
