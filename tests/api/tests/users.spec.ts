import { test, expect } from '@playwright/test';
import { expectCorrectResponse } from '../helpers/response_helper';
import { UsersClient } from '../clients/users_client';
import { OrdersClient } from '../clients/orders_client';
import { expectCorrectUserData } from '../helpers/user_helper';
import { NON_EXISTENT_ID } from '../helpers/constants';
import { createOrderPrerequisites } from '../helpers/order_prerequisite_helper';

test.describe('get users', () => {
    let userId: number;

    test.beforeAll( async ({request}) => {
        const usersClient: UsersClient = new UsersClient(request);
        const response = await usersClient.createUser({ name: 'Test User', email: usersClient.generateEmail() });
        expect(response.ok()).toBeTruthy();
        const user = await response.json();
        userId = user.id;
    });

    test('should return a correspondent user by its id', async ({request})=> {
        const usersClient: UsersClient = new UsersClient(request);
        const response = await usersClient.getUserById(userId);
        const user = await response.json();

        expectCorrectResponse(response, 200);
        expect(user).toEqual(
            expect.objectContaining({
                id: userId,
                name: expect.any(String),
                email: expect.any(String),
                created_at: expect.any(String)
            })
        )
        expectCorrectUserData(user);
    });

    const testCases = [
        {"scenario": "should return 404 for a non existent user id", "inputId": NON_EXISTENT_ID, "statusCode": 404, "expectedBody": {"error": "User not found"}},
        {"scenario": "should return 400 for an invalid user id", "inputId": "invalid-id", "statusCode": 400, "expectedBody": {"error": "Invalid user ID"}},
        {"scenario": "should return 400 for a negative user id", "inputId": -1, "statusCode": 400, "expectedBody": {"error": "Invalid user ID"}},
        {"scenario": "should return 400 for a decimal user id", "inputId": 1.5, "statusCode": 400, "expectedBody": {"error": "Invalid user ID"}},
        {"scenario": "should return 404 for a zero user id", "inputId": 0, "statusCode": 404, "expectedBody": {"error": "User not found"}}
    ]

    testCases.forEach(({ scenario, inputId, statusCode, expectedBody }) => {
        test(scenario, async ( { request } ) => {
            const usersClient: UsersClient = new UsersClient(request);
            const response = await usersClient.getUserById(inputId);
            const error = await response.json();

            expectCorrectResponse(response, statusCode);
            expect(error).toEqual(expectedBody);
        });
    });
});

