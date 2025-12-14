const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// 添加管理员系统相关字段和数据
const setupAdminSystem = async () => {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '123456',
      database: 'movie_db'
    });

    console.log('✓ 已连接到数据库');

    // 1. 检查并添加 users 表的 role 字段
    const [roleColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'movie_db' 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'role'
    `);

    if (roleColumns.length === 0) {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user' AFTER password,
        ADD INDEX idx_role (role)
      `);
      console.log('✓ 已为 users 表添加 role 字段');
    } else {
      console.log('✓ users 表已有 role 字段');
    }

    // 2. 检查并添加 movies 表的 status 字段
    const [statusColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'movie_db' 
      AND TABLE_NAME = 'movies' 
      AND COLUMN_NAME = 'status'
    `);

    if (statusColumns.length === 0) {
      await connection.query(`
        ALTER TABLE movies 
        ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active' AFTER country,
        ADD INDEX idx_status (status)
      `);
      console.log('✓ 已为 movies 表添加 status 字段');
    } else {
      console.log('✓ movies 表已有 status 字段');
    }

    // 3. 创建默认管理员账号
    const [existingAdmin] = await connection.query(
      'SELECT id FROM users WHERE username = ?',
      ['admin']
    );

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('111111', 10);
      await connection.query(
        `INSERT INTO users (username, nickname, email, password, role) 
         VALUES (?, ?, ?, ?, ?)`,
        ['admin', '系统管理员', 'admin@movie.com', hashedPassword, 'admin']
      );
      console.log('✓ 已创建默认管理员账号');
      console.log('  账号: admin');
      console.log('  密码: 111111');
    } else {
      console.log('✓ 管理员账号已存在');
    }

    await connection.end();
    console.log('\n✓ 管理员系统初始化完成！');
  } catch (error) {
    console.error('✗ 初始化失败:', error.message);
    process.exit(1);
  }
};

// 执行初始化
setupAdminSystem();
