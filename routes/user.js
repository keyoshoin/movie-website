const express = require('express');
const router = express.Router();
const DataManager = require('../utils/dataManager');
const { isValidEmail } = require('../utils/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- 1. 配置 Multer (文件上传) ---
// 确保 public/uploads 文件夹存在，不存在则创建
const uploadDir = path.join(__dirname, '../public/uploads/avatars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // 文件保存路径
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名: avatar-用户ID-时间戳.后缀
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + req.session.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 限制 10MB
    fileFilter: function (req, file, cb) {
        // 只允许图片
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('只允许上传图片文件!'));
    }
});

// 中间件：检查用户是否已登录
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

// --- 2. 个人中心路由 ---

// GET: 获取个人中心页面
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await DataManager.findUserById(req.session.user.id);
    const favoriteMovies = await DataManager.getUserFavorites(req.session.user.id);
    const favoriteCount = await DataManager.getUserFavoriteCount(req.session.user.id);
    const commentCount = await DataManager.getUserCommentCount(req.session.user.id);
    
    res.render('pages/profile', { 
        title: '个人中心 - 电影网站', 
        user: req.session.user,  // Session中的用户信息（用于导航栏头像等）
        userData: user,          // 数据库中最新的完整用户信息
        favoriteMovies,          // 收藏的电影列表
        favoriteCount,           // 收藏数量
        commentCount,            // 评论数量
        success: null,
        error: null
    });
  } catch (err) {
    console.error('加载个人中心失败:', err);
    res.status(500).render('pages/error', { 
        title: '服务器错误', 
        error: '无法加载用户信息', 
        user: req.session.user 
    });
  }
});

// POST: 更新个人信息 (头像、邮箱、简介)
// 使用 upload.single('avatar') 中间件处理文件上传
router.post('/profile', requireAuth, (req, res, next) => {
    const uploadMiddleware = upload.single('avatar');

    uploadMiddleware(req, res, async (err) => {
        // 1. 处理上传错误
        if (err) {
            let errorMsg = '文件上传失败';
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') errorMsg = '图片大小不能超过 10MB';
            } else {
                errorMsg = err.message;
            }
            
            // 出错时需要重新获取用户信息来渲染页面
            try {
                const user = await DataManager.findUserById(req.session.user.id);
                return res.render('pages/profile', { 
                    title: '个人中心', user: req.session.user, userData: user, error: errorMsg, success: null 
                });
            } catch (e) { return next(e); }
        }

        // 2. 处理业务逻辑
        const { email, bio, nickname } = req.body; // 1. 获取 nickname
        let error = null;
        let success = null;

        try {
            const userId = req.session.user.id;
            const currentUser = await DataManager.findUserById(userId);
            const updateFields = {}; // 准备要更新到数据库的字段

            // --- 处理邮箱更新 ---
            if (email && email !== currentUser.email) {
                if (!isValidEmail(email)) {
                    error = '请输入有效的邮箱地址';
                } else {
                    const exist = await DataManager.findUserByEmail(email);
                    if (exist && exist.id !== userId) {
                        error = '该邮箱已被其他用户使用';
                    } else {
                        updateFields.email = email;
                    }
                }
            }

            // --- 处理简介更新 ---
            if (bio !== undefined && bio !== currentUser.bio) {
                updateFields.bio = bio;
            }

            // --- 处理头像更新 ---
            if (req.file) {
              // 数据库只存文件名，例如 "avatar-123.jpg"
              updateFields.avatar = req.file.filename; 
            }
            // 2. 添加到 updateFields
            if (nickname && nickname !== req.session.user.nickname) {
          updateFields.nickname = nickname;
     }

            // 如果有错误，渲染错误页面
            if (error) {
                return res.render('pages/profile', { 
                    title: '个人中心', user: req.session.user, userData: currentUser, error, success: null 
                });
            }

            // --- 执行数据库更新 ---
            if (Object.keys(updateFields).length > 0) {
                await DataManager.updateUser(userId, updateFields);
                success = '个人资料更新成功';

                // 更新 Session 中的数据，以便页面刷新后右上角头像/名字能即时更新
                if (updateFields.email) req.session.user.email = updateFields.email;
                if (updateFields.bio) req.session.user.bio = updateFields.bio;
                if (updateFields.avatar) req.session.user.avatar = updateFields.avatar;
                if (updateFields.nickname) req.session.user.nickname = updateFields.nickname;

                req.session.save();
            } else {
                // 没有修改任何内容
                success = '资料未发生变更';
            }

            // 获取最新数据并渲染
            const updatedUser = await DataManager.findUserById(userId);
            // ★★★ 在这里加上打印日志 ★★★
            console.log('--- 调试信息 ---');
            console.log('1. Session里的头像:', req.session.user.avatar);
            console.log('2. 数据库查出来的头像:', updatedUser.avatar);
            console.log('----------------');

            res.render('pages/profile', { 
              title: '个人中心', 
              user: req.session.user, // Session数据（给导航栏用）
              userData: updatedUser,  // 数据库新数据（给页面主体用）
              error: null, 
              success: '更新成功' 
            });

        } catch (err) {
            console.error('更新个人信息失败:', err);
            res.status(500).render('pages/error', { 
                title: '服务器错误', error: '无法更新用户信息', user: req.session.user 
            });
        }
    });
});

module.exports = router;
