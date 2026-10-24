// ==============================================================================
// AQUI TEM — TABELA OFICIAL DE PREÇOS PESQUISADOS, CUSTOS E MARGENS
// FÓRMULA OFICIAL EXIGIDA:
// CUSTO TOTAL = PREÇO DO PRODUTO (Custo Real) + 4.000 Kz DE TRANSPORTE
// PREÇO DE VENDA = CUSTO TOTAL + 20% A 25% DE MARGEM COMERCIAL
// ==============================================================================

export const OFFICIAL_NEW_PRODUCTS_PRICING = [
  // --------------------------------------------------------------------------
  // [1] Fones TWS Bluetooth
  // --------------------------------------------------------------------------
  {
    id: '3a1373b1-f09f-491e-ae85-8695398ac32a',
    sku: 'AT-TWS-001',
    slug: 'fones-tws-bluetooth',
    slugAliases: ['fones-de-ouvido-tws-oraimo', 'fones-tws-bluetooth-oraimo', 'oraimo-freepods-lite'],
    name: 'Fones de Ouvido TWS Bluetooth Oraimo FreePods Lite',
    brand: 'Oraimo',
    category: 'Áudio & Som',
    sourceName: 'Fornecedor Oficial Oraimo Direct (Modelo FreePods Lite OTW-330)',
    referenceCostKz: 12000,
    shippingKz: 4000,
    totalCostKz: 16000,
    marginPercent: 25,
    marginKz: 4000,
    calculatedSalePrice: 20000,
    regularPrice: 24000,
    stock: 20,
    image: '/products/fones-tws-bluetooth.jpg',
    seoTitle: 'Fones TWS Bluetooth Oraimo FreePods Som HD e Graves Potentes | AQUI TEM ANGOLA',
    seoDescription: 'Compre Fones TWS Bluetooth Oraimo FreePods originais com cancelamento de ruído, 40h de bateria e entrega rápida na AQUI TEM Angola. Pague na entrega em Luanda.'
  },

  // --------------------------------------------------------------------------
  // [2] Smartwatch
  // --------------------------------------------------------------------------
  {
    id: '250bfc74-fc6b-4c1a-867e-984b33a0ab06',
    sku: 'AT-SW-002',
    slug: 'smartwatch',
    slugAliases: ['watch-nova-2-smartwatch-inteligente-oraimo', 'smartwatch-oraimo-nova-2', 'osw-814'],
    name: 'Smartwatch Inteligente com Ecrã AMOLED Curvo Oraimo Watch Nova 2',
    brand: 'Oraimo',
    category: 'Smartwatches',
    sourceName: 'Fornecedor Oficial Oraimo (Modelo Watch Nova 2 OSW-814)',
    referenceCostKz: 19900,
    shippingKz: 4000,
    totalCostKz: 23900,
    marginPercent: 23.4,
    marginKz: 5600,
    calculatedSalePrice: 29500,
    regularPrice: 34000,
    stock: 15,
    image: '/products/smartwatch.jpg',
    seoTitle: 'Smartwatch Inteligente Ecrã AMOLED e Chamadas Bluetooth | AQUI TEM ANGOLA',
    seoDescription: 'Compre o Smartwatch Oraimo Watch Nova 2 com ecrã AMOLED curvo de 2.01", chamadas Bluetooth e monitor de saúde na AQUI TEM Angola. Garantia e entrega rápida em Luanda.'
  },

  // --------------------------------------------------------------------------
  // [3] Câmara Wi-Fi de Segurança
  // --------------------------------------------------------------------------
  {
    id: '9961e2e9-98c6-462b-8b6c-fd584f9b7a6d',
    sku: 'AT-CAM-003',
    slug: 'camera-wifi-seguranca',
    slugAliases: ['camera-de-seguranca-wi-fi-defender-ip8mcb1-pro', 'camera-wifi-seguranca-360'],
    name: 'Câmara Wi-Fi de Segurança 360° Inteligente Full HD Visão Noturna',
    brand: 'Defender / Tuya Smart',
    category: 'Acessórios & Casa',
    sourceName: 'Fornecedor Oficial Tuya / Defender Smart Security (Câmara IP 360 PTZ)',
    referenceCostKz: 16000,
    shippingKz: 4000,
    totalCostKz: 20000,
    marginPercent: 25,
    marginKz: 5000,
    calculatedSalePrice: 25000,
    regularPrice: 29500,
    stock: 12,
    image: '/products/camera-wifi-seguranca.jpg',
    seoTitle: 'Câmara Wi-Fi de Segurança 360 Graus com Visão Noturna e Áudio | AQUI TEM ANGOLA',
    seoDescription: 'Proteja a sua família e negócio com a Câmara Wi-Fi de Segurança 360° Full HD na AQUI TEM Angola. Alertas no telemóvel, visão noturna e entrega rápida em Luanda.'
  },

  // --------------------------------------------------------------------------
  // [4] Smart Plug Wi-Fi
  // --------------------------------------------------------------------------
  {
    id: '6be401b8-4dc3-4564-9818-6593bc764422',
    sku: 'AT-SP-004',
    slug: 'smart-plug-wifi',
    slugAliases: ['tomada-inteligente-wi-fi-smart-plug-com-botao-de-controlo'],
    name: 'Smart Plug Wi-Fi Tomada Inteligente 16A com Controlo Remoto',
    brand: 'Tuya / Smart Life',
    category: 'Acessórios & Casa',
    sourceName: 'Fornecedor Oficial Tuya / Smart Life (Smart Plug 16A EU Plug)',
    referenceCostKz: 7000,
    shippingKz: 4000,
    totalCostKz: 11000,
    marginPercent: 25,
    marginKz: 2750,
    calculatedSalePrice: 13750,
    regularPrice: 16500,
    stock: 25,
    image: '/products/smart-plug-wifi.jpg',
    seoTitle: 'Smart Plug Wi-Fi Tomada Inteligente 16A com Controlo no Telemóvel | AQUI TEM ANGOLA',
    seoDescription: 'Automatize a sua casa com o Smart Plug Wi-Fi Tomada Inteligente 16A na AQUI TEM Angola. Temporizador, economia de energia e entrega expressa em Luanda.'
  },

  // --------------------------------------------------------------------------
  // [5] Carregador GaN
  // --------------------------------------------------------------------------
  {
    id: '54afed87-d9a4-492c-922e-07819e34f07e',
    sku: 'AT-GAN-005',
    slug: 'carregador-gan',
    slugAliases: ['carregador-rapido-de-parede-bmx-70w-com-visor-lcd', 'carregador-gan-65w'],
    name: 'Carregador GaN 65W Rápido Multiportas USB-C e USB-A com Visor Digital',
    brand: 'BMX / GaN Tech',
    category: 'Acessórios & Tech',
    sourceName: 'Fornecedor Oficial BMX GaN Fast Charger (Modelo GaN III 65W/70W LCD)',
    referenceCostKz: 16000,
    shippingKz: 4000,
    totalCostKz: 20000,
    marginPercent: 25,
    marginKz: 5000,
    calculatedSalePrice: 25000,
    regularPrice: 30000,
    stock: 18,
    image: '/products/carregador-gan.jpg',
    seoTitle: 'Carregador GaN 65W Rápido Multiportas USB-C e USB-A com Visor | AQUI TEM ANGOLA',
    seoDescription: 'Carregador GaN 65W com visor digital para portáteis e telemóveis na AQUI TEM Angola. Carregamento ultra rápido, compacto e seguro com entrega em Luanda.'
  },

  // --------------------------------------------------------------------------
  // [6] Power Bank
  // --------------------------------------------------------------------------
  {
    id: '28ce7427-2e08-4ad4-a568-c9558641d5c7',
    sku: 'AT-PB-006',
    slug: 'power-bank',
    slugAliases: ['bateria-externa-power-bank-oraimo-10000mah'],
    name: 'Power Bank 10000mAh Bateria Externa Portátil Oraimo Toast 10',
    brand: 'Oraimo',
    category: 'Energia',
    sourceName: 'Fornecedor Oficial Oraimo (Toast 10 OPB-P118D 10000mAh)',
    referenceCostKz: 11000,
    shippingKz: 4000,
    totalCostKz: 15000,
    marginPercent: 25,
    marginKz: 3750,
    calculatedSalePrice: 18750,
    regularPrice: 22000,
    stock: 24,
    image: '/products/power-bank.jpg',
    seoTitle: 'Power Bank 10000mAh Bateria Externa Portátil com Saída Dupla | AQUI TEM ANGOLA',
    seoDescription: 'Compre o Power Bank Oraimo 10000mAh original com tecnologia AniFast e saída dupla USB na AQUI TEM Angola. Garantia e entrega ao domicílio em Luanda.'
  },

  // --------------------------------------------------------------------------
  // [7] Mini Projetor
  // --------------------------------------------------------------------------
  {
    id: '7c8a4192-3110-4f25-88de-8ef7a1599a01',
    sku: 'AT-MP-007',
    slug: 'mini-projetor',
    slugAliases: ['mini-projetor-smart-led', 'projetor-portatil-android'],
    name: 'Mini Projetor Portátil Smart LED HD 1080p Android Wi-Fi',
    brand: 'Magcubic / Smart Cinema',
    category: 'TV & Vídeo',
    sourceName: 'Fornecedor Importador Smart Cinema (Modelo HY300 Freestyle HD Android)',
    referenceCostKz: 36000,
    shippingKz: 4000,
    totalCostKz: 40000,
    marginPercent: 25,
    marginKz: 10000,
    calculatedSalePrice: 50000,
    regularPrice: 58000,
    stock: 10,
    image: '/products/mini-projetor.jpg',
    seoTitle: 'Mini Projetor Portátil Smart LED com Wi-Fi e Android Integrado | AQUI TEM ANGOLA',
    seoDescription: 'Tenha um cinema em casa com o Mini Projetor Portátil Smart LED até 130 polegadas na AQUI TEM Angola. Wi-Fi, Android e entrega rápida em Luanda.'
  },

  // --------------------------------------------------------------------------
  // [8] Coluna Bluetooth Portátil
  // --------------------------------------------------------------------------
  {
    id: '84f18b32-9cb4-482a-a9e3-2e78dc2361b2',
    sku: 'AT-CB-008',
    slug: 'coluna-bluetooth',
    slugAliases: ['coluna-bluetooth-portatil', 'caixa-de-som-bluetooth-oraimo'],
    name: 'Coluna Bluetooth Portátil com Graves HavyBass e Bateria de Longa Duração',
    brand: 'Oraimo / SoundPro',
    category: 'Áudio & Som',
    sourceName: 'Fornecedor Oficial Oraimo / SoundPro (SoundPro 2 OBS-02S / OBS-53D)',
    referenceCostKz: 14000,
    shippingKz: 4000,
    totalCostKz: 18000,
    marginPercent: 25,
    marginKz: 4500,
    calculatedSalePrice: 22500,
    regularPrice: 26500,
    stock: 16,
    image: '/products/coluna-bluetooth.jpg',
    seoTitle: 'Coluna Bluetooth Portátil com Graves Potentes e Bateria Longa | AQUI TEM ANGOLA',
    seoDescription: 'Compre a Coluna Bluetooth Portátil com graves HavyBass, 12h de autonomia e proteção IPX5 na AQUI TEM Angola. Som de alta qualidade com entrega expressa em Luanda.'
  },

  // --------------------------------------------------------------------------
  // [9] Mini Impressora Térmica Bluetooth
  // --------------------------------------------------------------------------
  {
    id: '91dc572e-84a1-4322-9df7-e61a2578c909',
    sku: 'AT-PRN-009',
    slug: 'mini-impressora-termica',
    slugAliases: ['mini-impressora-termica-bluetooth', 'impressora-termica-portatil'],
    name: 'Mini Impressora Térmica Portátil Bluetooth 58mm Sem Tinta para Telemóvel',
    brand: 'PeriPage / Phomemo',
    category: 'Acessórios & Tech',
    sourceName: 'Fornecedor Oficial Pocket Thermal Printer (Modelo 58mm Bluetooth 203DPI)',
    referenceCostKz: 16000,
    shippingKz: 4000,
    totalCostKz: 20000,
    marginPercent: 25,
    marginKz: 5000,
    calculatedSalePrice: 25000,
    regularPrice: 29500,
    stock: 14,
    image: '/products/mini-impressora-termica.jpg',
    seoTitle: 'Mini Impressora Térmica Portátil Bluetooth Sem Tinta para Telemóvel | AQUI TEM ANGOLA',
    seoDescription: 'Imprima recibos e etiquetas onde estiver com a Mini Impressora Térmica Bluetooth na AQUI TEM Angola. Sem uso de tinta, econômica e com entrega rápida em Luanda.'
  },

  // --------------------------------------------------------------------------
  // [10] Rastreador GPS
  // --------------------------------------------------------------------------
  {
    id: 'a083d917-7e23-4581-be99-0e7f7b321a10',
    sku: 'AT-GPS-010',
    slug: 'rastreador-gps',
    slugAliases: ['mini-rastreador-gps-magnetico', 'rastreador-veicular-gps'],
    name: 'Mini Rastreador GPS Magnético em Tempo Real com Botão SOS e Escuta',
    brand: 'Smart Tracker / GF-07',
    category: 'Acessórios & Tech',
    sourceName: 'Fornecedor Especializado em Segurança e Rastreamento (Modelo GF-07 GPS Magnetic)',
    referenceCostKz: 12000,
    shippingKz: 4000,
    totalCostKz: 16000,
    marginPercent: 25,
    marginKz: 4000,
    calculatedSalePrice: 20000,
    regularPrice: 24500,
    stock: 22,
    image: '/products/rastreador-gps.jpg',
    seoTitle: 'Mini Rastreador GPS Magnético em Tempo Real para Viaturas e Objetos | AQUI TEM ANGOLA',
    seoDescription: 'Monitore o seu carro ou motorizada em tempo real com o Mini Rastreador GPS Magnético na AQUI TEM Angola. Alertas no telemóvel, botão SOS e entrega em Luanda.'
  },

  // --------------------------------------------------------------------------
  // Outros produtos ativos complementares (mantidos intactos)
  // --------------------------------------------------------------------------
  {
    id: 'b1665cb5-f5fc-4ff4-8dbf-379aacc9794b',
    sku: 'BOOM-BLK',
    slug: 'auscultadores-bluetooth',
    name: 'Auscultadores Bluetooth Oraimo BoomPop',
    brand: 'Oraimo',
    category: 'Áudio & Som',
    sourceName: 'Loja Oficial Oraimo (BoomPop Series OEB-H89D)',
    referenceCostKz: 27600,
    shippingKz: 4000,
    totalCostKz: 31600,
    marginPercent: 21.8,
    marginKz: 6900,
    calculatedSalePrice: 38500,
    regularPrice: 44000,
    stock: 10,
    image: '/product_boompop.jpg',
    seoTitle: 'Auscultadores Bluetooth Oraimo BoomPop com Graves Potentes | AQUI TEM ANGOLA',
    seoDescription: 'Auscultadores Bluetooth Oraimo BoomPop over-ear com cancelamento de ruído e até 40h de música na AQUI TEM Angola. Garantia oficial e entrega em Luanda.'
  },
  {
    id: 'f18e3d33-95bf-4bfe-90bf-87969b094e32',
    sku: 'WIWU-CH-45W-BLK',
    slug: 'carregador-de-parede-wiwu-fast-charger-45w',
    name: 'Carregador de Parede WiWU Fast Charger 45W',
    brand: 'WIWU',
    category: 'Acessórios & Tech',
    sourceName: 'Loja Oficial WiWU / Fornecedores WiWU',
    referenceCostKz: 12900,
    shippingKz: 4000,
    totalCostKz: 16900,
    marginPercent: 25,
    marginKz: 3225,
    calculatedSalePrice: 20125,
    regularPrice: 23000,
    stock: 15,
    image: '/products/carregador-gan.jpg',
    seoTitle: 'Carregador de Parede WiWU Fast Charger 45W GaN Dual Port | AQUI TEM ANGOLA',
    seoDescription: 'Carregador rápido WiWU 45W com portas USB-C e USB-A na AQUI TEM Angola. Potência ideal para iPhone, Samsung e tablets com entrega rápida em Luanda.'
  },
  {
    id: '9f9c71ca-5614-4385-8175-5e2e303a8709',
    sku: 'OTW324-BLK',
    slug: 'oraimo-spacebuds-lite-otw-324',
    name: 'Oraimo SpaceBuds Lite OTW-324',
    brand: 'Oraimo',
    category: 'Áudio & Som',
    sourceName: 'Loja Oficial Oraimo (ng.oraimo.com / SpaceBuds Lite OTW-324)',
    referenceCostKz: 11000,
    shippingKz: 4000,
    totalCostKz: 15000,
    marginPercent: 25,
    marginKz: 2750,
    calculatedSalePrice: 17750,
    regularPrice: 20000,
    stock: 12,
    image: '/products/fones-tws-bluetooth.jpg',
    seoTitle: 'Fones Bluetooth Oraimo SpaceBuds Lite OTW-324 | AQUI TEM ANGOLA',
    seoDescription: 'Oraimo SpaceBuds Lite OTW-324 com design moderno, graves envolventes e bateria de longa duração na AQUI TEM Angola. 100% original com garantia e entrega rápida.'
  },
  {
    id: 'ce68593d-3752-4dff-99a3-d28b4237d6a2',
    sku: 'OPN371-BLK',
    slug: 'oraimo-opensnap-air-opn-371',
    name: 'Oraimo OpenSnap Air OPN-371',
    brand: 'Oraimo',
    category: 'Áudio & Som',
    sourceName: 'Loja Oficial Oraimo (ng.oraimo.com / OpenSnap Air OPN-371)',
    referenceCostKz: 17500,
    shippingKz: 4000,
    totalCostKz: 21500,
    marginPercent: 25,
    marginKz: 4375,
    calculatedSalePrice: 25875,
    regularPrice: 29500,
    stock: 10,
    image: '/product_opensnap.jpg',
    seoTitle: 'Fones de Ouvido Abertos Oraimo OpenSnap Air OPN-371 | AQUI TEM ANGOLA',
    seoDescription: 'Fones de ouvido abertos Oraimo OpenSnap Air OPN-371 com som panorâmico e máximo conforto na AQUI TEM Angola. Ideal para desporto e dia a dia em Luanda.'
  },
  {
    id: '8cfe6239-ef53-47d2-bd1d-8a849ab9e38d',
    sku: 'ORAIMO-OEB311-GOLD',
    slug: 'oraimo-necklace-lite',
    name: 'Oraimo Necklace Lite',
    brand: 'Oraimo',
    category: 'Áudio & Som',
    sourceName: 'Loja Oficial Oraimo (Necklace Lite OEB-E311)',
    referenceCostKz: 12000,
    shippingKz: 4000,
    totalCostKz: 16000,
    marginPercent: 25,
    marginKz: 3000,
    calculatedSalePrice: 19000,
    regularPrice: 22000,
    stock: 14,
    image: '/products/fones-tws-bluetooth.jpg',
    seoTitle: 'Auscultadores de Pescoço Oraimo Necklace Lite OEB-E311 | AQUI TEM ANGOLA',
    seoDescription: 'Oraimo Necklace Lite OEB-E311 com autonomia até 30 horas, vibração de chamadas e graves profundos na AQUI TEM Angola. Compre com entrega rápida em Luanda.'
  },
  {
    id: '46e7034d-6a7f-41de-a4d8-e883040645a4',
    sku: 'AT-XW-PRISMA',
    slug: 'x-watch-prisma-smartwatch-1',
    name: 'X-WATCH PRISMA — Smartwatch 1.4"',
    brand: 'X-Watch',
    category: 'Acessórios & Tech',
    sourceName: 'Preço Base Loja Fornecedor Luanda',
    referenceCostKz: 15000,
    shippingKz: 4000,
    totalCostKz: 19000,
    marginPercent: 25,
    marginKz: 3750,
    calculatedSalePrice: 22750,
    regularPrice: 26500,
    stock: 8,
    image: '/products/smartwatch.jpg',
    seoTitle: 'Smartwatch X-Watch Prisma com Chamadas Bluetooth | AQUI TEM ANGOLA',
    seoDescription: 'Compre o relógio inteligente X-Watch Prisma com preço super competitivo em Angola na AQUI TEM. Chamadas Bluetooth, monitor de saúde e entrega rápida em Luanda.'
  },
  {
    id: 'd8f54944-7134-4d66-907e-4b134a091afc',
    sku: 'AT-XW-18',
    slug: 'x-watch-smartwatch-18-bluetooth',
    name: 'X-WATCH SMARTWATCH — 1.8" Bluetooth',
    brand: 'X-Watch',
    category: 'Acessórios & Tech',
    sourceName: 'Preço Base Loja Fornecedor Luanda',
    referenceCostKz: 13500,
    shippingKz: 4000,
    totalCostKz: 17500,
    marginPercent: 25,
    marginKz: 3375,
    calculatedSalePrice: 20875,
    regularPrice: 24500,
    stock: 8,
    image: '/products/smartwatch.jpg',
    seoTitle: 'Smartwatch X-Watch 1.8" com Bluetooth e Notificações | AQUI TEM ANGOLA',
    seoDescription: 'Smartwatch X-Watch 1.8 polegadas com excelente relação qualidade-preço na AQUI TEM Angola. Faz chamadas Bluetooth e monitoriza desporto com entrega em Luanda.'
  }
];

