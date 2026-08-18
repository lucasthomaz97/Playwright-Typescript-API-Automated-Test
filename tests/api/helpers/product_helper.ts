import { expect } from '@playwright/test';
import { Product } from '../models/Product';

export function expectCorrectProductData(product: Product) {
    expect(product.id).toBeGreaterThan(0);
    expect(product.name.trim()).not.toBe("");
    expect(Number(product.price)).toBeGreaterThan(0);
    expect(product.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(Date.now() - Date.parse(product.created_at)).toBeLessThan(60_000);
}