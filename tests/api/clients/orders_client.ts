import { APIRequestContext } from '@playwright/test';

export class OrdersClient {
    constructor(private request: APIRequestContext) {}

    async createOrder(orderData: Record<string, unknown>) {
        const response = await this.request.post('/orders', {
            data: orderData,
        });
        return response;
    }

    async getOrders() {
        const response = await this.request.get('/orders');
        return response;
    }

    async getOrderById(orderId: number | string) {
        const response = await this.request.get(`/orders/${orderId}`);
        return response;
    }

    async putOrder(orderId: number | string, orderData: Record<string, unknown>) {
        const response = await this.request.put(`/orders/${orderId}`, {
            data: orderData,
        });
        return response;
    }

    async deleteOrder(orderId: number | string) {
        const response = await this.request.delete(`/orders/${orderId}`);
        return response;
    }
}
