import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Star,
  CheckCircle,
  MapPin,
  ThumbsUp,
  ShieldCheck,
  Award,
  MessageCircle,
  ShoppingBag,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';
import { createSlug } from '../utils/slug';
import { getProductTestimonials } from '../utils/productTranslations';

export default function ProductQuickViewModal({ product, onClose }) {
  const { lang, t } = useLanguage();
  const {
    addToCart,
    setDirectCheckoutItem,
    setIsCheckoutOpen,
    getEffectivePrice,
    getPreviousPrice,
    formatPriceKz
  } = useStore();

  const [activeTab, setActiveTab] = useState('specs');

  if (!product) return null;

  const effectivePrice = getEffectivePrice(product);
  const previousPrice = getPreviousPrice(product);
  const isOutOfStock = Number(product.stock) <= 0;
  const productSlug = product.slug || createSlug(product.name);
  const reviews = getProductTestimonials(product, lang);

  const handleBuyNow = () => {
    setDirectCheckoutItem({
      ...product,
      quantity: 1
    });
    setIsCheckoutOpen(true);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-product-detail" onClick={e => e.stopPropagation()}>
        <button className="btn-close-modal" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-grid">
          <div className={`modal-img-col${product.whiteBg ? ' white-bg' : ''}${product.orangeBg ? ' orange-bg' : ''}`} style={{ position: 'relative' }}>
            {(isOutOfStock || product.badge) && (
              <span
                className="product-badge"
                style={{
                  top: '12px',
                  left: '12px',
                  ...(isOutOfStock ? { background: '#DC2626', color: '#FFFFFF' } : {})
                }}
              >
                {isOutOfStock ? (t('outOfStock') || 'Esgotado') : product.badge}
              </span>
            )}
            <img
              src={product.image_url || product.image || '/logo.jpg'}
              alt={product.name}
              onError={(e) => { e.currentTarget.src = '/logo.jpg'; }}
            />
          </div>

          <div className="modal-details-col">
            <span className="product-category">{product.category}</span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)', lineHeight: 1.25 }}>
              {product.name}
            </h2>

            <div className="rating-row" style={{ marginTop: '6px', marginBottom: '12px' }}>
              <div className="stars">
                <Star size={15} fill="#FFB800" color="#FFB800" />
                <strong style={{ marginLeft: '4px' }}>{product.rating || 4.9}</strong>
              </div>
              <span>({product.reviews_count ?? product.reviewsCount ?? 25} {t('reviews') || 'avaliações'})</span>
              <span>·</span>
              <span style={{ color: isOutOfStock ? '#DC2626' : '#10B981', fontWeight: 700 }}>
                {isOutOfStock ? (t('outOfStock') || 'Esgotado') : (t('inStock') || 'Em Estoque')}
              </span>
            </div>

            <div className="product-price-box" style={{ marginBottom: '14px' }}>
              {previousPrice && (
                <span className="old-price" style={{ fontSize: '0.86rem' }}>
                  {t('before') || 'Antes'}: {formatPriceKz(previousPrice, lang)}
                </span>
              )}
              <div className="current-price" style={{ fontSize: '1.45rem' }}>
                {t('now') || 'Agora'}: {formatPriceKz(effectivePrice, lang)}
              </div>
              {effectivePrice > 0 && (
                <div className="pix-price" style={{ fontSize: '0.82rem' }}>
                  ⚡ {formatPriceKz(effectivePrice * 0.9, lang)} {t('cashDiscount') || 'a pronto pagamento'}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: activeTab === 'specs' ? '2px solid var(--primary-orange)' : '2px solid transparent',
                  color: activeTab === 'specs' ? 'var(--primary-orange)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {t('specs') || 'Especificações'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('desc')}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: activeTab === 'desc' ? '2px solid var(--primary-orange)' : '2px solid transparent',
                  color: activeTab === 'desc' ? 'var(--primary-orange)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {t('description') || 'Descrição'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: activeTab === 'reviews' ? '2px solid var(--primary-orange)' : '2px solid transparent',
                  color: activeTab === 'reviews' ? 'var(--primary-orange)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {t('reviews') || 'Avaliações'} ({reviews.length})
              </button>
            </div>

            <div style={{ minHeight: '90px', marginBottom: '16px', overflowY: 'auto', maxHeight: '160px' }}>
              {activeTab === 'specs' && (
                <ul className="modal-specs-list" style={{ margin: 0, paddingLeft: '16px' }}>
                  {(product.specs || []).map((spec, i) => (
                    <li key={i} style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {spec}
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === 'desc' && (
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {product.description}
                </p>
              )}

              {activeTab === 'reviews' && (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {reviews.map((r, i) => (
                    <div key={i} style={{ padding: '8px 10px', background: 'var(--bg-body)', borderRadius: '8px', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span>{r.name}</span>
                        <span>⭐ {r.rating}</span>
                      </div>
                      <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {!isOutOfStock ? (
                <>
                  <button
                    className="btn-primary"
                    style={{ flex: 1, padding: '10px 16px' }}
                    onClick={() => {
                      addToCart(product);
                      onClose();
                    }}
                  >
                    <ShoppingBag size={16} /> {t('addToCart') || 'Adicionar ao Carrinho'}
                  </button>

                  <button
                    className="btn-whatsapp"
                    style={{ flex: 1, padding: '10px 16px' }}
                    onClick={handleBuyNow}
                  >
                    <MessageCircle size={16} /> Comprar Agora
                  </button>
                </>
              ) : (
                <a
                  href={`https://wa.me/244950752933?text=${encodeURIComponent(
                    `Olá AQUI TEM! Gostaria de consultar reposição do produto "${product.name}".`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                  style={{ width: '100%', textDecoration: 'none' }}
                >
                  <MessageCircle size={16} /> Consultar Reposição no WhatsApp
                </a>
              )}

              <Link
                to={`/produto/${productSlug}`}
                className="nav-btn"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={onClose}
              >
                <ExternalLink size={14} /> Ver Página Completa
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
