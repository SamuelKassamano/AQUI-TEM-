import React, { useState, useMemo, useEffect } from 'react';
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
  BarChart3
} from 'lucide-react';
import { PRODUCTS, CATEGORIES, ADVANTAGES, HERO_BANNER_FALLBACK, HERO_COVER_IMAGES } from './data/products';
import { PRODUCT_VIDEOS } from './src/data/videos';
import { TESTIMONIALS } from './src/data/testimonials';
import { getAssetUrl } from './src/utils/assets';
import OriginalLogoImage from './src/components/OriginalLogoImage';
import SocialProofModal from './src/components/SocialProofModal';
import VideosModal from './src/components/VideosModal';
import CRMDashboardModal from './src/components/CRMDashboardModal';
import { useLanguage } from './src/context/LanguageContext';
import { initAllPixels, trackProductView, trackWhatsAppLead } from './src/utils/pixelRetargeting';
import { useCRM } from './src/context/CRMContext';
import LanguageSelector from './src/components/LanguageSelector';
import { getTranslatedProduct, getTranslatedCategory, getTranslatedVideo, getTranslatedTestimonial, getProductTestimonials } from './src/utils/productTranslations';
import {
  createProductStructuredData,
  createBreadcrumbStructuredData
} from './src/seo/structuredData';

