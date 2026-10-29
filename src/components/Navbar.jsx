import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  Heart,
  Moon,
  Sun,
  Home,
  Package,
  Info,
  Briefcase,
  HelpCircle,
  Phone,
  CheckCircle,
  Lock,
  Grid,
  Store,
  Video,
  ShieldCheck,
  MapPin,
  MessageCircle,
  Users,
  BarChart3
} from 'lucide-react';

import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../../data/products';
import { getTranslatedCategory } from '../utils/productTranslations';

export default function Navbar() {
  const { lang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    cart,
    setIsCartOpen,
    wishlist,
    setIsWishlistOpen,
    theme,
    toggleTheme
  } = useStore();

  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/produtos?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/produtos');
    }
  };

  const navItems = [
    { label: t('navHome') || 'Início', path: '/' },
    { label: t('navProducts') || 'Produtos', path: '/produtos', badge: 'Catálogo' },
    { label: t('navAbout') || 'Sobre Nós', path: '/sobre-nos' },
    { label: t('navSolutions') || 'Soluções', path: '/solucoes' },
    { label: t('navHowItWorks') || 'Como Funciona', path: '/como-funciona' },
    { label: t('navContact') || 'Contactos', path: '/contactos' },
    { label: t('navFaq') || 'Perguntas Frequentes', path: '/perguntas-frequentes' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="top-bar">
        <span className="top-bar-main">{t('topBarMsg')}</span>
        <span className="top-bar-sep" style={{ opacity: 0.6 }}>|</span>
        <span className="top-bar-sub">📱 {t('whatsappSupport')}</span>
        <span className="top-bar-sep" style={{ opacity: 0.6 }}>|</span>
        <span className="top-bar-sub">🇦🇴 {t('fastDelivery')}</span>
      </div>

      {/* Main Header Taskbar */}
      <header className="header-nav">
        <div className="header-container">
          <div className="header-left">
            <button
              className="nav-btn nav-btn-icon"
              onClick={() => setIsSideMenuOpen(true)}
              title="Abrir Menu de Navegação"
              aria-label="Abrir Menu de Navegação"
            >
              <Menu size={18} />
            </button>

            <Link to="/" className="logo-brand">
              <img src="/logo.jpg" alt="AQUI TEM Angola" height={40} className="header-logo-img" />
            </Link>
          </div>

          {/* Search Form */}
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <Search size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder={t('searchPlaceholder') || 'Buscar tecnologia, fones, smartwatches, eletrodomésticos...'}
                className="search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: 0, cursor: 'pointer' }}
                >
                  <X size={14} color="var(--text-muted)" />
                </button>
              )}
            </div>
          </form>

          {/* Navigation Actions */}
          <div className="nav-actions">
            <LanguageSelector className="desktop-only-lang" />

            <button
              className="nav-btn nav-btn-icon"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <button
              className="nav-btn nav-btn-icon"
              onClick={() => setIsWishlistOpen(true)}
              title={t('wishlist') || 'Favoritos'}
            >
              <Heart
                size={16}
                color={wishlist.length > 0 ? '#F37021' : 'currentColor'}
                fill={wishlist.length > 0 ? '#F37021' : 'none'}
              />
              {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
            </button>

            <button
              className="nav-btn nav-btn-orange nav-btn-cart"
              onClick={() => setIsCartOpen(true)}
              title={t('cart') || 'Carrinho'}
            >
              <ShoppingBag size={16} />
              <span className="nav-btn-label">{t('cart') || 'Carrinho'}</span>
              {cart.length > 0 && (
                <span className="badge-count" style={{ background: '#FFF', color: '#F37021' }}>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>


      {/* Side Menu Drawer (Mobile & Quick Access) */}
      {isSideMenuOpen && (
        <div className="modal-overlay" onClick={() => setIsSideMenuOpen(false)}>
          <div
            className="modal-content"
            style={{
              maxWidth: '310px',
              height: '100vh',
              margin: '0 0 0 auto',
              borderRadius: 0,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border-light)'
              }}
            >
              <img src="/logo.jpg" alt="AQUI TEM" height={38} />
              <button
                onClick={() => setIsSideMenuOpen(false)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                  {t('selectLanguage') || 'Idioma'}:
                </span>
                <LanguageSelector />
              </div>

              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary-orange)', textTransform: 'uppercase', marginTop: '6px', marginBottom: '4px' }}>
                Páginas do Site:
              </span>

              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`category-chip ${active ? 'active' : ''}`}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textDecoration: 'none',
                      fontWeight: active ? 800 : 600
                    }}
                    onClick={() => setIsSideMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                    {item.badge && <span className="nav-link-badge">{item.badge}</span>}
                  </Link>
                );
              })}

              <div style={{ borderTop: '1px solid var(--border-light)', margin: '10px 0' }}></div>

              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary-orange)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Categorias de Produtos:
              </span>

              {CATEGORIES.map(c => (
                <Link
                  key={c}
                  to={`/produtos?cat=${encodeURIComponent(c)}`}
                  className="category-chip"
                  style={{ width: '100%', textAlign: 'left', textDecoration: 'none', fontSize: '0.84rem' }}
                  onClick={() => setIsSideMenuOpen(false)}
                >
                  {getTranslatedCategory(c, lang)}
                </Link>
              ))}

              <div style={{ borderTop: '1px solid var(--border-light)', margin: '10px 0' }}></div>

              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary-orange)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Gestão & Administração:
              </span>

              <Link
                to="/admin"
                className="category-chip"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  background: 'rgba(30, 92, 158, 0.08)',
                  color: '#1E5C9E'
                }}
                onClick={() => setIsSideMenuOpen(false)}
              >
                <Lock size={15} /> Painel Administrativo (Produtos)
              </Link>

              <Link
                to="/admin?tab=crm"
                className="category-chip"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  background: 'rgba(255, 101, 0, 0.08)',
                  color: 'var(--primary-orange)',
                  borderColor: 'rgba(255, 101, 0, 0.25)'
                }}
                onClick={() => setIsSideMenuOpen(false)}
              >
                <BarChart3 size={15} /> CRM & Gestão de Leads
              </Link>

              <a
                href="https://wa.me/244950752933?text=Ol%C3%A1%20AQUI%20TEM!"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#25D366',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  marginTop: '12px',
                  textDecoration: 'none'
                }}
              >
                <MessageCircle size={18} /> WhatsApp: 950752933
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
