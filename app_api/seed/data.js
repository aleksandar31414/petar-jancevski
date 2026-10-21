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
  { key: 'kajmakcalan', name: 'Кајмакчалан', region: 'Пелагониски', elevation: 2521, lat: 40.9306, lon: 21.8036, icon: 'snow', description: 'Највисок врв на Ниџе, со капелата Св. Илија на самиот врв.' },
  { key: 'ljuboten', name: 'Љуботен', region: 'Полошки', elevation: 2498, lat: 42.1953, lon: 21.1167, icon: 'triangle', description: 'Препознатлива пирамида на Шар Планина, над Тетовско.' },
  { key: 'magaro', name: 'Магаро', region: 'Југозападен', elevation: 2254, lat: 40.9567, lon: 20.8211, icon: 'water', description: 'Врв на Галичица со поглед на Охридското и Преспанското Езеро.' },
  { key: 'ruen', name: 'Руен', region: 'Источен', elevation: 2252, lat: 42.1597, lon: 22.5156, icon: 'brightness-high', description: 'Највисок врв на Осогово, на границата со Бугарија.' },
  { key: 'radomir', name: 'Радомир', region: 'Југоисточен', elevation: 2029, lat: 41.3711, lon: 22.9761, icon: 'tree', description: 'Највисок врв на Беласица, познат по буковите шуми и водопадите.' },
  { key: 'medenica', name: 'Меденица', region: 'Југозападен', elevation: 2163, lat: 41.6464, lon: 20.7231, icon: 'tree', description: 'Највисок врв на Бистра, над Маврово.' },
  { key: 'lisec', name: 'Лисец', region: 'Источен', elevation: 1754, lat: 41.7714, lon: 22.5753, icon: 'sun', description: 'Највисок врв на Плачковица, со убав поглед кон Штип.' },
  { key: 'crnkamen', name: 'Црн Камен', region: 'Југозападен', elevation: 2257, lat: 41.2475, lon: 20.5525, icon: 'triangle', description: 'Највисок врв на Јабланица, над Струшко.' },
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
  { key: 'biljana', name: 'Билјана Ангелова', email: 'biljana@vrvtura.mk', password: 'Admin1234', role: 'admin', experience: 'iskusen', phone: '072 555 666' },
  { key: 'bojan', name: 'Бојан Николовски', email: 'bojan@vrvtura.mk', password: 'Korisnik123', role: 'user', experience: 'iskusen', phone: '070 234 567', equipment: ['cevli', 'stapovi', 'lamba', 'dereza'] },
  { key: 'marija', name: 'Марија Јованова', email: 'marija@vrvtura.mk', password: 'Korisnik123', role: 'user', experience: 'sreden', phone: '071 345 678', equipment: ['cevli', 'vetrovka', 'voda'] },
  { key: 'stefan', name: 'Стефан Илиевски', email: 'stefan@vrvtura.mk', password: 'Korisnik123', role: 'user', experience: 'pocetnik', phone: '075 456 789' },
  { key: 'teodora', name: 'Теодора Стојковска', email: 'teodora@vrvtura.mk', password: 'Korisnik123', role: 'user', experience: 'sreden', phone: '076 567 890' },
  { key: 'nikola', name: 'Никола Ристов', email: 'nikola@vrvtura.mk', password: 'Korisnik123', role: 'user', experience: 'iskusen', phone: '077 678 901', equipment: ['cevli', 'vetrovka', 'topol', 'pomos', 'stapovi'] },
  { key: 'kristina', name: 'Кристина Велковска', email: 'kristina@vrvtura.mk', password: 'Korisnik123', role: 'user', experience: 'pocetnik', phone: '078 789 012' },
  { key: 'dimitar', name: 'Димитар Андоновски', email: 'dimitar@vrvtura.mk', password: 'Korisnik123', role: 'user', experience: 'sreden', phone: '070 890 123' },
];

