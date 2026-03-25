import decrypt from '@/components/Decrypt';
import * as sql from 'mssql';

const SERV = await decrypt(process.env.DB_SERVER!)
const DB = await decrypt(process.env.DB_DATABASE!)
const USER = await decrypt(process.env.DB_USER!)
const PASSWORD = await decrypt(process.env.DB_PASSWORD!)

// console.log(SERV,DB,USER,PASSWORD)
// Validate environment variables
if (
  !SERV ||
  !DB ||
  !USER ||
  !PASSWORD
) {
  throw new Error('Missing server environment variables. Please check your .env.local file.');
}


const config = {
  server: SERV,
  database: DB,
  user: USER,
  password: PASSWORD,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};
let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  // If pool exists and is already connected, return it
  if (pool && pool.connected) {
    console.log("Database Connected !!!");
    return pool;
  }

  // If pool exists and is currently connecting, wait for it
  if (pool && pool.connecting) {
    console.log("Database connection in progress, waiting...");
    return pool;
  }

  // Create new pool and connect
  try {
    console.log("Creating new database connection...");
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log("Database Connection Successful.");

    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    pool = null;
    throw err;
  }
}

// export default getConnection;
