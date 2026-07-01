const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未提供認證 token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { temple: true },
    });
    if (!user) return res.status(401).json({ error: '用戶不存在' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Token 無效或已過期' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: '權限不足' });
  }
  next();
};

module.exports = { authenticate, requireRole };
