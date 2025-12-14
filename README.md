# 🎬 电影世界 Movie World

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-blue.svg)](https://expressjs.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-purple.svg)](https://getbootstrap.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**一个功能完善的在线电影信息平台 | Web应用开发课程设计项目**

[在线演示](https://github.com/keyoshoin/movie-website) · [功能特性](#功能特性) · [快速开始](#快速开始) · [技术栈](#技术栈)

</div>

---

## 📖 项目简介

电影世界是一个基于 **Node.js + Express + MySQL** 开发的全栈Web应用，为电影爱好者提供电影浏览、搜索、评论、收藏等功能。项目采用MVC架构模式，实现了完整的用户认证系统、内容管理系统和交互功能。

### ✨ 项目亮点

- 🎨 **精美界面设计** - 采用Bootstrap 5构建响应式界面，适配多端设备
- 🔐 **完善的权限系统** - 区分普通用户与管理员角色，权限控制完备
- 💬 **实时互动功能** - 支持电影评论、收藏、分享等社交功能
- 📱 **响应式设计** - 完美适配桌面、平板、移动设备
- 🚀 **优秀的用户体验** - AJAX异步交互，无刷新动态更新
- 🎥 **视频播放功能** - 支持在线观看电影预览
- 🛡️ **安全性保障** - 密码加密、SQL注入防护、XSS防护

### 📊 项目完成度

本项目 **100%完成** Web应用开发课程设计的所有要求：

- ✅ 10个相互关联的页面（超过要求的8个）
- ✅ 4种不同类型的表单（超过要求的3种）
- ✅ 前后端完整的表单验证机制
- ✅ Session/Cookie会话管理
- ✅ Bootstrap Jumbotron + Carousel组件定制
- ✅ 6种以上CSS3动画效果
- ✅ EJS模板引擎实现5种页面风格
- ✅ MySQL数据库完整设计
- ✅ RESTful API架构
- ✅ 响应式三端适配

---

## 🎯 功能特性

### 👥 用户系统
- **用户注册** - 支持头像上传、邮箱验证、密码加密存储
- **用户登录** - Session会话管理、记住我功能
- **个人中心** - 资料编辑、密码修改、收藏管理
- **权限控制** - 普通用户/管理员角色区分

### 🎬 电影功能
- **首页展示** - Jumbotron巨幕 + 轮播图 + 推荐列表
- **电影列表** - 网格布局、分类筛选、排序功能
- **电影详情** - 完整信息展示、评论互动、收藏分享
- **视频播放** - 在线观看电影（支持多格式）
- **搜索功能** - 全文搜索、实时结果展示

### 💬 互动功能
- **评论系统** - 发表评论、显示评分、用户头像展示
- **收藏功能** - 一键收藏、收藏列表管理
- **分享功能** - 一键复制电影链接到剪贴板

### 🛠️ 管理后台
- **电影管理** - 添加/编辑/删除电影、上传海报和视频
- **用户管理** - 查看用户列表、权限管理
- **评论管理** - 审核删除不当评论
- **数据统计** - 用户数、电影数、评论数统计

---

## 💻 技术栈

### 前端技术
- **HTML5**: 使用语义化标签构建页面结构
- **CSS3**: 
  - 响应式布局（媒体查询）
  - CSS3动画效果（淡入、滑入、弹跳动画）
  - 渐变背景和过渡效果
- **JavaScript**: 
  - 原生JavaScript实现DOM操作
  - jQuery框架进行事件处理和AJAX请求
  - 表单实时验证和错误提示
- **Bootstrap 5.x**: 
  - Jumbotron（巨幕）组件定制化设计
  - Carousel（轮播图）组件，支持自动播放和手动切换
  - 响应式网格系统和组件

### 后端技术
- **Node.js**: 服务器运行环境
- **Express框架**: 
  - 路由管理
  - 中间件配置
  - 模板引擎集成
- **EJS模板引擎**: 
  - 动态页面渲染
  - 数据绑定
  - 条件渲染和循环渲染
  - 模板复用（partials）

### 数据库
- **MySQL 8.0** - 关系型数据库
- **mysql2** - Node.js MySQL驱动（Promise支持）
- **数据库设计** - 用户表、电影表、评论表、收藏表

### 安全与认证
- **bcryptjs** - 密码加密存储
- **express-session** - Session会话管理
- **cookie-parser** - Cookie处理
- **参数化查询** - SQL注入防护

### 开发工具
- **Nodemon** - 开发环境热重载
- **Git** - 版本控制
- **VS Code** - 代码编辑器

---

## 📁 项目结构

```
movie-website/
├── 📄 server.js                    # Express服务器入口
├── 📄 package.json                 # 项目依赖配置
├── 📄 README.md                    # 项目文档
├── 📄 movie_db.sql                 # 数据库结构文件
├── 📁 config/                      # 配置文件
│   └── database.js                 # 数据库连接配置
├── 📁 routes/                      # 路由模块
│   ├── index.js                    # 首页路由
│   ├── movies.js                   # 电影路由
│   ├── auth.js                     # 认证路由
│   ├── user.js                     # 用户路由
│   ├── api.js                      # API路由
│   └── admin.js                    # 管理员路由
├── 📁 utils/                       # 工具模块
│   ├── dataManager.js              # 数据管理
│   ├── auth.js                     # 认证工具
│   └── initDB.js                   # 数据库初始化
├── 📁 views/                       # EJS模板
│   ├── pages/                      # 页面模板
│   │   ├── index.ejs               # 首页
│   │   ├── movies.ejs              # 电影列表
│   │   ├── movie-detail.ejs        # 电影详情
│   │   ├── play.ejs                # 视频播放
│   │   ├── search.ejs              # 搜索结果
│   │   ├── login.ejs               # 登录页
│   │   ├── register.ejs            # 注册页
│   │   ├── profile.ejs             # 个人中心
│   │   ├── admin-dashboard.ejs     # 管理后台
│   │   └── error.ejs               # 错误页
│   └── partials/                   # 公共组件
│       ├── header.ejs              # 页头
│       ├── aside.ejs               # 侧边栏
│       └── footer.ejs              # 页脚
└── 📁 public/                      # 静态资源
    ├── css/
    │   └── style.css               # 自定义样式
    ├── js/
    │   └── main.js                 # 自定义脚本
    ├── images/                     # 图片资源
    ├── uploads/                    # 上传文件
    │   ├── avatars/                # 用户头像
    │   └── posters/                # 电影海报
    └── vedio/                      # 视频文件
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0  
- **MySQL** >= 8.0

### 安装步骤

#### 1️⃣ 克隆项目

```bash
git clone https://github.com/keyoshoin/movie-website.git
cd movie-website
```

#### 2️⃣ 安装依赖

```bash
npm install
```

#### 3️⃣ 配置数据库

**创建数据库：**
```sql
CREATE DATABASE movie_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**导入数据表：**
```bash
mysql -u root -p movie_db < movie_db.sql
```

**配置数据库连接：**

编辑 `config/database.js` 文件，修改数据库连接信息：
```javascript
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '你的密码',
  database: 'movie_db',
  // ...
});
```

#### 4️⃣ 初始化数据（可选）

```bash
node utils/initDB.js        # 初始化数据库表
node utils/importMovies.js  # 导入示例电影数据
node utils/importUsers.js   # 导入示例用户数据
```

#### 5️⃣ 启动服务器

**开发模式（推荐）：**
```bash
npm run dev
```

**生产模式：**
```bash
npm start
```

#### 6️⃣ 访问网站

打开浏览器访问：**http://localhost:3000**

### 默认账号

**管理员账号：**
- 用户名：`admin`
- 密码：`admin123`

**普通用户：**
- 用户名：`user1`
- 密码：`123456`

---

## 📸 项目截图

### 首页
![首页展示](docs/screenshots/homepage.png)
*首页包含Jumbotron巨幕、轮播图和推荐电影列表*

### 电影列表
![电影列表](docs/screenshots/movies.png)
*响应式网格布局，支持筛选和排序*

### 电影详情
![电影详情](docs/screenshots/movie-detail.png)
*完整的电影信息、评论和收藏功能*

### 管理后台
![管理后台](docs/screenshots/admin.png)
*管理员可以管理电影、用户和评论*

---

## 📚 使用文档

### 用户操作指南

#### 浏览电影
1. 访问首页查看推荐电影和轮播图
2. 点击顶部导航的"所有电影"浏览完整列表
3. 使用筛选器按类型、年份、评分筛选
4. 点击电影海报或标题进入详情页

#### 注册与登录
1. 点击右上角"注册"按钮
2. 填写用户信息（支持上传头像）
3. 注册成功后自动登录
4. 已有账号可直接登录

#### 互动功能
- **收藏电影**：在详情页点击"收藏"按钮
- **发表评论**：在详情页底部评论区输入内容
- **分享电影**：点击"分享"按钮复制链接

#### 个人中心
- **编辑资料**：修改昵称、邮箱、头像
- **修改密码**：需验证原密码
- **查看收藏**：浏览已收藏的电影
- **管理评论**：查看和删除自己的评论

### 管理员操作指南

#### 访问管理后台
登录管理员账号后，点击导航栏"管理后台"按钮

#### 电影管理
- **添加电影**：填写信息、上传海报和视频
- **编辑电影**：修改电影信息
- **删除电影**：永久删除电影记录
- **上下架控制**：控制电影前台显示状态

#### 用户管理
- **查看用户列表**：浏览所有注册用户
- **权限管理**：提升用户为管理员
- **删除用户**：删除违规用户账号

#### 评论管理
- **审核评论**：查看所有评论
- **删除评论**：删除不当评论内容

---

## 🏗️ 技术架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                        客户端层                          │
│  HTML5 + CSS3 + JavaScript + jQuery + Bootstrap 5       │
└────────────────┬───────────────────────────────────┬────┘
                 │                                   │
                 ▼                                   ▼
┌────────────────────────────┐    ┌──────────────────────┐
│      服务端渲染（SSR）      │    │    RESTful API       │
│      EJS Template          │    │    JSON Response     │
└────────────┬───────────────┘    └──────────┬───────────┘
             │                               │
             ▼                               ▼
┌─────────────────────────────────────────────────────────┐
│                       Express框架                        │
│   路由控制 | 中间件 | Session管理 | 文件上传              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                     业务逻辑层                           │
│   认证授权 | 数据验证 | 业务处理 | 文件管理               │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                    数据访问层                            │
│              DataManager工具类                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                   MySQL 8.0 数据库                       │
│   users | movies | comments | favorites                 │
└─────────────────────────────────────────────────────────┘
```

### 数据库设计

#### ER图关系
```
users (1) ────── (N) comments (N) ────── (1) movies
  │                                          │
  │                                          │
  └────────── (N) favorites (N) ─────────────┘
```

#### 核心数据表

**users（用户表）**
- id, username, password, nickname, email, avatar, role, created_at

**movies（电影表）**
- id, title, director, year, rating, duration, genre, country, description, poster_url, video_path, status, created_at

**comments（评论表）**
- id, user_id, movie_id, content, rating, created_at

**favorites（收藏表）**
- user_id, movie_id, created_at

---

## 🔧 开发指南

### 添加新路由

```javascript
// routes/example.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/example', {
    title: '示例页面',
    user: req.session.user
  });
});

