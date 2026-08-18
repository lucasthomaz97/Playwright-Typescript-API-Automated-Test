import { APIRequestContext } from '@playwright/test';

export class UsersClient {
    constructor(private request: APIRequestContext) {}

    generateEmail() {
        return `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}@example.com`;
    }

    async createUser(userData: Record<string, unknown>) {
        const response = await this.request.post('/users', {
            data: {
                'name': userData.name,
                'email': userData.email
            }
        });
        return response;
    }

    async getUserById(userId: number | string) {
        const response = await this.request.get(`/users/${userId}`);
        return response;
    }

    async deleteUser(userId: number | string) {
        const response = await this.request.delete(`/users/${userId}`);
        return response;
    }

    async editUser(userId: number | string, userData: Record<string, unknown>) {
        const response = await this.request.put(`/users/${userId}`, {
            data: userData,
        });
        return response;
    }
}