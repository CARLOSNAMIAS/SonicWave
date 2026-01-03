import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSpeech } from '../useSpeech';

describe('useSpeech', () => {
    beforeEach(() => {
        localStorage.clear();
        // Mock de window.speechSynthesis
        const mockSpeak = vi.fn();
        const mockCancel = vi.fn();
        const mockGetVoices = vi.fn().mockReturnValue([]);

        vi.stubGlobal('speechSynthesis', {
            speak: mockSpeak,
            cancel: mockCancel,
            getVoices: mockGetVoices,
        });

        // Mock de SpeechSynthesisUtterance
        vi.stubGlobal('SpeechSynthesisUtterance', vi.fn().mockImplementation(function (this: any, text) {
            this.text = text;
            this.lang = '';
            this.voice = null;
            this.rate = 1;
            this.pitch = 1;
            this.onstart = null;
            this.onend = null;
            this.onerror = null;
        }));
    });

    it('should initialize with muted false by default', () => {
        const { result } = renderHook(() => useSpeech());
        expect(result.current.isMuted).toBe(false);
    });

    it('should call speak when not muted', () => {
        const { result } = renderHook(() => useSpeech());
        act(() => {
            result.current.speak('Hola Carlos');
        });
        expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('should not call speak when muted', () => {
        const { result } = renderHook(() => useSpeech());
        act(() => {
            result.current.toggleMute();
        });
        expect(result.current.isMuted).toBe(true);

        act(() => {
            result.current.speak('Hola Carlos');
        });
        expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('should cancel speech when stop is called', () => {
        const { result } = renderHook(() => useSpeech());
        act(() => {
            result.current.stop();
        });
        expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    });
});
