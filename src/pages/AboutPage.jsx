import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  ShieldCheck,
  Award,
  Truck,
  CheckCircle,
  MessageCircle,
  ArrowRight,
  PackageCheck,
  HeartHandshake,
  Sparkles,
  Zap,
  CreditCard,
  CalendarCheck,
  Building2,
  Clock,
  PhoneCall,
  Mail,
  Check,
  Layers,
  Star
} from 'lucide-react';
import Layout from '../components/Layout';
import { getAssetUrl } from '../utils/assets';
import { useLanguage } from '../context/LanguageContext';

export default function AboutPage() {
  const { lang, t } = useLanguage();

  useEffect(() => {
    document.title = 'Sobre a AQUI TEM Angola — Tecnologia Oficial, Confiança & Inovação';
  }, []);

  return (
    <Layout>
      {/* Premium Hero Banner */}
      <section
        className="page-hero about-hero-section"
        style={{
          background: 'linear-gradient(135deg, #0b1120 0%, #0f172a 50%, #1e293b 100%)',
          color: '#ffffff',
          padding: '56px 20px 64px',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Ambient Glows */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(255, 101, 0, 0.22) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(30, 92, 158, 0.25) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ maxWidth: '1140px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Breadcrumbs */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.82rem',
              color: '#94a3b8',
              marginBottom: '20px'
            }}
          >
            <Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Início
            </Link>
            <span>/</span>
            <span style={{ color: '#ff6500', fontWeight: 600 }}>Sobre Nós</span>
          </nav>

          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(255, 101, 0, 0.12)',
              border: '1px solid rgba(255, 101, 0, 0.35)',
              borderRadius: '9999px',
              color: '#ff8a3d',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '20px'
            }}
          >
            <Sparkles size={14} /> Importação Oficial & E-commerce de Confiança
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              margin: '0 0 20px',
              letterSpacing: '-0.02em',
              maxWidth: '850px'
            }}
          >
            Conectamos Angola à Mais Avançada{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #FF6500 0%, #FFA155 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Tecnologia Global
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.98rem, 1.8vw, 1.15rem)',
              color: '#cbd5e1',
              lineHeight: 1.7,
              maxWidth: '780px',
              margin: '0 0 36px'
            }}
          >
            A <strong>AQUI TEM</strong> é a sua loja de referência em Angola. Selecionamos eletrónicos, gadgets inovadores e eletrodomésticos inteligentes diretamente de fabricantes mundiais de prestígio, com garantia oficial, embalagem 100% selada e logística de entrega programada e segura.
          </p>

          {/* Key Figures Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px'
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px 22px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ color: '#22c55e', fontSize: '1.9rem', fontWeight: 900, marginBottom: '4px' }}>
                100%
              </div>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>
                Original e Selado na Caixa
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.4 }}>
                Garantia oficial contra qualquer anomalia técnica.
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px 22px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ color: '#ff6500', fontSize: '1.9rem', fontWeight: 900, marginBottom: '4px' }}>
                24h – 48h
              </div>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>
                Agendamento em Luanda
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.4 }}>
                Entregas rápidas agendadas após confirmação do pagamento.
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px 22px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ color: '#38bdf8', fontSize: '1.9rem', fontWeight: 900, marginBottom: '4px' }}>
                18 Províncias
              </div>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>
                Cobertura Nacional
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.4 }}>
                Envio expresso para todo o território angolano.
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px 22px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ color: '#f59e0b', fontSize: '1.9rem', fontWeight: 900, marginBottom: '4px' }}>
                Kz Justo
              </div>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>
                Preços Reais e Transparentes
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.4 }}>
                Sem taxas ocultas, calculados para a realidade de Angola.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="page-content-wrapper" style={{ maxWidth: '1140px', margin: '0 auto', padding: '48px 20px' }}>
        {/* Bento Grid: Who We Are & Vision */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            alignItems: 'center',
            marginBottom: '64px'
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ff6500',
                fontWeight: 800,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                background: 'rgba(255, 101, 0, 0.08)',
                padding: '4px 12px',
                borderRadius: '16px',
                marginBottom: '14px'
              }}
            >
              <Store size={15} /> Quem Somos
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
                fontWeight: 800,
                lineHeight: 1.25,
                color: 'var(--text-main)',
                margin: '0 0 18px'
              }}
            >
              A Nova Forma de Comprar Tecnologia em Angola
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', lineHeight: 1.7, marginBottom: '16px' }}>
              Fundada em Luanda, a <strong>AQUI TEM</strong> surgiu com um compromisso claro: acabar com as incertezas, produtos contrafeitos e preços inflacionados no mercado angolano de tecnologia.
            </p>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', lineHeight: 1.7, marginBottom: '22px' }}>
              Com um modelo de distribuição direto e inteligente baseado em Luanda (Benfica — Zona Verde), operamos com stock real pronto para entrega. Especializamo-nos nas principais marcas do mundo moderno, com destaque para a linha completa <strong>Oraimo Oficial</strong> (fones sem fios, smartwatches, escovas sónicas, powerbanks e cabos ultra-resistentes), além de sistemas de segurança inteligente, eletrodomésticos de cozinha e utilidades domésticas.
            </p>

            <div style={{ display: 'grid', gap: '12px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ color: '#22c55e', background: 'rgba(34, 197, 94, 0.12)', padding: '4px', borderRadius: '50%', marginTop: '2px' }}>
                  <Check size={14} />
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  <strong>Importação Direta & Autenticidade:</strong> Produtos originais lacrados de fábrica com selo de verificação.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ color: '#22c55e', background: 'rgba(34, 197, 94, 0.12)', padding: '4px', borderRadius: '50%', marginTop: '2px' }}>
                  <Check size={14} />
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  <strong>Preços Justos em Kwanzas (Kz):</strong> Tabela comercial balanceada com descontos a pronto pagamento.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ color: '#22c55e', background: 'rgba(34, 197, 94, 0.12)', padding: '4px', borderRadius: '50%', marginTop: '2px' }}>
                  <Check size={14} />
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  <strong>Garantia Real de 7 Dias:</strong> Troca imediata na loja caso haja qualquer inconformidade comprovada.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/produtos" className="nav-btn nav-btn-orange" style={{ textDecoration: 'none', padding: '12px 24px' }}>
                Explorar Todos os Produtos
              </Link>
              <Link to="/contactos" className="nav-btn" style={{ textDecoration: 'none', padding: '12px 24px' }}>
                Contactar a Equipa
              </Link>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-md)',
              position: 'relative'
            }}
          >
            <div style={{ borderRadius: '18px', overflow: 'hidden', position: 'relative', marginBottom: '18px' }}>
              <img
                src={getAssetUrl('/flyer_showroom.jpg')}
                alt="Operações AQUI TEM Angola"
                style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getAssetUrl('/hero_banner_attendant.jpg');
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.15) 50%, transparent 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ff6500', color: '#FFF', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, width: 'fit-content', marginBottom: '6px' }}>
                  CENTRO OPERACIONAL
                </div>
                <div style={{ color: '#FFF', fontWeight: 800, fontSize: '1.1rem' }}>
                  Base Logística em Luanda
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.82rem' }}>
                  Avenida Fidel de Castro, Benfica — Zona Verde (Cabolombo)
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--bg-body)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Atendimento
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Segunda a Sábado
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  08h00 às 19h00
                </div>
              </div>

              <div style={{ background: 'var(--bg-body)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Linha WhatsApp
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#25D366' }}>
                  +244 950 752 933
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Resposta em minutos
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Policy: How Ordering & Delivery Scheduling Works */}
        <section
          style={{
            background: 'linear-gradient(135deg, rgba(255, 101, 0, 0.05) 0%, rgba(30, 92, 158, 0.05) 100%)',
            border: '1px solid var(--border-light)',
            borderRadius: '24px',
            padding: '40px 32px',
            marginBottom: '64px'
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 36px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ff6500',
                fontWeight: 800,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                background: 'rgba(255, 101, 0, 0.1)',
                padding: '4px 12px',
                borderRadius: '16px',
                marginBottom: '10px'
              }}
            >
              <CalendarCheck size={15} /> Como Funciona a Compra e Entrega
            </div>
            <h3 style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.9rem)', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-main)' }}>
              Política Transparente de Pagamento e Agendamento
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.6, margin: 0 }}>
              Na <strong>AQUI TEM</strong>, zelamos pela máxima transparência, segurança das encomendas e precisão nas rotas dos nossos estafetas. Conheça o nosso processo oficial:
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px'
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '24px 20px',
                borderRadius: '18px',
                border: '1px solid var(--border-light)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 101, 0, 0.1)',
                  color: '#ff6500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1rem',
                  marginBottom: '14px'
                }}
              >
                1
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>
                Escolha o Seu Produto
              </h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                Selecione os artigos desejados no nosso catálogo online, aproveite as promoções ativas e confira as especificações completas em Kwanzas.
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '24px 20px',
                borderRadius: '18px',
                border: '1px solid var(--border-light)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(30, 92, 158, 0.1)',
                  color: '#1E5C9E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1rem',
                  marginBottom: '14px'
                }}
              >
                2
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>
                Pagamento Antecipado Seguro
              </h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                O pagamento é realizado <strong>antes do envio</strong> via Multicaixa Express ou Transferência Bancária IBAN, garantindo a reserva imediata do stock.
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '24px 20px',
                borderRadius: '18px',
                border: '1px solid var(--border-light)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1rem',
                  marginBottom: '14px'
                }}
              >
                3
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>
                Validação & Agendamento
              </h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                Após o envio do comprovativo, a nossa equipa valida a ordem e agenda imediatamente a data, horário e morada exata da entrega consigo pelo WhatsApp.
              </p>
            </div>

            {/* Step 4 */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '24px 20px',
                borderRadius: '18px',
                border: '1px solid var(--border-light)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(168, 85, 247, 0.1)',
                  color: '#a855f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1rem',
                  marginBottom: '14px'
                }}
              >
                4
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>
                Entrega com Garantia Real
              </h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                O produto chega selado na caixa original, no prazo acordado de 24h a 48h em Luanda (ou 2 a 5 dias para províncias), acompanhado de garantia total de 7 dias.
              </p>
            </div>
          </div>
        </section>

        {/* 4 Pillars of Excellence */}
        <section style={{ marginBottom: '64px' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 36px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#1E5C9E',
                fontWeight: 800,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                background: 'rgba(30, 92, 158, 0.08)',
                padding: '4px 12px',
                borderRadius: '16px',
                marginBottom: '10px'
              }}
            >
              <Award size={15} /> Os Nossos Pilares
            </div>
            <h3 style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.9rem)', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-main)' }}>
              Por Que Confiar na AQUI TEM?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              Combinamos rigor na seleção de fornecedores, transparência financeira e atendimento centrado no consumidor angolano.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px'
            }}
          >
            <div className="feature-card" style={{ padding: '28px 24px', borderRadius: '20px' }}>
              <div className="feature-card-icon" style={{ background: 'rgba(255, 101, 0, 0.12)', color: '#ff6500' }}>
                <ShieldCheck size={26} />
              </div>
              <h4 style={{ margin: '0 0 10px', fontSize: '1.15rem', fontWeight: 800 }}>Artigos 100% Selados</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Não vendemos réplicas, produtos recondicionados ou itens de mostruário. Cada caixa vem selada de fábrica com número de série oficial e verificação de autenticidade da marca.
              </p>
            </div>

            <div className="feature-card" style={{ padding: '28px 24px', borderRadius: '20px' }}>
              <div className="feature-card-icon" style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e' }}>
                <Truck size={26} />
              </div>
              <h4 style={{ margin: '0 0 10px', fontSize: '1.15rem', fontWeight: 800 }}>Frota Ágil e Confiável</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Atendemos todos os bairros e municípios de Luanda (Talatona, Kilamba, Maianga, Benfica, Viana, Cazenga, Cacuaco, Cidade Alta) com transporte seguro e expedição para todas as províncias.
              </p>
            </div>

            <div className="feature-card" style={{ padding: '28px 24px', borderRadius: '20px' }}>
              <div className="feature-card-icon" style={{ background: 'rgba(30, 92, 158, 0.12)', color: '#1E5C9E' }}>
                <HeartHandshake size={26} />
              </div>
              <h4 style={{ margin: '0 0 10px', fontSize: '1.15rem', fontWeight: 800 }}>Apoio Dedicado e Humano</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Acompanhamos a sua encomenda do primeiro contacto até ao pós-venda. Tem dúvidas de instalação ou configuração? A nossa equipa fornece vídeos tutoriais e consultoria pelo WhatsApp.
              </p>
            </div>

            <div className="feature-card" style={{ padding: '28px 24px', borderRadius: '20px' }}>
              <div className="feature-card-icon" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
                <CreditCard size={26} />
              </div>
              <h4 style={{ margin: '0 0 10px', fontSize: '1.15rem', fontWeight: 800 }}>Pagamento Sem Risco</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Transações bancárias seguras em canais certificados em Angola. Emissão de Factura Pró-forma e Factura-Recibo com NIF para empresas e instituições públicas e privadas.
              </p>
            </div>
          </div>
        </section>

        {/* Showroom & Operations Hub */}
        <section
          style={{
            background: 'var(--bg-card)',
            padding: '36px',
            borderRadius: '24px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '64px'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px',
              alignItems: 'center'
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#ff6500',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  marginBottom: '12px'
                }}
              >
                <MapPin size={16} /> Localização da Empresa
              </div>

              <h4 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 14px', color: 'var(--text-main)' }}>
                Base Operacional em Luanda, Angola
              </h4>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.7, margin: '0 0 18px' }}>
                A <strong>AQUI TEM</strong> está sediada estrategicamente em Luanda para responder com máxima rapidez à preparação e despacho diário de encomendas em toda a capital e envio expresso interprovincial.
              </p>

              <div style={{ display: 'grid', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={16} color="#ff6500" />
                  <span><strong>Morada:</strong> Avenida Fidel de Castro, Benfica — Zona Verde, Cabolombo, Luanda.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="#ff6500" />
                  <span><strong>Horário:</strong> Segunda a Sábado das 08h00 às 19h00 (Domingos por agendamento).</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} color="#ff6500" />
                  <span><strong>E-mail Corporativo:</strong> contacto@aquitem.ao</span>
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#FFF',
                padding: '28px',
                borderRadius: '20px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <PhoneCall size={22} color="#25D366" />
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Central de Atendimento ao Cliente</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '20px' }}>
                Fale agora com um dos nossos consultores para consultar disponibilidade de stock, solicitar pró-forma institucional ou tirar dúvidas sobre pagamentos e rotas de entrega.
              </p>
              <a
                href="https://wa.me/244950752933?text=Ol%C3%A1%20AQUI%20TEM!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20produtos%20e%20agendamento%20de%20entrega."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25D366',
                  color: '#FFF',
                  padding: '12px 22px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.94rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'opacity 0.2s ease'
                }}
              >
                <MessageCircle size={18} /> Iniciar Conversa no WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* High-Impact CTA Banner */}
        <section
          style={{
            background: 'linear-gradient(135deg, #FF6500 0%, #EA580C 100%)',
            color: '#FFF',
            padding: '44px 32px',
            borderRadius: '24px',
            textAlign: 'center',
            boxShadow: '0 12px 36px rgba(255, 101, 0, 0.35)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <h3 style={{ margin: '0 0 12px', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 900 }}>
            Pronto Para Descobrir a Melhor Tecnologia de Angola?
          </h3>
          <p
            style={{
              margin: '0 auto 28px',
              fontSize: '1rem',
              opacity: 0.95,
              maxWidth: '650px',
              lineHeight: 1.6
            }}
          >
            Consulte todo o catálogo da AQUI TEM com preços atualizados em Kwanzas, garantia oficial e agendamento de entrega direto no seu endereço.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/produtos"
              style={{
                background: '#FFF',
                color: '#FF6500',
                padding: '14px 28px',
                borderRadius: '9999px',
                fontWeight: 800,
                fontSize: '0.96rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Ver Catálogo de Produtos <ArrowRight size={16} />
            </Link>

            <a
              href="https://wa.me/244950752933?text=Ol%C3%A1%20AQUI%20TEM!%20Gostaria%20de%20fazer%20um%20pedido%20e%20agendar%20a%20entrega."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                color: '#FFF',
                padding: '14px 28px',
                borderRadius: '9999px',
                fontWeight: 800,
                fontSize: '0.96rem',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <MessageCircle size={18} /> Atendimento WhatsApp (+244 950 752 933)
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
}
