import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Footer from '../Footer';

describe('Footer', () => {
    const props = { onAboutClick: vi.fn(), onMagazineClick: vi.fn() };

    it('enlaza las páginas de país para que los buscadores las descubran', () => {
        render(<Footer {...props} />);
        expect(screen.getByRole('link', { name: 'Venezuela' })).toHaveAttribute('href', '/radio/venezuela');
        expect(screen.getByRole('link', { name: 'España' })).toHaveAttribute('href', '/radio/espana');
        expect(screen.getByRole('link', { name: 'México' })).toHaveAttribute('href', '/radio/mexico');
    });

    it('enlaza también los géneros', () => {
        render(<Footer {...props} />);
        expect(screen.getByRole('link', { name: 'Salsa' })).toHaveAttribute('href', '/genero/salsa');
        expect(screen.getByRole('link', { name: 'Vallenato' })).toHaveAttribute('href', '/genero/vallenato');
        expect(screen.getByRole('link', { name: 'Jazz' })).toHaveAttribute('href', '/genero/jazz');
        expect(screen.getByRole('link', { name: 'Lo-fi' })).toHaveAttribute('href', '/genero/lofi');
    });

    it('conserva los enlaces legales', () => {
        render(<Footer {...props} />);
        expect(screen.getByRole('link', { name: 'Privacidad' })).toHaveAttribute('href', '/privacy.html');
    });
});
