import { expect } from '@playwright/test';
import { User } from '../models/User';

export function expectCorrectUserData(user: User) {
    expect(user.id).toBeGreaterThan(0);
    expect(user.name.trim()).not.toBe("");
    expect(user.email).toContain("@");
    expect(user.email).toMatch(/^.+@.+\..+$/);
    expect(user.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(Date.now() - Date.parse(user.created_at)).toBeLessThan(60_000);
}