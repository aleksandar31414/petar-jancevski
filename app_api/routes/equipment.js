const express = require('express');
const ctrl = require('../controllers/equipment');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /equipment:
 *   get:
 *     tags: [Опрема]
 *     summary: Каталог на опрема
 *     responses:
 *       200: { description: Листа, content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Equipment' } } } } }
 *   post:
 *     tags: [Опрема]
 *     summary: Додавање опрема (администратор)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category]
 *             properties:
 *               name: { type: string, example: Термос }
 *               category: { type: string, enum: [obuvki, obleka, bezbednost, hrana, drugo] }
 *     responses:
 *       201: { description: Креирано, content: { application/json: { schema: { $ref: '#/components/schemas/Equipment' } } } }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       409: { $ref: '#/components/responses/Conflict' }
 */
router.get('/', ctrl.list);
router.post('/', requireAdmin, ctrl.create);

/**
 * @openapi
 * /equipment/{id}:
 *   delete:
 *     tags: [Опрема]
 *     summary: Бришење опрема (администратор)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       204: { description: Избришано }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id', requireAdmin, ctrl.remove);

module.exports = router;
