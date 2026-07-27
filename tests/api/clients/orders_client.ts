import { APIRequestContext } from '@playwright/test';

export class OrdersClient {
    constructor(private request: APIRequestContext) {}

    async createOrder(orderData: {}) {
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

    async getOrderById(orderId: any) {
        const start = Date.now();
        const response = await this.request.get(`/orders/${orderId}`);
        const duration = Date.now() - start;
        return { response, duration };
    }

    async putOrder(orderId: any, orderData: {}) {
        const start = Date.now();
        const response = await this.request.put(`/orders/${orderId}`, {
            data: orderData,
        });
        const duration = Date.now() - start;
        return { response, duration };
    }

    async deleteOrder(orderId: any) {
        const start = Date.now();
        const response = await this.request.delete(`/orders/${orderId}`);
        const duration = Date.now() - start;
        return { response, duration };
    }
}
