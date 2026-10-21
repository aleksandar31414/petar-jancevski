const express = require('express');
const ctrl = require('../controllers/db');

const router = express.Router();

/**
 * @openapi
 * /db:
 *   delete:
 *     tags: [База]
 *     summary: Бришење на сите податоци од базата (за тестирање)
 *     responses:
 *       200: { description: Број на избришани документи по колекција }
 */
router.delete('/', ctrl.deleteAll);

/**
 * @openapi
 * /db/seed:
 *   post:
 *     tags: [База]
 *     summary: Враќање на почетна состојба – внесување иницијални податоци
 *     description: "Ја празни базата и внесува врвови, опрема, корисници (admin@vrvtura.mk / Admin1234, ana@vrvtura.mk / Korisnik123), тури, пријави, коментари и активности."
 *     responses:
 *       201: { description: Број на внесени документи по колекција }
 */
router.post('/seed', ctrl.seedAll);

module.exports = router;
