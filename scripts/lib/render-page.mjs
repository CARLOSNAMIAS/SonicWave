import { escapeHtml } from './escape-html.mjs';
import { pagePath } from './pages-data.mjs';

const SITIO = 'https://sonicwave-radio.vercel.app';
const ADSENSE = 'ca-pub-6983431049380018';

/** Una fila del índice, con la misma disposición que la aplicación. */
const renderStation = (station, indice) => {
    const posicion = String(indice + 1).padStart(3, '0');
    const procedencia = [station.countrycode, station.country].filter(Boolean).map(escapeHtml).join(' ');
    const calidad = station.bitrate ? `${escapeHtml(station.bitrate)} kbps` : '—';
    return `      <li class="station">
        <span class="station-index">${posicion}</span>
        <span class="station-name">${escapeHtml(station.name)}</span>
        <span class="station-meta">${procedencia}</span>
        <span class="station-meta">${calidad}</span>
      </li>`;
};

/** Enlaces al resto de páginas: es lo que permite recorrer el sitio. */
const renderLinks = (allPages, actual, section, titulo) => {
    const items = allPages
        .filter(p => p.section === section && p.slug !== actual.slug)
        .map(p => `        <li><a href="${pagePath(p)}">${escapeHtml(p.name)}</a></li>`)
        .join('\n');
    return `      <nav class="related">
        <h2 class="meta">${titulo}</h2>
        <ul>
${items}
        </ul>
      </nav>`;
};

const renderJsonLd = (page, content, stations) => {
    const datos = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: content.title,
        description: content.description,
        url: SITIO + pagePath(page),
        inLanguage: 'es-419',
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: stations.length,
            itemListElement: stations.map((station, indice) => ({
                '@type': 'ListItem',
                position: indice + 1,
                item: {
                    '@type': 'RadioStation',
                    name: station.name,
                    ...(station.homepage ? { url: station.homepage } : {}),
                },
            })),
        },
    };
    // Un nombre de emisora con «</script>» cerraría el bloque antes de tiempo.
    return JSON.stringify(datos, null, 2).replace(/</g, '\u003c');
};

/**
 * Página estática de un país o un género.
 * Todo el contenido va escrito en el HTML: estas páginas deben leerse sin
 * ejecutar JavaScript, que es justamente lo que un rastreador no garantiza.
 */
export const renderPage = ({ page, content, stations, allPages }) => {
    const ruta = pagePath(page);
    const url = SITIO + ruta;
    const enlaceApp = `/?${page.apiParam}=${encodeURIComponent(page.apiValue)}`;
    const titulo = `${content.title} | SonicWave`;

    const indice = stations.length > 0
        ? `      <h2 class="meta">Emisoras</h2>
      <ol class="stations">
${stations.map(renderStation).join('\n')}
      </ol>`
        : `      <p class="sin-datos">El listado de emisoras se está actualizando. Puedes verlo
        en vivo dentro de la aplicación.</p>`;

    return `<!DOCTYPE html>
<html lang="es-419">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(titulo)}</title>
    <meta name="description" content="${escapeHtml(content.description)}">
    <link rel="canonical" href="${url}">
    <meta name="google-adsense-account" content="${ADSENSE}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${escapeHtml(content.title)}">
    <meta property="og:description" content="${escapeHtml(content.description)}">
    <meta property="og:image" content="${SITIO}/compartir.png">
    <link rel="icon" href="/faviconn.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/pages.css">
    <script type="application/ld+json">
${renderJsonLd(page, content, stations)}
    </script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE}"
        crossorigin="anonymous"></script>
</head>
<body>
    <header class="site-header">
        <a href="/" class="wordmark">SonicWave</a>
        <a href="/" class="meta">Volver a la radio</a>
    </header>

    <main>
      <h1>${escapeHtml(content.title)}</h1>
      <p class="lead">${escapeHtml(content.description)}</p>
${content.funFact ? `      <aside class="aside">
        <p class="meta">Al margen</p>
        <p>${escapeHtml(content.funFact)}</p>
      </aside>` : ''}

      <p class="cta"><a href="${enlaceApp}">Escuchar en SonicWave</a></p>

${indice}

${renderLinks(allPages, page, 'radio', 'Radio por países')}
${renderLinks(allPages, page, 'genero', 'Por género')}
    </main>

    <footer class="page-footer">
        <nav>
            <a href="/privacy.html">Privacidad</a>
            <a href="/terms.html">Términos</a>
            <a href="/cookies.html">Cookies</a>
            <a href="/?view=ABOUT">Qué es SonicWave</a>
        </nav>
        <p class="meta">SonicWave no aloja ninguna transmisión: cada señal viaja directa desde su emisora.</p>
    </footer>
</body>
</html>
`;
};
