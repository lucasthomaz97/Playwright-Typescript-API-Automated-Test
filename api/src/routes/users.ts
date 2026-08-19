import { Router, Request, Response } from 'express';
import { query } from '../db';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateId } from '../middleware/validateId';
import { validateUserPost, validateUserPut } from '../utils/validators';
import { buildUpdateQuery } from '../utils/queryBuilder';
import { handlePgError } from '../utils/pgErrorHandler';

const router = Router();

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  if (!validateUserPost(req.body, res)) return;

  const { name, email } = req.body;

  try {
    const result = await query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    handlePgError(err, res, 'creating user', {
      users_email_key: { status: 409, message: 'Email already exists' },
    });
  }
}));

router.get('/:id', validateId('user', true), asyncHandler(async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(result.rows[0]);
}));

router.put('/:id', validateId('user', false), asyncHandler(async (req: Request, res: Response) => {
  if (!validateUserPut(req.body, res)) return;

  const { name, email } = req.body;
  const { sql, params } = buildUpdateQuery('users', req.params.id as string, { name, email });

  try {
    const result = await query(sql, params);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err: unknown) {
    handlePgError(err, res, 'updating user', {
      users_email_key: { status: 409, message: 'Email already exists' },
    });
  }
}));

router.delete('/:id', validateId('user', true), asyncHandler(async (req: Request, res: Response) => {
  const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [req.params.id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ message: 'User deleted', user: result.rows[0] });
}));

export default router;
