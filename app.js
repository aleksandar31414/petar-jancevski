const fs = require('fs');
const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');

// Моделите мора да се регистрираат пред контролерите да ги побараат
require('./app_api/models/db');

const swaggerSpec = require('./app_api/config/swagger');
const apiRouter = require('./app_api/routes');
const { errorHandler } = require('./app_api/utils/errors');

const app = express();

app.use(express.json({ limit: '1mb' }));

// ---------- REST API (Дел 3) ----------
app.get('/api/swagger.json', (req, res) => res.json(swaggerSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'ВрвТура REST API' }));
app.use('/api', apiRouter);
app.use('/api', (req, res) => res.status(404).json({ message: 'Непостоечка API рута.' }));

// ---------- Статични маски од Дел 1 ----------
const mockupsDir = path.join(__dirname, 'del1-maski');
app.use('/del1', express.static(mockupsDir));

// ---------- Клиентска апликација ----------
// Дел 2: root (/) ги служи статичните маски.
// Дел 4: root (/) ја служи изградената React SPA (app_public/dist).
const spaDir = path.join(__dirname, 'app_public', 'dist');
const spaBuilt = fs.existsSync(path.join(spaDir, 'index.html'));

if (process.env.SERVE_MOCKUPS === 'true' || !spaBuilt) {
  if (!spaBuilt) console.warn('React апликацијата не е изградена – на / се служат маските од Дел 1.');
  app.use('/', express.static(mockupsDir));
} else {
  app.use(express.static(spaDir));
  // Сите останати патеки (на пр. /db, /ture/123) ги обработува React Router
  app.get('*', (req, res) => res.sendFile(path.join(spaDir, 'index.html')));
}

app.use(errorHandler);

module.exports = app;
