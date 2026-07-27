import { APIRequestContext } from '@playwright/test';

export class UsersClient {
    constructor(private request: APIRequestContext) {}

    generateEmail() {
        return `test_${Date.now()}@example.com`;
    }

    async createUser(name: any, email: any) {
        const start = Date.now()
        const response = await this.request.post('/users', {
            data: {
                'name': name,
                'email': email
            }
        });
        const duration = Date.now() - start;
        return { response, duration };
    }

    async getUserById(userId: any) {
        const start = Date.now();
        const response = await this.request.get(`/users/${userId}`);
        const duration = Date.now() - start;
        return { response, duration };
    }

    async deleteUser(userId: any) {
        const start = Date.now();
        const response = await this.request.delete(`/users/${userId}`);
        const duration = Date.now() - start;
        return { response, duration };
    }

    async editUser(userId: any, userData: {}) {
        const start = Date.now();
        const response = await this.request.put(`/users/${userId}`, {
            data: userData,
        });
        const duration = Date.now() - start;

        return { response, duration };
    }
}