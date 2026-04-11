/**
 * CosmoWiki — Логика страницы космического объекта
 * v2 — с 3D-просмотром на Three.js и реальными фото NASA
 */

// ─── NASA текстуры для планет ───
const PLANET_TEXTURES = {
    mercury: 'https://images-assets.nasa.gov/image/PIA15162/PIA15162~orig.jpg',
    venus:   'https://images-assets.nasa.gov/image/PIA00271/PIA00271~orig.jpg',
    earth:   'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001386/GSFC_20171208_Archive_e001386~orig.jpg',
    mars:    'https://images-assets.nasa.gov/image/PIA07081/PIA07081~orig.jpg',
    jupiter: 'https://images-assets.nasa.gov/image/PIA21985/PIA21985~orig.jpg',
    saturn:  'https://images-assets.nasa.gov/image/PIA02241/PIA02241~orig.jpg',
    uranus:  'https://images-assets.nasa.gov/image/PIA18182/PIA18182~orig.jpg',
    neptune: 'https://images-assets.nasa.gov/image/PIA01493/PIA01493~orig.jpg',
    moon:    'https://images-assets.nasa.gov/image/AS17-148-22727/AS17-148-22727~orig.jpg',
    pluto:   'https://images-assets.nasa.gov/image/PIA19952/PIA19952~orig.jpg',
};

// Категории, для которых показываем 3D-просмотр
const VIEWER_CATEGORIES = ['planets', 'dwarf-planets', 'moons', 'asteroids'];

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('category');
    const objectId = params.get('id');

    const category = CATEGORIES.find(c => c.id === categoryId);
    if (!category) { showError('Категория не найдена'); return; }

    const obj = category.objects.find(o => o.id === objectId);
    if (!obj) { showError('Объект не найден'); return; }

    // Хлебные крошки
    document.getElementById('breadcrumb-category-link').href = `category.html?id=${categoryId}`;
    document.getElementById('breadcrumb-category-link').textContent = category.name;
    document.getElementById('breadcrumb-object').textContent = obj.name;

    // Бейдж категории
    document.getElementById('object-category-badge').textContent = `${category.icon} ${category.name}`;

    // Заголовок
    document.getElementById('object-title').textContent = obj.name;
    document.title = `CosmoWiki — ${obj.name}`;
    const objDesc = `${obj.name} — космический объект категории «${category.name}». Характеристики, фотографии NASA, расчёт времени полёта с Земли.`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', objDesc);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `CosmoWiki — ${obj.name}`);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', objDesc);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', `CosmoWiki — ${obj.name}`);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', objDesc);

    loadAllData(obj, category, categoryId);
});

async function loadAllData(obj, category, categoryId) {
    try {
        const wikiUrl = `https://ru.wikipedia.org/wiki/${encodeURIComponent(obj.wiki)}`;

        const [nasaImages, wikiInfobox] = await Promise.all([
            NasaAPI.searchImages(NasaAPI.NASA_SEARCH_TERMS[obj.id] || obj.name, 8).catch(() => []),
            WikiAPI.getInfobox(obj.wiki).catch(() => ({}))
        ]);

        // Если есть 3D-просмотр — показываем его вместо статичного фото
        if (VIEWER_CATEGORIES.includes(categoryId)) {
            renderViewer(obj, nasaImages);
        } else {
            renderHeroImage(nasaImages, obj);
        }

        renderDescription(obj);
        renderSources(wikiUrl, obj);
        renderTravelTime(obj.distanceKm);
        renderParams(wikiInfobox, obj);
        renderGallery(nasaImages);
        initSectionAnimations();
    } catch (err) {
        console.error('loadAllData error:', err);
        document.getElementById('object-extract').textContent =
            'Не удалось загрузить данные. Проверьте подключение к интернету.';
    }
}

// ─── 3D ПРОСМОТР ───

