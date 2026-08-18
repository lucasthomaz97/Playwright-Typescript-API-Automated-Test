import { expect } from '@playwright/test';
import { Order } from '../models/Order';

export function expectCorrectOrderData(order: Order) {
    expect(order.id).toBeGreaterThan(0);
    expect(order.user_id).toBeGreaterThan(0);
    expect(order.product_id).toBeGreaterThan(0);
    expect(order.quantity).toBeGreaterThan(0);
    expect(Number(order.total)).toBeGreaterThan(0);
    expect(order.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(Date.now() - Date.parse(order.created_at)).toBeLessThan(60_000);
}
