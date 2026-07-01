const express = require('express');
const PDFDocument = require('pdfkit');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/:purchaseId', authenticateToken, async (req, res) => {
    const purchase = await db.prepare(`SELECT p.*, l.title, u1.username as buyer, u2.username as seller
        FROM purchases p JOIN lots l ON p.lot_id=l.id
        JOIN users u1 ON p.buyer_id=u1.id JOIN users u2 ON p.seller_id=u2.id
        WHERE p.id=? AND (p.buyer_id=? OR p.seller_id=?)`).get(req.params.purchaseId, req.user.id, req.user.id);
    if (!purchase) return res.status(404).json({ error: 'Не знайдено' });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${purchase.id}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('РАХУНОК', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`№ ${purchase.id}`);
    doc.text(`Дата: ${new Date(purchase.created_at).toLocaleDateString('uk-UA')}`);
    doc.moveDown();
    doc.fontSize(14).text(purchase.title);
    doc.moveDown();
    doc.fontSize(12).text(`Продавець: ${purchase.seller}`);
    doc.text(`Покупець: ${purchase.buyer}`);
    doc.text(`Сума: ${Number(purchase.amount).toLocaleString('uk-UA')} грн.`);
    doc.text(`Статус: ${purchase.status}`);
    doc.text(`Спосіб оплати: ${purchase.payment_method || '—'}`);
    doc.moveDown(2);
    doc.fontSize(10).fillColor('#666').text('KRAM.UA — Преміальний аукціон', { align: 'center' });
    doc.end();
});

module.exports = router;
