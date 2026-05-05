import mysql from "mysql2/promise";
import "dotenv/config";

const config = {
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  user: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
};

const pool = mysql.createPool(config);

export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Connected to MySQL");
    conn.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    // Optional in production: fail fast so Railway restarts with corrected env
    // process.exit(1);
  }
}

testConnection();

export default pool;
