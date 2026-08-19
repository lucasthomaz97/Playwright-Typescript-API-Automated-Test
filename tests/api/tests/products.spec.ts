import { test, expect } from '@playwright/test';
import { ProductsClient } from '../clients/products_client';
import { UsersClient } from '../clients/users_client';
import { OrdersClient } from '../clients/orders_client';
import { Product } from '../models/Product';
import { expectCorrectResponse } from '../helpers/response_helper';
import { expectCorrectProductData } from '../helpers/product_helper';
import { NON_EXISTENT_ID } from '../helpers/constants';

test.describe('get products', () => {
    test.beforeAll(async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const response = await productsClient.addProduct();
        expect(response.ok()).toBeTruthy();
    });

    test('should return a list of products', async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const response = await productsClient.getProducts();
        const products = await response.json();

        expectCorrectResponse(response, 200);
        expect(Array.isArray(products)).toBe(true);

        products.forEach((product: Product) => {
            expect(product).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    price: expect.any(String),
                    description: expect.any(String),
                    created_at: expect.any(String)
                })
            );

            expectCorrectProductData(product);
        });
    });

    test('should return more products after adding 10', async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);

        const initialResponse = await productsClient.getProducts();
        const initialProducts = await initialResponse.json();
        const initialSize = initialProducts.length;
        expectCorrectResponse(initialResponse, 200);

        for (let i = 0; i < 10; i++) {
            const res = await productsClient.addProduct();
            expect(res.ok()).toBeTruthy();
        }

        const lastResponse = await productsClient.getProducts();
        const updatedProducts = await lastResponse.json();

        expectCorrectResponse(lastResponse, 200);
        expect(updatedProducts.length).toBe(initialSize + 10);
    });
});

test.describe('get product by ID', () => {
    let productId: number;

    test.beforeAll(async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const response = await productsClient.addProduct();
        expect(response.ok()).toBeTruthy();
        const product = await response.json();
        productId = product.id;
    });

    test('should return a product by ID', async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const response = await productsClient.getProductById(productId);
        const product = await response.json();

        expectCorrectResponse(response, 200);
        expect(product).toEqual(
            expect.objectContaining({
                id: productId,
                name: expect.any(String),
                price: expect.any(String),
                description: expect.any(String),
                created_at: expect.any(String)
            })
        );
        expectCorrectProductData(product);
    });

    const testCases = [
        {"scenario": "should return 404 for a non-existent product ID", "productId": NON_EXISTENT_ID, "errorCode": 404, "expectedError": { error: 'Product not found' }},
        {"scenario": "should return 400 for an invalid product ID", "productId": "invalid", "errorCode": 400, "expectedError": { error: 'Invalid product ID' }},
        {"scenario": "should return 400 for a negative product ID", "productId": -1, "errorCode": 400, "expectedError": { error: 'Invalid product ID' }},
        {"scenario": "should return 400 for a decimal ID", "productId": 1.5, "errorCode": 400, "expectedError": { error: 'Invalid product ID' }},
        {"scenario": "should return 404 for a product with ID 0", "productId": 0, "errorCode": 404, "expectedError": { error: 'Product not found' }},
    ];

    testCases.forEach(({ scenario, productId, errorCode, expectedError }) => {
        test(scenario, async ({ request }) => {
            const productsClient: ProductsClient = new ProductsClient(request);
            const response = await productsClient.getProductById(productId);
            const errorResponse = await response.json();

            expectCorrectResponse(response, errorCode);
            expect(errorResponse).toEqual(expectedError);
        });
    });
});

test.describe('post product', () => {
    test('should create a new product', async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const response = await productsClient.postProduct({ name: 'Test Product', price: '19.99', description: 'This is a test product' });
        const product = await response.json();

        expectCorrectResponse(response, 201);
        expect(product).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                name: 'Test Product',
                price: '19.99',
                description: 'This is a test product',
                created_at: expect.any(String)
            })
        );
        expectCorrectProductData(product);
    });

    const testCases = [
        { scenario: 'should return 400 when product name is missing', productData: { price: '19.99', description: 'This is a test product' }, errorCode: 400, expectedError: { error: 'Name and price are required' } },
        { scenario: 'should return 400 when product price is missing', productData: { name: 'Test Product', description: 'This is a test product' }, errorCode: 400, expectedError: { error: 'Name and price are required' } },
        { scenario: 'should return 400 when product name is a number', productData: { name: 123, price: '19.99', description: 'This is a test product' }, errorCode: 400, expectedError: { error: 'Name must be a string' } },
        { scenario: 'should return 400 when product price is a negative string', productData: { name: 'Test Product', price: '-19.99', description: 'This is a test product' }, errorCode: 400, expectedError: { error: 'Price must be a positive numeric string' } },
        { scenario: 'should return 400 when product price is a non-numeric string', productData: { name: 'Test Product', price: 'abc', description: 'This is a test product' }, errorCode: 400, expectedError: { error: 'Price must be a positive numeric string' } },
        { scenario: 'should return 400 when product description is a number', productData: { name: 'Test Product', price: '19.99', description: 123 }, errorCode: 400, expectedError: { error: 'Description must be a string' } },
    ];

    testCases.forEach(({ scenario, productData, errorCode, expectedError }) => {
        test(scenario, async ({ request }) => {
            const productsClient: ProductsClient = new ProductsClient(request);
            const response = await productsClient.postProduct(productData);
            const errorResponse = await response.json();

            expectCorrectResponse(response, errorCode);
            expect(errorResponse).toEqual(expectedError);
        });
    });
});

