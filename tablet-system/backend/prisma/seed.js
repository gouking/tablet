const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('建立初始資料...');

  const temple = await prisma.temple.upsert({
    where: { id: 1 },
    update: {},
    create: { name: '示範寺院', address: '台灣台北市', phone: '02-12345678' },
  });

  const hashed = await bcrypt.hash('admin1234', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@temple.tw' },
    update: {},
    create: {
      email: 'admin@temple.tw',
      password: hashed,
      name: '系統管理員',
      role: 'ADMIN',
      templeId: temple.id,
    },
  });

  // 建立幾筆示範牌位
  const sampleTablets = [
    { type: 'REBIRTH', name: '陳阿嬤', title: '顯', birthYear: '民國30年', deathYear: '民國112年', family: '子 陳大明 仝叩', duration: '七七四十九日' },
    { type: 'BLESSING', name: '李志明', birthYear: '民國55年', family: '妻 陳美麗 叩', duration: '一年', note: '消災延壽' },
    { type: 'REBIRTH', name: '王秀英', title: '顯', birthYear: '民國40年', deathYear: '民國113年', family: '女 王小花 叩', duration: '永久' },
    { type: 'SALVATION', name: '無主孤魂', duration: '七七四十九日', note: '法會超度' },
    { type: 'DISASTER', name: '張家全體', family: '張建國 叩', duration: '一年', note: '全家消災祈福' },
  ];

  for (const t of sampleTablets) {
    await prisma.tablet.create({
      data: { ...t, templeId: temple.id, createdBy: admin.id },
    });
  }

  console.log('✅ 初始資料建立完成');
  console.log('   管理員帳號：admin@temple.tw');
  console.log('   管理員密碼：admin1234');
}

main().catch(console.error).finally(() => prisma.$disconnect());
