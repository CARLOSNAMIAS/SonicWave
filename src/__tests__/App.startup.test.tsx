import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// La API de emisoras falla: es el escenario que dejaba la pantalla de carga congelada.
vi.mock('@/services/radioService', () => ({
    getTopStations: vi.fn(() => Promise.reject(new Error('HTTP 500: Internal Server Error'))),
    searchStations: vi.fn(() => Promise.reject(new Error('HTTP 500: Internal Server Error'))),
}));

import App from '../App';

describe('Arranque de la aplicación con la API caída', () => {
    beforeEach(() => {
        const splash = document.createElement('div');
        splash.id = 'initial-splash';
        document.body.appendChild(splash);
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.useRealTimers();
        document.getElementById('initial-splash')?.remove();
    });

    it('retira la pantalla de carga aunque la API falle', async () => {
        render(<App />);

        await vi.advanceTimersByTimeAsync(4000);

        await waitFor(() => {
            expect(document.getElementById('initial-splash')).toBeNull();
        });
    });

    it('muestra la aplicación y explica el fallo en lugar de quedarse en blanco', async () => {
        render(<App />);

        await vi.advanceTimersByTimeAsync(4000);

        // La cabecera está presente: la aplicación arrancó.
        expect(screen.getAllByText('Sonicwave').length).toBeGreaterThan(0);

        // Y el problema se le cuenta a quien mira la pantalla.
        await waitFor(() => {
            expect(screen.getByText(/no se pudo cargar/i)).toBeInTheDocument();
        });
    });
});