test.describe('put product', () => {
    let productId: number;

    test.beforeEach(async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const response = await productsClient.addProduct();
        expect(response.ok()).toBeTruthy();
        const product = await response.json();
        productId = product.id;
    });

    test.afterEach(async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        try { await productsClient.deleteProduct(productId); } catch {}
    });

    test('should update an existing product', async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const response = await productsClient.putProduct(productId, {
            name: 'Test Updated Product',
            price: '39.99',
            description: 'This is an updated product',
        });
        const updatedProduct = await response.json();

        expectCorrectResponse(response, 200);
        expect(updatedProduct).toEqual({
            id: productId,
            name: 'Test Updated Product',
            price: '39.99',
            description: 'This is an updated product',
            created_at: expect.any(String)
        });
    });

    test('should keep data unchanged after failed update', async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);

        const firstGetResponse = await productsClient.getProductById(productId);
        const originalResponse = await firstGetResponse.json();
        expectCorrectResponse(firstGetResponse, 200);

        const badResponse = await productsClient.putProduct(productId, {
            name: 'Test Updated Product',
            price: 39.99,
            description: 'This is an updated product',
        });
        const errorResponse = await badResponse.json();
        expectCorrectResponse(badResponse, 400);
        expect(errorResponse).toEqual({ error: 'Price must be a positive numeric string' });

        const lastResponse = await productsClient.getProductById(productId);
        expectCorrectResponse(lastResponse, 200);
        const lastProduct = await lastResponse.json();
        expect(lastProduct).toEqual(originalResponse);
    });

    test('should update only the name', async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);
        const response = await productsClient.putProduct(productId, { name: 'Updated Product Name' });
        const updatedProduct = await response.json();

        expectCorrectResponse(response, 200);
        expect(updatedProduct).toEqual(
            expect.objectContaining({
                id: productId,
                name: 'Updated Product Name',
                price: '19.99',
                description: 'This is a test product',
                created_at: expect.any(String)
            })
        );
    });

    const testCases = [
        { scenario: 'should return 404 when updating a non-existent product', inputId: NON_EXISTENT_ID, productData: {name: 'Test Updated Product', price: '39.99', description: 'This is an updated product'}, errorCode: 404, expectedError: { error: 'Product not found' } },
        { scenario: 'should return 400 when updating a product with an invalid ID', inputId: 'invalid', productData: {name: 'Test Updated Product', price: '39.99', description: 'This is an updated product'}, errorCode: 400, expectedError: { error: 'Invalid product ID' } },
        { scenario: 'should return 400 when updating a product with a negative ID', inputId: -1, productData: {name: 'Test Updated Product', price: '39.99', description: 'This is an updated product'}, errorCode: 400, expectedError: { error: 'Invalid product ID' } },
        { scenario: 'should return 400 when updating a product with a decimal ID', inputId: 1.5, productData: {name: 'Test Updated Product', price: '39.99', description: 'This is an updated product'}, errorCode: 400, expectedError: { error: 'Invalid product ID' } },
        { scenario: 'should return 400 when updating a product with no fields', inputId: null, productData: {}, errorCode: 400, expectedError: { error: 'At least one field must be provided' } },
        { scenario: 'should return 400 when updating a product name with a number', inputId: null, productData: { name: 123 }, errorCode: 400, expectedError: { error: 'Name must be a string' } },
        { scenario: 'should return 400 when updating a product price with a negative string', inputId: null, productData: { price: '-10' }, errorCode: 400, expectedError: { error: 'Price must be a positive numeric string' } },
        { scenario: 'should return 400 when updating a product price with a non-numeric string', inputId: null, productData: { price: 'abc' }, errorCode: 400, expectedError: { error: 'Price must be a positive numeric string' } },
        { scenario: 'should return 400 when updating a product description with a number', inputId: null, productData: { description: 123 }, errorCode: 400, expectedError: { error: 'Description must be a string' } },
    ];

    testCases.forEach(({ scenario, inputId, productData, errorCode, expectedError }) => {
        test(scenario, async ({ request }) => {
            const id = inputId ?? productId;
            const productsClient: ProductsClient = new ProductsClient(request);
            const response = await productsClient.putProduct(id, productData);
            const errorResponse = await response.json();

            expectCorrectResponse(response, errorCode);
            expect(errorResponse).toEqual(expectedError);
        });
    });
});

