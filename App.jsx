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
  ChevronRight
} from 'lucide-react';
import { PRODUCTS, CATEGORIES, ADVANTAGES, HERO_BANNER_FALLBACK, HERO_COVER_IMAGES } from './data/products';
import { PRODUCT_VIDEOS } from './src/data/videos';
import OriginalLogoImage from './src/components/OriginalLogoImage';
import SocialProofModal from './src/components/SocialProofModal';
import VideosModal from './src/components/VideosModal';

export default function App() {
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
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
    showToast(`"${product.name.slice(0, 25)}..." adicionado ao carrinho!`);
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
      showToast('Cupom AQUITEM10 aplicado! 10% de desconto.');
    } else {
      showToast('Cupom inválido. Tente AQUITEM10');
    }
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchesCategory =
        selectedCategory === 'Todos' || p.category === selectedCategory;
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
  }, [selectedCategory, searchQuery, sortBy]);

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * appliedDiscount;
  const shippingFee = subtotal > 150000 || subtotal === 0 ? 0 : 3000;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Generate WhatsApp Message & Open Link
  const handleWhatsAppCheckoutSubmit = (e) => {
    e.preventDefault();

    if (!checkoutForm.name || !checkoutForm.address) {
      alert('Por favor, preencha o seu nome e endereço de entrega em Angola.');
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
      message += `• ${item.quantity}x ${item.name}\n  Valor: ${formatKz(item.price * item.quantity)}\n`;
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

    window.open(whatsappUrl, '_blank');
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
  };

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
        <span><Zap size={15} /> <strong>aquitem</strong> - tudo em um só lugar</span>
        <span style={{ opacity: 0.6 }}>|</span>
        <span>📱 whatsapp: <strong>950752933</strong></span>
        <span style={{ opacity: 0.6 }}>|</span>
        <span>🇦🇴 entregas rápidas em luanda e todo angola</span>
      </div>

      {/* Header */}
      <header className="header-nav">
        <div className="header-container">
          <button
            className="nav-btn"
            style={{ padding: '8px 12px' }}
            onClick={() => setIsSideMenuOpen(true)}
            title="Abrir Menu Lateral"
          >
            <Menu size={20} />
          </button>

          {/* Logo AQUI TEM - Original Logo with Transparent Background */}
          <a href="#" className="logo-brand">
            <OriginalLogoImage src="/logo.jpg" alt="Aqui Tem" height={62} />
          </a>

          {/* Search Bar */}
          <div className="search-form">
            <div className="search-input-wrapper">
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="pesquisar por fones, smartwatch, air fryer, etc..."
                className="search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X size={16} color="var(--text-muted)" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="nav-actions">
            <button className="nav-btn" onClick={toggleTheme} title="Alternar Tema">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button className="nav-btn" onClick={() => showToast(`Desejos (${wishlist.length} itens)`)}>
              <Heart size={20} color={wishlist.length > 0 ? '#F37021' : 'currentColor'} />
              {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
            </button>

            <button className="nav-btn nav-btn-orange" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={20} />
              <span>Carrinho</span>
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
            style={{ maxWidth: '320px', height: '100vh', margin: '0 0 0 auto', borderRadius: 0, padding: '20px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
              <OriginalLogoImage src="/logo.jpg" alt="Aqui Tem" height={52} />
              <button onClick={() => setIsSideMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className={`category-chip ${selectedCategory === 'Todos' ? 'active' : ''}`}
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                onClick={() => { setSelectedCategory('Todos'); setIsSideMenuOpen(false); }}
              >
                <Grid size={16} /> Loja / Todos os Produtos
              </button>

              <button
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 101, 0, 0.08)', color: 'var(--primary-orange)', borderColor: 'var(--primary-orange)' }}
                onClick={() => { setIsSocialProofOpen(true); setIsSideMenuOpen(false); }}
              >
                <Award size={16} /> Prova Social (Avaliações)
              </button>

              <button
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(30, 92, 158, 0.08)', color: '#1E5C9E', borderColor: '#1E5C9E' }}
                onClick={() => { setIsVideosOpen(true); setIsSideMenuOpen(false); }}
              >
                <Video size={16} /> Vídeos & Unboxings
              </button>

              <button
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                onClick={() => { setActiveInfoModal('about'); setIsSideMenuOpen(false); }}
              >
                <Info size={16} /> Sobre a Aqui Tem
              </button>

              <button
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                onClick={() => { setActiveInfoModal('stores'); setIsSideMenuOpen(false); }}
              >
                <MapPin size={16} /> Lojas & Atendimento
              </button>

              <button
                className="category-chip"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                onClick={() => { setActiveInfoModal('warranty'); setIsSideMenuOpen(false); }}
              >
                <ShieldCheck size={16} /> Garantia & Trocas
              </button>

              <div style={{ borderTop: '1px solid var(--border-light)', margin: '10px 0' }}></div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-orange)', textTransform: 'uppercase' }}>Categorias</span>

              {CATEGORIES.map(c => (
                <button
                  key={c}
                  className={`category-chip ${selectedCategory === c ? 'active' : ''}`}
                  style={{ width: '100%', textAlign: 'left' }}
                  onClick={() => { setSelectedCategory(c); setIsSideMenuOpen(false); }}
                >
                  {c}
                </button>
              ))}

              <div style={{ borderTop: '1px solid var(--border-light)', margin: '10px 0' }}></div>

              <a
                href="https://wa.me/244950752933?text=Olá%20Aqui%20Tem!"
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#25D366', fontWeight: 700, fontSize: '0.95rem' }}
              >
                <MessageCircle size={20} /> WhatsApp: 950752933
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
                  <Store size={18} /> Nossa Estrutura & História
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '-8px' }}>
                  Sobre a Aqui Tem
                </h3>
                <p style={{ lineHeight: 1.6, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  A <strong>Aqui Tem</strong> é a sua loja de referência em Angola para eletrónicos, smartphones, headphones Oraimo, smartwatches, garrafas térmicas, air fryers e eletrodomésticos de última geração. Oferecemos produtos 100% originais com garantia oficial, preços competitivos em Kwanzas e atendimento personalizado.
                </p>

                {/* Portfolio Photo Gallery Grid (No Videos) */}
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-main)' }}>
                  📸 Nossas Lojas, Armazém & Entregas em Angola
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
                    <img src="/hero_banner_attendant.jpg" alt="Showroom Aqui Tem" style={{ width: '100%', height: '130px', objectFit: 'cover' }} />
                    <div style={{ padding: '8px 10px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      🏬 Showroom & Atendimento Presencial
                    </div>
                  </div>

                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
                    <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80" alt="Estoque Selado" style={{ width: '100%', height: '130px', objectFit: 'cover' }} />
                    <div style={{ padding: '8px 10px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      📦 Estoque 100% Original Oraimo
                    </div>
                  </div>

                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
                    <img src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80" alt="Entregas Luanda" style={{ width: '100%', height: '130px', objectFit: 'cover' }} />
                    <div style={{ padding: '8px 10px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      🛵 Estafetas para Entregas em Luanda
                    </div>
                  </div>

                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
                    <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80" alt="Despachos Províncias" style={{ width: '100%', height: '130px', objectFit: 'cover' }} />
                    <div style={{ padding: '8px 10px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      🚚 Envios em 24h via Macon / Trans5
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,101,0,0.06)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.88rem', lineHeight: '1.5', color: 'var(--text-main)' }}>
                  <strong>📍 Localização & Cobertura:</strong> Atendimento presencial e entregas no mesmo dia em Luanda (Kilamba, Talatona, Maianga, Viana, Cazenga). Despachos diários com guia de transporte para todas as províncias de Angola (Benguela, Huambo, Lubango, Cabinda, Namibe, Soyo).
                </div>
              </div>
            )}

            {activeInfoModal === 'stores' && (
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: 'var(--primary-orange)' }}>Nossas Lojas & Atendimento</h3>
                <p style={{ lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '10px' }}>
                  📍 <strong>Luanda, Angola</strong>
                </p>
                <p style={{ lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '10px' }}>
                  📱 <strong>WhatsApp Atendimento:</strong> 950752933
                </p>
                <p style={{ lineHeight: 1.6, color: 'var(--text-muted)' }}>
                  🚚 Entregas rápidas ao domicílio em toda a província de Luanda e despachos seguros para todas as províncias de Angola.
                </p>
              </div>
            )}

            {activeInfoModal === 'warranty' && (
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: 'var(--primary-orange)' }}>Garantia & Trocas</h3>
                <p style={{ lineHeight: 1.6, color: 'var(--text-muted)' }}>
                  Todos os produtos comercializados pela <strong>Aqui Tem</strong> possuem garantia oficial contra defeitos de fabricação. Verifique o seu equipamento no momento da entrega. Para trocas ou suporte, contate a nossa equipe pelo WhatsApp 950752933.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Banner Section */}
      <section className="hero-section">
        <div className="hero-banner">
          <div>
            <div className="hero-tag">
              <Zap size={16} /> aproveita a nossa oferta do mês
            </div>
            <h1 className="hero-title">
              Grande Promoção Na Aqui Tem
            </h1>
            <p className="hero-subtitle">
              visite nossas lojas ou compre online! encontre fones oraimo, smartwatches, air fryers, placas de indução e eletrónicos com entrega rápida em luanda e todo angola.
            </p>
            <div className="hero-cta-group">
              <a href="#catalogo" className="nav-btn nav-btn-orange" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                Ver Produtos <ArrowRight size={18} />
              </a>
              <button
                className="nav-btn"
                style={{ padding: '14px 24px', borderColor: '#25D366', color: '#25D366' }}
                onClick={() => window.open('https://wa.me/244950752933?text=Olá%20AQUI%20TEM!%20Vim%20pelo%20site.', '_blank')}
              >
                <MessageCircle size={20} /> WhatsApp: 950752933
              </button>
            </div>
          </div>
          <div className="hero-img-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '440px', overflow: 'hidden', borderRadius: 'var(--radius-md)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)', border: '2px solid rgba(255, 255, 255, 0.15)', background: '#0F172A' }}>
              
              {/* Invisible flow image to set exact natural container height and aspect ratio */}
              <img
                src={HERO_COVER_IMAGES[0]?.url}
                alt=""
                aria-hidden="true"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '380px',
                  objectFit: 'cover',
                  display: 'block',
                  opacity: 0,
                  pointerEvents: 'none'
                }}
              />

              {/* Stacked Flyer Images for Smooth Crossfade Transition */}
              {HERO_COVER_IMAGES.map((item, idx) => {
                const isActive = heroImageIndex === idx;
                return (
                  <img
                    key={item.id || idx}
                    src={item.url}
                    alt={`Flyer ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      if (e.currentTarget.src !== item.remoteUrl) {
                        e.currentTarget.src = item.remoteUrl;
                      } else {
                        e.currentTarget.src = HERO_BANNER_FALLBACK;
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'scale(1)' : 'scale(1.03)',
                      transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
                      pointerEvents: isActive ? 'auto' : 'none'
                    }}
                  />
                );
              })}

              {/* Navigation Arrows */}
              <button
                onClick={() => setHeroImageIndex(prev => (prev - 1 + HERO_COVER_IMAGES.length) % HERO_COVER_IMAGES.length)}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(4px)',
                  color: '#FFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 5,
                  transition: 'transform 0.2s, background 0.2s'
                }}
                title="Flyer Anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setHeroImageIndex(prev => (prev + 1) % HERO_COVER_IMAGES.length)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(4px)',
                  color: '#FFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 5,
                  transition: 'transform 0.2s, background 0.2s'
                }}
                title="Próximo Flyer"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Pagination Indicators */}
            <div style={{ display: 'flex', gap: '5px', marginTop: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '380px' }}>
              {HERO_COVER_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroImageIndex(idx)}
                  title={`Flyer ${idx + 1}`}
                  style={{
                    width: heroImageIndex === idx ? '22px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    background: heroImageIndex === idx ? 'var(--primary-orange)' : 'rgba(255, 255, 255, 0.35)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Advantage Features */}
      <section className="advantages-section">
        <div className="advantages-grid">
          {ADVANTAGES.map((adv, idx) => (
            <div key={idx} className="advantage-card">
              <div className="advantage-icon-box">
                {adv.icon === 'Truck' && <Truck size={24} />}
                {adv.icon === 'ShieldCheck' && <ShieldCheck size={24} />}
                {adv.icon === 'CreditCard' && <CreditCard size={24} />}
                {adv.icon === 'MessageCircle' && <MessageCircle size={24} />}
              </div>
              <div>
                <h4 className="advantage-title">{adv.title}</h4>
                <p className="advantage-subtitle">{adv.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Homepage Video Showcase Section - 3 Videos Carousel */}
      <section style={{ padding: '32px 24px', background: 'var(--bg-card)', borderRadius: '24px', margin: '32px 0', border: '1px solid var(--border-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Video size={18} /> Vídeos & Unboxings dos Produtos
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: '4px', color: 'var(--text-main)' }}>
              Vídeos dos Produtos Rodando em Ação
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
              Acompanhe 3 vídeos por vez em reprodução contínua. Navegue pelas setas para ver toda a linha.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Carousel Navigation Buttons */}
            <button
              onClick={() => setActiveVideoStart(prev => (prev - 1 + PRODUCT_VIDEOS.length) % PRODUCT_VIDEOS.length)}
              style={{
                background: 'var(--bg-body)',
                border: '1px solid var(--border-light)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)'
              }}
              title="Vídeo Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setActiveVideoStart(prev => (prev + 1) % PRODUCT_VIDEOS.length)}
              style={{
                background: 'var(--bg-body)',
                border: '1px solid var(--border-light)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)'
              }}
              title="Próximo Vídeo"
            >
              <ChevronRight size={20} />
            </button>
            <button
              className="nav-btn nav-btn-orange"
              style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 700 }}
              onClick={() => setIsVideosOpen(true)}
            >
              <Video size={16} /> Ver Todos ({PRODUCT_VIDEOS.length})
            </button>
          </div>
        </div>

        {/* 3 Videos Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '20px' }}>
          {[0, 1, 2].map(offset => {
            const index = (activeVideoStart + offset) % PRODUCT_VIDEOS.length;
            const item = PRODUCT_VIDEOS[index];
            return (
              <div key={`${item.id}-${index}`} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-light)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ position: 'relative', background: '#0F172A' }}>
                  <video
                    key={`${item.id}-${item.videoUrl}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    preload="metadata"
                    style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
                  >
                    <source src={item.videoUrl} type="video/mp4" />
                    {item.fallbackUrl && <source src={item.fallbackUrl} type="video/mp4" />}
                    Seu navegador não suporta a reprodução deste vídeo.
                  </video>
                  <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.85)', color: '#FFB800', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', pointerEvents: 'none' }}>
                    {item.tag}
                  </span>
                </div>
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary-orange)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                    {item.category}
                  </div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: '1.3' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.4' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots Indicators */}
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

      {/* Category Chips */}
      <section className="categories-section" id="catalogo">
        <div className="category-list">
          <button
            className="category-chip"
            style={{ background: 'linear-gradient(135deg, #FF6500, #E55800)', color: '#FFF', fontWeight: 800, border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setIsSocialProofOpen(true)}
          >
            <Award size={16} /> Prova Social (Avaliações)
          </button>

          <button
            className="category-chip"
            style={{ background: '#1E5C9E', color: '#FFF', fontWeight: 800, border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setIsVideosOpen(true)}
          >
            <Video size={16} /> Vídeos & Unboxings
          </button>

          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Products Catalog */}
      <section className="products-section">
        <div className="section-header">
          <h2 className="section-title">
            Produtos em <span>Destaque</span> ({filteredProducts.length})
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Filter size={18} color="var(--text-muted)" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              <option value="recommended">Mais Recomendados</option>
              <option value="price-low">Menor Preço</option>
              <option value="price-high">Maior Preço</option>
              <option value="rating">Melhor Avaliados</option>
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
            <h3>Nenhum produto encontrado</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
              Tente buscar por outro termo ou selecione uma categoria diferente.
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                {product.badge && (
                  <span className="product-badge">{product.badge}</span>
                )}
                
                <div className="product-img-wrapper">
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
                  <h3 className="product-name">{product.name}</h3>

                  <div className="rating-row">
                    <div className="stars">
                      <Star size={14} fill="#FFB800" color="#FFB800" />
                      <strong style={{ marginLeft: '4px' }}>{product.rating}</strong>
                    </div>
                    <span>({product.reviewsCount} avaliações)</span>
                  </div>

                  <div className="product-price-box">
                    {product.oldPrice && (
                      <span className="old-price">Antes: {formatKz(product.oldPrice)}</span>
                    )}
                    <div className="current-price">Agora: {formatKz(product.price)}</div>
                    <div className="pix-price">
                      ⚡ {formatKz(product.price * 0.9)} à vista (10% OFF)
                    </div>
                  </div>

                  <div className="product-actions">
                    <button
                      className="btn-add-cart"
                      onClick={() => addToCart(product)}
                    >
                      <Plus size={18} /> Adicionar
                    </button>
                    <button
                      className="btn-view-details"
                      title="Ver Detalhes"
                      onClick={() => setSelectedProduct(product)}
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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setSelectedProduct(null)}>
              <X size={20} />
            </button>

            <div className="modal-product-grid">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="modal-product-img"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = selectedProduct.fallbackImage;
                }}
              />

              <div>
                <span className="product-category">{selectedProduct.category}</span>
                <h2 style={{ fontSize: '1.5rem', marginTop: '4px', marginBottom: '12px' }}>
                  {selectedProduct.name}
                </h2>

                <div className="rating-row">
                  <div className="stars">
                    <Star size={16} fill="#FFB800" color="#FFB800" />
                    <strong style={{ marginLeft: '4px' }}>{selectedProduct.rating}</strong>
                  </div>
                  <span>({selectedProduct.reviewsCount} avaliações de clientes)</span>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '16px 0' }}>
                  {selectedProduct.description}
                </p>

                <h4 style={{ fontSize: '0.95rem', fontWeight: '800' }}>Especificações e Destaques:</h4>
                <ul className="modal-specs-list">
                  {selectedProduct.specs.map((spec, idx) => (
                    <li key={idx}>
                      <CheckCircle size={15} color="var(--primary-orange)" /> {spec}
                    </li>
                  ))}
                </ul>

                <div className="product-price-box" style={{ margin: '20px 0' }}>
                  {selectedProduct.oldPrice && (
                    <span className="old-price">De: {formatKz(selectedProduct.oldPrice)}</span>
                  )}
                  <div className="current-price" style={{ fontSize: '2rem' }}>
                    Por: {formatKz(selectedProduct.price)}
                  </div>
                  <div className="pix-price" style={{ fontSize: '0.95rem' }}>
                    ⚡ {formatKz(selectedProduct.price * 0.9)} no Pagamento à vista com 10% OFF!
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className="btn-add-cart"
                    style={{ flex: 1, padding: '14px' }}
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                  >
                    <ShoppingBag size={20} /> Comprar Agora
                  </button>
                  <button
                    className="nav-btn"
                    style={{ padding: '14px 20px', borderColor: '#25D366', color: '#25D366' }}
                    onClick={() => {
                      const msg = encodeURIComponent(`Olá AQUI TEM! Tenho interesse no produto: ${selectedProduct.name} (${formatKz(selectedProduct.price)})`);
                      window.open(`https://wa.me/244950752933?text=${msg}`, '_blank');
                    }}
                  >
                    <MessageCircle size={20} /> Orçamento
                  </button>
                </div>
              </div>
            </div>
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
                <h3 style={{ fontSize: '1.2rem' }}>Meu Carrinho</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="cart-body">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto' }}>
                  <ShoppingBag size={56} color="var(--text-light)" style={{ marginBottom: '12px' }} />
                  <h4>Seu carrinho está vazio</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                    Adicione os melhores eletrônicos e eletrodomésticos para finalizar suas compras.
                  </p>
                </div>
              ) : (
                <>
                  {cart.map(item => (
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
                  ))}

                  {/* Cupom de Desconto */}
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input
                      type="text"
                      placeholder="Cupom (ex: AQUITEM10)"
                      className="form-input"
                      value={coupon}
                      onChange={e => setCoupon(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="nav-btn" style={{ padding: '8px 16px' }}>
                      Aplicar
                    </button>
                  </form>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-summary-row">
                  <span>Subtotal:</span>
                  <span>{formatKz(subtotal)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="cart-summary-row" style={{ color: 'var(--accent-green)' }}>
                    <span>Desconto Cupom:</span>
                    <span>-{formatKz(discountAmount)}</span>
                  </div>
                )}
                <div className="cart-summary-row">
                  <span>Entrega:</span>
                  <span>{shippingFee === 0 ? <strong style={{ color: 'var(--accent-green)' }}>GRÁTIS</strong> : formatKz(shippingFee)}</span>
                </div>
                <div className="cart-summary-total">
                  <span>Total:</span>
                  <span>{formatKz(finalTotal)}</span>
                </div>

                <button
                  className="btn-whatsapp-checkout"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  <Send size={20} /> Finalizar Pedido no WhatsApp
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
                <h3 style={{ fontSize: '1.3rem' }}>Finalizar via WhatsApp</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  AQUI TEM - Tudo em um só lugar (Angola)
                </p>
              </div>
            </div>

            <form onSubmit={handleWhatsAppCheckoutSubmit}>
              <div className="form-group">
                <label className="form-label">Seu Nome Completo *</label>
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
                <label className="form-label">Telefone / WhatsApp *</label>
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
                <label className="form-label">Endereço de Entrega *</label>
                <input
                  type="text"
                  required
                  placeholder="Bairro, Rua ou Ponto de Referência"
                  className="form-input"
                  value={checkoutForm.address}
                  onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Província / Cidade *</label>
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
                <label className="form-label">Forma de Pagamento Preferida</label>
                <select
                  className="form-input"
                  value={checkoutForm.paymentMethod}
                  onChange={e => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value })}
                >
                  <option value="Pagamento na Entrega (Multicaixa / Cash)">Pagamento na Entrega (Multicaixa / Cash)</option>
                  <option value="Transferência Bancária / Express Kz">Transferência Bancária / Express Kz</option>
                  <option value="A Prazo / Cotação WhatsApp">Cotação & Confirmação via WhatsApp</option>
                </select>
              </div>

              <button type="submit" className="btn-whatsapp-checkout" style={{ marginTop: '24px' }}>
                <Send size={20} /> Enviar Pedido para WhatsApp (950752933)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <a href="#" className="logo-brand" style={{ marginBottom: '16px', display: 'inline-block' }}>
              <OriginalLogoImage src="/logo.jpg" alt="Aqui Tem" height={70} />
            </a>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              A sua loja de confiança para eletrónicos, fones Oraimo, smartwatches, garrafas térmicas, air fryers e eletrodomésticos com as melhores condições e entregas em Angola.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#FFF', marginBottom: '16px' }}>Categorias</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              {CATEGORIES.filter(c => c !== 'Todos').map(cat => (
                <li key={cat}>
                  <a href="#catalogo" onClick={() => setSelectedCategory(cat)}>{cat}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFF', marginBottom: '16px' }}>Atendimento & Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li>
                <button
                  onClick={() => setIsSocialProofOpen(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: 0, fontSize: '0.9rem', textAlign: 'left' }}
                >
                  ⭐ Prova Social (Avaliações)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsVideosOpen(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: 0, fontSize: '0.9rem', textAlign: 'left' }}
                >
                  📹 Vídeos & Unboxings (Demonstrações)
                </button>
              </li>
              <li>WhatsApp: 950752933</li>
              <li>Atendimento Diário</li>
              <li>Luanda & Províncias de Angola</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFF', marginBottom: '16px' }}>Pagamento Seguro</h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
              Multicaixa Express, Transferência Bancária Kz e Pagamento na Entrega.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} AQUI TEM - Tudo em um só lugar. Todos os direitos reservados.
          </div>
          <div>
            Luanda, Angola
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
    </div>
  );
}
