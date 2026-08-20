import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSlug } from '../src/utils/slug.js';
import { createProductStructuredData, createBreadcrumbStructuredData } from '../src/seo/structuredData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const siteUrl = 'https://aqui-tem29.vercel.app';
const distPath = path.join(__dirname, '..', 'dist');
const templatePath = path.join(distPath, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('Erro: dist/index.html não foi encontrado. Execute vite build primeiro.');
  process.exit(1);
}

const templateHtml = fs.readFileSync(templatePath, 'utf8');
const productsPath = path.join(__dirname, '..', 'data', 'products.js');
const productsFile = fs.readFileSync(productsPath, 'utf8');

// Robust block parser for product objects in data/products.js
const productBlocks = productsFile.split(/\{\s*id:\s*\d+/).slice(1);

const products = productBlocks.map((block, index) => {
  const nameMatch = block.match(/name:\s*['"`]([^'"`]+)['"`]/);
  const categoryMatch = block.match(/category:\s*['"`]([^'"`]+)['"`]/);
  const priceMatch = block.match(/price:\s*(\d+)/);
  const descriptionMatch = block.match(/description:\s*['"`]([^'"`]+)['"`]/);
  const imageMatch = block.match(/image:\s*getAssetUrl\(['"`]([^'"`]+)['"`]\)/);
  const ratingMatch = block.match(/rating:\s*([\d.]+)/);
  const reviewsCountMatch = block.match(/reviewsCount:\s*(\d+)/);

  const name = nameMatch ? nameMatch[1] : `Produto ${index + 1}`;
  const category = categoryMatch ? categoryMatch[1] : 'Eletrônicos';
  const price = priceMatch ? Number(priceMatch[1]) : 0;
  const description = descriptionMatch ? descriptionMatch[1] : `${name} com entrega rápida em Luanda e províncias de Angola.`;
  const imageName = imageMatch ? imageMatch[1] : 'logo.jpg';
  const rating = ratingMatch ? Number(ratingMatch[1]) : 5.0;
  const reviewsCount = reviewsCountMatch ? Number(reviewsCountMatch[1]) : 100;

  return {
    id: index + 1,
    name,
    category,
    price,
    description,
    image: `/${imageName}`,
    rating,
    reviewsCount
  };
});

console.log(`Pré-renderizando ${products.length} páginas estáticas HTML de produtos...`);

let count = 0;
for (const product of products) {
  const slug = createSlug(product.name);
  const productDir = path.join(distPath, 'produto', slug);
  fs.mkdirSync(productDir, { recursive: true });

  const title = `${product.name} | AQUI TEM Angola`;
  const description = `${product.description} Compre na AQUI TEM com entrega em Luanda e províncias de Angola. WhatsApp: +244 950 752 933.`;
  const productUrl = `${siteUrl}/produto/${slug}`;
  const imageUrl = `${siteUrl}${product.image}`;

  const productSchema = createProductStructuredData(product);
  const breadcrumbSchema = createBreadcrumbStructuredData(product);

  const productJsonLd = `
  <script type="application/ld+json">
  ${JSON.stringify(productSchema, null, 2)}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(breadcrumbSchema, null, 2)}
  </script>`;

  let html = templateHtml;

  // Replace Title
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);

  // Replace Meta Description
  html = html.replace(/<meta name="description" content="[\s\S]*?"\s*\/?>/, `<meta name="description" content="${description}">`);

  // Replace Canonical Link
  html = html.replace(/<link rel="canonical" href="[\s\S]*?"\s*\/?>/, `<link rel="canonical" href="${productUrl}" />`);

  // Replace OpenGraph Tags
  html = html.replace(/<meta property="og:title" content="[\s\S]*?"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta property="og:description" content="[\s\S]*?"\s*\/?>/, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta property="og:url" content="[\s\S]*?"\s*\/?>/, `<meta property="og:url" content="${productUrl}" />`);
  html = html.replace(/<meta property="og:image" content="[\s\S]*?"\s*\/?>/, `<meta property="og:image" content="${imageUrl}" />`);

  // Inject Product JSON-LD Schemas before </head>
  html = html.replace('</head>', `${productJsonLd}\n</head>`);

  // Pre-render static fallback HTML inside <div id="root"> for zero JS crawlers
  const staticRootContent = `
    <div id="root">
      <header style="padding: 20px; text-align: center; border-bottom: 1px solid #eee; background-color: #ffffff;">
        <a href="/" style="font-size: 26px; font-weight: 800; color: #FF6500; text-decoration: none; font-family: 'Space Grotesk', sans-serif;">AQUI TEM</a>
      </header>
      <main style="max-width: 1100px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif;">
        <nav style="margin-bottom: 24px; color: #64748B; font-size: 14px;">
          <a href="/" style="color: #FF6500; text-decoration: none; font-weight: 600;">AQUI TEM</a> &gt; <span>${product.category}</span> &gt; <strong>${product.name}</strong>
        </nav>
        <div style="display: flex; gap: 48px; flex-wrap: wrap; align-items: flex-start;">
          <div style="flex: 1; min-width: 300px; text-align: center; background: #F8FAFC; padding: 24px; border-radius: 20px;">
            <img src="${imageUrl}" alt="${product.name}" style="max-width: 100%; height: auto; border-radius: 12px; object-fit: contain;" />
          </div>
          <div style="flex: 1; min-width: 300px;">
            <span style="color: #FF6500; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">${product.category}</span>
            <h1 style="font-size: 32px; font-weight: 700; margin: 12px 0; color: #0F172A; font-family: 'Space Grotesk', sans-serif; line-height: 1.2;">${product.name}</h1>
            <p style="font-size: 14px; color: #64748B; margin-bottom: 16px;">⭐ ${product.rating} (${product.reviewsCount} avaliações)</p>
            <p style="font-size: 28px; font-weight: 800; color: #FF6500; margin: 16px 0;">${Number(product.price).toLocaleString('pt-AO')} Kz</p>
            <p style="color: #334155; line-height: 1.7; margin-bottom: 30px; font-size: 16px;">${product.description}</p>
            <a href="https://wa.me/244950752933?text=${encodeURIComponent(`Olá AQUI TEM! Tenho interesse no produto: ${product.name}`)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #25D366; color: white; padding: 16px 32px; border-radius: 50px; font-weight: 700; font-size: 16px; text-decoration: none; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.4);">Comprar pelo WhatsApp (+244 950 752 933)</a>
          </div>
        </div>
      </main>
    </div>`;

  html = html.replace(/<div id="root"><\/div>/, staticRootContent);

  fs.writeFileSync(path.join(productDir, 'index.html'), html, 'utf8');
  count++;
}

console.log(`Sucesso! ${count} páginas estáticas HTML individuais pré-renderizadas em dist/produto/*/index.html!`);
