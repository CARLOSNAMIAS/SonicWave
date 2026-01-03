import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PlayerBar from '../PlayerBar';
import { RadioStation } from '@/types';

const mockStation: RadioStation = {
    stationuuid: '1',
    name: 'Test Radio Station',
    url: 'http://test.url',
    favicon: '',
    country: 'TestLand',
    tags: 'test,radio'
} as RadioStation;

describe('PlayerBar', () => {
    const defaultProps = {
        currentStation: mockStation,
        isPlaying: false,
        onPlayPause: vi.fn(),
        onSkip: vi.fn(),
        volume: 0.8,
        onVolumeChange: vi.fn(),
        isLoading: false,
        audioRef: { current: null } as any,
        analyser: null,
        isFavorite: false,
        onToggleFavorite: vi.fn(),
    };

    it('renders station name correctly', () => {
        render(<PlayerBar {...defaultProps} />);
        expect(screen.getAllByText('Test Radio Station').length).toBeGreaterThan(0);
    });

    it('calls onPlayPause when play button is clicked', () => {
        render(<PlayerBar {...defaultProps} />);
        // Buscamos el botón de play por el título (aria-label o title)
        const playButton = screen.getAllByTitle('Play')[0];
        fireEvent.click(playButton);
        expect(defaultProps.onPlayPause).toHaveBeenCalled();
    });

    it('shows loading spinner when isLoading is true', () => {
        render(<PlayerBar {...defaultProps} isLoading={true} />);
        const spinners = document.querySelectorAll('.animate-spin');
        expect(spinners.length).toBeGreaterThan(0);
    });

    it('calls onToggleFavorite when favorite button is clicked', () => {
        render(<PlayerBar {...defaultProps} />);
        const favoriteButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg.lucide-heart'));
        fireEvent.click(favoriteButtons[0]);
        expect(defaultProps.onToggleFavorite).toHaveBeenCalledWith(mockStation);
    });

    it('expands on mobile when expand button is clicked', () => {
        render(<PlayerBar {...defaultProps} />);
        const expandButton = screen.getByTitle('Expand player');
        fireEvent.click(expandButton);

        // Al expandirse, debería aparecer el botón de cerrar (ChevronDown)
        expect(screen.getByTitle('Close player')).toBeInTheDocument();
    });

    it('does not render if no station is selected', () => {
        const { container } = render(<PlayerBar {...defaultProps} currentStation={null} />);
        expect(container.firstChild).toBeNull();
    });
});
