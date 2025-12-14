const express = require('express');
const router = express.Router();
const DataManager = require('../utils/dataManager');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保视频目录存在
const videoDir = 'public/vedio';
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

// 配置文件上传（海报+视频）
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'poster') {
      cb(null, 'public/uploads/posters/');
    } else if (file.fieldname === 'video') {
      cb(null, 'public/vedio/');
    } else {
      cb(new Error('未知的文件字段'));
    }
  },
  filename: function (req, file, cb) {
    if (file.fieldname === 'poster') {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'poster-' + uniqueSuffix + path.extname(file.originalname));
    } else if (file.fieldname === 'video') {
      // 视频文件临时名称，稍后会重命名为电影ID
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'temp-video-' + uniqueSuffix + path.extname(file.originalname));
    }
  }
});

const uploadFiles = multer({
  storage: storage,
  limits: { 
    fileSize: 500 * 1024 * 1024 // 视频文件最大500MB
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'poster') {
      const filetypes = /jpeg|jpg|png|gif|webp/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(new Error('海报只支持图片格式 (jpeg, jpg, png, gif, webp)'));
    } else if (file.fieldname === 'video') {
      const filetypes = /mp4|webm|ogg|mkv/;
      const mimetype = filetypes.test(file.mimetype) || file.mimetype.includes('video');
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(new Error('视频只支持格式 (mp4, webm, ogg, mkv)'));
    } else {
      cb(null, false);
    }
  }
});

// 管理员权限检查中间件
const requireAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).send('需要管理员权限');
  }
  next();
};

// 所有管理员路由都需要权限检查
router.use(requireAdmin);

// 管理员主页
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await DataManager.getAdminStats();
    const movies = await DataManager.getAllMoviesForAdmin();
    
    res.render('pages/admin-dashboard', {
      title: '管理员控制台',
      user: req.session.user,
      stats,
      movies
    });
  } catch (error) {
    console.error('加载管理员主页错误:', error);
    res.status(500).send('服务器错误');
  }
});

// 获取所有评论（API）
router.get('/api/comments', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const movieId = req.query.movieId; // 添加电影ID筛选
    
    let result;
    if (movieId) {
      // 获取指定电影的评论
      result = await DataManager.getMovieCommentsForAdmin(movieId, page, limit);
    } else {
      // 获取所有评论
      result = await DataManager.getAllCommentsForAdmin(page, limit);
    }
    
    res.json(result);
  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除评论（API）
router.delete('/api/comments/:commentId', async (req, res) => {
  try {
    await DataManager.adminDeleteComment(req.params.commentId);
    res.json({ success: true, message: '评论已删除' });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// 更新电影状态（API）
router.put('/api/movies/:movieId/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: '无效的状态值' });
    }
    
    await DataManager.updateMovieStatus(req.params.movieId, status);
    res.json({ success: true, message: '电影状态已更新' });
  } catch (error) {
    console.error('更新电影状态错误:', error);
    res.status(500).json({ error: '更新失败' });
  }
});

// 添加电影（API）
router.post('/api/movies', uploadFiles.fields([{ name: 'poster', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  try {
    const movieData = {
      title: req.body.title,
      description: req.body.description,
      genre: req.body.genre,
      year: parseInt(req.body.year) || null,
      rating: parseFloat(req.body.rating) || null,
      director: req.body.director,
      duration: parseInt(req.body.duration) || null,
      country: req.body.country,
      status: req.body.status || 'active'
    };

    // 处理海报上传
    if (req.files && req.files.poster && req.files.poster[0]) {
      movieData.poster_url = `/uploads/posters/${req.files.poster[0].filename}`;
    } else if (req.body.poster_url) {
      movieData.poster_url = req.body.poster_url;
    }

    // 先添加电影到数据库，获取电影ID
    const result = await DataManager.adminAddMovie(movieData);
    const movieId = result.id;

    // 处理视频文件上传
    if (req.files && req.files.video && req.files.video[0]) {
      const tempVideoPath = req.files.video[0].path;
      const videoExt = path.extname(req.files.video[0].originalname);
      const newVideoPath = path.join('public/vedio', `${movieId}${videoExt}`);
      
      // 重命名视频文件为电影ID
      fs.renameSync(tempVideoPath, newVideoPath);
      console.log(`[视频上传] 视频文件已保存: ${newVideoPath}`);
    }

    res.json({ success: true, movieId: result.id, message: '电影添加成功' });
  } catch (error) {
    console.error('添加电影错误:', error);
    // 如果出错，清理已上传的文件
    if (req.files) {
      if (req.files.poster && req.files.poster[0]) {
        fs.unlinkSync(req.files.poster[0].path).catch(err => console.error('清理海报文件失败:', err));
      }
      if (req.files.video && req.files.video[0]) {
        fs.unlinkSync(req.files.video[0].path).catch(err => console.error('清理视频文件失败:', err));
      }
    }
    res.status(500).json({ error: '添加失败', message: error.message });
  }
});

// 更新电影（API）
router.put('/api/movies/:movieId', uploadFiles.fields([{ name: 'poster', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  try {
    const movieData = {
      title: req.body.title,
      description: req.body.description,
      genre: req.body.genre,
      year: parseInt(req.body.year) || null,
      rating: parseFloat(req.body.rating) || null,
      director: req.body.director,
      duration: parseInt(req.body.duration) || null,
      country: req.body.country,
      status: req.body.status || 'active'
    };

    // 处理海报上传
    if (req.files && req.files.poster && req.files.poster[0]) {
      movieData.poster_url = `/uploads/posters/${req.files.poster[0].filename}`;
    } else if (req.body.poster_url) {
      movieData.poster_url = req.body.poster_url;
    }

    // 更新电影信息
    await DataManager.updateMovie(req.params.movieId, movieData);

    // 处理视频文件上传（如果有新视频）
    if (req.files && req.files.video && req.files.video[0]) {
      const movieId = req.params.movieId;
      const videoExt = path.extname(req.files.video[0].originalname);
      const newVideoPath = path.join('public/vedio', `${movieId}${videoExt}`);
      
      // 删除旧视频文件（如果存在）
      const oldVideos = fs.readdirSync('public/vedio').filter(f => {
        const base = path.parse(f).name;
        return String(base) === String(movieId);
      });
      oldVideos.forEach(oldVideo => {
        fs.unlinkSync(path.join('public/vedio', oldVideo));
        console.log(`[视频更新] 已删除旧视频: ${oldVideo}`);
      });
      
      // 保存新视频
      const tempVideoPath = req.files.video[0].path;
      fs.renameSync(tempVideoPath, newVideoPath);
      console.log(`[视频更新] 新视频已保存: ${newVideoPath}`);
    }

    res.json({ success: true, message: '电影更新成功' });
  } catch (error) {
    console.error('更新电影错误:', error);
    res.status(500).json({ error: '更新失败', message: error.message });
  }
});

// 删除电影（API）
router.delete('/api/movies/:movieId', async (req, res) => {
  try {
    await DataManager.adminDeleteMovie(req.params.movieId);
    res.json({ success: true, message: '电影已删除' });
  } catch (error) {
    console.error('删除电影错误:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// 获取所有用户（API）
router.get('/api/users', async (req, res) => {
  try {
    const users = await DataManager.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除用户（API）
router.delete('/api/users/:userId', async (req, res) => {
  try {
    await DataManager.deleteUser(req.params.userId);
    res.json({ success: true, message: '用户已注销' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;
