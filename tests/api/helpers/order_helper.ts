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

export function expectOrderShape(order: Order) {
    expect(order).toEqual(
        expect.objectContaining({
            id: expect.any(Number),
            user_id: expect.any(Number),
            product_id: expect.any(Number),
            quantity: expect.any(Number),
            total: expect.any(String),
            created_at: expect.any(String),
            user_name: expect.any(String),
            user_email: expect.any(String),
            product_name: expect.any(String),
            product_price: expect.any(String),
        })
    );
}
