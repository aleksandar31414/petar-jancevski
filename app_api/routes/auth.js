const express = require('express');
const ctrl = require('../controllers/auth');

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Автентикација]
 *     summary: Регистрација на нов корисник
 *     description: Креира корисник со улога „user“, праќа е-пошта за добредојде и враќа JWT токен.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Петар Николов }
 *               email: { type: string, example: petar@example.com }
 *               phone: { type: string, example: 070 555 666 }
 *               experience: { type: string, enum: [pocetnik, sreden, iskusen] }
 *               password: { type: string, example: Lozinka123 }
 *     responses:
 *       201: { description: Корисникот е креиран, content: { application/json: { schema: { $ref: '#/components/schemas/Token' } } } }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       409: { $ref: '#/components/responses/Conflict' }
 */
router.post('/register', ctrl.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Автентикација]
 *     summary: Најава на постоечки корисник
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@vrvtura.mk }
 *               password: { type: string, example: Admin1234 }
 *     responses:
 *       200: { description: Успешна најава, content: { application/json: { schema: { $ref: '#/components/schemas/Token' } } } }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/login', ctrl.login);

module.exports = router;
