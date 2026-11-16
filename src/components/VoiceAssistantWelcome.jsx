import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, RotateCcw, X, Headphones, Play, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function VoiceAssistantWelcome() {
  const { lang } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const audioRef = useRef(null);
  const synthRef = useRef(null);

  // Exact welcome messages
  const textPT = "Olá! Seja muito bem-vindo à nossa loja! É um prazer ter a sua visita. Explore a nossa variedade de produtos electrónicos, electrodomésticos e gadgets. Desejamos-lhe uma excelente experiência e boas compras! Estamos aqui para ajudar no que precisar";
  const textEN = "Hello! Welcome to our store! It's a pleasure to have you here. Explore our wide range of electronics, home appliances, and gadgets. We wish you an excellent experience and happy shopping! We are here to help whenever you need.";

  const currentText = lang === 'en' ? textEN : textPT;
  const audioSrc = lang === 'en' ? '/audio/welcome_en.mp3' : '/audio/welcome_pt.mp3';

  // Stop all sounds
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

  // Web Speech API fallback if audio file cannot play
  const playSpeechSynthesis = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentText);
      synthRef.current = utterance;
      utterance.lang = lang === 'en' ? 'en-US' : 'pt-PT';
      utterance.rate = 0.96;
      utterance.pitch = 1.15;

      const voices = window.speechSynthesis.getVoices() || [];
      const prefix = lang === 'en' ? 'en' : 'pt';
      const femaleKeywords = ['maria', 'luciana', 'francisca', 'joana', 'helena', 'raquel', 'fernanda', 'camila', 'female', 'mulher', 'jenny', 'samantha', 'zira', 'victoria'];
      const langVoices = voices.filter(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(prefix));
      const femaleVoice = langVoices.find(v => femaleKeywords.some(k => (v.name || '').toLowerCase().includes(k))) || langVoices[0];
      if (femaleVoice) utterance.voice = femaleVoice;

      utterance.onstart = () => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
      };
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsPlaying(false);
    }
  }, [currentText, lang]);

  // Main play function: tries MP3 first, then SpeechSynthesis fallback
  const playWelcomeAudio = useCallback((userInitiated = false) => {
    if (isMuted && !userInitiated) return;

    stopAll();

    try {
      const audio = new Audio(audioSrc);
      audioRef.current = audio;
      audio.volume = 1.0;

      audio.onplay = () => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
      };
      audio.onended = () => {
        setIsPlaying(false);
      };
      audio.onerror = () => {
        // Fallback to browser SpeechSynthesis
        playSpeechSynthesis();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          })
          .catch((err) => {
            console.log('Autoplay deferred until user interaction:', err?.name);
            setAutoplayBlocked(true);
            setIsPlaying(false);
            if (userInitiated) {
              playSpeechSynthesis();
            }
          });
      }
    } catch (err) {
      playSpeechSynthesis();
    }
  }, [audioSrc, isMuted, stopAll, playSpeechSynthesis]);

  // Attempt play on mount and listen for first interaction if autoplay was gated
  useEffect(() => {
    let triggered = false;

    // Small delay to let page stabilize
    const timer = setTimeout(() => {
      playWelcomeAudio(false);
    }, 600);

    const handleFirstInteraction = () => {
      if (!triggered) {
        triggered = true;
        // If it wasn't already playing, play now that user has interacted
        if (!audioRef.current || audioRef.current.paused) {
          playWelcomeAudio(true);
        }
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true, once: true });
    window.addEventListener('click', handleFirstInteraction, { passive: true, once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true, once: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true, once: true });

    return () => {
      clearTimeout(timer);
      cleanup();
      stopAll();
    };
  }, [lang]);

  // Mute / Unmute handler
  const handleToggleMute = () => {
    if (isPlaying) {
      stopAll();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      playWelcomeAudio(true);
    }
  };

  // Replay handler
  const handleReplay = () => {
    setIsMuted(false);
    setIsMinimized(false);
    playWelcomeAudio(true);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label={lang === 'en' ? 'Virtual Voice Assistant' : 'Assistente Virtual de Voz'}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9998,
        maxWidth: isMinimized ? 'auto' : '360px',
        width: isMinimized ? 'auto' : 'calc(100vw - 48px)',
        fontFamily: 'inherit',
        animation: 'welcomeSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Minimized Pill Button */}
      {isMinimized ? (
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false);
            handleReplay();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            padding: '10px 18px',
            borderRadius: '9999px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.2)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 700,
            backdropFilter: 'blur(10px)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          title={lang === 'en' ? 'Listen to Virtual Assistant' : 'Ouvir Assistente Virtual'}
        >
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isPlaying ? '#22c55e' : '#38bdf8',
              display: 'inline-block',
              boxShadow: isPlaying ? '0 0 10px #22c55e' : 'none'
            }}
          />
          <Headphones size={16} color="#38bdf8" />
          <span>{lang === 'en' ? 'Virtual Assistant' : 'Assistente Virtual'}</span>
          <Volume2 size={16} color="#22c55e" />
        </button>
      ) : (
        /* Full Floating Welcome Card */
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            borderRadius: '20px',
            padding: '16px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backdropFilter: 'blur(16px)',
            position: 'relative'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Animated Avatar */}
              <div
                style={{
                  position: 'relative',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #38bdf8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isPlaying ? '0 0 20px rgba(236, 72, 153, 0.6)' : '0 0 10px rgba(56, 189, 248, 0.3)',
                  flexShrink: 0
                }}
              >
                <span style={{ fontSize: '22px' }}>👩‍💼</span>
                {isPlaying && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#22c55e',
                      border: '2px solid #0f172a',
                      boxShadow: '0 0 8px #22c55e'
                    }}
                  />
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#ffffff' }}>
                    {lang === 'en' ? 'Virtual Assistant' : 'Assistente Virtual'}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: isPlaying ? 'rgba(34, 197, 94, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                      color: isPlaying ? '#4ade80' : '#38bdf8',
                      padding: '2px 7px',
                      borderRadius: '12px',
                      border: `1px solid ${isPlaying ? 'rgba(34, 197, 94, 0.4)' : 'rgba(56, 189, 248, 0.3)'}`
                    }}
                  >
                    {isPlaying
                      ? (lang === 'en' ? 'Speaking...' : 'A Falar...')
                      : (lang === 'en' ? 'AI Voice' : 'Voz Feminina IA')}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                  AQUI TEM Angola • Boas-vindas
                </p>
              </div>
            </div>

            {/* Minimize / Close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                title={lang === 'en' ? 'Minimize' : 'Minimizar'}
                aria-label="Minimizar"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Soundwave Animation while speaking */}
          {isPlaying && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                height: '18px',
                padding: '2px 0'
              }}
            >
              {[0.4, 0.8, 1, 0.6, 0.9, 0.5, 0.7, 1, 0.6, 0.8].map((scale, i) => (
                <span
                  key={i}
                  style={{
                    width: '3px',
                    height: '100%',
                    backgroundColor: '#38bdf8',
                    borderRadius: '2px',
                    display: 'inline-block',
                    animation: `assistantSoundwave 0.7s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Welcome Speech Text Box */}
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '12.5px',
              lineHeight: '1.55',
              color: '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              maxHeight: '120px',
              overflowY: 'auto'
            }}
          >
            “{currentText}”
          </div>

          {/* Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '2px' }}>
            <button
              type="button"
              onClick={handleReplay}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: isPlaying ? 'rgba(56, 189, 248, 0.15)' : '#0284c7',
                color: '#ffffff',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                padding: '8px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                transition: 'all 0.2s ease'
              }}
            >
              {isPlaying ? <RotateCcw size={13} /> : <Play size={13} />}
              <span>{isPlaying ? (lang === 'en' ? 'Replay' : 'Repetir') : (lang === 'en' ? 'Play Voice' : 'Ouvir Voz IA')}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleMute}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.12)',
                color: isMuted ? '#f87171' : '#cbd5e1',
                border: `1px solid ${isMuted ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.1)'}`,
                padding: '8px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                transition: 'all 0.2s ease'
              }}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isMuted ? (lang === 'en' ? 'Unmute' : 'Desmutar') : (lang === 'en' ? 'Mute' : 'Silenciar')}</span>
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes assistantSoundwave {
          0% { height: 3px; opacity: 0.3; }
          100% { height: 18px; opacity: 1; }
        }
        @keyframes welcomeSlideIn {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </aside>
  );
}
