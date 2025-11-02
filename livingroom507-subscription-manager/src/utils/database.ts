import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const connectToDatabase = async () => {
  try {
    await pool.connect();
    console.log('Connected to the database');
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  }
};

export default pool;
