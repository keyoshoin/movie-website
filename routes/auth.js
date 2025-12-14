const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const DataManager = require('../utils/dataManager');
const { isValidEmail } = require('../utils/auth');

// --- 1. 配置 Multer 文件上传 ---
const uploadDir = path.join(__dirname, '../public/uploads/avatars');

if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('只允许上传图片文件'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// --- 路由处理 ---

// 1. 注册页面 GET
router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/user/profile');
  }
  res.render('pages/register', {
    title: '用户注册 - 电影网站',
    user: null, // ★★★ 修复点：必须加上这行，告诉 Header 现在没人登录
    error: null,
    formData: {} 
  });
});

// 2. 处理注册 POST
router.post('/register', upload.single('avatar'), async (req, res) => {
  const { username, nickname, email, password, confirmPassword } = req.body;
  const avatarFilename = req.file ? req.file.filename : null;

  let error = null;

  if (!username || !nickname || !email || !password || !confirmPassword) {
    error = '请填写所有必填字段';
  } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    error = '账号必须是3-20个字符，只能包含字母、数字和下划线';
  } else if (nickname.length < 1 || nickname.length > 20) {
    error = '昵称长度需要在1-20个字符之间';
  } else if (!isValidEmail(email)) {
    error = '请输入有效的邮箱地址';
  } else if (password.length < 6) {
    error = '密码长度至少为6个字符';
  } else if (password !== confirmPassword) {
    error = '两次输入的密码不一致';
  }

  if (error) {
    if (req.file) {
        fs.unlink(req.file.path, (err) => { if(err) console.error(err); });
    }
    return res.render('pages/register', {
      title: '用户注册 - 电影网站',
      user: null, // ★★★ 修复点：报错重绘时也要加
      error,
      formData: req.body
    });
  }

  try {
    const existUser = await DataManager.findUserByUsername(username);
    if (existUser) throw new Error('该账号已被注册');
    
    const existEmail = await DataManager.findUserByEmail(email);
    if (existEmail) throw new Error('该邮箱已被注册');

    const userId = await DataManager.createUser({
        username, 
        email, 
        password, 
        nickname, 
        avatar: avatarFilename
    });

    req.session.user = { 
        id: userId, 
        username: username, 
        nickname: nickname,
        email: email,
        avatar: avatarFilename
    };
    
    res.redirect('/user/profile');

  } catch (err) {
    console.error('注册失败:', err);
    if (req.file) {
        fs.unlink(req.file.path, () => {});
    }
    res.render('pages/register', { 
        title: '用户注册 - 电影网站', 
        user: null, // ★★★ 修复点
        error: err.message || '系统错误，请稍后再试', 
        formData: req.body 
    });
  }
});

// 3. 登录页面 GET
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/user/profile');
  }
  res.render('pages/login', {
    title: '用户登录 - 电影网站',
    user: null, // ★★★ 修复点
    error: null,
    formData: {}
  });
});

// 4. 处理登录 POST
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await DataManager.findUserByUsername(username);
    
    if (!user || !(await DataManager.verifyPassword(password, user.password))) {
        return res.render('pages/login', { 
            title: '用户登录 - 电影网站', 
            user: null, // ★★★ 修复点
            error: '账号或密码错误', 
            formData: { username } 
        });
    }

    req.session.user = { 
        id: user.id, 
        username: user.username, 
        nickname: user.nickname || user.username, 
        email: user.email,
        avatar: user.avatar,
        role: user.role || 'user' // 添加角色信息
    };
    
    // 根据角色跳转不同页面
    if (user.role === 'admin') {
        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/user/profile');
    }

  } catch (err) {
    console.error('登录错误:', err);
    res.render('pages/login', { 
        title: '用户登录 - 电影网站', 
        user: null, // ★★★ 修复点
        error: '登录服务暂时不可用', 
        formData: { username } 
    });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

module.exports = router;