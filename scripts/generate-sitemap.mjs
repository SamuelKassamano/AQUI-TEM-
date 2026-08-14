import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSlug } from '../src/utils/slug.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const siteUrl = 'https://aqui-tem29.vercel.app';

const productsPath = path.join(__dirname, '..', 'data', 'products.js');
const productsFile = fs.readFileSync(productsPath, 'utf8');

const productNames = [
  ...productsFile.matchAll(/name:\s*['"`]([^'"`]+)['"`]/g)
].map(match => match[1]);

const uniqueProductNames = [...new Set(productNames)];

const urls = [
  {
    loc: `${siteUrl}/`,
    changefreq: 'weekly',
    priority: '1.0'
  },
  ...uniqueProductNames.map(name => ({
    loc: `${siteUrl}/produto/${createSlug(name)}`,
    changefreq: 'weekly',
    priority: '0.8'
  }))
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

fs.writeFileSync(outputPath, xml, 'utf8');

console.log(`Sitemap gerado com ${urls.length} URLs.`);
console.log(`Produtos encontrados: ${uniqueProductNames.length}`);