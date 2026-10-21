const express = require('express');
const tours = require('../controllers/tours');
const registrations = require('../controllers/registrations');
const comments = require('../controllers/comments');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /tours:
 *   get:
 *     tags: [Тури]
 *     summary: Листа и пребарување на тури
 *     parameters:
 *       - { in: query, name: q, schema: { type: string }, description: Клучен збор (назив, опис или врв) }
 *       - { in: query, name: difficulty, schema: { type: string, example: 'lesna,sredna' }, description: Една или повеќе тежини одделени со запирка }
 *       - { in: query, name: region, schema: { type: string, example: Пелагониски } }
 *       - { in: query, name: from, schema: { type: string, format: date } }
 *       - { in: query, name: to, schema: { type: string, format: date } }
 *       - { in: query, name: maxLength, schema: { type: number } }
 *       - { in: query, name: available, schema: { type: boolean }, description: Само тури со слободни места }
 *       - { in: query, name: period, schema: { type: string, enum: [upcoming, past, all], default: upcoming } }
 *       - { in: query, name: sort, schema: { type: string, enum: [date, difficulty, free], default: date } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 9 } }
 *     responses:
 *       200: { description: Страница со тури, content: { application/json: { schema: { $ref: '#/components/schemas/TourPage' } } } }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *   post:
 *     tags: [Тури]
 *     summary: Додавање тура (администратор)
 *     security: [{ bearerAuth: [] }]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/TourInput' } } } }
 *     responses:
 *       201: { description: Турата е креирана, content: { application/json: { schema: { $ref: '#/components/schemas/Tour' } } } }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/', tours.list);
router.post('/', requireAdmin, tours.create);

/**
 * @openapi
 * /tours/{id}:
 *   parameters:
 *     - { in: path, name: id, required: true, schema: { type: string } }
 *   get:
 *     tags: [Тури]
 *     summary: Детали за тура
 *     responses:
 *       200: { description: Турата, content: { application/json: { schema: { $ref: '#/components/schemas/Tour' } } } }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   put:
 *     tags: [Тури]
 *     summary: Уредување тура (администратор)
 *     description: Се праќаат само полињата што се менуваат. Промените се запишуваат во историјата.
 *     security: [{ bearerAuth: [] }]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/TourInput' } } } }
 *     responses:
 *       200: { description: Изменета тура, content: { application/json: { schema: { $ref: '#/components/schemas/Tour' } } } }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: [Тури]
 *     summary: Бришење тура (администратор)
 *     description: Ги брише и зависните пријави и коментари, и ги известува пријавените по е-пошта.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string, enum: [vreme, ucesnici, drugo] }
 *               message: { type: string, example: Турата се откажува поради невреме. }
 *     responses:
 *       204: { description: Избришано }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', tours.getOne);
router.put('/:id', requireAdmin, tours.update);
router.delete('/:id', requireAdmin, tours.remove);

/**
 * @openapi
 * /tours/{id}/history:
 *   get:
 *     tags: [Тури]
 *     summary: Историја на измени и активности за тура (администратор)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Листа, content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Activity' } } } } }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get('/:id/history', requireAdmin, tours.history);

/**
 * @openapi
 * /tours/{tourId}/registrations:
 *   parameters:
 *     - { in: path, name: tourId, required: true, schema: { type: string } }
 *   get:
 *     tags: [Пријави]
 *     summary: Пријавени учесници на тура (администратор)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Листа, content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Registration' } } } } }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *   post:
 *     tags: [Пријави]
 *     summary: Пријава на најавениот корисник на тура
 *     description: Ако турата е полна, корисникот оди на листа на чекање. Се праќа е-пошта за потврда.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content: { application/json: { schema: { type: object, properties: { needsTransport: { type: boolean } } } } }
 *     responses:
 *       201: { description: Пријавено, content: { application/json: { schema: { $ref: '#/components/schemas/Registration' } } } }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 */
router.get('/:tourId/registrations', requireAdmin, registrations.listForTour);
router.post('/:tourId/registrations', requireAuth, registrations.create);

/**
 * @openapi
 * /tours/{tourId}/comments:
 *   parameters:
 *     - { in: path, name: tourId, required: true, schema: { type: string } }
 *   get:
 *     tags: [Коментари]
 *     summary: Коментари и оцени за тура
 *     responses:
 *       200: { description: Листа, content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Comment' } } } } }
 *   post:
 *     tags: [Коментари]
 *     summary: Нов коментар или одговор (најавен корисник)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text: { type: string, example: Се радувам на турата! }
 *               rating: { type: integer, minimum: 1, maximum: 5, example: 5 }
 *               parent: { type: string, description: ID на коментарот на кој се одговара }
 *     responses:
 *       201: { description: Креиран, content: { application/json: { schema: { $ref: '#/components/schemas/Comment' } } } }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:tourId/comments', comments.listForTour);
router.post('/:tourId/comments', requireAuth, comments.create);

module.exports = router;
