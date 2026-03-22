/**
 * CosmoWiki — Логика страницы SpaceX
 * Отображает ракеты, информацию о компании и статистику запусков.
 */

document.addEventListener('DOMContentLoaded', () => {
    showLoadingState();
    loadSpaceXData();
});

function showLoadingState() {
    // Скелетоны для ракет
    const grid = document.getElementById('rockets-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 2; i++) {
        const skel = document.createElement('div');
        skel.className = 'spacex-rocket-card skeleton';
        skel.innerHTML = `
            <div class="spacex-rocket-image skeleton-image"></div>
            <div class="spacex-rocket-body">
                <div class="skeleton-title" style="width:40%;height:28px"></div>
                <div class="skeleton-text" style="margin-top:12px"></div>
                <div class="skeleton-text short" style="margin-top:8px"></div>
            </div>`;
        grid.appendChild(skel);
    }
}

async function loadSpaceXData() {
    try {
        const [rockets, company, launches] = await Promise.all([
            SpaceXAPI.getRockets().catch(() => []),
            SpaceXAPI.getCompany().catch(() => null),
            SpaceXAPI.getPastLaunches().catch(() => [])
        ]);

        const hasData = (company || rockets.length || launches.length);
        if (!hasData) {
            showSpaceXError();
            return;
        }

        if (company) renderCompany(company, launches.length);
        if (rockets.length) renderRockets(rockets);
        if (launches.length) renderLaunchStats(launches);
    } catch (err) {
        console.error('SpaceX page error:', err);
        showSpaceXError();
    }
}

function showSpaceXError() {
    document.getElementById('company-summary').textContent = '';
    document.getElementById('rockets-grid').innerHTML = '';

    const section = document.getElementById('company-block');
    const msg = document.createElement('div');
    msg.className = 'error-state';
    msg.innerHTML = '';

    const icon = document.createElement('div');
    icon.className = 'error-state-icon';
    icon.textContent = '🚀';

    const text = document.createElement('p');
    text.className = 'error-state-text';
    text.textContent = 'Не удалось загрузить данные SpaceX. Возможно, API временно недоступен или заблокирован вашим провайдером.';

    const btn = document.createElement('button');
    btn.className = 'error-state-action';
    btn.textContent = 'Попробовать снова';
    btn.addEventListener('click', () => {
        localStorage.removeItem('spacex_rockets');
        localStorage.removeItem('spacex_company');
        localStorage.removeItem('spacex_launches_past');
        window.location.reload();
    });

    msg.appendChild(icon);
    msg.appendChild(text);
    msg.appendChild(btn);
    section.appendChild(msg);
}

/**
 * Информация о компании
 */
function renderCompany(company, totalLaunches) {
    document.getElementById('company-summary').textContent = company.summary || '';

    const stats = document.getElementById('company-stats');
    const items = [
        { label: 'Основана', value: company.founded || '2002' },
        { label: 'Основатель', value: company.founder || 'Elon Musk' },
        { label: 'Сотрудников', value: (company.employees || 0).toLocaleString('ru-RU') },
        { label: 'Ракет', value: String(company.vehicles || 4) },
        { label: 'Запусков', value: String(totalLaunches) },
        { label: 'Стартовых площадок', value: String(company.launch_sites || 3) }
    ];

    stats.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'spacex-stat-card';

        const val = document.createElement('span');
        val.className = 'spacex-stat-value';
        val.textContent = item.value;

        const lbl = document.createElement('span');
        lbl.className = 'spacex-stat-label';
        lbl.textContent = item.label;

        card.appendChild(val);
        card.appendChild(lbl);
        stats.appendChild(card);
    });
}

/**
 * Карточки ракет
 */
