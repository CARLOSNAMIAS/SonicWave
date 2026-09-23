import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { searchStations, getTopStations } = vi.hoisted(() => ({
    searchStations: vi.fn(() => Promise.resolve([
        {
            stationuuid: 'x1', name: 'Radio de Prueba', url: 'http://x', url_resolved: 'http://x',
            homepage: '', favicon: '', tags: 'jazz', country: 'Venezuela', countrycode: 'VE',
            state: '', language: 'spanish', votes: 1, codec: 'MP3', bitrate: 128, clickcount: 1,
        },
    ])),
    getTopStations: vi.fn(() => Promise.resolve([])),
}));

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
        expect((await screen.findAllByText('Radio de Prueba')).length).toBeGreaterThan(0);
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
