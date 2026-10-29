import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Zap,
  Truck,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  Star,
  Eye,
  Plus,
  Minus,
  Trash2,
  X,
  CheckCircle,
  Sun,
  Moon,
  Filter,
  ArrowRight,
  Send,
  Heart,
  Menu,
  Grid,
  Info,
  MapPin,
  Award,
  Store,
  Video,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Lock,
  ExternalLink
} from 'lucide-react';
import { CATEGORIES, ADVANTAGES, HERO_BANNER_FALLBACK, HERO_COVER_IMAGES } from './data/products';
import { PRODUCT_VIDEOS } from './src/data/videos';

import SocialProofModal from './src/components/SocialProofModal';
import VideosModal from './src/components/VideosModal';
import CRMDashboardModal from './src/components/CRMDashboardModal';
import StoreDrawers from './src/components/StoreDrawers';
import { useLanguage } from './src/context/LanguageContext';
import { initAllPixels, trackProductView, trackWhatsAppLead } from './src/utils/pixelRetargeting';
import { useCRM } from './src/context/CRMContext';
import { useStore } from './src/context/StoreContext';
import LanguageSelector from './src/components/LanguageSelector';
import { getTranslatedProduct, getTranslatedCategory, getTranslatedVideo, getProductTestimonials } from './src/utils/productTranslations';
import { createSlug } from './src/utils/slug';
import {
  createProductStructuredData,
  createBreadcrumbStructuredData
} from './src/seo/structuredData';
import Chatbot from './src/components/Chatbot';

