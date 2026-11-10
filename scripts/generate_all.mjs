import fs from 'fs';
import path from 'path';

// Load products
const { PRODUCTS, PRODUCT_FALLBACK_IMAGES } = await import('../data/products.js');
const { OFFICIAL_NEW_PRODUCTS_PRICING } = await import('../src/data/productPricing.js');

// 1. Precise 18 Oraimo Price & Specification updates
const ORAIMO_FIXES = {
  'f1a1001a-1111-5001-a001-000000000052': {
    supplier: 14400,
    margin25: 3600,
    fee: 4000,
    price: 22000,
    regular: 28000,
    name: 'Fones de Ouvido Sem Fio Oraimo SpaceBuds Neo OTW-323 com BassUp',
    slug: 'fones-sem-fio-oraimo-spacebuds-neo-otw-323'
  },
  'f2a2002b-2222-5002-a002-000000000053': {
    supplier: 4100,
    margin25: 1025,
    fee: 4000,
    price: 9125,
    regular: 12000,
    name: 'Carregador Rápido de Parede Oraimo Firefly 3 OCW-E66S com Cabo M53',
    slug: 'carregador-rapido-parede-oraimo-firefly-3-ocw-e66s'
  },
  'f3a3003c-3333-5003-a003-000000000054': {
    supplier: 26200,
    margin25: 6550,
    fee: 4000,
    price: 36750,
    regular: 44000,
    name: 'Difusor de Aromas e Humidificador Inteligente Oraimo AromaGlow 2 OAD-213A com Luz Noturna',
    slug: 'difusor-aromas-humidificador-oraimo-oad-213a'
  },
  'f4a4004d-4444-5004-a004-000000000055': {
    supplier: 7500,
    margin25: 1875,
    fee: 4000,
    price: 13375,
    regular: 18000,
    name: 'Fones de Ouvido Bluetooth de Pescoço Oraimo Necklace Neo OEB-E310 50h de Bateria',
    slug: 'fones-ouvido-bluetooth-pescoco-oraimo-necklace-neo'
  },
  'f5a5005e-5555-5005-a005-000000000056': {
    supplier: 15900,
    margin25: 3975,
    fee: 4000,
    price: 23875,
    regular: 29000,
    name: 'Garrafa Térmica Isolada a Vácuo Oraimo QuickSip 620ml OHDW-001 Aço Inox',
    slug: 'garrafa-termica-quicksip-620ml-oraimo-ohdw-001'
  },
  'f6a6006f-6666-5006-a006-000000000057': {
    supplier: 35000,
    margin25: 8750,
    fee: 4000,
    price: 47750,
    regular: 58000,
    name: 'Câmara Wi-Fi de Segurança Oraimo Vigicam 3MP Ultra HD Visão Noturna OSH-015A',
    slug: 'camera-seguranca-wifi-oraimo-vigicam-3mp-osh-015a',
    category: 'Segurança & Câmaras',
    image: '/products/oraimo-camera-seguranca-vigicam-osh-015a.png',
    description: 'Câmara de Segurança Wi-Fi Oraimo Vigicam 3MP Ultra HD OSH-015A original Oraimo com visão noturna infravermelha avançada, deteção inteligente de movimento com alertas instantâneos no telemóvel, áudio bidirecional e gravação segura. Ideal para vigilância da sua residência ou empresa em Angola.'
  },
  'f7a7007a-7777-5007-a007-000000000058': {
    supplier: 104200,
    margin25: 26050,
    fee: 4000,
    price: 134250,
    regular: 155000,
    name: 'Coluna de Som Portátil Bluetooth Oraimo SpaceBox Pro OBS-682 Graves Potentes 80W',
    slug: 'coluna-som-bluetooth-oraimo-spacebox-pro-obs-682'
  },
  'f8a8008b-8888-5008-a008-000000000059': {
    supplier: 16900,
    margin25: 4225,
    fee: 4000,
    price: 25125,
    regular: 32000,
    name: 'Smartwatch Oraimo Watch 5 Lite OSW-804 Ecrã HD 2.01" Chamadas Bluetooth',
    slug: 'smartwatch-oraimo-watch-5-lite-osw-804-hd'
  },
  'f9a9009c-9999-5009-a009-000000000060': {
    supplier: 29000,
    margin25: 7250,
    fee: 4000,
    price: 40250,
    regular: 48000,
    name: 'Fones de Ouvido Open-Ear Oraimo OpenAir OPN-670N Condução de Ar e Graves',
    slug: 'fones-ouvido-open-ear-oraimo-openair-opn-670n'
  },
  'f0b0010d-0000-5010-b010-000000000061': {
    supplier: 14000,
    margin25: 3500,
    fee: 4000,
    price: 21500,
    regular: 26000,
    name: 'Power Bank Oraimo Toast 10 OPB-1205N 10.000mAh Dupla Saída Rápida',
    slug: 'power-bank-oraimo-toast-10-opb-1205n-10000mah'
  },
  'f1b1011e-1111-5011-b011-000000000062': {
    supplier: 37700,
    margin25: 9425,
    fee: 4000,
    price: 51125,
    regular: 62000,
    name: 'Jarro Elétrico Chaleira em Aço Inox Oraimo SmartKettle Byte OF-KK200N 1.8L Fervura Rápida',
    slug: 'jarro-eletrico-chaleira-inox-oraimo-of-kk200n-1-8l'
  },
  'f2b2012f-2222-5012-b012-000000000063': {
    supplier: 29300,
    margin25: 7325,
    fee: 4000,
    price: 40625,
    regular: 49000,
    name: 'Smartwatch Oraimo Watch Nova 2R Lite OSW-824 Ecrã AMOLED 1.43" com Chamadas Bluetooth',
    slug: 'smartwatch-oraimo-watch-4-plus-osw-824-hd-2-01'
  },
  'f3b3013a-3333-5013-b013-000000000064': {
    supplier: 38200,
    margin25: 9550,
    fee: 4000,
    price: 51750,
    regular: 62000,
    name: 'Relógio Inteligente Oraimo Watch Muse 2 OSW-833N Rose Gold com Display AMOLED',
    slug: 'relogio-inteligente-oraimo-watch-nova-osw-833n-rose-gold'
  },
  'f4b4014b-4444-5014-b014-000000000065': {
    supplier: 40200,
    margin25: 10050,
    fee: 4000,
    price: 54250,
    regular: 65000,
    name: 'Smartwatch Redondo Oraimo Watch Nova 2 Air OSW-814S Display AMOLED Always-On',
    slug: 'smartwatch-redondo-oraimo-watch-er-osw-814s-amoled'
  },
  'f5b5015c-5555-5015-b015-000000000066': {
    supplier: 19700,
    margin25: 4925,
    fee: 4000,
    price: 28625,
    regular: 35000,
    name: 'Secador de Cabelo Profissional Oraimo SwiftDry 2 OHD-210N com Tecnologia Iónica',
    slug: 'secador-cabelo-profissional-oraimo-swiftdry-2-ohd-210n'
  },
  'f6b6016d-6666-5016-b016-000000000067': {
    supplier: 20500,
    margin25: 5125,
    fee: 4000,
    price: 29625,
    regular: 36000,
    name: 'Máquina de Cortar Cabelo Profissional Oraimo SmartClipper 2 OPC-CL30C Bateria 150min',
    slug: 'maquina-cortar-cabelo-oraimo-smartclipper-2-opc-cl30c'
  },
  'f7b7017e-7777-5017-b017-000000000068': {
    supplier: 49400,
    margin25: 12350,
    fee: 4000,
    price: 65750,
    regular: 78000,
    name: 'Roteador Wi-Fi Dual Band Oraimo Falcon AC OF-WR205N AC1200 com 4 Antenas 5dBi',
    slug: 'roteador-wifi-dual-band-oraimo-falcon-ac-of-wr205n'
  },
  'f8b8018f-8888-5018-b018-000000000069': {
    supplier: 43100,
    margin25: 10775,
    fee: 4000,
    price: 57875,
    regular: 68000,
    name: 'Coluna Bluetooth 360° Oraimo SpaceBox Active OBS-680 com Show de Luzes RGB e Graves',
    slug: 'coluna-bluetooth-360-oraimo-soundflow-obs-680-rgb'
  }
};