const tours = [
  { key: 'pelister', title: 'Пелистер – Големо Езеро', location: 'pelister', guide: 'marko', difficulty: 'sredna', date: day(10), meetTime: '07:00', meetPlace: 'Хотел Молика', lengthKm: 12, ascentM: 800, durationH: 6, capacity: 25, price: 600, cover: 'g1', gallery: ['g1', 'g2', 'g5', 'g6'], equipment: ['cevli', 'vetrovka', 'topol', 'voda', 'lamba'], description: 'Класична тура од хотел Молика (1420 м) до Големо Езеро (2218 м), со можност за качување на врвот Пелистер. Патеката е добро обележана, со две паузи покрај изворите.' },
  { key: 'korab', title: 'Кораб – највисок врв', location: 'korab', guide: 'marko', difficulty: 'teshka', date: day(17), meetTime: '06:00', meetPlace: 'Село Стрезимир', lengthKm: 18, ascentM: 1400, durationH: 9, capacity: 3, price: 900, cover: 'g3', gallery: ['g3', 'g4'], equipment: ['cevli', 'vetrovka', 'topol', 'pomos', 'voda', 'stapovi'], description: 'Качување на највисокиот врв во Македонија. Потребна е добра кондиција и искуство.' },
  { key: 'vodno', title: 'Водно – Милениумски крст', location: 'vodno', guide: 'sasho', difficulty: 'lesna', date: day(3), meetTime: '09:00', meetPlace: 'Средно Водно', lengthKm: 8, ascentM: 450, durationH: 3, capacity: 40, price: 0, cover: 'g2', gallery: ['g2', 'g6'], equipment: ['cevli', 'voda'], description: 'Лесна викенд тура над Скопје, идеална за почетници и семејства.' },
  { key: 'titov', title: 'Шара – Титов Врв', location: 'titov', guide: 'sasho', difficulty: 'teshka', date: day(24), meetTime: '06:30', meetPlace: 'Попова Шапка', lengthKm: 16, ascentM: 1100, durationH: 8, capacity: 20, price: 800, cover: 'g4', gallery: ['g4', 'g5'], equipment: ['cevli', 'vetrovka', 'topol', 'dereza', 'lamba'], description: 'Зимска тура до највисокиот врв на Шар Планина. Задолжителни дерези.' },
  { key: 'matka', title: 'Кањон Матка – Пештера Врело', location: 'matka', guide: 'marko', difficulty: 'lesna', date: day(5), meetTime: '10:00', meetPlace: 'Брана Матка', lengthKm: 6, ascentM: 200, durationH: 3, capacity: 30, price: 300, cover: 'g5', gallery: ['g5', 'g1'], equipment: ['cevli', 'voda'], description: 'Пешачење покрај езерото Матка до пештерата Врело, со враќање со брод.' },
  { key: 'solunska', title: 'Јакупица – Солунска Глава', location: 'solunska', guide: 'sasho', difficulty: 'sredna', date: day(31), meetTime: '07:00', meetPlace: 'Село Нежилово', lengthKm: 14, ascentM: 1100, durationH: 7, capacity: 18, price: 700, cover: 'g6', gallery: ['g6', 'g3'], equipment: ['cevli', 'vetrovka', 'voda', 'stapovi'], description: 'Тура низ пасиштата на Јакупица до Солунска Глава.' },
  { key: 'galicica', title: 'Галичица – Магаро над две езера', location: 'magaro', guide: 'biljana', difficulty: 'sredna', date: day(7), meetTime: '07:30', meetPlace: 'Превој Предел', lengthKm: 11, ascentM: 700, durationH: 6, capacity: 25, price: 500, cover: 'g1', gallery: ['g1', 'g6', 'g2'], equipment: ['cevli', 'vetrovka', 'voda'], description: 'Тура по гребенот на Галичица до врвот Магаро, со поглед истовремено на Охридското и Преспанското Езеро.' },
  { key: 'plackovica', title: 'Плачковица – Лисец', location: 'lisec', guide: 'sasho', difficulty: 'lesna', date: day(9), meetTime: '08:30', meetPlace: 'Планинарски дом Лисец', lengthKm: 7, ascentM: 350, durationH: 3, capacity: 35, price: 300, cover: 'g6', gallery: ['g6', 'g2'], equipment: ['cevli', 'voda'], description: 'Кратка и лесна тура погодна за почетници, со пикник на врвот.' },
  { key: 'kajmakcalan', title: 'Кајмакчалан – Ниџе', location: 'kajmakcalan', guide: 'marko', difficulty: 'sredna', date: day(13), meetTime: '06:30', meetPlace: 'Село Сканчево', lengthKm: 15, ascentM: 1000, durationH: 7, capacity: 20, price: 700, cover: 'g4', gallery: ['g4', 'g3', 'g6'], equipment: ['cevli', 'vetrovka', 'topol', 'voda', 'stapovi'], description: 'Искачување на највисокиот врв на Ниџе, до капелата Св. Илија. Пејзажи со алпски пасишта.' },
  { key: 'matka2', title: 'Матка – кајак и пешачење', location: 'matka', guide: 'biljana', difficulty: 'lesna', date: day(14), meetTime: '09:30', meetPlace: 'Брана Матка', lengthKm: 5, ascentM: 150, durationH: 4, capacity: 20, price: 900, cover: 'g5', gallery: ['g5', 'g1'], equipment: ['cevli', 'voda'], description: 'Комбинирана тура: пешачење по патеката низ кањонот и возење кајак до пештерата Врело.' },
  { key: 'ljuboten', title: 'Шара – Љуботен', location: 'ljuboten', guide: 'marko', difficulty: 'teshka', date: day(20), meetTime: '06:00', meetPlace: 'Село Јажинце', lengthKm: 17, ascentM: 1500, durationH: 9, capacity: 15, price: 800, cover: 'g3', gallery: ['g3', 'g4'], equipment: ['cevli', 'vetrovka', 'topol', 'pomos', 'lamba', 'stapovi'], description: 'Стрмо и долго искачување на пирамидата Љуботен. Само за искусни планинари со добра кондиција.' },
  { key: 'osogovo', title: 'Осогово – Руен', location: 'ruen', guide: 'sasho', difficulty: 'sredna', date: day(27), meetTime: '07:00', meetPlace: 'Планинарски дом Пониква', lengthKm: 13, ascentM: 750, durationH: 6, capacity: 30, price: 600, cover: 'g6', gallery: ['g6', 'g2', 'g4'], equipment: ['cevli', 'vetrovka', 'voda'], description: 'Тура низ широките пасишта на Осогово до највисокиот врв Руен.' },
  { key: 'belasica', title: 'Беласица – Радомир и водопади', location: 'radomir', guide: 'biljana', difficulty: 'sredna', date: day(34), meetTime: '07:00', meetPlace: 'Смоларски Водопад', lengthKm: 14, ascentM: 1300, durationH: 8, capacity: 20, price: 700, cover: 'g5', gallery: ['g5', 'g2', 'g1'], equipment: ['cevli', 'vetrovka', 'voda', 'stapovi'], description: 'Од Смоларскиот Водопад низ букови шуми до врвот Радомир на Беласица.' },
  { key: 'bistra', title: 'Бистра – Меденица', location: 'medenica', guide: 'marko', difficulty: 'sredna', date: day(38), meetTime: '07:30', meetPlace: 'Маврово', lengthKm: 12, ascentM: 900, durationH: 6, capacity: 20, price: 600, cover: 'g2', gallery: ['g2', 'g4'], equipment: ['cevli', 'vetrovka', 'topol', 'voda'], description: 'Тура над Мавровското Езеро до врвот Меденица на Бистра.' },
  { key: 'jablanica', title: 'Јабланица – Црн Камен', location: 'crnkamen', guide: 'sasho', difficulty: 'teshka', date: day(45), meetTime: '06:00', meetPlace: 'Село Вевчани', lengthKm: 19, ascentM: 1600, durationH: 10, capacity: 12, price: 900, cover: 'g3', gallery: ['g3', 'g1', 'g4'], equipment: ['cevli', 'vetrovka', 'topol', 'pomos', 'lamba', 'stapovi'], description: 'Долга тура од Вевчани до Црн Камен, покрај глацијалните езера на Јабланица.' },
  { key: 'vodno2', title: 'Водно – зајдисонце од крстот', location: 'vodno', guide: 'biljana', difficulty: 'lesna', date: day(1), meetTime: '16:00', meetPlace: 'Средно Водно', lengthKm: 6, ascentM: 400, durationH: 3, capacity: 50, price: 0, cover: 'g6', gallery: ['g6'], equipment: ['cevli', 'voda', 'lamba'], description: 'Попладневна тура до Милениумскиот крст и враќање со челни ламби по зајдисонце.' },
  // Минати тури – за историјата и графиконот
  { key: 'p1', title: 'Водно – летна вечерна тура', location: 'vodno', guide: 'marko', difficulty: 'lesna', date: day(-120), meetTime: '18:00', meetPlace: 'Средно Водно', lengthKm: 7, ascentM: 400, durationH: 3, capacity: 30, price: 0, cover: 'g2', gallery: [], equipment: ['cevli'], description: 'Вечерна тура.' },
  { key: 'p2', title: 'Пелистер – летно искачување', location: 'pelister', guide: 'marko', difficulty: 'sredna', date: day(-85), meetTime: '07:00', meetPlace: 'Хотел Молика', lengthKm: 13, ascentM: 900, durationH: 7, capacity: 25, price: 600, cover: 'g1', gallery: [], equipment: ['cevli', 'voda'], description: 'Летна тура.' },
  { key: 'p3', title: 'Кораб – августовско искачување', location: 'korab', guide: 'sasho', difficulty: 'teshka', date: day(-55), meetTime: '06:00', meetPlace: 'Село Стрезимир', lengthKm: 18, ascentM: 1400, durationH: 9, capacity: 15, price: 900, cover: 'g3', gallery: [], equipment: ['cevli'], description: 'Летна тура до Кораб.' },
  { key: 'p5', title: 'Галичица – пролетна тура', location: 'magaro', guide: 'biljana', difficulty: 'sredna', date: day(-150), meetTime: '07:30', meetPlace: 'Превој Предел', lengthKm: 11, ascentM: 700, durationH: 6, capacity: 25, price: 500, cover: 'g1', gallery: ['g1'], equipment: ['cevli'], description: 'Пролетна тура со цветни ливади.' },
  { key: 'p6', title: 'Кајмакчалан – јулско искачување', location: 'kajmakcalan', guide: 'marko', difficulty: 'sredna', date: day(-100), meetTime: '06:30', meetPlace: 'Село Сканчево', lengthKm: 15, ascentM: 1000, durationH: 7, capacity: 20, price: 700, cover: 'g4', gallery: ['g4'], equipment: ['cevli'], description: 'Летна тура до Кајмакчалан.' },
  { key: 'p7', title: 'Љуботен – септемвриско искачување', location: 'ljuboten', guide: 'marko', difficulty: 'teshka', date: day(-40), meetTime: '06:00', meetPlace: 'Село Јажинце', lengthKm: 17, ascentM: 1500, durationH: 9, capacity: 15, price: 800, cover: 'g3', gallery: ['g3'], equipment: ['cevli'], description: 'Есенско искачување на Љуботен.' },
  { key: 'p8', title: 'Осогово – есенски бои', location: 'ruen', guide: 'sasho', difficulty: 'sredna', date: day(-12), meetTime: '07:00', meetPlace: 'Планинарски дом Пониква', lengthKm: 13, ascentM: 750, durationH: 6, capacity: 30, price: 600, cover: 'g6', gallery: ['g6'], equipment: ['cevli'], description: 'Тура низ есенските бои на Осогово.' },
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
  // нови пријави
  { user: 'bojan', tour: 'pelister' }, { user: 'marija', tour: 'pelister', needsTransport: true }, { user: 'teodora', tour: 'pelister' },
  { user: 'bojan', tour: 'titov' }, { user: 'nikola', tour: 'titov' }, { user: 'ivan', tour: 'titov' },
  { user: 'stefan', tour: 'vodno' }, { user: 'kristina', tour: 'vodno' }, { user: 'dimitar', tour: 'vodno' }, { user: 'marija', tour: 'vodno' },
  { user: 'teodora', tour: 'matka' }, { user: 'kristina', tour: 'matka', needsTransport: true }, { user: 'stefan', tour: 'matka' },
  { user: 'nikola', tour: 'solunska' }, { user: 'dimitar', tour: 'solunska' },
  { user: 'marija', tour: 'galicica' }, { user: 'teodora', tour: 'galicica' }, { user: 'dimitar', tour: 'galicica', needsTransport: true }, { user: 'ana', tour: 'galicica' }, { user: 'elena', tour: 'galicica' },
  { user: 'stefan', tour: 'plackovica' }, { user: 'kristina', tour: 'plackovica' }, { user: 'elena', tour: 'plackovica' },
  { user: 'bojan', tour: 'kajmakcalan' }, { user: 'nikola', tour: 'kajmakcalan' }, { user: 'marija', tour: 'kajmakcalan' }, { user: 'ivan', tour: 'kajmakcalan' },
  { user: 'teodora', tour: 'matka2' }, { user: 'kristina', tour: 'matka2' }, { user: 'ana', tour: 'matka2' },
  { user: 'bojan', tour: 'ljuboten' }, { user: 'nikola', tour: 'ljuboten' }, { user: 'ivan', tour: 'ljuboten' },
  { user: 'dimitar', tour: 'osogovo' }, { user: 'marija', tour: 'osogovo' },
  { user: 'teodora', tour: 'belasica' }, { user: 'stefan', tour: 'belasica' },
  { user: 'nikola', tour: 'bistra' },
  { user: 'bojan', tour: 'jablanica' }, { user: 'nikola', tour: 'jablanica' },
  { user: 'stefan', tour: 'vodno2' }, { user: 'kristina', tour: 'vodno2' }, { user: 'elena', tour: 'vodno2' }, { user: 'dimitar', tour: 'vodno2' }, { user: 'ana', tour: 'vodno2' },
  { user: 'marija', tour: 'p5' }, { user: 'teodora', tour: 'p5' }, { user: 'ana', tour: 'p5' },
  { user: 'bojan', tour: 'p6' }, { user: 'nikola', tour: 'p6' }, { user: 'dimitar', tour: 'p6' }, { user: 'ivan', tour: 'p6' },
  { user: 'bojan', tour: 'p7' }, { user: 'nikola', tour: 'p7' },
  { user: 'marija', tour: 'p8' }, { user: 'dimitar', tour: 'p8' }, { user: 'teodora', tour: 'p8' }, { user: 'stefan', tour: 'p8' },
];

