# 数据库连接配置指南

## 概述

本项目已配置为使用 MySQL 数据库代替 JSON 文件存储。所有数据将存储在 MySQL 数据库中。

## 前置要求

1. **安装 MySQL 服务器**
   - Windows: 从 [mysql.com](https://dev.mysql.com/downloads/mysql/) 下载安装
   - 或使用 XAMPP/WAMP 内置的 MySQL

2. **安装 Navicat**
   - 从 [navicat.com](https://www.navicat.com/) 下载安装（可选，用于可视化管理数据库）

## 配置步骤

### 1. 修改 `.env` 文件

打开项目根目录中的 `.env` 文件，根据你的 MySQL 配置修改以下参数：

```env
# 数据库主机
DB_HOST=localhost

# 数据库用户名（默认为 root，如果你改过请修改此处）
DB_USER=root

# 数据库密码（如果 MySQL 没有密码则留空）
DB_PASSWORD=

# 数据库名称（项目会自动创建）
DB_NAME=movie_db

# 应用端口
PORT=3000
```

### 2. 确保 MySQL 服务运行

**Windows:**
```powershell
# 检查 MySQL 服务状态
Get-Service | Where-Object {$_.Name -like "*mysql*"}

# 如果未运行，启动服务
Start-Service "MySQL*"
```

### 3. 安装项目依赖

```bash
npm install
```

### 4. 导入数据（电影和用户数据）

首先，将电影和用户数据从 JSON 文件导入到数据库中：

```bash
# 设置数据库密码环境变量（Windows PowerShell）
$env:DB_PASSWORD='your_mysql_password'

# 初始化数据库（创建表）
node utils/initDB.js

# 导入电影数据
node utils/importMovies.js

# 导入用户数据
node utils/importUsers.js
```

### 5. 启动应用

```bash
npm start
```

应用启动时会自动：
- ✓ 连接 `movie_db` 数据库
- ✓ 从数据库读取所有电影和用户数据
- ✓ 在本地运行在 `http://localhost:3000`

**注意：所有电影数据都将从数据库读取，没有硬编码的示例数据。**

## 在 Navicat 中查看数据库

### 创建新连接

1. 打开 Navicat
2. 点击菜单 "连接" → "新建连接" → "MySQL"
3. 填写连接信息：
   - **连接名**: 可自定义，如 "movie_db"
   - **主机**: `localhost`
   - **端口**: `3306`（MySQL 默认端口）
   - **用户名**: `root`（或你的 MySQL 用户名）
   - **密码**: 你的 MySQL 密码（留空则不填）

4. 点击"测试连接"验证连接
5. 点击"确定"保存连接

### 查看数据库

连接建立后，在左侧树形菜单中：
- 展开连接名
- 找到 `movie_db` 数据库
- 展开可看到 `users` 和 `movies` 两张表

### 数据表结构

**users 表（用户信息）:**
```
id (INT) - 用户 ID，主键
username (VARCHAR) - 用户名，唯一
email (VARCHAR) - 邮箱，唯一
password (VARCHAR) - 加密后的密码
created_at (TIMESTAMP) - 创建时间
updated_at (TIMESTAMP) - 更新时间
```

**movies 表（电影信息）:**
```
id (INT) - 电影 ID，主键
title (VARCHAR) - 电影标题
description (TEXT) - 电影描述
genre (VARCHAR) - 电影类型
year (INT) - 上映年份
rating (DECIMAL) - 评分
poster_url (VARCHAR) - 海报 URL
director (VARCHAR) - 导演名字
duration (INT) - 电影时长（分钟）
country (VARCHAR) - 国家
created_at (TIMESTAMP) - 创建时间
```

## 数据导入流程

### 电影数据源：data/movies.json

项目包含 `data/movies.json` 文件，其中存储了所有电影的元数据。数据导入过程如下：

1. **初始化数据库** (`utils/initDB.js`)
   - 创建 `movie_db` 数据库
   - 创建 `users` 和 `movies` 表的空表结构
   - 不插入任何硬编码数据

2. **导入电影数据** (`utils/importMovies.js`)
   - 从 `data/movies.json` 读取电影数据
   - 检查重复（通过电影标题）
   - 将新电影插入数据库

3. **导入用户数据** (`utils/importUsers.js`)
   - 从 `data/users.json` 读取用户数据
   - 检查重复（通过邮箱和用户名）
   - 将新用户插入数据库

### 应用运行时

应用启动后，所有电影数据都通过 `DataManager` 类的数据库查询获取：

- `getAllMovies()` - 获取所有电影
- `findMovieById(id)` - 按 ID 查找电影
- `searchMovies(keyword)` - 搜索电影
- `findMoviesByGenre(genre)` - 按类型查找电影
- `findMoviesByYear(year)` - 按年份查找电影

**所有电影数据都来自 MySQL 数据库，没有硬编码的示例数据。**

## 常见问题

### Q: 连接失败？

**A: 检查以下几点：**

1. MySQL 服务是否运行？
   ```powershell
   Get-Service | Where-Object {$_.Name -like "*mysql*"}
   ```

2. `.env` 文件中的连接信息是否正确？

3. MySQL 用户名和密码是否正确？

4. 防火墙是否阻止了 MySQL 端口（3306）？

### Q: 忘记了 MySQL 密码？

在命令行重置密码：
```powershell
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### Q: 如何清空所有数据重新初始化？

1. 在 Navicat 中右键点击 `movie_db` 数据库
2. 选择 "删除数据库"
3. 重启应用，数据库将自动重建

### Q: 如何备份数据库？

在 Navicat 中：
1. 右键点击 `movie_db` 数据库
2. 选择 "备份数据库"
3. 选择保存位置

### Q: 如何导入数据？

在 Navicat 中：
1. 右键点击 `movie_db` 数据库
2. 选择 "导入向导"
3. 选择数据文件

## 远程数据库连接

如需连接远程 MySQL 服务器，修改 `.env` 文件：

```env
DB_HOST=your-remote-server.com
DB_USER=remote_user
DB_PASSWORD=remote_password
DB_NAME=movie_db
PORT=3000
```

## 后续修改

如需在生产环境中使用：

1. **使用环境变量替代 `.env` 文件**
   - 不要将敏感信息提交到版本控制

2. **启用 SSL 连接**
   - 在 `config/database.js` 中配置 SSL

3. **添加连接池优化**
   - 根据实际流量调整 `connectionLimit`

4. **启用数据库备份策略**
   - 设置定期自动备份

---

**祝使用愉快！** 🎬
