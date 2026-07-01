const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const templeId = req.user.templeId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [total, thisMonth, thisYear, byType, recentPrints, expiringSoon] = await Promise.all([
      prisma.tablet.count({ where: { templeId } }),

      prisma.tablet.count({
        where: { templeId, createdAt: { gte: monthStart } },
      }),

      prisma.tablet.count({
        where: { templeId, createdAt: { gte: yearStart } },
      }),

      prisma.tablet.groupBy({
        by: ['type'],
        where: { templeId },
        _count: { type: true },
      }),

      prisma.printJob.count({
        where: { tablet: { templeId }, createdAt: { gte: monthStart } },
      }),

      // 30 天內到期
      prisma.tablet.count({
        where: {
          templeId,
          status: 'ACTIVE',
          endDate: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // 每月趨勢（近 6 個月）
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const count = await prisma.tablet.count({
        where: { templeId, createdAt: { gte: start, lte: end } },
      });
      monthlyTrend.push({
        month: `${start.getFullYear()}/${start.getMonth() + 1}`,
        count,
      });
    }

    res.json({
      total, thisMonth, thisYear, recentPrints, expiringSoon,
      byType: byType.reduce((acc, r) => ({ ...acc, [r.type]: r._count.type }), {}),
      monthlyTrend,
    });
  } catch (err) { next(err); }
});

module.exports = router;
