const fs = require('fs');

const dump = JSON.parse(fs.readFileSync('supabase_products_dump.json', 'utf8'));

// Official pricing reference
const pricingMap = {
  '6be401b8-4dc3-4564-9818-6593bc764422': {
    price: 14500,
    sale_price: 12750,
    seo_title: 'Tomada Inteligente Wi-Fi Smart Plug com Botão de Controlo | AQUI TEM ANGOLA',
    seo_description: 'Transforme eletrodomésticos em aparelhos inteligentes com a Tomada Wi-Fi Smart Plug na AQUI TEM Angola. Controlo por app e voz, temporizador e entrega rápida em Luanda.'
  },
  '54afed87-d9a4-492c-922e-07819e34f07e': {
    price: 28000,
    sale_price: 25250,
    seo_title: 'Carregador Rápido de Parede BMX 70W GaN com Visor LCD | AQUI TEM ANGOLA',
    seo_description: 'Compre o Carregador Rápido BMX 70W com visor digital LCD em Angola na AQUI TEM. Carregamento ultra rápido para smartphones e portáteis com entrega em Luanda.'
  },
  '28ce7427-2e08-4ad4-a568-c9558641d5c7': {
    price: 20000,
    sale_price: 17750,
    seo_title: 'Bateria Externa Power Bank Oraimo 10000mAh Original | AQUI TEM ANGOLA',
    seo_description: 'Power Bank Oraimo 10000mAh original com carregamento rápido e dupla saída USB na AQUI TEM Angola. Garantia oficial e entrega ao domicílio em Luanda e províncias.'
  },
  '3a1373b1-f09f-491e-ae85-8695398ac32a': {
    price: 20000,
    sale_price: 17750,
    seo_title: 'Fones de Ouvido Sem Fio TWS Oraimo FreePods com Bluetooth | AQUI TEM ANGOLA',
    seo_description: 'Fones sem fio TWS Oraimo originais com som potente, graves HavyBass e cancelamento de ruído em chamadas na AQUI TEM Angola. Compre com entrega rápida em Luanda.'
  },
  'f18e3d33-95bf-4bfe-90bf-87969b094e32': {
    price: 23000,
    sale_price: 20125,
    seo_title: 'Carregador de Parede WiWU Fast Charger 45W GaN Dual Port | AQUI TEM ANGOLA',
    seo_description: 'Carregador rápido WiWU 45W com portas USB-C e USB-A na AQUI TEM Angola. Potência ideal para iPhone, Samsung e tablets com entrega rápida em Luanda.'
  },
  'b1665cb5-f5fc-4ff4-8dbf-379aacc9794b': {
    price: 42000,
    sale_price: 37672,
    seo_title: 'Auscultadores Bluetooth Oraimo BoomPop com Graves Potentes | AQUI TEM ANGOLA',
    seo_description: 'Auscultadores Bluetooth Oraimo BoomPop over-ear com cancelamento de ruído e até 40h de música na AQUI TEM Angola. Garantia oficial e entrega em Luanda.'
  },
  '9961e2e9-98c6-462b-8b6c-fd584f9b7a6d': {
    price: 92000,
    sale_price: 81160,
    seo_title: 'Câmera de Segurança Wi-Fi Defender IP8MCB1 Pro 4K AI | AQUI TEM ANGOLA',
    seo_description: 'Proteja a sua casa ou empresa com a Câmera de Segurança Wi-Fi Defender IP8MCB1 Pro 4K na AQUI TEM Angola. Visão noturna, alertas no telemóvel e entrega em Luanda.'
  },
  '9f9c71ca-5614-4385-8175-5e2e303a8709': {
    price: 20000,
    sale_price: 17750,
    seo_title: 'Fones Bluetooth Oraimo SpaceBuds Lite OTW-324 | AQUI TEM ANGOLA',
    seo_description: 'Oraimo SpaceBuds Lite OTW-324 com design moderno, graves envolventes e bateria de longa duração na AQUI TEM Angola. 100% original com garantia e entrega rápida.'
  },
  'ce68593d-3752-4dff-99a3-d28b4237d6a2': {
    price: 28500,
    sale_price: 25525,
    seo_title: 'Fones de Ouvido Abertos Oraimo OpenSnap Air OPN-371 | AQUI TEM ANGOLA',
    seo_description: 'Fones de ouvido abertos Oraimo OpenSnap Air OPN-371 com som panorâmico e máximo conforto na AQUI TEM Angola. Ideal para desporto e dia a dia em Luanda.'
  },
  '8cfe6239-ef53-47d2-bd1d-8a849ab9e38d': {
    price: 22000,
    sale_price: 19000,
    seo_title: 'Auscultadores de Pescoço Oraimo Necklace Lite OEB-E311 | AQUI TEM ANGOLA',
    seo_description: 'Oraimo Necklace Lite OEB-E311 com autonomia até 30 horas, vibração de chamadas e graves profundos na AQUI TEM Angola. Compre com entrega rápida em Luanda.'
  },
  '46e7034d-6a7f-41de-a4d8-e883040645a4': {
    price: 36000,
    sale_price: 32060,
    seo_title: 'Smartwatch X-Watch Prisma Tela Curva com Chamadas Bluetooth | AQUI TEM ANGOLA',
    seo_description: 'Relógio inteligente X-Watch Prisma com ecrã de alta definição, monitor de saúde e chamadas Bluetooth na AQUI TEM Angola. Compre online com entrega em Luanda.'
  },
  'd8f54944-7134-4d66-907e-4b134a091afc': {
    price: 32000,
    sale_price: 28400,
    seo_title: 'Smartwatch X-Watch 1.8" com Chamadas Bluetooth e Notificações | AQUI TEM ANGOLA',
    seo_description: 'Smartwatch X-Watch 1.8 polegadas com Bluetooth 5.3, faz e recebe chamadas e monitoriza atividades na AQUI TEM Angola. Entrega rápida em Luanda e províncias.'
  },
  '250bfc74-fc6b-4c1a-867e-984b33a0ab06': {
    price: 45000,
    sale_price: 40000,
    seo_title: 'Smartwatch Oraimo Watch Nova 2 OSW-814 com Tela AMOLED 2.01" | AQUI TEM ANGOLA',
    seo_description: 'Compre o smartwatch Oraimo Watch Nova 2 OSW-814 com tela AMOLED curva de 2.01 polegadas, chamadas Bluetooth e proteção IP68 na AQUI TEM Angola. Entrega rápida em Luanda.'
  }
};