function renderViewer(obj, nasaImages) {
    const container = document.getElementById('object-hero-image');
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.background = '#02020A';
    container.style.minHeight = '380px';

    // Значок «3D» и кредит
    const badge3d = document.createElement('div');
    badge3d.className = 'viewer-badge-3d';
    badge3d.innerHTML = '<span class="badge-3d">3D модель</span><span class="badge-nasa">NASA текстура</span>';
    container.appendChild(badge3d);

    // Кнопки режимов
    const modes = document.createElement('div');
    modes.className = 'viewer-modes';
    ['Фото', 'Сетка', 'Атмосфера'].forEach((label, i) => {
        const btn = document.createElement('button');
        btn.className = 'viewer-mode-btn' + (i === 0 ? ' active' : '');
        btn.textContent = label;
        btn.dataset.mode = ['tex', 'wire', 'atm'][i];
        modes.appendChild(btn);
    });
    container.appendChild(modes);

    // Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'viewer-canvas';
    canvas.style.cssText = 'display:block;width:100%;height:380px;cursor:grab';
    container.appendChild(canvas);

    // Подсказки и кредит
    const footer = document.createElement('div');
    footer.className = 'viewer-footer';
    footer.innerHTML = '<span class="viewer-hint">↔ вращение · ⊕ масштаб</span><span class="viewer-credit">NASA / JPL-Caltech</span>';
    container.appendChild(footer);

    // Галерея реальных фото NASA под просмотром
    if (nasaImages.length > 0) {
        const photoStrip = document.createElement('div');
        photoStrip.className = 'nasa-photo-strip';
        const label = document.createElement('div');
        label.className = 'nasa-strip-label';
        label.textContent = 'Реальные снимки NASA';
        photoStrip.appendChild(label);
        const strip = document.createElement('div');
        strip.className = 'nasa-strip-grid';
        nasaImages.slice(0, 6).forEach(img => {
            if (!img.thumbnail) return;
            const item = document.createElement('div');
            item.className = 'nasa-strip-item';
            item.dataset.fullUrl = img.fullImage || img.thumbnail;
            item.dataset.title = img.title || '';
            const image = document.createElement('img');
            image.src = img.thumbnail;
            image.alt = img.title || obj.name;
            image.loading = 'lazy';
            const cap = document.createElement('span');
            cap.textContent = img.title || '';
            item.appendChild(image);
            item.appendChild(cap);
            strip.appendChild(item);
        });
        strip.addEventListener('click', e => {
            const item = e.target.closest('.nasa-strip-item');
            if (item) openLightbox(item.dataset.fullUrl, item.dataset.title);
        });
        photoStrip.appendChild(strip);
        container.appendChild(photoStrip);
    }

    // Запускаем Three.js после рендера DOM
    requestAnimationFrame(() => init3DViewer(canvas, obj, modes));
}

function init3DViewer(canvas, obj, modesEl) {
    if (typeof THREE === 'undefined') {
        // Подгружаем Three.js если ещё не загружен
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = () => setup3D(canvas, obj, modesEl);
        document.head.appendChild(script);
    } else {
        setup3D(canvas, obj, modesEl);
    }
}

