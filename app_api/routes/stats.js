const express = require('express');
const stats = require('../controllers/stats');
const reports = require('../controllers/reports');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /stats:
 *   get:
 *     tags: [Статистика и извештаи]
 *     summary: Јавни бројки за почетната страница
 *     responses:
 *       200:
 *         description: Бројки
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 upcomingTours: { type: integer }
 *                 users: { type: integer }
 *                 locations: { type: integer }
 *                 avgRating: { type: number, nullable: true }
 */
router.get('/stats', stats.publicStats);

/**
 * @openapi
 * /stats/admin:
 *   get:
 *     tags: [Статистика и извештаи]
 *     summary: Податоци за графиконите во админ таблата (администратор)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Учесници по месец, тури по тежина и бројки }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/stats/admin', requireAdmin, stats.adminStats);

/**
 * @openapi
 * /reports/tours.pdf:
 *   get:
 *     tags: [Статистика и извештаи]
 *     summary: PDF извештај за наредните тури и учесниците (администратор)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: PDF датотека, content: { application/pdf: { schema: { type: string, format: binary } } } }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/reports/tours.pdf', requireAdmin, reports.toursPdf);

module.exports = router;
