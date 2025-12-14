const express = require('express');
const router = express.Router();
const DataManager = require('../utils/dataManager');
const pool = require('../config/database');

// 首页
router.get('/', async (req, res) => {
  try {
    const dbConnected = await pool.checkConnection();
    if (!dbConnected) {
      return res.render('pages/index', {
        title: '首页 - 电影网站',
        user: req.session.user || null,
        topMovies: [],
        latestMovies: [],
        featuredMovies: [],
        dbError: '数据库连接失败，请确保 MySQL 服务已启动'
      });
    }
    const movies = await DataManager.getAllMovies();

    // 按评分降序取前 6 部电影作为高分推荐
    const topMovies = (movies || [])
      .slice() // 复制数组避免副作用
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);

    // 按上映年份降序取最新的前 10 部电影
    const latestMovies = (movies || [])
      .slice()
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      .slice(0, 10);

    // 取前 3 个作为特色展示（推荐用高分电影）
    const featuredMovies = topMovies.slice(0, 3);

    const hotMovies = topMovies.slice(0, 5);

    res.render('pages/index', {
      title: '首页 - 电影网站',
      user: req.session.user || null,
      topMovies,
      latestMovies,
      featuredMovies
      ,hotMovies
    });
  } catch (error) {
    console.error('首页渲染失败:', error);
    res.status(500).render('pages/error', {
      title: '服务器错误',
      error: '无法加载首页',
      user: req.session.user || null
    });
  }
});

module.exports = router;

