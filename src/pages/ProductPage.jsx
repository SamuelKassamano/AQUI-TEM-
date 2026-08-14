import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../../data/products';
import { createProductStructuredData, createBreadcrumbStructuredData } from '../seo/structuredData';
import { createSlug } from '../utils/slug';

export default function ProductPage() {
  const { slug } = useParams();

  const product = PRODUCTS.find(
    (item) => createSlug(item.name) === slug
  );

  useEffect(() => {
    if (!product) return;

    const title = `${product.name} | AQUI TEM Angola`;
    const description = `${product.description} Compre na AQUI TEM com entrega em Luanda e províncias de Angola. WhatsApp: +244 950 752 933.`;

    document.title = title;

    let metaDescription = document.querySelector(
      'meta[name="description"]'
    );

    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }

    metaDescription.setAttribute('content', description);

    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = `https://aqui-tem29.vercel.app/produto/${slug}`;
    document.head.appendChild(canonical);

    return () => {
      if (canonical.parentNode) {
        canonical.parentNode.removeChild(canonical);
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

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <nav style={{ marginBottom: '30px' }}>
          <Link to="/">AQUI TEM</Link>
          {' / '}
          <span>{product.category}</span>
          {' / '}
          <span>{product.name}</span>
        </nav>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '40px',
            alignItems: 'start'
          }}
        >
          <div>
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '100%',
                maxWidth: '600px',
                display: 'block',
                margin: '0 auto'
              }}
            />
          </div>

          <div>
            <p>{product.category}</p>

            <h1>{product.name}</h1>

            <p>
              ⭐ {product.rating} ({product.reviewsCount} avaliações)
            </p>

            <h2>
              {Number(product.price).toLocaleString('pt-AO')} Kz
            </h2>

            {product.oldPrice && (
              <p>
                <del>
                  {Number(product.oldPrice).toLocaleString('pt-AO')} Kz
                </del>
              </p>
            )}

            <p>{product.description}</p>

            {product.specs?.length > 0 && (
              <>
                <h2>Características</h2>
                <ul>
                  {product.specs.map((spec, index) => (
                    <li key={index}>{spec}</li>
                  ))}
                </ul>
              </>
            )}

            <a
              href={`https://wa.me/244950752933?text=${encodeURIComponent(
                `Olá AQUI TEM! Tenho interesse no produto: ${product.name}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginTop: '20px',
                padding: '14px 24px',
                textDecoration: 'none'
              }}
            >
              Comprar pelo WhatsApp
            </a>
          </div>
        </section>
      </main>
    </>
  );
}