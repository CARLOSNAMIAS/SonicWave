# Páginas por país y género — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar catorce páginas estáticas —seis de país y ocho de género— cuyo HTML llegue completo al navegador sin ejecutar JavaScript, generadas durante el build a partir de las fichas que ya existen en `src/data/contentData.ts`.

**Architecture:** Un script de Node se ejecuta después de `vite build`, lee las fichas del propio `contentData.ts` transpilado al vuelo con esbuild, pide las emisoras de cada filtro a Radio Browser y escribe un `index.html` por página dentro de `dist/`. La lógica que produce HTML y XML es pura y vive separada de la que toca red y disco, de modo que se pueda probar con datos de ejemplo. La aplicación React no cambia su arquitectura: solo aprende a leer los parámetros de búsqueda con los que estas páginas la enlazan.

**Tech Stack:** Node 24, Vite 6, esbuild (ya incluido con Vite), Vitest, HTML y CSS planos para las páginas generadas.

**Spec:** `docs/superpowers/specs/2026-09-16-paginas-pais-genero-design.md`

## Global Constraints

- Las páginas generadas no ejecutan JavaScript para mostrar su contenido: todo el texto y el índice de emisoras van escritos en el HTML.
- Solo se generan páginas para fichas con texto propio. Nunca se rellena con texto genérico.
- Si la API de Radio Browser falla durante el build, la página se genera sin índice de emisoras y el build **termina con éxito**.
- Todo texto procedente de la API (nombres de emisora, países) se escapa antes de insertarlo en el HTML.
- Slugs sin acentos ni eñes.
- Límite de 30 emisoras por página; tiempo máximo de espera por petición: 10 segundos.
- API: `https://all.api.radio-browser.info/json/stations/search`, con cabecera `User-Agent: SonicWave/1.0 (+https://sonicwave-radio.vercel.app)`.
- El identificador de AdSense es `ca-pub-6983431049380018` en todas las páginas.
- El dominio canónico es `https://sonicwave-radio.vercel.app`.
- Idioma de toda la interfaz y los textos: español.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `scripts/lib/pages-data.mjs` | Tabla de las catorce páginas y carga de las fichas desde `contentData.ts` |
| `scripts/lib/render-page.mjs` | Función pura: ficha + emisoras → HTML de una página |
| `scripts/lib/render-sitemap.mjs` | Función pura: rutas → XML del sitemap |
| `scripts/build-pages.mjs` | Orquestador: pide emisoras, escribe archivos en `dist/` |
| `public/pages.css` | Hoja compartida por las páginas generadas y las legales (sustituye a `legal.css`) |
| `src/App.tsx` | Lee `?country=`, `?tag=` y `?name=` al arrancar |
| `src/components/layout/Footer.tsx` | Columna de enlaces a las páginas nuevas |
| `package.json` | El script `build` encadena el generador |

---

### Task 1: Tabla de páginas y carga de fichas

**Files:**
- Create: `scripts/lib/pages-data.mjs`
- Test: `scripts/lib/__tests__/pages-data.test.mjs`

**Interfaces:**
- Consumes: `src/data/contentData.ts` (ya existe; exporta `getContentForFilter(filterKey, type)`)
- Produces:
  - `PAGES`: array de `{ slug, section, name, contentKey, contentType, apiParam, apiValue }`
  - `pagePath(page)`: devuelve `/radio/venezuela` o `/genero/jazz`
  - `loadContent()`: async, devuelve `Map<slug, { title, description, funFact? }>`

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/lib/__tests__/pages-data.test.mjs
import { describe, it, expect } from 'vitest';
import { PAGES, pagePath, loadContent } from '../pages-data.mjs';

