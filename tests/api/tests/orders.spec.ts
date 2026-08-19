import { test, expect } from '@playwright/test';
import { OrdersClient } from '../clients/orders_client';
import { ProductsClient } from '../clients/products_client';
import { UsersClient } from '../clients/users_client';
import { Order } from '../models/Order';
import { expectCorrectResponse } from '../helpers/response_helper';
import { expectCorrectOrderData, expectOrderShape } from '../helpers/order_helper';
import { NON_EXISTENT_ID } from '../helpers/constants';
import { createOrderPrerequisites } from '../helpers/order_prerequisite_helper';
import { generateInvalidIdCases } from '../helpers/invalid_id_test_cases';

test.describe('get orders', () => {
    test.beforeAll(async ({ request }) => {
        await createOrderPrerequisites(request);
    });

    test('should return a list of orders', async ({ request }) => {
        const ordersClient = new OrdersClient(request);
        const response = await ordersClient.getOrders();
        const orders = await response.json();

        expectCorrectResponse(response, 200);
        expect(Array.isArray(orders)).toBe(true);

        orders.forEach((order: Order) => {
            expectOrderShape(order);
            expectCorrectOrderData(order);
        });
    });

    test('should return more orders after creating one', async ({ request }) => {
        const ordersClient = new OrdersClient(request);
        const usersClient = new UsersClient(request);
        const productsClient = new ProductsClient(request);

        const firstResponse = await ordersClient.getOrders();
        const initialOrders = await firstResponse.json();
        const initialSize = initialOrders.length;
        expectCorrectResponse(firstResponse, 200);

        const userRes = await usersClient.createUser({ name: 'Test Order User 2', email: usersClient.generateEmail() });
        const user = await userRes.json();
        const productRes = await productsClient.addProduct();
        const product = await productRes.json();

        const orderData = {
            user_id: user.id,
            product_id: product.id,
            quantity: 3,
            total: '59.97',
        };

        const createRes = await ordersClient.createOrder(orderData);
        expectCorrectResponse(createRes, 201);
        const createdOrder = await createRes.json();

        const response = await ordersClient.getOrders();
        const orders = await response.json();
        expectCorrectResponse(response, 200);

        expect(orders.length).toBeGreaterThan(initialSize);
        expect(orders).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: createdOrder.id,
                    user_id: orderData.user_id,
                    product_id: orderData.product_id,
                    quantity: orderData.quantity,
                    total: orderData.total,
                }),
            ])
        );
        orders.forEach((order: Order) => {
            expect(order).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    user_id: expect.any(Number),
                    product_id: expect.any(Number),
                    quantity: expect.any(Number),
                    total: expect.any(String),
                    created_at: expect.any(String),
                    user_name: expect.any(String),
                    user_email: expect.any(String),
                    product_name: expect.any(String),
                    product_price: expect.any(String),
                })
            );
            expectCorrectOrderData(order);
        });
    });
});

test.describe('get order by ID', () => {
    let orderId: number;

    test.beforeAll(async ({ request }) => {
        const { orderId: id } = await createOrderPrerequisites(request, { quantity: 5, total: '99.95' });
        orderId = id;
    });

    test('should return an order by ID', async ({ request }) => {
        const ordersClient = new OrdersClient(request);
        const response = await ordersClient.getOrderById(orderId);
        const order = await response.json();

        expectCorrectResponse(response, 200);
        expect(order).toEqual(
            expect.objectContaining({
                id: orderId,
                user_id: expect.any(Number),
                product_id: expect.any(Number),
                quantity: 5,
                total: '99.95',
                created_at: expect.any(String),
                user_name: expect.any(String),
                user_email: expect.any(String),
                product_name: expect.any(String),
                product_price: expect.any(String),
            })
        );

        expect(order.user_name!.trim()).not.toBe('');
        expect(order.user_email).toMatch(/^.+@.+\..+$/);
        expect(order.product_name!.trim()).not.toBe('');
        expect(Number(order.product_price)).toBeGreaterThan(0);

        expectCorrectOrderData(order);
    });

    const testCases = generateInvalidIdCases('order', 'Order not found', 'Invalid order ID')
        .map(tc => ({ ...tc, orderId: tc.inputId }));

    testCases.forEach(({ scenario, orderId, errorCode, expectedError }) => {
        test(scenario, async ({ request }) => {
            const ordersClient = new OrdersClient(request);
            const response = await ordersClient.getOrderById(orderId);
            const errorResponse = await response.json();

            expectCorrectResponse(response, errorCode);
            expect(errorResponse).toEqual(expectedError);
        });
    });
});

