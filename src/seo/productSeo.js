import { createSlug } from '../utils/slug.js';

export function createProductSEO(product) {
  const siteName = "AQUI TEM";
  const siteUrl = "https://aqui-tem29.vercel.app";
  const slug = createSlug(product.name);

  return {
    title: `${product.name} | ${siteName} Angola`,

    description:
      `${product.description} Compre na AQUI TEM com entrega em Luanda e províncias de Angola. WhatsApp: +244 950 752 933.`,

    keywords: [
      product.name,
      product.category,
      "Oraimo Angola",
      "Loja de Eletrônicos Angola",
      "Tecnologia Angola",
      "AQUI TEM",
      "AQUI-TEM",
      "Gadgets Angola",
      "Acessórios para Telemóvel",
      "Eletrônicos"
    ].join(", "),

    canonical: `${siteUrl}/produto/${slug}`,

    image: product.image
  };
}