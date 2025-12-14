const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
require('dotenv').config();

const initDatabase = require('./utils/initDB');
const migrateDatabase = require('./utils/migrateDB');
const DataManager = require('./utils/dataManager');
const pool = require('./config/database');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'movie-website-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // 开发环境设为false，生产环境使用HTTPS时设为true
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));
// 如果项目根目录下有 `vedio` 文件夹，映射为 /vedio 静态路径（视频文件）
app.use('/vedio', express.static(path.join(__dirname, 'vedio')));

// 路由配置
const indexRoutes = require('./routes/index');
const movieRoutes = require('./routes/movies');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const apiRoutes = require('./routes/api');
const debugRoutes = require('./routes/debug');
const adminRoutes = require('./routes/admin');

app.use('/', indexRoutes);
app.use('/movies', movieRoutes);
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/debug', debugRoutes);
app.use('/admin', adminRoutes);

// 单独的播放路由：直接映射到 /play/:id ，从项目根的 vedio 目录查找与电影 id 对应的视频文件
app.get('/play/:id', async (req, res) => {
  try {
    const dbConnected = await pool.checkConnection();
    if (!dbConnected) {
      return res.status(503).render('pages/error', { title: '服务不可用', error: '无法连接到数据库，暂时无法查看电影', user: req.session.user || null });
    }

    const movie = await DataManager.findMovieById(req.params.id);
    if (!movie) {
      return res.status(404).render('pages/error', { title: '404 - 电影未找到', error: '抱歉，您查找的电影不存在', user: req.session.user || null });
    }

    // 在项目根的 vedio 和 public/vedio 文件夹中查找与 movie.id 完全匹配的文件，支持常见扩展名
    const videoDirRoot = path.join(__dirname, 'vedio');
    // 支持两种目录名：public/vedio 和 public/vedios（项目中实际为 vedios）
    const videoDirPublic = path.join(__dirname, 'public', 'vedio');
    const videoDirPublicAlt = path.join(__dirname, 'public', 'vedios');
    const exts = ['.mp4', '.webm', '.ogg', '.mkv'];
    let foundFile = null;
    let foundInPublic = false;
    try {
      console.log(`[视频查找] 正在为电影ID ${movie.id} 查找视频文件...`);
      // 优先查找 public/vedio（如果存在），因为 express.static('public') 已经提供该路径
      // 先在 public/vedio 中查找
      if (fs.existsSync(videoDirPublic)) {
        const files = fs.readdirSync(videoDirPublic);
        console.log(`[视频查找] public/vedio 目录存在，文件列表:`, files);
        for (const f of files) {
          const base = path.parse(f).name;
          const ext = path.parse(f).ext.toLowerCase();
          console.log(`[视频查找] 检查文件: ${f}, 文件名: ${base}, 扩展名: ${ext}, 匹配ID: ${movie.id}`);
          if (String(base) === String(movie.id) && exts.includes(ext)) {
            foundFile = f;
            foundInPublic = true;
            console.log(`[视频查找] ✓ 在 public/vedio 中找到匹配文件: ${f}`);
            break;
          }
        }
      } else {
        console.log(`[视频查找] public/vedio 目录不存在`);
      }

      // 再在 public/vedios（带 s）中查找（某些项目中目录名为 vedios）
      if (!foundFile && fs.existsSync(videoDirPublicAlt)) {
        const files = fs.readdirSync(videoDirPublicAlt);
        console.log(`[视频查找] public/vedios 目录存在，文件列表:`, files);
        for (const f of files) {
          const base = path.parse(f).name;
          const ext = path.parse(f).ext.toLowerCase();
          if (String(base) === String(movie.id) && exts.includes(ext)) {
            foundFile = f;
            // 标记为 public 但 URL 需要使用 /vedios/
            foundInPublic = true;
            console.log(`[视频查找] ✓ 在 public/vedios 中找到匹配文件: ${f}`);
            // 将 videoUrl 指向 /vedios/<file> 之后处理
            break;
          }
        }
      } else if (!foundFile) {
        console.log(`[视频查找] public/vedios 目录不存在`);
      }

      // 如果 public 中未找到，再查找项目根 vedio 文件夹
      if (!foundFile && fs.existsSync(videoDirRoot)) {
        const files = fs.readdirSync(videoDirRoot);
        console.log(`[视频查找] 根目录 vedio 存在，文件列表:`, files);
        for (const f of files) {
          const base = path.parse(f).name;
          const ext = path.parse(f).ext.toLowerCase();
          if (String(base) === String(movie.id) && exts.includes(ext)) {
            foundFile = f;
            foundInPublic = false;
            console.log(`[视频查找] ✓ 在根目录 vedio 中找到匹配文件: ${f}`);
            break;
          }
        }
      } else if (!foundFile) {
        console.log(`[视频查找] 根目录 vedio 不存在`);
      }
    } catch (err) {
      console.warn('[视频查找] 检查 vedio 目录时出错:', err && err.message ? err.message : err);
    }

    // 统一使用 /vedio/<filename> 作为访问路径；public/vedio 会被 express.static('public') 直接提供
    let videoUrl = null;
    if (foundFile) {
      // 如果文件在 public/vedios（带 s），URL 为 /vedios/<file>
      if (fs.existsSync(path.join(videoDirPublicAlt || '', foundFile))) {
        videoUrl = `/vedios/${encodeURIComponent(foundFile)}`;
        console.log(`[视频查找] 使用 URL: ${videoUrl} (来自 public/vedios)`);
      } else if (fs.existsSync(path.join(videoDirPublic || '', foundFile))) {
        videoUrl = `/vedio/${encodeURIComponent(foundFile)}`;
        console.log(`[视频查找] 使用 URL: ${videoUrl} (来自 public/vedio)`);
      } else {
        // root vedio
        videoUrl = `/vedio/${encodeURIComponent(foundFile)}`;
        console.log(`[视频查找] 使用 URL: ${videoUrl} (来自根目录 vedio)`);
      }
    } else {
      console.log(`[视频查找] ✗ 未找到电影ID ${movie.id} 的视频文件`);
    }

    res.render('pages/play', { title: `${movie.title} - 在线播放`, user: req.session.user || null, movie, videoUrl });
  } catch (error) {
    console.error('播放页加载失败:', error);
    res.status(500).render('pages/error', { title: '服务器错误', error: '无法加载播放页', user: req.session.user || null });
  }
});

// 404错误处理
app.use((req, res) => {
  res.status(404).render('pages/error', { 
    title: '404 - 页面未找到',
    error: '抱歉，您访问的页面不存在',
    user: req.session.user || null
  });
});

// 启动服务器
async function startServer() {
  try {
    console.log('正在初始化数据库...');
    await initDatabase();
    
    console.log('正在迁移数据库...');
    await migrateDatabase();
    
    app.listen(PORT, () => {
      console.log(`✓ 服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ 启动失败:', error.message);
    process.exit(1);
  }
}

startServer();

