import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// La API de emisoras falla: el escenario que dejaba la aplicación inutilizable.
vi.mock('@/services/radioService', () => ({
    getTopStations: vi.fn(() => Promise.reject(new Error('HTTP 500: Internal Server Error'))),
    searchStations: vi.fn(() => Promise.reject(new Error('HTTP 500: Internal Server Error'))),
}));

import App from '../App';

describe('Arranque de la aplicación con la API caída', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('muestra la interfaz de inmediato, sin pantalla de carga que la tape', () => {
        render(<App />);

        // Sin esperar a los datos: la página ya está ahí.
        expect(screen.getAllByText('Sonicwave').length).toBeGreaterThan(0);
        // La navegación está presente tanto en la barra como en el menú móvil.
        expect(screen.getAllByRole('link', { name: 'Explorar' }).length).toBeGreaterThan(0);
        expect(document.getElementById('initial-splash')).toBeNull();
    });

    it('explica el fallo en lugar de quedarse en blanco', async () => {
        render(<App />);

        await vi.advanceTimersByTimeAsync(2000);

        await waitFor(() => {
            expect(screen.getByText(/no se pudo cargar/i)).toBeInTheDocument();
        });
    });

    it('deja escuchables las emisoras locales cuando el catálogo mundial no responde', async () => {
        render(<App />);

        await vi.advanceTimersByTimeAsync(2000);

        await waitFor(() => {
            expect(screen.getByText('Metropolis 103.9 FM')).toBeInTheDocument();
        });
    });
});
