/*
 Navicat Premium Dump SQL

 Source Server         : movie_db
 Source Server Type    : MySQL
 Source Server Version : 100432 (10.4.32-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : movie_db

 Target Server Type    : MySQL
 Target Server Version : 100432 (10.4.32-MariaDB)
 File Encoding         : 65001

 Date: 15/12/2025 09:00:20
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `parent_id` int NULL DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_movie_id`(`movie_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_parent_id`(`parent_id` ASC) USING BTREE,
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_parent_comment` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of comments
-- ----------------------------
INSERT INTO `comments` VALUES (1, 1, 6, NULL, '还不错', '2025-12-13 18:17:45', '2025-12-13 18:17:45');
INSERT INTO `comments` VALUES (3, 1, 6, 1, '222', '2025-12-13 19:31:19', '2025-12-13 19:31:19');
INSERT INTO `comments` VALUES (4, 2, 6, NULL, '111', '2025-12-14 20:59:11', '2025-12-14 20:59:11');
INSERT INTO `comments` VALUES (5, 2, 6, 4, '23', '2025-12-14 20:59:37', '2025-12-14 20:59:37');

-- ----------------------------
-- Table structure for favorites
-- ----------------------------
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_favorite`(`user_id` ASC, `movie_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_movie_id`(`movie_id` ASC) USING BTREE,
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of favorites
-- ----------------------------
INSERT INTO `favorites` VALUES (4, 2, 6, '2025-12-14 20:59:51');

-- ----------------------------
-- Table structure for movies
-- ----------------------------
DROP TABLE IF EXISTS `movies`;
CREATE TABLE `movies`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `genre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `year` int NULL DEFAULT NULL,
  `rating` decimal(3, 1) NULL DEFAULT NULL,
  `poster_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `director` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `duration` int NULL DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_genre`(`genre` ASC) USING BTREE,
  INDEX `idx_year`(`year` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of movies
-- ----------------------------
INSERT INTO `movies` VALUES (1, '肖申克的救赎', '监狱中的希望之光。一个银行家安迪因被控谋杀妻子而被投入监狱，在监狱中与狱友瑞德建立了深厚的友谊。通过多年的博持和智慧，他最终逃出了监狱，开启了新的生活。', '剧情', 1994, 9.7, 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2561716440.webp', '弗兰克·德拉蒙特', 142, '美国', 'active', '2025-12-11 19:12:33');
INSERT INTO `movies` VALUES (2, '霸王别姬', '京剧艺人的悲欢离合。讲述了两位京剧艺人的爱恨情仇，跨越了几十年的岁月变迁。一部在政治与艺术之间迷失的悲剧诗歌。', '剧情', 1993, 9.5, 'https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2561642690.webp', '陈凯歌', 171, '中国', 'active', '2025-12-11 19:12:33');
INSERT INTO `movies` VALUES (3, '阿甘正传', '一个善良人的人生奇迹。智力受限的阿甘凭借博定的信念和行动，在各个领域都取得了非凡的成就，诠释了什么是真正的人生价值。', '剧情', 1994, 9.1, 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2561716907.webp', '罗伯特·泽米吉斯', 142, '美国', 'active', '2025-12-11 19:12:33');
INSERT INTO `movies` VALUES (4, '大话西游之大圣娶亲', '无厘头的西游故事。周星驰以其独特的幽默风格，将西游记的故事演绎得离奇搞笑，成为了一代人的经典回忆。', '喜剧', 1995, 8.3, 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2561717276.webp', '刘镇伟', 110, '中国', 'active', '2025-12-11 19:12:33');
INSERT INTO `movies` VALUES (5, '泰坦尼克号', '沉没的爱情史诗。大西洋上豪华邮轮沉没的历史背景下，演绎了一段跨越阶级的深挚爱情故事，震撼人心的视听盛宴。', '爱情', 1997, 9.5, 'https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2561717867.webp', '詹姆斯·卡梅隆', 194, '美国', 'active', '2025-12-11 19:12:33');
INSERT INTO `movies` VALUES (6, '流浪地球', '人类生存的壮丽想象。当太阳即将毁灭地球时，人类启动了一项壮大的计划——将地球变成一艘宇宙飞船，带领人类驶向新的星球。', '科幻', 2019, 8.3, 'https://th.bing.com/th/id/R.fd903e798ddbbc4258081eef0141e3af?rik=mtBwy1YJTHQ7Yw&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20230122ac%2f684%2fw1284h1800%2f20230122%2f93fd-fb3b91441a0437efbd5e51db1c6b950e.jpg&ehk=i2JuTI3Dw7nYWxTvvnEjdQbL7hdgEQWK9jNyeit7km0%3d&r', '郭帆', 125, '中国', 'active', '2025-12-11 19:12:33');
INSERT INTO `movies` VALUES (7, '你的名字', '穿越时空的爱情。两个素未谋面的高中生意外地在梦中互换身体，展开了一场跨越时空、感人至深的爱情故事。', '动画, 爱情', 2016, 8.8, 'https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2505185869.webp', '新海诚', 106, '日本', 'active', '2025-12-11 19:12:33');
INSERT INTO `movies` VALUES (8, '战狼2', '中国英雄的荣耀。一名中国军人在非洲执行任务时，为了保护无辜的平民，与恐怖分子展开了激烈的对抗，彰显了中国军人的勇气与担当。', '动作', 2017, 7.3, 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2651240185.webp', '陈思诚', 125, '中国', 'active', '2025-12-11 19:12:33');
INSERT INTO `movies` VALUES (9, '疯狂动物城', '在高度拟人化的动物都市中，一名兔子警官与狡黠的狐狸联手揭露阴谋，传递包容与勇气的故事。', '动画, 冒险, 喜剧', 2016, 9.1, '/images/movie9.jpg', '拜伦·霍华德/里奇·摩尔', 108, '美国', 'active', '2025-12-12 00:11:54');
INSERT INTO `movies` VALUES (10, '海上钢琴师', '在一艘跨大西洋的邮轮上出生并成长的钢琴天才，他的音乐与一生的孤独交织成传奇。', '剧情, 音乐', 1998, 9.2, '/images/movie10.jpg', '朱塞佩·托纳多雷', 165, '意大利', 'active', '2025-12-12 00:11:54');
INSERT INTO `movies` VALUES (11, '教父', '以科里昂家族为核心，讲述黑手党家族的权力争斗与伦理抉择，史诗般刻画美国黑帮史。', '剧情, 犯罪', 1972, 9.2, '/images/movie11.jpg', '弗朗西斯·福特·科波拉', 175, '美国', 'active', '2025-12-12 00:11:54');
INSERT INTO `movies` VALUES (12, '海蒂和爷爷', '小女孩海蒂与生活在阿尔卑斯山的爷爷相依为命，在自然与友情中成长的温情故事。', '家庭, 儿童', 2015, 9.1, '/images/movie12.jpg', '阿拉斯泰尔·芬宁', 103, '德国', 'active', '2025-12-12 00:11:54');
INSERT INTO `movies` VALUES (13, '星际穿越', '讲述了在不远的未来，地球气候急剧恶化，粮食作物受到枯萎病的威胁，人类已经难以生存。前NASA飞行员库珀和其他几位专家教授组成了探险小组，到太阳系之外寻找适合人类居住的星球。', '科幻, 冒险, 剧情', 2014, 9.3, '/images/movie8.jpg', '克里斯托弗·诺兰', 169, '美国', 'active', '2025-12-12 00:11:54');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE,
  INDEX `idx_username`(`username` ASC) USING BTREE,
  INDEX `idx_email`(`email` ASC) USING BTREE,
  INDEX `idx_role`(`role` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, '1234567', '222', NULL, 'lingerxhr@outlook.com', '$2a$10$9BqrN/laRf9cTcYDRWp2qeZ.vfEoQ1AcXEcIXccKCHH3hn51Lt78y', 'user', '2025-12-13 18:08:53', '2025-12-13 18:08:53');
INSERT INTO `users` VALUES (2, 'admin', '系统管理员', NULL, 'admin@movie.com', '$2a$10$ycgMfnelJ6Um6Y3qDzrpROojrry5vtsk/dBuFb5wke4ATxfWkbPpG', 'admin', '2025-12-13 19:42:20', '2025-12-13 19:42:20');

SET FOREIGN_KEY_CHECKS = 1;