function setup3D(canvas, obj, modesEl) {
    const W = canvas.parentElement.offsetWidth || 600;
    const H = 380;
    canvas.width = W; canvas.height = H;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 200);
    camera.position.set(0, 0, 3.2);

    scene.add(new THREE.AmbientLight(0x1a1040, 0.9));
    const sun = new THREE.DirectionalLight(0xFFD0A0, 3.5);
    sun.position.set(6, 1.5, 4); scene.add(sun);
    const rim = new THREE.DirectionalLight(0x2040aa, 0.35);
    rim.position.set(-4, -1, -3); scene.add(rim);

    // Строим текстуру
    const procTex = buildProceduralTexture(obj.id);
    const geo = new THREE.SphereGeometry(1, 96, 96);

    const mainMesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
        map: procTex, shininess: 8, specular: new THREE.Color(0x220800)
    }));
    scene.add(mainMesh);

    // Загружаем реальную NASA-текстуру
    const nasaUrl = PLANET_TEXTURES[obj.id];
    if (nasaUrl) {
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');
        loader.load(nasaUrl, tex => {
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            mainMesh.material.map = tex;
            mainMesh.material.needsUpdate = true;
        }, undefined, () => {});
    }

    // Wireframe
    const wireMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 28, 28),
        new THREE.MeshBasicMaterial({ wireframe: true, color: 0x9070d0, opacity: 0.6, transparent: true })
    );
    wireMesh.visible = false; scene.add(wireMesh);

    // Атмосфера
    const atm = new THREE.Mesh(
        new THREE.SphereGeometry(1.06, 32, 32),
        new THREE.MeshPhongMaterial({ color: 0xBB4400, transparent: true, opacity: 0.07, side: THREE.BackSide })
    );
    scene.add(atm);
    const atmOuter = new THREE.Mesh(
        new THREE.SphereGeometry(1.18, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x662200, transparent: true, opacity: 0.04, side: THREE.BackSide })
    );
    atmOuter.visible = false; scene.add(atmOuter);

    // Звёзды
    const starGeo = new THREE.BufferGeometry();
    const verts = [];
    for (let i = 0; i < 1500; i++) {
        const t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1), r = 22 + Math.random() * 38;
        verts.push(r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t));
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.065, transparent: true, opacity: 0.8 })));

    // Спутники для Марса
    if (obj.id === 'mars') addMarsMoons(scene);

    // Переключение режимов
    let currentMode = 'tex';
    modesEl.querySelectorAll('.viewer-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modesEl.querySelectorAll('.viewer-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            mainMesh.visible = currentMode !== 'wire';
            wireMesh.visible = currentMode === 'wire';
            atmOuter.visible = currentMode === 'atm';
        });
    });

    // Управление
    let drag = false, px = 0, py = 0, ry = 0.5, rx = 0.12, vy = 0, vx = 0, auto = true, zoom = 1;
    canvas.addEventListener('mousedown', e => { drag = true; auto = false; px = e.clientX; py = e.clientY; vy = vx = 0; });
    window.addEventListener('mousemove', e => {
        if (!drag) return;
        vy = (e.clientX - px) * 0.009; vx = (e.clientY - py) * 0.006;
        ry += vy; rx = Math.max(-1.4, Math.min(1.4, rx + vx));
        px = e.clientX; py = e.clientY;
    });
    window.addEventListener('mouseup', () => drag = false);
    canvas.addEventListener('touchstart', e => { drag = true; auto = false; px = e.touches[0].clientX; py = e.touches[0].clientY; }, { passive: true });
    canvas.addEventListener('touchmove', e => {
        if (!drag) return;
        vy = (e.touches[0].clientX - px) * 0.009; vx = (e.touches[0].clientY - py) * 0.006;
        ry += vy; rx = Math.max(-1.4, Math.min(1.4, rx + vx));
        px = e.touches[0].clientX; py = e.touches[0].clientY;
    }, { passive: true });
    canvas.addEventListener('touchend', () => drag = false);
    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        zoom = Math.max(0.35, Math.min(3, zoom - e.deltaY * 0.001));
        camera.position.z = 3.2 / zoom;
    }, { passive: false });

    let t = 0;
    (function loop() {
        requestAnimationFrame(loop); t += 0.004;
        if (!drag) { vy *= 0.93; vx *= 0.93; ry += vy; rx += vx; if (auto) ry += 0.003; }
        mainMesh.rotation.set(rx, ry, 0.015);
        wireMesh.rotation.set(rx, ry, 0.015);
        scene.children.forEach(o => { if (o.userData.moon) animateMoon(o, t); });
        renderer.render(scene, camera);
    })();
}

