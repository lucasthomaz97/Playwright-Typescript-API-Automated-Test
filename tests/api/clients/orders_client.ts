import { APIRequestContext } from '@playwright/test';

export class OrdersClient {
    constructor(private request: APIRequestContext) {}

    async createOrder(orderData: Record<string, unknown>) {
        const start = Date.now();
        const response = await this.request.post('/orders', {
            data: orderData,
        });
        const duration = Date.now() - start;
        return { response, duration };
    }

    async getOrders() {
        const start = Date.now();
        const response = await this.request.get('/orders');
        const duration = Date.now() - start;
        return { response, duration };
    }

    async getOrderById(orderId: number | string) {
        const start = Date.now();
        const response = await this.request.get(`/orders/${orderId}`);
        const duration = Date.now() - start;
        return { response, duration };
    }

    async putOrder(orderId: number | string, orderData: Record<string, unknown>) {
        const start = Date.now();
        const response = await this.request.put(`/orders/${orderId}`, {
            data: orderData,
        });
        const duration = Date.now() - start;
        return { response, duration };
    }

    async deleteOrder(orderId: number | string) {
        const start = Date.now();
        const response = await this.request.delete(`/orders/${orderId}`);
        const duration = Date.now() - start;
        return { response, duration };
    }
}
