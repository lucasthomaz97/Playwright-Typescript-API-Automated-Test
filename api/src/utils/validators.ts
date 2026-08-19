import { Response } from 'express';

function isValidEmail(email: unknown): boolean {
  return typeof email === 'string' && email.includes('@');
}

export function validateUserPost(body: { name?: unknown; email?: unknown }, res: Response): boolean {
  const { name, email } = body;

  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required' });
    return false;
  }

  if (typeof name !== 'string') {
    res.status(400).json({ error: 'Name must be a string' });
    return false;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'Email must be a valid email string' });
    return false;
  }

  return true;
}

export function validateUserPut(body: { name?: unknown; email?: unknown }, res: Response): boolean {
  const { name, email } = body;

  if (!name && !email) {
    res.status(400).json({ error: 'At least name or email must be provided' });
    return false;
  }

  if (name !== undefined && typeof name !== 'string') {
    res.status(400).json({ error: 'Name must be a string' });
    return false;
  }

  if (email !== undefined && !isValidEmail(email)) {
    res.status(400).json({ error: 'Email must be a valid email string' });
    return false;
  }

  return true;
}

export function validateProductPost(body: { name?: unknown; price?: unknown; description?: unknown }, res: Response): boolean {
  const { name, price, description } = body;

  if (!name || !price) {
    res.status(400).json({ error: 'Name and price are required' });
    return false;
  }

  if (typeof name !== 'string') {
    res.status(400).json({ error: 'Name must be a string' });
    return false;
  }

  if (typeof price !== 'string' || isNaN(Number(price)) || Number(price) <= 0) {
    res.status(400).json({ error: 'Price must be a positive numeric string' });
    return false;
  }

  if (typeof description !== 'string') {
    res.status(400).json({ error: 'Description must be a string' });
    return false;
  }

  return true;
}

export function validateProductPut(body: { name?: unknown; price?: unknown; description?: unknown }, res: Response): boolean {
  const { name, price, description } = body;

  if (!name && !price && !description) {
    res.status(400).json({ error: 'At least one field must be provided' });
    return false;
  }

  if (name !== undefined && typeof name !== 'string') {
    res.status(400).json({ error: 'Name must be a string' });
    return false;
  }

  if (price !== undefined && (typeof price !== 'string' || isNaN(Number(price)) || Number(price) <= 0)) {
    res.status(400).json({ error: 'Price must be a positive numeric string' });
    return false;
  }

  if (description !== undefined && typeof description !== 'string') {
    res.status(400).json({ error: 'Description must be a string' });
    return false;
  }

  return true;
}

export function validateOrderPost(body: { user_id?: unknown; product_id?: unknown; quantity?: unknown; total?: unknown }, res: Response): boolean {
  const { user_id, product_id, quantity, total } = body;

  if (user_id === undefined || user_id === null) {
    res.status(400).json({ error: 'user_id is required' });
    return false;
  }

  if (product_id === undefined || product_id === null) {
    res.status(400).json({ error: 'product_id is required' });
    return false;
  }

  if (quantity === undefined || quantity === null) {
    res.status(400).json({ error: 'quantity is required' });
    return false;
  }

  if (total === undefined || total === null) {
    res.status(400).json({ error: 'total is required' });
    return false;
  }

  if (typeof user_id !== 'number' || !Number.isInteger(user_id) || user_id <= 0) {
    res.status(400).json({ error: 'user_id must be a positive integer' });
    return false;
  }

  if (typeof product_id !== 'number' || !Number.isInteger(product_id) || product_id <= 0) {
    res.status(400).json({ error: 'product_id must be a positive integer' });
    return false;
  }

  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) {
    res.status(400).json({ error: 'quantity must be a positive integer' });
    return false;
  }

  if (typeof total !== 'string' || isNaN(Number(total)) || Number(total) <= 0) {
    res.status(400).json({ error: 'total must be a positive numeric string' });
    return false;
  }

  return true;
}

export function validateOrderPut(body: { user_id?: unknown; product_id?: unknown; quantity?: unknown; total?: unknown }, res: Response): boolean {
  const { user_id, product_id, quantity, total } = body;

  if (user_id === undefined && product_id === undefined && quantity === undefined && total === undefined) {
    res.status(400).json({ error: 'At least one field must be provided' });
    return false;
  }

  if (user_id !== undefined && (typeof user_id !== 'number' || !Number.isInteger(user_id) || user_id <= 0)) {
    res.status(400).json({ error: 'user_id must be a positive integer' });
    return false;
  }

  if (product_id !== undefined && (typeof product_id !== 'number' || !Number.isInteger(product_id) || product_id <= 0)) {
    res.status(400).json({ error: 'product_id must be a positive integer' });
    return false;
  }

  if (quantity !== undefined && (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0)) {
    res.status(400).json({ error: 'quantity must be a positive integer' });
    return false;
  }

  if (total !== undefined && (typeof total !== 'string' || isNaN(Number(total)) || Number(total) <= 0)) {
    res.status(400).json({ error: 'total must be a positive numeric string' });
    return false;
  }

  return true;
}
