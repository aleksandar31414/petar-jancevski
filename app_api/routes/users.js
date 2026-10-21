const express = require('express');
const ctrl = require('../controllers/users');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Корисници]
 *     summary: Профил на најавениот корисник (со статистика)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Профил, content: { application/json: { schema: { $ref: '#/components/schemas/User' } } } }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *   put:
 *     tags: [Корисници]
 *     summary: Измена на сопствениот профил (ограничени полиња)
 *     description: Корисникот може да ги менува само name, phone, experience, notifyNewTours и password. Улогата не смее да се менува.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               experience: { type: string, enum: [pocetnik, sreden, iskusen] }
 *               notifyNewTours: { type: boolean }
 *               password: { type: string }
 *     responses:
 *       200: { description: Изменет профил и нов токен }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/me', requireAuth, ctrl.me);
router.put('/me', requireAuth, ctrl.updateMe);

/**
 * @openapi
 * /users/me/equipment:
 *   put:
 *     tags: [Корисници]
 *     summary: Зачувување на личната листа за опрема по редослед (drag & drop)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { type: object, properties: { equipment: { type: array, items: { type: string } } } } } }
 *     responses:
 *       200: { description: Нова листа, content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Equipment' } } } } }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.put('/me/equipment', requireAuth, ctrl.updateMyEquipment);

/**
 * @openapi
 * /users/guides:
 *   get:
 *     tags: [Корисници]
 *     summary: Листа на водичи (администратори)
 *     responses:
 *       200: { description: Листа }
 */
router.get('/guides', ctrl.guides);

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Корисници]
 *     summary: Сите корисници (администратор)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Листа, content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/User' } } } } }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/', requireAdmin, ctrl.list);

/**
 * @openapi
 * /users/{id}:
 *   parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   put:
 *     tags: [Корисници]
 *     summary: Измена на корисник, вклучително улога (администратор)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { type: object, properties: { role: { type: string, enum: [user, admin] }, name: { type: string } } } } }
 *     responses:
 *       200: { description: Изменет, content: { application/json: { schema: { $ref: '#/components/schemas/User' } } } }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: [Корисници]
 *     summary: Бришење корисник со неговите пријави и коментари (администратор)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Избришано }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 */
router.put('/:id', requireAdmin, ctrl.update);
router.delete('/:id', requireAdmin, ctrl.remove);

module.exports = router;
