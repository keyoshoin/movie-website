const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const migrateDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',  // 必须是 127.0.0.1
      user: 'root',
      password: '123456', // 必须是 123456
    });

    await connection.query('USE movie_db;');

    // 检查电影表是否已有新列，如果没有则添加
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'movies' AND TABLE_SCHEMA = 'movie_db'
    `);

    const columnNames = columns.map(col => col.COLUMN_NAME);

    if (!columnNames.includes('director')) {
      console.log('添加 director 列...');
      await connection.query('ALTER TABLE movies ADD COLUMN director VARCHAR(100);');
      console.log('✓ director 列已添加');
    }

    if (!columnNames.includes('duration')) {
      console.log('添加 duration 列...');
      await connection.query('ALTER TABLE movies ADD COLUMN duration INT;');
      console.log('✓ duration 列已添加');
    }

    if (!columnNames.includes('country')) {
      console.log('添加 country 列...');
      await connection.query('ALTER TABLE movies ADD COLUMN country VARCHAR(100);');
      console.log('✓ country 列已添加');
    }

    // 检查电影表是否为空，如果为空则在显式允许时自动导入数据
    // 为避免在未显式启动/允许时自动填充数据库，默认关闭自动导入。
    // 如果希望启用，请在启动时设置环境变量 `AUTO_IMPORT_MOVIES=true`。
    const [movies] = await connection.query('SELECT COUNT(*) as count FROM movies');
    if (movies[0].count === 0) {
      if (String(process.env.AUTO_IMPORT_MOVIES).toLowerCase() === 'true') {
        console.log('\n检测到电影表为空，开始自动导入影片数据...');
        const dataFilePath = path.join(__dirname, '../data/movies.json');

        if (fs.existsSync(dataFilePath)) {
          const data = fs.readFileSync(dataFilePath, 'utf8');
          const moviesData = JSON.parse(data);

          if (Array.isArray(moviesData)) {
            for (const m of moviesData) {
              const title = m.title || m.name;
              if (!title) continue;

              const genreValue = Array.isArray(m.genre) ? m.genre.join(', ') : (m.genre || null);
              const poster = m.poster_url || m.poster || null;
              const year = m.year ? parseInt(m.year) : null;
              const rating = (m.rating !== undefined && m.rating !== null) ? Number(m.rating) : null;
              const director = m.director || null;
              const duration = m.duration ? parseInt(m.duration) : null;
              const country = m.country || null;

              await connection.execute(
                'INSERT INTO movies (title, description, genre, year, rating, poster_url, director, duration, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [title, m.description || m.synopsis || null, genreValue, year, rating, poster, director, duration, country]
              );
              console.log(`  ✓ 已导入: ${title}`);
            }
            console.log(`✓ 共导入 ${moviesData.length} 条影片数据`);
          }
        } else {
          console.log('⚠ 警告: data/movies.json 文件不存在，跳过自动导入');
        }
      } else {
        console.log('\n检测到电影表为空，但自动导入被禁用（设置 AUTO_IMPORT_MOVIES=true 可启用）。跳过导入。');
      }
    }

    await connection.end();
    console.log('\n✓ 数据库迁移成功！');
  } catch (error) {
    console.error('✗ 数据库迁移失败:', error.message);
    process.exit(1);
  }
};

module.exports = migrateDatabase;
