import 'dotenv/config';
import pg from 'pg';

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

export async function connectDB(){
    try {
        await db.connect();
        console.log('Database connected successfully!');
    } catch (err) {
        console.error('FATAL: Database connection error. Existing application.');
        throw err;
    }
}

export default db;