test.describe('post order', () => {
    test('should create an order successfully', async ({ request }) => {
        const { userId, productId } = await createOrderPrerequisites(request);

        const ordersClient = new OrdersClient(request);
        const orderData = {
            user_id: userId,
            product_id: productId,
            quantity: 2,
            total: '39.98',
        };

        const response = await ordersClient.createOrder(orderData);
        const order = await response.json();

        expectCorrectResponse(response, 201);
        expect(order).toEqual({
            id: expect.any(Number),
            user_id: userId,
            product_id: productId,
            quantity: 2,
            total: '39.98',
            created_at: expect.any(String),
        });
        expectCorrectOrderData(order);
    });

    const missingFieldCases = [
        { scenario: 'should return 400 when creating an order with no fields', data: {}, error: 'user_id is required' },
        { scenario: 'should return 400 when user_id is missing', data: { product_id: 1, quantity: 2, total: '39.98' }, error: 'user_id is required' },
        { scenario: 'should return 400 when user_id is null', data: { user_id: null, product_id: 1, quantity: 2, total: '39.98' }, error: 'user_id is required' },
        { scenario: 'should return 400 when product_id is missing', data: { user_id: 1, quantity: 2, total: '39.98' }, error: 'product_id is required' },
        { scenario: 'should return 400 when product_id is null', data: { user_id: 1, product_id: null, quantity: 2, total: '39.98' }, error: 'product_id is required' },
        { scenario: 'should return 400 when quantity is missing', data: { user_id: 1, product_id: 1, total: '39.98' }, error: 'quantity is required' },
        { scenario: 'should return 400 when quantity is null', data: { user_id: 1, product_id: 1, quantity: null, total: '39.98' }, error: 'quantity is required' },
        { scenario: 'should return 400 when total is missing', data: { user_id: 1, product_id: 1, quantity: 2 }, error: 'total is required' },
        { scenario: 'should return 400 when total is null', data: { user_id: 1, product_id: 1, quantity: 2, total: null }, error: 'total is required' },
    ];

    missingFieldCases.forEach(({ scenario, data, error }) => {
        test(scenario, async ({ request }) => {
            const ordersClient = new OrdersClient(request);
            const response = await ordersClient.createOrder(data);
            const errorResponse = await response.json();

            expectCorrectResponse(response, 400);
            expect(errorResponse).toEqual({ error });
        });
    });

    const invalidFieldCases = [
        { scenario: 'should return 400 when user_id is a string', data: { user_id: 'abc', product_id: 1, quantity: 2, total: '39.98' }, error: 'user_id must be a positive integer' },
        { scenario: 'should return 400 when user_id is 0', data: { user_id: 0, product_id: 1, quantity: 2, total: '39.98' }, error: 'user_id must be a positive integer' },
        { scenario: 'should return 400 when user_id is negative', data: { user_id: -1, product_id: 1, quantity: 2, total: '39.98' }, error: 'user_id must be a positive integer' },
        { scenario: 'should return 400 when user_id is a decimal', data: { user_id: 1.5, product_id: 1, quantity: 2, total: '39.98' }, error: 'user_id must be a positive integer' },
        { scenario: 'should return 400 when product_id is a string', data: { user_id: 1, product_id: 'abc', quantity: 2, total: '39.98' }, error: 'product_id must be a positive integer' },
        { scenario: 'should return 400 when product_id is 0', data: { user_id: 1, product_id: 0, quantity: 2, total: '39.98' }, error: 'product_id must be a positive integer' },
        { scenario: 'should return 400 when product_id is negative', data: { user_id: 1, product_id: -1, quantity: 2, total: '39.98' }, error: 'product_id must be a positive integer' },
        { scenario: 'should return 400 when product_id is a decimal', data: { user_id: 1, product_id: 1.5, quantity: 2, total: '39.98' }, error: 'product_id must be a positive integer' },
        { scenario: 'should return 400 when quantity is 0', data: { user_id: 1, product_id: 1, quantity: 0, total: '39.98' }, error: 'quantity must be a positive integer' },
        { scenario: 'should return 400 when quantity is negative', data: { user_id: 1, product_id: 1, quantity: -1, total: '39.98' }, error: 'quantity must be a positive integer' },
        { scenario: 'should return 400 when quantity is a string', data: { user_id: 1, product_id: 1, quantity: 'abc', total: '39.98' }, error: 'quantity must be a positive integer' },
        { scenario: 'should return 400 when quantity is a decimal', data: { user_id: 1, product_id: 1, quantity: 1.5, total: '39.98' }, error: 'quantity must be a positive integer' },
        { scenario: 'should return 400 when total is a number', data: { user_id: 1, product_id: 1, quantity: 2, total: 39.98 }, error: 'total must be a positive numeric string' },
        { scenario: 'should return 400 when total is 0', data: { user_id: 1, product_id: 1, quantity: 2, total: '0' }, error: 'total must be a positive numeric string' },
        { scenario: 'should return 400 when total is negative', data: { user_id: 1, product_id: 1, quantity: 2, total: '-10.00' }, error: 'total must be a positive numeric string' },
        { scenario: 'should return 400 when total is non-numeric', data: { user_id: 1, product_id: 1, quantity: 2, total: 'not-a-number' }, error: 'total must be a positive numeric string' },
    ];

    invalidFieldCases.forEach(({ scenario, data, error }) => {
        test(scenario, async ({ request }) => {
            const ordersClient = new OrdersClient(request);
            const response = await ordersClient.createOrder(data);
            const errorResponse = await response.json();

            expectCorrectResponse(response, 400);
            expect(errorResponse).toEqual({ error });
        });
    });

    test('should return 400 when user_id references a non-existent user', async ({ request }) => {
        const productsClient = new ProductsClient(request);
        const ordersClient = new OrdersClient(request);

        const productRes = await productsClient.addProduct();
        const product = await productRes.json();

        const response = await ordersClient.createOrder({
            user_id: NON_EXISTENT_ID,
            product_id: product.id,
            quantity: 2,
            total: '39.98',
        });
        const errorResponse = await response.json();

        expectCorrectResponse(response, 400);
        expect(errorResponse).toEqual({ error: 'User not found' });
    });

    test('should return 400 when product_id references a non-existent product', async ({ request }) => {
        const usersClient = new UsersClient(request);
        const ordersClient = new OrdersClient(request);

        const userRes = await usersClient.createUser({ name: 'Test FK Product User', email: usersClient.generateEmail() });
        const user = await userRes.json();

        const response = await ordersClient.createOrder({
            user_id: user.id,
            product_id: NON_EXISTENT_ID,
            quantity: 2,
            total: '39.98',
        });
        const errorResponse = await response.json();

        expectCorrectResponse(response, 400);
        expect(errorResponse).toEqual({ error: 'Product not found' });
    });
});

