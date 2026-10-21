// Иницијални податоци за страницата /db.
// Датумите се пресметуваат релативно на денешниот ден, за турите секогаш да бидат во иднина/минато.

// Датумите се чуваат како полноќ по UTC (исто како „yyyy-mm-dd“ од формата)
const day = (offset) => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + offset));
};

const locations = [
  { key: 'pelister', name: 'Пелистер', region: 'Пелагониски', elevation: 2601, lat: 41.0006, lon: 21.1914, icon: 'water', description: 'Највисок врв на Баба Планина, со Големото и Малото Езеро.' },
  { key: 'korab', name: 'Кораб', region: 'Полошки', elevation: 2764, lat: 41.7906, lon: 20.5456, icon: 'triangle', description: 'Највисокиот врв во Македонија, на границата со Албанија.' },
  { key: 'titov', name: 'Титов Врв', region: 'Полошки', elevation: 2747, lat: 42.0006, lon: 20.8519, icon: 'snow', description: 'Највисок врв на Шар Планина.' },
  { key: 'solunska', name: 'Солунска Глава', region: 'Вардарски', elevation: 2540, lat: 41.7031, lon: 21.4017, icon: 'tree', description: 'Највисок врв на Јакупица.' },
  { key: 'vodno', name: 'Водно', region: 'Скопски', elevation: 1066, lat: 41.9644, lon: 21.3953, icon: 'brightness-high', description: 'Планина над Скопје со Милениумскиот крст.' },
  { key: 'matka', name: 'Матка', region: 'Скопски', elevation: 560, lat: 41.9506, lon: 21.2994, icon: 'droplet', description: 'Кањон со езеро и пештерата Врело.' },
];

const equipment = [
  { key: 'cevli', name: 'Планинарски чевли', category: 'obuvki' },
  { key: 'vetrovka', name: 'Ветровка', category: 'obleka' },
  { key: 'topol', name: 'Топол слој (флис)', category: 'obleka' },
  { key: 'lamba', name: 'Челна ламба', category: 'bezbednost' },
  { key: 'pomos', name: 'Прва помош', category: 'bezbednost' },
  { key: 'dereza', name: 'Дереза', category: 'bezbednost' },
  { key: 'voda', name: 'Вода 1,5 л', category: 'hrana' },
  { key: 'stapovi', name: 'Стапови', category: 'drugo' },
];

// Лозинките се хешираат при внесување (bcryptjs)
const users = [
  { key: 'marko', name: 'Марко Стојанов', email: 'admin@vrvtura.mk', password: 'Admin1234', role: 'admin', experience: 'iskusen', phone: '070 111 222' },
  { key: 'sasho', name: 'Сашо Трајков', email: 'sasho@vrvtura.mk', password: 'Admin1234', role: 'admin', experience: 'iskusen', phone: '071 333 444' },
  { key: 'ana', name: 'Ана Петрова', email: 'ana@vrvtura.mk', password: 'Korisnik123', role: 'user', experience: 'sreden', phone: '070 123 456', equipment: ['cevli', 'vetrovka', 'voda', 'lamba', 'pomos'] },
  { key: 'ivan', name: 'Иван Костов', email: 'ivan@vrvtura.mk', password: 'Korisnik123', role: 'user', experience: 'iskusen', phone: '071 222 333' },
  { key: 'elena', name: 'Елена Димова', email: 'elena@vrvtura.mk', password: 'Korisnik123', role: 'user', experience: 'pocetnik', phone: '075 444 555' },
];