test.describe('post user', () => {
    test('should create a user successfully', async({ request })=>{
        const usersClient: UsersClient = new UsersClient(request);
        const userData = {
            name: 'Test New User', email: usersClient.generateEmail()
        }
        const response = await usersClient.createUser(userData);
        const user = await response.json();

        expectCorrectResponse(response, 201);
        expect(user).toEqual(expect.objectContaining({
            id: expect.any(Number),
            name: userData.name,
            email: userData.email,
            created_at: expect.any(String)
        }));
        expectCorrectUserData(user);
    });

    test('should return 409 when creating a user with an email already in use', async({ request }) => {
        const usersClient: UsersClient = new UsersClient(request);
        const userData = {
            name: 'Test New User', email: usersClient.generateEmail()
        }
        const response = await usersClient.createUser(userData);
        const user = await response.json();

        expect(response.status()).toBe(201);

        const secondResponse = await usersClient.createUser(userData);
        const error = await secondResponse.json();

        expectCorrectResponse(secondResponse, 409);
        expect(error).toEqual({"error": "Email already exists"});

    });

    const testCases = [
        {"scenario": "should return 400 when trying to create a user with empty fields", "data": {name: "", "email": ""}, "statusCode": 400, "expectedBody": {"error": "Name and email are required"}},
        {"scenario": "should return 400 when trying to create a user with no fields", "data": {}, "statusCode": 400, "expectedBody": {"error": "Name and email are required"}},
        {"scenario": "should return 400 when trying to create a user with empty name", "data": {name: "", "email": `post_test${Math.random().toString(36).substring(2, 10)}@example.com`}, "statusCode": 400, "expectedBody": {"error": "Name and email are required"}},
        {"scenario": "should return 400 when trying to create a user with no name field", "data": {"email": `post_test${Math.random().toString(36).substring(2, 10)}@example.com`}, "statusCode": 400, "expectedBody": {"error": "Name and email are required"}},
        {"scenario": "should return 400 when trying to create a user with a numeric value in the name field", "data": {name: 2026, "email": `post_test${Math.random().toString(36).substring(2, 10)}@example.com`}, "statusCode": 400, "expectedBody": {"error": 'Name must be a string'}},
        {"scenario": "should return 400 when trying to create a user with empty email", "data": {name: "Post Tests", "email": ""}, "statusCode": 400, "expectedBody": {"error": "Name and email are required"}},
        {"scenario": "should return 400 when trying to create a user with no email field", "data": {name: "Post Tests"}, "statusCode": 400, "expectedBody": {"error": "Name and email are required"}},
        {"scenario": "should return 400 when trying to create a user with a numeric value in the email field", "data": {name: "Post Tests", "email": 2026}, "statusCode": 400, "expectedBody": {"error": "Email must be a valid email string"}},
        {"scenario": "should return 400 when trying to create a user with an invalid email string in the email field", "data": {name: "Post Tests", "email": "pretend_to_be_email"}, "statusCode": 400, "expectedBody": {"error": "Email must be a valid email string"}}
    ]

    testCases.forEach(({ scenario, data, statusCode, expectedBody}) => {
        test(scenario, async ({ request }) => {
            const usersClient: UsersClient = new UsersClient(request);
            const response = await usersClient.createUser(data);
            const ret = await response.json()

            expectCorrectResponse(response, statusCode);
            expect(ret).toEqual(expectedBody);
        });
    });
});

