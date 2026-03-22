/**
 * CosmoWiki — Расчёт времени полёта при современных технологиях
 *
 * Используем реальные скорости космических аппаратов:
 * - «Вояджер-1»:     61 200 км/ч (17 км/с) — самый далёкий от Земли аппарат
 * - «Новые горизонты»: 58 536 км/ч (16.26 км/с) — самый быстрый запуск
 * - «Паркер»:        692 000 км/ч (192 км/с) — самый быстрый аппарат (у Солнца)
 *
 * Для расчёта берём скорость «Новых горизонтов» как наиболее реалистичную
 * для межпланетного/межзвёздного перелёта.
 */

const TravelTime = (() => {

    // Скорости аппаратов (км/ч)
    const SPACECRAFT = [
        {
            name: 'Новые горизонты',
            nameEn: 'New Horizons',
            speed: 58536,
            description: 'Самый быстрый запуск в истории (2006)',
            icon: '🛸'
        },
        {
            name: 'Вояджер-1',
            nameEn: 'Voyager 1',
            speed: 61200,
            description: 'Самый далёкий от Земли аппарат',
            icon: '🛰️'
        },
        {
            name: 'Паркер',
            nameEn: 'Parker Solar Probe',
            speed: 692000,
            description: 'Рекорд скорости — 192 км/с (у Солнца)',
            icon: '☀️'
        }
    ];

    const HOURS_PER_YEAR = 8766; // средних часов в году (365.25 * 24)
    const SPEED_OF_LIGHT_KMH = 1079252848.8; // скорость света км/ч

    /**
     * Рассчитать время полёта для заданного расстояния
     * @param {number} distanceKm — расстояние в км
     * @returns {object} — результаты для каждого аппарата + расстояние в св. годах
     */
    function calculate(distanceKm) {
        if (!distanceKm || distanceKm <= 0) {
            return {
                distanceKm: 0,
                distanceLightYears: 0,
                isHere: true,
                results: []
            };
        }

        const distanceLightYears = distanceKm / (SPEED_OF_LIGHT_KMH * HOURS_PER_YEAR);

        const results = SPACECRAFT.map(craft => {
            const hours = distanceKm / craft.speed;
            const years = hours / HOURS_PER_YEAR;

            return {
                spacecraft: craft.name,
                spacecraftEn: craft.nameEn,
                description: craft.description,
                icon: craft.icon,
                speedKmH: craft.speed,
                hours,
                years,
                formatted: formatDuration(hours)
            };
        });

        return {
            distanceKm,
            distanceFormatted: formatDistance(distanceKm),
            distanceLightYears,
            distanceLightFormatted: formatLightDistance(distanceLightYears),
            isHere: false,
            results
        };
    }

    /**
     * Форматировать продолжительность полёта
     */
    function formatDuration(totalHours) {
        if (totalHours < 1) {
            const minutes = Math.round(totalHours * 60);
            return `${minutes} мин`;
        }
        if (totalHours < 24) {
            const h = Math.round(totalHours);
            return `${h} ч`;
        }
        if (totalHours < HOURS_PER_YEAR) {
            const days = Math.round(totalHours / 24);
            if (days < 30) return `${days} ${pluralDays(days)}`;
            const months = Math.round(days / 30.44);
            return `~${months} мес`;
        }

        const years = totalHours / HOURS_PER_YEAR;

        if (years < 1000) {
            return `~${Math.round(years).toLocaleString('ru-RU')} лет`;
        }
        if (years < 1e6) {
            return `~${(years / 1000).toFixed(1)} тыс. лет`;
        }
        if (years < 1e9) {
            return `~${(years / 1e6).toFixed(1)} млн лет`;
        }
        if (years < 1e12) {
            return `~${(years / 1e9).toFixed(1)} млрд лет`;
        }
        return `~${(years / 1e12).toFixed(1)} трлн лет`;
    }

    /**
     * Форматировать расстояние в км
     */
    function formatDistance(km) {
        if (km < 1e6) {
            return `${Math.round(km).toLocaleString('ru-RU')} км`;
        }
        if (km < 1e9) {
            return `${(km / 1e6).toFixed(1)} млн км`;
        }
        if (km < 1e12) {
            return `${(km / 1e9).toFixed(1)} млрд км`;
        }
        if (km < 1e15) {
            return `${(km / 1e12).toFixed(1)} трлн км`;
        }
        // Для сверхдальних объектов показываем в св. годах
        const ly = km / (SPEED_OF_LIGHT_KMH * HOURS_PER_YEAR);
        return formatLightDistance(ly);
    }

    /**
     * Форматировать расстояние в световых годах
     */
    function formatLightDistance(ly) {
        if (ly < 0.01) {
            const lightMinutes = ly * HOURS_PER_YEAR * 60;
            if (lightMinutes < 60) {
                return `${lightMinutes.toFixed(1)} св. мин`;
            }
            const lightHours = lightMinutes / 60;
            return `${lightHours.toFixed(1)} св. ч`;
        }
        if (ly < 1) {
            return `${ly.toFixed(2)} св. года`;
        }
        if (ly < 1000) {
            return `${ly.toFixed(1)} св. лет`;
        }
        if (ly < 1e6) {
            return `${(ly / 1000).toFixed(1)} тыс. св. лет`;
        }
        if (ly < 1e9) {
            return `${(ly / 1e6).toFixed(1)} млн св. лет`;
        }
        return `${(ly / 1e9).toFixed(1)} млрд св. лет`;
    }

    /**
     * Склонение «день/дня/дней»
     */
    function pluralDays(n) {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod100 >= 11 && mod100 <= 19) return 'дней';
        if (mod10 === 1) return 'день';
        if (mod10 >= 2 && mod10 <= 4) return 'дня';
        return 'дней';
    }

    return { calculate, formatDistance, formatLightDistance, SPACECRAFT };
})();
