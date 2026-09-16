import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useSEO } from '../useSEO';

describe('useSEO', () => {
    beforeEach(() => {
        document.head.innerHTML = `
            <link rel="canonical" href="https://sonicwave-radio.vercel.app/" />
            <meta name="description" content="inicial" />
            <meta property="og:title" content="inicial" />
            <meta property="og:url" content="https://sonicwave-radio.vercel.app/" />
            <meta property="og:description" content="inicial" />
        `;
    });

    it('pone el título y la descripción de la vista', () => {
        renderHook(() => useSEO({ title: 'Revista | SonicWave', description: 'Horóscopo sonoro y novedades.' }));

        expect(document.title).toBe('Revista | SonicWave');
        expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content'))
            .toBe('Horóscopo sonoro y novedades.');
        expect(document.head.querySelector('meta[property="og:title"]')?.getAttribute('content'))
            .toBe('Revista | SonicWave');
    });

    it('apunta la URL canónica a la vista, no a la portada', () => {
        renderHook(() => useSEO({ title: 'Radio por países', path: '/?view=EXPLORE' }));

        expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'))
            .toBe('https://sonicwave-radio.vercel.app/?view=EXPLORE');
        expect(document.head.querySelector('meta[property="og:url"]')?.getAttribute('content'))
            .toBe('https://sonicwave-radio.vercel.app/?view=EXPLORE');
    });

    it('deja la canónica intacta en vistas sin URL propia', () => {
        renderHook(() => useSEO({ title: 'Tus emisoras | SonicWave' }));

        expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'))
            .toBe('https://sonicwave-radio.vercel.app/');
    });

    it('crea la etiqueta canónica si el documento no la trae', () => {
        document.head.innerHTML = '';
        renderHook(() => useSEO({ title: 'Qué es SonicWave', path: '/?view=ABOUT' }));

        expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'))
            .toBe('https://sonicwave-radio.vercel.app/?view=ABOUT');
    });
});