const comments = [
  { key: 'c1', user: 'ivan', tour: 'pelister', rating: 5, text: 'Минатата година беше одлична тура, водичот многу внимателен. Земете ветровка – горе дува!' },
  { key: 'c2', user: 'marko', tour: 'pelister', parent: 'c1', text: 'Благодарам Иване! Точно така, на езерото ќе биде околу 2°C.' },
  { key: 'c3', user: 'elena', tour: 'pelister', rating: 4, text: 'Дали има организиран превоз од Скопје?' },
  { key: 'c4', user: 'ana', tour: 'p4', rating: 5, text: 'Прекрасна есенска тура, бродот на враќање беше вистинско доживување.' },
  { key: 'c5', user: 'ivan', tour: 'p3', rating: 4, text: 'Напорно, но погледот од врвот вреди.' },
  { key: 'c6', user: 'marija', tour: 'p5', rating: 5, text: 'Двете езера од врвот се нешто неверојатно. Водичката Билјана беше одлична!' },
  { key: 'c7', user: 'biljana', tour: 'p5', parent: 'c6', text: 'Ви благодарам Марија, ве очекуваме и на есенската тура!' },
  { key: 'c8', user: 'teodora', tour: 'p5', rating: 4, text: 'Убава тура, малку подолга пауза на врвот би била добредојдена.' },
  { key: 'c9', user: 'bojan', tour: 'p6', rating: 5, text: 'Капелата на врвот и погледот кон Грција – топ!' },
  { key: 'c10', user: 'dimitar', tour: 'p6', rating: 4, text: 'Добро организирано, превозот беше точен.' },
  { key: 'c11', user: 'nikola', tour: 'p7', rating: 5, text: 'Најтешката тура оваа година, но вредеше секој чекор.' },
  { key: 'c12', user: 'marija', tour: 'p8', rating: 5, text: 'Есенските бои на Осогово се прекрасни. Препорачувам!' },
  { key: 'c13', user: 'stefan', tour: 'p8', rating: 4, text: 'Првпат на ваква тура и сè беше супер објаснето.' },
  { key: 'c14', user: 'kristina', tour: 'plackovica', text: 'Дали е погодна за деца од 10 години?' },
  { key: 'c15', user: 'sasho', tour: 'plackovica', parent: 'c14', text: 'Да, патеката е лесна и има многу паузи.' },
  { key: 'c16', user: 'bojan', tour: 'ljuboten', text: 'Дали се потребни дерези ако падне снег?' },
];

module.exports = { locations, equipment, users, tours, registrations, comments };
