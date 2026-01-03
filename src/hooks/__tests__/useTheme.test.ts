import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTheme } from '../useTheme';

describe('useTheme', () => {
    beforeEach(() => {
        // Limpiar localStorage y clases del DOM antes de cada test
        localStorage.clear();
        document.documentElement.classList.remove('dark');
        vi.clearAllMocks();
    });

    it('should initialize with dark theme by default', () => {
        const { result } = renderHook(() => useTheme());
        expect(result.current[0]).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should initialize with light theme if stored in localStorage', () => {
        localStorage.setItem('sonicwave_theme', 'light');
        const { result } = renderHook(() => useTheme());
        expect(result.current[0]).toBe('light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should toggle theme from dark to light', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current[1](); // toggleTheme
        });

        expect(result.current[0]).toBe('light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(localStorage.getItem('sonicwave_theme')).toBe('light');
    });

    it('should toggle theme from light to dark', () => {
        localStorage.setItem('sonicwave_theme', 'light');
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current[1](); // toggleTheme
        });

        expect(result.current[0]).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.getItem('sonicwave_theme')).toBe('dark');
    });
});
