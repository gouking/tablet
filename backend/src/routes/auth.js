const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');

const prisma = new PrismaClient();

// 登入
router.post('/login', [
  body('email').isEmail().withMessage('請輸入有效的 Email'),
  body('password').notEmpty().withMessage('請輸入密碼'),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { temple: true },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Email 或密碼錯誤' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, temple: user.temple },
    });
  } catch (err) { next(err); }
});

// 取得目前用戶資料
router.get('/me', authenticate, (req, res) => {
  const { password, ...user } = req.user;
  res.json(user);
});

// 建立帳號（管理員用）
router.post('/register', authenticate, [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }).withMessage('密碼至少 6 碼'),
  body('name').notEmpty(),
  body('templeId').isInt(),
  body('role').isIn(['ADMIN', 'MANAGER', 'STAFF']),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password, name, role, templeId } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role, templeId },
    });
    const { password: _, ...safe } = user;
    res.status(201).json(safe);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Email 已被使用' });
    next(err);
  }
});

// 修改密碼
router.put('/password', authenticate, [
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({ error: '舊密碼錯誤' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: '密碼已更新' });
  } catch (err) { next(err); }
});

module.exports = router;
