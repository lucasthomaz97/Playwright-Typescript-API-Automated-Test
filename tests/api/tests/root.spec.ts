import { test, expect } from '@playwright/test';

test.describe('root and routing', () => {
    test('GET / should return API message', async ({ request }) => {
        const response = await request.get('/');
        const body = await response.json();

        expect(response.status()).toBe(200);
        expect(body).toEqual({ message: 'E-commerce API' });
    });

    test('GET /nonexistent should return 404', async ({ request }) => {
        const response = await request.get('/nonexistent');
        const body = await response.json();

        expect(response.status()).toBe(404);
        expect(body).toEqual({ error: 'Route not found' });
    });
});
