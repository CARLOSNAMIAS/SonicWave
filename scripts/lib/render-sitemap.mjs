import { PAGES, pagePath } from './pages-data.mjs';

const SITIO = 'https://sonicwave-radio.vercel.app';

/** Rutas fijas del sitio, con su prioridad relativa. */
const FIJAS = [
    { ruta: '/', freq: 'daily', prioridad: '1.0' },
    { ruta: '/?view=EXPLORE', freq: 'weekly', prioridad: '0.8' },
    { ruta: '/?view=ABOUT', freq: 'monthly', prioridad: '0.7' },
    { ruta: '/privacy.html', freq: 'yearly', prioridad: '0.3' },
    { ruta: '/terms.html', freq: 'yearly', prioridad: '0.3' },
    { ruta: '/cookies.html', freq: 'yearly', prioridad: '0.3' },
];

const entrada = ({ ruta, freq, prioridad }, fecha) => `  <url>
    <loc>${SITIO}${ruta}</loc>
    <lastmod>${fecha}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${prioridad}</priority>
  </url>`;

/** El sitemap se genera junto a las páginas para que no puedan desincronizarse. */
export const renderSitemap = (fecha) => {
    const generadas = PAGES.map(page => ({
        ruta: pagePath(page),
        freq: 'weekly',
        prioridad: '0.9',
    }));

    const urls = [...FIJAS, ...generadas]
        .map(item => entrada(item, fecha))
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
};