function buildProceduralTexture(id) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    const cx = c.getContext('2d');
    // Базовые цвета по типу объекта
    const colors = {
        mars:    ['#7A2E0A', '#C04010', '#D06030'],
        venus:   ['#C8A060', '#E8C080', '#A08040'],
        earth:   ['#1a4a8a', '#2a6a4a', '#4a8a2a'],
        mercury: ['#888888', '#aaaaaa', '#666666'],
        jupiter: ['#C8A060', '#E8C080', '#A04020'],
        saturn:  ['#D4B080', '#E8C890', '#C09060'],
        uranus:  ['#80C0D0', '#A0D8E0', '#60A8C0'],
        neptune: ['#3050C0', '#4060D8', '#2040A0'],
        moon:    ['#888888', '#aaaaaa', '#666655'],
        pluto:   ['#998877', '#bbaa99', '#776655'],
    };
    const col = colors[id] || ['#606080', '#808090', '#404060'];
    const g = cx.createLinearGradient(0, 0, 1024, 0);
    g.addColorStop(0, col[0]); g.addColorStop(0.4, col[1]); g.addColorStop(0.7, col[2]); g.addColorStop(1, col[0]);
    cx.fillStyle = g; cx.fillRect(0, 0, 1024, 512);
    function r(s) { let x = Math.sin(s) * 73856; return x - Math.floor(x); }
    cx.globalAlpha = 0.25;
    for (let i = 0; i < 1200; i++) {
        cx.fillStyle = r(i * 5.9) > 0.5 ? col[0] : col[2];
        cx.beginPath();
        cx.ellipse(r(i * 2.1) * 1024, r(i * 3.7) * 512, r(i * 1.3) * 18 + 2, r(i * 1.7) * 10 + 1, r(i) * Math.PI, 0, Math.PI * 2);
        cx.fill();
    }
    // Полярные шапки (для планет)
    cx.globalAlpha = 0.5;
    [490, 22].forEach(y => {
        const pg = cx.createRadialGradient(512, y, 0, 512, y, 80);
        pg.addColorStop(0, 'rgba(248,248,255,0.7)'); pg.addColorStop(1, 'rgba(248,248,255,0)');
        cx.fillStyle = pg; cx.fillRect(0, 0, 1024, 512);
    });
    return new THREE.CanvasTexture(c);
}

function addMarsMoons(scene) {
    [{ dist: 1.52, size: 0.042, speed: 2.1, phase: 0 },
     { dist: 2.08, size: 0.024, speed: 0.78, phase: 2.4 }].forEach(m => {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(m.size, 12, 12),
            new THREE.MeshPhongMaterial({ color: 0x887766, shininess: 3 })
        );
        mesh.userData = { moon: true, ...m }; scene.add(mesh);
    });
}

function animateMoon(m, t) {
    const d = m.userData, a = t * d.speed + d.phase;
    m.position.set(Math.cos(a) * d.dist, Math.sin(a) * 0.15, Math.sin(a) * d.dist);
}

// ─── Статичное героическое фото (для не-3D категорий) ───

function renderHeroImage(nasaImages, obj) {
    const container = document.getElementById('object-hero-image');
    container.innerHTML = '';

    let imageUrl = null, credit = '';
    if (nasaImages.length > 0) {
        imageUrl = nasaImages[0].fullImage || nasaImages[0].thumbnail;
        credit = nasaImages[0].credit || 'NASA';
    }

    if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl; img.alt = obj.name; img.className = 'hero-img';
        img.addEventListener('error', () => { container.innerHTML = ''; renderPlaceholder(container, obj.name); });
        const creditSpan = document.createElement('span');
        creditSpan.className = 'hero-credit'; creditSpan.textContent = credit;
        container.appendChild(img); container.appendChild(creditSpan);
    } else {
        renderPlaceholder(container, obj.name);
    }
}

