// Редовни изрази и затворени сетови на вредности.
// Истите правила се користат во app_public/src/utils/validators.js (ниво на клиент).

module.exports = {
  NAME_RE: /^[\p{L}][\p{L}' .-]{1,49}$/u,
  EMAIL_RE: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  PHONE_RE: /^(\+389|0)\s?\d{2}\s?\d{3}\s?\d{3,4}$/,
  PASSWORD_RE: /^(?=.*\p{L})(?=.*\d).{8,64}$/u,
  TIME_RE: /^([01]\d|2[0-3]):[0-5]\d$/,
  TITLE_RE: /^[\p{L}\p{N}][\p{L}\p{N} .,'"()\-–!?:]{4,79}$/u,
  DATE_RE: /^\d{4}-\d{2}-\d{2}$/,
  OBJECT_ID_RE: /^[a-f\d]{24}$/i,

  DIFFICULTIES: ['lesna', 'sredna', 'teshka'],
  EXPERIENCE: ['pocetnik', 'sreden', 'iskusen'],
  ROLES: ['user', 'admin'],
  REGIONS: ['Скопски', 'Пелагониски', 'Полошки', 'Југозападен', 'Вардарски', 'Источен', 'Југоисточен', 'Североисточен'],
  COVERS: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'],
  ICONS: ['triangle', 'water', 'tree', 'snow', 'droplet', 'brightness-high', 'sun'],
  EQUIP_CATEGORIES: ['obuvki', 'obleka', 'bezbednost', 'hrana', 'drugo'],
  REG_STATUS: ['potvrdena', 'cekanje'],
  DELETE_REASONS: {
    vreme: 'Лоши временски услови',
    ucesnici: 'Недоволен број учесници',
    drugo: 'Друга причина',
  },
};
