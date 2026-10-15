import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Plus, Eye, ExternalLink, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';
import { createSlug } from '../utils/slug';
import { trackProductView } from '../utils/pixelRetargeting';

export default function ProductCard({ product, onQuickView }) {
  const { lang, t } = useLanguage();
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    getEffectivePrice,
    getPreviousPrice,
    formatPriceKz
  } = useStore();

  const effectivePrice = getEffectivePrice(product);
  const previousPrice = getPreviousPrice(product);
  const isOutOfStock = Number(product.stock) <= 0;
  const isFav = isInWishlist(product.id);
  const productSlug = product.slug || createSlug(product.name);

  return (
    <div className="product-card">
      {(isOutOfStock || product.badge) && (
        <span
          className="product-badge"
          style={isOutOfStock ? { background: '#DC2626', color: '#FFFFFF' } : undefined}
        >
          {isOutOfStock ? (t('outOfStock') || 'Esgotado') : product.badge}
        </span>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        title={isFav ? (t('removeFavorite') || 'Remover dos favoritos') : (t('addFavorite') || 'Adicionar aos favoritos')}
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
          if (onQuickView) onQuickView(product);
        }}
      >
        <img
          key={product.image_url || product.image}
          src={product.image_url || product.image || '/logo.jpg'}
          alt={product.name}
          onError={(e) => {
            if (product.fallbackImage && e.currentTarget.src !== product.fallbackImage) {
              e.currentTarget.src = product.fallbackImage;
            } else if (product.svgFallbackImage) {
              e.currentTarget.onerror = null;
              e.currentTarget.src = product.svgFallbackImage;
            } else {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/logo.jpg';
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
            if (onQuickView) onQuickView(product);
          }}
        >
          {product.name}
        </h3>

        <div className="rating-row">
          <div className="stars">
            <Star size={14} fill="#FFB800" color="#FFB800" />
            <strong style={{ marginLeft: '4px' }}>{product.rating || 4.9}</strong>
          </div>
          <span>({product.reviews_count ?? product.reviewsCount ?? 20} {t('reviews') || 'avaliações'})</span>
        </div>

        <div className="product-price-box">
          {previousPrice && (
            <span className="old-price">{t('before') || 'Antes'}: {formatPriceKz(previousPrice, lang)}</span>
          )}
          <div className="current-price">{t('now') || 'Agora'}: {formatPriceKz(effectivePrice, lang)}</div>
          {effectivePrice > 0 && (
            <div className="pix-price">
              ⚡ {formatPriceKz(effectivePrice * 0.9, lang)} {t('cashDiscount') || 'a pronto pagamento'}
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
              <MessageCircle size={16} /> {t('askRestockWhatsApp') || 'Pedir no WhatsApp'}
            </a>
          ) : (
            <button
              className="btn-add-cart"
              onClick={() => addToCart(product)}
            >
              <Plus size={18} /> {t('addToCart') || 'Adicionar'}
            </button>
          )}

          <button
            className="btn-view-details"
            title={t('viewDetails') || 'Visualização rápida'}
            onClick={() => {
              trackProductView(product.name, effectivePrice);
              if (onQuickView) onQuickView(product);
            }}
          >
            <Eye size={18} />
          </button>

          <Link
            to={`/produto/${productSlug}`}
            className="btn-view-details"
            title={t('openProductPage') || 'Abrir página do produto'}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
          >
            <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