describe('pages-data', () => {
    it('describe catorce páginas, seis de país y ocho de género', () => {
        expect(PAGES).toHaveLength(14);
        expect(PAGES.filter(p => p.section === 'radio')).toHaveLength(6);
        expect(PAGES.filter(p => p.section === 'genero')).toHaveLength(8);
    });

    it('usa slugs sin acentos ni eñes', () => {
        for (const page of PAGES) {
            expect(page.slug).toMatch(/^[a-z0-9-]+$/);
        }
    });

    it('no repite ninguna ruta', () => {
        const rutas = PAGES.map(pagePath);
        expect(new Set(rutas).size).toBe(rutas.length);
        expect(rutas).toContain('/radio/venezuela');
        expect(rutas).toContain('/genero/jazz');
    });

    it('busca BTS por nombre, no por etiqueta', () => {
        const bts = PAGES.find(p => p.slug === 'bts');
        expect(bts.apiParam).toBe('name');
        expect(bts.apiValue).toBe('bts');
    });

    it('carga el texto real de cada ficha desde contentData', async () => {
        const fichas = await loadContent();
        expect(fichas.size).toBe(14);
        expect(fichas.get('venezuela').title).toBe('Ritmos de Venezuela');
        expect(fichas.get('venezuela').funFact).toMatch(/gaita zuliana/);
        expect(fichas.get('jazz').description.length).toBeGreaterThan(40);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/lib/__tests__/pages-data.test.mjs`
Expected: FAIL con "Failed to resolve import ../pages-data.mjs"

- [ ] **Step 3: Write minimal implementation**

```javascript
// scripts/lib/pages-data.mjs
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Las catorce fichas con texto propio de contentData.ts.
 *
 * - `slug` y `section` componen la dirección pública.
 * - `contentKey` y `contentType` localizan la ficha dentro de contentData.
 * - `apiParam` y `apiValue` sirven tanto para pedir emisoras a Radio Browser
 *   como para construir el enlace que abre la aplicación con ese filtro.
 */
export const PAGES = [
    { slug: 'venezuela', section: 'radio', name: 'Venezuela', contentKey: 'Venezuela', contentType: 'country', apiParam: 'country', apiValue: 'Venezuela' },
    { slug: 'espana', section: 'radio', name: 'España', contentKey: 'Spain', contentType: 'country', apiParam: 'country', apiValue: 'Spain' },
    { slug: 'usa', section: 'radio', name: 'Estados Unidos', contentKey: 'USA', contentType: 'country', apiParam: 'country', apiValue: 'USA' },
    { slug: 'mexico', section: 'radio', name: 'México', contentKey: 'Mexico', contentType: 'country', apiParam: 'country', apiValue: 'Mexico' },
    { slug: 'argentina', section: 'radio', name: 'Argentina', contentKey: 'Argentina', contentType: 'country', apiParam: 'country', apiValue: 'Argentina' },
    { slug: 'colombia', section: 'radio', name: 'Colombia', contentKey: 'Colombia', contentType: 'country', apiParam: 'country', apiValue: 'Colombia' },
    { slug: 'lofi', section: 'genero', name: 'Lo-fi', contentKey: 'lofi', contentType: 'tag', apiParam: 'tag', apiValue: 'lofi' },
    { slug: 'jazz', section: 'genero', name: 'Jazz', contentKey: 'jazz', contentType: 'tag', apiParam: 'tag', apiValue: 'jazz' },
    { slug: 'rock', section: 'genero', name: 'Rock', contentKey: 'rock', contentType: 'tag', apiParam: 'tag', apiValue: 'rock' },
    { slug: 'dance', section: 'genero', name: 'Dance', contentKey: 'dance', contentType: 'tag', apiParam: 'tag', apiValue: 'dance' },
    { slug: 'latina', section: 'genero', name: 'Música latina', contentKey: 'latin', contentType: 'tag', apiParam: 'tag', apiValue: 'latin' },
    { slug: 'podcast', section: 'genero', name: 'Podcasts', contentKey: 'podcast', contentType: 'tag', apiParam: 'tag', apiValue: 'podcast' },
    { slug: 'electronica', section: 'genero', name: 'Electrónica', contentKey: 'electronic', contentType: 'tag', apiParam: 'tag', apiValue: 'electronic' },
    { slug: 'bts', section: 'genero', name: 'BTS', contentKey: 'bts', contentType: 'tag', apiParam: 'name', apiValue: 'bts' },
];

/** Dirección pública de una página, sin el dominio. */
export const pagePath = (page) => `/${page.section}/${page.slug}`;

/**
 * Lee las fichas del propio contentData.ts para no duplicar los textos.
 * esbuild viene incluido con Vite, así que no hace falta instalar nada.
 */
export const loadContent = async () => {
    const resultado = await build({
        entryPoints: [path.join(raiz, 'src/data/contentData.ts')],
        bundle: true,
        write: false,
        format: 'esm',
        platform: 'node',
    });

    const codigo = resultado.outputFiles[0].text;
    const modulo = await import(
        'data:text/javascript;base64,' + Buffer.from(codigo).toString('base64')
    );

    const fichas = new Map();
    for (const page of PAGES) {
        fichas.set(page.slug, modulo.getContentForFilter(page.contentKey, page.contentType));
    }
    return fichas;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/lib/__tests__/pages-data.test.mjs`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/pages-data.mjs scripts/lib/__tests__/pages-data.test.mjs
git commit -m "feat: Tabla de páginas por país y género con sus fichas"
```

---

### Task 2: Escapado de HTML

**Files:**
- Create: `scripts/lib/escape-html.mjs`
- Test: `scripts/lib/__tests__/escape-html.test.mjs`

**Interfaces:**
- Produces: `escapeHtml(valor)` → string. Acepta cualquier valor; `null` y `undefined` devuelven cadena vacía.

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/lib/__tests__/escape-html.test.mjs
import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../escape-html.mjs';

describe('escapeHtml', () => {
    it('neutraliza etiquetas que vengan en el nombre de una emisora', () => {
        expect(escapeHtml('<script>alert(1)</script>'))
            .toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('escapa comillas para que no rompan un atributo', () => {
        expect(escapeHtml('Radio "La Mejor"')).toBe('Radio &quot;La Mejor&quot;');
        expect(escapeHtml("Rock & Pop's")).toBe('Rock &amp; Pop&#39;s');
    });

    it('deja intactos los acentos y las eñes', () => {
        expect(escapeHtml('La Chiquinquireña')).toBe('La Chiquinquireña');
    });

    it('convierte los valores ausentes en cadena vacía', () => {
        expect(escapeHtml(null)).toBe('');
        expect(escapeHtml(undefined)).toBe('');
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/lib/__tests__/escape-html.test.mjs`
Expected: FAIL con "Failed to resolve import ../escape-html.mjs"

- [ ] **Step 3: Write minimal implementation**

```javascript
// scripts/lib/escape-html.mjs

/** Escapa texto que procede de una fuente externa antes de insertarlo en HTML. */
export const escapeHtml = (valor) => {
    if (valor === null || valor === undefined) return '';
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/lib/__tests__/escape-html.test.mjs`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/escape-html.mjs scripts/lib/__tests__/escape-html.test.mjs
git commit -m "feat: Escapado de HTML para los datos que vienen de la API"
```

---

### Task 3: Render de una página

**Files:**
- Create: `scripts/lib/render-page.mjs`
- Test: `scripts/lib/__tests__/render-page.test.mjs`

**Interfaces:**
- Consumes: `PAGES` y `pagePath` de `pages-data.mjs`; `escapeHtml` de `escape-html.mjs`
- Produces: `renderPage({ page, content, stations, allPages })` → string con el HTML completo
  - `page`: una entrada de `PAGES`
  - `content`: `{ title, description, funFact? }`
  - `stations`: array de `{ name, country, countrycode, bitrate, homepage }` (puede venir vacío)
  - `allPages`: array de entradas de `PAGES` para los enlaces internos

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/lib/__tests__/render-page.test.mjs
import { describe, it, expect } from 'vitest';
import { renderPage } from '../render-page.mjs';
import { PAGES } from '../pages-data.mjs';

const page = PAGES.find(p => p.slug === 'venezuela');

const content = {
    title: 'Ritmos de Venezuela',
    description: 'Explora la vibrante escena radial venezolana, desde las noticias de Caracas hasta el folclore de los llanos.',
    funFact: 'La gaita zuliana es uno de los géneros más populares en Navidad.',
};

const stations = [
    { name: 'Metropolis 103.9 FM', country: 'Venezuela', countrycode: 'VE', bitrate: 128, homepage: 'https://metropolis1039fm.com/' },
    { name: 'La Chiquinquireña 90.9 FM', country: 'Venezuela', countrycode: 'VE', bitrate: 128, homepage: '' },
];

const render = (extra = {}) => renderPage({ page, content, stations, allPages: PAGES, ...extra });

describe('renderPage', () => {
    it('escribe el texto de la ficha dentro del HTML', () => {
        const html = render();
        expect(html).toContain('Ritmos de Venezuela');
        expect(html).toContain('folclore de los llanos');
        expect(html).toContain('gaita zuliana');
    });

    it('lista cada emisora con su nombre y su calidad', () => {
        const html = render();
        expect(html).toContain('Metropolis 103.9 FM');
        expect(html).toContain('La Chiquinquireña 90.9 FM');
        expect(html).toContain('128 kbps');
    });

    it('sigue siendo una página válida cuando la API no devolvió emisoras', () => {
        const html = render({ stations: [] });
        expect(html).toContain('Ritmos de Venezuela');
        expect(html).toContain('folclore de los llanos');
        expect(html).not.toContain('<ol');
        expect(html).toContain('Escuchar en SonicWave');
    });

    it('enlaza a las demás páginas y nunca a sí misma', () => {
        const html = render();
        expect(html).toContain('/genero/jazz');
        expect(html).toContain('/radio/espana');
        expect(html).not.toContain('href="/radio/venezuela"');
    });

    it('lleva al visitante a la aplicación con el filtro puesto', () => {
        const html = render();
        expect(html).toContain('href="/?country=Venezuela"');
    });

    it('declara datos estructurados analizables con un elemento por emisora', () => {
        const html = render();
        const bloque = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
        expect(bloque).not.toBeNull();
        const datos = JSON.parse(bloque[1]);
        expect(datos['@type']).toBe('CollectionPage');
        expect(datos.mainEntity.itemListElement).toHaveLength(2);
        expect(datos.mainEntity.itemListElement[0].item['@type']).toBe('RadioStation');
    });

    it('escapa el HTML que venga en el nombre de una emisora', () => {
        const html = renderPage({
            page,
            content,
            stations: [{ name: '<b>Pirata</b> "FM"', country: 'Venezuela', countrycode: 'VE', bitrate: 96, homepage: '' }],
            allPages: PAGES,
        });
        expect(html).toContain('&lt;b&gt;Pirata&lt;/b&gt;');
        expect(html).not.toContain('<b>Pirata</b>');
    });

    it('incluye la cabecera necesaria para buscadores y anuncios', () => {
        const html = render();
        expect(html).toContain('<html lang="es">');
        expect(html).toContain('rel="canonical" href="https://sonicwave-radio.vercel.app/radio/venezuela"');
        expect(html).toContain('google-adsense-account');
        expect(html).toContain('ca-pub-6983431049380018');
        expect(html).toContain('/pages.css');
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/lib/__tests__/render-page.test.mjs`
Expected: FAIL con "Failed to resolve import ../render-page.mjs"

- [ ] **Step 3: Write minimal implementation**

```javascript
// scripts/lib/render-page.mjs
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
        inLanguage: 'es',
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
    return JSON.stringify(datos, null, 2);
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
    const titulo = `${content.title} | Radio en vivo | SonicWave`;

    const indice = stations.length > 0
        ? `      <h2 class="meta">Emisoras</h2>
      <ol class="stations">
${stations.map(renderStation).join('\n')}
      </ol>`
        : `      <p class="sin-datos">El listado de emisoras se está actualizando. Puedes verlo
        en directo dentro de la aplicación.</p>`;

    return `<!DOCTYPE html>
<html lang="es">
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/lib/__tests__/render-page.test.mjs`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/render-page.mjs scripts/lib/__tests__/render-page.test.mjs
git commit -m "feat: Render de las páginas de país y género"
```

---

### Task 4: Render del sitemap

**Files:**
- Create: `scripts/lib/render-sitemap.mjs`
- Test: `scripts/lib/__tests__/render-sitemap.test.mjs`

**Interfaces:**
- Consumes: `PAGES` y `pagePath` de `pages-data.mjs`
- Produces: `renderSitemap(fecha)` → string XML. `fecha` en formato `YYYY-MM-DD`.

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/lib/__tests__/render-sitemap.test.mjs
import { describe, it, expect } from 'vitest';
import { renderSitemap } from '../render-sitemap.mjs';

describe('renderSitemap', () => {
    const xml = renderSitemap('2026-09-16');

    it('mantiene la portada y las secciones de la aplicación', () => {
        expect(xml).toContain('<loc>https://sonicwave-radio.vercel.app/</loc>');
        expect(xml).toContain('?view=EXPLORE');
        expect(xml).toContain('?view=ABOUT');
    });

    it('incluye las catorce páginas nuevas', () => {
        expect(xml).toContain('/radio/venezuela');
        expect(xml).toContain('/radio/colombia');
        expect(xml).toContain('/genero/lofi');
        expect(xml).toContain('/genero/bts');
        const rutas = xml.match(/\/(radio|genero)\//g) || [];
        expect(rutas).toHaveLength(14);
    });

    it('no anuncia la Revista, que está retirada', () => {
        expect(xml).not.toContain('view=MAGAZINE');
    });

    it('conserva las páginas legales y usa la fecha recibida', () => {
        expect(xml).toContain('/privacy.html');
        expect(xml).toContain('/terms.html');
        expect(xml).toContain('/cookies.html');
        expect(xml).toContain('<lastmod>2026-09-16</lastmod>');
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/lib/__tests__/render-sitemap.test.mjs`
Expected: FAIL con "Failed to resolve import ../render-sitemap.mjs"

- [ ] **Step 3: Write minimal implementation**

```javascript
// scripts/lib/render-sitemap.mjs
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/lib/__tests__/render-sitemap.test.mjs`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/render-sitemap.mjs scripts/lib/__tests__/render-sitemap.test.mjs
git commit -m "feat: Sitemap generado junto a las páginas"
```

---

### Task 5: Hoja de estilos compartida

**Files:**
- Create: `public/pages.css` (copia de `public/legal.css` más las reglas del índice)
- Delete: `public/legal.css`
- Modify: `public/privacy.html`, `public/terms.html`, `public/cookies.html` (la etiqueta `<link>` pasa a `/pages.css`)

**Interfaces:**
- Produces: clases `main`, `lead`, `aside`, `cta`, `stations`, `station`, `station-index`, `station-name`, `station-meta`, `related`, `sin-datos`, usadas por `renderPage()`

- [ ] **Step 1: Crear la hoja a partir de la existente**

```bash
git mv public/legal.css public/pages.css
```

- [ ] **Step 2: Añadir al final de `public/pages.css` las reglas de las páginas nuevas**

```css
/* --- Páginas de país y género ------------------------------------------- */

.lead {
  font-size: 18px;
  line-height: 1.55;
  max-width: 62ch;
  margin-bottom: 32px;
}

.aside {
  margin: 0 0 32px;
  padding-left: 16px;
  border-left: 3px solid var(--signal);
}

.aside p {
  margin: 0;
}

.cta {
  margin: 0 0 48px;
}

.cta a {
  display: inline-block;
  padding: 14px 28px;
  background: var(--ink);
  color: var(--paper);
  font-weight: 600;
  text-decoration: none;
}

.cta a:hover {
  background: var(--signal);
  color: #fff;
}

.stations {
  list-style: none;
  margin: 0 0 48px;
  padding: 0;
  counter-reset: none;
}

.station {
  display: grid;
  grid-template-columns: 3rem 1fr;
  gap: 4px 16px;
  align-items: baseline;
  padding: 14px 0;
  max-width: none;
}

@media (min-width: 640px) {
  .station {
    grid-template-columns: 3rem 1fr 10rem 6rem;
  }
}

.station-index {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--meta);
}

.station-name {
  font-weight: 600;
}

.station-meta {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--meta);
  grid-column: 2;
}

@media (min-width: 640px) {
  .station-meta {
    grid-column: auto;
  }
}

.related {
  margin-top: 40px;
}

.related ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
}

.related li {
  margin: 0;
}

.sin-datos {
  color: var(--meta);
  margin-bottom: 48px;
}

@media (prefers-color-scheme: dark) {
  .cta a {
    background: var(--paper);
    color: var(--ink);
  }
}
```

- [ ] **Step 3: Apuntar las tres páginas legales a la hoja nueva**

En `public/privacy.html`, `public/terms.html` y `public/cookies.html`, sustituir:

```html
    <link rel="stylesheet" href="/legal.css">
```

por:

```html
    <link rel="stylesheet" href="/pages.css">
```

- [ ] **Step 4: Comprobar que no queda ninguna referencia a la hoja antigua**

Run: `grep -rn "legal.css" public/ src/ index.html`
Expected: sin resultados

- [ ] **Step 5: Commit**

```bash
git add public/
git commit -m "refactor: Hoja de estilos única para las páginas estáticas"
```

---

### Task 6: Generador y su integración en el build

**Files:**
- Create: `scripts/build-pages.mjs`
- Modify: `package.json` (campo `scripts.build`)

**Interfaces:**
- Consumes: `PAGES`, `pagePath`, `loadContent` de `pages-data.mjs`; `renderPage` de `render-page.mjs`; `renderSitemap` de `render-sitemap.mjs`
- Produces: archivos en `dist/` — no exporta nada

- [ ] **Step 1: Escribir el generador**

```javascript
// scripts/build-pages.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES, pagePath, loadContent } from './lib/pages-data.mjs';
import { renderPage } from './lib/render-page.mjs';
import { renderSitemap } from './lib/render-sitemap.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(raiz, 'dist');

const API = 'https://all.api.radio-browser.info/json/stations/search';
const LIMITE = 30;
const ESPERA_MAXIMA = 10000;

/**
 * Pide las emisoras de una página. Si la API no responde a tiempo se devuelve
 * una lista vacía: la página se publica igual y el despliegue continúa.
 */
const fetchStations = async (page) => {
    const params = new URLSearchParams({
        [page.apiParam]: page.apiValue,
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
```

- [ ] **Step 2: Encadenar el generador al build**

En `package.json`, sustituir:

```json
    "build": "vite build",
```

por:

```json
    "build": "vite build && node scripts/build-pages.mjs",
```

- [ ] **Step 3: Ejecutar el build completo**

Run: `npm run build`
Expected: la salida de Vite seguida de catorce líneas `✓ /radio/...` y `✓ /genero/...`, y el resumen final.

- [ ] **Step 4: Comprobar el resultado en disco**

Run:
```bash
ls dist/radio dist/genero
grep -c "Metropolis\|kbps" dist/radio/venezuela/index.html
grep -c "radio/venezuela" dist/sitemap.xml
```
Expected: catorce carpetas, la página de Venezuela con su listado, y la ruta presente en el sitemap.

- [ ] **Step 5: Comprobar que un fallo de red no rompe el build**

Run: `npm run build` con la red desconectada, o temporalmente con `API` apuntando a un dominio inexistente.
Expected: avisos `· sin emisoras para /radio/...`, las catorce páginas generadas igualmente y el proceso terminando con éxito.

- [ ] **Step 6: Commit**

```bash
git add scripts/build-pages.mjs package.json
git commit -m "feat: Generar las páginas de país y género durante el build"
```

---

### Task 7: La aplicación entiende los filtros de la URL

**Files:**
- Modify: `src/App.tsx` (el `useEffect` que lee `?view=`)
- Test: `src/__tests__/App.filtros-url.test.tsx`

**Interfaces:**
- Consumes: `performSearch(filters, isAISearch)` de `App.tsx` (ya existe)
- Produces: al arrancar con `?country=`, `?tag=` o `?name=`, la aplicación ejecuta esa búsqueda en lugar de la carga inicial

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/App.filtros-url.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const searchStations = vi.fn(() => Promise.resolve([
    {
        stationuuid: 'x1', name: 'Radio de Prueba', url: 'http://x', url_resolved: 'http://x',
        homepage: '', favicon: '', tags: 'jazz', country: 'Venezuela', countrycode: 'VE',
        state: '', language: 'spanish', votes: 1, codec: 'MP3', bitrate: 128, clickcount: 1,
    },
]));
const getTopStations = vi.fn(() => Promise.resolve([]));

vi.mock('@/services/radioService', () => ({ getTopStations, searchStations }));

import App from '../App';

describe('Filtros recibidos por la URL', () => {
    beforeEach(() => {
        searchStations.mockClear();
        getTopStations.mockClear();
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.useRealTimers();
        window.history.replaceState(null, '', '/');
    });

    it('busca por país cuando se llega desde /radio/venezuela', async () => {
        window.history.replaceState(null, '', '/?country=Venezuela');
        render(<App />);

        await vi.advanceTimersByTimeAsync(500);

        await waitFor(() => {
            expect(searchStations).toHaveBeenCalledWith(
                expect.objectContaining({ country: 'Venezuela' })
            );
        });
        expect(await screen.findByText('Radio de Prueba')).toBeInTheDocument();
    });

    it('busca por género cuando se llega desde /genero/jazz', async () => {
        window.history.replaceState(null, '', '/?tag=jazz');
        render(<App />);

        await vi.advanceTimersByTimeAsync(500);

        await waitFor(() => {
            expect(searchStations).toHaveBeenCalledWith(
                expect.objectContaining({ tag: 'jazz' })
            );
        });
    });

    it('busca por nombre cuando se llega desde /genero/bts', async () => {
        window.history.replaceState(null, '', '/?name=bts');
        render(<App />);

        await vi.advanceTimersByTimeAsync(500);

        await waitFor(() => {
            expect(searchStations).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'bts' })
            );
        });
    });

    it('sin parámetros de filtro carga el catálogo general y no busca', async () => {
        render(<App />);
        await vi.advanceTimersByTimeAsync(500);
        expect(searchStations).not.toHaveBeenCalled();
        expect(getTopStations).toHaveBeenCalled();
    });

    it('con filtro no lanza además la carga del catálogo general', async () => {
        window.history.replaceState(null, '', '/?country=Venezuela');
        render(<App />);
        await vi.advanceTimersByTimeAsync(500);
        expect(getTopStations).not.toHaveBeenCalled();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/App.filtros-url.test.tsx`
Expected: FAIL — `searchStations` no se llama en los tres primeros casos.

- [ ] **Step 3: Write minimal implementation**

Hoy hay dos efectos de arranque: uno llama a `loadInitialData()` y otro lee
`?view=`. Si se añadiera la búsqueda por filtro en el segundo, ambas cargas
competirían y podría ganar la del catálogo general, dejando al visitante sin su
filtro. Por eso los dos efectos se unifican en uno solo que decide qué cargar.

En `src/App.tsx`, sustituir **los dos** efectos —el que arranca `loadInitialData`
y el que interpreta `?view=`— por este único efecto:

```tsx
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Las páginas estáticas de país y género enlazan aquí con el filtro puesto,
    // para que quien llega desde un buscador empiece a escuchar en un clic.
    const country = params.get('country');
    const tag = params.get('tag');
    const name = params.get('name');

    if (country || tag || name) {
      // Esta búsqueda sustituye a la carga inicial: si se lanzaran las dos, la
      // del catálogo general podría pisar el filtro pedido.
      performSearch({
        ...(country ? { country } : {}),
        ...(tag ? { tag } : {}),
        ...(name ? { name } : {}),
      });
      return;
    }

    // Cada vista tiene su propia URL: al entrar directamente por ella (un enlace
    // compartido o un resultado de búsqueda) se abre esa sección, no la portada.
    const viewParam = params.get('view');
    if (viewParam && viewParam in ViewState) {
      const requested = ViewState[viewParam as keyof typeof ViewState];
      // Un enlace antiguo a una sección retirada abre la portada, no una
      // pantalla en blanco.
      if (requested !== ViewState.MAGAZINE || MAGAZINE_ENABLED) {
        setView(requested);
      }
    }

    // La interfaz se pinta de inmediato y el listado muestra su propio estado de
    // carga. loadInitialData gestiona sus errores, así que un fallo de la API
    // deja la aplicación usable con el aviso correspondiente.
    loadInitialData();
  }, []);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/App.filtros-url.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Comprobar que no se rompió nada**

Run: `npx vitest run`
Expected: toda la batería en verde.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/__tests__/App.filtros-url.test.tsx
git commit -m "feat: La aplicación abre con el filtro que traen las páginas de país y género"
```

---

### Task 8: Enlaces desde la aplicación

**Files:**
- Modify: `src/components/layout/Footer.tsx`
- Test: `src/components/layout/__tests__/Footer.test.tsx`

**Interfaces:**
- Consumes: nada nuevo; las rutas se escriben como literales porque el pie es JSX y `pages-data.mjs` pertenece al build
- Produces: enlaces `/radio/...` y `/genero/...` en el pie de la aplicación

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/layout/__tests__/Footer.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Footer from '../Footer';

describe('Footer', () => {
    const props = { onAboutClick: vi.fn(), onMagazineClick: vi.fn() };

    it('enlaza las páginas de país para que los buscadores las descubran', () => {
        render(<Footer {...props} />);
        expect(screen.getByRole('link', { name: 'Venezuela' })).toHaveAttribute('href', '/radio/venezuela');
        expect(screen.getByRole('link', { name: 'España' })).toHaveAttribute('href', '/radio/espana');
        expect(screen.getByRole('link', { name: 'México' })).toHaveAttribute('href', '/radio/mexico');
    });

    it('enlaza también algunos géneros', () => {
        render(<Footer {...props} />);
        expect(screen.getByRole('link', { name: 'Jazz' })).toHaveAttribute('href', '/genero/jazz');
        expect(screen.getByRole('link', { name: 'Lo-fi' })).toHaveAttribute('href', '/genero/lofi');
    });

    it('conserva los enlaces legales', () => {
        render(<Footer {...props} />);
        expect(screen.getByRole('link', { name: 'Privacidad' })).toHaveAttribute('href', '/privacy.html');
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/layout/__tests__/Footer.test.tsx`
Expected: FAIL — no existe ningún enlace con nombre "Venezuela".

- [ ] **Step 3: Write minimal implementation**

En `src/components/layout/Footer.tsx`, añadir antes del bloque del logotipo la lista de destinos y su columna:

```tsx
const PAISES = [
    { slug: 'venezuela', name: 'Venezuela' },
    { slug: 'espana', name: 'España' },
    { slug: 'usa', name: 'Estados Unidos' },
    { slug: 'mexico', name: 'México' },
    { slug: 'argentina', name: 'Argentina' },
    { slug: 'colombia', name: 'Colombia' },
];

const GENEROS = [
    { slug: 'lofi', name: 'Lo-fi' },
    { slug: 'jazz', name: 'Jazz' },
    { slug: 'rock', name: 'Rock' },
    { slug: 'dance', name: 'Dance' },
    { slug: 'latina', name: 'Música latina' },
    { slug: 'podcast', name: 'Podcasts' },
    { slug: 'electronica', name: 'Electrónica' },
    { slug: 'bts', name: 'BTS' },
];
```

Y dentro del `<div className="grid ...">`, después de la columna «Legal»:

```tsx
                    <nav className="md:col-span-3">
                        <h2 className="t-data text-[10px] text-meta-c mb-4">Radio por países</h2>
                        <ul className="flex flex-wrap gap-x-6 gap-y-2.5 text-[15px]">
                            {PAISES.map(p => (
                                <li key={p.slug}>
                                    <a href={`/radio/${p.slug}`} className="hover:text-signal transition-colors">
                                        {p.name}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <h2 className="t-data text-[10px] text-meta-c mb-4 mt-8">Por género</h2>
                        <ul className="flex flex-wrap gap-x-6 gap-y-2.5 text-[15px]">
                            {GENEROS.map(g => (
                                <li key={g.slug}>
                                    <a href={`/genero/${g.slug}`} className="hover:text-signal transition-colors">
                                        {g.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/layout/__tests__/Footer.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Footer.tsx src/components/layout/__tests__/Footer.test.tsx
git commit -m "feat: El pie enlaza las páginas de país y género"
```

---

### Task 9: Verificación completa

**Files:** ninguno nuevo

- [ ] **Step 1: Batería completa y comprobación de tipos**

Run:
```bash
npx vitest run
npx tsc --noEmit --noUnusedLocals --noUnusedParameters
npm run build
```
Expected: todos los tests en verde, sin errores de tipos, build con las catorce páginas.

- [ ] **Step 2: Revisar dos páginas en el navegador**

Servir lo compilado y abrir una de país y una de género:

```bash
npm run preview
```

Comprobar en `/radio/venezuela` y `/genero/jazz`:
- El texto de la ficha y el listado de emisoras se ven.
- El enlace «Escuchar en SonicWave» abre la aplicación **ya filtrada** por ese país o género.
- Los enlaces a las otras páginas funcionan.
- Se ve correctamente en móvil y en los dos temas.

- [ ] **Step 3: Comprobar que el contenido está en el HTML, no en el JavaScript**

Run: `curl -s http://localhost:4173/radio/venezuela | grep -c "folclore\|kbps"`
Expected: un número mayor que cero, porque el texto viaja en el HTML.

- [ ] **Step 4: Commit de cierre si hubo ajustes**

```bash
git add -A
git commit -m "test: Verificación de las páginas de país y género"
```

---

## Notas para quien ejecute el plan

- **El orden importa.** Las tareas 3 y 4 importan de la 1 y la 2; la 6 necesita la 5 para que las páginas tengan estilos.
- **Si la API responde con pocas emisoras** para un género concreto (puede pasar con `lofi` o `bts`), no es un error: la página se genera con las que haya.
- **No inventes textos.** Todo el contenido editorial sale de `src/data/contentData.ts`. Si una ficha te parece corta, díselo al responsable en vez de rellenarla.
