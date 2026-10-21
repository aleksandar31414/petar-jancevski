const express = require('express');
const ctrl = require('../controllers/comments');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /comments/{id}:
 *   delete:
 *     tags: [Коментари]
 *     summary: Бришење коментар (автор или администратор)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       204: { description: Избришано (заедно со одговорите) }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id', requireAuth, ctrl.remove);

module.exports = router;
