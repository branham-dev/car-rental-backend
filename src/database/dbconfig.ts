import sql from "mssql";
import dotenv from "dotenv";
import assert from "assert";
dotenv.config();

const { USER, PASSWORD, SERVER, PORT, DATABASE } = process.env;

assert(USER, "@user - false");
assert(PASSWORD, "@password - false");
assert(SERVER, "@server - false");
assert(PORT, "@port - false");
assert(DATABASE, "@database - false");

export const Config = {
  port: PORT,
  sqlConfig: {
    user: USER,
    password: PASSWORD,
    server: SERVER,
    database: DATABASE,
    connectionTimeout: 15000,
    requestTimeout: 15000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    options: {
      encrypt: false,
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
