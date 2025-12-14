const express = require('express');
const router = express.Router();
const DataManager = require('../utils/dataManager');
const pool = require('../config/database');

// 电影列表页
router.get('/', async (req, res) => {
  const genre = req.query.genre;
  const year = req.query.year;
  const search = req.query.search;
  const sort = req.query.sort;
  const region = req.query.region;
  const ratingMin = req.query.ratingMin ? parseFloat(req.query.ratingMin) : null;

  try {
    // 先检查数据库是否可用；不可用时不尝试读取影片数据
    const dbConnected = await pool.checkConnection();
    if (!dbConnected) {
      return res.render('pages/movies', {
        title: '电影列表 - 电影网站',
        user: req.session.user || null,
        movies: [],
        genres: [],
        years: [],
        regions: [],
        selectedGenre: genre || '',
        selectedYear: year || '',
        selectedRegion: region || '',
        selectedRatingMin: req.query.ratingMin || '',
        selectedSort: sort || '',
        dbConnected: false,
        dbError: '数据库连接失败，请确保 MySQL 服务已启动且 Navicat 已连接'
      });
    }

    let movies = await DataManager.getAllMovies();
    const allMovies = movies.slice(); // 用于侧边栏/过滤元数据

    // 搜索功能
    if (search) {
      movies = await DataManager.searchMovies(search);
      const hotMovies = allMovies.slice().sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
      return res.render('pages/search', { title: `搜索结果 - ${search}`, user: req.session.user || null, movies, searchKeyword: search, hotMovies });
    }

    if (genre) {
      movies = await DataManager.findMoviesByGenre(genre);
    }
    if (year) {
      movies = movies.filter(m => m.year === parseInt(year));
    }
    if (region) {
      movies = movies.filter(m => m.country === region);
    }
    if (ratingMin) {
      movies = movies.filter(m => m.rating >= ratingMin);
    }
    if (sort === 'rating') {
      movies = movies.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'year') {
      movies = movies.sort((a, b) => b.year - a.year);
    }

    // 获取所有分类
    const genres = [...new Set(allMovies.flatMap(m => (Array.isArray(m.genre) ? m.genre : [m.genre]).filter(Boolean)))];
    const years = [...new Set(allMovies.map(m => m.year))].sort((a, b) => b - a);
    const regions = [...new Set(allMovies.map(m => m.country))];

    const hotMovies = allMovies.slice().sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);

    res.render('pages/movies', {
      title: '电影列表 - 电影网站',
      user: req.session.user || null,
      movies,
      genres,
      years,
      regions,
      hotMovies,
      selectedGenre: genre || '',
      selectedYear: year || '',
      selectedRegion: region || '',
      selectedRatingMin: req.query.ratingMin || '',
      selectedSort: sort || ''
    });
  } catch (err) {
    console.error('加载电影列表失败:', err);
    res.status(500).render('pages/error', { title: '服务器错误', error: '无法加载电影列表', user: req.session.user || null });
  }
});

// API：获取单个电影详情（返回JSON）
router.get('/api/:id', async (req, res) => {
  try {
    const movie = await DataManager.findMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: '电影不存在' });
    }
    res.json(movie);
  } catch (error) {
    console.error('获取电影详情失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

  // 电影详情页
  router.get('/:id', async (req, res) => {
    try {
      const dbConnected = await pool.checkConnection();
      if (!dbConnected) {
        return res.status(503).render('pages/error', { title: '服务不可用', error: '无法连接到数据库，暂时无法查看电影详情', user: req.session.user || null });
      }
      const movie = await DataManager.findMovieById(req.params.id);
      if (!movie) {
        return res.status(404).render('pages/error', { title: '404 - 电影未找到', error: '抱歉，您查找的电影不存在', user: req.session.user || null });
      }

      // 获取同类型电影推荐
      const genreKey = Array.isArray(movie.genre) ? movie.genre[0] : movie.genre;
      const relatedMovies = (genreKey ? await DataManager.findMoviesByGenre(genreKey) : [])
        .filter(m => m.id !== movie.id)
        .slice(0, 4);

      // 热门侧边栏数据
      const allMovies = await DataManager.getAllMovies();
      const hotMovies = allMovies.slice().sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);

      res.render('pages/movie-detail', { title: `${movie.title} - 电影详情`, user: req.session.user || null, movie, relatedMovies, hotMovies });
    } catch (err) {
      console.error('加载电影详情失败:', err);
      res.status(500).render('pages/error', { title: '服务器错误', error: '无法加载电影详情', user: req.session.user || null });
    }
  });

  module.exports = router;

