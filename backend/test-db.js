const db = require('./config/db');

async function testConnection() {
    try {
        const [rows] = await db.query('SELECT 1 AS result');
        console.log('MySQL connection successful!', rows);
    } catch (error) {
        console.log('MySQL connection failed:', error.message);
    } finally {
        await db.end();
    }
}

testConnection();