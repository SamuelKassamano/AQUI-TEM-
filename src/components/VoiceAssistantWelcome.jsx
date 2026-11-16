import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const WELCOME_SESSION_KEY = 'aquitem_voice_welcomed_v1';

export default function VoiceAssistantWelcome() {
  const { lang } = useLanguage();
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);
  const fallbackAudioRef = useRef(null);
  const hasSpokenRef = useRef(false);
  const cleanupListenersRef = useRef(null);

  // Exact welcome texts
  const textPT = "Olá, seja muito bem-vindo à nossa loja! É um prazer ter a sua visita. Explore a nossa variedade de produtos eletrónicos, eletrodomésticos e gadgets. Desejamos-lhe uma excelente experiência e boas compras, estamos aqui para ajudar no que precisar!";
  const textEN = "Hello, welcome to our store! It is a pleasure to have you here. Explore our wide range of electronics, home appliances, and gadgets. We wish you an excellent experience and happy shopping, we are here to help whenever you need!";

  const currentText = lang === 'en' ? textEN : textPT;
  const audioSrc = lang === 'en' ? '/audio/welcome_en.mp3' : '/audio/welcome_pt.mp3';

  // Check if voice already played in this browser session
  const hasWelcomedThisSession = () => {
    try {
      return sessionStorage.getItem(WELCOME_SESSION_KEY) === 'true';
    } catch (e) {
      return false;
    }
  };

  // Mark session so it never speaks automatically again on other pages or returns
  const markWelcomedInSession = () => {
    try {
      sessionStorage.setItem(WELCOME_SESSION_KEY, 'true');
    } catch (e) {}
  };

  // Stop all audio & synthesis
  const stopAll = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {}
    }
    if (fallbackAudioRef.current) {
      try {
        fallbackAudioRef.current.pause();
        fallbackAudioRef.current.currentTime = 0;
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
        markWelcomedInSession();
        if (cleanupListenersRef.current) cleanupListenersRef.current();
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

  // Main playback trigger
  const playNow = useCallback(() => {
    if (isMuted || hasSpokenRef.current) return;

    const el = audioRef.current;
    if (el) {
      el.volume = 1.0;
      const promise = el.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            hasSpokenRef.current = true;
            setIsPlaying(true);
            markWelcomedInSession();
            if (cleanupListenersRef.current) cleanupListenersRef.current();
          })
          .catch((err) => {
            // If DOM audio fails or blocked, try fallback Audio instance
            try {
              if (!fallbackAudioRef.current) {
                fallbackAudioRef.current = new Audio(audioSrc);
              }
              fallbackAudioRef.current.volume = 1.0;
              const fPromise = fallbackAudioRef.current.play();
              if (fPromise !== undefined) {
                fPromise
                  .then(() => {
                    hasSpokenRef.current = true;
                    setIsPlaying(true);
                    markWelcomedInSession();
                    if (cleanupListenersRef.current) cleanupListenersRef.current();
                  })
                  .catch(() => {
                    // Waiting for first user gesture
                  });
              }
            } catch (e) {
              // Keep listeners waiting
            }
          });
      }
    }
  }, [audioSrc, isMuted]);

  // Initialize playback + background unlock ONLY ON THE HOME PAGE and ONLY ONCE
  useEffect(() => {
    // If not on Home page ("/") or if already welcomed in this session, do NOT auto-play!
    const isHomePage = location.pathname === '/' || location.pathname === '';
    const alreadyWelcomed = hasWelcomedThisSession();

    if (!isHomePage || alreadyWelcomed) {
      // Don't auto-trigger speech on secondary pages
      return;
    }

    hasSpokenRef.current = false;

    // Load audio element
    if (audioRef.current) {
      try {
        audioRef.current.load();
      } catch (e) {}
    }

    // 1. Immediate attempt on Home page
    playNow();
    const t1 = setTimeout(playNow, 300);

    // 2. Gesture unlock: triggers on first touch, click, scroll, tap on Home page
    const handleGesture = () => {
      if (!hasSpokenRef.current && !isMuted && !hasWelcomedThisSession()) {
        playNow();
      }
    };

    cleanupListenersRef.current = () => {
      window.removeEventListener('pointerdown', handleGesture, true);
      window.removeEventListener('touchstart', handleGesture, true);
      window.removeEventListener('touchend', handleGesture, true);
      window.removeEventListener('click', handleGesture, true);
      window.removeEventListener('scroll', handleGesture, true);
      window.removeEventListener('keydown', handleGesture, true);
    };

    // Attach listeners with capture
    window.addEventListener('pointerdown', handleGesture, { capture: true, passive: true });
    window.addEventListener('touchstart', handleGesture, { capture: true, passive: true });
    window.addEventListener('touchend', handleGesture, { capture: true, passive: true });
    window.addEventListener('click', handleGesture, { capture: true, passive: true });
    window.addEventListener('scroll', handleGesture, { capture: true, passive: true });
    window.addEventListener('keydown', handleGesture, { capture: true, passive: true });

    return () => {
      clearTimeout(t1);
      if (cleanupListenersRef.current) cleanupListenersRef.current();
      stopAll();
    };
  }, [location.pathname, lang, playNow, stopAll, isMuted]);

  // Handle route change: when user navigates away from any page, stop current audio
  useEffect(() => {
    stopAll();
  }, [location.pathname, stopAll]);

  // Audio element events
  const handleAudioPlay = () => {
    hasSpokenRef.current = true;
    setIsPlaying(true);
    markWelcomedInSession();
    if (cleanupListenersRef.current) cleanupListenersRef.current();
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    // If MP3 fails to load, fallback to SpeechSynthesis
    speakWithSynthesis();
  };

  // Toggle sound manually (user can still click to hear anytime)
  const toggleSound = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isPlaying) {
      stopAll();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      hasSpokenRef.current = false;
      const el = audioRef.current;
      if (el) {
        el.currentTime = 0;
        el.play()
          .then(() => {
            setIsPlaying(true);
            hasSpokenRef.current = true;
            markWelcomedInSession();
          })
          .catch(() => {
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
      {/* 
        Native HTML5 Audio element mounted in the active render tree 
        (NOT display: none, so mobile Safari & Chrome never deactivate or pause it)
      */}
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
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '1px',
          height: '1px',
          opacity: 0.01,
          pointerEvents: 'none',
          zIndex: -9999
        }}
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
