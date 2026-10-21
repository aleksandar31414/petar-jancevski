const express = require('express');
const ctrl = require('../controllers/locations');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /locations:
 *   get:
 *     tags: [Врвови]
 *     summary: Листа на врвови (со координати за Open-Meteo)
 *     responses:
 *       200: { description: Листа, content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Location' } } } } }
 *   post:
 *     tags: [Врвови]
 *     summary: Додавање врв (администратор)
 *     security: [{ bearerAuth: [] }]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/LocationInput' } } } }
 *     responses:
 *       201: { description: Креиран, content: { application/json: { schema: { $ref: '#/components/schemas/Location' } } } }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409: { $ref: '#/components/responses/Conflict' }
 */
router.get('/', ctrl.list);
router.post('/', requireAdmin, ctrl.create);

/**
 * @openapi
 * /locations/{id}:
 *   parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   get:
 *     tags: [Врвови]
 *     summary: Еден врв
 *     responses:
 *       200: { description: Врв, content: { application/json: { schema: { $ref: '#/components/schemas/Location' } } } }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   put:
 *     tags: [Врвови]
 *     summary: Уредување врв (администратор)
 *     security: [{ bearerAuth: [] }]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/LocationInput' } } } }
 *     responses:
 *       200: { description: Изменет, content: { application/json: { schema: { $ref: '#/components/schemas/Location' } } } }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: [Врвови]
 *     summary: Бришење врв (администратор) – само ако нема тури
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Избришано }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 */
router.get('/:id', ctrl.getOne);
router.put('/:id', requireAdmin, ctrl.update);
router.delete('/:id', requireAdmin, ctrl.remove);

module.exports = router;
