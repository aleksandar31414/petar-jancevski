require('dotenv').config();
const app = require('./app');
const { connect } = require('./app_api/models/db');

const PORT = process.env.PORT || 3000;

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ВрвТура работи на http://localhost:${PORT}`);
      console.log(`REST API документација: http://localhost:${PORT}/api/docs/`);
    });
  })
  .catch((err) => {
    console.error('Не може да се поврзе со базата:', err.message);
    process.exit(1);
  });
