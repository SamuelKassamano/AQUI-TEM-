import React, { useState } from 'react';
import { X, Star, CheckCircle, MapPin, ThumbsUp, MessageCircle, Filter, Award, ShieldCheck } from 'lucide-react';
import { TESTIMONIALS } from '../data/testimonials';
import { useLanguage } from '../context/LanguageContext';
import { getTranslatedTestimonial } from '../utils/productTranslations';

export default function SocialProofModal({ isOpen, onClose }) {
  const [activeProvince, setActiveProvince] = useState('Todas');
  const [filterRating, setFilterRating] = useState('all');
  const { lang, t } = useLanguage();

  if (!isOpen) return null;

  const testimonials = TESTIMONIALS.map(item => getTranslatedTestimonial(item, lang));

  const provinces = lang === 'en'
    ? ['All', 'Luanda', 'Benguela', 'Huambo', 'Lubango', 'Cabinda']
    : ['Todas', 'Luanda', 'Benguela', 'Huambo', 'Lubango', 'Cabinda'];

  const filteredTestimonials = testimonials.filter(item => {
    const matchesProvince = activeProvince === 'Todas' || activeProvince === 'All' || item.location.includes(activeProvince);
    const matchesRating = filterRating === 'all' || item.rating === parseInt(filterRating);
    return matchesProvince && matchesRating;
  });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        style={{ maxWidth: '850px', width: '92%', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '2px solid var(--border-light)', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Award size={18} /> {t('spBadge')}
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
              {t('spTitle')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              {t('spSubtitle')}
            </p>
          </div>
          <button className="btn-close-modal" onClick={onClose} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-light)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Stats Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(255,101,0,0.08), rgba(30,92,158,0.08))',
          padding: '18px',
          borderRadius: '16px',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-orange)' }}>4.9 ★★★★★</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('spStatRating')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1E5C9E' }}>+3.800</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('spStatClients')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10B981' }}>100%</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('spStatOriginal')}</div>
          </div>
        </div>

        {/* Province Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={14} /> {lang === 'en' ? 'Filter by Province:' : 'Filtrar por Província:'}
          </span>
          {provinces.map(prov => (
            <button
              key={prov}
              onClick={() => setActiveProvince(prov)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: activeProvince === prov ? 'none' : '1px solid var(--border-light)',
                background: activeProvince === prov ? 'var(--primary-orange)' : 'var(--bg-card)',
                color: activeProvince === prov ? '#FFF' : 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {prov}
            </button>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredTestimonials.map(item => (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <img
                    src={item.avatar}
                    alt={item.name}
                    style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-orange)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {item.name}
                      {item.verified && (
                        <span style={{ color: '#10B981', display: 'inline-flex', alignItems: 'center', fontSize: '0.75rem', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                          <CheckCircle size={12} style={{ marginRight: '3px' }} /> {t('verifiedCustomer')}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={12} color="var(--primary-orange)" /> {item.location} • <span style={{ opacity: 0.8 }}>{item.date}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="#FFB800" color="#FFB800" />
                  ))}
                </div>

                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E5C9E', marginBottom: '8px', background: 'rgba(30,92,158,0.08)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>
                  📦 {item.product}
                </div>

                <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.5', fontStyle: 'italic', marginBottom: '14px' }}>
                  "{item.comment}"
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <ThumbsUp size={14} color="var(--primary-orange)" /> {item.likes} {t('helpfulReview')}
                </span>
                <span style={{ color: '#25D366', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> {t('securePurchase')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Footer */}
        <div style={{ marginTop: '28px', textAlign: 'center', background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>
            {lang === 'en' ? 'Want to place your order with the same security and speed?' : 'Quer fazer o seu pedido com a mesma segurança e rapidez?'}
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            {lang === 'en' ? 'Talk to our team on WhatsApp and receive your order anywhere in Luanda or provinces.' : 'Fale com os nossos atendentes no WhatsApp e receba em qualquer lugar de Luanda ou províncias.'}
          </p>
          <button
            onClick={() => window.open('https://wa.me/244950752933?text=Olá%20Aqui%20Tem!%20Vi%20as%20avaliações%20e%20quero%20fazer%20um%20pedido.', '_blank')}
            className="nav-btn nav-btn-orange"
            style={{ padding: '12px 28px', fontSize: '0.95rem', margin: '0 auto', display: 'inline-flex' }}
          >
            <MessageCircle size={18} /> {t('orderWhatsapp')} (950752933)
          </button>
        </div>
      </div>
    </div>
  );
}
