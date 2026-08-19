import { APIRequestContext, expect } from '@playwright/test';
import { UsersClient } from '../clients/users_client';
import { ProductsClient } from '../clients/products_client';
import { OrdersClient } from '../clients/orders_client';

export interface OrderPrerequisites {
    userId: number;
    productId: number;
    orderId: number;
}

export async function createOrderPrerequisites(
    request: APIRequestContext,
    options?: { quantity?: number; total?: string }
): Promise<OrderPrerequisites> {
    const usersClient = new UsersClient(request);
    const productsClient = new ProductsClient(request);
    const ordersClient = new OrdersClient(request);

    const userRes = await usersClient.createUser({ name: 'Test Order User', email: usersClient.generateEmail() });
    expect(userRes.ok()).toBeTruthy();
    const user = await userRes.json();

    const productRes = await productsClient.addProduct();
    expect(productRes.ok()).toBeTruthy();
    const product = await productRes.json();

    const orderRes = await ordersClient.createOrder({
        user_id: user.id,
        product_id: product.id,
        quantity: options?.quantity ?? 1,
        total: options?.total ?? '19.99',
    });
    expect(orderRes.ok()).toBeTruthy();
    const order = await orderRes.json();

    return { userId: user.id, productId: product.id, orderId: order.id };
}
