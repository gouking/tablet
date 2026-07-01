const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { generateTabletPDF, generateBatchPDF } = require('../utils/pdfGenerator');

const prisma = new PrismaClient();

// 打印單張牌位 PDF
router.get('/:id/pdf', authenticate, async (req, res, next) => {
  try {
    const tablet = await prisma.tablet.findFirst({
      where: { id: parseInt(req.params.id), templeId: req.user.templeId },
    });
    if (!tablet) return res.status(404).json({ error: '牌位不存在' });

    const copies = parseInt(req.query.copies) || 1;

    // 記錄打印
    await prisma.printJob.create({
      data: { tabletId: tablet.id, copies, printer: req.query.printer || null },
    });
    await prisma.tablet.update({
      where: { id: tablet.id },
      data: { printCount: { increment: copies } },
    });

    generateTabletPDF(tablet, res);
  } catch (err) { next(err); }
});

// 批次打印多張
router.post('/batch', authenticate, async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ error: '請提供牌位 ID 列表' });

    const tablets = await prisma.tablet.findMany({
      where: { id: { in: ids.map(Number) }, templeId: req.user.templeId },
    });

    await Promise.all(tablets.map(t =>
      prisma.printJob.create({ data: { tabletId: t.id, copies: 1 } })
    ));

    generateBatchPDF(tablets, res);
  } catch (err) { next(err); }
});

// 打印記錄
router.get('/jobs', authenticate, async (req, res, next) => {
  try {
    const jobs = await prisma.printJob.findMany({
      where: { tablet: { templeId: req.user.templeId } },
      include: { tablet: { select: { name: true, type: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(jobs);
  } catch (err) { next(err); }
});

module.exports = router;
