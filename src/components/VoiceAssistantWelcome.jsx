import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function VoiceAssistantWelcome() {
  const { lang } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);
  const hasSpokenRef = useRef(false);
  const audioUnlockedRef = useRef(false);

  // Exact welcome texts
  const textPT = "Olá, seja muito bem-vindo à nossa loja! É um prazer ter a sua visita. Explore a nossa variedade de produtos eletrónicos, eletrodomésticos e gadgets. Desejamos-lhe uma excelente experiência e boas compras, estamos aqui para ajudar no que precisar!";
  const textEN = "Hello, welcome to our store! It is a pleasure to have you here. Explore our wide range of electronics, home appliances, and gadgets. We wish you an excellent experience and happy shopping, we are here to help whenever you need!";

  const currentText = lang === 'en' ? textEN : textPT;
  const audioSrc = lang === 'en' ? '/audio/welcome_en.mp3' : '/audio/welcome_pt.mp3';

  // Stop all audio & synthesis
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
    setIsPlaying(false);
  }, []);

  // Web Speech API fallback
  const speakWithSynthesis = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis || isMuted) return;

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(currentText);
      utterance.lang = lang === 'en' ? 'en-US' : 'pt-BR';
      utterance.rate = 1.05;
      utterance.pitch = 1.1;

      const voices = window.speechSynthesis.getVoices() || [];
      const prefix = lang === 'en' ? 'en' : 'pt';
      const femaleKeywords = ['francisca', 'luciana', 'maria', 'leticia', 'fernanda', 'camila', 'helena', 'jenny', 'samantha', 'zira', 'victoria', 'female'];
      const langVoices = voices.filter(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(prefix));
      const femaleVoice = langVoices.find(v => femaleKeywords.some(k => (v.name || '').toLowerCase().includes(k))) || langVoices[0];
      if (femaleVoice) utterance.voice = femaleVoice;

      utterance.onstart = () => {
        hasSpokenRef.current = true;
        setIsPlaying(true);
      };
      utterance.onend = () => {
        setIsPlaying(false);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsPlaying(false);
    }
  }, [currentText, lang, isMuted]);

  // Play audio safely
  const startPlayback = useCallback(() => {
    if (isMuted || hasSpokenRef.current) return;

    // Mobile AudioContext unlock helper
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass && !audioUnlockedRef.current) {
        const audioCtx = new AudioContextClass();
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        audioUnlockedRef.current = true;
      }
    } catch (e) {}

    const el = audioRef.current;
    if (!el) return;

    el.volume = 1.0;

    const playPromise = el.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          hasSpokenRef.current = true;
          setIsPlaying(true);
        })
        .catch((err) => {
          // If browser policy blocked unprompted autoplay, fallback listeners will catch the first touch
          // Do nothing here so it doesn't break
        });
    }
  }, [isMuted]);

  // Main effect: attempt autoplay + background unlock on touch/click
  useEffect(() => {
    hasSpokenRef.current = false;

    // 1. Immediate execution on mount (desktop autoplay)
    const timer = setTimeout(() => {
      startPlayback();
    }, 150);

    // 2. Mobile and gesture unlock: triggered synchronously on the very first touch or click
    const handleFirstGesture = () => {
      if (!hasSpokenRef.current && !isMuted) {
        startPlayback();
      }
      cleanupGestureListeners();
    };

    const cleanupGestureListeners = () => {
      window.removeEventListener('touchstart', handleFirstGesture, true);
      window.removeEventListener('touchend', handleFirstGesture, true);
      window.removeEventListener('pointerdown', handleFirstGesture, true);
      window.removeEventListener('click', handleFirstGesture, true);
      window.removeEventListener('keydown', handleFirstGesture, true);
    };

    window.addEventListener('touchstart', handleFirstGesture, { capture: true, passive: true });
    window.addEventListener('touchend', handleFirstGesture, { capture: true, passive: true });
    window.addEventListener('pointerdown', handleFirstGesture, { capture: true, passive: true });
    window.addEventListener('click', handleFirstGesture, { capture: true, passive: true });
    window.addEventListener('keydown', handleFirstGesture, { capture: true, passive: true });

    return () => {
      clearTimeout(timer);
      cleanupGestureListeners();
      stopAll();
    };
  }, [lang, startPlayback, stopAll, isMuted]);

  // Handle audio element events
  const handleAudioPlay = () => {
    hasSpokenRef.current = true;
    setIsPlaying(true);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    speakWithSynthesis();
  };

  // Toggle sound manually
  const toggleSound = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      stopAll();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      hasSpokenRef.current = false;
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          hasSpokenRef.current = true;
        }).catch(() => {
          speakWithSynthesis();
        });
      } else {
        speakWithSynthesis();
      }
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
      {/* Native HTML5 Audio element mounted directly into DOM for full iOS/Android compatibility */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="allow"
        onPlay={handleAudioPlay}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        style={{ display: 'none' }}
      />

      {/* Discreet Sound Status Button */}
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
          transition: 'all 0.2s ease',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent'
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
