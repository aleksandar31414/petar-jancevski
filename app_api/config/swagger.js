const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

// JSDoc → swagger-jsdoc → OpenAPI спецификација (/api/swagger.json) → Swagger UI (/api/docs/)
const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ВрвТура REST API',
      version: '1.0.0',
      description: 'REST API за организатор на планинарски тури. За заштитените методи најпрво повикајте POST /auth/login и внесете го токенот преку копчето „Authorize“.',
    },
    servers: [{ url: '/api', description: 'Тековен сервер' }],
    tags: [
      { name: 'Автентикација' }, { name: 'Тури' }, { name: 'Пријави' }, { name: 'Коментари' },
      { name: 'Врвови' }, { name: 'Опрема' }, { name: 'Корисници' }, { name: 'Активности' },
      { name: 'Статистика и извештаи' }, { name: 'База' },
    ],
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      responses: {
        BadRequest: { description: 'Невалидни податоци', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Unauthorized: { description: 'Потребна е најава', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Forbidden: { description: 'Немате дозвола', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        NotFound: { description: 'Не е пронајдено', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Conflict: { description: 'Конфликт (записот веќе постои или е поврзан)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Невалидни податоци.' },
            errors: { type: 'object', additionalProperties: { type: 'string' }, example: { title: 'Полето е задолжително.' } },
          },
        },
        Token: { type: 'object', properties: { token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' } } },
        Location: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6716a1f0c2b1a2f3d4e5f601' },
            name: { type: 'string', example: 'Пелистер' },
            region: { type: 'string', enum: ['Скопски', 'Пелагониски', 'Полошки', 'Југозападен', 'Вардарски', 'Источен', 'Југоисточен', 'Североисточен'] },
            elevation: { type: 'number', example: 2601 },
            lat: { type: 'number', example: 41.0006 },
            lon: { type: 'number', example: 21.1914 },
            icon: { type: 'string', example: 'water' },
            description: { type: 'string' },
          },
        },
        LocationInput: {
          type: 'object',
          required: ['name', 'region', 'elevation', 'lat', 'lon'],
          properties: {
            name: { type: 'string', example: 'Ниџе – Кајмакчалан' },
            region: { type: 'string', example: 'Пелагониски' },
            elevation: { type: 'number', example: 2521 },
            lat: { type: 'number', example: 41.0094 },
            lon: { type: 'number', example: 21.8011 },
            icon: { type: 'string', example: 'triangle' },
            description: { type: 'string', example: 'Највисок врв на Ниџе.' },
          },
        },
        Equipment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Челна ламба' },
            category: { type: 'string', enum: ['obuvki', 'obleka', 'bezbednost', 'hrana', 'drugo'] },
          },
        },
        Tour: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string', example: 'Пелистер – Големо Езеро' },
            location: { oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/Location' }] },
            guide: { type: 'string' },
            difficulty: { type: 'string', enum: ['lesna', 'sredna', 'teshka'] },
            date: { type: 'string', format: 'date-time' },
            meetTime: { type: 'string', example: '07:00' },
            meetPlace: { type: 'string', example: 'Хотел Молика' },
            lengthKm: { type: 'number', example: 12 },
            ascentM: { type: 'number', example: 800 },
            durationH: { type: 'number', example: 6 },
            capacity: { type: 'integer', example: 25 },
            price: { type: 'integer', example: 600 },
            description: { type: 'string' },
            equipment: { type: 'array', items: { type: 'string' } },
            cover: { type: 'string', example: 'g1' },
            gallery: { type: 'array', items: { type: 'string' } },
            registeredCount: { type: 'integer', example: 18 },
            waitingCount: { type: 'integer', example: 0 },
            avgRating: { type: 'number', nullable: true, example: 4.5 },
          },
        },
        TourInput: {
          type: 'object',
          required: ['title', 'location', 'difficulty', 'date', 'meetTime', 'lengthKm', 'ascentM', 'durationH', 'capacity', 'price'],
          properties: {
            title: { type: 'string', example: 'Ниџе – Кајмакчалан' },
            location: { type: 'string', description: 'ID на врв', example: '6716a1f0c2b1a2f3d4e5f601' },
            guide: { type: 'string', description: 'ID на администратор (стандардно – најавениот)' },
            difficulty: { type: 'string', enum: ['lesna', 'sredna', 'teshka'] },
            date: { type: 'string', format: 'date', example: '2026-12-12' },
            meetTime: { type: 'string', example: '07:30' },
            meetPlace: { type: 'string', example: 'Војник' },
            lengthKm: { type: 'number', example: 15 },
            ascentM: { type: 'integer', example: 1000 },
            durationH: { type: 'number', example: 7 },
            capacity: { type: 'integer', example: 20 },
            price: { type: 'integer', example: 700 },
            description: { type: 'string' },
            equipment: { type: 'array', items: { type: 'string' } },
            cover: { type: 'string', enum: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'] },
            gallery: { type: 'array', items: { type: 'string' } },
            notify: { type: 'boolean', description: 'Испрати е-пошта (нова тура → претплатени; измена → пријавени)' },
          },
        },
        TourPage: {
          type: 'object',
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/Tour' } },
            total: { type: 'integer' }, page: { type: 'integer' }, pages: { type: 'integer' },
          },
        },
        Registration: {
          type: 'object',
          properties: {
            _id: { type: 'string' }, user: { type: 'string' }, tour: { type: 'string' },
            status: { type: 'string', enum: ['potvrdena', 'cekanje'] },
            needsTransport: { type: 'boolean' }, createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'object', properties: { _id: { type: 'string' }, name: { type: 'string' }, role: { type: 'string' } } },
            tour: { type: 'string' }, parent: { type: 'string', nullable: true },
            text: { type: 'string' }, rating: { type: 'integer', nullable: true }, createdAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' }, name: { type: 'string', example: 'Ана Петрова' }, email: { type: 'string', example: 'ana@vrvtura.mk' },
            phone: { type: 'string', example: '070 123 456' }, role: { type: 'string', enum: ['user', 'admin'] },
            experience: { type: 'string', enum: ['pocetnik', 'sreden', 'iskusen'] }, notifyNewTours: { type: 'boolean' },
            equipmentList: { type: 'array', items: { type: 'string' } }, createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Activity: {
          type: 'object',
          properties: {
            _id: { type: 'string' }, userName: { type: 'string' }, tourTitle: { type: 'string' },
            action: { type: 'string' }, message: { type: 'string' }, createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '..', 'routes', '*.js')],
};

module.exports = swaggerJsdoc(options);
