const bcrypt = require('bcryptjs');

// 密码加密
function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

// 密码验证
function comparePassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

// 验证邮箱格式
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 验证用户名格式（3-20个字符，只能包含字母、数字和下划线）
function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

// 验证密码强度（至少6个字符）
function isValidPassword(password) {
  return password && password.length >= 6;
}

module.exports = {
  hashPassword,
  comparePassword,
  isValidEmail,
  isValidUsername,
  isValidPassword
};

