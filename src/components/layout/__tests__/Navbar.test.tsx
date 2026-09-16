import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../Navbar';
import { ViewState } from '@/types';

const props = {
    view: ViewState.HOME,
    setView: vi.fn(),
    onLogoClick: vi.fn(),
    onOpenMenu: vi.fn(),
    toggleTheme: vi.fn(),
    theme: 'dark',
    onOpenAIModal: vi.fn(),
    isSpeaking: false,
};

describe('Navbar', () => {
    it('rinde la navegación como enlaces que un buscador puede seguir', () => {
        render(<Navbar {...props} />);

        // Los buscadores no siguen <button>: cada sección necesita su href.
        expect(screen.getByRole('link', { name: 'Explorar' })).toHaveAttribute('href', '/?view=EXPLORE');
        expect(screen.getByRole('link', { name: 'Favoritos' })).toHaveAttribute('href', '/?view=FAVORITES');
        expect(screen.getByRole('link', { name: 'Sobre nosotros' })).toHaveAttribute('href', '/?view=ABOUT');
        expect(screen.getByRole('link', { name: 'Descubrir' })).toHaveAttribute('href', '/');
    });

    it('cambia de vista sin recargar la página al hacer clic', () => {
        const setView = vi.fn();
        render(<Navbar {...props} setView={setView} />);

        const enlace = screen.getByRole('link', { name: 'Explorar' });
        const evento = new MouseEvent('click', { bubbles: true, cancelable: true });
        fireEvent(enlace, evento);

        expect(setView).toHaveBeenCalledWith(ViewState.EXPLORE);
        expect(evento.defaultPrevented).toBe(true);
    });

    it('deja pasar la navegación del navegador al abrir en otra pestaña', () => {
        const setView = vi.fn();
        render(<Navbar {...props} setView={setView} />);

        const enlace = screen.getByRole('link', { name: 'Explorar' });
        const evento = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
        fireEvent(enlace, evento);

        expect(setView).not.toHaveBeenCalled();
        expect(evento.defaultPrevented).toBe(false);
    });

    it('no enlaza la Revista mientras está retirada', () => {
        render(<Navbar {...props} />);
        expect(screen.queryByRole('link', { name: 'Revista' })).toBeNull();
    });
});
