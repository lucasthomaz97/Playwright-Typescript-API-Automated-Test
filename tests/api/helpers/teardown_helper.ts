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
        await pool.query("DELETE FROM orders USING users, products WHERE orders.user_id = users.id AND orders.product_id = products.id AND (users.name ILIKE '%test%' OR products.name ILIKE '%test%')");
        await pool.query("DELETE FROM products WHERE name ILIKE '%test%'");
        await pool.query("DELETE FROM users WHERE name ILIKE '%test%'");
    } finally {
        await pool.end();
        
        console.log('Finished Teardown!');
    }
}