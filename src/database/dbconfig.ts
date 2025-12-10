import sql from "mssql";
import dotenv from "dotenv";
import assert from "assert";
dotenv.config();

const { DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT, CEDARBASE } = process.env;


assert(DB_USER, "@user - false");
assert(DB_PASSWORD, "@password - false");
assert(DB_SERVER, "@server - false");
assert(DB_PORT, "@port - false");
assert(CEDARBASE, "@database - false");

export const Config = {
  port: DB_PORT,
  sqlConfig: {
    user: DB_USER,
    password: DB_PASSWORD,
    server: DB_SERVER,
    database: CEDARBASE,
    connectionTimeout: 15000,
    requestTimeout: 15000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true,
    },
  },
};

let connectionPool: sql.ConnectionPool | null = null;

const initializeConnection = async () => {
  if (connectionPool && connectionPool.connected) {
    console.log("Using Existing Database Connection");
    return connectionPool;
  }

  try {
    connectionPool = await sql.connect(Config.sqlConfig);
    console.log("Connected to MSSQL Database");
    return connectionPool;
  } catch (error) {
    console.error(`Database configuration`, error);
  }
};

export const getConnectionPool = (): sql.ConnectionPool => {
  if (!connectionPool || !connectionPool.connected) {
    throw new Error("Database not connected");
  }
  return connectionPool;
};

export default initializeConnection;
