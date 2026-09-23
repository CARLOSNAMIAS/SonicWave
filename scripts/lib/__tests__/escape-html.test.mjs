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
