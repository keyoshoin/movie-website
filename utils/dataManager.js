const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// 辅助：将数据库中的电影记录标准化为前端友好的格式
function normalizeMovie(row) {
  if (!row) return row;
  const movie = { ...row };
  // 把 genre 字段统一为数组
  if (Array.isArray(movie.genre)) {
    // already array
  } else if (typeof movie.genre === 'string') {
    movie.genre = movie.genre.split(',').map(s => s.trim()).filter(Boolean);
  } else {
    movie.genre = [];
  }
  // 把数字字段转成 number
  movie.id = Number(movie.id);
  movie.year = movie.year !== null ? Number(movie.year) : movie.year;
  movie.rating = movie.rating !== null ? Number(movie.rating) : movie.rating;
  return movie;
}

class DataManager {
  // ========== 用户相关操作 ==========
  
  // 创建用户
  static async createUser(userData) {
    try {
      const connection = await pool.getConnection();
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // 修改 SQL：增加 nickname 字段
      const sql = `
        INSERT INTO users (username, email, password, nickname, avatar) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      // 注意：这里要把 nickname 传进去 (如果用户没填昵称，默认用用户名)
      const [result] = await connection.query(sql, [
        userData.username, 
        userData.email, 
        hashedPassword, 
        userData.nickname || userData.username, // 优先存昵称，没有则存用户名
        userData.avatar || null
      ]);
      
      connection.release();
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // 根据用户名查找用户
  static async findUserByUsername(username) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      connection.release();
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // 根据邮箱查找用户
  static async findUserByEmail(email) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      connection.release();
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // 根据 ID 查找用户
  static async findUserById(id) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [id]);
      connection.release();
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // 验证密码
  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // 更新用户信息
  static async updateUser(id, updates) {
    try {
      const connection = await pool.getConnection();
      
      let query = 'UPDATE users SET ';
      const values = [];
      const fields = [];

      // 1. 处理邮箱
      if (updates.email) {
        fields.push('email = ?');
        values.push(updates.email);
      }

      // 2. 处理密码 (保持原有的加密逻辑)
      if (updates.password) {
        const hashedPassword = await bcrypt.hash(updates.password, 10);
        fields.push('password = ?');
        values.push(hashedPassword);
      }

      // 3. ★★★ 必须要有这一段，否则头像存不进去 ★★★
      if (updates.avatar) {
        fields.push('avatar = ?');
        values.push(updates.avatar);
      }

      // --- 新增: 处理个人简介 ---
      if (updates.bio) {
        fields.push('bio = ?');
        values.push(updates.bio);
      }

       // 5. 检查昵称
       if (updates.nickname) {
        fields.push('nickname = ?');
        values.push(updates.nickname);
      }
      // 如果没有任何字段需要更新，直接返回
      if (fields.length === 0) {
        connection.release();
        return { affectedRows: 0 };
      }

      // 拼接 SQL，并自动更新 updated_at 时间
      query += fields.join(', ') + ', updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      values.push(id);

      const [result] = await connection.execute(query, values);
      connection.release();
      return result;
    } catch (error) {
      throw error;
    }
  }
  // ========== 电影相关操作 ==========

  // 获取所有电影
  static async getAllMovies() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT * FROM movies ORDER BY year DESC');
      connection.release();
      return rows.map(normalizeMovie);
    } catch (error) {
      throw error;
    }
  }

  // 根据 ID 查找电影
  static async findMovieById(id) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM movies WHERE id = ?',
        [id]
      );
      connection.release();
      return rows[0] ? normalizeMovie(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // 按类型筛选电影
  static async findMoviesByGenre(genre) {
    try {
      const connection = await pool.getConnection();
      // 支持数据库中以逗号分隔存储的多类型值（例如: "动画, 爱情"）
      // 使用 REPLACE 去除空格后用 FIND_IN_SET 匹配，避免精确等于导致无法匹配的情况
      const [rows] = await connection.execute(
        "SELECT * FROM movies WHERE FIND_IN_SET(?, REPLACE(genre, ' ', '')) > 0 ORDER BY year DESC",
        [genre]
      );
      connection.release();
      return rows.map(normalizeMovie);
    } catch (error) {
      throw error;
    }
  }

  // 按年份筛选电影
  static async findMoviesByYear(year) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM movies WHERE year = ? ORDER BY rating DESC',
        [year]
      );
      connection.release();
      return rows.map(normalizeMovie);
    } catch (error) {
      throw error;
    }
  }

  // 搜索电影
  static async searchMovies(keyword) {
    try {
      const connection = await pool.getConnection();
      const searchTerm = `%${keyword}%`;
      const [rows] = await connection.execute(
        'SELECT * FROM movies WHERE title LIKE ? OR description LIKE ? ORDER BY year DESC',
        [searchTerm, searchTerm]
      );
      connection.release();
      return rows.map(normalizeMovie);
    } catch (error) {
      throw error;
    }
  }

  // 获取所有独特的类型
  static async getGenres() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT DISTINCT genre FROM movies WHERE genre IS NOT NULL ORDER BY genre'
      );
      connection.release();
      return rows.map(row => row.genre);
    } catch (error) {
      throw error;
    }
  }

  // 获取所有独特的年份
  static async getYears() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT DISTINCT year FROM movies WHERE year IS NOT NULL ORDER BY year DESC'
      );
      connection.release();
      return rows.map(row => row.year);
    } catch (error) {
      throw error;
    }
  }

  // 创建电影
  static async createMovie(movieData) {
    try {
      const connection = await pool.getConnection();
      // 如果传入 genre 为数组，则保存为逗号分隔字符串
      const genreValue = Array.isArray(movieData.genre) ? movieData.genre.join(', ') : movieData.genre;
      const [result] = await connection.execute(
        'INSERT INTO movies (title, description, genre, year, rating, poster_url) VALUES (?, ?, ?, ?, ?, ?)',
        [movieData.title, movieData.description, genreValue, movieData.year, movieData.rating, movieData.poster_url]
      );
      connection.release();
      return { id: result.insertId, ...movieData, genre: Array.isArray(movieData.genre) ? movieData.genre : (movieData.genre ? movieData.genre.split(',').map(s=>s.trim()) : []) };
    } catch (error) {
      throw error;
    }
  }

  // 管理员添加电影（完整字段）
  static async adminAddMovie(movieData) {
    try {
      const connection = await pool.getConnection();
      const genreValue = Array.isArray(movieData.genre) ? movieData.genre.join(', ') : movieData.genre;
      const [result] = await connection.execute(
        `INSERT INTO movies (title, description, genre, year, rating, poster_url, director, duration, country, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          movieData.title,
          movieData.description || null,
          genreValue || null,
          movieData.year || null,
          movieData.rating || null,
          movieData.poster_url || null,
          movieData.director || null,
          movieData.duration || null,
          movieData.country || null,
          movieData.status || 'active'
        ]
      );
      connection.release();
      return { id: result.insertId, success: true };
    } catch (error) {
      throw error;
    }
  }

  // 更新电影
  static async updateMovie(id, updates) {
    try {
      const connection = await pool.getConnection();
      const fields = [];
      const values = [];

      Object.keys(updates).forEach(key => {
        if (key === 'genre' && Array.isArray(updates[key])) {
          fields.push('genre = ?');
          values.push(updates[key].join(', '));
        } else {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });

      if (fields.length === 0) {
        connection.release();
        return { affectedRows: 0 };
      }

      values.push(id);
      const [result] = await connection.execute(
        `UPDATE movies SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      connection.release();
      return result;
    } catch (error) {
      throw error;
    }
  }

  // 删除电影
  static async deleteMovie(id) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute(
        'DELETE FROM movies WHERE id = ?',
        [id]
      );
      connection.release();
      return result;
    } catch (error) {
      throw error;
    }
  }

  // 管理员删除电影（会级联删除相关评论和收藏）
  static async adminDeleteMovie(movieId) {
    try {
      const connection = await pool.getConnection();
      
      // 先删除相关评论
      await connection.execute('DELETE FROM comments WHERE movie_id = ?', [movieId]);
      
      // 删除相关收藏
      await connection.execute('DELETE FROM favorites WHERE movie_id = ?', [movieId]);
      
      // 最后删除电影
      const [result] = await connection.execute('DELETE FROM movies WHERE id = ?', [movieId]);
      
      connection.release();
      return result;
    } catch (error) {
      throw error;
    }
  }

  // ========== 收藏相关操作 ==========

  // 添加收藏
  static async addFavorite(userId, movieId) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute(
        'INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)',
        [userId, movieId]
      );
      connection.release();
      return result;
    } catch (error) {
      // 如果已经收藏过，会触发 UNIQUE KEY 错误，忽略即可
      if (error.code === 'ER_DUP_ENTRY') {
        return { alreadyExists: true };
      }
      throw error;
    }
  }

  // 取消收藏
  static async removeFavorite(userId, movieId) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute(
        'DELETE FROM favorites WHERE user_id = ? AND movie_id = ?',
        [userId, movieId]
      );
      connection.release();
      return result;
    } catch (error) {
      throw error;
    }
  }

  // 检查是否已收藏
  static async isFavorite(userId, movieId) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT id FROM favorites WHERE user_id = ? AND movie_id = ?',
        [userId, movieId]
      );
      connection.release();
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // 获取用户收藏的电影列表
  static async getUserFavorites(userId) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        `SELECT m.*, f.created_at as favorited_at 
         FROM movies m 
         INNER JOIN favorites f ON m.id = f.movie_id 
         WHERE f.user_id = ? 
         ORDER BY f.created_at DESC`,
        [userId]
      );
      connection.release();
      return rows.map(normalizeMovie);
    } catch (error) {
      throw error;
    }
  }

  // 获取用户收藏数量
  static async getUserFavoriteCount(userId) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT COUNT(*) as count FROM favorites WHERE user_id = ?',
        [userId]
      );
      connection.release();
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  // ========== 评论相关操作 ==========

  // 添加评论（支持父评论ID）
  static async addComment(userId, movieId, content, parentId = null) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute(
        'INSERT INTO comments (user_id, movie_id, content, parent_id) VALUES (?, ?, ?, ?)',
        [userId, movieId, content, parentId]
      );
      connection.release();
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // 获取电影的所有顶级评论（不包括回复）
  static async getMovieComments(movieId) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        `SELECT c.*, u.username, u.nickname, u.avatar,
         (SELECT COUNT(*) FROM comments WHERE parent_id = c.id) as reply_count
         FROM comments c 
         INNER JOIN users u ON c.user_id = u.id 
         WHERE c.movie_id = ? AND c.parent_id IS NULL
         ORDER BY c.created_at DESC`,
        [movieId]
      );
      connection.release();
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // 获取某条评论的所有回复
  static async getCommentReplies(commentId) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        `SELECT c.*, u.username, u.nickname, u.avatar 
         FROM comments c 
         INNER JOIN users u ON c.user_id = u.id 
         WHERE c.parent_id = ? 
         ORDER BY c.created_at ASC`,
        [commentId]
      );
      connection.release();
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // 获取用户评论数量（包括回复）
  static async getUserCommentCount(userId) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT COUNT(*) as count FROM comments WHERE user_id = ?',
        [userId]
      );
      connection.release();
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  // 获取用户的所有评论（包含电影信息和父评论信息）
  static async getUserComments(userId) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        `SELECT c.*, m.title as movie_title, m.poster_url, m.rating,
         pc.content as parent_content, pu.nickname as parent_user_nickname
         FROM comments c 
         INNER JOIN movies m ON c.movie_id = m.id 
         LEFT JOIN comments pc ON c.parent_id = pc.id
         LEFT JOIN users pu ON pc.user_id = pu.id
         WHERE c.user_id = ? 
         ORDER BY c.created_at DESC`,
        [userId]
      );
      connection.release();
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // 删除评论（会级联删除所有回复）
  static async deleteComment(commentId, userId) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute(
        'DELETE FROM comments WHERE id = ? AND user_id = ?',
        [commentId, userId]
      );
      connection.release();
      return result;
    } catch (error) {
      throw error;
    }
  }

  // ========== 管理员相关操作 ==========

  // 获取所有电影（包括已下架）
  static async getAllMoviesForAdmin() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        `SELECT m.*, 
         (SELECT COUNT(*) FROM comments WHERE movie_id = m.id) as comment_count,
         (SELECT COUNT(*) FROM favorites WHERE movie_id = m.id) as favorite_count
         FROM movies m 
         ORDER BY m.id ASC`
      );
      connection.release();
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // 更新电影状态（上架/下架）
  static async updateMovieStatus(movieId, status) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute(
        'UPDATE movies SET status = ? WHERE id = ?',
        [status, movieId]
      );
      connection.release();
      return result;
    } catch (error) {
      throw error;
    }
  }

  // 管理员删除任何评论
  static async adminDeleteComment(commentId) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute(
        'DELETE FROM comments WHERE id = ?',
        [commentId]
      );
      connection.release();
      return result;
    } catch (error) {
      throw error;
    }
  }

  // 获取所有评论（管理员视图）
  static async getAllCommentsForAdmin(page = 1, limit = 20) {
    try {
      const connection = await pool.getConnection();
      const offset = (page - 1) * limit;
      
      const [rows] = await connection.execute(
        `SELECT c.*, u.username, u.nickname, u.avatar, m.title as movie_title
         FROM comments c 
         INNER JOIN users u ON c.user_id = u.id 
         INNER JOIN movies m ON c.movie_id = m.id 
         WHERE c.parent_id IS NULL
         ORDER BY c.created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      const [countResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM comments WHERE parent_id IS NULL'
      );
      
      connection.release();
      return {
        comments: rows,
        total: countResult[0].total,
        page,
        totalPages: Math.ceil(countResult[0].total / limit)
      };
    } catch (error) {
      throw error;
    }
  }

  // 获取指定电影的评论（管理员视图）
  static async getMovieCommentsForAdmin(movieId, page = 1, limit = 20) {
    try {
      const connection = await pool.getConnection();
      const offset = (page - 1) * limit;
      
      const [rows] = await connection.execute(
        `SELECT c.*, u.username, u.nickname, u.avatar, m.title as movie_title
         FROM comments c 
         INNER JOIN users u ON c.user_id = u.id 
         INNER JOIN movies m ON c.movie_id = m.id 
         WHERE c.parent_id IS NULL AND c.movie_id = ?
         ORDER BY c.created_at DESC
         LIMIT ? OFFSET ?`,
        [movieId, limit, offset]
      );
      
      const [countResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM comments WHERE parent_id IS NULL AND movie_id = ?',
        [movieId]
      );
      
      connection.release();
      return {
        comments: rows,
        total: countResult[0].total,
        page,
        totalPages: Math.ceil(countResult[0].total / limit)
      };
    } catch (error) {
      throw error;
    }
  }

  // 获取系统统计数据
  static async getAdminStats() {
    try {
      const connection = await pool.getConnection();
      
      const [movieCount] = await connection.execute(
        'SELECT COUNT(*) as count FROM movies WHERE status = "active"'
      );
      const [userCount] = await connection.execute(
        'SELECT COUNT(*) as count FROM users WHERE role = "user"'
      );
      const [commentCount] = await connection.execute(
        'SELECT COUNT(*) as count FROM comments'
      );
      const [inactiveMovies] = await connection.execute(
        'SELECT COUNT(*) as count FROM movies WHERE status = "inactive"'
      );
      
      connection.release();
      return {
        activeMovies: movieCount[0].count,
        inactiveMovies: inactiveMovies[0].count,
        totalUsers: userCount[0].count,
        totalComments: commentCount[0].count
      };
    } catch (error) {
      throw error;
    }
  }

  // 获取所有用户（排除管理员）
  static async getAllUsers() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        `SELECT id, username, nickname, email, avatar, created_at 
         FROM users 
         WHERE role = 'user'
         ORDER BY created_at DESC`
      );
      connection.release();
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // 删除用户（会级联删除用户的所有数据）
  static async deleteUser(userId) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute(
        'DELETE FROM users WHERE id = ? AND role = "user"',
        [userId]
      );
      connection.release();
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DataManager;

