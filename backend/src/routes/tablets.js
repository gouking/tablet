const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { body, query, validationResult } = require('express-validator');
const { authenticate, requireRole } = require('../middleware/auth');

const prisma = new PrismaClient();

// 搜尋 + 列表（含分頁）
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { search, type, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      templeId: req.user.templeId,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(type && { type }),
      ...(status && { status }),
    };

    const [tablets, total] = await Promise.all([
      prisma.tablet.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { creator: { select: { name: true } } },
      }),
      prisma.tablet.count({ where }),
    ]);

    res.json({ tablets, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
});

// 取得單一牌位
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const tablet = await prisma.tablet.findFirst({
      where: { id: parseInt(req.params.id), templeId: req.user.templeId },
      include: {
        creator: { select: { name: true } },
        printJobs: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!tablet) return res.status(404).json({ error: '牌位不存在' });
    res.json(tablet);
  } catch (err) { next(err); }
});

// 建立牌位
router.post('/', authenticate, [
  body('type').isIn(['REBIRTH', 'BLESSING', 'SALVATION', 'DISASTER']),
  body('name').notEmpty().withMessage('姓名為必填'),
  body('duration').notEmpty(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { type, name, title, birthYear, deathYear, family, duration, endDate, note } = req.body;
    const tablet = await prisma.tablet.create({
      data: {
        type, name, title, birthYear, deathYear,
        family, duration, note,
        endDate: endDate ? new Date(endDate) : null,
        templeId: req.user.templeId,
        createdBy: req.user.id,
      },
    });
    res.status(201).json(tablet);
  } catch (err) { next(err); }
});

// 更新牌位
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { type, name, title, birthYear, deathYear, family, duration, endDate, note, status } = req.body;
    const tablet = await prisma.tablet.findFirst({
      where: { id: parseInt(req.params.id), templeId: req.user.templeId },
    });
    if (!tablet) return res.status(404).json({ error: '牌位不存在' });

    const updated = await prisma.tablet.update({
      where: { id: parseInt(req.params.id) },
      data: { type, name, title, birthYear, deathYear, family, duration, note, status,
               endDate: endDate ? new Date(endDate) : null },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

// 刪除牌位
router.delete('/:id', authenticate, requireRole('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const tablet = await prisma.tablet.findFirst({
      where: { id: parseInt(req.params.id), templeId: req.user.templeId },
    });
    if (!tablet) return res.status(404).json({ error: '牌位不存在' });
    await prisma.tablet.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: '已刪除' });
  } catch (err) { next(err); }
});

module.exports = router;