test.describe('put order', () => {
    let orderId: number;

    test.beforeEach(async ({ request }) => {
        const result = await createOrderPrerequisites(request);
        orderId = result.orderId;
    });

    test.afterEach(async ({ request }) => {
        const ordersClient = new OrdersClient(request);
        try { await ordersClient.deleteOrder(orderId); } catch {}
    });

    test('should update an existing order', async ({ request }) => {
        const ordersClient = new OrdersClient(request);

        const response = await ordersClient.putOrder(orderId, {
            quantity: 10,
            total: '199.90',
        });
        const updatedOrder = await response.json();

        expectCorrectResponse(response, 200);
        expect(updatedOrder).toEqual({
            id: orderId,
            user_id: expect.any(Number),
            product_id: expect.any(Number),
            quantity: 10,
            total: '199.90',
            created_at: expect.any(String),
        });
    });

    test('should update only the quantity', async ({ request }) => {
        const ordersClient = new OrdersClient(request);
        const response = await ordersClient.putOrder(orderId, { quantity: 25 });
        const updatedOrder = await response.json();

        expectCorrectResponse(response, 200);
        expect(updatedOrder).toEqual(
            expect.objectContaining({
                id: orderId,
                quantity: 25,
                total: '19.99',
                created_at: expect.any(String)
            })
        );
    });

    test('should update only the total', async ({ request }) => {
        const ordersClient = new OrdersClient(request);
        const response = await ordersClient.putOrder(orderId, { total: '99.99' });
        const updatedOrder = await response.json();

        expectCorrectResponse(response, 200);
        expect(updatedOrder).toEqual(
            expect.objectContaining({
                id: orderId,
                quantity: 1,
                total: '99.99',
                created_at: expect.any(String)
            })
        );
    });

    test('should update only the user_id', async ({ request }) => {
        const usersClient = new UsersClient(request);
        const ordersClient = new OrdersClient(request);

        const newUserRes = await usersClient.createUser({ name: 'Test Another PUT User', email: usersClient.generateEmail() });
        const newUser = await newUserRes.json();

        const response = await ordersClient.putOrder(orderId, { user_id: newUser.id });
        const updatedOrder = await response.json();

        expectCorrectResponse(response, 200);
        expect(updatedOrder).toEqual(
            expect.objectContaining({
                id: orderId,
                user_id: newUser.id,
                quantity: 1,
                total: '19.99',
                created_at: expect.any(String)
            })
        );
    });

    test('should update only the product_id', async ({ request }) => {
        const productsClient = new ProductsClient(request);
        const ordersClient = new OrdersClient(request);

        const productRes = await productsClient.addProduct();
        const newProduct = await productRes.json();

        const response = await ordersClient.putOrder(orderId, { product_id: newProduct.id });
        const updatedOrder = await response.json();

        expectCorrectResponse(response, 200);
        expect(updatedOrder).toEqual(
            expect.objectContaining({
                id: orderId,
                product_id: newProduct.id,
                quantity: 1,
                total: '19.99',
                created_at: expect.any(String)
            })
        );
    });

    test('should return 400 when updating to a non-existent user', async ({ request }) => {
        const ordersClient = new OrdersClient(request);
        const response = await ordersClient.putOrder(orderId, { user_id: NON_EXISTENT_ID });
        const errorResponse = await response.json();

        expectCorrectResponse(response, 400);
        expect(errorResponse).toEqual({ error: 'User not found' });
    });

    test('should return 400 when updating to a non-existent product', async ({ request }) => {
        const ordersClient = new OrdersClient(request);
        const response = await ordersClient.putOrder(orderId, { product_id: NON_EXISTENT_ID });
        const errorResponse = await response.json();

        expectCorrectResponse(response, 400);
        expect(errorResponse).toEqual({ error: 'Product not found' });
    });

    test('should keep data unchanged after a failed update', async ({ request }) => {
        const ordersClient = new OrdersClient(request);

        const firstGetResponse = await ordersClient.getOrderById(orderId);
        const originalResponse = await firstGetResponse.json();
        expectCorrectResponse(firstGetResponse, 200);

        const response = await ordersClient.putOrder(orderId, { user_id: NON_EXISTENT_ID });
        const errorResponse = await response.json();
        expectCorrectResponse(response, 400);
        expect(errorResponse).toEqual({ error: 'User not found' });

        const lastGetResponse = await ordersClient.getOrderById(orderId);
        const lastResponse = await lastGetResponse.json();
        expectCorrectResponse(lastGetResponse, 200);

        expect(lastResponse).toEqual(originalResponse);
    });

    const testCases = [
        ...generateInvalidIdCases('order', 'Order not found', 'Invalid order ID')
            .map(tc => tc.inputId === 0
                ? { ...tc, errorCode: 400, expectedError: { error: 'Invalid order ID' } }
                : tc
            )
            .map(tc => ({ ...tc, data: { quantity: 5 } })),
        { scenario: 'should return 400 when updating an order with no fields', inputId: null, data: {}, errorCode: 400, expectedError: { error: 'At least one field must be provided' } },
        { scenario: 'should return 400 when updating user_id with a string', inputId: null, data: { user_id: 'abc' }, errorCode: 400, expectedError: { error: 'user_id must be a positive integer' } },
        { scenario: 'should return 400 when updating user_id with 0', inputId: null, data: { user_id: 0 }, errorCode: 400, expectedError: { error: 'user_id must be a positive integer' } },
        { scenario: 'should return 400 when updating user_id with a negative number', inputId: null, data: { user_id: -1 }, errorCode: 400, expectedError: { error: 'user_id must be a positive integer' } },
        { scenario: 'should return 400 when updating user_id with a decimal', inputId: null, data: { user_id: 1.5 }, errorCode: 400, expectedError: { error: 'user_id must be a positive integer' } },
        { scenario: 'should return 400 when updating product_id with a string', inputId: null, data: { product_id: 'abc' }, errorCode: 400, expectedError: { error: 'product_id must be a positive integer' } },
        { scenario: 'should return 400 when updating product_id with 0', inputId: null, data: { product_id: 0 }, errorCode: 400, expectedError: { error: 'product_id must be a positive integer' } },
        { scenario: 'should return 400 when updating product_id with a negative number', inputId: null, data: { product_id: -1 }, errorCode: 400, expectedError: { error: 'product_id must be a positive integer' } },
        { scenario: 'should return 400 when updating product_id with a decimal', inputId: null, data: { product_id: 1.5 }, errorCode: 400, expectedError: { error: 'product_id must be a positive integer' } },
        { scenario: 'should return 400 when updating quantity with 0', inputId: null, data: { quantity: 0 }, errorCode: 400, expectedError: { error: 'quantity must be a positive integer' } },
        { scenario: 'should return 400 when updating quantity with a negative number', inputId: null, data: { quantity: -1 }, errorCode: 400, expectedError: { error: 'quantity must be a positive integer' } },
        { scenario: 'should return 400 when updating quantity with a string', inputId: null, data: { quantity: 'abc' }, errorCode: 400, expectedError: { error: 'quantity must be a positive integer' } },
        { scenario: 'should return 400 when updating quantity with a decimal', inputId: null, data: { quantity: 1.5 }, errorCode: 400, expectedError: { error: 'quantity must be a positive integer' } },
        { scenario: 'should return 400 when updating total with a number', inputId: null, data: { total: 39.99 }, errorCode: 400, expectedError: { error: 'total must be a positive numeric string' } },
        { scenario: 'should return 400 when updating total with 0', inputId: null, data: { total: '0' }, errorCode: 400, expectedError: { error: 'total must be a positive numeric string' } },
        { scenario: 'should return 400 when updating total with a negative value', inputId: null, data: { total: '-10.00' }, errorCode: 400, expectedError: { error: 'total must be a positive numeric string' } },
        { scenario: 'should return 400 when updating total with a non-numeric string', inputId: null, data: { total: 'not-a-number' }, errorCode: 400, expectedError: { error: 'total must be a positive numeric string' } },
    ];

    testCases.forEach(({ scenario, inputId, data, errorCode, expectedError }) => {
        test(scenario, async ({ request }) => {
            const id = inputId ?? orderId;
            const ordersClient = new OrdersClient(request);
            const response = await ordersClient.putOrder(id, data);
            const errorResponse = await response.json();

            expectCorrectResponse(response, errorCode);
            expect(errorResponse).toEqual(expectedError);
        });
    });
});

