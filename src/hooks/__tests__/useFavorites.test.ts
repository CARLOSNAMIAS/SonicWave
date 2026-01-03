import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useFavorites } from '../useFavorites';
import { RadioStation } from '@/types';

const mockStation: RadioStation = {
    stationuuid: 'fav-123',
    name: 'Favorite Radio',
    url: 'http://fav.url',
} as RadioStation;

describe('useFavorites', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should initialize with empty favorites', () => {
        const { result } = renderHook(() => useFavorites());
        expect(result.current[0]).toEqual([]);
    });

    it('should add a station to favorites', () => {
        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current[1](mockStation); // toggleFavorite
        });

        expect(result.current[0]).toHaveLength(1);
        expect(result.current[0][0].stationuuid).toBe('fav-123');
        expect(localStorage.getItem('sonicwave_favs')).toContain('fav-123');
    });

    it('should remove a station from favorites if already present', () => {
        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current[1](mockStation); // Add
        });
        expect(result.current[0]).toHaveLength(1);

        act(() => {
            result.current[1](mockStation); // Remove
        });
        expect(result.current[0]).toHaveLength(0);
        expect(JSON.parse(localStorage.getItem('sonicwave_favs') || '[]')).toHaveLength(0);
    });
});
