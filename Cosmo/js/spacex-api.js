/**
 * CosmoWiki — Модуль работы с SpaceX API v4
 * https://github.com/r-spacex/SpaceX-API
 *
 * Бесплатный, без ключа, поддерживает CORS.
 * Данные: ракеты, запуски, информация о компании.
 */

const SpaceXAPI = (() => {
    const API_URL = 'https://api.spacexdata.com/v4';
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа
    const FETCH_TIMEOUT = 10000; // 10 секунд таймаут

    // ─── Fetch с таймаутом ───

    async function fetchWithTimeout(url) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
        try {
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timer);
            return res;
        } catch (err) {
            clearTimeout(timer);
            throw err;
        }
    }

    // ─── Кэширование ───

    function cacheGet(key) {
        try {
            const raw = localStorage.getItem(`spacex_${key}`);
            if (!raw) return null;
            const { data, ts } = JSON.parse(raw);
            if (Date.now() - ts > CACHE_TTL) {
                localStorage.removeItem(`spacex_${key}`);
                return null;
            }
            return data;
        } catch {
            return null;
        }
    }

    function cacheSet(key, data) {
        try {
            localStorage.setItem(`spacex_${key}`, JSON.stringify({ data, ts: Date.now() }));
        } catch { /* localStorage полон */ }
    }

    // ─── Ракеты ───

    async function getRockets() {
        const cached = cacheGet('rockets');
        if (cached) return cached;

        try {
            const res = await fetchWithTimeout(`${API_URL}/rockets`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            cacheSet('rockets', data);
            return data;
        } catch (err) {
            console.warn('SpaceXAPI.getRockets:', err);
            return [];
        }
    }

    // ─── Информация о компании ───

    async function getCompany() {
        const cached = cacheGet('company');
        if (cached) return cached;

        try {
            const res = await fetchWithTimeout(`${API_URL}/company`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            cacheSet('company', data);
            return data;
        } catch (err) {
            console.warn('SpaceXAPI.getCompany:', err);
            return null;
        }
    }

    // ─── Прошедшие запуски ───

    async function getPastLaunches() {
        const cached = cacheGet('launches_past');
        if (cached) return cached;

        try {
            const res = await fetchWithTimeout(`${API_URL}/launches/past`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            cacheSet('launches_past', data);
            return data;
        } catch (err) {
            console.warn('SpaceXAPI.getPastLaunches:', err);
            return [];
        }
    }

    // ─── Статистика запусков ───

    function calcLaunchStats(launches) {
        const total = launches.length;
        const successes = launches.filter(l => l.success === true).length;
        const failures = launches.filter(l => l.success === false).length;

        // По годам
        const byYear = {};
        launches.forEach(l => {
            const year = new Date(l.date_utc).getFullYear();
            if (!byYear[year]) byYear[year] = { total: 0, success: 0, fail: 0 };
            byYear[year].total++;
            if (l.success === true) byYear[year].success++;
            if (l.success === false) byYear[year].fail++;
        });

        return { total, successes, failures, byYear };
    }

    return { getRockets, getCompany, getPastLaunches, calcLaunchStats };
})();
