const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/tours', require('./tours'));
router.use('/registrations', require('./registrations'));
router.use('/comments', require('./comments'));
router.use('/locations', require('./locations'));
router.use('/equipment', require('./equipment'));
router.use('/users', require('./users'));
router.use('/activities', require('./activities'));
router.use('/', require('./stats'));
router.use('/db', require('./db'));

module.exports = router;