module.exports = router;
```

### 添加新页面

```html
<!-- views/pages/example.ejs -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title><%= title %></title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <%- include('../partials/header') %>
    
    <!-- 页面内容 -->
    
    <%- include('../partials/footer') %>
</body>
</html>
```

### API开发规范

```javascript
// RESTful API示例
router.get('/api/movies/:id', async (req, res) => {
  try {
    const movie = await DataManager.findMovieById(req.params.id);
    res.json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});
```

---

## 📋 课程要求对照表

| 要求项 | 实现情况 | 说明 |
|--------|---------|------|
| HTML5语义化标签 | ✅ | 使用header、nav、main、aside、footer等 |
| CSS3响应式布局 | ✅ | 媒体查询适配三端 |
| 原生JavaScript | ✅ | DOM操作和事件处理 |
| jQuery框架 | ✅ | AJAX和表单验证 |
| Bootstrap 5.x | ✅ | Jumbotron、Carousel等组件 |
| AJAX异步请求 | ✅ | 搜索功能（可扩展） |
| JSON数据处理 | ✅ | 电影和用户数据管理 |
| Node.js服务 | ✅ | Express服务器 |
| Express框架 | ✅ | 路由和中间件 |
| 数据持久化 | ✅ | JSON文件系统 |
| 8个关联页面 | ✅ | 首页、列表、详情、搜索、注册、登录、个人中心、错误页 |
| 3种表单 | ✅ | 注册、登录、个人信息 |
| 前端表单验证 | ✅ | 实时验证和错误提示 |
| 后端表单验证 | ✅ | 数据校验和安全性 |
| Session/Cookie | ✅ | 用户会话管理 |
| Jumbotron组件 | ✅ | 首页定制化巨幕 |
| Carousel轮播图 | ✅ | 自动播放和手动切换 |
| 统一色彩体系 | ✅ | CSS变量定义 |
| 2种CSS3动画 | ✅ | 淡入、滑入、弹跳动画 |
| EJS模板引擎 | ✅ | 动态页面渲染 |
| 5种页面模板 | ✅ | 不同风格的页面设计 |
| 动态数据绑定 | ✅ | 电影列表、用户信息 |
| 条件渲染 | ✅ | 登录状态判断 |
| 循环渲染 | ✅ | 电影列表、分类标签 |

## 开发团队

本项目为Web应用开发课程设计项目。

## 许可证

MIT License

## 📋 课程要求对照表

| 要求分类 | 具体要求 | 完成情况 | 实现说明 |
|---------|---------|---------|---------|
| **前端基础** | HTML5语义化标签 | ✅ 完成 | header, nav, main, aside, footer, section等 |
| | CSS3响应式布局 | ✅ 完成 | 媒体查询适配480px/768px/992px断点 |
| | 媒体查询 | ✅ 完成 | 9个媒体查询适配多端设备 |
| **交互技术** | 原生JavaScript | ✅ 完成 | DOM操作、事件处理、数据验证 |
| | jQuery框架 | ✅ 完成 | AJAX请求、DOM操作、事件绑定 |
| | DOM操作与事件处理 | ✅ 完成 | 动态内容更新、表单验证、交互响应 |
| **前端框架** | Bootstrap 5.x | ✅ 完成 | 5.3.0版本，完整组件集成 |
| | 组件集成与定制 | ✅ 完成 | Jumbotron、Carousel等定制开发 |
| **动态技术** | AJAX异步请求 | ✅ 完成 | 评论、收藏、搜索等功能 |
| | JSON数据处理 | ✅ 完成 | API数据交互、前后端通信 |
| **后端技术** | Node.js | ✅ 完成 | 18+ LTS版本 |
| | Express框架 | ✅ 完成 | 4.18.2版本，MVC架构 |
| **数据存储** | MySQL数据库 | ✅ 完成 | 8.0版本，完整数据库设计 |
| **页面数量** | 至少8个页面 | ✅ 超额 | 10个相互关联的页面 |
| **布局结构** | header+nav+main+aside+footer | ✅ 完成 | 标准网页布局+粘性页脚 |
| **响应式设计** | 三端适配 | ✅ 完成 | 桌面/平板/移动完美适配 |
| **表单类型** | 至少3种表单 | ✅ 超额 | 4种表单（注册/登录/资料编辑/管理） |
| **前端验证** | 实时格式校验 | ✅ 完成 | 用户名、邮箱、密码实时验证 |
| | 错误提示 | ✅ 完成 | 友好的错误提示信息 |
| | 表单状态管理 | ✅ 完成 | is-invalid类、禁用状态控制 |
| **后端验证** | 数据安全校验 | ✅ 完成 | 用户名唯一性、数据完整性 |
| | 防注入处理 | ✅ 完成 | 参数化查询、输入过滤 |
| | 错误处理机制 | ✅ 完成 | try-catch、错误页面 |
| **会话管理** | Session/Cookie | ✅ 完成 | express-session实现 |
| **Bootstrap组件** | Jumbotron定制 | ✅ 完成 | 首页巨幕自定义设计 |
| | Carousel轮播图 | ✅ 完成 | 自动播放+手动切换 |
| **视觉效果** | 统一色彩体系 | ✅ 完成 | CSS变量定义完整色彩系统 |
| | 字体规范 | ✅ 完成 | 统一字体族设置 |
| | CSS3动画效果(≥2种) | ✅ 超额 | 6种以上动画效果 |
| **模板引擎** | EJS | ✅ 完成 | 3.1.9版本 |
| | 5种页面模板 | ✅ 完成 | 展示型/表单型/列表型/详情型/管理型 |
| | 动态数据绑定 | ✅ 完成 | <%= %>语法数据绑定 |
| | 条件渲染 | ✅ 完成 | <% if %> 条件判断 |
| | 循环渲染 | ✅ 完成 | <% forEach %> 列表渲染 |

### 完成度统计
- **基础要求**: 23/23 ✅ (100%)
- **超额完成**: 页面10个(+2)、表单4种(+1)、动画6种(+4)
- **总体完成度**: **100%**

---

## 🎨 技术亮点

### 1. 完善的用户系统
- ✨ 密码bcrypt加密存储
- ✨ Session持久化登录
- ✨ 角色权限分级(普通用户/管理员)
- ✨ 头像上传与管理

### 2. 强大的管理后台
- ✨ 电影CRUD完整操作
- ✨ 用户权限管理
- ✨ 评论审核删除
- ✨ 文件上传处理(海报/视频)
- ✨ 数据统计展示

### 3. 优秀的交互体验
- ✨ AJAX无刷新操作
- ✨ Toast提示反馈
- ✨ 加载动画效果
- ✨ 表单实时验证
- ✨ 响应式动画

### 4. 安全性保障
- ✨ SQL注入防护(参数化查询)
- ✨ XSS攻击防护(EJS自动转义)
- ✨ CSRF防护(Session验证)
- ✨ 密码加密存储(bcryptjs)

### 5. 代码质量
- ✨ MVC架构清晰
- ✨ 模块化设计
- ✨ RESTful API规范
- ✨ 统一错误处理
- ✨ 代码注释完善

---

## 🐛 常见问题

### Q: 数据库连接失败？
**A:** 检查以下几点：
1. MySQL服务是否启动
2. `config/database.js` 中的连接信息是否正确
3. 数据库 `movie_db` 是否已创建
4. 用户权限是否足够

### Q: 上传的文件无法访问？
**A:** 确保以下目录存在且有写入权限：
- `public/uploads/avatars/`
- `public/uploads/posters/`
- `public/vedio/`

### Q: 端口3000被占用？
**A:** 修改 `server.js` 中的端口号或关闭占用端口的程序：
```javascript
const PORT = process.env.PORT || 3001;  // 改为其他端口
```

### Q: npm install 速度慢？
**A:** 使用国内镜像：
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- 使用2空格缩进
- 变量命名采用驼峰命名法
- 函数功能单一，职责明确
- 添加必要的代码注释

---

## 📝 更新日志

### v1.0.0 (2024-12-14)
- ✅ 初始版本发布
- ✅ 实现10个页面完整功能
- ✅ 用户认证与权限系统
- ✅ 电影CRUD与文件上传
- ✅ 评论与收藏功能
- ✅ 管理员后台
- ✅ MySQL数据库集成
- ✅ 响应式设计完成

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 🙏 致谢

- [Node.js](https://nodejs.org/) - JavaScript运行时
- [Express](https://expressjs.com/) - Web应用框架
- [Bootstrap](https://getbootstrap.com/) - 前端UI框架
- [MySQL](https://www.mysql.com/) - 关系型数据库
- [EJS](https://ejs.co/) - 模板引擎

---

## 📞 联系方式

- **项目地址**: [https://github.com/keyoshoin/movie-website](https://github.com/keyoshoin/movie-website)
- **问题反馈**: [Issues](https://github.com/keyoshoin/movie-website/issues)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个Star支持！⭐**

Made with ❤️ by Web Development Course Team

</div>

