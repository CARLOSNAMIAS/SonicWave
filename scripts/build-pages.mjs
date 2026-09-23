import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES, pagePath, stationQuery, loadContent } from './lib/pages-data.mjs';
import { renderPage } from './lib/render-page.mjs';
import { renderSitemap } from './lib/render-sitemap.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(raiz, 'dist');

const API = process.env.PAGES_API || 'https://all.api.radio-browser.info/json/stations/search';
const LIMITE = 30;
const ESPERA_MAXIMA = 10000;

/**
 * Pide las emisoras de una página. Si la API no responde a tiempo se devuelve
 * una lista vacía: la página se publica igual y el despliegue continúa.
 */
const fetchStations = async (page) => {
    const params = new URLSearchParams({
        ...stationQuery(page),
        limit: String(LIMITE),
        hidebroken: 'true',
        order: 'clickcount',
        reverse: 'true',
        is_https: 'true',
    });

    try {
        const respuesta = await fetch(`${API}?${params}`, {
            headers: { 'User-Agent': 'SonicWave/1.0 (+https://sonicwave-radio.vercel.app)' },
            signal: AbortSignal.timeout(ESPERA_MAXIMA),
        });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        const datos = await respuesta.json();
        return Array.isArray(datos) ? datos : [];
    } catch (error) {
        console.warn(`  · sin emisoras para ${pagePath(page)}: ${error.message}`);
        return [];
    }
};

const main = async () => {
    try {
        await fs.access(dist);
    } catch {
        console.error('No existe dist/. Ejecuta primero "vite build".');
        process.exit(1);
    }

    const fichas = await loadContent();
    let conEmisoras = 0;

    for (const page of PAGES) {
        const stations = await fetchStations(page);
        if (stations.length > 0) conEmisoras++;

        const html = renderPage({
            page,
            content: fichas.get(page.slug),
            stations,
            allPages: PAGES,
        });

        const carpeta = path.join(dist, page.section, page.slug);
        await fs.mkdir(carpeta, { recursive: true });
        await fs.writeFile(path.join(carpeta, 'index.html'), html, 'utf8');
        console.log(`  ✓ ${pagePath(page)} (${stations.length} emisoras)`);
    }

    const hoy = new Date().toISOString().slice(0, 10);
    await fs.writeFile(path.join(dist, 'sitemap.xml'), renderSitemap(hoy), 'utf8');

    console.log(`\n${PAGES.length} páginas generadas, ${conEmisoras} con listado. Sitemap actualizado.`);
};

main();