test.describe('delete product', () => {
    test('should delete an existing product', async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);

        const addResponse = await productsClient.addProduct();
        const product = await addResponse.json();

        const response = await productsClient.deleteProduct(product.id);
        const deletedProduct = await response.json();

        expectCorrectResponse(response, 200);
        expect(deletedProduct).toEqual({
            "message": "Product deleted",
            "product": {
                id: product.id,
                name: expect.any(String),
                price: expect.any(String),
                description: expect.any(String),
                created_at: expect.any(String)
            }
        });
        expectCorrectProductData(deletedProduct.product);

        const getResponse = await productsClient.getProductById(product.id);
        expectCorrectResponse(getResponse, 404);
        expect(await getResponse.json()).toEqual({ error: 'Product not found' });
    });

    test('should return 404 when trying to delete a product for a second time', async ({ request }) => {
        const productsClient: ProductsClient = new ProductsClient(request);

        const addResponse = await productsClient.addProduct();
        const product = await addResponse.json();

        const response = await productsClient.deleteProduct(product.id);
        expectCorrectResponse(response, 200);

        const secondResponse = await productsClient.deleteProduct(product.id);
        const errorResponse = await secondResponse.json();
        expectCorrectResponse(secondResponse, 404);
        expect(errorResponse).toEqual({ error: 'Product not found' });
    });

    test('should delete a product with associated orders via cascade', async ({ request }) => {
        const usersClient = new UsersClient(request);
        const productsClient = new ProductsClient(request);
        const ordersClient = new OrdersClient(request);

        const userRes = await usersClient.createUser({ name: 'Test Product Cascade User', email: usersClient.generateEmail() });
        expect(userRes.ok()).toBeTruthy();
        const user = await userRes.json();

        const productRes = await productsClient.addProduct();
        expect(productRes.ok()).toBeTruthy();
        const product = await productRes.json();

        const orderRes = await ordersClient.createOrder({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
            total: '19.99',
        });
        expect(orderRes.ok()).toBeTruthy();
        const order = await orderRes.json();

        const deleteRes = await productsClient.deleteProduct(product.id);
        expectCorrectResponse(deleteRes, 200);
        const deleteBody = await deleteRes.json();
        expect(deleteBody).toEqual({
            message: 'Product deleted',
            product: {
                id: product.id,
                name: expect.any(String),
                price: expect.any(String),
                description: expect.any(String),
                created_at: expect.any(String),
            },
        });

        const verifyRes = await ordersClient.getOrderById(order.id);
        expect(verifyRes.status()).toBe(404);
    });

    const testCases = [
        {"scenario": "should return 404 for a non-existent product ID", "productId": NON_EXISTENT_ID, "errorCode": 404, "expectedError": { error: 'Product not found' }},
        {"scenario": "should return 400 for an invalid product ID", "productId": "invalid", "errorCode": 400, "expectedError": { error: 'Invalid product ID' }},
        {"scenario": "should return 400 for a negative product ID", "productId": -1, "errorCode": 400, "expectedError": { error: 'Invalid product ID' }},
        {"scenario": "should return 400 for a decimal product ID", "productId": 1.5, "errorCode": 400, "expectedError": { error: 'Invalid product ID' }},
        {"scenario": "should return 404 for a product with ID 0", "productId": 0, "errorCode": 404, "expectedError": { error: 'Product not found' }},
    ];

    testCases.forEach(({ scenario, productId, errorCode, expectedError }) => {
        test(scenario, async ({ request }) => {
            const productsClient: ProductsClient = new ProductsClient(request);
            const response = await productsClient.deleteProduct(productId);
            const errorResponse = await response.json();

            expectCorrectResponse(response, errorCode);
            expect(errorResponse).toEqual(expectedError);
        });
    });
});
