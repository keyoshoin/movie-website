const express = require('express');
const router = express.Router();
const DataManager = require('../utils/dataManager');
const pool = require('../config/database');

// 全局禁止缓存，确保客户端每次都从服务器/数据库获取最新数据
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// GET /api/movies - 获取所有电影（实时）
router.get('/movies', async (req, res) => {
  try {
    const ok = await pool.checkConnection();
    if (!ok) return res.status(503).json({ error: '数据库不可用' });
    const movies = await DataManager.getAllMovies();
    res.json(movies);
  } catch (err) {
    console.error('API get /movies error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/movies/:id - 获取指定电影
router.get('/movies/:id', async (req, res) => {
  try {
    const ok = await pool.checkConnection();
    if (!ok) return res.status(503).json({ error: '数据库不可用' });
    const movie = await DataManager.findMovieById(req.params.id);
    if (!movie) return res.status(404).json({ error: '未找到电影' });
    res.json(movie);
  } catch (err) {
    console.error('API get /movies/:id error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/movies/search?q= - 搜索电影
router.get('/movies/search', async (req, res) => {
  try {
    const q = req.query.q || req.query.keyword || '';
    const ok = await pool.checkConnection();
    if (!ok) return res.status(503).json({ error: '数据库不可用' });
    if (!q) return res.json([]);
    const results = await DataManager.searchMovies(q);
    res.json(results);
  } catch (err) {
    console.error('API get /movies/search error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/genres - 获取所有类型
router.get('/genres', async (req, res) => {
  try {
    const ok = await pool.checkConnection();
    if (!ok) return res.status(503).json({ error: '数据库不可用' });
    const genres = await DataManager.getGenres();
    res.json(genres);
  } catch (err) {
    console.error('API get /genres error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/years - 获取所有年份
router.get('/years', async (req, res) => {
  try {
    const ok = await pool.checkConnection();
    if (!ok) return res.status(503).json({ error: '数据库不可用' });
    const years = await DataManager.getYears();
    res.json(years);
  } catch (err) {
    console.error('API get /years error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// ========== 收藏功能 API ==========

// POST /api/favorites - 添加收藏
router.post('/favorites', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: '请先登录' });
    }
    const { movieId } = req.body;
    if (!movieId) {
      return res.status(400).json({ error: '缺少电影ID' });
    }
    const result = await DataManager.addFavorite(req.session.user.id, movieId);
    if (result.alreadyExists) {
      return res.json({ success: true, message: '已经收藏过了' });
    }
    res.json({ success: true, message: '收藏成功' });
  } catch (err) {
    console.error('API post /favorites error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// DELETE /api/favorites/:movieId - 取消收藏
router.delete('/favorites/:movieId', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: '请先登录' });
    }
    await DataManager.removeFavorite(req.session.user.id, req.params.movieId);
    res.json({ success: true, message: '取消收藏成功' });
  } catch (err) {
    console.error('API delete /favorites error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/favorites/check/:movieId - 检查是否已收藏
router.get('/favorites/check/:movieId', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({ isFavorite: false });
    }
    const isFavorite = await DataManager.isFavorite(req.session.user.id, req.params.movieId);
    res.json({ isFavorite });
  } catch (err) {
    console.error('API get /favorites/check error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/favorites - 获取用户收藏列表
router.get('/favorites', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: '请先登录' });
    }
    const favorites = await DataManager.getUserFavorites(req.session.user.id);
    res.json(favorites);
  } catch (err) {
    console.error('API get /favorites error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// ========== 评论功能 API ==========

// GET /api/comments/:movieId - 获取电影评论
router.get('/comments/:movieId', async (req, res) => {
  try {
    const comments = await DataManager.getMovieComments(req.params.movieId);
    res.json(comments);
  } catch (err) {
    console.error('API get /comments error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/comments/user/:userId - 获取用户的所有评论
router.get('/comments/user/:userId', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.id != req.params.userId) {
      return res.status(403).json({ error: '无权访问' });
    }
    const comments = await DataManager.getUserComments(req.params.userId);
    res.json(comments);
  } catch (err) {
    console.error('API get /comments/user error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/comments - 添加评论或回复
router.post('/comments', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: '请先登录' });
    }
    const { movieId, content, parentId } = req.body;
    if (!movieId || !content) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    if (content.trim().length === 0) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }
    const commentId = await DataManager.addComment(
      req.session.user.id, 
      movieId, 
      content, 
      parentId || null
    );
    res.json({ success: true, message: parentId ? '回复成功' : '评论成功', commentId });
  } catch (err) {
    console.error('API post /comments error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/comments/:commentId/replies - 获取评论的所有回复
router.get('/comments/:commentId/replies', async (req, res) => {
  try {
    const replies = await DataManager.getCommentReplies(req.params.commentId);
    res.json(replies);
  } catch (err) {
    console.error('API get /comments/:commentId/replies error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// DELETE /api/comments/:commentId - 删除评论
router.delete('/comments/:commentId', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: '请先登录' });
    }
    await DataManager.deleteComment(req.params.commentId, req.session.user.id);
    res.json({ success: true, message: '删除成功' });
  } catch (err) {
    console.error('API delete /comments error:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
