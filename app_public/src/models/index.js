// Класи еквивалентни на документите од MongoDB колекциите (Дел 4).

export class Location {
  constructor(d = {}) {
    this._id = d._id;
    this.name = d.name || '';
    this.region = d.region || '';
    this.elevation = d.elevation ?? 0;
    this.lat = d.lat ?? 0;
    this.lon = d.lon ?? 0;
    this.icon = d.icon || 'triangle';
    this.description = d.description || '';
  }

  get label() {
    return `${this.name} (${this.elevation} м)`;
  }
}

export class Equipment {
  static CATEGORIES = { obuvki: 'Обувки', obleka: 'Облека', bezbednost: 'Безбедност', hrana: 'Храна и вода', drugo: 'Друго' };

  constructor(d = {}) {
    this._id = d._id;
    this.name = d.name || '';
    this.category = d.category || 'drugo';
  }

  get categoryLabel() {
    return Equipment.CATEGORIES[this.category] || this.category;
  }
}

export class User {
  static EXPERIENCE = { pocetnik: 'Почетник', sreden: 'Средно искусен', iskusen: 'Искусен планинар' };

  constructor(d = {}) {
    this._id = d._id;
    this.name = d.name || '';
    this.email = d.email || '';
    this.phone = d.phone || '';
    this.role = d.role || 'user';
    this.experience = d.experience || 'pocetnik';
    this.notifyNewTours = d.notifyNewTours ?? true;
    this.equipmentList = (d.equipmentList || []).map((e) => (typeof e === 'object' ? new Equipment(e) : e));
    this.createdAt = d.createdAt ? new Date(d.createdAt) : null;
    this.stats = d.stats || null;
    this.registrationCount = d.registrationCount ?? 0;
  }

  get isAdmin() {
    return this.role === 'admin';
  }

  get initials() {
    return this.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  }

  get experienceLabel() {
    return User.EXPERIENCE[this.experience] || this.experience;
  }
}

export class Tour {
  constructor(d = {}) {
    this._id = d._id;
    this.title = d.title || '';
    this.location = d.location && typeof d.location === 'object' ? new Location(d.location) : d.location || null;
    this.guide = d.guide && typeof d.guide === 'object' ? new User(d.guide) : d.guide || null;
    this.difficulty = d.difficulty || 'lesna';
    this.date = d.date ? new Date(d.date) : null;
    this.meetTime = d.meetTime || '';
    this.meetPlace = d.meetPlace || '';
    this.lengthKm = d.lengthKm ?? 0;
    this.ascentM = d.ascentM ?? 0;
    this.durationH = d.durationH ?? 0;
    this.capacity = d.capacity ?? 0;
    this.price = d.price ?? 0;
    this.description = d.description || '';
    this.equipment = (d.equipment || []).map((e) => (typeof e === 'object' ? new Equipment(e) : e));
    this.cover = d.cover || 'g1';
    this.gallery = d.gallery || [];
    this.registeredCount = d.registeredCount ?? 0;
    this.waitingCount = d.waitingCount ?? 0;
    this.avgRating = d.avgRating ?? null;
    this.ratingCount = d.ratingCount ?? 0;
    this.updatedAt = d.updatedAt ? new Date(d.updatedAt) : null;
  }

  get freeSpots() {
    return Math.max(0, this.capacity - this.registeredCount);
  }

  get isFull() {
    return this.freeSpots === 0;
  }

  get fillPercent() {
    return this.capacity ? Math.round((this.registeredCount / this.capacity) * 100) : 0;
  }

  get isPast() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.date && this.date < today;
  }

  get icon() {
    return this.location && this.location.icon ? this.location.icon : 'triangle';
  }

  /** Датум во формат yyyy-mm-dd за <input type="date"> */
  get dateInput() {
    if (!this.date) return '';
    const d = this.date;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

export class Registration {
  static STATUS = { potvrdena: 'Потврдена', cekanje: 'Листа на чекање' };

  constructor(d = {}) {
    this._id = d._id;
    this.user = d.user && typeof d.user === 'object' ? new User(d.user) : d.user;
    this.tour = d.tour && typeof d.tour === 'object' ? new Tour(d.tour) : d.tour;
    this.status = d.status || 'potvrdena';
    this.needsTransport = !!d.needsTransport;
    this.createdAt = d.createdAt ? new Date(d.createdAt) : null;
  }

  get statusLabel() {
    return Registration.STATUS[this.status] || this.status;
  }
}

export class Comment {
  constructor(d = {}) {
    this._id = d._id;
    this.user = d.user && typeof d.user === 'object' ? new User(d.user) : new User({ name: 'Избришан корисник' });
    this.tour = d.tour;
    this.parent = d.parent || null;
    this.text = d.text || '';
    this.rating = d.rating ?? null;
    this.createdAt = d.createdAt ? new Date(d.createdAt) : null;
  }
}

export class Activity {
  constructor(d = {}) {
    this._id = d._id;
    this.user = d.user || null;
    this.userName = d.userName || 'Систем';
    this.tour = d.tour || null;
    this.tourTitle = d.tourTitle || '';
    this.action = d.action || 'sistem';
    this.message = d.message || '';
    this.createdAt = d.createdAt ? new Date(d.createdAt) : null;
  }
}
