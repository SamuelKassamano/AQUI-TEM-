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
    referenceCostKz: 15000,
    shippingKz: 4000,
    totalCostKz: 19000,
    marginPercent: 25,
    marginKz: 4750,
    calculatedSalePrice: 23750,
    regularPrice: 28000,
    stock: 20,
    rating: 4.9,
    reviews_count: 87,
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
    referenceCostKz: 25000,
    shippingKz: 4000,
    totalCostKz: 29000,
    marginPercent: 25,
    marginKz: 7250,
    calculatedSalePrice: 36250,
    regularPrice: 42000,
    stock: 15,
    rating: 4.8,
    reviews_count: 64,
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
    referenceCostKz: 20000,
    shippingKz: 4000,
    totalCostKz: 24000,
    marginPercent: 25,
    marginKz: 6000,
    calculatedSalePrice: 30000,
    regularPrice: 35000,
    stock: 12,
    rating: 4.6,
    reviews_count: 42,
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
    referenceCostKz: 10000,
    shippingKz: 4000,
    totalCostKz: 14000,
    marginPercent: 25,
    marginKz: 3500,
    calculatedSalePrice: 17500,
    regularPrice: 22000,
    stock: 25,
    rating: 4.4,
    reviews_count: 18,
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
    referenceCostKz: 18000,
    shippingKz: 4000,
    totalCostKz: 22000,
    marginPercent: 25,
    marginKz: 5500,
    calculatedSalePrice: 27500,
    regularPrice: 32000,
    stock: 18,
    rating: 4.9,
    reviews_count: 53,
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
    referenceCostKz: 12000,
    shippingKz: 4000,
    totalCostKz: 16000,
    marginPercent: 25,
    marginKz: 4000,
    calculatedSalePrice: 20000,
    regularPrice: 25000,
    stock: 24,
    rating: 4.7,
    reviews_count: 120,
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
    referenceCostKz: 35000,
    shippingKz: 4000,
    totalCostKz: 39000,
    marginPercent: 25,
    marginKz: 9750,
    calculatedSalePrice: 48750,
    regularPrice: 55000,
    stock: 10,
    rating: 4.8,
    reviews_count: 95,
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
    referenceCostKz: 16000,
    shippingKz: 4000,
    totalCostKz: 20000,
    marginPercent: 25,
    marginKz: 5000,
    calculatedSalePrice: 25000,
    regularPrice: 30000,
    stock: 16,
    rating: 4.5,
    reviews_count: 31,
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
    referenceCostKz: 18000,
    shippingKz: 4000,
    totalCostKz: 22000,
    marginPercent: 25,
    marginKz: 5500,
    calculatedSalePrice: 27500,
    regularPrice: 32000,
    stock: 14,
    rating: 4.3,
    reviews_count: 14,
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
    referenceCostKz: 14000,
    shippingKz: 4000,
    totalCostKz: 18000,
    marginPercent: 25,
    marginKz: 4500,
    calculatedSalePrice: 22500,
    regularPrice: 28000,
    stock: 22,
    rating: 4.6,
    reviews_count: 26,
    image: '/products/rastreador-gps.jpg',
    seoTitle: 'Mini Rastreador GPS Magnético em Tempo Real para Viaturas e Objetos | AQUI TEM ANGOLA',
    seoDescription: 'Monitore o seu carro ou motorizada em tempo real com o Mini Rastreador GPS Magnético na AQUI TEM Angola. Alertas no telemóvel, botão SOS e entrega em Luanda.'
  },

  // --------------------------------------------------------------------------
  // [11] Rato Gaming Glorious Model O
  // --------------------------------------------------------------------------
  {
    id: '8a1e3b1c-7d6e-4f9a-8c2d-1b3a5f7e9d2b',
    sku: 'AT-GAM-011',
    slug: 'rato-gaming-glorious-model-o-wireless',
    slugAliases: ['rato-gaming-sem-fios-glorious-model-o-wireless-rgb', 'glorious-model-o'],
    name: 'Rato Gaming Sem Fios Glorious Model O Wireless RGB',
    brand: 'Glorious',
    category: 'Acessórios & Tech',
    sourceName: 'Fornecedor Oficial Glorious PC Gaming',
    referenceCostKz: 28000,
    shippingKz: 4000,
    totalCostKz: 32000,
    marginPercent: 25,
    marginKz: 8000,
    calculatedSalePrice: 40000,
    regularPrice: 48000,
    stock: 10,
    rating: 4.9,
    reviews_count: 38,
    image: 'https://images.unsplash.com/photo-1527698266440-12104e498b76?auto=format&fit=crop&w=800&q=80',
    seoTitle: 'Rato Gaming Sem Fios Glorious Model O Wireless RGB | AQUI TEM ANGOLA',
    seoDescription: 'Compre o Rato Gaming Sem Fios Glorious Model O Wireless RGB na AQUI TEM Angola. Sensor BAMF, ultra leve 69g e entrega rápida em Luanda.'
  },

  // --------------------------------------------------------------------------
  // [12] Teclado Kapbom
  // --------------------------------------------------------------------------
  {
    id: '2c4e6f8a-0b2d-4f6a-8c0e-2d4f6a8c0e2d',
    sku: 'AT-ACC-012',
    slug: 'teclado-bluetooth-kapbom',
    slugAliases: ['teclado-bluetooth-sem-fios-kapbom'],
    name: 'Teclado Bluetooth Sem Fios Kapbom',
    brand: 'Kapbom',
    category: 'Acessórios & Tech',
    sourceName: 'Fornecedor Kapbom Tech',
    referenceCostKz: 10000,
    shippingKz: 4000,
    totalCostKz: 14000,
    marginPercent: 25,
    marginKz: 3500,
    calculatedSalePrice: 17500,
    regularPrice: 22000,
    stock: 18,
    rating: 4.4,
    reviews_count: 22,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83dadc?auto=format&fit=crop&w=800&q=80',
    seoTitle: 'Teclado Bluetooth Sem Fios Kapbom | AQUI TEM ANGOLA',
    seoDescription: 'Teclado Bluetooth Sem Fios Kapbom ultra fino e silencioso para tablets e portáteis na AQUI TEM Angola. Entrega rápida em Luanda.'
  },

  // --------------------------------------------------------------------------
  // [13] Oraimo Smart Mouse P
  // --------------------------------------------------------------------------
  {
    id: 'f4a6e8c0-2d4f-6a8c-0e2d-4f6a8c0e2d4f',
    sku: 'AT-ACC-013',
    slug: 'oraimo-smart-mouse-p',
    slugAliases: ['oraimo-smart-mouse-p-sem-fios'],
    name: 'Oraimo Smart Mouse P Sem Fios',
    brand: 'Oraimo',
    category: 'Acessórios & Tech',
    sourceName: 'Fornecedor Oficial Oraimo Direct',
    referenceCostKz: 8000,
    shippingKz: 4000,
    totalCostKz: 12000,
    marginPercent: 25,
    marginKz: 3000,
    calculatedSalePrice: 15000,
    regularPrice: 19000,
    stock: 22,
    rating: 4.7,
    reviews_count: 41,
    image: 'https://images.unsplash.com/photo-1527698266440-12104e498b76?auto=format&fit=crop&w=800&q=80',
    seoTitle: 'Oraimo Smart Mouse P Sem Fios Silencioso | AQUI TEM ANGOLA',
    seoDescription: 'Compre o Rato Sem Fios Oraimo Smart Mouse P com cliques silenciosos na AQUI TEM Angola. Entrega rápida em Luanda.'
  },

  // --------------------------------------------------------------------------
  // [14] Webcam Kapbom 1080p
  // --------------------------------------------------------------------------
  {
    id: 'a8c0e2d4-f6a8-c0e2-d4f6-a8c0e2d4f6a8',
    sku: 'AT-ACC-014',
    slug: 'webcam-full-hd-kapbom-1080p',
    slugAliases: ['webcam-full-hd-kapbom-1080p-usb'],
    name: 'Webcam Full HD Kapbom 1080p USB com Microfone',
    brand: 'Kapbom',
    category: 'Acessórios & Tech',
    sourceName: 'Fornecedor Kapbom Digital',
    referenceCostKz: 12000,
    shippingKz: 4000,
    totalCostKz: 16000,
    marginPercent: 25,
    marginKz: 4000,
    calculatedSalePrice: 20000,
    regularPrice: 25000,
    stock: 14,
    rating: 4.5,
    reviews_count: 19,
    image: 'https://images.unsplash.com/photo-1588600102111-73602492160d?auto=format&fit=crop&w=800&q=80',
    seoTitle: 'Webcam Full HD Kapbom 1080p USB | AQUI TEM ANGOLA',
    seoDescription: 'Webcam Full HD Kapbom 1080p com microfone integrado para videochamadas e aulas online na AQUI TEM Angola.'
  },

  // --------------------------------------------------------------------------
  // [15] Kit Microfones Sem Fio Duplo
  // --------------------------------------------------------------------------
  {
    id: 'e2d4f6a8-c0e2-d4f6-a8c0-e2d4f6a8c0e2',
    sku: 'AT-ACC-015',
    slug: 'kit-microfones-sem-fio-duplo',
    slugAliases: ['kit-de-microfones-sem-fio-duplo'],
    name: 'Kit de Microfones Sem Fio Lapela — Duplo',
    brand: 'K8 / Kapbom',
    category: 'Áudio & Som',
    sourceName: 'Fornecedor Audio Tech',
    referenceCostKz: 16000,
    shippingKz: 4000,
    totalCostKz: 20000,
    marginPercent: 25,
    marginKz: 5000,
    calculatedSalePrice: 25000,
    regularPrice: 31000,
    stock: 15,
    rating: 4.8,
    reviews_count: 49,
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    seoTitle: 'Kit de Microfones Sem Fio Lapela Duplo | AQUI TEM ANGOLA',
    seoDescription: 'Kit de Microfones Sem Fio Duplo para entrevistas e gravações no telemóvel na AQUI TEM Angola. Entrega rápida.'
  },

  // --------------------------------------------------------------------------
  // [16] Cabo Oraimo MagCable USB-C Lightning
  // --------------------------------------------------------------------------
  {
    id: '6a8c0e2d-4f6a-8c0e-2d4f-6a8c0e2d4f6a',
    sku: 'AT-ACC-016',
    slug: 'cabo-oraimo-magcable-usb-c-lightning',
    slugAliases: ['cabo-oraimo-magcable-usb-c-para-lightning-1m'],
    name: 'Cabo Oraimo MagCable USB-C para Lightning — 1m',
    brand: 'Oraimo',
    category: 'Acessórios & Tech',
    sourceName: 'Fornecedor Oficial Oraimo Direct',
    referenceCostKz: 6000,
    shippingKz: 4000,
    totalCostKz: 10000,
    marginPercent: 25,
    marginKz: 2500,
    calculatedSalePrice: 12500,
    regularPrice: 16000,
    stock: 30,
    rating: 4.9,
    reviews_count: 58,
    image: 'https://images.unsplash.com/photo-1619190163414-04144b679116?auto=format&fit=crop&w=800&q=80',
    seoTitle: 'Cabo Oraimo MagCable USB-C para Lightning 1m | AQUI TEM ANGOLA',
    seoDescription: 'Cabo magnético rápido Oraimo MagCable USB-C para Lightning 1m para iPhone na AQUI TEM Angola.'
  },

  // --------------------------------------------------------------------------
  // [17] Cabo DuraLine 3 USB-A para USB-C Oraimo
  // --------------------------------------------------------------------------
  {
    id: '0e2d4f6a-8c0e-2d4f-6a8c-0e2d4f6a8c0e',
    sku: 'AT-ACC-017',
    slug: 'cabo-oraimo-duraline-3-usb-a-c',
    slugAliases: ['cabo-usb-a-para-usb-c-oraimo-duraline-3-1m'],
    name: 'Cabo USB-A para USB-C Oraimo DuraLine 3 — 1m',
    brand: 'Oraimo',
    category: 'Acessórios & Tech',
    sourceName: 'Fornecedor Oficial Oraimo Direct',
    referenceCostKz: 5000,
    shippingKz: 4000,
    totalCostKz: 9000,
    marginPercent: 25,
    marginKz: 2250,
    calculatedSalePrice: 11250,
    regularPrice: 15000,
    stock: 35,
    rating: 4.6,
    reviews_count: 73,
    image: 'https://images.unsplash.com/photo-1619190163414-04144b679116?auto=format&fit=crop&w=800&q=80',
    seoTitle: 'Cabo USB-A para USB-C Oraimo DuraLine 3 1m | AQUI TEM ANGOLA',
    seoDescription: 'Cabo ultra resistente Oraimo DuraLine 3 USB-A para USB-C 1m na AQUI TEM Angola.'
  },

  // --------------------------------------------------------------------------
  // [18] Oraimo Smart Mouse F
  // --------------------------------------------------------------------------
  {
    id: '4f6a8c0e-2d4f-6a8c-0e2d-4f6a8c0e2d4f',
    sku: 'AT-ACC-018',
    slug: 'oraimo-smart-mouse-f-wireless',
    slugAliases: ['rato-sem-fios-oraimo-smart-mouse-f-1200-dpi'],
    name: 'Rato Sem Fios Oraimo Smart Mouse F 1200 DPI',
    brand: 'Oraimo',
    category: 'Acessórios & Tech',
    sourceName: 'Fornecedor Oficial Oraimo Direct',
    referenceCostKz: 7000,
    shippingKz: 4000,
    totalCostKz: 11000,
    marginPercent: 25,
    marginKz: 2750,
    calculatedSalePrice: 13750,
    regularPrice: 18000,
    stock: 25,
    rating: 4.3,
    reviews_count: 16,
    image: 'https://images.unsplash.com/photo-1527698266440-12104e498b76?auto=format&fit=crop&w=800&q=80',
    seoTitle: 'Rato Sem Fios Oraimo Smart Mouse F 1200 DPI | AQUI TEM ANGOLA',
    seoDescription: 'Rato sem fios Oraimo Smart Mouse F 1200 DPI na AQUI TEM Angola. Confortável e econômico.'
  },

  // --------------------------------------------------------------------------
  // [19] Hub USB-C Oraimo Smart 7 em 1
  // --------------------------------------------------------------------------
  {
    id: '8c0e2d4f-6a8c-0e2d-4f6a-8c0e2d4f6a8c',
    sku: 'AT-ACC-019',
    slug: 'hub-usb-c-oraimo-smart-7-1',
    slugAliases: ['hub-usb-c-oraimo-smart-7-em-1'],
    name: 'Hub USB-C Oraimo Smart 7 em 1 Multiportas HDMI e SD',
    brand: 'Oraimo',
    category: 'Acessórios & Tech',
    sourceName: 'Fornecedor Oficial Oraimo Direct',
    referenceCostKz: 18000,
    shippingKz: 4000,
    totalCostKz: 22000,
    marginPercent: 25,
    marginKz: 5500,
    calculatedSalePrice: 27500,
    regularPrice: 34000,
    stock: 16,
    rating: 4.8,
    reviews_count: 35,
    image: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&w=800&q=80',
    seoTitle: 'Hub USB-C Oraimo Smart 7 em 1 Multiportas | AQUI TEM ANGOLA',
    seoDescription: 'Hub USB-C Oraimo Smart 7 em 1 com saída HDMI 4K, leitor SD e portas USB 3.0 na AQUI TEM Angola.'
  },

  // --------------------------------------------------------------------------
  // [20] Suporte Alumínio Notebook
  // --------------------------------------------------------------------------
  {
    id: 'd4f6a8c0-e2d4-f6a8-c0e2-d4f6a8c0e2d4',
    sku: 'AT-ACC-020',
    slug: 'suporte-aluminio-notebook-dobravel',
    slugAliases: ['suporte-de-aluminio-articulado-e-dobravel-para-notebook'],
    name: 'Suporte de Alumínio Articulado e Dobrável para Notebook',
    brand: 'ErgoTech',
    category: 'Acessórios & Tech',
    sourceName: 'Fornecedor Ergonomic Office',
    referenceCostKz: 14000,
    shippingKz: 4000,
    totalCostKz: 18000,
    marginPercent: 25,
    marginKz: 4500,
    calculatedSalePrice: 22500,
    regularPrice: 28000,
    stock: 20,
    rating: 4.7,
    reviews_count: 44,
    image: 'https://images.unsplash.com/photo-1616353075d60-01d7e0966a33?auto=format&fit=crop&w=800&q=80',
    seoTitle: 'Suporte de Alumínio Articulado e Dobrável para Notebook | AQUI TEM ANGOLA',
    seoDescription: 'Suporte ergonómico de alumínio dobrável para portátil na AQUI TEM Angola. Alivia dores no pescoço.'
  },

  // --------------------------------------------------------------------------
  // [21] Aparelho Tigre TV Box 4K
  // --------------------------------------------------------------------------
  {
    id: '1e2d3c4b-5a6b-7c8d-9e0f-1a2b3c4d5e6f',
    sku: 'AT-TV-021',
    slug: 'aparelho-tigre-tv-box-4k',
    slugAliases: ['aparelho-tigre-tv'],
    name: 'Aparelho Tigre TV Box 4K Ultra HD Android',
    brand: 'Tigre TV',
    category: 'TV & Vídeo',
    sourceName: 'Fornecedor Oficial Tigre Box Digital',
    referenceCostKz: 32000,
    shippingKz: 4000,
    totalCostKz: 36000,
    marginPercent: 25,
    marginKz: 9000,
    calculatedSalePrice: 45000,
    regularPrice: 55000,
    stock: 12,
    rating: 4.9,
    reviews_count: 82,
    image: 'https://images.unsplash.com/photo-1593359677771-48288b3941a3?auto=format&fit=crop&w=800&q=80',
    seoTitle: 'Aparelho Tigre TV Box 4K Ultra HD Android | AQUI TEM ANGOLA',
    seoDescription: 'Compre o Aparelho Tigre TV Box 4K Ultra HD com Android na AQUI TEM Angola. Canais e filmes em alta definição.'
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
  if (clean.includes('glorious') || clean.includes('model o')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-GAM-011') || null;
  }
  if (clean.includes('teclado') && clean.includes('kapbom')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-ACC-012') || null;
  }
  if (clean.includes('mouse p') || clean.includes('mouse-p')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-ACC-013') || null;
  }
  if (clean.includes('webcam') && clean.includes('kapbom')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-ACC-014') || null;
  }
  if (clean.includes('microfone')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-ACC-015') || null;
  }
  if (clean.includes('magcable')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-ACC-016') || null;
  }
  if (clean.includes('duraline')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-ACC-017') || null;
  }
  if (clean.includes('mouse f') || clean.includes('mouse-f')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-ACC-018') || null;
  }
  if (clean.includes('hub')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-ACC-019') || null;
  }
  if (clean.includes('suporte')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-ACC-020') || null;
  }
  if (clean.includes('tigre')) {
    return OFFICIAL_NEW_PRODUCTS_PRICING.find(p => p.sku === 'AT-TV-021') || null;
  }

  return null;
}
