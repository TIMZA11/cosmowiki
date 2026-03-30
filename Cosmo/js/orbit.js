/**
 * CosmoWiki — Орбитальная карта
 * Использует SpaceKit.js (Three.js) с реальными кеплеровыми элементами орбит
 * Источник данных: JPL Small-Body Database / MPC
 */

// ══════════════════════════════════════════════════════════
// ОРБИТАЛЬНЫЕ ДАННЫЕ
// epoch в Юлианских Датах (JD)
// a — большая полуось (а.е.), e — эксцентриситет
// i — наклон (°), om — долгота узла (°)
// w — аргумент перигелия (°), ma — средняя аномалия на эпоху (°)
// ══════════════════════════════════════════════════════════

const ORBIT_DATA = [

    // ── ПЛАНЕТЫ (встроенные пресеты SpaceKit) ──
    { id: 'sun',     name: 'Солнце',   type: 'star',   icon: '☀️',  categoryId: 'stars',         preset: 'SUN' },
    { id: 'mercury', name: 'Меркурий', type: 'planet', icon: '🌍',  categoryId: 'planets',       preset: 'MERCURY' },
    { id: 'venus',   name: 'Венера',   type: 'planet', icon: '🌍',  categoryId: 'planets',       preset: 'VENUS' },
    { id: 'earth',   name: 'Земля',    type: 'planet', icon: '🌍',  categoryId: 'planets',       preset: 'EARTH' },
    { id: 'mars',    name: 'Марс',     type: 'planet', icon: '🌍',  categoryId: 'planets',       preset: 'MARS' },
    { id: 'jupiter', name: 'Юпитер',  type: 'planet', icon: '🌍',  categoryId: 'planets',       preset: 'JUPITER' },
    { id: 'saturn',  name: 'Сатурн',  type: 'planet', icon: '🌍',  categoryId: 'planets',       preset: 'SATURN' },
    { id: 'uranus',  name: 'Уран',    type: 'planet', icon: '🌍',  categoryId: 'planets',       preset: 'URANUS' },
    { id: 'neptune', name: 'Нептун',  type: 'planet', icon: '🌍',  categoryId: 'planets',       preset: 'NEPTUNE' },

    // ── КАРЛИКОВЫЕ ПЛАНЕТЫ ──
    {
        id: 'pluto', name: 'Плутон', type: 'dwarf', icon: '🔵', categoryId: 'dwarf-planets', color: 0xc8a87a,
        ephem: { epoch: 2451545.0, a: 39.482, e: 0.2488, i: 17.14,  om: 110.307, w: 113.834, ma: 14.53  }
    },
    {
        id: 'ceres', name: 'Церера', type: 'dwarf', icon: '🔵', categoryId: 'dwarf-planets', color: 0xb5b0a0,
        ephem: { epoch: 2455400.5, a: 2.7653, e: 0.0791, i: 10.587, om: 80.393,  w: 72.590,  ma: 113.41 }
    },
    {
        id: 'eris', name: 'Эрида', type: 'dwarf', icon: '🔵', categoryId: 'dwarf-planets', color: 0xd8d8d8,
        ephem: { epoch: 2451545.0, a: 67.78,  e: 0.4418, i: 44.04,  om: 35.96,   w: 151.43,  ma: 201.68 }
    },
    {
        id: 'haumea', name: 'Хаумеа', type: 'dwarf', icon: '🔵', categoryId: 'dwarf-planets', color: 0xe8e0d0,
        ephem: { epoch: 2451545.0, a: 43.08,  e: 0.1975, i: 28.21,  om: 121.90,  w: 239.51,  ma: 215.40 }
    },
    {
        id: 'makemake', name: 'Макемаке', type: 'dwarf', icon: '🔵', categoryId: 'dwarf-planets', color: 0xd08060,
        ephem: { epoch: 2451545.0, a: 45.43,  e: 0.1617, i: 29.01,  om: 79.62,   w: 296.03,  ma: 165.51 }
    },
    {
        id: 'sedna', name: 'Седна', type: 'dwarf', icon: '🔵', categoryId: 'dwarf-planets', color: 0xff7055,
        ephem: { epoch: 2451545.0, a: 506.0,  e: 0.8432, i: 11.93,  om: 144.52,  w: 311.25,  ma: 358.80 }
    },

    // ── АСТЕРОИДЫ ──
    {
        id: 'vesta', name: 'Веста', type: 'asteroid', icon: '🌑', categoryId: 'asteroids', color: 0x909090,
        ephem: { epoch: 2451545.0, a: 2.3616, e: 0.0887, i: 7.14,   om: 103.85,  w: 151.20,  ma: 20.86  }
    },
    {
        id: 'pallas', name: 'Паллада', type: 'asteroid', icon: '🌑', categoryId: 'asteroids', color: 0x787878,
        ephem: { epoch: 2451545.0, a: 2.7722, e: 0.2315, i: 34.84,  om: 173.09,  w: 309.93,  ma: 78.22  }
    },
    {
        id: 'bennu', name: 'Бенну', type: 'asteroid', icon: '🌑', categoryId: 'asteroids', color: 0x775544,
        ephem: { epoch: 2451545.0, a: 1.1264, e: 0.2037, i: 6.035,  om: 2.061,   w: 66.224,  ma: 101.70 }
    },
    {
        id: 'apophis', name: 'Апофис', type: 'asteroid', icon: '🌑', categoryId: 'asteroids', color: 0x664433,
        ephem: { epoch: 2451545.0, a: 0.9224, e: 0.1914, i: 3.340,  om: 204.47,  w: 126.40,  ma: 213.16 }
    },
    {
        id: 'eros', name: 'Эрос', type: 'asteroid', icon: '🌑', categoryId: 'asteroids', color: 0x998877,
        ephem: { epoch: 2451545.0, a: 1.4580, e: 0.2229, i: 10.83,  om: 304.32,  w: 178.92,  ma: 72.70  }
    },

    // ── КОМЕТЫ ──
    {
        id: 'halley', name: 'Комета Галлея', type: 'comet', icon: '☄️', categoryId: 'comets', color: 0x88ccff,
        ephem: { epoch: 2449400.5, a: 17.834, e: 0.9671, i: 162.26, om: 58.42,   w: 111.33,  ma: 38.38  }
    },
    {
        id: 'churyumov', name: '67P Чурюмова-Герасименко', type: 'comet', icon: '☄️', categoryId: 'comets', color: 0xaaddff,
        ephem: { epoch: 2457257.5, a: 3.4628, e: 0.6401, i: 7.04,   om: 50.19,   w: 12.78,   ma: 62.54  }
    },
    {
        id: 'encke', name: 'Комета Энке', type: 'comet', icon: '☄️', categoryId: 'comets', color: 0x99aadd,
        ephem: { epoch: 2453200.5, a: 2.2178, e: 0.8483, i: 11.78,  om: 334.57,  w: 186.55,  ma: 319.79 }
    },
    {
        id: 'neowise', name: 'Комета NEOWISE', type: 'comet', icon: '☄️', categoryId: 'comets', color: 0x77bbee,
        // Для e > 0.98 SpaceKit требует tp (время перигелия JD) + q (расстояние перигелия, а.е.)
        ephem: { tp: 2459033.8, e: 0.9992, i: 128.94, om: 61.01, w: 37.28, q: 0.2948 }
    },
];

