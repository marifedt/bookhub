import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const db = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function connectDB() {
  try {
    const client = await db.connect();
    console.log('Database connected successfully!');
    client.release();
  } catch (err) {
    console.error('Database Connection Failed:', err);
    console.error('FATAL: Database connection error. Existing application.');
    throw err;
  }
}

export default db;