const tours = [
  { key: 'pelister', title: 'Пелистер – Големо Езеро', location: 'pelister', guide: 'marko', difficulty: 'sredna', date: day(10), meetTime: '07:00', meetPlace: 'Хотел Молика', lengthKm: 12, ascentM: 800, durationH: 6, capacity: 25, price: 600, cover: 'g1', gallery: ['g1', 'g2', 'g5', 'g6'], equipment: ['cevli', 'vetrovka', 'topol', 'voda', 'lamba'], description: 'Класична тура од хотел Молика (1420 м) до Големо Езеро (2218 м), со можност за качување на врвот Пелистер. Патеката е добро обележана, со две паузи покрај изворите.' },
  { key: 'korab', title: 'Кораб – највисок врв', location: 'korab', guide: 'marko', difficulty: 'teshka', date: day(17), meetTime: '06:00', meetPlace: 'Село Стрезимир', lengthKm: 18, ascentM: 1400, durationH: 9, capacity: 3, price: 900, cover: 'g3', gallery: ['g3', 'g4'], equipment: ['cevli', 'vetrovka', 'topol', 'pomos', 'voda', 'stapovi'], description: 'Качување на највисокиот врв во Македонија. Потребна е добра кондиција и искуство.' },
  { key: 'vodno', title: 'Водно – Милениумски крст', location: 'vodno', guide: 'sasho', difficulty: 'lesna', date: day(3), meetTime: '09:00', meetPlace: 'Средно Водно', lengthKm: 8, ascentM: 450, durationH: 3, capacity: 40, price: 0, cover: 'g2', gallery: ['g2', 'g6'], equipment: ['cevli', 'voda'], description: 'Лесна викенд тура над Скопје, идеална за почетници и семејства.' },
  { key: 'titov', title: 'Шара – Титов Врв', location: 'titov', guide: 'sasho', difficulty: 'teshka', date: day(24), meetTime: '06:30', meetPlace: 'Попова Шапка', lengthKm: 16, ascentM: 1100, durationH: 8, capacity: 20, price: 800, cover: 'g4', gallery: ['g4', 'g5'], equipment: ['cevli', 'vetrovka', 'topol', 'dereza', 'lamba'], description: 'Зимска тура до највисокиот врв на Шар Планина. Задолжителни дерези.' },
  { key: 'matka', title: 'Кањон Матка – Пештера Врело', location: 'matka', guide: 'marko', difficulty: 'lesna', date: day(5), meetTime: '10:00', meetPlace: 'Брана Матка', lengthKm: 6, ascentM: 200, durationH: 3, capacity: 30, price: 300, cover: 'g5', gallery: ['g5', 'g1'], equipment: ['cevli', 'voda'], description: 'Пешачење покрај езерото Матка до пештерата Врело, со враќање со брод.' },
  { key: 'solunska', title: 'Јакупица – Солунска Глава', location: 'solunska', guide: 'sasho', difficulty: 'sredna', date: day(31), meetTime: '07:00', meetPlace: 'Село Нежилово', lengthKm: 14, ascentM: 1100, durationH: 7, capacity: 18, price: 700, cover: 'g6', gallery: ['g6', 'g3'], equipment: ['cevli', 'vetrovka', 'voda', 'stapovi'], description: 'Тура низ пасиштата на Јакупица до Солунска Глава.' },
  // Минати тури – за историјата и графиконот
  { key: 'p1', title: 'Водно – летна вечерна тура', location: 'vodno', guide: 'marko', difficulty: 'lesna', date: day(-120), meetTime: '18:00', meetPlace: 'Средно Водно', lengthKm: 7, ascentM: 400, durationH: 3, capacity: 30, price: 0, cover: 'g2', gallery: [], equipment: ['cevli'], description: 'Вечерна тура.' },
  { key: 'p2', title: 'Пелистер – летно искачување', location: 'pelister', guide: 'marko', difficulty: 'sredna', date: day(-85), meetTime: '07:00', meetPlace: 'Хотел Молика', lengthKm: 13, ascentM: 900, durationH: 7, capacity: 25, price: 600, cover: 'g1', gallery: [], equipment: ['cevli', 'voda'], description: 'Летна тура.' },
  { key: 'p3', title: 'Кораб – августовско искачување', location: 'korab', guide: 'sasho', difficulty: 'teshka', date: day(-55), meetTime: '06:00', meetPlace: 'Село Стрезимир', lengthKm: 18, ascentM: 1400, durationH: 9, capacity: 15, price: 900, cover: 'g3', gallery: [], equipment: ['cevli'], description: 'Летна тура до Кораб.' },
  { key: 'p4', title: 'Матка – есенска тура', location: 'matka', guide: 'sasho', difficulty: 'lesna', date: day(-20), meetTime: '10:00', meetPlace: 'Брана Матка', lengthKm: 6, ascentM: 200, durationH: 3, capacity: 30, price: 300, cover: 'g5', gallery: [], equipment: ['cevli'], description: 'Есенска тура.' },
];

const registrations = [
  { user: 'ana', tour: 'pelister', needsTransport: true }, { user: 'ivan', tour: 'pelister' }, { user: 'elena', tour: 'pelister', needsTransport: true },
  { user: 'ivan', tour: 'korab' }, { user: 'elena', tour: 'korab' }, { user: 'sasho', tour: 'korab' }, { user: 'ana', tour: 'korab', status: 'cekanje' },
  { user: 'elena', tour: 'vodno' }, { user: 'ana', tour: 'matka' },
  { user: 'ana', tour: 'p1' }, { user: 'ivan', tour: 'p1' }, { user: 'elena', tour: 'p1' },
  { user: 'ana', tour: 'p2' }, { user: 'ivan', tour: 'p2' },
  { user: 'ivan', tour: 'p3' }, { user: 'ana', tour: 'p3' }, { user: 'sasho', tour: 'p3' },
  { user: 'ana', tour: 'p4' }, { user: 'elena', tour: 'p4' }, { user: 'ivan', tour: 'p4' },
];

const comments = [
  { key: 'c1', user: 'ivan', tour: 'pelister', rating: 5, text: 'Минатата година беше одлична тура, водичот многу внимателен. Земете ветровка – горе дува!' },
  { key: 'c2', user: 'marko', tour: 'pelister', parent: 'c1', text: 'Благодарам Иване! Точно така, на езерото ќе биде околу 2°C.' },
  { key: 'c3', user: 'elena', tour: 'pelister', rating: 4, text: 'Дали има организиран превоз од Скопје?' },
  { key: 'c4', user: 'ana', tour: 'p4', rating: 5, text: 'Прекрасна есенска тура, бродот на враќање беше вистинско доживување.' },
  { key: 'c5', user: 'ivan', tour: 'p3', rating: 4, text: 'Напорно, но погледот од врвот вреди.' },
];

module.exports = { locations, equipment, users, tours, registrations, comments };
