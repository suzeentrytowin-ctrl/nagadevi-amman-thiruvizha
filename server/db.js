// =====================================================================
// அருள்மிகு புற்றுக்கண் நாகதேவி அம்மன் திருக்கோயில்
// PostgreSQL Database Connection & Query Module
// =====================================================================

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const poolConfig = {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    database: process.env.PGDATABASE || 'nagadevi_temple',
    user: process.env.PGUSER || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
};

if (process.env.DATABASE_URL) {
    poolConfig.connectionString = process.env.DATABASE_URL;
    // Cloud-hosted PostgreSQL (Render, Neon, Supabase) requires SSL
    if (!poolConfig.connectionString.includes('localhost') && !poolConfig.connectionString.includes('127.0.0.1')) {
        poolConfig.ssl = { rejectUnauthorized: false };
    }
} else if (process.env.PGPASSWORD !== undefined) {
    poolConfig.password = String(process.env.PGPASSWORD);
} else {
    poolConfig.password = 'postgres';
}

const pool = new Pool(poolConfig);

let isConnected = false;

// Test connection
pool.on('connect', () => {
    if (!isConnected) {
        console.log('✅ PostgreSQL Database connected successfully');
        isConnected = true;
    }
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle PostgreSQL client:', err.message);
});

async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        return res;
    } catch (error) {
        console.error('Database Query Error:', error.message, 'SQL:', text);
        throw error;
    }
}

async function getClient() {
    const client = await pool.connect();
    return client;
}

// Transaction runner helper
async function withTransaction(callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

// Initialize database schema from schema.sql
async function initDb() {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            await pool.query(schemaSql);
            console.log('✅ Database schema initialized successfully');
        }
    } catch (err) {
        console.warn('⚠️ Note: Database schema init warning (DB may not be reachable or role not created):', err.message);
    }
}

module.exports = {
    pool,
    query,
    getClient,
    withTransaction,
    initDb
};
