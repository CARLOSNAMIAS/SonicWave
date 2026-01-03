import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAudioPlayer } from '../useAudioPlayer';
import { RadioStation } from '@/types';

// Mock de RadioStation
const mockStation: RadioStation = {
    stationuuid: '123',
    name: 'Test Radio',
    url: 'http://test.url',
    url_resolved: 'http://test.url',
    favicon: '',
    tags: '',
    country: 'TestLand',
    votes: 0,
    codec: 'MP3',
    bitrate: 128
};

describe('useAudioPlayer', () => {
    let playSpy: any;
    let pauseSpy: any;
    let loadSpy: any;

    beforeEach(() => {
        localStorage.clear();

        // Mock de HTMLAudioElement
        playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
        pauseSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => { });
        loadSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'load').mockImplementation(() => { });

        // Mock de AudioContext si es necesario (aunque es más complejo mockear el grafo de audio)
        window.AudioContext = vi.fn().mockImplementation(() => ({
            createAnalyser: vi.fn().mockReturnValue({ fftSize: 0, connect: vi.fn() }),
            createMediaElementSource: vi.fn().mockReturnValue({ connect: vi.fn() }),
            destination: {},
            resume: vi.fn().mockResolvedValue(undefined),
            state: 'running'
        })) as any;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useAudioPlayer());

        expect(result.current.currentStation).toBeNull();
        expect(result.current.isPlaying).toBe(false);
        expect(result.current.volume).toBe(0.8);
    });

    it('should play a station when handlePlayPause is called with a new station', () => {
        const { result } = renderHook(() => useAudioPlayer());

        act(() => {
            result.current.handlePlayPause(mockStation);
        });

        expect(result.current.currentStation).toEqual(mockStation);
        expect(result.current.isPlaying).toBe(true);
    });

    it('should toggle play/pause when the same station is provided', () => {
        const { result } = renderHook(() => useAudioPlayer());

        act(() => {
            result.current.handlePlayPause(mockStation);
        });
        expect(result.current.isPlaying).toBe(true);

        act(() => {
            result.current.handlePlayPause(mockStation);
        });
        expect(result.current.isPlaying).toBe(false);
    });

    it('should change volume and persist to localStorage', () => {
        const { result } = renderHook(() => useAudioPlayer());

        // El efecto de volumen depende de que audioRef.current exista
        act(() => {
            if (result.current.audioRef) {
                (result.current.audioRef as any).current = document.createElement('audio');
            }
        });

        act(() => {
            result.current.setVolume(0.5);
        });

        expect(result.current.volume).toBe(0.5);
        expect(localStorage.getItem('sonicwave_volume')).toBe('0.5');
    });

    it('should stop player when stopPlayer is called', () => {
        const { result } = renderHook(() => useAudioPlayer());

        act(() => {
            result.current.handlePlayPause(mockStation);
        });
        expect(result.current.isPlaying).toBe(true);

        act(() => {
            result.current.stopPlayer();
        });

        expect(result.current.isPlaying).toBe(false);
        expect(result.current.currentStation).toBeNull();
    });
});
