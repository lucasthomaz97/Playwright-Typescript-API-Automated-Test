import { expect } from '@playwright/test';
import { Product } from '../models/Product';

export function expectCorrectProductData(product: Product) {
    expect(product.id).toBeGreaterThan(0);
    expect(product.name.trim()).not.toBe("");
    expect(Number(product.price)).toBeGreaterThan(0);
    expect(Date.parse(product.created_at)).not.toBeNaN();
}