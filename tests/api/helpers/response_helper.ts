import { APIResponse, expect } from '@playwright/test';

export function expectCorrectResponse(response: APIResponse, expectedStatus: number = 200, duration: number, durationThreshold: number = 200) {
    expect(duration).toBeLessThan(durationThreshold);
    expect(response.status()).toBe(expectedStatus);
    expect(response.headers()['content-type']).toContain('application/json');
};