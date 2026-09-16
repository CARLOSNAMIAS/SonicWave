import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SkeletonCard from '../SkeletonCard';

describe('SkeletonCard', () => {
    it('renders correctly', () => {
        const { container } = render(<SkeletonCard />);

        // Verificar que el contenedor principal existe
        const skeleton = container.firstChild;
        expect(skeleton).toBeInTheDocument();

        // Verificar que tiene las clases de animación pulse
        const animatedElements = container.querySelectorAll('.animate-pulse');
        expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('has the correct structure', () => {
        const { container } = render(<SkeletonCard />);

        // Verificar que hay al menos 3 bloques de skeleton (carátula + 2 líneas de texto)
        const blocks = container.querySelectorAll('.skeleton-block');
        expect(blocks.length).toBe(3);
    });
});