function renderRockets(rockets) {
    const grid = document.getElementById('rockets-grid');
    grid.innerHTML = '';

    // Сортировка: активные первые
    const sorted = [...rockets].sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0));

    sorted.forEach(rocket => {
        const card = document.createElement('div');
        card.className = 'spacex-rocket-card';

        // Фото
        const imageDiv = document.createElement('div');
        imageDiv.className = 'spacex-rocket-image';
        if (rocket.flickr_images && rocket.flickr_images.length > 0) {
            const img = document.createElement('img');
            img.src = rocket.flickr_images[0];
            img.alt = rocket.name;
            img.loading = 'lazy';
            imageDiv.appendChild(img);
        }

        // Статус
        const badge = document.createElement('span');
        badge.className = `spacex-rocket-badge ${rocket.active ? 'active' : 'retired'}`;
        badge.textContent = rocket.active ? 'Активна' : 'Неактивна';
        imageDiv.appendChild(badge);

        // Контент
        const body = document.createElement('div');
        body.className = 'spacex-rocket-body';

        const name = document.createElement('h3');
        name.className = 'spacex-rocket-name';
        name.textContent = rocket.name;

        const desc = document.createElement('p');
        desc.className = 'spacex-rocket-desc';
        desc.textContent = rocket.description || '';

        // Характеристики
        const params = document.createElement('div');
        params.className = 'spacex-rocket-params';

        const paramItems = [
            { key: 'Высота', val: `${rocket.height?.meters || '—'} м` },
            { key: 'Диаметр', val: `${rocket.diameter?.meters || '—'} м` },
            { key: 'Масса', val: formatMass(rocket.mass?.kg) },
            { key: 'Ступеней', val: String(rocket.stages || '—') },
            { key: 'Полезная нагрузка (LEO)', val: formatMass(rocket.payload_weights?.[0]?.kg) },
            { key: 'Стоимость запуска', val: formatCost(rocket.cost_per_launch) },
            { key: 'Успешность', val: `${rocket.success_rate_pct ?? '—'}%` },
            { key: 'Первый полёт', val: rocket.first_flight || '—' }
        ];

        paramItems.forEach(p => {
            const row = document.createElement('div');
            row.className = 'spacex-rocket-param';

            const k = document.createElement('span');
            k.className = 'spacex-rocket-param-key';
            k.textContent = p.key;

            const v = document.createElement('span');
            v.className = 'spacex-rocket-param-val';
            v.textContent = p.val;

            row.appendChild(k);
            row.appendChild(v);
            params.appendChild(row);
        });

        // Ссылка на Wikipedia
        if (rocket.wikipedia) {
            const link = document.createElement('a');
            link.href = rocket.wikipedia;
            link.target = '_blank';
            link.className = 'source-link';
            link.textContent = 'Wikipedia →';
            body.appendChild(name);
            body.appendChild(desc);
            body.appendChild(params);
            body.appendChild(link);
        } else {
            body.appendChild(name);
            body.appendChild(desc);
            body.appendChild(params);
        }

        card.appendChild(imageDiv);
        card.appendChild(body);
        grid.appendChild(card);
    });
}

/**
 * Статистика запусков с диаграммой по годам
 */
function renderLaunchStats(launches) {
    const stats = SpaceXAPI.calcLaunchStats(launches);
    const statsEl = document.getElementById('launch-stats');
    const chartEl = document.getElementById('launch-chart');

    // Общая статистика
    statsEl.innerHTML = '';
    const items = [
        { label: 'Всего запусков', value: String(stats.total), accent: true },
        { label: 'Успешных', value: String(stats.successes) },
        { label: 'Неудачных', value: String(stats.failures) },
        { label: 'Успешность', value: `${stats.total ? Math.round(stats.successes / stats.total * 100) : 0}%` }
    ];

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'spacex-stat-card' + (item.accent ? ' accent' : '');

        const val = document.createElement('span');
        val.className = 'spacex-stat-value';
        val.textContent = item.value;

        const lbl = document.createElement('span');
        lbl.className = 'spacex-stat-label';
        lbl.textContent = item.label;

        card.appendChild(val);
        card.appendChild(lbl);
        statsEl.appendChild(card);
    });

    // Столбчатая диаграмма по годам
    const years = Object.keys(stats.byYear).sort();
    const maxLaunches = Math.max(...years.map(y => stats.byYear[y].total));

    chartEl.innerHTML = '';

    const chartTitle = document.createElement('h3');
    chartTitle.className = 'spacex-chart-title';
    chartTitle.textContent = 'Запуски по годам';
    chartEl.appendChild(chartTitle);

    const barsContainer = document.createElement('div');
    barsContainer.className = 'spacex-chart-bars';

    years.forEach(year => {
        const data = stats.byYear[year];
        const heightPct = maxLaunches > 0 ? (data.total / maxLaunches) * 100 : 0;

        const col = document.createElement('div');
        col.className = 'spacex-chart-col';

        const count = document.createElement('span');
        count.className = 'spacex-chart-count';
        count.textContent = String(data.total);

        const bar = document.createElement('div');
        bar.className = 'spacex-chart-bar';
        bar.style.height = `${Math.max(heightPct, 3)}%`;

        // Цветовая часть неудачных запусков
        if (data.fail > 0) {
            const failPct = (data.fail / data.total) * 100;
            bar.style.background = `linear-gradient(to top, #ef4444 ${failPct}%, var(--accent) ${failPct}%)`;
        }

        const label = document.createElement('span');
        label.className = 'spacex-chart-label';
        label.textContent = year.slice(-2); // Последние 2 цифры года

        col.appendChild(count);
        col.appendChild(bar);
        col.appendChild(label);
        barsContainer.appendChild(col);
    });

    chartEl.appendChild(barsContainer);
}

// ─── Утилиты ───

function formatMass(kg) {
    if (!kg) return '—';
    if (kg >= 1000000) return `${(kg / 1000000).toFixed(1)} млн кг`;
    if (kg >= 1000) return `${(kg / 1000).toFixed(0)} т`;
    return `${kg} кг`;
}

function formatCost(usd) {
    if (!usd) return '—';
    if (usd >= 1e9) return `$${(usd / 1e9).toFixed(1)} млрд`;
    if (usd >= 1e6) return `$${(usd / 1e6).toFixed(0)} млн`;
    return `$${usd.toLocaleString('ru-RU')}`;
}
