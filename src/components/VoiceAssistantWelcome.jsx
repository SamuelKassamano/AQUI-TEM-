import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function VoiceAssistantWelcome() {
  const { lang } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);
  const hasSpokenRef = useRef(false);
  const isSpeakingRef = useRef(false);

  // Exact welcome messages
  const textPT = "Olá! Seja muito bem-vindo à nossa loja! É um prazer ter a sua visita. Explore a nossa variedade de produtos electrónicos, electrodomésticos e gadgets. Desejamos-lhe uma excelente experiência e boas compras! Estamos aqui para ajudar no que precisar.";
  const textEN = "Hello! Welcome to our store! It's a pleasure to have you here. Explore our wide range of electronics, home appliances, and gadgets. We wish you an excellent experience and happy shopping! We are here to help whenever you need.";

  const currentText = lang === 'en' ? textEN : textPT;
  const audioSrc = lang === 'en' ? '/audio/welcome_en.mp3' : '/audio/welcome_pt.mp3';

  // Stop all audio & speech
  const stopAll = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {}
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    isSpeakingRef.current = false;
    setIsPlaying(false);
  }, []);

  // Web Speech API fallback
  const speakWithSynthesis = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis || isMuted) return;

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(currentText);
      utterance.lang = lang === 'en' ? 'en-US' : 'pt-PT';
      utterance.rate = 0.98;
      utterance.pitch = 1.15;

      const voices = window.speechSynthesis.getVoices() || [];
      const prefix = lang === 'en' ? 'en' : 'pt';
      const femaleKeywords = ['maria', 'luciana', 'francisca', 'joana', 'helena', 'raquel', 'fernanda', 'camila', 'female', 'mulher', 'jenny', 'samantha', 'zira', 'victoria'];
      const langVoices = voices.filter(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(prefix));
      const femaleVoice = langVoices.find(v => femaleKeywords.some(k => (v.name || '').toLowerCase().includes(k))) || langVoices[0];
      if (femaleVoice) utterance.voice = femaleVoice;

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        hasSpokenRef.current = true;
        setIsPlaying(true);
      };
      utterance.onend = () => {
        isSpeakingRef.current = false;
        setIsPlaying(false);
      };
      utterance.onerror = () => {
        isSpeakingRef.current = false;
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      isSpeakingRef.current = false;
      setIsPlaying(false);
    }
  }, [currentText, lang, isMuted]);

  // Main automatic playback trigger
  const attemptPlay = useCallback((onSuccessCleanup) => {
    if (isMuted || isSpeakingRef.current || hasSpokenRef.current) return;

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioSrc);
      } else if (audioRef.current.src !== window.location.origin + audioSrc) {
        audioRef.current.src = audioSrc;
      }

      audioRef.current.volume = 1.0;
      audioRef.current.preload = 'auto';

      audioRef.current.onplay = () => {
        isSpeakingRef.current = true;
        hasSpokenRef.current = true;
        setIsPlaying(true);
        if (typeof onSuccessCleanup === 'function') {
          onSuccessCleanup();
        }
      };

      audioRef.current.onended = () => {
        isSpeakingRef.current = false;
        setIsPlaying(false);
      };

      audioRef.current.onerror = () => {
        speakWithSynthesis();
      };

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isSpeakingRef.current = true;
            hasSpokenRef.current = true;
            setIsPlaying(true);
            if (typeof onSuccessCleanup === 'function') {
              onSuccessCleanup();
            }
          })
          .catch((err) => {
            // Autoplay with sound restricted by browser policy before first interaction.
            // Do NOT remove listeners here so any tap/click anywhere immediately unlocks audio!
          });
      }
    } catch (err) {
      speakWithSynthesis();
    }
  }, [audioSrc, isMuted, speakWithSynthesis]);

  // Initialize automatic playback and listeners
  useEffect(() => {
    hasSpokenRef.current = false;
    isSpeakingRef.current = false;

    // 1. Attempt immediate 0ms playback on page load
    attemptPlay();

    // 2. Fallback listeners for the very first interaction ANYWHERE on screen
    const handleUserGesture = () => {
      if (!hasSpokenRef.current && !isSpeakingRef.current && !isMuted) {
        attemptPlay(cleanupListeners);
      }
    };

    const cleanupListeners = () => {
      document.removeEventListener('click', handleUserGesture, true);
      document.removeEventListener('pointerdown', handleUserGesture, true);
      document.removeEventListener('touchend', handleUserGesture, true);
      document.removeEventListener('keydown', handleUserGesture, true);
      window.removeEventListener('focus', handleUserGesture, true);
    };

    // Capture phase listeners across entire document
    document.addEventListener('click', handleUserGesture, { capture: true, passive: true });
    document.addEventListener('pointerdown', handleUserGesture, { capture: true, passive: true });
    document.addEventListener('touchend', handleUserGesture, { capture: true, passive: true });
    document.addEventListener('keydown', handleUserGesture, { capture: true, passive: true });
    window.addEventListener('focus', handleUserGesture, { capture: true, passive: true });

    return () => {
      cleanupListeners();
      stopAll();
    };
  }, [lang, attemptPlay, stopAll]);

  // Chrome speech synthesis anti-stall heartbeat
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const interval = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Manual mute/unmute button
  const toggleSound = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      stopAll();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      hasSpokenRef.current = false;
      attemptPlay();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '22px',
        left: '22px',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {/* Discreet Sound Pill Button */}
      <button
        type="button"
        onClick={toggleSound}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          border: isPlaying ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.15)',
          padding: '8px 14px',
          borderRadius: '9999px',
          boxShadow: isPlaying ? '0 0 15px rgba(34, 197, 94, 0.4)' : '0 8px 20px rgba(0, 0, 0, 0.35)',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 700,
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease'
        }}
        title={
          isPlaying
            ? (lang === 'en' ? 'Mute Virtual Assistant' : 'Silenciar Assistente de Voz')
            : (lang === 'en' ? 'Play Voice' : 'Ouvir Voz de Boas-Vindas')
        }
        aria-label="Assistente de Voz"
      >
        <span style={{ fontSize: '15px' }}>👩‍💼</span>

        {isPlaying ? (
          <>
            <span style={{ color: '#22c55e' }}>{lang === 'en' ? 'Speaking...' : 'A Falar...'}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '12px' }}>
              {[0.4, 0.9, 0.5, 1, 0.6].map((scale, i) => (
                <span
                  key={i}
                  style={{
                    width: '2px',
                    height: '100%',
                    backgroundColor: '#22c55e',
                    borderRadius: '2px',
                    display: 'inline-block',
                    animation: 'voiceMiniWave 0.6s ease-in-out infinite alternate',
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <span>{isMuted ? <VolumeX size={14} color="#f87171" /> : <Volume2 size={14} color="#38bdf8" />}</span>
        )}
      </button>

      <style>{`
        @keyframes voiceMiniWave {
          0% { height: 3px; }
          100% { height: 12px; }
        }
      `}</style>
    </div>
  );
}