// ══════════════════════════════════════════════════════════
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ══════════════════════════════════════════════════════════

function orbitalPeriodYears(a) {
    return Math.pow(Math.abs(a), 1.5);
}

function formatPeriod(yr) {
    if (yr < 0.5)    return Math.round(yr * 365) + ' дней';
    if (yr < 10)     return yr.toFixed(2) + ' лет';
    if (yr < 1000)   return yr.toFixed(0) + ' лет';
    return (yr / 1000).toFixed(1) + ' тыс. лет';
}

function formatAU(au) {
    const v = Math.abs(au);
    if (v < 10)    return au.toFixed(3) + ' а.е.';
    if (v < 1000)  return au.toFixed(1) + ' а.е.';
    return au.toFixed(0) + ' а.е.';
}

// Юлианская дата → JS Date (алгоритм Мюллера)
function jdToDate(jd) {
    const z = Math.floor(jd + 0.5);
    let a;
    if (z < 2299161) {
        a = z;
    } else {
        const alpha = Math.floor((z - 1867216.25) / 36524.25);
        a = z + 1 + alpha - Math.floor(alpha / 4);
    }
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    const day   = b - d - Math.floor(30.6001 * e);
    const month = (e < 14) ? e - 1 : e - 13;
    const year  = (month > 2) ? c - 4716 : c - 4715;
    return new Date(year, month - 1, day);
}

