// Сервис за пристап до сопствениот REST API (Дел 3).
import { getToken } from './auth.service';
import { Tour, Location, Equipment, User, Registration, Comment, Activity } from '../models';

export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors || {};
  }
}

let onUnauthorized = () => {};
/** AuthContext ја регистрира функцијата за одјава кога серверот ќе врати 401. */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function request(method, path, body, { raw = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`/api${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError(0, 'Серверот не е достапен. Проверете ја интернет врската.');
  }
  if (res.status === 401 && token) onUnauthorized();
  if (!res.ok) {
    let data = {};
    try { data = await res.json(); } catch { /* одговорот не е JSON */ }
    throw new ApiError(res.status, data.message || `Грешка (${res.status}).`, data.errors);
  }
  if (raw) return res;
  if (res.status === 204) return null;
  return res.json();
}

const qs = (params = {}) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== false) p.set(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const api = {
  // Автентикација
  login: (data) => request('POST', '/auth/login', data),
  register: (data) => request('POST', '/auth/register', data),

  // Тури
  async getTours(params) {
    const d = await request('GET', `/tours${qs(params)}`);
    return { ...d, items: d.items.map((t) => new Tour(t)) };
  },
  getTour: async (id) => new Tour(await request('GET', `/tours/${id}`)),
  createTour: async (data) => new Tour(await request('POST', '/tours', data)),
  updateTour: async (id, data) => new Tour(await request('PUT', `/tours/${id}`, data)),
  deleteTour: (id, data) => request('DELETE', `/tours/${id}`, data),
  getTourHistory: async (id) => (await request('GET', `/tours/${id}/history`)).map((a) => new Activity(a)),

  // Пријави
  registerForTour: async (tourId, data) => new Registration(await request('POST', `/tours/${tourId}/registrations`, data)),
  getTourRegistrations: async (tourId) => (await request('GET', `/tours/${tourId}/registrations`)).map((r) => new Registration(r)),
  getMyRegistrations: async () => (await request('GET', '/registrations/me')).map((r) => new Registration(r)),
  cancelRegistration: (id) => request('DELETE', `/registrations/${id}`),

  // Коментари
  getComments: async (tourId) => (await request('GET', `/tours/${tourId}/comments`)).map((c) => new Comment(c)),
  addComment: async (tourId, data) => new Comment(await request('POST', `/tours/${tourId}/comments`, data)),
  deleteComment: (id) => request('DELETE', `/comments/${id}`),

  // Врвови и опрема
  getLocations: async () => (await request('GET', '/locations')).map((l) => new Location(l)),
  getEquipment: async () => (await request('GET', '/equipment')).map((e) => new Equipment(e)),

  // Корисници
  getMe: async () => new User(await request('GET', '/users/me')),
  updateMe: (data) => request('PUT', '/users/me', data),
  saveMyEquipment: async (ids) => (await request('PUT', '/users/me/equipment', { equipment: ids })).map((e) => new Equipment(e)),
  getGuides: async () => (await request('GET', '/users/guides')).map((u) => new User(u)),
  getUsers: async () => (await request('GET', '/users')).map((u) => new User(u)),
  updateUser: async (id, data) => new User(await request('PUT', `/users/${id}`, data)),
  deleteUser: (id) => request('DELETE', `/users/${id}`),

  // Активности, статистика, извештаи
  getMyActivities: async () => (await request('GET', '/activities/me')).map((a) => new Activity(a)),
  getActivities: async (limit = 30) => (await request('GET', `/activities?limit=${limit}`)).map((a) => new Activity(a)),
  getStats: () => request('GET', '/stats'),
  getAdminStats: () => request('GET', '/stats/admin'),
  async downloadReport() {
    const res = await request('GET', '/reports/tours.pdf', undefined, { raw: true });
    return res.blob();
  },

  // База (/db)
  dbDeleteAll: () => request('DELETE', '/db'),
  dbSeed: () => request('POST', '/db/seed'),
};
