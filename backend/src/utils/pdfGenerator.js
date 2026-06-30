const PDFDocument = require('pdfkit');
const path = require('path');

const TYPE_LABELS = {
  REBIRTH: '往生蓮位',
  BLESSING: '祈福蓮位',
  SALVATION: '超度蓮位',
  DISASTER: '消災蓮位',
};

/**
 * 產生單張牌位 PDF
 * @param {object} tablet - 牌位資料
 * @param {object} res - Express response（stream 直接輸出）
 */
function generateTabletPDF(tablet, res) {
  const doc = new PDFDocument({
    size: [241, 323], // 8.5cm x 11.4cm in points (1cm ≈ 28.35pt)
    margin: 0,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="tablet-${tablet.id}.pdf"`);
  doc.pipe(res);

  const W = 241, H = 323;
  const cx = W / 2;

  // 背景（深墨色）
  doc.rect(0, 0, W, H).fill('#1a0a00');

  // 金色外框
  doc.rect(8, 8, W - 16, H - 16).lineWidth(2).stroke('#b8860b');
  doc.rect(12, 12, W - 24, H - 24).lineWidth(0.5).stroke('#d4a017');

  // 頂部類型
  doc.fillColor('#d4a017').fontSize(11)
    .text(TYPE_LABELS[tablet.type] || '往生蓮位', 0, 30, { align: 'center', characterSpacing: 3 });

  // 蓮花裝飾符
  doc.fillColor('#b8860b').fontSize(20)
    .text('❀', 0, 52, { align: 'center' });

  // 稱謂
  const title = tablet.title || '顯';
  doc.fillColor('#d4a017').fontSize(10)
    .text(title, 0, 82, { align: 'center', characterSpacing: 2 });

  // 主名（最大、金色）
  doc.fillColor('#ffd700').fontSize(28)
    .font('Helvetica-Bold')
    .text(tablet.name, 0, 100, { align: 'center', characterSpacing: 5 });

  // 稱謂後綴
  const suffix = tablet.type === 'REBIRTH' ? '居士之蓮位' : '蓮位';
  doc.fillColor('#d4a017').fontSize(10).font('Helvetica')
    .text(suffix, 0, 140, { align: 'center', characterSpacing: 2 });

  // 生歿年
  if (tablet.birthYear || tablet.deathYear) {
    let dateText = '';
    if (tablet.birthYear) dateText += `生：${tablet.birthYear}`;
    if (tablet.deathYear) dateText += (dateText ? '   ' : '') + `歿：${tablet.deathYear}`;
    doc.fillColor('#a07030').fontSize(9)
      .text(dateText, 0, 165, { align: 'center' });
  }

  // 供奉期間
  doc.fillColor('#8b6914').fontSize(8)
    .text(`供奉：${tablet.duration}`, 0, 185, { align: 'center' });

  // 分隔線
  doc.moveTo(40, 205).lineTo(W - 40, 205).lineWidth(0.5).stroke('#5a3a0a');

  // 陽上款
  if (tablet.family) {
    doc.fillColor('#a07030').fontSize(9)
      .text(tablet.family, 0, 215, { align: 'center' });
  }

  // 底部裝飾
  doc.fillColor('#5a3a0a').fontSize(8)
    .text('南無阿彌陀佛', 0, H - 30, { align: 'center', characterSpacing: 2 });

  doc.end();
}

/**
 * 批次產生多張牌位 PDF（每頁一張）
 */
function generateBatchPDF(tablets, res) {
  const doc = new PDFDocument({ autoFirstPage: false, margin: 0 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="tablets-batch.pdf"`);
  doc.pipe(res);

  tablets.forEach(tablet => {
    doc.addPage({ size: [241, 323], margin: 0 });
    renderTabletPage(doc, tablet);
  });

  doc.end();
}

function renderTabletPage(doc, tablet) {
  const W = 241, H = 323;
  doc.rect(0, 0, W, H).fill('#1a0a00');
  doc.rect(8, 8, W - 16, H - 16).lineWidth(2).stroke('#b8860b');
  doc.fillColor('#d4a017').fontSize(11)
    .text(TYPE_LABELS[tablet.type] || '往生蓮位', 0, 30, { align: 'center', characterSpacing: 3 });
  doc.fillColor('#ffd700').fontSize(26).font('Helvetica-Bold')
    .text(tablet.name, 0, 100, { align: 'center', characterSpacing: 5 });
  if (tablet.family) {
    doc.fillColor('#a07030').fontSize(9).font('Helvetica')
      .text(tablet.family, 0, 215, { align: 'center' });
  }
  doc.fillColor('#5a3a0a').fontSize(8)
    .text('南無阿彌陀佛', 0, H - 30, { align: 'center', characterSpacing: 2 });
}

module.exports = { generateTabletPDF, generateBatchPDF };
