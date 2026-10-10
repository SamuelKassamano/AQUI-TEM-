import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSelector({ variant = 'default', className = '' }) {
  const { lang, setLang, t } = useLanguage();

  if (variant === 'compact') {
    return (
      <button
        onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
        title={t('selectLanguage')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.15)',
          color: '#FFF',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          fontSize: '0.8rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        className={className}
      >
        <Globe size={14} />
        <span>{lang === 'pt' ? '🇦🇴 PT' : '🇬🇧 EN'}</span>
      </button>
    );
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: '30px',
        background: 'var(--bg-body, #F8FAFC)',
        border: '1px solid var(--border-light, #E2E8F0)',
        borderRadius: '20px',
        padding: '2px',
        gap: '2px'
      }}
      className={className}
    >
      <button
        onClick={() => setLang('pt')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '16px',
          border: 'none',
          background: lang === 'pt' ? 'var(--primary-orange, #FF6500)' : 'transparent',
          color: lang === 'pt' ? '#FFF' : 'var(--text-muted, #64748B)',
          fontWeight: lang === 'pt' ? 800 : 600,
          fontSize: '0.74rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: lang === 'pt' ? '0 2px 6px rgba(255, 101, 0, 0.3)' : 'none'
        }}
      >
        <span style={{ fontSize: '0.85rem' }}>🇦🇴</span> PT
      </button>

      <button
        onClick={() => setLang('en')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '16px',
          border: 'none',
          background: lang === 'en' ? 'var(--primary-orange, #FF6500)' : 'transparent',
          color: lang === 'en' ? '#FFF' : 'var(--text-muted, #64748B)',
          fontWeight: lang === 'en' ? 800 : 600,
          fontSize: '0.74rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: lang === 'en' ? '0 2px 6px rgba(255, 101, 0, 0.3)' : 'none'
        }}
      >
        <span style={{ fontSize: '0.85rem' }}>🇬🇧</span> EN
      </button>
    </div>
  );
}
