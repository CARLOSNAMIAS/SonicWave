import { useState, useCallback, useEffect } from 'react';

/**
 * A custom hook to handle Text-to-Speech (TTS) using the Web Speech API.
 * It manages voice selection, speaking state, and cancellation.
 */
export const useSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isMuted, setIsMuted] = useState(() => {
        const stored = localStorage.getItem('sonicwave_ai_muted');
        return stored === 'true';
    });

    // Load voices and listen for changes
    useEffect(() => {
        const loadVoices = () => {
            if (window.speechSynthesis) {
                setVoices(window.speechSynthesis.getVoices());
            }
        };

        loadVoices();
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    // Persist mute state
    useEffect(() => {
        localStorage.setItem('sonicwave_ai_muted', isMuted.toString());
    }, [isMuted]);

    const stop = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (!window.speechSynthesis || isMuted) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Refresh voices list
        const availableVoices = window.speechSynthesis.getVoices();

        // Priority Search for Female Spanish Voices
        // 1. Specifically Microsoft Salome (Premium Windows Female)
        let selectedVoice = availableVoices.find(v => (v.name.includes('Salome') || v.name.includes('Salomé')) && v.lang.startsWith('es'));

        // 2. Microsoft Helena (Standard Windows Female Spanish)
        if (!selectedVoice) {
            selectedVoice = availableVoices.find(v => v.name.includes('Helena') && v.lang.startsWith('es'));
        }

        // 3. Microsoft Sabina (Standard Windows Female Spanish)
        if (!selectedVoice) {
            selectedVoice = availableVoices.find(v => v.name.includes('Sabina') && v.lang.startsWith('es'));
        }

        // 4. Google Español (Google Female Spanish)
        if (!selectedVoice) {
            selectedVoice = availableVoices.find(v => v.name.includes('Google') && v.lang.startsWith('es'));
        }

        // 5. Any Spanish voice that does NOT contain "Male", "David", "Dario", "Pablo", "Raul"
        if (!selectedVoice) {
            const maleNames = ['male', 'david', 'dario', 'pablo', 'raul'];
            selectedVoice = availableVoices.find(v =>
                v.lang.startsWith('es') &&
                !maleNames.some(name => v.name.toLowerCase().includes(name))
            );
        }

        // 6. Last resort: Any Spanish voice
        if (!selectedVoice) {
            selectedVoice = availableVoices.find(v => v.lang.startsWith('es'));
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log("Selected Voice:", selectedVoice.name);
        }

        utterance.rate = 0.95; // Slightly slower for more natural feel
        utterance.pitch = 1.15; // Slightly higher for female tone

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [isMuted]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            if (!prev) stop(); // Stop immediately if muting
            return !prev;
        });
    }, [stop]);

    return {
        speak,
        stop,
        isSpeaking,
        isMuted,
        toggleMute
    };
};
