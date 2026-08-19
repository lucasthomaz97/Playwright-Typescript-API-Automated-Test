import { Response } from 'express';

interface PgError {
  code?: string;
  constraint?: string;
}

export function handlePgError(err: unknown, res: Response, context: string, constraintMap?: Record<string, { status: number; message: string }>) {
  const pgErr = err as PgError;

  if (constraintMap && pgErr.constraint && constraintMap[pgErr.constraint]) {
    const { status, message } = constraintMap[pgErr.constraint];
    res.status(status).json({ error: message });
    return true;
  }

  if (pgErr.code === '23505') {
    res.status(409).json({ error: 'Already exists' });
    return true;
  }

  if (pgErr.code === '23503') {
    res.status(400).json({ error: 'Referenced record does not exist' });
    return true;
  }

  if (pgErr.code === '23502') {
    res.status(400).json({ error: 'A required field is missing' });
    return true;
  }

  console.error(`Error ${context}:`, err);
  res.status(500).json({ error: 'Internal server error' });
  return false;
}
