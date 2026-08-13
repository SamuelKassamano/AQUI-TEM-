export function createStructuredData(products = []) {
  const siteUrl = 'https://aqui-tem29.vercel.app/';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}#organization`,
        name: 'AQUI TEM',
        url: siteUrl,
        logo: `${siteUrl}logo.jpg`,
        description:
          'Loja online de eletrônicos, tecnologia, gadgets, acessórios e eletrodomésticos em Angola.',
        telephone: '+244950752933',
        areaServed: {
          '@type': 'Country',
          name: 'Angola'
        }
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}#website`,
        url: siteUrl,
        name: 'AQUI TEM',
        description:
          'Eletrônicos, tecnologia, gadgets, acessórios e eletrodomésticos em Angola.',
        publisher: {
          '@id': `${siteUrl}#organization`
        },
        inLanguage: 'pt-AO'
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}#product-list`,
        name: 'Produtos AQUI TEM',
        numberOfItems: products.length,
        itemListElement: products.slice(0, 50).map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: product.name,
          url: siteUrl
        }))
      }
    ]
  };
}