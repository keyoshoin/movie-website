require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

(async function importUsers(){
  try {
    const filePath = path.join(__dirname, '../data/users.json');
    if (!fs.existsSync(filePath)) {
      console.error('找不到文件:', filePath);
      process.exit(1);
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const users = JSON.parse(data);
    if (!Array.isArray(users)) {
      console.error('users.json 格式不正确，期望数组');
      process.exit(1);
    }

    console.log(`准备导入 ${users.length} 条用户记录...`);

    for (const u of users) {
      const username = u.username;
      const email = u.email;
      const password = u.password; // 假定已哈希
      if (!username || !email) {
        console.warn('跳过缺少用户名或邮箱的记录', u);
        continue;
      }

      // 检查是否已存在同名或同邮箱用户
      const [exists] = await pool.execute('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
      if (exists.length > 0) {
        console.log('跳过已存在：', email);
        continue;
      }

      const createdAt = u.createdAt ? new Date(u.createdAt) : null;

      await pool.execute(
        'INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, ?)',
        [username, email, password, createdAt]
      );

      console.log('已插入：', username);
    }

    console.log('用户导入完成');
    process.exit(0);
  } catch (err) {
    console.error('用户导入失败:', err);
    process.exit(1);
  } finally {
    try { await pool.end(); } catch(e){}
  }
})();