test.describe('put user', () => {
    let userId: number;
    let userName: string;
    let userEmail: string;

    test.beforeEach( async({ request }) => {
        const usersClient: UsersClient = new UsersClient(request);
        const response = await usersClient.createUser({ name: 'Test User to Edit', email: usersClient.generateEmail() });
        const user = await response.json();
        userId = user.id;
        userName = user.name;
        userEmail = user.email;
    });

    test('should update a user successfully', async({ request }) => {
        const usersClient: UsersClient = new UsersClient(request);
        const userData = {name: 'Test Edited User', email: usersClient.generateEmail()};
        const response = await usersClient.editUser(userId, userData);
        const edited = await response.json();

        expectCorrectResponse(response, 200);
        expect(edited).toEqual(expect.objectContaining({
            id: userId,
            name: userData.name,
            email: userData.email,
            created_at: expect.any(String)
        }));
        expectCorrectUserData(edited);
    });

    test('should update only the user name successfully', async({ request }) => {
        const usersClient: UsersClient = new UsersClient(request);
        const userData = {name: 'Test Edited User'};
        const response = await usersClient.editUser(userId, userData);
        const edited = await response.json();

        expectCorrectResponse(response, 200);
        expect(edited).toEqual(expect.objectContaining({
            id: userId,
            name: userData.name,
            email: userEmail,
            created_at: expect.any(String)
        }));
        expectCorrectUserData(edited);
    });

    test('should update only the user email successfully', async({ request }) => {
        const usersClient: UsersClient = new UsersClient(request);
        const userData = {email: usersClient.generateEmail()};
        const response = await usersClient.editUser(userId, userData);
        const edited = await response.json();

        expectCorrectResponse(response, 200);
        expect(edited).toEqual(expect.objectContaining({
            id: userId,
            name: 'Test User to Edit',
            email: expect.any(String),
            created_at: expect.any(String)
        }));
        expectCorrectUserData(edited);
    });

    test('should return 409 when editing a user email to one already in use by another user', async ({ request }) => {
        const usersClient: UsersClient = new UsersClient(request);
        const response = await usersClient.createUser({ name: 'Test User Using Email', email: usersClient.generateEmail() });
        const user = await response.json();

        const data = {name: 'Test Edited User', email: user.email};
        const editResponse = await usersClient.editUser(userId, data);
        const edited = await editResponse.json();

        expectCorrectResponse(editResponse, 409);
        expect(edited).toEqual({"error": "Email already exists"});
    });

    test('should not change user data when an error 409 occurs', async ({ request }) => {
        const usersClient: UsersClient = new UsersClient(request);
        const response = await usersClient.createUser({ name: 'Test User to Edit', email: usersClient.generateEmail() });
        const user = await response.json();

        const data = {name: 'Test Edited User', email: user.email};
        const editResponse = await usersClient.editUser(userId, data);
        const edited = await editResponse.json();

        expectCorrectResponse(editResponse, 409);
        expect(edited).toEqual({"error": "Email already exists"});

        const getResponse = await usersClient.getUserById(userId);
        const userData = await getResponse.json();
        expect(userData.name).toEqual(userName);
        expect(userData.email).toEqual(userEmail);
    })

    const testCases = [
        {"scenario": "should return 400 when trying to edit with no fields", "inputId": null, "data": {}, "statusCode": 400, "expectedBody": {"error": "At least name or email must be provided"}},
        {"scenario": "should return 400 when trying to edit with empty fields", "inputId": null, "data": {"name": "", "email": ""}, "statusCode": 400, "expectedBody": {"error": "At least name or email must be provided"}},
        {"scenario": "should return 400 when trying to edit a user with an invalid id", "inputId": "invalid-id", "data": {"name": "Edited User", "email": `put_test${Math.random().toString(36).substring(2, 10)}@example.com`}, "statusCode": 400, "expectedBody": {"error": "Invalid user ID"}},
        {"scenario": "should return 400 when trying to edit a user with a decimal id", "inputId": 1.5, "data": {"name": "Edited User", "email": `put_test${Math.random().toString(36).substring(2, 10)}@example.com`}, "statusCode": 400, "expectedBody": {"error": "Invalid user ID"}},
        {"scenario": "should return 400 when trying to edit a user with a negative id", "inputId": -1, "data": {"name": "Edited User", "email": `put_test${Math.random().toString(36).substring(2, 10)}@example.com`}, "statusCode": 400, "expectedBody": {"error": "Invalid user ID"}},
        {"scenario": "should return 400 when trying to edit a user with id 0", "inputId": 0, "data": {"name": "Edited User", "email": `put_test${Math.random().toString(36).substring(2, 10)}@example.com`}, "statusCode": 400, "expectedBody": {"error": "Invalid user ID"}},
        {"scenario": "should return 404 when user is not found with this id", "inputId": NON_EXISTENT_ID, "data": {"name": "Edited User", "email": `put_test${Math.random().toString(36).substring(2, 10)}@example.com`}, "statusCode": 404, "expectedBody": {"error": "User not found"}},
        {"scenario": "should return 400 when name is a number", "inputId": null, "data": {"name": 2026, "email": `put_test${Math.random().toString(36).substring(2, 10)}@example.com`}, "statusCode": 400, "expectedBody": {"error": "Name must be a string"}},
        {"scenario": "should return 400 when email is a number", "inputId": null, "data": {"name": "Edited User", "email": 2026}, "statusCode": 400, "expectedBody": {"error": "Email must be a valid email string"}},
        {"scenario": "should return 400 when email is not valid", "inputId": null, "data": {"name": "Edited User", "email": 'pretend_to_be_email'}, "statusCode": 400, "expectedBody": {"error": "Email must be a valid email string"}}
    ]

    testCases.forEach(({ scenario, inputId, data, statusCode, expectedBody}) => {
        test(scenario, async ({ request }) => {
            const usrId = inputId ?? userId;
            const usersClient: UsersClient = new UsersClient(request);
            const response = await usersClient.editUser(usrId, data);
            const res = await response.json();

            expectCorrectResponse(response, statusCode);
            expect(res).toEqual(expectedBody);
        });
    });
});

