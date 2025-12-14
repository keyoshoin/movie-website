require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

(async function importMovies(){
  try {
    const filePath = path.join(__dirname, '../data/movies.json');
    if (!fs.existsSync(filePath)) {
      console.error('找不到文件:', filePath);
      process.exit(1);
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const movies = JSON.parse(data);
    if (!Array.isArray(movies)) {
      console.error('movies.json 格式不正确，期望数组');
      process.exit(1);
    }

    console.log(`准备导入 ${movies.length} 条电影记录...`);

    for (const m of movies) {
      const title = m.title || m.name;
      if (!title) {
        console.warn('跳过没有标题的记录', m);
        continue;
      }

      // 检查是否已存在同名电影（按标题）
      const [exists] = await pool.execute('SELECT id FROM movies WHERE title = ?', [title]);
      if (exists.length > 0) {
        console.log('跳过已存在：', title);
        continue;
      }

      const genreValue = Array.isArray(m.genre) ? m.genre.join(', ') : (m.genre || null);
      const poster = m.poster_url || m.poster || null;
      const year = m.year ? parseInt(m.year) : null;
      const rating = (m.rating !== undefined && m.rating !== null) ? Number(m.rating) : null;

      await pool.execute(
        'INSERT INTO movies (title, description, genre, year, rating, poster_url) VALUES (?, ?, ?, ?, ?, ?)',
        [title, m.description || m.synopsis || null, genreValue, year, rating, poster]
      );

      console.log('已插入：', title);
    }

    console.log('导入完成');
    process.exit(0);
  } catch (err) {
    console.error('导入失败:', err);
    process.exit(1);
  } finally {
    try { await pool.end(); } catch(e){}
  }
})();
