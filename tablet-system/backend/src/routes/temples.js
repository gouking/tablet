const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const temples = await prisma.temple.findMany({
      include: { _count: { select: { tablets: true, users: true } } },
    });
    res.json(temples);
  } catch (err) { next(err); }
});

router.post('/', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { name, address, phone } = req.body;
    if (!name) return res.status(400).json({ error: '寺院名稱為必填' });
    const temple = await prisma.temple.create({ data: { name, address, phone } });
    res.status(201).json(temple);
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, requireRole('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const { name, address, phone } = req.body;
    const temple = await prisma.temple.update({
      where: { id: parseInt(req.params.id) },
      data: { name, address, phone },
    });
    res.json(temple);
  } catch (err) { next(err); }
});

module.exports = router;
