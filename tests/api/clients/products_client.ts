import { APIRequestContext } from '@playwright/test';

export class ProductsClient {
    constructor(private request: APIRequestContext) {}

    async addProduct() {
        const response = await this.request.post('/products', {
            data: {
                name: 'Test Product',
                price: '19.99',
                description: 'This is a test product',
            },
        });
        return response;
    }

    async getProducts() {
        const response = await this.request.get('/products');
        return response;
    }

    async getProductById(productId: number | string) {
        const response = await this.request.get(`/products/${productId}`);
        return response;
    }

    async putProduct(productId: number | string, productData: Record<string, unknown>) {
        const response = await this.request.put(`/products/${productId}`, {
            data: productData,
        });
        return response;
    }

    async postProduct(productData: Record<string, unknown>) {
        const response = await this.request.post('/products', {
            data: productData,
        });
        return response;
    }

    async deleteProduct(productId: number | string) {
        const response = await this.request.delete(`/products/${productId}`);
        return response;
    }
}