test.describe('delete users', () => {
    test('should delete an existing user', async ({ request }) => {
        const usersClient: UsersClient = new UsersClient(request);
        const createRes = await usersClient.createUser({ name: 'Test User to Delete', email: usersClient.generateEmail() });
        const createdUser = await createRes.json();

        const response = await usersClient.deleteUser(createdUser.id);
        const deletedUser = await response.json();

        expectCorrectResponse(response, 200);
        expect(deletedUser).toEqual(
            expect.objectContaining({
                "message": "User deleted",
                "user": {
                    "id": createdUser.id,
                    "name": expect.any(String),
                    "email": expect.any(String),
                    "created_at": expect.any(String)
                }
            })
        );
    });

    test('should delete a user with associated orders via cascade', async ({ request }) => {
        const { userId, orderId } = await createOrderPrerequisites(request);
        const usersClient = new UsersClient(request);
        const ordersClient = new OrdersClient(request);

        const deleteRes = await usersClient.deleteUser(userId);
        expectCorrectResponse(deleteRes, 200);
        const deleteBody = await deleteRes.json();
        expect(deleteBody).toEqual(
            expect.objectContaining({
                "message": "User deleted",
                "user": {
                    "id": userId,
                    "name": 'Test Order User',
                    "email": expect.any(String),
                    "created_at": expect.any(String)
                }
            })
        );

        const verifyRes = await ordersClient.getOrderById(orderId);
        expect(verifyRes.status()).toBe(404);
    });

    test('should return a 404 when trying to delete a user for the second time', async ({ request }) => {
        const usersClient: UsersClient = new UsersClient(request);

        const createRes = await usersClient.createUser({ name: 'Test User To Delete', email: usersClient.generateEmail() });
        const user = await createRes.json();
        const newUserId = user.id;

        const response = await usersClient.deleteUser(newUserId);
        const userDel = await response.json();
        expectCorrectResponse(response, 200);
        expect(userDel).toEqual(
            expect.objectContaining({
                "message": "User deleted",
                "user": {
                    "id": newUserId,
                    "name": expect.any(String),
                    "email": expect.any(String),
                    "created_at": expect.any(String)
                }
            })
        );

        const secondResponse = await usersClient.deleteUser(newUserId);
        const errorRes = await secondResponse.json();
        expectCorrectResponse(secondResponse, 404);
        expect(errorRes).toEqual({"error": "User not found"});
    });

    const testCases = [
        {"scenario": "should return 404 when deleting a user with id 0", "inputId": 0, "statusCode": 404, "expectedBody": {"error": "User not found"}},
        {"scenario": "should return 404 when deleting a non existent user id", "inputId": NON_EXISTENT_ID, "statusCode": 404, "expectedBody": {"error": "User not found"}},
        {"scenario": "should return 400 when deleting a user with invalid id", "inputId": "invalid-id", "statusCode": 400, "expectedBody": {"error": "Invalid user ID"}},
        {"scenario": "should return 400 when deleting a user with a negative id", "inputId": -1, "statusCode": 400, "expectedBody": {"error": "Invalid user ID"}},
        {"scenario": "should return 400 when deleting a user with a decimal id", "inputId": 1.5, "statusCode": 400, "expectedBody": {"error": "Invalid user ID"}}
    ]

    testCases.forEach(({ scenario, inputId, statusCode, expectedBody }) => {
        test(scenario, async({ request }) => {
            const usersClient: UsersClient = new UsersClient(request);
            const response = await usersClient.deleteUser(inputId);
            const error = await response.json();

            expectCorrectResponse(response, statusCode);
            expect(error).toEqual(expectedBody);
        });
    })

})