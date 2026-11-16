import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function VoiceAssistantWelcome() {
  const { lang } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);
  const userInteractedRef = useRef(false);

  // Exact welcome messages
  const textPT = "Olá! Seja muito bem-vindo à nossa loja! É um prazer ter a sua visita. Explore a nossa variedade de produtos electrónicos, electrodomésticos e gadgets. Desejamos-lhe uma excelente experiência e boas compras! Estamos aqui para ajudar no que precisar";
  const textEN = "Hello! Welcome to our store! It's a pleasure to have you here. Explore our wide range of electronics, home appliances, and gadgets. We wish you an excellent experience and happy shopping! We are here to help whenever you need.";

  const currentText = lang === 'en' ? textEN : textPT;
  const audioSrc = lang === 'en' ? '/audio/welcome_en.mp3' : '/audio/welcome_pt.mp3';

  // Stop any playing sound
  const stopAudio = useCallback(() => {
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
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
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

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsPlaying(false);
    }
  }, [currentText, lang]);

  // Main play function: plays the studio AI audio directly
  const playAudio = useCallback(() => {
    if (isMuted) return;

    stopAudio();

    try {
      const audio = new Audio(audioSrc);
      audioRef.current = audio;
      audio.volume = 1.0;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        // Fallback to browser SpeechSynthesis
        speakWithSynthesis();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Autoplay delayed by browser policy: register one-shot gesture listeners
            const unlockAndPlay = () => {
              if (!userInteractedRef.current && !isMuted) {
                userInteractedRef.current = true;
                audio.play().then(() => setIsPlaying(true)).catch(() => speakWithSynthesis());
              }
              cleanup();
            };

            const cleanup = () => {
              window.removeEventListener('pointerdown', unlockAndPlay);
              window.removeEventListener('click', unlockAndPlay);
              window.removeEventListener('touchstart', unlockAndPlay);
              window.removeEventListener('scroll', unlockAndPlay);
              window.removeEventListener('keydown', unlockAndPlay);
            };

            window.addEventListener('pointerdown', unlockAndPlay, { passive: true, once: true });
            window.addEventListener('click', unlockAndPlay, { passive: true, once: true });
            window.addEventListener('touchstart', unlockAndPlay, { passive: true, once: true });
            window.addEventListener('scroll', unlockAndPlay, { passive: true, once: true });
            window.addEventListener('keydown', unlockAndPlay, { passive: true, once: true });
          });
      }
    } catch (err) {
      speakWithSynthesis();
    }
  }, [audioSrc, isMuted, stopAudio, speakWithSynthesis]);

  // Trigger automatically when page loads or when language changes
  useEffect(() => {
    userInteractedRef.current = false;

    // Trigger immediate automatic speech
    const timer = setTimeout(() => {
      playAudio();
    }, 400);

    return () => {
      clearTimeout(timer);
      stopAudio();
    };
  }, [lang]);

  // Toggle mute / unmute button
  const toggleSound = () => {
    if (isPlaying) {
      stopAudio();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      userInteractedRef.current = true;
      if (audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => speakWithSynthesis());
      } else {
        playAudio();
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
      {/* Discreet Sound Button (No menu, no permission prompt) */}
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
