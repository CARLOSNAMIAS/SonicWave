import { describe, it, expect } from 'vitest';
import { PAGES, pagePath, loadContent } from '../pages-data.mjs';

describe('pages-data', () => {
    it('describe veintiuna páginas, seis de país y quince de género', () => {
        expect(PAGES).toHaveLength(21);
        expect(PAGES.filter(p => p.section === 'radio')).toHaveLength(6);
        expect(PAGES.filter(p => p.section === 'genero')).toHaveLength(15);
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
        expect(rutas).toContain('/genero/salsa');
        expect(rutas).toContain('/genero/vallenato');
    });

    it('busca BTS por nombre, no por etiqueta', () => {
        const bts = PAGES.find(p => p.slug === 'bts');
        expect(bts.apiParam).toBe('name');
        expect(bts.apiValue).toBe('bts');
    });

    it('carga el texto real de cada ficha desde contentData', async () => {
        const fichas = await loadContent();
        expect(fichas.size).toBe(21);
        expect(fichas.get('venezuela').title).toBe('Radio de Venezuela en vivo');
        expect(fichas.get('venezuela').funFact).toMatch(/gaita zuliana/);
        expect(fichas.get('jazz').description.length).toBeGreaterThan(40);
        expect(fichas.get('reggaeton').title).toBe('Radio de reguetón en vivo');
        expect(fichas.get('rap').title).toBe('Radio de rap en vivo');
    });

    it('solo publica fichas con texto propio, nunca el genérico', async () => {
        const fichas = await loadContent();
        for (const [slug, ficha] of fichas) {
            expect(ficha.description, slug).not.toMatch(/^Descubre las emisoras especializadas/);
        }
    });
});
