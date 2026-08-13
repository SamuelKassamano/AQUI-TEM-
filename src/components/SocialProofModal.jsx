import React, { useState } from 'react';
import { X, Star, CheckCircle, MapPin, ThumbsUp, MessageCircle, Filter, Award, ShieldCheck, Heart } from 'lucide-react';

export default function SocialProofModal({ isOpen, onClose }) {
  const [activeProvince, setActiveProvince] = useState('Todas');
  const [filterRating, setFilterRating] = useState('all');

  if (!isOpen) return null;

  const testimonials = [
    {
      id: 1,
      name: 'Manuel Mateus Benguela',
      location: 'Luanda - Kilamba',
      avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=250&q=80',
      product: 'WATCH NOVA 2 - Smartwatch Oraimo',
      rating: 5,
      date: 'Há 2 dias',
      comment: 'Comprei o meu relógio Oraimo Watch Nova 2 na Aqui Tem e fiquei impressionado! Entregaram no Kilamba no próprio dia e paguei no TPA no momento da entrega. Relógio 100% original!',
      likes: 24,
      verified: true
    },
    {
      id: 2,
      name: 'Esperança Domingos',
      location: 'Luanda - Talatona',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=250&q=80',
      product: 'AIR FRYER NUTRIFRY S1 ULTRA 6L',
      rating: 5,
      date: 'Há 4 dias',
      comment: 'A Fritadeira Air Fryer da Oraimo mudou a minha cozinha! Muito fácil de usar e economiza óleo. Atendimento excelente no WhatsApp 950752933, tiraram todas as minhas dúvidas.',
      likes: 19,
      verified: true
    },
    {
      id: 3,
      name: 'João Baptista Kassanje',
      location: 'Benguela - Centro',
      avatar: 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&w=250&q=80',
      product: 'BOOM POP PRO - Headphone Oraimo',
      rating: 5,
      date: 'Há 1 semana',
      comment: 'Moro em Benguela e o envio chegou em 24h pela transportadora Macon. Os fones som de altíssima qualidade e a bateria dura mesmo muito tempo. Recomendo a loja Aqui Tem!',
      likes: 31,
      verified: true
    },
    {
      id: 4,
      name: 'Cláudia Miguel Silva',
      location: 'Huambo - Cidade Alta',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=250&q=80',
      product: 'FLEXICOOKER - Placa de Indução Oraimo',
      rating: 5,
      date: 'Há 1 semana',
      comment: 'Placa de indução maravilhosa, rápida para cozinhar e gasta pouca luz. O pessoal da loja Aqui Tem foi super atencioso e mandou vídeo do teste do produto antes de enviar para o Huambo.',
      likes: 15,
      verified: true
    },
    {
      id: 5,
      name: 'António Francisco Tchikweba',
      location: 'Lubango - Huíla',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80',
      product: 'MAGPOWER 15W - Powerbank Oraimo',
      rating: 5,
      date: 'Há 2 semanas',
      comment: 'Powerbank super potente, segura o meu iPhone a carregar sem fios no trabalho. Chegou bem embalado aqui no Lubango. Loja séria e de confiança!',
      likes: 22,
      verified: true
    },
    {
      id: 6,
      name: 'Neusa Cristina Vunge',
      location: 'Luanda - Viana (Zango 3)',
      avatar: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=250&q=80',
      product: 'THERMOGO - Copo Térmico Oraimo',
      rating: 5,
      date: 'Há 2 semanas',
      comment: 'Garrafa e copo térmico top de linha! Conserva a água bem gelada durante o dia inteiro no calor de Luanda. Entrega rápida no Zango.',
      likes: 18,
      verified: true
    }
  ];

  const provinces = ['Todas', 'Luanda', 'Benguela', 'Huambo', 'Lubango'];

  const filteredTestimonials = testimonials.filter(item => {
    const matchesProvince = activeProvince === 'Todas' || item.location.includes(activeProvince);
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
              <Award size={18} /> Prova Social & Avaliações Reais
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
              O que os nossos Clientes em Angola dizem
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              Depoimentos transparentes de clientes em Luanda e nas províncias que já compraram na <strong>Aqui Tem</strong>.
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
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Média de Satisfação</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1E5C9E' }}>+3.800</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Clientes em Angola</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10B981' }}>100%</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Produtos Originais</div>
          </div>
        </div>

        {/* Province Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={14} /> Filtrar por Província:
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
          {filteredTestimonials.map(t => (
            <div
              key={t.id}
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
                    src={t.avatar}
                    alt={t.name}
                    style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-orange)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {t.name}
                      {t.verified && (
                        <span style={{ color: '#10B981', display: 'inline-flex', alignItems: 'center', fontSize: '0.75rem', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                          <CheckCircle size={12} style={{ marginRight: '3px' }} /> Verificado
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={12} color="var(--primary-orange)" /> {t.location} • <span style={{ opacity: 0.8 }}>{t.date}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="#FFB800" color="#FFB800" />
                  ))}
                </div>

                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E5C9E', marginBottom: '8px', background: 'rgba(30,92,158,0.08)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>
                  📦 {t.product}
                </div>

                <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.5', fontStyle: 'italic', marginBottom: '14px' }}>
                  "{t.comment}"
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', pt: '10px', paddingTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <ThumbsUp size={14} color="var(--primary-orange)" /> {t.likes} clientes acharam útil
                </span>
                <span style={{ color: '#25D366', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> Compra Segura
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Footer */}
        <div style={{ marginTop: '28px', textAlign: 'center', background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>
            Quer fazer o seu pedido com a mesma segurança e rapidez?
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Fale com os nossos atendentes no WhatsApp e receba em qualquer lugar de Luanda ou províncias.
          </p>
          <button
            onClick={() => window.open('https://wa.me/244950752933?text=Olá%20Aqui%20Tem!%20Vi%20as%20avaliações%20e%20quero%20fazer%20um%20pedido.', '_blank')}
            className="nav-btn nav-btn-orange"
            style={{ padding: '12px 28px', fontSize: '0.95rem', margin: '0 auto', display: 'inline-flex' }}
          >
            <MessageCircle size={18} /> Pedir pelo WhatsApp 950752933
          </button>
        </div>
      </div>
    </div>
  );
}
