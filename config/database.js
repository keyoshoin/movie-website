const mysql = require('mysql2/promise');

// 数据库连接池配置
const pool = mysql.createPool({
  host: '127.0.0.1',      // 强制 IPv4
  user: 'root',
  password: '123456',     // 强制密码
  database: 'movie_db',   // 数据库名
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// 添加数据库连接检测方法，用于在运行时判断能否访问 MySQL
pool.checkConnection = async function() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    console.error('数据库连接检测失败:', err && err.message ? err.message : err);
    return false;
  }
};

module.exports = pool;
