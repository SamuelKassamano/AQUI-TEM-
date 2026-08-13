import React from 'react';

export default function Logo({ size = 'medium', className = '' }) {
  const iconSize = size === 'small' ? 36 : size === 'large' ? 56 : 46;
  const fontSize = size === 'small' ? '1.2rem' : size === 'large' ? '1.8rem' : '1.5rem';
  const sloganSize = size === 'small' ? '0.55rem' : size === 'large' ? '0.72rem' : '0.64rem';

  return (
    <div className={`logo-brand-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
      {/* 100% Transparent SVG Logo - No White Background */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 4px 12px rgba(243, 112, 33, 0.3))' }}
      >
        {/* Transparent background - NO rectangle fill */}
        
        {/* Orange Shopping Bag / Box Icon */}
        <rect x="16" y="32" width="68" height="56" rx="14" fill="url(#brandOrangeGrad)" />
        
        {/* Handle in Deep Blue */}
        <path
          d="M36 32V24C36 16.268 42.268 10 50 10C57.732 10 64 16.268 64 24V32"
          stroke="#1E5C9E"
          strokeWidth="7"
          strokeLinecap="round"
        />
        
        {/* White Checkmark / Sparkle inside */}
        <path
          d="M36 58L46 68L64 48"
          stroke="#FFFFFF"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <defs>
          <linearGradient id="brandOrangeGrad" x1="16" y1="32" x2="84" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F37021" />
            <stop offset="1" stopColor="#D95D12" />
          </linearGradient>
        </defs>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: fontSize,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.5px',
          color: '#1E5C9E'
        }}>
          AQUI<span style={{ color: '#F37021' }}>TEM</span>
        </span>
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: sloganSize,
          fontWeight: 800,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginTop: '2px'
        }}>
          tudo em um só lugar
        </span>
      </div>
    </div>
  );
}
