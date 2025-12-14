const mysql = require('mysql2/promise');

// 为 comments 表添加 parent_id 字段
const addParentIdColumn = async () => {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '123456',
      database: 'movie_db'
    });

    console.log('✓ 已连接到数据库');

    // 检查字段是否已存在
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'movie_db' 
      AND TABLE_NAME = 'comments' 
      AND COLUMN_NAME = 'parent_id'
    `);

    if (columns.length > 0) {
      console.log('✓ parent_id 字段已存在，无需添加');
      await connection.end();
      return;
    }

    // 添加 parent_id 字段
    await connection.query(`
      ALTER TABLE comments 
      ADD COLUMN parent_id INT DEFAULT NULL AFTER movie_id,
      ADD INDEX idx_parent_id (parent_id),
      ADD CONSTRAINT fk_parent_comment 
        FOREIGN KEY (parent_id) 
        REFERENCES comments(id) 
        ON DELETE CASCADE
    `);

    console.log('✓ 成功添加 parent_id 字段和外键约束');
    
    await connection.end();
    console.log('\n✓ 数据库迁移完成！');
  } catch (error) {
    console.error('✗ 数据库迁移失败:', error.message);
    process.exit(1);
  }
};

// 执行迁移
addParentIdColumn();
