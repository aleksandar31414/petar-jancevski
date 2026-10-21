const express = require('express');
const ctrl = require('../controllers/registrations');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /registrations/me:
 *   get:
 *     tags: [Пријави]
 *     summary: Пријавите на најавениот корисник
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Листа, content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Registration' } } } } }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/me', requireAuth, ctrl.mine);

/**
 * @openapi
 * /registrations/{id}:
 *   delete:
 *     tags: [Пријави]
 *     summary: Откажување пријава (сопственик или администратор)
 *     description: Ако се ослободи место, првиот на листата на чекање автоматски е потврден и известен.
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       204: { description: Откажано }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id', requireAuth, ctrl.remove);

module.exports = router;
