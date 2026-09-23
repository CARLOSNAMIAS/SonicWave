import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Las fichas con texto propio de contentData.ts.
 *
 * - `slug` y `section` componen la dirección pública.
 * - `contentKey` y `contentType` localizan la ficha dentro de contentData.
 * - `apiParam` y `apiValue` sirven tanto para pedir emisoras a Radio Browser
 *   como para construir el enlace que abre la aplicación con ese filtro.
 */
export const PAGES = [
    { slug: 'venezuela', section: 'radio', name: 'Venezuela', contentKey: 'Venezuela', contentType: 'country', apiParam: 'country', apiValue: 'Venezuela' },
    { slug: 'colombia', section: 'radio', name: 'Colombia', contentKey: 'Colombia', contentType: 'country', apiParam: 'country', apiValue: 'Colombia' },
    { slug: 'mexico', section: 'radio', name: 'México', contentKey: 'Mexico', contentType: 'country', apiParam: 'country', apiValue: 'Mexico' },
    { slug: 'argentina', section: 'radio', name: 'Argentina', contentKey: 'Argentina', contentType: 'country', apiParam: 'country', apiValue: 'Argentina' },
    { slug: 'espana', section: 'radio', name: 'España', contentKey: 'Spain', contentType: 'country', apiParam: 'country', apiValue: 'Spain' },
    { slug: 'usa', section: 'radio', name: 'Estados Unidos', contentKey: 'USA', contentType: 'country', apiParam: 'country', apiValue: 'USA', query: { countrycode: 'US' } },
    { slug: 'salsa', section: 'genero', name: 'Salsa', contentKey: 'salsa', contentType: 'tag', apiParam: 'tag', apiValue: 'salsa' },
    { slug: 'reggaeton', section: 'genero', name: 'Reguetón', contentKey: 'reggaeton', contentType: 'tag', apiParam: 'tag', apiValue: 'reggaeton' },
    { slug: 'cumbia', section: 'genero', name: 'Cumbia', contentKey: 'cumbia', contentType: 'tag', apiParam: 'tag', apiValue: 'cumbia' },
    { slug: 'bachata', section: 'genero', name: 'Bachata', contentKey: 'bachata', contentType: 'tag', apiParam: 'tag', apiValue: 'bachata' },
    { slug: 'vallenato', section: 'genero', name: 'Vallenato', contentKey: 'vallenato', contentType: 'tag', apiParam: 'tag', apiValue: 'vallenato' },
    { slug: 'latina', section: 'genero', name: 'Música latina', contentKey: 'latin', contentType: 'tag', apiParam: 'tag', apiValue: 'latin' },
    { slug: 'rock', section: 'genero', name: 'Rock', contentKey: 'rock', contentType: 'tag', apiParam: 'tag', apiValue: 'rock' },
    { slug: 'rap', section: 'genero', name: 'Rap', contentKey: 'hip-hop', contentType: 'tag', apiParam: 'tag', apiValue: 'hip-hop' },
    { slug: 'electronica', section: 'genero', name: 'Electrónica', contentKey: 'electronic', contentType: 'tag', apiParam: 'tag', apiValue: 'electronic' },
    { slug: 'jazz', section: 'genero', name: 'Jazz', contentKey: 'jazz', contentType: 'tag', apiParam: 'tag', apiValue: 'jazz' },
    { slug: 'dance', section: 'genero', name: 'Música para bailar', contentKey: 'dance', contentType: 'tag', apiParam: 'tag', apiValue: 'dance' },
    { slug: 'lofi', section: 'genero', name: 'Lo-fi', contentKey: 'lofi', contentType: 'tag', apiParam: 'tag', apiValue: 'lofi' },
    { slug: 'tranquila', section: 'genero', name: 'Música tranquila', contentKey: 'chillout', contentType: 'tag', apiParam: 'tag', apiValue: 'chillout' },
    { slug: 'podcast', section: 'genero', name: 'Pódcast', contentKey: 'podcast', contentType: 'tag', apiParam: 'tag', apiValue: 'podcast' },
    { slug: 'bts', section: 'genero', name: 'BTS', contentKey: 'bts', contentType: 'tag', apiParam: 'name', apiValue: 'bts' },
];

/**
 * Filtro con el que se piden las emisoras a Radio Browser. Normalmente coincide
 * con el del enlace a la aplicación; `query` lo sustituye cuando la API conoce
 * el país por otro nombre (igual que hace radioService en la aplicación).
 */
export const stationQuery = (page) => page.query || { [page.apiParam]: page.apiValue };

/** Dirección pública de una página, sin el dominio. */
export const pagePath = (page) => `/${page.section}/${page.slug}`;

/** Resuelve el alias `@/` igual que Vite; esta versión de esbuild no trae `alias`. */
const aliasArroba = {
    name: 'alias-arroba',
    setup(build) {
        build.onResolve({ filter: /^@\// }, async (args) => {
            const destino = path.join(raiz, 'src', args.path.slice(2));
            return build.resolve('./' + path.basename(destino), {
                resolveDir: path.dirname(destino),
                kind: args.kind,
            });
        });
    },
};

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
        plugins: [aliasArroba],
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
