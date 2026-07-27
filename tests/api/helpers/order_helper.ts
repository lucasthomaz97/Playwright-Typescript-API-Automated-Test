import { expect } from '@playwright/test';
import { Order } from '../models/Order';

export function expectCorrectOrderData(order: Order) {
    expect(order.id).toBeGreaterThan(0);
    expect(order.user_id).toBeGreaterThan(0);
    expect(order.product_id).toBeGreaterThan(0);
    expect(order.quantity).toBeGreaterThan(0);
    expect(Number(order.total)).toBeGreaterThan(0);
    expect(Date.parse(order.created_at)).not.toBeNaN();
}
