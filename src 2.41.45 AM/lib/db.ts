import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: '123456',
  host: 'localhost',
  port: 5433,
  database: 'data1',
});

export default pool; 