export default function App() {
  const { lang, t } = useLanguage();
  const { openCRM, captureLead } = useCRM();

  // Inicializa os pixels de remarketing
  useEffect(() => {
    initAllPixels();
  }, []);


  // State management
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isSocialProofOpen, setIsSocialProofOpen] = useState(false);
  const [isVideosOpen, setIsVideosOpen] = useState(false);
  const [activeVideoStart, setActiveVideoStart] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState(null);
  const [theme, setTheme] = useState('light');
  const [toastMessage, setToastMessage] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Auto-switch cover flyers every 15 seconds
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroImageIndex(prev => (prev + 1) % HERO_COVER_IMAGES.length);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Form state for WhatsApp checkout
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '950752933',
    address: '',
    city: 'Luanda',
    paymentMethod: 'Pagamento na Entrega (Multicaixa / Cash)'
  });

  // Currency Formatter (Kwanzas - Kz)
  const formatKz = (val) => {
    return new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 0 }).format(val) + ' Kz';
  };

  // Toggle Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Toast Notification trigger
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    const translatedProd = getTranslatedProduct(product, lang);
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...translatedProd, quantity }];
    });
    showToast(`"${translatedProd.name.slice(0, 25)}..." ${lang === 'en' ? 'added to cart!' : 'adicionado ao carrinho!'}`);
  };

  // Update item quantity
  const updateQuantity = (id, delta) => {
    setCart(prevCart =>
      prevCart
        .map(item => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Remove from cart
  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  // Toggle Wishlist
  const toggleWishlist = (id) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Apply Coupon
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === 'AQUITEM10') {
      setAppliedDiscount(0.10);
      showToast(lang === 'en' ? 'Coupon AQUITEM10 applied! 10% discount.' : 'Cupom AQUITEM10 aplicado! 10% de desconto.');
    } else {
      showToast(lang === 'en' ? 'Invalid coupon. Try AQUITEM10' : 'Cupom inválido. Tente AQUITEM10');
    }
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.map(p => getTranslatedProduct(p, lang)).filter(p => {
      const canonicalSelected = getTranslatedCategory(selectedCategory, 'pt');
      const matchesCategory =
        selectedCategory === 'Todos' ||
        selectedCategory === 'All' ||
        p.category === canonicalSelected ||
        p.originalCategory === canonicalSelected ||
        getTranslatedCategory(p.category, lang) === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // Default recommended
    });
  }, [selectedCategory, searchQuery, sortBy, lang]);

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * appliedDiscount;
  const shippingFee = subtotal > 150000 || subtotal === 0 ? 0 : 3000;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Generate WhatsApp Message & Open Link
  const handleWhatsAppCheckoutSubmit = (e) => {
    e.preventDefault();

    if (!checkoutForm.name || !checkoutForm.address) {
      alert(lang === 'en' ? 'Please fill in your full name and delivery address in Angola.' : 'Por favor, preencha o seu nome e endereço de entrega em Angola.');
      return;
    }

    let message = `🛒 *NOVO PEDIDO - AQUI TEM (Tudo em um só lugar)*\n`;
    message += `------------------------------------\n`;
    message += `👤 *Cliente:* ${checkoutForm.name}\n`;
    message += `📞 *Telefone/WhatsApp:* ${checkoutForm.phone || '950752933'}\n`;
    message += `📍 *Endereço de Entrega:* ${checkoutForm.address} (${checkoutForm.city})\n`;
    message += `💳 *Forma de Pagamento:* ${checkoutForm.paymentMethod}\n`;
    message += `------------------------------------\n`;
    message += `📦 *PRODUTOS SELECIONADOS:*\n\n`;

    cart.forEach(item => {
      const translatedItem = getTranslatedProduct(item, lang);
      message += `• ${item.quantity}x ${translatedItem.name}\n  Valor: ${formatKz(item.price * item.quantity)}\n`;
    });

    message += `\n------------------------------------\n`;
    message += `Subtotal: ${formatKz(subtotal)}\n`;
    if (appliedDiscount > 0) {
      message += `Desconto (Cupom): -${formatKz(discountAmount)}\n`;
    }
    message += `Entrega: ${shippingFee === 0 ? 'GRÁTIS' : formatKz(shippingFee)}\n`;
    message += `💰 *TOTAL FINAL: ${formatKz(finalTotal)}*\n`;
    message += `------------------------------------\n`;
    message += `Aguardando confirmação para envio em Luanda / Províncias! 🚀`;

    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = '244950752933';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Auto capture Lead in CRM
    captureLead({
      name: checkoutForm.name,
      phone: checkoutForm.phone || '950752933',
      city: checkoutForm.city || 'Luanda',
      address: checkoutForm.address || 'Angola',
      productName: cart.map(i => i.name).join(', ') || 'Pedido de Carrinho',
      totalValue: finalTotal,
      notes: `Forma de Pagamento: ${checkoutForm.paymentMethod}`
    });

    window.open(whatsappUrl, '_blank');
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
  };

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
    <div className="app-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #F37021, #D95D12)',
          color: '#FFF',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(243, 112, 33, 0.4)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '700',
          fontSize: '0.95rem'
        }}>
          <CheckCircle size={20} />
          {toastMessage}
        </div>
      )}

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
              <OriginalLogoImage src="/logo.jpg" alt="Aqui Tem" height={32} className="header-logo-img" />
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

            <button
              className="nav-btn nav-btn-crm desktop-only-action"
              onClick={openCRM}
              title="Painel CRM & Gestão de Leads"
            >
              <BarChart3 size={15} />
              <span className="nav-btn-label">CRM</span>
            </button>

            <button className="nav-btn nav-btn-icon" onClick={toggleTheme} title="Alternar Tema">
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <button
              className="nav-btn nav-btn-icon desktop-only-action"
              onClick={() => showToast(`${t('wishlist')} (${wishlist.length} ${t('items')})`)}
              title={t('wishlist')}
            >
              <Heart size={16} color={wishlist.length > 0 ? '#F37021' : 'currentColor'} />
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
              <OriginalLogoImage src="/logo.jpg" alt="Aqui Tem" height={40} />
              <button onClick={() => setIsSideMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>{t('selectLanguage')}:</span>
                <LanguageSelector />
              </div>

              <button
                className={`category-chip ${selectedCategory === 'Todos' || selectedCategory === 'All' ? 'active' : ''}`}
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                onClick={() => { setSelectedCategory('Todos'); setIsSideMenuOpen(false); }}
              >
                <Grid size={15} /> {t('catAll')}
              </button>

              <button
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                onClick={() => {
                  setIsSideMenuOpen(false);
                  document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Store size={15} /> {t('aboutUs')}
              </button>

              <button
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(30, 92, 158, 0.08)', color: '#1E5C9E', borderColor: '#1E5C9E' }}
                onClick={() => { setIsVideosOpen(true); setIsSideMenuOpen(false); }}
              >
                <Video size={15} /> {t('videos')}
              </button>

              <button
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                onClick={() => { setActiveInfoModal('stores'); setIsSideMenuOpen(false); }}
              >
                <MapPin size={15} /> {t('storesAndSupport')}
              </button>

              <button
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                onClick={() => { setActiveInfoModal('warranty'); setIsSideMenuOpen(false); }}
              >
                <ShieldCheck size={15} /> {t('warrantyAndExchanges')}
              </button>

              <button
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 101, 0, 0.08)', color: 'var(--primary-orange)', borderColor: 'var(--primary-orange)' }}
                onClick={() => { openCRM(); setIsSideMenuOpen(false); }}
              >
                <BarChart3 size={15} /> Painel CRM
              </button>

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
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{lang === 'en' ? 'Our Stores & Showrooms in Luanda' : 'Nossas Lojas & Atendimento Presencial em Luanda'}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {lang === 'en'
                    ? 'Visit our showrooms or place your order directly via WhatsApp for same-day delivery.'
                    : 'Visite as nossas lojas físicas ou faça a sua encomenda pelo WhatsApp com entrega no mesmo dia.'
                  }
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                    <strong>🏪 Showroom Central Luanda (Kilamba):</strong> Bloco X, Luanda
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {lang === 'en' ? 'Hours: Mon to Sat from 8:00 AM to 6:00 PM' : 'Horário: Segunda a Sábado das 08h00 às 18h00'}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                    <strong>🚚 {lang === 'en' ? 'Luanda Fast Dispatch Center' : 'Centro de Logística e Entregas (Talatona & Viana)'}:</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {lang === 'en' ? 'Same-day delivery service with mobile POS terminal.' : 'Atendimento express com TPA no local de entrega.'}
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
              alt="Promoções Aqui Tem Angola"
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
            {/* Carousel Dots */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '6px',
              background: 'rgba(0,0,0,0.5)',
              padding: '4px 10px',
              borderRadius: '20px',
              backdropFilter: 'blur(4px)',
              maxWidth: '92%',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {HERO_COVER_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroImageIndex(idx)}
                  style={{
                    width: heroImageIndex === idx ? '18px' : '7px',
                    height: '7px',
                    borderRadius: '4px',
                    background: heroImageIndex === idx ? 'var(--primary-orange)' : 'rgba(255,255,255,0.6)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
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
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                {product.badge && (
                  <span className="product-badge">{product.badge}</span>
                )}
                
                <div
                  className="product-img-wrapper"
                  onClick={() => {
                    trackProductView(product.name, product.price);
                    setSelectedProduct(product);
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = product.fallbackImage;
                    }}
                  />
                </div>

                <div className="product-body">
                  <span className="product-category">{product.category}</span>
                  <h3
                    className="product-name"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      trackProductView(product.name, product.price);
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
                    <span>({product.reviewsCount} {t('reviews')})</span>
                  </div>

                  <div className="product-price-box">
                    {product.oldPrice && (
                      <span className="old-price">{t('before')}: {formatKz(product.oldPrice)}</span>
                    )}
                    <div className="current-price">{t('now')}: {formatKz(product.price)}</div>
                    <div className="pix-price">
                      ⚡ {formatKz(product.price * 0.9)} {t('cashDiscount')}
                    </div>
                  </div>

                  <div className="product-actions">
                    <button
                      className="btn-add-cart"
                      onClick={() => addToCart(product)}
                    >
                      <Plus size={18} /> {t('addToCart')}
                    </button>
                    <button
                      className="btn-view-details"
                      title={t('viewDetails')}
                      onClick={() => {
                        trackProductView(product.name, product.price);
                        setSelectedProduct(product);
                      }}
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', background: 'rgba(255, 101, 0, 0.08)', padding: '4px 12px', borderRadius: '16px', marginBottom: '8px' }}>
              <Store size={16} /> {t('aboutBadge')}
            </div>
            <h2 className="section-card-title" style={{ marginBottom: '10px', lineHeight: '1.2' }}>
              {t('aboutTitle')} <span style={{ color: 'var(--primary-orange)' }}>AQUI TEM</span> Angola
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '10px' }}>
              {t('aboutDesc1')}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '14px' }}>
              {t('aboutDesc2')}
            </p>

            <div className="about-features-grid">
              <div style={{ background: 'var(--bg-body)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.82rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={14} /> {t('aboutLocTitle')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {t('aboutLocDesc')}
                </div>
              </div>

              <div style={{ background: 'var(--bg-body)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ color: '#10B981', fontWeight: 800, fontSize: '0.82rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={14} /> {t('aboutOrigTitle')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {t('aboutOrigDesc')}
                </div>
              </div>

              <div style={{ background: 'var(--bg-body)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ color: '#1E5C9E', fontWeight: 800, fontSize: '0.82rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Truck size={14} /> {t('aboutProvTitle')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {t('aboutProvDesc')}
                </div>
              </div>

              <div style={{ background: 'var(--bg-body)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ color: '#25D366', fontWeight: 800, fontSize: '0.82rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MessageCircle size={14} /> {t('aboutSupTitle')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {t('aboutSupDesc')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveInfoModal('stores')}
                className="nav-btn nav-btn-orange"
                style={{ padding: '10px 18px', fontSize: '0.85rem' }}
              >
                <Store size={16} /> {t('storesAndSupport')}
              </button>
              <button
                onClick={() => setActiveInfoModal('warranty')}
                className="nav-btn"
                style={{ padding: '10px 18px', fontSize: '0.85rem' }}
              >
                <ShieldCheck size={16} /> {t('warrantyAndExchanges')}
              </button>
            </div>
          </div>

          {/* Showroom & Operations Gallery Grid */}
          <div className="about-gallery-grid">
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '180px' }}>
              <img
                src="https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=800&q=80"
                alt="Showroom Central Luanda"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getAssetUrl('/hero_banner_attendant.jpg');
                }}
              />
              <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.8)', color: '#FFF', fontSize: '0.72rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', backdropFilter: 'blur(4px)' }}>
                {t('galShowroom')}
              </span>
            </div>

            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '180px' }}>
              <img
                src={getAssetUrl('/flyer_appliances.jpg')}
                alt="Estoque e Atendimento AQUI TEM"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.8)', color: '#FFF', fontSize: '0.72rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', backdropFilter: 'blur(4px)' }}>
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
              const translatedSelected = getTranslatedProduct(selectedProduct, lang);
              const productReviews = getProductTestimonials(selectedProduct, lang);
              return (
                <div>
                  <div className="modal-grid">
                    <div className="modal-img-col">
                      <img
                        src={translatedSelected.image}
                        alt={translatedSelected.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = translatedSelected.fallbackImage;
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
                        <span>({translatedSelected.reviewsCount} {t('reviews')})</span>
                      </div>

                      <div className="product-price-box" style={{ marginTop: '4px', marginBottom: '14px', padding: '14px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        {translatedSelected.oldPrice && (
                          <span className="old-price" style={{ fontSize: '0.85rem' }}>
                            {t('before')}: {formatKz(translatedSelected.oldPrice)}
                          </span>
                        )}
                        <div className="current-price" style={{ fontSize: '1.5rem' }}>
                          {t('now')}: {formatKz(translatedSelected.price)}
                        </div>
                        <div className="pix-price" style={{ fontSize: '0.88rem' }}>
                          ⚡ {formatKz(translatedSelected.price * 0.9)} {t('cashDiscount')}
                        </div>
                      </div>

                      <div className="modal-actions-row">
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
                            const msg = encodeURIComponent(`Olá AQUI TEM! Tenho interesse no produto "${translatedSelected.name}" (${formatKz(translatedSelected.price)}). Poderia me passar mais informações?`);
                            window.open(`https://wa.me/244950752933?text=${msg}`, '_blank');
                          }}
                        >
                          <MessageCircle size={17} /> {t('quoteWhatsApp')}
                        </button>
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

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag size={22} color="var(--primary-orange)" />
                <h3 style={{ fontSize: '1.2rem' }}>{t('cart')}</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="cart-body">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto' }}>
                  <ShoppingBag size={56} color="var(--text-light)" style={{ marginBottom: '12px' }} />
                  <h4>{t('cartEmpty')}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                    {t('cartEmptySub')}
                  </p>
                </div>
              ) : (
                <>
                  {cart.map(rawItem => {
                    const item = getTranslatedProduct(rawItem, lang);
                    return (
                      <div key={item.id} className="cart-item">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="cart-item-img"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = item.fallbackImage;
                          }}
                        />
                        <div className="cart-item-details">
                          <div className="cart-item-title">{item.name}</div>
                          <div className="cart-item-price">
                            {formatKz(item.price * item.quantity)}
                          </div>
                          <div className="qty-controls">
                            <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>
                              <Minus size={14} />
                            </button>
                            <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{item.quantity}</span>
                            <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--text-light)' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}

                  {/* Cupom de Desconto */}
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input
                      type="text"
                      placeholder={t('couponPlaceholder')}
                      className="form-input"
                      value={coupon}
                      onChange={e => setCoupon(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="nav-btn" style={{ padding: '8px 16px' }}>
                      {t('apply')}
                    </button>
                  </form>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-summary-row">
                  <span>{t('subtotal')}:</span>
                  <span>{formatKz(subtotal)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="cart-summary-row" style={{ color: 'var(--accent-green)' }}>
                    <span>{t('couponDiscount')}:</span>
                    <span>-{formatKz(discountAmount)}</span>
                  </div>
                )}
                <div className="cart-summary-row">
                  <span>{t('delivery')}:</span>
                  <span>{shippingFee === 0 ? <strong style={{ color: 'var(--accent-green)' }}>{t('free')}</strong> : formatKz(shippingFee)}</span>
                </div>
                <div className="cart-summary-total">
                  <span>Total:</span>
                  <span>{formatKz(finalTotal)}</span>
                </div>

                <button
                  className="btn-whatsapp-checkout"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  <Send size={20} /> {t('checkoutWhatsApp')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WhatsApp Checkout Form Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '520px', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setIsCheckoutOpen(false)}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#25D366', color: '#FFF', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem' }}>{t('checkoutTitle')}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  AQUI TEM - {t('siteSlogan')} (Angola)
                </p>
              </div>
            </div>

            <form onSubmit={handleWhatsAppCheckoutSubmit}>
              <div className="form-group">
                <label className="form-label">{t('fullName')} *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manuel Kassamano"
                  className="form-input"
                  value={checkoutForm.name}
                  onChange={e => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('phoneWhatsApp')} *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 950752933"
                  className="form-input"
                  value={checkoutForm.phone}
                  onChange={e => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('deliveryAddress')} *</label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'en' ? 'Neighborhood, Street, Reference Point' : 'Bairro, Rua ou Ponto de Referência'}
                  className="form-input"
                  value={checkoutForm.address}
                  onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('provinceCity')} *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Luanda"
                  className="form-input"
                  value={checkoutForm.city}
                  onChange={e => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('paymentMethod')}</label>
                <select
                  className="form-input"
                  value={checkoutForm.paymentMethod}
                  onChange={e => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value })}
                >
                  <option value="Pagamento na Entrega (Multicaixa / Cash)">{t('payOnDelivery')}</option>
                  <option value="Transferência Bancária / Express Kz">{t('bankTransfer')}</option>
                  <option value="A Prazo / Cotação WhatsApp">{t('quoteWhatsApp')}</option>
                </select>
              </div>

              <button type="submit" className="btn-whatsapp-checkout" style={{ marginTop: '24px' }}>
                <Send size={20} /> {t('sendOrderWhatsApp')} (950752933)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ultra-Slim 2-3 Line Footer */}
      <footer className="footer">
        <div className="footer-container">
          {/* Line 1: Small Transparent PNG Logo + Slogan + WhatsApp */}
          <div className="footer-line-main">
            <a href="#" className="footer-logo-link">
              <OriginalLogoImage src="/logo.jpg" alt="Logo" height={22} className="footer-logo-png" />
            </a>
            <span className="footer-slogan-text">{t('siteSlogan')}</span>
            <span className="footer-dot">•</span>
            <a
              href="https://wa.me/244950752933?text=Olá!"
              target="_blank"
              rel="noreferrer"
              className="footer-wa-inline"
            >
              <MessageCircle size={12} /> WhatsApp: 950 752 933
            </a>
          </div>

          {/* Line 2: Essential Navigation Links */}
          <div className="footer-line-links">
            <a href="#catalogo" className="footer-link-item" onClick={() => setSelectedCategory('Todos')}>
              {t('catAll')}
            </a>
            <span className="footer-dot">•</span>
            <button type="button" className="footer-link-item" onClick={() => setIsVideosOpen(true)}>
              {t('videos')}
            </button>
            <span className="footer-dot">•</span>
            <button type="button" className="footer-link-item" onClick={() => setActiveInfoModal('stores')}>
              {t('storesSupport')}
            </button>
            <span className="footer-dot">•</span>
            <button type="button" className="footer-link-item" onClick={() => setActiveInfoModal('warranty')}>
              {t('warrantyAndExchanges')}
            </button>
          </div>

          {/* Line 3: Copyright, Payment & Location */}
          <div className="footer-line-bottom">
            <span>© {new Date().getFullYear()} {t('allRightsReserved')} • TPA / Cash na Entrega • {t('luandaAngola')}</span>
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
  );
}
