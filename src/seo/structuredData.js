import { createSlug } from '../utils/slug.js';

export function createProductStructuredData(product) {
  const siteUrl = 'https://aqui-tem29.vercel.app';

  const slug = product.slug || createSlug(product.name || 'produto');
  const productUrl = `${siteUrl}/produto/${slug}`;
  const salePrice = Number(product.sale_price ?? product.salePrice);
  const effectivePrice = Number.isFinite(salePrice) && salePrice > 0 ? salePrice : Number(product.price || 0);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    description: product.description,
    image: [
      product.image_url || product.image
    ],
    sku: String(product.sku || product.id),
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Oraimo'
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'AOA',
      price: String(effectivePrice),
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'AQUI TEM',
        url: siteUrl
      }
    },
    aggregateRating: product.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: String(product.rating),
          reviewCount: String(product.reviews_count ?? product.reviewsCount ?? 0)
        }
      : undefined
  };
}

export function createBreadcrumbStructuredData(product) {
  const siteUrl = 'https://aqui-tem29.vercel.app';
  const slug = product.slug || createSlug(product.name || 'produto');

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'AQUI TEM',
        item: siteUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category,
        item: `${siteUrl}/categoria/${createSlug(product.category || 'produtos')}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${siteUrl}/produto/${slug}`
      }
    ]
  };
}

export function createVideoStructuredData(video) {
  const siteUrl = 'https://aqui-tem29.vercel.app';
  const videoUrl = video.fallbackUrl || `${siteUrl}/${video.videoUrl}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: `${siteUrl}/logo.jpg`,
    uploadDate: '2026-01-01T08:00:00+01:00',
    contentUrl: videoUrl,
    embedUrl: siteUrl,
    publisher: {
      '@type': 'Organization',
      name: 'AQUI TEM',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.jpg`
      }
    }
  };
}