// 2. Update PRODUCTS in-memory
for (const p of PRODUCTS) {
  if (ORAIMO_FIXES[p.id]) {
    const fix = ORAIMO_FIXES[p.id];
    p.price = fix.price;
    p.sale_price = fix.price;
    p.old_price = fix.regular;
    if (fix.name) p.name = fix.name;
    if (fix.slug) p.slug = fix.slug;
    if (fix.category) p.category = fix.category;
    if (fix.image) {
      p.image_url = fix.image;
      p.image = fix.image;
      p.fallbackImage = fix.image;
      p.images = [fix.image];
    }
    if (fix.description) p.description = fix.description;
  }
}

// 3. Write updated data/products.js with all exports
const productsJsCode = `import { createSlug } from '../src/utils/slug.js';

// Helper function to create clean SVG data URIs for embedded HTML image fallback
const createSvgDataUri = (svgString) => {
  return "data:image/svg+xml;utf8," + encodeURIComponent(svgString);
};

export const PRODUCT_FALLBACK_IMAGES = ${JSON.stringify(PRODUCT_FALLBACK_IMAGES, null, 2)};

export const HERO_BANNER_FALLBACK = '/banners/banner_1.jpg';

export const HERO_COVER_IMAGES = [
  {
    url: '/banners/banner_1.jpg',
    tag: 'Operação Central Luanda',
    title: 'AQUI TEM ANGOLA',
    subtitle: 'Tecnologia Oficial e Eletrodomésticos com Pronta Entrega'
  },
  {
    url: '/banners/banner_2.jpg',
    tag: 'Distribuidor Autorizado',
    title: 'Linha Premium Oraimo',
    subtitle: 'Fones TWS, Smartwatches e Carregadores com Garantia Real'
  },
  {
    url: '/banners/banner_3.jpg',
    tag: 'Smart Home & Conforto',
    title: 'Casa Inteligente & Tech',
    subtitle: 'Câmaras Wi-Fi, Mini Projetores e Acessórios Selecionados'
  }
];

export const PRODUCTS = ${JSON.stringify(PRODUCTS, null, 2)};

export const DEACTIVATED_LEGACY_PRODUCTS = [];

export const CATEGORIES = [
  'Todos',
  'Áudio & Som',
  'Smartwatches',
  'Acessórios & Tech',
  'Acessórios & Casa',
  'Segurança & Câmaras',
  'Energia',
  'TV & Vídeo',
  'Eletrodomésticos',
  'Celular',
  'Outros'
];

export const ADVANTAGES = [
  {
    icon: 'Truck',
    title: 'Entregas Rápidas',
    subtitle: 'Em Luanda e províncias de Angola'
  },
  {
    icon: 'ShieldCheck',
    title: 'Garantia de Qualidade',
    subtitle: '100% selado na caixa original'
  },
  {
    icon: 'CreditCard',
    title: 'Pagamento Seguro',
    subtitle: 'TPA Multicaixa na entrega ou transferência'
  },
  {
    icon: 'MessageCircle',
    title: 'Suporte Humanizado',
    subtitle: 'Atendimento contínuo via WhatsApp'
  }
];

export default PRODUCTS;
`;

fs.writeFileSync(path.resolve('data/products.js'), productsJsCode, 'utf8');
console.log('Successfully updated data/products.js with all required exports!');
