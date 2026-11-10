import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, RotateCcw, X, Sparkles, MessageCircle, Headphones } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function VoiceAssistantWelcome() {
  const { lang } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasSpokenOnce, setHasSpokenOnce] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  
  const utteranceRef = useRef(null);

  // Exact welcome messages requested
  const textPT = "Olá! Seja muito bem-vindo à nossa loja! É um prazer ter a sua visita. Explore a nossa variedade de produtos electrónicos, electrodomésticos e gadgets. Desejamos-lhe uma excelente experiência e boas compras! Estamos aqui para ajudar no que precisar";
  const textEN = "Hello! Welcome to our store! It's a pleasure to have you here. Explore our wide range of electronics, home appliances, and gadgets. We wish you an excellent experience and happy shopping! We are here to help whenever you need.";

  const currentText = lang === 'en' ? textEN : textPT;

  // Find best natural female voice based on language
  const getFemaleVoice = useCallback((targetLang) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const isTargetPT = targetLang !== 'en';
    const langPrefix = isTargetPT ? 'pt' : 'en';

    // 1. Prioritize female named voices for language
    const femaleKeywords = [
      'maria', 'luciana', 'francisca', 'joana', 'helena', 'raquel', 
      'fernanda', 'camila', 'vitoria', 'leticia', 'female', 'mulher',
      'samantha', 'zira', 'victoria', 'karen', 'jenny', 'fiona', 'moira'
    ];

    const matchingLangVoices = voices.filter(v => 
      v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix)
    );

    // Try finding by female keyword
    const femaleMatch = matchingLangVoices.find(v => {
      const name = (v.name || '').toLowerCase();
      return femaleKeywords.some(keyword => name.includes(keyword));
    });

    if (femaleMatch) return femaleMatch;

    // Fallback: any voice of that language
    if (matchingLangVoices.length > 0) return matchingLangVoices[0];

    return null;
  }, []);

  // Speech execution
  const speakMessage = useCallback((force = false) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (isMuted && !force) return;

    try {
      window.speechSynthesis.cancel(); // Stop any previous speech

      const utterance = new SpeechSynthesisUtterance(currentText);
      utteranceRef.current = utterance;

      utterance.lang = lang === 'en' ? 'en-US' : 'pt-PT';
      
      const chosenVoice = getFemaleVoice(lang);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      // Configure female, pleasant, welcoming voice tone
      utterance.pitch = 1.15; // Higher pitch produces a clear, friendly female tone
      utterance.rate = 0.96;  // Gentle, natural reading pace

      utterance.onstart = () => {
        setIsSpeaking(true);
        setHasSpokenOnce(true);
        setIsVisible(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (e) => {
        // If autoplay was blocked by browser policy, keep state ready for first interaction
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  }, [currentText, lang, isMuted, getFemaleVoice]);

  // Handle voices loaded in browser
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        setVoicesLoaded(true);
      }
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Automatic speaking trigger on page enter & browser interaction fallback
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user already heard this in session
    const hasAlreadyHeard = sessionStorage.getItem('aquitem_welcome_spoken');
    if (hasAlreadyHeard) {
      setHasSpokenOnce(true);
      setIsMinimized(true);
      return;
    }

    let userInteracted = false;

    // 1. Attempt immediate speech
    const timer = setTimeout(() => {
      speakMessage();
      sessionStorage.setItem('aquitem_welcome_spoken', 'true');
    }, 800);

    // 2. Attach first-interaction listener in case browser blocked autoplay audio
    const handleFirstInteraction = () => {
      if (!userInteracted) {
        userInteracted = true;
        if (!hasSpokenOnce && !isSpeaking) {
          speakMessage();
          sessionStorage.setItem('aquitem_welcome_spoken', 'true');
        }
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [voicesLoaded]);

  // Handle speech cancellation on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Toggle mute
  const toggleMute = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsMuted(true);
    } else {
      setIsMuted(false);
      speakMessage(true);
    }
  };

  // Replay speech
  const replay = () => {
    setIsMuted(false);
    setIsMinimized(false);
    speakMessage(true);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9998,
        maxWidth: isMinimized ? 'auto' : '360px',
        fontFamily: 'inherit',
        animation: 'slideInUp 0.4s ease-out'
      }}
    >
      {/* Minimized Pill Button */}
      {isMinimized ? (
        <button
          onClick={() => {
            setIsMinimized(false);
            replay();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '10px 16px',
            borderRadius: '9999px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(8px)'
          }}
          title={lang === 'en' ? 'Listen to Virtual Assistant' : 'Ouvir Assistente Virtual'}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isSpeaking ? '#22c55e' : '#3b82f6',
                display: 'inline-block',
                marginRight: '6px'
              }}
            />
            <Headphones size={16} color="#38bdf8" />
          </div>
          <span>{lang === 'en' ? 'Virtual Assistant' : 'Assistente Virtual'}</span>
          <Volume2 size={16} color="#4ade80" />
        </button>
      ) : (
        /* Full Floating Welcome Card */
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            borderRadius: '18px',
            padding: '16px',
            boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backdropFilter: 'blur(12px)',
            position: 'relative'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Female Assistant Avatar */}
              <div
                style={{
                  position: 'relative',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(236, 72, 153, 0.4)'
                }}
              >
                <span style={{ fontSize: '20px' }}>👩‍💼</span>
                {/* Active Talking Wave Indicator */}
                {isSpeaking && (
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
                      animation: 'pulse 1.5s infinite'
                    }}
                  />
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#ffffff' }}>
                    {lang === 'en' ? 'Virtual Assistant' : 'Assistente Virtual'}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    {isSpeaking ? (lang === 'en' ? 'Speaking...' : 'A Falar...') : (lang === 'en' ? 'Online' : 'Voz Feminina')}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                  {lang === 'en' ? 'AQUI TEM Angola' : 'AQUI TEM Angola'}
                </p>
              </div>
            </div>

            {/* Close / Minimize buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setIsMinimized(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={lang === 'en' ? 'Minimize' : 'Minimizar'}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Soundwave Animation while speaking */}
          {isSpeaking && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                height: '16px',
                padding: '2px 0'
              }}
            >
              {[0.4, 0.8, 1, 0.6, 0.9, 0.5, 0.7, 1, 0.6].map((scale, i) => (
                <span
                  key={i}
                  style={{
                    width: '3px',
                    height: '100%',
                    backgroundColor: '#38bdf8',
                    borderRadius: '2px',
                    display: 'inline-block',
                    animation: `soundwave 0.8s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Welcome Speech Text Box */}
          <div
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '12.5px',
              lineHeight: '1.5',
              color: '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              maxHeight: '130px',
              overflowY: 'auto'
            }}
          >
            “{currentText}”
          </div>

          {/* Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '2px' }}>
            <button
              onClick={replay}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'background 0.2s'
              }}
            >
              <RotateCcw size={13} />
              <span>{lang === 'en' ? 'Replay Speech' : 'Ouvir Novamente'}</span>
            </button>

            <button
              onClick={toggleMute}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                color: isMuted ? '#f87171' : '#94a3b8',
                border: `1px solid ${isMuted ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              <span>{isMuted ? (lang === 'en' ? 'Unmute' : 'Desmutar') : (lang === 'en' ? 'Mute' : 'Silenciar')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Embedded CSS Animations */}
      <style>{`
        @keyframes soundwave {
          0% { height: 4px; opacity: 0.4; }
          100% { height: 16px; opacity: 1; }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