function renderPlaceholder(container, name) {
    const placeholder = document.createElement('div');
    placeholder.className = 'object-hero-placeholder';
    const icon = document.createElement('span');
    icon.style.fontSize = '4rem'; icon.textContent = '🌌';
    const label = document.createElement('span'); label.textContent = name;
    placeholder.appendChild(icon); placeholder.appendChild(label);
    container.appendChild(placeholder);
}

// ─── Остальные рендеры (без изменений) ───

function renderDescription(obj) {
    const extractEl = document.getElementById('object-extract');
    const nasaDesc = (typeof NASA_DESCRIPTIONS !== 'undefined') && NASA_DESCRIPTIONS[obj.id];
    extractEl.textContent = nasaDesc || `${obj.name} — космический объект.`;
}

function renderSources(wikiUrl, obj) {
    const sourcesEl = document.getElementById('object-sources');
    sourcesEl.innerHTML = '';
    if (wikiUrl) {
        const wikiLink = document.createElement('a');
        wikiLink.href = wikiUrl; wikiLink.target = '_blank'; wikiLink.rel = 'noopener';
        wikiLink.className = 'source-link'; wikiLink.textContent = '📖 Википедия';
        sourcesEl.appendChild(wikiLink);
    }
    const nasaLink = document.createElement('a');
    const nasaQuery = encodeURIComponent(NasaAPI.NASA_SEARCH_TERMS[obj.id] || obj.name);
    nasaLink.href = `https://images.nasa.gov/search?q=${nasaQuery}&media=image`;
    nasaLink.target = '_blank'; nasaLink.rel = 'noopener';
    nasaLink.className = 'source-link'; nasaLink.textContent = '🚀 NASA Images';
    sourcesEl.appendChild(nasaLink);
}

