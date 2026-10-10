import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, CheckCircle, MapPin, ThumbsUp, ShieldCheck, Award, Info, MessageCircle } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { createProductStructuredData, createBreadcrumbStructuredData } from '../seo/structuredData';
import { createSlug } from '../utils/slug';
import { getProductTestimonials } from '../utils/productTranslations';

export default function ProductPage() {
  const { slug } = useParams();

  const product = PRODUCTS.find(
    (item) => createSlug(item.name) === slug
  );

  useEffect(() => {
    if (!product) return;

    const title = `${product.name} | AQUI TEM Angola`;
    const description = `${product.description} Compre na AQUI TEM com entrega em Luanda e províncias de Angola. WhatsApp: +244 950 752 933.`;
    const productUrl = `https://aqui-tem29.vercel.app/produto/${slug}`;

    document.title = title;

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
    if (ogImage && product.image) ogImage.setAttribute('content', product.image);

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
  }, [product, slug]);

  if (!product) {
    return (
      <main style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h1>Produto não encontrado</h1>
        <p>O produto que você procura não está disponível.</p>
        <Link to="/">
          Voltar para a AQUI TEM
        </Link>
      </main>
    );
  }

  const productSchema = createProductStructuredData(product);
  const breadcrumbSchema = createBreadcrumbStructuredData(product);
  const productReviews = getProductTestimonials(product, 'pt');

  return (
    <>
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

      <main style={{ maxWidth: '1040px', margin: '0 auto', padding: '24px 16px' }}>
        <nav style={{ marginBottom: '18px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--primary-orange)', fontWeight: 700 }}>AQUI TEM</Link>
          <span>/</span>
          <span>{product.category}</span>
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
            <div className={`modal-img-col${product.whiteBg ? ' white-bg' : ''}${product.orangeBg ? ' orange-bg' : ''}`}>
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (product.fallbackImage) {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = product.fallbackImage;
                  }
                }}
              />
            </div>

            <div className="modal-details-col">
              <span className="product-category" style={{ marginBottom: 0 }}>{product.category}</span>

              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.25, marginTop: '4px' }}>{product.name}</h1>

              <div className="rating-row" style={{ marginTop: '6px', marginBottom: '12px' }}>
                <div className="stars">
                  <Star size={15} fill="#FFB800" color="#FFB800" />
                  <strong style={{ marginLeft: '4px' }}>{product.rating}</strong>
                </div>
                <span>({product.reviewsCount} avaliações)</span>
              </div>

              <div style={{ padding: '14px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '14px' }}>
                {product.oldPrice && (
                  <div className="old-price">
                    Antes: {Number(product.oldPrice).toLocaleString('pt-AO')} Kz
                  </div>
                )}
                <div className="current-price" style={{ fontSize: '1.6rem' }}>
                  Agora: {Number(product.price).toLocaleString('pt-AO')} Kz
                </div>
                <div className="pix-price">
                  ⚡ {Number(product.price * 0.9).toLocaleString('pt-AO')} Kz à vista (10% OFF)
                </div>
              </div>

              <div className="modal-actions-row">
                <a
                  href={`https://wa.me/244950752933?text=${encodeURIComponent(
                    `Olá AQUI TEM! Tenho interesse no produto: ${product.name}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                  style={{ flex: 1, textDecoration: 'none', justifyContent: 'center' }}
                >
                  <MessageCircle size={17} /> Comprar pelo WhatsApp
                </a>
                <Link
                  to="/"
                  className="nav-btn"
                  style={{ justifyContent: 'center', padding: '10px 18px' }}
                >
                  Voltar à Loja
                </Link>
              </div>
            </div>
          </div>

          <div className="modal-product-extra">
            <div className="modal-desc-card">
              <div className="modal-section-subtitle">
                <Info size={16} color="var(--primary-orange)" />
                <span>Descrição Completa & Especificações Técnicas</span>
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
                  <span>Provas Sociais deste Produto</span>
                </div>
                <span className="modal-sp-rating-pill">
                  ★ {product.rating} ({product.reviewsCount} avaliações)
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
                                <CheckCircle size={10} style={{ marginRight: '2px' }} /> Verificado
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
                        <ThumbsUp size={11} color="var(--primary-orange)" /> {review.likes} clientes acharam útil
                      </span>
                      <span style={{ color: '#25D366', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <ShieldCheck size={11} /> Compra Segura
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}