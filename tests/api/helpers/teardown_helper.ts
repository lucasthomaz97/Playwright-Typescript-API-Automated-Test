import 'dotenv/config';
import { Pool } from 'pg';

export default async function teardownHelper() {
    console.log('\nRunning Teardown...');

    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'ecommerce',
    });

    try {
        try {
            const orderResult = await pool.query("DELETE FROM orders USING users, products WHERE orders.user_id = users.id AND orders.product_id = products.id AND (users.name ILIKE '%test%' OR products.name ILIKE '%test%')");
            console.log(`Deleted ${orderResult.rowCount} test order(s)`);
        } catch (err) {
            console.error('Failed to delete test orders:', err);
        }

        try {
            const productResult = await pool.query("DELETE FROM products WHERE name ILIKE '%test%'");
            console.log(`Deleted ${productResult.rowCount} test product(s)`);
        } catch (err) {
            console.error('Failed to delete test products:', err);
        }

        try {
            const userResult = await pool.query("DELETE FROM users WHERE name ILIKE '%test%'");
            console.log(`Deleted ${userResult.rowCount} test user(s)`);
        } catch (err) {
            console.error('Failed to delete test users:', err);
        }
    } finally {
        await pool.end();
        
        console.log('Finished Teardown!');
    }
}