"use client";

import { useState, useEffect, useCallback } from 'react';

interface TTSOptions {
    pitch?: number;
    rate?: number;
    volume?: number;
    voiceIndex?: number;
}

export const useTTS = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const loadVoices = () => {
            const vs = window.speechSynthesis.getVoices();
            setVoices(vs);
        };

        loadVoices();

        // Chrome loads voices asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const speak = useCallback((text: string, options: TTSOptions = {}) => {
        if (isMuted || !text) return;

        // Cancel previous speech to avoid queue buildup during fast simulation
        // window.speechSynthesis.cancel(); 

        const utterance = new SpeechSynthesisUtterance(text);

        // Default options
        utterance.pitch = options.pitch ?? 1.0;
        utterance.rate = options.rate ?? 1.0;
        utterance.volume = options.volume ?? 0.8;

        // Pick a decent voice. English preferred.
        // If voiceIndex is provided, try to use it to differentiate agents.
        if (voices.length > 0) {
            const englishVoices = voices.filter(v => v.lang.startsWith('en'));
            const targetPool = englishVoices.length > 0 ? englishVoices : voices;

            // rudimentary "hash" to pick a voice based on index/agentID if we had one
            const idx = options.voiceIndex ? options.voiceIndex % targetPool.length : 0;
            utterance.voice = targetPool[idx];
        }

        window.speechSynthesis.speak(utterance);
    }, [voices, isMuted]);

    const cancel = useCallback(() => {
        window.speechSynthesis.cancel();
    }, []);

    return { speak, cancel, isMuted, setIsMuted, voices };
};