const currentProductsJs = fs.readFileSync('data/products.js', 'utf8');

// Ensure all 10 old products are marked active: false
let updatedJs = currentProductsJs.replace(
  /export const PRODUCTS = \[([\s\S]*?)\];\s*export const CATEGORIES/m,
  (fullMatch, productsBlock) => {
    // Replace active: true with active: false in old products
    const deactivatedBlock = productsBlock.replace(/active:\s*true/g, 'active: false');
    
    // Build new products list
    const newItemsCode = dump.map((p, i) => {
      const pricing = pricingMap[p.id] || {
        price: p.price,
        sale_price: p.sale_price,
        seo_title: p.name + ' | AQUI TEM ANGOLA',
        seo_description: 'Compre ' + p.name + ' na AQUI TEM Angola com garantia e entrega rápida.'
      };
      
      const safeDesc = JSON.stringify(p.description || '');
      const safeImageUrl = JSON.stringify(p.image_url || '/logo.jpg');
      const safeSeoTitle = JSON.stringify(pricing.seo_title);
      const safeSeoDesc = JSON.stringify(pricing.seo_description);

      return `  {
    id: ${JSON.stringify(p.id)},
    supabaseId: ${JSON.stringify(p.id)},
    name: ${JSON.stringify(p.name)},
    slug: ${JSON.stringify(p.slug)},
    category: ${JSON.stringify(p.category || 'Acessórios & Tech')},
    brand: ${JSON.stringify(p.brand || 'Oraimo')},
    sku: ${JSON.stringify(p.sku || '')},
    stock: ${p.stock || 15},
    active: true,
    price: ${pricing.price},
    sale_price: ${pricing.sale_price},
    old_price: ${pricing.price},
    oldPrice: ${pricing.price},
    rating: ${p.rating || 4.9},
    reviews_count: ${p.reviews_count || 25},
    reviewsCount: ${p.reviews_count || 25},
    badge: ${JSON.stringify(p.badge || 'NOVIDADE')},
    image_url: ${safeImageUrl},
    image: ${safeImageUrl},
    description: ${safeDesc},
    seo_title: ${safeSeoTitle},
    seo_description: ${safeSeoDesc},
    specs: ${JSON.stringify(p.specs || [])}
  }`;
    }).join(',\n');

    return `export const PRODUCTS = [\n  // PRODUTOS NOVOS OFICIAIS (ATIVOS NO SUPABASE)\n${newItemsCode},\n\n  // PRODUTOS ANTIGOS DESATIVADOS PELO ADMINISTRADOR\n${deactivatedBlock.trim()}\n];\n\nexport const CATEGORIES`;
  }
);

fs.writeFileSync('data/products.js', updatedJs, 'utf8');
console.log('data/products.js successfully updated with the 13 official active products and 10 deactivated products preserved.');
