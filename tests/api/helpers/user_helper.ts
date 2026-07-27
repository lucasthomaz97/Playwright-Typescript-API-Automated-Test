import { expect } from '@playwright/test';
import { User } from '../models/User';

export function expectCorrectUserData(user: User) {
    expect(user.id).toBeGreaterThan(0);
    expect(user.name.trim()).not.toBe("");
    expect(user.email).toContain("@");
    expect(user.email).toMatch(/^.+@.+\..+$/);
    expect(Date.parse(user.created_at)).not.toBeNaN();
}