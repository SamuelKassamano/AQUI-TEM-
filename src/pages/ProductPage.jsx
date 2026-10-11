import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  CheckCircle,
  MapPin,
  ThumbsUp,
  ShieldCheck,
  Award,
  Info,
  MessageCircle,
  ShoppingBag,
  Heart,
  Plus,
  ArrowLeft,
  Package,
  Sun,
  Moon
} from 'lucide-react';
import { createProductStructuredData, createBreadcrumbStructuredData } from '../seo/structuredData';
import { createSlug } from '../utils/slug';
import { getTranslatedProduct, getProductTestimonials, getTranslatedCategory } from '../utils/productTranslations';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import OriginalLogoImage from '../components/OriginalLogoImage';
import LanguageSelector from '../components/LanguageSelector';
import StoreDrawers from '../components/StoreDrawers';
import { trackProductView, trackWhatsAppLead } from '../utils/pixelRetargeting';

export default function ProductPage() {
  const { slug } = useParams();
  const { lang, t } = useLanguage();
  const {
    activeProducts,
    findProductBySlug,
    addToCart,
    cart,
    setIsCartOpen,
    setIsCheckoutOpen,
    setDirectCheckoutItem,
    wishlist,
    toggleWishlist,
    isInWishlist,
    setIsWishlistOpen,
    theme,
    toggleTheme,
    getEffectivePrice,
    getPreviousPrice,
    formatPriceKz
  } = useStore();

  const rawProduct = findProductBySlug(slug);
  const product = useMemo(
    () => (rawProduct ? getTranslatedProduct(rawProduct, lang) : null),
    [rawProduct, lang]
  );

  const [selectedGalleryImg, setSelectedGalleryImg] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedGalleryImg(null);
    setQty(1);
  }, [slug]);

  useEffect(() => {
    setSelectedGalleryImg(null);
  }, [product?.image_url]);

  useEffect(() => {
    if (!product) return;

    const effectivePrice = getEffectivePrice(product);
    const canonicalSlug = product.slug || createSlug(product.name);
    const title = `${product.name} | AQUI TEM Angola`;
    const description = `${product.description} Compre na AQUI TEM (${formatPriceKz(effectivePrice, lang)}) com entrega em Luanda e províncias de Angola. WhatsApp: +244 950 752 933.`;
    const productUrl = `https://aqui-tem29.vercel.app/produto/${canonicalSlug}`;

    document.title = title;
    trackProductView(product.name, effectivePrice);

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', productUrl);

    let ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && (product.image_url || product.image)) {
      ogImage.setAttribute('content', product.image_url || product.image);
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', productUrl);

    return () => {
      if (canonical) {
        canonical.setAttribute('href', 'https://aqui-tem29.vercel.app/');
      }
    };
  }, [product, slug, lang, getEffectivePrice, formatPriceKz]);

  // Related products (same category first, then others)
  const relatedProducts = useMemo(() => {
    if (!rawProduct) return [];
    const others = activeProducts.filter(p => String(p.id) !== String(rawProduct.id));
    const sameCat = others.filter(p => p.category === rawProduct.category);
    const diffCat = others.filter(p => p.category !== rawProduct.category);
    return [...sameCat, ...diffCat].slice(0, 4).map(p => getTranslatedProduct(p, lang));
  }, [activeProducts, rawProduct, lang]);

  if (!product) {
    return (
      <div className="app-container">
        <header className="header-nav">
          <div className="header-container">
            <Link to="/" className="logo-brand">
              <OriginalLogoImage src="/logo.jpg" alt="Aqui Tem" height={40} className="header-logo-img" />
            </Link>
            <Link to="/" className="nav-btn nav-btn-orange" style={{ textDecoration: 'none' }}>
              <ArrowLeft size={16} /> {lang === 'en' ? 'Back to Store' : 'Voltar para a Loja'}
            </Link>
          </div>
        </header>
        <main style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <Package size={56} color="var(--primary-orange)" style={{ marginBottom: '16px' }} />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px' }}>
            {lang === 'en' ? 'Product Not Found' : 'Produto não encontrado'}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            {lang === 'en'
              ? 'The product you are looking for is not available right now.'
              : 'O produto que você procura não está disponível no momento.'}
          </p>
          <Link to="/" className="nav-btn nav-btn-orange" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            <ArrowLeft size={16} /> {lang === 'en' ? 'View All Products at AQUI TEM' : 'Ver Todos os Produtos na AQUI TEM'}
          </Link>
        </main>
        <StoreDrawers />
      </div>
    );
  }

  const effectivePrice = getEffectivePrice(product);
  const previousPrice = getPreviousPrice(product);
  const isFav = isInWishlist(product.id);
  const productSchema = createProductStructuredData(product);
  const breadcrumbSchema = createBreadcrumbStructuredData(product);
  const productReviews = getProductTestimonials(product, lang);

  const mainImage = selectedGalleryImg || product.image_url || product.image;
  const galleryImages = useMemo(() => {
    const imgs = [product.image_url || product.image];
    if (Array.isArray(product.gallery)) {
      product.gallery.forEach(g => {
        if (g && !imgs.includes(g)) imgs.push(g);
      });
    }
    return imgs.filter(Boolean);
  }, [product]);

  return (
    <div className="app-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema)
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />

      {/* Top Bar */}
      <div className="top-bar">
        <span className="top-bar-main">{t('topBarMsg')}</span>
        <span className="top-bar-sep" style={{ opacity: 0.6 }}>|</span>
        <span className="top-bar-sub">📱 {t('whatsappSupport')}</span>
        <span className="top-bar-sep" style={{ opacity: 0.6 }}>|</span>
        <span className="top-bar-sub">🇦🇴 {t('fastDelivery')}</span>
      </div>

      {/* Store Header */}
      <header className="header-nav">
        <div className="header-container">
          <div className="header-left">
            <Link to="/" className="nav-btn" style={{ textDecoration: 'none', padding: '6px 12px' }}>
              <ArrowLeft size={15} />
              <span>{lang === 'en' ? 'Store' : 'Loja'}</span>
            </Link>
            <Link to="/" className="logo-brand">
              <OriginalLogoImage src="/logo.jpg" alt="Aqui Tem" height={38} className="header-logo-img" />
            </Link>
          </div>

          <div className="nav-actions">
            <LanguageSelector />

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

      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '24px 16px 48px' }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: '18px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--primary-orange)', fontWeight: 700, textDecoration: 'none' }}>AQUI TEM</Link>
          <span>/</span>
          <span>{getTranslatedCategory(product.category, lang)}</span>
          <span>/</span>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{product.name}</span>
        </nav>

        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '18px',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}
        >
          <div className="modal-grid">
            {/* Image & Gallery Column */}
            <div style={{ display: 'flex', flexDirection: 'column', background: '#FFFFFF', padding: '16px', alignItems: 'center', justifyContent: 'center' }}>
              <div className="modal-img-col" style={{ width: '100%', position: 'relative' }}>
                {(Number(product.stock) <= 0 || product.badge) && (
                  <span
                    className="product-badge"
                    style={{
                      top: '12px',
                      left: '12px',
                      ...(Number(product.stock) <= 0 ? { background: '#DC2626', color: '#FFFFFF' } : {})
                    }}
                  >
                    {Number(product.stock) <= 0 ? t('outOfStock') : product.badge}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  title={isFav ? t('removeFavorite') : t('addFavorite')}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.92)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 5
                  }}
                >
                  <Heart size={18} color={isFav ? '#F37021' : '#64748B'} fill={isFav ? '#F37021' : 'none'} />
                </button>

                <img
                  key={mainImage}
                  src={mainImage}
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

              {galleryImages.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedGalleryImg(imgUrl)}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '10px',
                        border: mainImage === imgUrl ? '2px solid var(--primary-orange)' : '1px solid var(--border-light)',
                        padding: '4px',
                        background: '#FFF',
                        cursor: 'pointer'
                      }}
                    >
                      <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Purchase Details Column */}
            <div className="modal-details-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span className="product-category" style={{ marginBottom: 0 }}>
                  {getTranslatedCategory(product.category, lang)}
                </span>
                <span>·</span>
                <span>{t('brandLabel')}: <strong style={{ color: 'var(--text-main)' }}>{product.brand || 'Oraimo'}</strong></span>
                {product.sku && (
                  <>
                    <span>·</span>
                    <span>SKU: <strong style={{ color: 'var(--text-main)' }}>{product.sku}</strong></span>
                  </>
                )}
              </div>

              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.25, marginTop: '4px' }}>
                {product.name}
              </h1>

              <div className="rating-row" style={{ marginTop: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div className="stars">
                  <Star size={15} fill="#FFB800" color="#FFB800" />
                  <strong style={{ marginLeft: '4px' }}>{product.rating}</strong>
                </div>
                <span>({product.reviews_count ?? product.reviewsCount} {t('reviews')})</span>
                <span>·</span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    color: Number(product.stock) <= 0 ? '#DC2626' : '#16A34A'
                  }}
                >
                  {Number(product.stock) <= 0 ? t('outOfStock') : `${t('inStock')} (${product.stock})`}
                </span>
              </div>

              {/* Price Box */}
              <div style={{ padding: '14px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '16px' }}>
                {previousPrice && (
                  <div className="old-price">
                    {t('before')}: {formatPriceKz(previousPrice, lang)}
                  </div>
                )}
                <div className="current-price" style={{ fontSize: '1.65rem', fontVariantNumeric: 'tabular-nums' }}>
                  {t('now')}: {formatPriceKz(effectivePrice, lang)}
                </div>
                {effectivePrice > 0 && (
                  <div className="pix-price">
                    ⚡ {formatPriceKz(effectivePrice * 0.9, lang)} {t('cashDiscount')}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Number(product.stock) <= 0 ? (
                  <a
                    href={`https://wa.me/244950752933?text=${encodeURIComponent(
                      `Olá AQUI TEM! O produto "${product.name}" aparece como esgotado no site. Gostaria de saber sobre reposição ou encomenda por importação.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppLead(product.name, effectivePrice)}
                    className="btn-whatsapp"
                    style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}
                  >
                    <MessageCircle size={18} /> {t('askRestockWhatsApp')}
                  </a>
                ) : (
                  <>
                    <div className="modal-actions-row">
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ flex: 1, justifyContent: 'center' }}
                        onClick={() => {
                          setDirectCheckoutItem({ ...product, quantity: qty });
                          setIsCheckoutOpen(true);
                        }}
                      >
                        <ShoppingBag size={17} /> {t('buyNow')}
                      </button>

                      <button
                        type="button"
                        className="nav-btn"
                        style={{ flex: 1, justifyContent: 'center', padding: '12px 16px', fontWeight: 800, borderColor: 'var(--primary-orange)', color: 'var(--primary-orange)' }}
                        onClick={() => addToCart(product, qty)}
                      >
                        <Plus size={17} /> {t('addCart')}
                      </button>
                    </div>

                    <a
                      href={`https://wa.me/244950752933?text=${encodeURIComponent(
                        `Olá AQUI TEM!\n\nQuero fazer um pedido:\n\nProduto:\n${product.name}\n\nQuantidade:\n${qty}\n\nPreço:\n${formatPriceKz(effectivePrice * qty, lang)}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsAppLead(product.name, effectivePrice)}
                      className="btn-whatsapp"
                      style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}
                    >
                      <MessageCircle size={17} /> {t('quoteWhatsApp')}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Description, Specs & Social Proof */}
          <div className="modal-product-extra">
            <div className="modal-desc-card">
              <div className="modal-section-subtitle">
                <Info size={16} color="var(--primary-orange)" />
                <span>{t('description')} & {t('technicalSpecs')}</span>
              </div>
              <p className="modal-desc-text">{product.description}</p>
              {product.specs?.length > 0 && (
                <div className="modal-specs-pills">
                  {product.specs.map((spec, index) => (
                    <span key={index} className="modal-spec-pill">
                      <CheckCircle size={13} color="#10B981" /> {spec}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-social-proof-box">
              <div className="modal-sp-header">
                <div className="modal-section-subtitle" style={{ marginBottom: 0 }}>
                  <Award size={16} color="var(--primary-orange)" />
                  <span>{lang === 'en' ? 'Customer Reviews for this Product' : 'Provas Sociais deste Produto'}</span>
                </div>
                <span className="modal-sp-rating-pill">
                  ★ {product.rating} ({product.reviews_count ?? product.reviewsCount} {t('reviews')})
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
                          referrerPolicy="no-referrer"
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
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: '36px' }}>
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <h2 className="section-title" style={{ fontSize: '1.3rem' }}>
                {t('relatedProducts')}
              </h2>
            </div>

            <div className="products-grid">
              {relatedProducts.map(rel => {
                const relPrice = getEffectivePrice(rel);
                const relPrev = getPreviousPrice(rel);
                const relSlug = rel.slug || createSlug(rel.name);

                return (
                  <div key={rel.id} className="product-card">
                    {rel.badge && <span className="product-badge">{rel.badge}</span>}
                    <Link to={`/produto/${relSlug}`} className="product-img-wrapper" style={{ display: 'flex' }}>
                      <img
                        key={rel.image_url || rel.image}
                        src={rel.image_url || rel.image}
                        alt={rel.name}
                        onError={(e) => {
                          if (rel.fallbackImage && e.currentTarget.src !== rel.fallbackImage) {
                            e.currentTarget.src = rel.fallbackImage;
                          } else if (rel.svgFallbackImage) {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = rel.svgFallbackImage;
                          } else {
                            e.currentTarget.onerror = null;
                          }
                        }}
                      />
                    </Link>

                    <div className="product-body">
                      <span className="product-category">{getTranslatedCategory(rel.category, lang)}</span>
                      <Link
                        to={`/produto/${relSlug}`}
                        className="product-name"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {rel.name}
                      </Link>

                      <div className="product-price-box">
                        {relPrev && (
                          <span className="old-price">{t('before')}: {formatPriceKz(relPrev, lang)}</span>
                        )}
                        <div className="current-price">{t('now')}: {formatPriceKz(relPrice, lang)}</div>
                      </div>

                      <div className="product-actions">
                        <button className="btn-add-cart" onClick={() => addToCart(rel)}>
                          <Plus size={16} /> {t('addToCart')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <StoreDrawers />
    </div>
  );
}
