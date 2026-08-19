import { test, expect } from '@playwright/test';

test.describe('wrong HTTP methods', () => {
    const testCases = [
        { method: 'POST' as const, path: '/users/1' },
        { method: 'PUT' as const, path: '/users' },
        { method: 'DELETE' as const, path: '/users' },
        { method: 'POST' as const, path: '/products/1' },
        { method: 'PUT' as const, path: '/products' },
        { method: 'DELETE' as const, path: '/products' },
        { method: 'POST' as const, path: '/orders/1' },
        { method: 'PUT' as const, path: '/orders' },
        { method: 'DELETE' as const, path: '/orders' },
        { method: 'POST' as const, path: '/' },
    ];

    testCases.forEach(({ method, path }) => {
        test(`${method} ${path} should return 404`, async ({ request }) => {
            const response = await request.fetch(path, { method });
            const body = await response.json();

            expect(response.status()).toBe(404);
            expect(body).toEqual({ error: 'Route not found' });
        });
    });
});