export default function App() {
  const { lang, t } = useLanguage();
  const { openCRM } = useCRM();
  const {
    activeProducts,
    cart,
    addToCart,
    setIsCartOpen,
    wishlist,
    toggleWishlist,
    isInWishlist,
    setIsWishlistOpen,
    setIsCheckoutOpen,
    setDirectCheckoutItem,
    theme,
    toggleTheme,
    getEffectivePrice,
    getPreviousPrice,
    formatPriceKz
  } = useStore();

  // Inicializa os pixels de remarketing
  useEffect(() => {
    initAllPixels();
  }, []);

  // State management
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isSocialProofOpen, setIsSocialProofOpen] = useState(false);
  const [isVideosOpen, setIsVideosOpen] = useState(false);
  const [activeVideoStart, setActiveVideoStart] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeInfoModal, setActiveInfoModal] = useState(null);

  // Auto-switch cover flyers every 15 seconds
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroImageIndex(prev => (prev + 1) % (HERO_COVER_IMAGES.length || 1));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Filtered and Sorted Products (Active products only, searches name, brand, category, description, SKU)
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return activeProducts
      .map(p => getTranslatedProduct(p, lang))
      .filter(p => {
        const canonicalSelected = getTranslatedCategory(selectedCategory, 'pt');
        const prodCat = (p.originalCategory || p.category || '').toLowerCase();
        const prodName = (p.name || '').toLowerCase();
        const prodDesc = (p.description || '').toLowerCase();

        let matchesCategory =
          selectedCategory === 'Todos' ||
          selectedCategory === 'All' ||
          p.category === canonicalSelected ||
          p.originalCategory === canonicalSelected ||
          getTranslatedCategory(p.category, lang) === selectedCategory;

        if (!matchesCategory) {
          if (canonicalSelected === 'Smartwatches') {
            matchesCategory = prodName.includes('watch') || prodName.includes('smartwatch') || prodCat.includes('watch');
          } else if (canonicalSelected === 'Energia') {
            matchesCategory = prodName.includes('powerbank') || prodName.includes('power bank') || prodName.includes('bateria') || prodName.includes('magpower') || prodCat.includes('energia');
          } else if (canonicalSelected === 'Celular') {
            matchesCategory = prodName.includes('celular') || prodName.includes('telemóvel') || prodName.includes('smartphone') || prodName.includes('cabo') || prodName.includes('carregador') || prodName.includes('magpower');
          } else if (canonicalSelected === 'Áudio & Som') {
            matchesCategory = prodCat.includes('áudio') || prodCat.includes('audio') || prodName.includes('headphone') || prodName.includes('fones') || prodName.includes('coluna') || prodName.includes('tws');
          } else if (canonicalSelected === 'Acessórios & Casa') {
            matchesCategory = prodCat.includes('casa') || prodName.includes('camera') || prodName.includes('câmera') || prodName.includes('plug') || prodName.includes('tomada') || prodName.includes('copo') || prodName.includes('garrafa');
          } else if (canonicalSelected === 'TV & Vídeo') {
            matchesCategory = prodCat.includes('vídeo') || prodCat.includes('video') || prodCat.includes('tv') || prodName.includes('projetor') || prodName.includes('projector') || prodName.includes('tv');
          } else if (canonicalSelected === 'Acessórios & Tech') {
            matchesCategory = prodCat.includes('tech') || prodCat.includes('acessórios') || prodName.includes('carregador') || prodName.includes('gan') || prodName.includes('impressora') || prodName.includes('rastreador') || prodName.includes('gps');
          }
        }

        const matchesSearch =
          !q ||
          prodName.includes(q) ||
          prodDesc.includes(q) ||
          (p.brand || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.originalCategory || '').toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const priceA = getEffectivePrice(a);
        const priceB = getEffectivePrice(b);
        if (sortBy === 'price-low') return priceA - priceB;
        if (sortBy === 'price-high') return priceB - priceA;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [activeProducts, selectedCategory, searchQuery, sortBy, lang, getEffectivePrice]);

  const translatedAdvantageTitles = [
    t('advFastDeliveryTitle'),
    t('advQualityTitle'),
    t('advEasyPaymentTitle'),
    t('advWhatsappTitle')
  ];

  const translatedAdvantageSubs = [
    t('advFastDeliverySub'),
    t('advQualitySub'),
    t('advEasyPaymentSub'),
    t('advWhatsappSub')
  ];

  return (
    <>
      <Chatbot />
      <div className="app-container">
        
        {/* Top Announcement Bar */}
      <div className="top-bar">
        <span className="top-bar-main">{t('topBarMsg')}</span>
        <span className="top-bar-sep" style={{ opacity: 0.6 }}>|</span>
        <span className="top-bar-sub">📱 {t('whatsappSupport')}</span>
        <span className="top-bar-sep" style={{ opacity: 0.6 }}>|</span>
        <span className="top-bar-sub">🇦🇴 {t('fastDelivery')}</span>
      </div>

      {/* Slim & Organized Header Taskbar */}
      <header className="header-nav">
        <div className="header-container">
          <div className="header-left">
            <button
              className="nav-btn nav-btn-icon"
              onClick={() => setIsSideMenuOpen(true)}
              title="Abrir Menu"
              aria-label="Abrir Menu"
            >
              <Menu size={17} />
            </button>

            <a href="#" className="logo-brand">
              <img src="/logo.jpg" alt="Aqui Tem" height={40} className="header-logo-img" />
            </a>
          </div>

          {/* Slim Search Bar */}
          <div className="search-form">
            <div className="search-input-wrapper">
              <Search size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ display: 'flex', alignItems: 'center' }}>
                  <X size={14} color="var(--text-muted)" />
                </button>
              )}
            </div>
          </div>

          {/* Organized Navigation Actions */}
          <div className="nav-actions">
            <LanguageSelector className="desktop-only-lang" />

            <button className="nav-btn nav-btn-icon" onClick={toggleTheme} title="Alternar Tema">
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <button
              className="nav-btn nav-btn-icon"
              onClick={() => setIsWishlistOpen(true)}
              title={t('wishlist')}
            >
              <Heart size={16} color={wishlist.length > 0 ? '#F37021' : 'currentColor'} fill={wishlist.length > 0 ? '#F37021' : 'none'} />
              {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
            </button>

            <button className="nav-btn nav-btn-orange nav-btn-cart" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={16} />
              <span className="nav-btn-label">{t('cart')}</span>
              {cart.length > 0 && (
                <span className="badge-count" style={{ background: '#FFF', color: '#F37021' }}>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Side Menu Drawer */}
      {isSideMenuOpen && (
        <div className="modal-overlay" onClick={() => setIsSideMenuOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '300px', height: '100vh', margin: '0 0 0 auto', borderRadius: 0, padding: '18px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--border-light)' }}>
              <img src="/logo.jpg" alt="Aqui Tem" height={40} />
              <button onClick={() => setIsSideMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>{t('selectLanguage')}:</span>
                <LanguageSelector />
              </div>

              <Link
                to="/"
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
                onClick={() => setIsSideMenuOpen(false)}
              >
                <Store size={15} /> Início
              </Link>

              <Link
                to="/produtos"
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
                onClick={() => setIsSideMenuOpen(false)}
              >
                <Grid size={15} /> Produtos
              </Link>

              <Link
                to="/sobre-nos"
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
                onClick={() => setIsSideMenuOpen(false)}
              >
                <Store size={15} /> Sobre Nós
              </Link>

              <Link
                to="/solucoes"
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
                onClick={() => setIsSideMenuOpen(false)}
              >
                <Award size={15} /> Soluções
              </Link>

              <Link
                to="/como-funciona"
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
                onClick={() => setIsSideMenuOpen(false)}
              >
                <Truck size={15} /> Como Funciona
              </Link>

              <Link
                to="/contactos"
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
                onClick={() => setIsSideMenuOpen(false)}
              >
                <MapPin size={15} /> Contactos
              </Link>

              <Link
                to="/perguntas-frequentes"
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
                onClick={() => setIsSideMenuOpen(false)}
              >
                <ShieldCheck size={15} /> Perguntas Frequentes
              </Link>

              <button
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(30, 92, 158, 0.08)', color: '#1E5C9E', borderColor: '#1E5C9E' }}
                onClick={() => { setIsVideosOpen(true); setIsSideMenuOpen(false); }}
              >
                <Video size={15} /> {t('videos')}
              </button>

              <div style={{ borderTop: '1px solid var(--border-light)', margin: '6px 0' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-orange)', textTransform: 'uppercase' }}>
                Gestão & Administração:
              </span>

              <Link
                to="/admin"
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', background: 'rgba(30, 92, 158, 0.08)', color: '#1E5C9E' }}
                onClick={() => setIsSideMenuOpen(false)}
              >
                <Lock size={15} /> Painel Administrativo (Produtos)
              </Link>

              <Link
                to="/admin?tab=crm"
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', background: 'rgba(255, 101, 0, 0.08)', color: 'var(--primary-orange)', borderColor: 'rgba(255, 101, 0, 0.25)' }}
                onClick={() => setIsSideMenuOpen(false)}
              >
                <BarChart3 size={15} /> CRM & Gestão de Leads
              </Link>

              <div style={{ borderTop: '1px solid var(--border-light)', margin: '6px 0' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-orange)', textTransform: 'uppercase' }}>{t('categories')}</span>

              {CATEGORIES.map(c => (
                <button
                  key={c}
                  className={`category-chip ${selectedCategory === c ? 'active' : ''}`}
                  style={{ width: '100%', textAlign: 'left' }}
                  onClick={() => { setSelectedCategory(c); setIsSideMenuOpen(false); }}
                >
                  {getTranslatedCategory(c, lang)}
                </button>
              ))}

              <div style={{ borderTop: '1px solid var(--border-light)', margin: '6px 0' }}></div>

              <a
                href="https://wa.me/244950752933?text=Olá%20Aqui%20Tem!"
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#25D366', fontWeight: 700, fontSize: '0.9rem' }}
              >
                <MessageCircle size={18} /> WhatsApp: 950752933
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Info Modals */}
      {activeInfoModal && (
        <div className="modal-overlay" onClick={() => setActiveInfoModal(null)}>
          <div className="modal-content" style={{ maxWidth: '560px', padding: '28px' }} onClick={e => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setActiveInfoModal(null)}>
              <X size={20} />
            </button>

            {activeInfoModal === 'about' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <Store size={18} /> {t('aboutBadge')}
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{t('aboutTitle')} AQUI TEM (Angola)</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  {t('aboutDesc1')}
                </p>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  {t('aboutDesc2')}
                </p>
                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <strong>📍 {t('aboutLocTitle')}:</strong> {t('aboutLocDesc')}
                </div>
              </div>
            )}

            {activeInfoModal === 'stores' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <MapPin size={18} /> {t('storesAndSupport')}
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                  {lang === 'en' ? '100% Online Store & Delivery in Angola' : 'Atendimento Online, Importação & Entregas em Angola'}
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {lang === 'en'
                    ? 'AQUI TEM operates exclusively online, specializing in importing electronics, gadgets, Oraimo products, and home appliances directly from China with affordable prices and scheduled delivery.'
                    : 'A AQUI TEM trabalha exclusivamente online, sendo especializada na importação direta da China de eletrônicos, gadgets, produtos Oraimo e eletrodomésticos com preços mais acessíveis e entrega mediante agendamento.'
                  }
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                    <strong>📍 {lang === 'en' ? 'Operational Location (Luanda):' : 'Localização Operacional (Luanda):'}</strong> Avenida Fidel de Castro, Benfica - Zona Verde, Município Cabolombo, Província de Luanda, Angola
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {lang === 'en' ? 'WhatsApp Customer Support: +244 950 752 933' : 'Atendimento e encomendas pelo WhatsApp: +244 950 752 933'}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                    <strong>🚚 {lang === 'en' ? 'Scheduled Delivery & Payment' : 'Entregas & Formas de Pagamento'}:</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {lang === 'en'
                        ? 'Deliveries in Luanda and other provinces of Angola by appointment. Payment accepted via Multicaixa, Cash, and Payment on Delivery.'
                        : 'Entregas em Luanda e outras províncias de Angola mediante agendamento. Aceitamos Multicaixa, Dinheiro/Cash e Pagamento na entrega.'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeInfoModal === 'warranty' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <ShieldCheck size={18} /> {t('warrantyAndExchanges')}
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{lang === 'en' ? '100% Genuine Warranty & Exchange Terms' : 'Garantia Oficial & Política de Trocas'}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {lang === 'en'
                    ? 'All products sold at AQUI TEM come directly from factory sealed boxes with official warranty.'
                    : 'Todos os produtos vendidos na AQUI TEM são 100% originais, selados na caixa e possuem garantia oficial de fábrica.'
                  }
                </p>
                <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                  <li>{lang === 'en' ? 'Immediate exchange in case of factory defect within 7 days.' : 'Troca imediata em caso de defeito de fabricação nos primeiros 7 dias.'}</li>
                  <li>{lang === 'en' ? 'Official warranty on Oraimo equipment.' : 'Garantia oficial de fábrica para equipamentos Oraimo.'}</li>
                  <li>{lang === 'en' ? 'Pre-dispatch testing available upon request.' : 'Suporte técnico e envio de vídeo de teste pré-despacho.'}</li>
                </ul>
              </div>
            )}

            <button
              className="nav-btn nav-btn-orange"
              style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
              onClick={() => setActiveInfoModal(null)}
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner Section */}
      <section className="hero-section">
        <div className="hero-banner">
          <div className="hero-text-col">
            <span className="hero-tag">
              <Zap size={14} /> {t('heroTag')}
            </span>
            <h1 className="hero-title">{t('heroTitle')}</h1>
            <p className="hero-subtitle">{t('heroSubtitle')}</p>

            <div className="hero-cta-group">
              <a href="#catalogo" className="nav-btn nav-btn-orange hero-cta-btn">
                {t('buyNow')} <ArrowRight size={18} />
              </a>
              <a
                href="https://wa.me/244950752933?text=Olá%20Aqui%20Tem!%20Quero%20saber%20mais%20sobre%20as%20promoções."
                target="_blank"
                rel="noreferrer"
                className="nav-btn hero-cta-btn hero-cta-whatsapp"
              >
                <MessageCircle size={18} /> {t('chatWhatsapp')}
              </a>
            </div>
          </div>

          <div className="hero-img-container">
            <img
              key={HERO_COVER_IMAGES[heroImageIndex]?.id || heroImageIndex}
              src={HERO_COVER_IMAGES[heroImageIndex]?.url || HERO_COVER_IMAGES[heroImageIndex]?.remoteUrl || HERO_BANNER_FALLBACK}
              alt={HERO_COVER_IMAGES[heroImageIndex]?.title || "Promoções Aqui Tem Angola"}
              referrerPolicy="no-referrer"
              onError={(e) => {
                if (HERO_COVER_IMAGES[heroImageIndex]?.remoteUrl && e.currentTarget.src !== HERO_COVER_IMAGES[heroImageIndex]?.remoteUrl) {
                  e.currentTarget.src = HERO_COVER_IMAGES[heroImageIndex].remoteUrl;
                } else {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = HERO_BANNER_FALLBACK;
                }
              }}
            />
          </div>
        </div>
      </section>

      {/* Highlights Advantages Bar */}
      <section className="advantages-section">
        <div className="advantages-grid">
          {ADVANTAGES.map((adv, index) => {
            const IconComp = [Truck, ShieldCheck, CreditCard, MessageCircle][index] || Zap;
            return (
              <div key={adv.id || index} className="advantage-card">
                <div className="advantage-icon-box">
                  <IconComp size={24} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="advantage-title">{translatedAdvantageTitles[index] || adv.title}</div>
                  <div className="advantage-subtitle">{translatedAdvantageSubs[index] || adv.sub || adv.subtitle}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 📹 Vídeos dos Produtos Rodando em Ação (Seção com Vídeos Ativos e Controles) */}
      <section className="content-section-card">
        <div className="section-card-header">
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Video size={16} /> {t('videoShowcaseBadge')}
            </div>
            <h2 className="section-card-title">
              {t('videoShowcaseTitle')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
              {t('videoShowcaseSub')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="nav-btn nav-btn-icon"
              onClick={() => setActiveVideoStart(prev => Math.max(0, prev - 1))}
              disabled={activeVideoStart === 0}
              style={{ opacity: activeVideoStart === 0 ? 0.5 : 1 }}
              title={t('prevVideo')}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="nav-btn nav-btn-icon"
              onClick={() => setActiveVideoStart(prev => Math.min(PRODUCT_VIDEOS.length - 2, prev + 1))}
              disabled={activeVideoStart >= PRODUCT_VIDEOS.length - 2}
              style={{ opacity: activeVideoStart >= PRODUCT_VIDEOS.length - 2 ? 0.5 : 1 }}
              title={t('nextVideo')}
            >
              <ChevronRight size={18} />
            </button>
            <button
              className="nav-btn nav-btn-orange"
              onClick={() => setIsVideosOpen(true)}
              style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            >
              {t('viewAll')} ({PRODUCT_VIDEOS.length})
            </button>
          </div>
        </div>

        {/* Video Grid (2 videos showcased side-by-side) */}
        <div className="video-showcase-grid">
          {PRODUCT_VIDEOS.slice(activeVideoStart, activeVideoStart + 2).map(item => {
            const translatedVid = getTranslatedVideo(item, lang);
            return (
              <div
                key={item.id}
                className="video-showcase-card"
              >
                <div>
                  <div style={{ position: 'relative', background: '#0F172A' }}>
                    <video
                      key={`${item.id}-${item.videoUrl}`}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      preload="metadata"
                      className="video-showcase-player"
                    >
                      <source src={item.videoUrl} type="video/mp4" />
                      {item.fallbackUrl && <source src={item.fallbackUrl} type="video/mp4" />}
                      {lang === 'en' ? 'Your browser does not support video playback.' : 'Seu navegador não suporta a reprodução deste vídeo.'}
                    </video>
                    <span className="video-showcase-tag">
                      {translatedVid.tag}
                    </span>
                  </div>

                  <div className="video-showcase-body">
                    <div className="video-showcase-cat">
                      {translatedVid.category}
                    </div>
                    <h4 className="video-showcase-title">
                      {translatedVid.title}
                    </h4>
                    <p className="video-showcase-desc">
                      {translatedVid.description}
                    </p>
                  </div>
                </div>

                <div className="video-showcase-footer">
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(`Olá AQUI TEM! Vi o vídeo do produto "${translatedVid.title}" e quero pedir.`);
                      trackWhatsAppLead(
                        translatedVid.title,
                        0
                      );
                      window.open(`https://wa.me/244950752933?text=${msg}`, '_blank');
                    }}
                    className="nav-btn nav-btn-orange"
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.78rem', justifyContent: 'center' }}
                  >
                    <MessageCircle size={14} /> {t('buyWhatsapp')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '18px' }}>
          {PRODUCT_VIDEOS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveVideoStart(idx)}
              style={{
                width: activeVideoStart === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: activeVideoStart === idx ? 'var(--primary-orange)' : 'var(--border-light)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </div>
      </section>

      {/* Category Chips Bar (Organized & Slim) */}
      <section className="categories-section" id="catalogo">
        <div className="category-list">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {getTranslatedCategory(cat, lang)}
            </button>
          ))}

          <button
            className="category-chip"
            style={{ background: '#0F172A', color: '#FFF', fontWeight: 700, border: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            onClick={() => setIsVideosOpen(true)}
          >
            <Video size={14} /> {t('videos')}
          </button>

          <button
            className="category-chip"
            style={{ background: 'linear-gradient(135deg, #1E5C9E, #144376)', color: '#FFF', fontWeight: 700, border: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            onClick={() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Store size={14} /> {t('aboutUs')}
          </button>
        </div>
      </section>

      {/* Products Catalog */}
      <section className="products-section">
        <div className="section-header">
          <h2 className="section-title">
            {t('featuredProducts')} ({filteredProducts.length})
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontWeight: '600',
                fontSize: '0.84rem'
              }}
            >
              <option value="recommended">{t('recommended')}</option>
              <option value="price-low">{t('priceLow')}</option>
              <option value="price-high">{t('priceHigh')}</option>
              <option value="rating">{t('bestRating')}</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-card)',
            borderRadius: '20px',
            border: '1px solid var(--border-light)'
          }}>
            <Search size={48} color="var(--text-light)" style={{ marginBottom: '16px' }} />
            <h3>{lang === 'en' ? 'No products found' : 'Nenhum produto encontrado'}</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
              {lang === 'en' ? 'Try searching for another term or select a different category.' : 'Tente buscar por outro termo ou selecione uma categoria diferente.'}
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => {
              const effectivePrice = getEffectivePrice(product);
              const previousPrice = getPreviousPrice(product);
              const isOutOfStock = Number(product.stock) <= 0;
              const isFav = isInWishlist(product.id);
              const productSlug = product.slug || createSlug(product.name);

              return (
                <div key={product.id} className="product-card">
                  {(isOutOfStock || product.badge) && (
                    <span
                      className="product-badge"
                      style={isOutOfStock ? { background: '#DC2626', color: '#FFFFFF' } : undefined}
                    >
                      {isOutOfStock ? t('outOfStock') : product.badge}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    title={isFav ? t('removeFavorite') : t('addFavorite')}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      zIndex: 6,
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.9)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Heart size={15} color={isFav ? '#F37021' : '#64748B'} fill={isFav ? '#F37021' : 'none'} />
                  </button>

                  <div
                    className={`product-img-wrapper${product.whiteBg ? ' white-bg' : ''}${product.orangeBg ? ' orange-bg' : ''}`}
                    onClick={() => {
                      trackProductView(product.name, effectivePrice);
                      setSelectedProduct(product);
                    }}
                  >
                    <img
                      key={product.image_url || product.image}
                      src={product.image_url || product.image}
                      alt={product.name}
                      onError={(e) => {
                        if (product.fallbackImage && e.currentTarget.src !== product.fallbackImage) {
                          e.currentTarget.src = product.fallbackImage;
                        } else if (product.svgFallbackImage) {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = product.svgFallbackImage;
                        } else {
                          e.currentTarget.onerror = null;
                        }
                      }}
                    />
                  </div>

                  <div className="product-body">
                    <span className="product-category">{product.category}</span>
                    <h3
                      className="product-name"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        trackProductView(product.name, effectivePrice);
                        setSelectedProduct(product);
                      }}
                    >
                      {product.name}
                    </h3>

                    <div className="rating-row">
                      <div className="stars">
                        <Star size={14} fill="#FFB800" color="#FFB800" />
                        <strong style={{ marginLeft: '4px' }}>{product.rating}</strong>
                      </div>
                      <span>({product.reviews_count ?? product.reviewsCount} {t('reviews')})</span>
                    </div>

                    <div className="product-price-box">
                      {previousPrice && (
                        <span className="old-price">{t('before')}: {formatPriceKz(previousPrice, lang)}</span>
                      )}
                      <div className="current-price">{t('now')}: {formatPriceKz(effectivePrice, lang)}</div>
                      {effectivePrice > 0 && (
                        <div className="pix-price">
                          ⚡ {formatPriceKz(effectivePrice * 0.9, lang)} {t('cashDiscount')}
                        </div>
                      )}
                    </div>

                    <div className="product-actions">
                      {isOutOfStock ? (
                        <a
                          href={`https://wa.me/244950752933?text=${encodeURIComponent(
                            `Olá AQUI TEM! Gostaria de saber sobre a reposição/importação do produto "${product.name}".`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-add-cart"
                          style={{ background: '#25D366', textDecoration: 'none', fontSize: '0.78rem' }}
                        >
                          <MessageCircle size={16} /> {t('askRestockWhatsApp')}
                        </a>
                      ) : (
                        <button
                          className="btn-add-cart"
                          onClick={() => addToCart(product)}
                        >
                          <Plus size={18} /> {t('addToCart')}
                        </button>
                      )}
                      <button
                        className="btn-view-details"
                        title={t('viewDetails')}
                        onClick={() => {
                          trackProductView(product.name, effectivePrice);
                          setSelectedProduct(product);
                        }}
                      >
                        <Eye size={18} />
                      </button>
                      <Link
                        to={`/produto/${productSlug}`}
                        className="btn-view-details"
                        title={t('openProductPage')}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 🏬 Sobre a AQUI TEM Section (Página Inicial) */}
      <section
        id="sobre"
        className="content-section-card"
      >
        <div className="about-main-grid">
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', background: 'rgba(255, 101, 0, 0.08)', padding: '4px 12px', borderRadius: '16px', marginBottom: '6px' }}>
              <Store size={15} /> {t('aboutBadge')}
            </div>
            <h2 className="section-card-title" style={{ marginBottom: '8px', lineHeight: '1.2' }}>
              {t('aboutTitle')} <span style={{ color: 'var(--primary-orange)' }}>AQUI TEM</span> Angola
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '12px' }}>
              {t('aboutDesc1')} {t('aboutDesc2')}
            </p>

            <div className="about-features-grid">
              <div style={{ background: 'var(--bg-body)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.8rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={14} /> {t('aboutLocTitle')}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {t('aboutLocDesc')}
                </div>
              </div>

              <div style={{ background: 'var(--bg-body)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ color: '#10B981', fontWeight: 800, fontSize: '0.8rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={14} /> {t('aboutOrigTitle')}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {t('aboutOrigDesc')}
                </div>
              </div>

              <div style={{ background: 'var(--bg-body)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ color: '#1E5C9E', fontWeight: 800, fontSize: '0.8rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Truck size={14} /> {t('aboutProvTitle')}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {t('aboutProvDesc')}
                </div>
              </div>

              <div style={{ background: 'var(--bg-body)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ color: '#25D366', fontWeight: 800, fontSize: '0.8rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MessageCircle size={14} /> {t('aboutSupTitle')}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {t('aboutSupDesc')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveInfoModal('stores')}
                className="nav-btn nav-btn-orange"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                <Store size={15} /> {t('storesAndSupport')}
              </button>
              <button
                onClick={() => setActiveInfoModal('warranty')}
                className="nav-btn"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                <ShieldCheck size={15} /> {t('warrantyAndExchanges')}
              </button>
            </div>
          </div>

          {/* Showroom & Operations Gallery Grid */}
          <div className="about-gallery-grid">
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '160px' }}>
              <img
                src="https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=800&q=80"
                alt="Showroom Central Luanda"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/hero_banner_attendant.jpg";
                }}
              />
              <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.8)', color: '#FFF', fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', backdropFilter: 'blur(4px)' }}>
                {t('galShowroom')}
              </span>
            </div>

            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '160px' }}>
              <img
                src="/flyer_appliances.jpg"
                alt="Estoque e Atendimento AQUI TEM"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.8)', color: '#FFF', fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', backdropFilter: 'blur(4px)' }}>
                {t('galStock')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Modal (Shows Product Description & Product Social Proofs ONLY when opened) */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content modal-product-detail" onClick={e => e.stopPropagation()}>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  ...createProductStructuredData(selectedProduct),
                  '@id': `https://aqui-tem29.vercel.app/produto/${selectedProduct.name
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')}#product`
                })
              }}
            />

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(
                  createBreadcrumbStructuredData(selectedProduct)
                )
              }}
            />
            <button className="btn-close-modal" onClick={() => setSelectedProduct(null)}>
              <X size={20} />
            </button>

            {(() => {
              const liveSelected =
                activeProducts.find(
                  p =>
                    String(p.id) === String(selectedProduct.id) ||
                    (selectedProduct.slug && p.slug === selectedProduct.slug)
                ) || selectedProduct;
              const translatedSelected = getTranslatedProduct(liveSelected, lang);
              const productReviews = getProductTestimonials(liveSelected, lang);
              const effectivePrice = getEffectivePrice(translatedSelected);
              const previousPrice = getPreviousPrice(translatedSelected);
              const isSelectedOutOfStock = Number(translatedSelected.stock) <= 0;
              const selectedSlug = translatedSelected.slug || createSlug(translatedSelected.name);

              return (
                <div>
                  <div className="modal-grid">
                    <div className={`modal-img-col${translatedSelected.whiteBg ? ' white-bg' : ''}${translatedSelected.orangeBg ? ' orange-bg' : ''}`} style={{ position: 'relative' }}>
                      {(isSelectedOutOfStock || translatedSelected.badge) && (
                        <span
                          className="product-badge"
                          style={{
                            top: '12px',
                            left: '12px',
                            ...(isSelectedOutOfStock ? { background: '#DC2626', color: '#FFFFFF' } : {})
                          }}
                        >
                          {isSelectedOutOfStock ? t('outOfStock') : translatedSelected.badge}
                        </span>
                      )}
                      <img
                        key={translatedSelected.image_url || translatedSelected.image}
                        src={translatedSelected.image_url || translatedSelected.image}
                        alt={translatedSelected.name}
                        onError={(e) => {
                          if (translatedSelected.fallbackImage && e.currentTarget.src !== translatedSelected.fallbackImage) {
                            e.currentTarget.src = translatedSelected.fallbackImage;
                          } else if (translatedSelected.svgFallbackImage) {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = translatedSelected.svgFallbackImage;
                          } else {
                            e.currentTarget.onerror = null;
                          }
                        }}
                      />
                    </div>

                    <div className="modal-details-col">
                      <span className="product-category">{translatedSelected.category}</span>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-main)', lineHeight: 1.25 }}>
                        {translatedSelected.name}
                      </h2>

                      <div className="rating-row" style={{ marginTop: '6px', marginBottom: '12px' }}>
                        <div className="stars">
                          <Star size={15} fill="#FFB800" color="#FFB800" />
                          <strong style={{ marginLeft: '4px' }}>{translatedSelected.rating}</strong>
                        </div>
                        <span>({translatedSelected.reviews_count ?? translatedSelected.reviewsCount} {t('reviews')})</span>
                        <span>·</span>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            color: isSelectedOutOfStock ? '#DC2626' : '#16A34A'
                          }}
                        >
                          {isSelectedOutOfStock ? t('outOfStock') : t('inStock')}
                        </span>
                      </div>

                      <div className="product-price-box" style={{ marginTop: '4px', marginBottom: '14px', padding: '14px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        {previousPrice && (
                          <span className="old-price" style={{ fontSize: '0.85rem' }}>
                            {t('before')}: {formatPriceKz(previousPrice, lang)}
                          </span>
                        )}
                        <div className="current-price" style={{ fontSize: '1.5rem' }}>
                          {t('now')}: {formatPriceKz(effectivePrice, lang)}
                        </div>
                        {effectivePrice > 0 && (
                          <div className="pix-price" style={{ fontSize: '0.88rem' }}>
                            ⚡ {formatPriceKz(effectivePrice * 0.9, lang)} {t('cashDiscount')}
                          </div>
                        )}
                      </div>

                      <div className="modal-actions-row">
                        {isSelectedOutOfStock ? (
                          <button
                            className="btn-whatsapp"
                            style={{ flex: 1, justifyContent: 'center' }}
                            onClick={() => {
                              const msg = encodeURIComponent(
                                `Olá AQUI TEM! Gostaria de consultar a reposição/importação do produto "${translatedSelected.name}".`
                              );
                              window.open(`https://wa.me/244950752933?text=${msg}`, '_blank');
                            }}
                          >
                            <MessageCircle size={17} /> {t('askRestockWhatsApp')}
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn-primary"
                              style={{ flex: 1, justifyContent: 'center' }}
                              onClick={() => {
                                addToCart(selectedProduct);
                                setSelectedProduct(null);
                                setIsCartOpen(true);
                              }}
                            >
                              <ShoppingBag size={17} /> {t('buyNow')}
                            </button>

                            <button
                              className="btn-whatsapp"
                              style={{ flex: 1, justifyContent: 'center' }}
                              onClick={() => {
                                const msg = encodeURIComponent(
                                  `Olá AQUI TEM! Tenho interesse no produto "${translatedSelected.name}" pelo valor de ${formatPriceKz(effectivePrice, lang)}.`
                                );
                                window.open(`https://wa.me/244950752933?text=${msg}`, '_blank');
                              }}
                            >
                              <MessageCircle size={17} /> {t('quoteWhatsApp')}
                            </button>
                          </>
                        )}
                      </div>

                      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                        <Link
                          to={`/produto/${selectedSlug}`}
                          onClick={() => setSelectedProduct(null)}
                          style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-orange)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        >
                          <ExternalLink size={14} /> {t('openProductPage')}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Product Description & Technical Specs Section (Inside Product Modal) */}
                  <div className="modal-product-extra">
                    <div className="modal-desc-card">
                      <div className="modal-section-subtitle">
                        <Info size={16} color="var(--primary-orange)" />
                        <span>{t('description')} & {t('technicalSpecs')}</span>
                      </div>
                      <p className="modal-desc-text">
                        {translatedSelected.description}
                      </p>
                      {translatedSelected.specs?.length > 0 && (
                        <div className="modal-specs-pills">
                          {translatedSelected.specs.map((spec, i) => (
                            <span key={i} className="modal-spec-pill">
                              <CheckCircle size={13} color="#10B981" /> {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Product-Specific Social Proof Section (Inside Product Modal) */}
                    <div className="modal-social-proof-box">
                      <div className="modal-sp-header">
                        <div className="modal-section-subtitle" style={{ marginBottom: 0 }}>
                          <Award size={16} color="var(--primary-orange)" />
                          <span>{lang === 'en' ? 'Customer Reviews for this Product' : 'Provas Sociais deste Produto'}</span>
                        </div>
                        <span className="modal-sp-rating-pill">
                          ★ {translatedSelected.rating} ({translatedSelected.reviewsCount} {t('reviews')})
                        </span>
                      </div>

                      <div className="product-reviews-grid">
                        {productReviews.map(review => (
                          <div key={review.id} className="testimonial-card">
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <img
                                  src={review.avatar}
                                  alt={review.name}
                                  className="testimonial-avatar"
                                />
                                <div style={{ minWidth: 0 }}>
                                  <div className="testimonial-author-name">
                                    <span>{review.name}</span>
                                    {review.verified && (
                                      <span className="testimonial-verified-badge">
                                        <CheckCircle size={10} style={{ marginRight: '2px' }} /> {t('verified')}
                                      </span>
                                    )}
                                  </div>
                                  <div className="testimonial-meta">
                                    <MapPin size={11} color="var(--primary-orange)" /> {review.location} • <span>{review.date}</span>
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                                {[...Array(review.rating)].map((_, idx) => (
                                  <Star key={idx} size={12} fill="#FFB800" color="#FFB800" />
                                ))}
                              </div>

                              <p className="testimonial-comment-text">
                                "{review.comment}"
                              </p>
                            </div>

                            <div className="testimonial-footer-row">
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ThumbsUp size={11} color="var(--primary-orange)" /> {review.likes} {t('helpfulCount')}
                              </span>
                              <span style={{ color: '#25D366', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <ShieldCheck size={11} /> {t('securePurchase')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Shared Cart Drawer, Wishlist Modal, Checkout Modal & Toast */}
      <StoreDrawers />

      {/* Ultra-Slim 2-3 Line Footer */}
      <footer className="footer">
        <div className="footer-container">
          {/* Line 1: Small White Transparent PNG Logo + Slogan + WhatsApp */}
          <div className="footer-line-main">
            <a href="#" className="footer-logo-link">
              <img src="/logo.jpg" alt="Logo" height={24} className="footer-logo-png" style={{ filter: 'brightness(0) invert(1)' }} />
            </a>
            <span className="footer-slogan-text">{t('siteSlogan')}</span>
            <span className="footer-dot">•</span>
            <a
              href="https://wa.me/244950752933?text=Olá!"
              target="_blank"
              rel="noreferrer"
              className="footer-wa-inline"
            >
              <MessageCircle size={13} /> WhatsApp: +244 950 752 933
            </a>
          </div>

          {/* Line 2: Essential Navigation Links */}
          <div className="footer-line-links">
            <Link to="/" className="footer-link-item">
              Início
            </Link>
            <span className="footer-dot">•</span>
            <Link to="/produtos" className="footer-link-item">
              Produtos
            </Link>
            <span className="footer-dot">•</span>
            <Link to="/sobre-nos" className="footer-link-item">
              Sobre Nós
            </Link>
            <span className="footer-dot">•</span>
            <Link to="/solucoes" className="footer-link-item">
              Soluções
            </Link>
            <span className="footer-dot">•</span>
            <Link to="/como-funciona" className="footer-link-item">
              Como Funciona
            </Link>
            <span className="footer-dot">•</span>
            <Link to="/contactos" className="footer-link-item">
              Contactos
            </Link>
            <span className="footer-dot">•</span>
            <Link to="/perguntas-frequentes" className="footer-link-item">
              Perguntas Frequentes
            </Link>
            <span className="footer-dot">•</span>
            <Link to="/admin" className="footer-link-item" style={{ textDecoration: 'none' }}>
              {t('adminPanel')}
            </Link>
          </div>

          {/* Line 3: Copyright, Payment & Location */}
          <div className="footer-line-bottom">
            <span>© {new Date().getFullYear()} AQUI TEM • {t('allRightsReserved')} • Multicaixa / Dinheiro / Pagamento na Entrega • Avenida Fidel de Castro, Benfica - Zona Verde, Cabolombo, Luanda - Angola</span>
          </div>
        </div>
      </footer>

      {/* Social Proof Modal */}
      <SocialProofModal
        isOpen={isSocialProofOpen}
        onClose={() => setIsSocialProofOpen(false)}
      />

      {/* Videos Modal */}
      <VideosModal
        isOpen={isVideosOpen}
        onClose={() => setIsVideosOpen(false)}
      />

      {/* CRM Dashboard & Lead Automation Modal */}
      <CRMDashboardModal />
      </div>
    </>
  );
}
