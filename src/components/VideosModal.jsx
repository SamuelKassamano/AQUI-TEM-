import React, { useState } from 'react';
import { X, Play, MapPin, Store, Video, MessageCircle, Award, CheckCircle2, Volume2, ShieldCheck } from 'lucide-react';
import { PRODUCT_VIDEOS } from '../data/videos';

export default function VideosModal({ isOpen, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  if (!isOpen) return null;

  const categories = ['Todas', 'Áudio & Headphones', 'Smartwatches', 'Carregadores & Powerbanks', 'Eletrodomésticos', 'Acessórios & Casa'];

  const filteredVideos = selectedCategory === 'Todas'
    ? PRODUCT_VIDEOS
    : PRODUCT_VIDEOS.filter(v => v.category === selectedCategory);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        style={{ maxWidth: '960px', width: '92%', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '2px solid var(--border-light)', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Video size={18} /> Vídeos & Unboxings de Produtos Oraimo
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
              Vídeos em Ação & Demonstrações Reais
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              Assista aos unboxings, testes de qualidade e funcionalidades dos produtos da <strong>Aqui Tem</strong> rodando ao vivo.
            </p>
          </div>
          <button className="btn-close-modal" onClick={onClose} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-light)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                border: selectedCategory === cat ? 'none' : '1px solid var(--border-light)',
                background: selectedCategory === cat ? 'linear-gradient(135deg, #FF6500, #E55800)' : 'var(--bg-card)',
                color: selectedCategory === cat ? '#FFF' : 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: selectedCategory === cat ? 'var(--shadow-orange)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Videos Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
          {filteredVideos.map(item => (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
              }}
            >
              <div>
                <div style={{ position: 'relative', background: '#0F172A', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
                  {/* HTML5 Native Video Tag - Playing automatically and continuously */}
                  <video
                    key={`${item.id}-${item.videoUrl}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    preload="metadata"
                    style={{
                      width: '100%',
                      height: '210px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  >
                    <source src={item.videoUrl} type="video/mp4" />
                    {item.fallbackUrl && <source src={item.fallbackUrl} type="video/mp4" />}
                    Seu navegador não suporta a reprodução deste vídeo.
                  </video>
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(0,0,0,0.8)',
                    color: '#FFB800',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    pointerEvents: 'none',
                    letterSpacing: '0.5px'
                  }}>
                    {item.tag}
                  </span>
                </div>

                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--primary-orange)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                    {item.category}
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: '1.3', marginBottom: '8px' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '12px' }}>
                    {item.description}
                  </p>
                </div>
              </div>

              <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--border-light)' }}>
                <button
                  onClick={() => {
                    const msg = encodeURIComponent(`Olá AQUI TEM! Vi o vídeo de unboxing do produto "${item.productName}" no site e quero comprar.`);
                    window.open(`https://wa.me/244950752933?text=${msg}`, '_blank');
                  }}
                  className="nav-btn nav-btn-orange"
                  style={{ width: '100%', padding: '10px 14px', fontSize: '0.85rem', justifyContent: 'center' }}
                >
                  <MessageCircle size={16} /> Comprar no WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div style={{ marginTop: '28px', textAlign: 'center', background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>
            Quer ver mais vídeos de demonstração ou testes ao vivo?
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            A nossa equipe no WhatsApp envia vídeos em tempo real de qualquer produto antes do envio!
          </p>
          <button
            onClick={() => window.open('https://wa.me/244950752933?text=Olá%20Aqui%20Tem!%20Quero%20ver%20mais%20vídeos%20de%20produtos.', '_blank')}
            className="nav-btn nav-btn-orange"
            style={{ padding: '12px 28px', fontSize: '0.95rem', margin: '0 auto', display: 'inline-flex' }}
          >
            <MessageCircle size={18} /> Pedir Vídeo no WhatsApp 950752933
          </button>
        </div>
      </div>
    </div>
  );
}
