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

  // Stop any ongoing playback
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

  // Web Speech API execution (ensuring voices are ready)
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

  // Main automatic playback: runs MP3 studio neural voice, falls back immediately to Web Speech API
  const startSpeakingAutomatically = useCallback(() => {
    if (isMuted || isSpeakingRef.current) return;

    // Try HTML5 Audio (studio neural voice)
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioSrc);
      } else {
        audioRef.current.src = audioSrc;
      }

      audioRef.current.volume = 1.0;
      audioRef.current.preload = 'auto';

      audioRef.current.onplay = () => {
        isSpeakingRef.current = true;
        hasSpokenRef.current = true;
        setIsPlaying(true);
      };
      audioRef.current.onended = () => {
        isSpeakingRef.current = false;
        setIsPlaying(false);
      };
      audioRef.current.onerror = () => {
        // If MP3 fails, immediately speak with SpeechSynthesis
        speakWithSynthesis();
      };

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isSpeakingRef.current = true;
            hasSpokenRef.current = true;
            setIsPlaying(true);
          })
          .catch((err) => {
            // If browser blocks audio.play(), immediately attempt Web Speech API without waiting for any click!
            speakWithSynthesis();
          });
      }
    } catch (err) {
      speakWithSynthesis();
    }
  }, [audioSrc, isMuted, speakWithSynthesis]);

  // Global automatic triggers on page access
  useEffect(() => {
    hasSpokenRef.current = false;
    isSpeakingRef.current = false;

    // 1. Immediate trigger on component mount
    const timer1 = setTimeout(() => {
      startSpeakingAutomatically();
    }, 150);

    // 2. Trigger on voice ready (Chrome populates getVoices asynchronously)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        if (!hasSpokenRef.current && !isSpeakingRef.current) {
          startSpeakingAutomatically();
        }
      };
    }

    // 3. Invisible passive trigger on ANY subtle mouse move, hover, scroll, focus, or touch
    // (Notice: does NOT require clicking anything! Even moving the cursor triggers it instantly)
    const passiveAutoTrigger = () => {
      if (!hasSpokenRef.current && !isSpeakingRef.current && !isMuted) {
        startSpeakingAutomatically();
      }
      removePassiveListeners();
    };

    const removePassiveListeners = () => {
      window.removeEventListener('mousemove', passiveAutoTrigger);
      window.removeEventListener('pointermove', passiveAutoTrigger);
      window.removeEventListener('mouseenter', passiveAutoTrigger);
      window.removeEventListener('scroll', passiveAutoTrigger);
      window.removeEventListener('focus', passiveAutoTrigger);
      window.removeEventListener('touchstart', passiveAutoTrigger);
      window.removeEventListener('wheel', passiveAutoTrigger);
      window.removeEventListener('keydown', passiveAutoTrigger);
    };

    window.addEventListener('mousemove', passiveAutoTrigger, { passive: true, once: true });
    window.addEventListener('pointermove', passiveAutoTrigger, { passive: true, once: true });
    window.addEventListener('mouseenter', passiveAutoTrigger, { passive: true, once: true });
    window.addEventListener('scroll', passiveAutoTrigger, { passive: true, once: true });
    window.addEventListener('focus', passiveAutoTrigger, { passive: true, once: true });
    window.addEventListener('touchstart', passiveAutoTrigger, { passive: true, once: true });
    window.addEventListener('wheel', passiveAutoTrigger, { passive: true, once: true });
    window.addEventListener('keydown', passiveAutoTrigger, { passive: true, once: true });

    return () => {
      clearTimeout(timer1);
      removePassiveListeners();
      stopAll();
    };
  }, [lang, startSpeakingAutomatically, stopAll]);

  // Keep SpeechSynthesis alive (fixes Chrome 15-second speech synthesis pause bug)
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

  // Toggle mute / unmute button
  const toggleSound = () => {
    if (isPlaying) {
      stopAll();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      startSpeakingAutomatically();
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
      {/* Discreet Sound Button (no popup, no menu, automatic speech) */}
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
