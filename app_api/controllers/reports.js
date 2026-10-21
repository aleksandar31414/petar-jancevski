const path = require('path');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const { asyncH } = require('../utils/errors');
const { withCounts } = require('./tours');

const Tour = mongoose.model('Tour');
const Registration = mongoose.model('Registration');

const FONT = path.join(__dirname, '..', 'assets', 'fonts', 'DejaVuSans.ttf');
const FONT_BOLD = path.join(__dirname, '..', 'assets', 'fonts', 'DejaVuSans-Bold.ttf');
const DIFF = { lesna: 'Лесна', sredna: 'Средна', teshka: 'Тешка' };
const date = (d) => new Date(d).toLocaleDateString('mk-MK');

/** GET /reports/tours.pdf – PDF извештај за наредните тури и учесниците (pdfkit). */
const toursPdf = asyncH(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tours = await withCounts(await Tour.find({ date: { $gte: today } }).populate('location', 'name').sort({ date: 1 }));
  const regs = await Registration.find({ tour: { $in: tours.map((t) => t._id) } })
    .populate('user', 'name phone')
    .sort({ status: -1, createdAt: 1 });

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  doc.registerFont('regular', FONT);
  doc.registerFont('bold', FONT_BOLD);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="vrvtura-izvestaj.pdf"');
  doc.pipe(res);

  doc.font('bold').fontSize(18).fillColor('#1f4d3a').text('ВрвТура – извештај за наредните тури');
  doc.font('regular').fontSize(9).fillColor('#555')
    .text(`Генериран: ${new Date().toLocaleString('mk-MK')} · ${req.auth.name}`);
  doc.moveDown();

  // Табела со тури
  const cols = [30, 200, 75, 60, 70, 60];
  const headers = ['#', 'Тура', 'Датум', 'Тежина', 'Врв', 'Пријавени'];
  const row = (cells, bold) => {
    const y = doc.y;
    let x = 40;
    doc.font(bold ? 'bold' : 'regular').fontSize(9).fillColor('#222');
    cells.forEach((c, i) => { doc.text(String(c), x, y, { width: cols[i] - 4 }); x += cols[i]; });
    doc.moveDown(0.6);
    doc.x = 40;
  };
  row(headers, true);
  let totalReg = 0;
  let totalCap = 0;
  tours.forEach((t, i) => {
    totalReg += t.registeredCount;
    totalCap += t.capacity;
    row([i + 1, t.title, date(t.date), DIFF[t.difficulty], t.location ? t.location.name : '', `${t.registeredCount}/${t.capacity}`]);
  });
  doc.moveDown(0.5).font('bold').text(`Вкупно пријавени: ${totalReg} / ${totalCap}`, 40);
  doc.moveDown();

  // Учесници по тура
  tours.forEach((t) => {
    const list = regs.filter((r) => String(r.tour) === String(t._id) && r.user);
    if (doc.y > 720) doc.addPage();
    doc.font('bold').fontSize(11).fillColor('#1f4d3a').text(`${t.title} – ${date(t.date)} во ${t.meetTime}`, 40);
    doc.font('regular').fontSize(9).fillColor('#222');
    if (!list.length) doc.text('Нема пријавени учесници.');
    list.forEach((r, i) => {
      doc.text(`${i + 1}. ${r.user.name}${r.user.phone ? ` – ${r.user.phone}` : ''} – превоз: ${r.needsTransport ? 'да' : 'не'}${r.status === 'cekanje' ? ' (листа на чекање)' : ''}`);
    });
    doc.moveDown(0.6);
  });

  doc.end();
});

module.exports = { toursPdf };