// ══════════════════════════════════════════════════════════
// СОСТОЯНИЕ
// ══════════════════════════════════════════════════════════

let viz            = null;
const simObjects   = {};
const activeFilters = new Set(['planet', 'dwarf', 'asteroid', 'comet']);
let isPaused       = false;

const SPEED_LEVELS = [0.1, 1, 10, 100, 365];
const SPEED_LABELS = ['0.1 дня/с', '1 день/с', '10 дней/с', '100 дней/с', '1 год/с'];
let speedIdx       = 2;   // 10 days/sec по умолчанию

// ══════════════════════════════════════════════════════════
// ИНИЦИАЛИЗАЦИЯ
// ══════════════════════════════════════════════════════════

function initOrbit() {
    const container = document.getElementById('orbit-canvas');
    if (!container) return;

    // Проверяем загрузку SpaceKit
    if (typeof Spacekit === 'undefined' || window.__spacekit_failed) {
        showError(container);
        return;
    }

    try {
        viz = new Spacekit.Simulation(container, {
            basePath: 'https://cdn.jsdelivr.net/gh/typpo/spacekit@main/src',
            camera: {
                initialPosition: [0, -22, 10],
                enableDrift: false,
            },
            startDate: new Date(),
        });
    } catch (err) {
        console.error('SpaceKit init failed:', err);
        showError(container);
        return;
    }

    // Звёздный фон
    viz.createStars({ minSize: 0.4, maxSize: 1.3 });

    // Создаём объекты
    ORBIT_DATA.forEach(obj => {
        if (obj.type === 'star' || activeFilters.has(obj.type)) {
            addObject(obj);
        }
    });

    // Клик по объекту через Three.js Raycaster
    initClickHandler();

    // Скорость
    applySpeed();

    // Часы даты
    startDateClock();

    // Кнопки управления
    document.getElementById('btn-pause')?.addEventListener('click', togglePause);
    document.getElementById('btn-faster')?.addEventListener('click', () => {
        speedIdx = Math.min(SPEED_LEVELS.length - 1, speedIdx + 1);
        applySpeed();
    });
    document.getElementById('btn-slower')?.addEventListener('click', () => {
        speedIdx = Math.max(0, speedIdx - 1);
        applySpeed();
    });
    document.getElementById('btn-today')?.addEventListener('click', () => {
        viz.setDate(new Date());
    });
    document.getElementById('orbit-info-close')?.addEventListener('click', closeInfoPanel);

    // Фильтры
    document.querySelectorAll('.orbit-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleFilter(btn.dataset.type, btn));
    });
}

// ══════════════════════════════════════════════════════════
// СОЗДАНИЕ ОБЪЕКТОВ
// ══════════════════════════════════════════════════════════

function addObject(obj) {
    let spaceObj;
    try {
        if (obj.preset && Spacekit.SpaceObjectPresets[obj.preset]) {
            spaceObj = viz.createObject(obj.id, {
                ...Spacekit.SpaceObjectPresets[obj.preset],
                labelText: obj.name,
            });
        } else if (obj.ephem) {
            const ephem = new Spacekit.Ephem(obj.ephem, 'deg');
            spaceObj = viz.createObject(obj.id, {
                ephem,
                labelText: obj.name,
                theme: {
                    color:      obj.color || 0x888888,
                    orbitColor: obj.color || 0x888888,
                },
            });
        }
        if (spaceObj) simObjects[obj.id] = spaceObj;
    } catch (err) {
        console.warn(`Orbit: пропущен объект ${obj.id}:`, err.message);
    }
    return spaceObj;
}