test.describe('delete order', () => {
    test('should delete an existing order', async ({ request }) => {
        const { userId, productId, orderId: createdOrderId } = await createOrderPrerequisites(request);
        const ordersClient = new OrdersClient(request);

        const response = await ordersClient.deleteOrder(createdOrderId);
        const deletedOrder = await response.json();

        expectCorrectResponse(response, 200);
        expect(deletedOrder).toEqual({
            message: 'Order deleted',
            order: {
                id: createdOrderId,
                user_id: userId,
                product_id: productId,
                quantity: 1,
                total: '19.99',
                created_at: expect.any(String),
            },
        });
        expectCorrectOrderData(deletedOrder.order);

        const getResponse = await ordersClient.getOrderById(createdOrderId);
        expectCorrectResponse(getResponse, 404);
        expect(await getResponse.json()).toEqual({ error: 'Order not found' });
    });

    test('should return 404 when trying to delete an order for a second time', async ({ request }) => {
        const { userId, productId, orderId: createdOrderId } = await createOrderPrerequisites(request);
        const ordersClient = new OrdersClient(request);

        const response = await ordersClient.deleteOrder(createdOrderId);
        const deletedOrder = await response.json();

        expectCorrectResponse(response, 200);
        expect(deletedOrder).toEqual({
            message: 'Order deleted',
            order: {
                id: createdOrderId,
                user_id: userId,
                product_id: productId,
                quantity: 1,
                total: '19.99',
                created_at: expect.any(String),
            },
        });

        const secondResponse = await ordersClient.deleteOrder(createdOrderId);
        const secondErrorResponse = await secondResponse.json();
        expectCorrectResponse(secondResponse, 404);
        expect(secondErrorResponse).toEqual({ error: 'Order not found' });
    });

    const testCases = generateInvalidIdCases('order', 'Order not found', 'Invalid order ID')
        .map(tc => ({ ...tc, orderId: tc.inputId }));

    testCases.forEach(({ scenario, orderId, errorCode, expectedError }) => {
        test(scenario, async ({ request }) => {
            const ordersClient = new OrdersClient(request);
            const response = await ordersClient.deleteOrder(orderId);
            const errorResponse = await response.json();

            expectCorrectResponse(response, errorCode);
            expect(errorResponse).toEqual(expectedError);
        });
    });
});