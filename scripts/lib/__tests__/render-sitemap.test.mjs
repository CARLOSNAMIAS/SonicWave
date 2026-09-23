import { describe, it, expect } from 'vitest';
import { renderSitemap } from '../render-sitemap.mjs';

describe('renderSitemap', () => {
    const xml = renderSitemap('2026-09-23');

    it('mantiene la portada y las secciones de la aplicación', () => {
        expect(xml).toContain('<loc>https://sonicwave-radio.vercel.app/</loc>');
        expect(xml).toContain('?view=EXPLORE');
        expect(xml).toContain('?view=ABOUT');
    });

    it('incluye las veintiuna páginas nuevas', () => {
        expect(xml).toContain('/radio/venezuela');
        expect(xml).toContain('/radio/colombia');
        expect(xml).toContain('/genero/salsa');
        expect(xml).toContain('/genero/bts');
        const rutas = xml.match(/\/(radio|genero)\//g) || [];
        expect(rutas).toHaveLength(21);
    });

    it('no anuncia la Revista, que está retirada', () => {
        expect(xml).not.toContain('view=MAGAZINE');
    });

    it('conserva las páginas legales y usa la fecha recibida', () => {
        expect(xml).toContain('/privacy.html');
        expect(xml).toContain('/terms.html');
        expect(xml).toContain('/cookies.html');
        expect(xml).toContain('<lastmod>2026-09-23</lastmod>');
    });
});