// ══════════════════════════════════════════════════════════
// ФИЛЬТРЫ
// ══════════════════════════════════════════════════════════

function toggleFilter(type, btn) {
    if (activeFilters.has(type)) {
        activeFilters.delete(type);
        btn.classList.remove('active');
        ORBIT_DATA.filter(o => o.type === type).forEach(o => {
            try { simObjects[o.id]?.setVisibility(false); } catch {}
        });
    } else {
        activeFilters.add(type);
        btn.classList.add('active');
        ORBIT_DATA.filter(o => o.type === type).forEach(o => {
            if (simObjects[o.id]) {
                try { simObjects[o.id].setVisibility(true); } catch {}
            } else {
                addObject(o);
            }
        });
    }
}

// ══════════════════════════════════════════════════════════
// КЛИК ПО ОБЪЕКТУ (Three.js Raycaster)
// ══════════════════════════════════════════════════════════

function initClickHandler() {
    const viewer   = viz.getViewer();
    const renderer = viz.getRenderer();
    const canvas   = renderer.domElement;

    let dragStart = null;

    canvas.addEventListener('pointerdown', (e) => {
        dragStart = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('pointerup', (e) => {
        if (!dragStart) return;
        const dx = Math.abs(e.clientX - dragStart.x);
        const dy = Math.abs(e.clientY - dragStart.y);
        dragStart = null;
        // Игнорируем, если это был drag, а не клик
        if (dx > 5 || dy > 5) return;

        const rect  = canvas.getBoundingClientRect();
        const T = Spacekit.THREE;
        const mouse = new T.Vector2(
            ((e.clientX - rect.left) / rect.width)  * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new T.Raycaster();
        raycaster.params.Points  = { threshold: 0.5 };
        raycaster.params.Sprite  = { threshold: 0.5 };
        raycaster.setFromCamera(mouse, viewer.camera);

        // Собираем все 3js-объекты из simObjects
        const meshes = [];
        const idByMesh = new Map();
        Object.entries(simObjects).forEach(([id, spaceObj]) => {
            const objs = spaceObj.get3jsObjects ? spaceObj.get3jsObjects() : [];
            objs.forEach(m => {
                meshes.push(m);
                idByMesh.set(m.uuid, id);
                // Дочерние объекты тоже
                m.traverse(child => {
                    meshes.push(child);
                    idByMesh.set(child.uuid, id);
                });
            });
        });

        const hits = raycaster.intersectObjects(meshes, false);
        if (hits.length > 0) {
            const id = idByMesh.get(hits[0].object.uuid);
            if (id) openInfoPanel(id);
        }
    });
}

// ══════════════════════════════════════════════════════════
// УПРАВЛЕНИЕ ВРЕМЕНЕМ
// ══════════════════════════════════════════════════════════

function togglePause() {
    isPaused = !isPaused;
    const btn = document.getElementById('btn-pause');
    if (isPaused) {
        viz.stop();
        if (btn) btn.textContent = '▶';
    } else {
        viz.start();
        if (btn) btn.textContent = '⏸';
    }
}

function applySpeed() {
    viz.setJdPerSecond(SPEED_LEVELS[speedIdx]);
    const el = document.getElementById('orbit-speed');
    if (el) el.textContent = SPEED_LABELS[speedIdx];
}

function startDateClock() {
    const el = document.getElementById('orbit-date');
    if (!el) return;

    function tick() {
        try {
            const jd = viz.getJd();
            const date = jdToDate(jd);
            el.textContent = date.toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
        } catch {}
        requestAnimationFrame(tick);
    }
    tick();
}

// ══════════════════════════════════════════════════════════
// ИНФОРМАЦИОННАЯ ПАНЕЛЬ
// ══════════════════════════════════════════════════════════

function openInfoPanel(id) {
    const obj = ORBIT_DATA.find(o => o.id === id);
    if (!obj) return;

    // Категория из каталога
    let catName = '', catIcon = obj.icon;
    if (typeof CATEGORIES !== 'undefined') {
        const cat = CATEGORIES.find(c => c.id === obj.categoryId);
        if (cat) { catName = cat.name; catIcon = cat.icon; }
    }

    // Описание из NASA_DESCRIPTIONS
    let desc = '';
    if (typeof NASA_DESCRIPTIONS !== 'undefined' && NASA_DESCRIPTIONS[obj.id]) {
        const full = NASA_DESCRIPTIONS[obj.id];
        desc = full.length > 340 ? full.slice(0, 340) + '…' : full;
    }

    // Орбитальные параметры
    let statsHtml = '';
    if (obj.ephem) {
        const e = obj.ephem.e;
        const i = obj.ephem.i;
        // Поддержка как стандартных (a+ma) так и кометных (q+tp) элементов
        const q = obj.ephem.q != null ? obj.ephem.q : obj.ephem.a * (1 - e);
        const a = obj.ephem.a != null ? obj.ephem.a : q / (1 - e);
        const Q = a * (1 + e);
        const T = orbitalPeriodYears(a);
        statsHtml = `
        <div class="orbit-stats">
            <div class="orbit-stat">
                <div class="os-label">Большая полуось</div>
                <div class="os-val">${formatAU(a)}</div>
            </div>
            <div class="orbit-stat">
                <div class="os-label">Эксцентриситет</div>
                <div class="os-val">${e.toFixed(4)}</div>
            </div>
            <div class="orbit-stat">
                <div class="os-label">Перигелий</div>
                <div class="os-val">${formatAU(q)}</div>
            </div>
            <div class="orbit-stat">
                <div class="os-label">Афелий</div>
                <div class="os-val">${formatAU(Q)}</div>
            </div>
            <div class="orbit-stat">
                <div class="os-label">Наклон орбиты</div>
                <div class="os-val">${i.toFixed(2)}°</div>
            </div>
            <div class="orbit-stat">
                <div class="os-label">Период обращения</div>
                <div class="os-val">${formatPeriod(T)}</div>
            </div>
        </div>`;
    }

    // Ссылка в каталог
    const catalogLink = obj.categoryId
        ? `<a href="object.html?category=${encodeURIComponent(obj.categoryId)}&id=${encodeURIComponent(obj.id)}" class="orbit-catalog-btn">Открыть в каталоге →</a>`
        : '';

    document.getElementById('orbit-info-content').innerHTML = `
        <div class="orbit-info-badge">${catIcon} ${catName || obj.type}</div>
        <h2 class="orbit-info-name">${obj.name}</h2>
        ${desc ? `<p class="orbit-info-desc">${desc}</p>` : ''}
        ${statsHtml}
        ${catalogLink}
    `;

    document.getElementById('orbit-info').classList.add('open');
}

function closeInfoPanel() {
    document.getElementById('orbit-info')?.classList.remove('open');
}

// ══════════════════════════════════════════════════════════
// ОШИБКА ЗАГРУЗКИ
// ══════════════════════════════════════════════════════════

function showError(container) {
    container.innerHTML = `
        <div class="orbit-error">
            <div style="font-size:3.5rem;margin-bottom:20px">🌌</div>
            <h2>Не удалось загрузить карту</h2>
            <p>Орбитальная карта требует подключения к интернету.<br>
               Проверьте соединение и обновите страницу.</p>
            <button onclick="location.reload()" class="orbit-reload-btn">Обновить страницу</button>
        </div>`;
}

// ══════════════════════════════════════════════════════════
// ЗАПУСК
// ══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.__loadSpacekit === 'function') {
        window.__loadSpacekit(initOrbit);
    } else {
        initOrbit();
    }
});
