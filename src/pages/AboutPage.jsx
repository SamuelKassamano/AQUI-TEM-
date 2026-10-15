import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  ShieldCheck,
  Award,
  Users,
  Truck,
  CheckCircle,
  MessageCircle,
  ArrowRight,
  PackageCheck,
  HeartHandshake
} from 'lucide-react';
import Layout from '../components/Layout';
import { getAssetUrl } from '../utils/assets';
import { useLanguage } from '../context/LanguageContext';

export default function AboutPage() {
  const { lang, t } = useLanguage();

  useEffect(() => {
    document.title = 'Sobre Nós — AQUI TEM | Importação Direta & Tecnologia em Angola';
  }, []);

  return (
    <Layout>
      {/* Page Hero Header */}
      <div className="page-hero">
        <div className="page-hero-container">
          <div className="page-breadcrumbs">
            <Link to="/">Início</Link>
            <span>/</span>
            <span className="active">Sobre Nós</span>
          </div>
          <h1 className="page-hero-title">
            Sobre a <span>AQUI TEM</span> Angola
          </h1>
          <p className="page-hero-sub">
            Conectamos os consumidores e empresas de Angola às melhores inovações tecnológicas globais, produtos Oraimo 100% originais e utilidades inteligentes para o lar.
          </p>
        </div>
      </div>

      <div className="page-content-wrapper">
        {/* Main Story & Presentation */}
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '36px 40px',
            borderRadius: '20px',
            border: '1px solid var(--border-light)',
            marginBottom: '36px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', background: 'rgba(255, 101, 0, 0.08)', padding: '4px 12px', borderRadius: '16px', marginBottom: '10px' }}>
                <Store size={15} /> Nossa Identidade
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.25 }}>
                Tecnologia Acessível, Genuína e com Garantia Real em Angola
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', lineHeight: 1.7, marginBottom: '14px' }}>
                A <strong>AQUI TEM</strong> nasceu com a missão de transformar a experiência de compra de eletrônicos em Angola. Trabalhamos exclusivamente online e com base de operações em Luanda, eliminando intermediários dispendiosos para oferecer produtos de alta tecnologia diretamente dos fabricantes autorizados com preços justos em Kwanzas (Kz).
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', lineHeight: 1.7, marginBottom: '20px' }}>
                Especializamo-nos na linha premium <strong>Oraimo</strong> — líder em acessórios inteligentes, fones de ouvido sem fio, carregadores ultra-rápidos e relógios smartwatches —, além de eletrodomésticos inteligentes como fritadeiras air fryer, placas de indução e televisores de última geração.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/produtos" className="nav-btn nav-btn-orange" style={{ textDecoration: 'none' }}>
                  Ver Nossos Produtos
                </Link>
                <Link to="/contactos" className="nav-btn" style={{ textDecoration: 'none' }}>
                  Falar Connosco
                </Link>
              </div>
            </div>

            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              <img
                src={getAssetUrl('/flyer_showroom.jpg')}
                alt="Operações AQUI TEM Luanda"
                style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getAssetUrl('/hero_banner_attendant.jpg');
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '16px 20px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                  color: '#FFF'
                }}
              >
                <strong style={{ fontSize: '1rem', display: 'block' }}>Base Operacional em Luanda</strong>
                <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>Benfica - Zona Verde, Município Cabolombo</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Excellence */}
        <h3 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '20px', textAlign: 'center' }}>
          Por que a AQUI TEM é a Escolha de Confiança em Angola?
        </h3>

        <div className="feature-grid-3" style={{ marginBottom: '40px' }}>
          <div className="feature-card">
            <div className="feature-card-icon">
              <ShieldCheck size={24} />
            </div>
            <h4 style={{ margin: '0 0 10px', fontSize: '1.1rem', fontWeight: 800 }}>100% Selado na Caixa</h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Não vendemos réplicas nem artigos de vitrine. Todos os nossos produtos chegam selados de fábrica, com número de série e garantia oficial de 7 dias para troca imediata em caso de qualquer anomalia técnica.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon" style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25D366' }}>
              <Truck size={24} />
            </div>
            <h4 style={{ margin: '0 0 10px', fontSize: '1.1rem', fontWeight: 800 }}>Entregas Ágeis em Angola</h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Cobrimos todos os municípios de Luanda (Talatona, Kilamba, Viana, Cazenga, Maianga, Benfica, Cacuaco) e despachamos com segurança para outras províncias de Angola mediante agendamento prévio.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon" style={{ background: 'rgba(30, 92, 158, 0.1)', color: '#1E5C9E' }}>
              <HeartHandshake size={24} />
            </div>
            <h4 style={{ margin: '0 0 10px', fontSize: '1.1rem', fontWeight: 800 }}>Atendimento Humanizado</h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Acreditamos na proximidade. Nossa equipa em Luanda acompanha a sua encomenda do primeiro clique até o recebimento, fornecendo fotos, vídeos de teste pré-despacho e suporte pós-venda contínuo via WhatsApp.
            </p>
          </div>
        </div>

        {/* Physical Address & Showroom Info */}
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '30px',
            borderRadius: '16px',
            border: '1px solid var(--border-light)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            alignItems: 'center',
            marginBottom: '40px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '8px' }}>
              <MapPin size={16} /> Localização Oficial
            </div>
            <h4 style={{ margin: '0 0 10px', fontSize: '1.2rem', fontWeight: 800 }}>
              Onde Estamos Localizados?
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 14px' }}>
              <strong>Endereço:</strong> Avenida Fidel de Castro, Benfica - Zona Verde, Município Cabolombo, Província de Luanda, Angola.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
              Operamos com agendamentos de entrega expresso e atendimento online com equipe local para suporte imediato.
            </p>
          </div>

          <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <h5 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 800 }}>Canais Oficiais de Contacto:</h5>
            <div style={{ fontSize: '0.88rem', display: 'grid', gap: '8px' }}>
              <div>📱 <strong>WhatsApp:</strong> +244 950 752 933</div>
              <div>📞 <strong>Telefone:</strong> +244 950 752 933</div>
              <div>✉️ <strong>E-mail:</strong> contacto@aquitem.ao</div>
              <div>🕒 <strong>Horário:</strong> Segunda a Sábado: 08h às 19h</div>
            </div>
          </div>
        </div>

        {/* Call to Action Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FF6500, #E55800)',
            color: '#FFF',
            padding: '36px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-orange)'
          }}
        >
          <h3 style={{ margin: '0 0 10px', fontSize: '1.6rem', fontWeight: 900 }}>
            Pronto para Adquirir a Sua Próxima Tecnologia?
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '0.95rem', opacity: 0.95, maxWidth: '600px', marginInline: 'auto' }}>
            Consulte o nosso catálogo completo com preços em Kwanzas e receba o seu produto sem sair de casa.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/produtos"
              style={{
                background: '#FFF',
                color: 'var(--primary-orange)',
                padding: '12px 24px',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none'
              }}
            >
              Ver Todos os Produtos
            </Link>
            <a
              href="https://wa.me/244950752933?text=Ol%C3%A1%20AQUI%20TEM!%20Gostaria%20de%20falar%20com%20um%20atendente."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#25D366',
                color: '#FFF',
                padding: '12px 24px',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <MessageCircle size={18} /> Conversar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
