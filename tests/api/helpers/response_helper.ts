import { APIResponse, expect } from '@playwright/test';

export function expectCorrectResponse(response: APIResponse, expectedStatus: number = 200) {
    expect(response.status()).toBe(expectedStatus);
    expect(response.headers()['content-type']).toContain('application/json');
};