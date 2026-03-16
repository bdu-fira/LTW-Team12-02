import mysql from 'mysql2/promise'

export function createPool() {
  // Cho phép dùng connection string (ví dụ: mysql://user:pass@host:port/db)
  const connectionString = process.env.DATABASE_URL || process.env.MYSQL_URL

  if (connectionString) {
    return mysql.createPool(connectionString)
  }

  return mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'shop',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
}