export function getOfficialPricing(identifierOrProduct) {
  if (!identifierOrProduct) return null;

  if (typeof identifierOrProduct === 'object') {
    const p = identifierOrProduct;
    return (
      getOfficialPricing(p.id) ||
      getOfficialPricing(p.supabaseId) ||
      getOfficialPricing(p.slug) ||
      getOfficialPricing(p.sku) ||
      getOfficialPricing(p.name)
    );
  }

  const clean = String(identifierOrProduct).toLowerCase().trim();
  if (!clean) return null;

  // 1. Direct match on id, slug, sku, or full name
  const exact = OFFICIAL_NEW_PRODUCTS_PRICING.find(
    p =>
      p.id.toLowerCase() === clean ||
      p.slug.toLowerCase() === clean ||
      (Array.isArray(p.slugAliases) && p.slugAliases.some(a => a.toLowerCase() === clean)) ||
      (p.sku && p.sku.toLowerCase() === clean) ||
      p.name.toLowerCase() === clean
  );
  if (exact) return exact;

  // 2. Keyword match for the 10 core products
  if (clean.includes('projetor') || clean.includes('projector') || clean.includes('hy300') || clean === 'at-mp-007') {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-MP-007') || null;
  }
  if ((clean.includes('coluna') && clean.includes('bluetooth')) || clean.includes('soundpro') || clean === 'at-cb-008') {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-CB-008') || null;
  }
  if (clean.includes('impressora') || clean.includes('thermal') || clean.includes('peripage') || clean === 'at-prn-009') {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-PRN-009') || null;
  }
  if (clean.includes('rastreador') || clean.includes('tracker') || clean.includes('gf-07') || clean === 'at-gps-010') {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-GPS-010') || null;
  }
  if (clean.includes('smart-plug') || clean.includes('smart plug') || clean.includes('tomada') || clean === 'at-sp-004') {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-SP-004') || null;
  }
  if (clean.includes('gan') || clean.includes('65w') || clean.includes('bmx') || clean === 'at-gan-005') {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-GAN-005') || null;
  }
  if (clean.includes('power bank') || clean.includes('power-bank') || clean.includes('10000mah') || clean === 'at-pb-006') {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-PB-006') || null;
  }
  if ((clean.includes('fones') && clean.includes('tws')) || clean.includes('freepods') || clean === 'at-tws-001') {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-TWS-001') || null;
  }
  if (clean.includes('nova 2') || clean.includes('osw-814') || clean === 'smartwatch' || clean === 'at-sw-002') {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-SW-002') || null;
  }
  if (clean.includes('camera') || clean.includes('câmera') || clean.includes('defender') || clean === 'at-cam-003') {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-CAM-003') || null;
  }

  // 3. Other models
  if (clean.includes('prisma')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-XW-PRISMA') || null;
  }
  if (clean.includes('x-watch') && (clean.includes('1.8') || clean.includes('18'))) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-XW-18') || null;
  }
  if (clean.includes('boompop') || clean.includes('auscultadores-bluetooth') || clean.includes('oeb-h89d')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'BOOM-BLK') || null;
  }
  if (clean.includes('opensnap') || clean.includes('opn-371') || clean.includes('opn371')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'OPN371-BLK') || null;
  }
  if (clean.includes('spacebuds') || clean.includes('otw-324') || clean.includes('otw324')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'OTW324-BLK') || null;
  }
  if (clean.includes('necklace') || clean.includes('oeb-e311') || clean.includes('oeb311')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'ORAIMO-OEB311-GOLD') || null;
  }
  if (clean.includes('wiwu') || clean.includes('45w')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'WIWU-CH-45W-BLK') || null;
  }

  return null;
}