function renderTravelTime(distanceKm) {
    const block = document.getElementById('travel-block');
    const details = document.getElementById('travel-details');
    if (!distanceKm || distanceKm <= 0) {
        block.style.display = 'flex';
        const here = document.createElement('div');
        here.className = 'travel-here'; here.textContent = 'Мы здесь! 🌍';
        details.innerHTML = ''; details.appendChild(here); return;
    }
    const travel = TravelTime.calculate(distanceKm);
    block.style.display = 'flex';
    details.innerHTML = `
        <div class="travel-distance">
            <span class="travel-distance-value">${escapeHtml(travel.distanceFormatted)}</span>
            <span class="travel-distance-label">расстояние от Земли</span>
            ${travel.distanceLightYears > 0.001 ? `<span class="travel-distance-light">(${escapeHtml(travel.distanceLightFormatted)})</span>` : ''}
        </div>
        <div class="travel-crafts">
            ${travel.results.map(r => `
                <div class="travel-craft">
                    <span class="craft-icon">${r.icon}</span>
                    <div class="craft-info">
                        <span class="craft-name">${escapeHtml(r.spacecraft)}</span>
                        <span class="craft-desc">${escapeHtml(r.description)}</span>
                    </div>
                    <span class="craft-time">${escapeHtml(r.formatted)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderParams(infobox, obj) {
    const section = document.getElementById('params-section');
    const grid = document.getElementById('params-grid');
    if (!infobox || Object.keys(infobox).length === 0) return;
    const skipKeys = ['изображение','image','подпись','caption','фон','цвет','color','wikidata','карта','map','ширина','width','заголовок','название','имя','name','link','ссылка','позиция','position','стиль','style','bgcolor','header','label','above','below','image_size','image_alt','alt','epoch','equinox','изображение1','nocat','nofooter','символ','размер изображения','тип орбиты'];
    const keyTranslations = { mass:'Масса',radius:'Радиус',diameter:'Диаметр',density:'Плотность',gravity:'Гравитация',temperature:'Температура',luminosity:'Светимость',distance:'Расстояние',age:'Возраст',type:'Тип',spectral:'Спектральный класс',constellation:'Созвездие',period:'Период',inclination:'Наклонение',eccentricity:'Эксцентриситет',apoapsis:'Апоцентр',periapsis:'Перицентр','semi-major_axis':'Большая полуось',discoverer:'Первооткрыватель',discovered:'Дата открытия',named_after:'Назван в честь',satellites:'Спутники',magnitude:'Звёздная величина',absolute_magnitude:'Абс. зв. величина',apparent_magnitude:'Вид. зв. величина',right_ascension:'Прямое восхождение',declination:'Склонение',redshift:'Красное смещение',rotation:'Период вращения',albedo:'Альбедо' };
    const entries = Object.entries(infobox).filter(([key, value]) => {
        const lower = key.toLowerCase();
        if (skipKeys.some(sk => lower.includes(sk)) || lower.length <= 1) return false;
        if (/\.svg|\.png|\.jpg|^\d+px$/i.test(value)) return false;
        return true;
    }).slice(0, 18);
    if (entries.length === 0) return;
    section.style.display = 'block';
    grid.innerHTML = entries.map(([key, value]) => {
        const translated = keyTranslations[key.toLowerCase()] || capitalizeFirst(key.replace(/_/g, ' '));
        return `<div class="param-card"><span class="param-key">${escapeHtml(translated)}</span><span class="param-value">${escapeHtml(value)}</span></div>`;
    }).join('');
}

function renderGallery(nasaImages) {
    const section = document.getElementById('nasa-gallery');
    const grid = document.getElementById('gallery-grid');
    const galleryImages = nasaImages.slice(1).filter(img => img.thumbnail);
    if (galleryImages.length === 0) return;
    section.style.display = 'block';
    grid.innerHTML = '';
    galleryImages.forEach((img, i) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.style.animationDelay = `${i * 0.08}s`;
        item.dataset.fullUrl = img.fullImage || img.thumbnail;
        item.dataset.title = img.title || '';
        const image = document.createElement('img');
        image.src = img.thumbnail; image.alt = img.title || ''; image.loading = 'lazy';
        const overlay = document.createElement('div'); overlay.className = 'gallery-overlay';
        const title = document.createElement('span'); title.className = 'gallery-title'; title.textContent = img.title || '';
        const credit = document.createElement('span'); credit.className = 'gallery-credit'; credit.textContent = img.credit || 'NASA';
        overlay.appendChild(title); overlay.appendChild(credit);
        item.appendChild(image); item.appendChild(overlay);
        grid.appendChild(item);
    });
    grid.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (!item) return;
        openLightbox(item.dataset.fullUrl, item.dataset.title);
    });
}

function openLightbox(url, title) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    const content = document.createElement('div'); content.className = 'lightbox-content';
    const img = document.createElement('img'); img.src = url; img.alt = title;
    const caption = document.createElement('p'); caption.className = 'lightbox-title'; caption.textContent = title;
    const closeBtn = document.createElement('button'); closeBtn.className = 'lightbox-close'; closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', e => { e.stopPropagation(); overlay.remove(); });
    content.appendChild(img); content.appendChild(caption); content.appendChild(closeBtn);
    overlay.appendChild(content);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    const escHandler = e => { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', escHandler); } };
    document.addEventListener('keydown', escHandler);
    document.body.appendChild(overlay);
}

function initSectionAnimations() {
    const sections = document.querySelectorAll('.object-hero, .travel-block, .params-section, .nasa-gallery');
    sections.forEach(el => el.classList.add('section-animate'));
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
        }, { threshold: 0.05 });
        sections.forEach(el => observer.observe(el));
    }
    setTimeout(() => sections.forEach(el => el.classList.add('visible')), 600);
}

function capitalizeFirst(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function escapeHtml(str) { const div = document.createElement('div'); div.textContent = str || ''; return div.innerHTML; }
function showError(msg) {
    document.getElementById('object-title').textContent = msg;
    document.getElementById('object-extract').textContent = 'Вернитесь в каталог и выберите объект.';
}
