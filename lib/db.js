import mysql from "mysql2/promise";

// One shared connection pool (kept on globalThis so Next.js hot reload doesn't create many pools)
const g = globalThis;
export const db =
  g._pool ??
  (g._pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "eventra",
    dateStrings: true,
    connectionLimit: 10,
  }));
