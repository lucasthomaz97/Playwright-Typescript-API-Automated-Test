import { APIRequestContext } from '@playwright/test';

export class UsersClient {
    constructor(private request: APIRequestContext) {}

    generateEmail() {
        return `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}@example.com`;
    }

    async createUser(userData: Record<string, unknown>) {
        const start = Date.now()
        const response = await this.request.post('/users', {
            data: {
                'name': userData.name,
                'email': userData.email
            }
        });
        const duration = Date.now() - start;
        return { response, duration };
    }

    async getUserById(userId: number | string) {
        const start = Date.now();
        const response = await this.request.get(`/users/${userId}`);
        const duration = Date.now() - start;
        return { response, duration };
    }

    async deleteUser(userId: number | string) {
        const start = Date.now();
        const response = await this.request.delete(`/users/${userId}`);
        const duration = Date.now() - start;
        return { response, duration };
    }

    async editUser(userId: number | string, userData: Record<string, unknown>) {
        const start = Date.now();
        const response = await this.request.put(`/users/${userId}`, {
            data: userData,
        });
        const duration = Date.now() - start;

        return { response, duration };
    }
}