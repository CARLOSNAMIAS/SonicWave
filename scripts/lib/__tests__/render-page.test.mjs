import { describe, it, expect } from 'vitest';
import { renderPage } from '../render-page.mjs';
import { PAGES } from '../pages-data.mjs';

const page = PAGES.find(p => p.slug === 'venezuela');

const content = {
    title: 'Radio de Venezuela en vivo',
    description: 'Escucha las emisoras de Venezuela en vivo: noticias desde Caracas, salsa, merengue, gaita y la música llanera.',
    funFact: '¿Sabías que la gaita zuliana es uno de los géneros más escuchados en Navidad?',
};

const stations = [
    { name: 'Metropolis 103.9 FM', country: 'Venezuela', countrycode: 'VE', bitrate: 128, homepage: 'https://metropolis1039fm.com/' },
    { name: 'La Chiquinquireña 90.9 FM', country: 'Venezuela', countrycode: 'VE', bitrate: 128, homepage: '' },
];

const render = (extra = {}) => renderPage({ page, content, stations, allPages: PAGES, ...extra });

describe('renderPage', () => {
    it('escribe el texto de la ficha dentro del HTML', () => {
        const html = render();
        expect(html).toContain('<h1>Radio de Venezuela en vivo</h1>');
        expect(html).toContain('música llanera');
        expect(html).toContain('gaita zuliana');
    });

    it('usa el título de la ficha en la pestaña, sin repetir palabras', () => {
        expect(render()).toContain('<title>Radio de Venezuela en vivo | SonicWave</title>');
    });

    it('lista cada emisora con su nombre y su calidad', () => {
        const html = render();
        expect(html).toContain('Metropolis 103.9 FM');
        expect(html).toContain('La Chiquinquireña 90.9 FM');
        expect(html).toContain('128 kbps');
    });

    it('sigue siendo una página válida cuando la API no devolvió emisoras', () => {
        const html = render({ stations: [] });
        expect(html).toContain('Radio de Venezuela en vivo');
        expect(html).toContain('música llanera');
        expect(html).not.toContain('<ol');
        expect(html).toContain('Escuchar en SonicWave');
    });

    it('enlaza a las demás páginas y nunca a sí misma', () => {
        const html = render();
        expect(html).toContain('/genero/jazz');
        expect(html).toContain('/genero/salsa');
        expect(html).toContain('/radio/espana');
        expect(html).not.toContain('href="/radio/venezuela"');
    });

    it('lleva al visitante a la aplicación con el filtro puesto', () => {
        expect(render()).toContain('href="/?country=Venezuela"');
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
        const html = render({
            stations: [{ name: '<b>Pirata</b> "FM"', country: 'Venezuela', countrycode: 'VE', bitrate: 96, homepage: '' }],
        });
        expect(html).toContain('&lt;b&gt;Pirata&lt;/b&gt;');
        expect(html).not.toContain('<b>Pirata</b>');
    });

    it('no deja que un nombre cierre el bloque de datos estructurados', () => {
        const html = render({
            stations: [{ name: '</script><script>alert(1)</script>', country: 'VE', countrycode: 'VE', bitrate: 96, homepage: '' }],
        });
        expect(html).not.toContain('</script><script>alert(1)');
    });

    it('incluye la cabecera necesaria para buscadores y anuncios', () => {
        const html = render();
        expect(html).toContain('<html lang="es-419">');
        expect(html).toContain('rel="canonical" href="https://sonicwave-radio.vercel.app/radio/venezuela"');
        expect(html).toContain('google-adsense-account');
        expect(html).toContain('ca-pub-6983431049380018');
        expect(html).toContain('/pages.css');
    });

    it('muestra solo el código del país, no el nombre largo en inglés de la API', () => {
        const html = render({
            stations: [{ name: 'Radio X', country: 'The Bolivarian Republic Of Venezuela', countrycode: 'VE', bitrate: 128, homepage: '' }],
        });
        expect(html).not.toContain('Bolivarian');
        expect(html).toContain('>VE<');
    });

    it('limpia los espacios del nombre y no repite emisoras', () => {
        const html = render({
            stations: [
                { name: '		Radio Rumbos 670 AM', countrycode: 'VE', bitrate: 32 },
                { name: 'RADIO RUMBOS 670 AM ', countrycode: 'VE', bitrate: 32 },
                { name: 'La Mega', countrycode: 'VE', bitrate: 64 },
            ],
        });
        expect(html).toContain('<span class="station-name">Radio Rumbos 670 AM</span>');
        expect(html.match(/class="station"/g)).toHaveLength(2);
        const datos = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
        expect(datos.mainEntity.itemListElement).toHaveLength(2);
    });
});
