const express = require('express');
const ctrl = require('../controllers/activities');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /activities/me:
 *   get:
 *     tags: [Активности]
 *     summary: Историја на активностите на најавениот корисник
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Листа, content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Activity' } } } } }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/me', requireAuth, ctrl.mine);

/**
 * @openapi
 * /activities:
 *   get:
 *     tags: [Активности]
 *     summary: Сите активности во системот (администратор)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: query, name: limit, schema: { type: integer, default: 30 } }]
 *     responses:
 *       200: { description: Листа, content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Activity' } } } } }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/', requireAdmin, ctrl.all);

module.exports = router;
