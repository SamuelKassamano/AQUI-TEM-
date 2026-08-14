import { getAssetUrl } from '../src/utils/assets';
import { createSlug } from '../src/utils/slug';

// Helper function to create clean SVG data URIs for embedded HTML image fallback
const createSvgDataUri = (svgString) => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};

export const PRODUCT_FALLBACK_IMAGES = {
  boompop: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#F8FAFC" rx="24"/>
      <circle cx="200" cy="200" r="160" fill="#FFF0E6"/>
      <!-- Headband -->
      <path d="M110 210 C110 110, 290 110, 290 210" fill="none" stroke="#0F172A" stroke-width="24" stroke-linecap="round"/>
      <path d="M125 180 C125 125, 275 125, 275 180" fill="none" stroke="#F37021" stroke-width="8" stroke-linecap="round"/>
      <!-- Left Ear Cup -->
      <rect x="85" y="180" width="50" height="90" rx="25" fill="#1E5C9E"/>
      <rect x="100" y="190" width="30" height="70" rx="15" fill="#F37021"/>
      <!-- Right Ear Cup -->
      <rect x="265" y="180" width="50" height="90" rx="25" fill="#1E5C9E"/>
      <rect x="270" y="190" width="30" height="70" rx="15" fill="#F37021"/>
      <!-- Brand Accent -->
      <text x="200" y="320" font-family="sans-serif" font-weight="bold" font-size="20" fill="#1E5C9E" text-anchor="middle">Oraimo BOOM POP</text>
    </svg>
  `),
  watchnova2: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#F8FAFC" rx="24"/>
      <rect x="160" y="30" width="80" height="340" rx="20" fill="#1E293B"/>
      <!-- Watch Case -->
      <rect x="120" y="110" width="160" height="180" rx="36" fill="#0F172A" stroke="#F37021" stroke-width="6"/>
      <rect x="135" y="125" width="130" height="150" rx="24" fill="#1E5C9E"/>
      <!-- Screen Details -->
      <text x="200" y="170" font-family="sans-serif" font-weight="900" font-size="36" fill="#FFFFFF" text-anchor="middle">10:42</text>
      <text x="200" y="200" font-family="sans-serif" font-weight="bold" font-size="14" fill="#F37021" text-anchor="middle">7,850 STEPS</text>
      <!-- Heart Rate Pulse Line -->
      <path d="M150 235 L170 235 L180 220 L190 250 L200 225 L210 240 L220 235 L250 235" fill="none" stroke="#10B981" stroke-width="4" stroke-linecap="round"/>
      <text x="200" y="330" font-family="sans-serif" font-weight="bold" font-size="20" fill="#1E5C9E" text-anchor="middle">Oraimo WATCH NOVA 2</text>
    </svg>
  `),
  nutrifry: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#F8FAFC" rx="24"/>
      <!-- Main Body -->
      <rect x="100" y="60" width="200" height="260" rx="40" fill="#0F172A"/>
      <!-- Digital Control Panel -->
      <rect x="130" y="90" width="140" height="50" rx="12" fill="#1E293B"/>
      <text x="200" y="122" font-family="sans-serif" font-weight="bold" font-size="22" fill="#F37021" text-anchor="middle">200°C | 15:00</text>
      <!-- Transparent Window Basket -->
      <rect x="120" y="160" width="160" height="130" rx="20" fill="#1E5C9E" stroke="#F37021" stroke-width="4"/>
      <circle cx="200" cy="225" r="40" fill="#FF9F0D" opacity="0.8"/>
      <!-- Handle -->
      <rect x="185" y="270" width="30" height="30" rx="8" fill="#64748B"/>
      <text x="200" y="355" font-family="sans-serif" font-weight="bold" font-size="20" fill="#1E5C9E" text-anchor="middle">NutriFry S1 Ultra 6L</text>
    </svg>
  `),
  flexicooker: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#F8FAFC" rx="24"/>
      <!-- Induction Cooktop -->
      <rect x="70" y="90" width="260" height="220" rx="20" fill="#0F172A" stroke="#334155" stroke-width="6"/>
      <!-- Induction Heating Circle -->
      <circle cx="200" cy="180" r="70" fill="none" stroke="#F37021" stroke-width="6" stroke-dasharray="10 6"/>
      <circle cx="200" cy="180" r="40" fill="none" stroke="#F37021" stroke-width="4"/>
      <circle cx="200" cy="180" r="10" fill="#F37021"/>
      <!-- Touch Control Bar -->
      <rect x="90" y="265" width="220" height="30" rx="8" fill="#1E293B"/>
      <circle cx="120" cy="280" r="6" fill="#10B981"/>
      <text x="200" y="285" font-family="sans-serif" font-weight="bold" font-size="14" fill="#FFFFFF" text-anchor="middle">POWER: 2200W</text>
      <text x="200" y="350" font-family="sans-serif" font-weight="bold" font-size="20" fill="#1E5C9E" text-anchor="middle">Oraimo FlexiCooker</text>
    </svg>
  `),
  thermogo: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#F8FAFC" rx="24"/>
      <!-- Tumbler Body -->
      <path d="M150 100 L250 100 L235 320 L165 320 Z" fill="#F37021" stroke="#D95D12" stroke-width="4"/>
      <!-- Lid -->
      <rect x="140" y="70" width="120" height="30" rx="8" fill="#0F172A"/>
      <rect x="180" y="50" width="40" height="20" rx="6" fill="#1E5C9E"/>
      <!-- Text/Branding -->
      <text x="200" y="200" font-family="sans-serif" font-weight="900" font-size="22" fill="#FFFFFF" text-anchor="middle" transform="rotate(-90 200 200)">THERMOGO</text>
      <text x="200" y="360" font-family="sans-serif" font-weight="bold" font-size="20" fill="#1E5C9E" text-anchor="middle">Copo Térmico Oraimo</text>
    </svg>
  `),
  magpower: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#F8FAFC" rx="24"/>
      <!-- Powerbank Body -->
      <rect x="120" y="80" width="160" height="240" rx="28" fill="#1E293B" stroke="#F37021" stroke-width="4"/>
      <!-- MagSafe Magnetic Ring -->
      <circle cx="200" cy="180" r="45" fill="none" stroke="#F37021" stroke-width="8"/>
      <rect x="194" y="235" width="12" height="25" rx="4" fill="#F37021"/>
      <!-- LED Indicators -->
      <circle cx="160" cy="290" r="4" fill="#10B981"/>
      <circle cx="180" cy="290" r="4" fill="#10B981"/>
      <circle cx="200" cy="290" r="4" fill="#10B981"/>
      <circle cx="220" cy="290" r="4" fill="#10B981"/>
      <text x="200" y="355" font-family="sans-serif" font-weight="bold" font-size="20" fill="#1E5C9E" text-anchor="middle">MagPower 15W Oraimo</text>
    </svg>
  `),
  opensnap: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#F8FAFC" rx="24"/>
      <!-- Case Body -->
      <rect x="110" y="120" width="180" height="150" rx="40" fill="#1E5C9E" stroke="#0F172A" stroke-width="4"/>
      <path d="M110 170 L290 170" stroke="#F37021" stroke-width="4"/>
      <!-- Earbud Left -->
      <circle cx="160" cy="90" r="18" fill="#F37021"/>
      <rect x="155" y="90" width="10" height="30" rx="5" fill="#0F172A"/>
      <!-- Earbud Right -->
      <circle cx="240" cy="90" r="18" fill="#F37021"/>
      <rect x="235" y="90" width="10" height="30" rx="5" fill="#0F172A"/>
      <!-- LED status -->
      <circle cx="200" cy="210" r="6" fill="#10B981"/>
      <text x="200" y="330" font-family="sans-serif" font-weight="bold" font-size="20" fill="#1E5C9E" text-anchor="middle">Oraimo OpenSnap TWS</text>
    </svg>
  `),
  tv: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#F8FAFC" rx="24"/>
      <!-- TV Bezel -->
      <rect x="40" y="80" width="320" height="200" rx="8" fill="#0F172A" stroke="#334155" stroke-width="4"/>
      <!-- Screen Gradient -->
      <rect x="48" y="88" width="304" height="184" rx="4" fill="url(#tvGrad)"/>
      <text x="200" y="180" font-family="sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle">4K ULTRA HD</text>
      <!-- Stands -->
      <path d="M100 280 L80 320" stroke="#0F172A" stroke-width="8" stroke-linecap="round"/>
      <path d="M300 280 L320 320" stroke="#0F172A" stroke-width="8" stroke-linecap="round"/>
      <defs>
        <linearGradient id="tvGrad" x1="48" y1="88" x2="352" y2="272" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F37021"/>
          <stop offset="1" stopColor="#1E5C9E"/>
        </linearGradient>
      </defs>
      <text x="200" y="355" font-family="sans-serif" font-weight="bold" font-size="20" fill="#1E5C9E" text-anchor="middle">Smart TV 55" 4K UHD</text>
    </svg>
  `),
  fridge: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#F8FAFC" rx="24"/>
      <!-- Refrigerator Metallic Shell -->
      <rect x="120" y="50" width="160" height="280" rx="16" fill="#64748B" stroke="#334155" stroke-width="4"/>
      <!-- Door Division -->
      <line x1="120" y1="180" x2="280" y2="180" stroke="#0F172A" stroke-width="4"/>
      <!-- Handles -->
      <rect x="135" y="130" width="8" height="35" rx="4" fill="#0F172A"/>
      <rect x="135" y="200" width="8" height="35" rx="4" fill="#0F172A"/>
      <!-- Display Panel -->
      <rect x="180" y="90" width="40" height="20" rx="4" fill="#0F172A"/>
      <text x="200" y="104" font-family="sans-serif" font-weight="bold" font-size="10" fill="#10B981" text-anchor="middle">-18°C</text>
      <text x="200" y="360" font-family="sans-serif" font-weight="bold" font-size="20" fill="#1E5C9E" text-anchor="middle">Geladeira Frost Free 450L</text>
    </svg>
  `),
  charger: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#F8FAFC" rx="24"/>
      <!-- Charger Main Unit -->
      <rect x="130" y="110" width="140" height="150" rx="24" fill="#1E5C9E" stroke="#F37021" stroke-width="4"/>
      <!-- Wall Prongs -->
      <rect x="165" y="60" width="12" height="50" rx="4" fill="#0F172A"/>
      <rect x="223" y="60" width="12" height="50" rx="4" fill="#0F172A"/>
      <!-- USB-C Port -->
      <rect x="170" y="210" width="60" height="18" rx="9" fill="#0F172A"/>
      <!-- Fast Charge Icon -->
      <path d="M200 130 L185 160 L200 160 L195 190 L215 155 L200 155 Z" fill="#F37021"/>
      <text x="200" y="325" font-family="sans-serif" font-weight="bold" font-size="20" fill="#1E5C9E" text-anchor="middle">Carregador Rápido 22.5W</text>
    </svg>
  `)
};

export const HERO_BANNER_FALLBACK = createSvgDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
    <defs>
      <linearGradient id="heroBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1E5C9E"/>
        <stop offset="100%" stop-color="#144376"/>
      </linearGradient>
      <linearGradient id="accentOrange" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#F37021"/>
        <stop offset="100%" stop-color="#D95D12"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#heroBg)"/>
    <circle cx="1000" cy="200" r="300" fill="#F37021" opacity="0.15"/>
    <circle cx="200" cy="700" r="250" fill="#10B981" opacity="0.1"/>
    
    <!-- Store Attendant Illustration -->
    <g transform="translate(650, 100)">
      <rect x="100" y="200" width="300" height="450" rx="40" fill="url(#accentOrange)"/>
      <circle cx="250" cy="150" r="80" fill="#FFE0B2"/>
      <!-- Shirt details & badge -->
      <rect x="210" y="300" width="80" height="50" rx="10" fill="#1E5C9E"/>
      <text x="250" y="330" font-family="sans-serif" font-weight="bold" font-size="16" fill="#FFFFFF" text-anchor="middle">AQUI TEM</text>
    </g>
    
    <!-- Title and Badge -->
    <rect x="100" y="180" width="380" height="50" rx="25" fill="url(#accentOrange)"/>
    <text x="120" y="212" font-family="sans-serif" font-weight="bold" font-size="22" fill="#FFFFFF">⚡ ATENDIMENTO & LOJA AQUI TEM</text>
    <text x="100" y="320" font-family="sans-serif" font-weight="900" font-size="64" fill="#FFFFFF">Tudo em um só lugar</text>
    <text x="100" y="390" font-family="sans-serif" font-weight="bold" font-size="32" fill="#F37021">Eletrónicos & Eletrodomésticos em Angola</text>
    <text x="100" y="450" font-family="sans-serif" font-size="24" fill="#CBD5E1">Compre pelo site ou solicite o seu orçamento no WhatsApp 950752933</text>
  </svg>
`);

export const PRODUCTS = [
  {
    id: 1,
    name: 'BOOM POP PRO - Headphone Sem Fio Oraimo Premium',
    category: 'Áudio & Som',
    price: 44500,
    oldPrice: 48900,
    rating: 5.0,
    reviewsCount: 178,
    badge: 'SUPER NOVIDADE',
    image: getAssetUrl('product_boompop.jpg'),
    fallbackImage: PRODUCT_FALLBACK_IMAGES.boompop,
    description: 'Headphone sem fio Oraimo Boom Pop Pro com graves profundos, estofamento ergonômico em couro ultra macio e autonomia estendida.',
    specs: ['Cancelamento de Ruído Passivo', 'Conexão Bluetooth 5.3', 'Bateria para até 40h de música']
  },
  {
    id: 2,
    name: 'WATCH NOVA 2 - Smartwatch Inteligente Oraimo',
    category: 'Acessórios & Tech',
    price: 40500,
    oldPrice: 48900,
    rating: 4.9,
    reviewsCount: 154,
    badge: 'OFERTA DO MÊS',
    image: getAssetUrl('product_watchnova2.jpg'),
    fallbackImage: PRODUCT_FALLBACK_IMAGES.watchnova2,
    description: 'Relógio Inteligente Oraimo Watch Nova 2 com tela HD sensível ao toque, monitoramento cardíaco, notificações de chamadas e modos esportivos.',
    specs: ['Resistência à água IP68', 'Notificações WhatsApp e Chamadas', 'Monitor de Saúde e Sono']
  },
  {
    id: 3,
    name: 'NUTRIFRY S1 ULTRA 6L - Fritadeira Air Fryer Oraimo',
    category: 'Eletrodomésticos',
    price: 80900,
    oldPrice: 101200,
    rating: 4.9,
    reviewsCount: 120,
    badge: 'GRANDE PROMOÇÃO',
    image: getAssetUrl('product_nutrifry.jpg'),
    fallbackImage: PRODUCT_FALLBACK_IMAGES.nutrifry,
    description: 'Air Fryer Oraimo NutriFry S1 Ultra com visor transparente de 6 Litros. Prepare refeições crocantes e saudáveis sem usar óleo.',
    specs: ['Capacidade 6 Litros', 'Painel Digital Touch Screen', 'Janela de Visualização Panorâmica']
  },
  {
    id: 4,
    name: 'FLEXICOOKER - Placa / Fogão de Indução Elétrico Oraimo',
    category: 'Eletrodomésticos',
    price: 62900,
    oldPrice: 78900,
    rating: 4.8,
    reviewsCount: 96,
    badge: 'DESCONTO ESPECIAL',
    image: getAssetUrl('product_flexicooker.jpg'),
    fallbackImage: PRODUCT_FALLBACK_IMAGES.flexicooker,
    description: 'Placa de Indução Elétrica Oraimo FlexiCooker com controle digital de temperatura de alta precisão e aquecimento ultrarrápido.',
    specs: ['Painel Touch com Display LED', 'Economia de Energia Elétrica', 'Superfície de Vidro de Fácil Limpeza']
  },
  {
    id: 5,
    name: 'THERMOGO VACUUM - Copo Térmico Oraimo Premium',
    category: 'Acessórios & Casa',
    price: 15300,
    oldPrice: 18200,
    rating: 4.9,
    reviewsCount: 142,
    badge: 'POPULAR',
    image: getAssetUrl('product_thermogo.jpg'),
    fallbackImage: PRODUCT_FALLBACK_IMAGES.thermogo,
    description: 'Garrafa e Copo Térmico Vacuum Oraimo com retenção máxima de temperatura (quente e frio) por até 12 horas. Design fosco e ergonômico.',
    specs: ['Capacidade Térmica Avançada', 'Aço Inox de Alta Qualidade', 'Marca Oficial Oraimo']
  },
  {
    id: 6,
    name: 'MAGPOWER 15 - Powerbank Magnético 15W Oraimo',
    category: 'Acessórios & Tech',
    price: 26200,
    oldPrice: 29200,
    rating: 5.0,
    reviewsCount: 98,
    badge: 'PROMOÇÃO',
    image: getAssetUrl('product_magpower.jpg'),
    fallbackImage: PRODUCT_FALLBACK_IMAGES.magpower,
    description: 'Carregador portátil magnético Oraimo 15W sem fio. Adere perfeitamente ao seu smartphone para carregamento rápido e seguro em qualquer lugar.',
    specs: ['Carregamento Magnético Wireless 15W', 'Design Ultra Fino e Portátil', 'Certificação MFI & Segurança Oraimo']
  },
  {
    id: 7,
    name: 'ORAIMO OPENSNAP - Fones de Ouvido Sem Fio TWS',
    category: 'Áudio & Som',
    price: 27700,
    oldPrice: 30000,
    rating: 4.9,
    reviewsCount: 215,
    badge: 'MAIS VENDIDO',
    image: getAssetUrl('product_opensnap.jpg'),
    fallbackImage: PRODUCT_FALLBACK_IMAGES.opensnap,
    description: 'Fones sem fio Oraimo OpenSnap com encaixe ergonômico, som cristalino de alta fidelidade e bateria de longa duração com estojo inteligente.',
    specs: ['Conexão Bluetooth 5.3', 'Resistente a suor e respingos', 'Estojo com bateria estendida']
  },
  {
    id: 8,
    name: 'Smart TV 55" Crystal UHD 4K HDR Nova Geração',
    category: 'TV & Vídeo',
    price: 285000,
    oldPrice: 320000,
    rating: 4.8,
    reviewsCount: 64,
    badge: 'DESTAQUE',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
    fallbackImage: PRODUCT_FALLBACK_IMAGES.tv,
    description: 'Smart TV 4K com sistema operacional inteligente, comando de voz e cores hiper-realistas.',
    specs: ['Resolução 4K Ultra HD', 'HDMI, USB, Wi-Fi 5G', 'Controle com Comando de Voz']
  },
  {
    id: 9,
    name: 'Geladeira Frost Free Inverse 450L Inox',
    category: 'Eletrodomésticos',
    price: 450000,
    oldPrice: 499000,
    rating: 4.9,
    reviewsCount: 38,
    badge: 'ECONOMIA A+++',
    image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
    fallbackImage: PRODUCT_FALLBACK_IMAGES.fridge,
    description: 'Freezer em baixo e refrigerador em cima. Economia de até 45% na conta de energia.',
    specs: ['Capacidade 450 Litros', 'Tecnologia Inverter Quiet', 'Painel Touch Externo']
  },
  {
    id: 10,
    name: 'Carregador Rápido 22.5W Oraimo com Cabo USB-C',
    category: 'Acessórios & Tech',
    price: 12500,
    oldPrice: 15000,
    rating: 4.9,
    reviewsCount: 88,
    badge: 'UTILIDADE',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    fallbackImage: PRODUCT_FALLBACK_IMAGES.charger,
    description: 'Carregador rápido de parede Oraimo com proteção contra sobretensão e cabo ultra resistente.',
    specs: ['Potência 22.5W Fast Charge', 'Proteção Inteligente', 'Cabo Tipo-C Incluso']
  }
];

export const CATEGORIES = [
  'Todos',
  'Acessórios & Tech',
  'Áudio & Som',
  'Eletrodomésticos',
  'Acessórios & Casa',
  'TV & Vídeo'
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
    subtitle: 'Produtos 100% originais Oraimo e marcas líderes'
  },
  {
    icon: 'CreditCard',
    title: 'Pagamento Facilitado',
    subtitle: 'Pagamento na entrega ou transferência Kz'
  },
  {
    icon: 'MessageCircle',
    title: 'Atendimento WhatsApp',
    subtitle: 'Atendimento directo no 950752933'
  }
];

export const HERO_COVER_IMAGES = [
  {
    id: 1,
    url: getAssetUrl('banners/banner_1.jpg'),
    remoteUrl: 'https://i.ibb.co/TMktX8Jn/AQUI-TEM-IDENTIDADE-VISUAL-01.jpg',
    title: 'Identidade Visual & Showroom Aqui Tem',
    badge: 'FLYER 01 - AQUI TEM ANGOLA'
  },
  {
    id: 4,
    url: getAssetUrl('banners/banner_4.jpg'),
    remoteUrl: 'https://i.ibb.co/9mHN3mQk/AQUI-TEM-IDENTIDADE-VISUAL-04.jpg',
    title: 'Entrega Rápida & Segura em Luanda',
    badge: 'FLYER 04 - AQUI TEM ANGOLA'
  },
  {
    id: 5,
    url: getAssetUrl('banners/banner_5.jpg'),
    remoteUrl: 'https://i.ibb.co/wNyCxwtX/AQUI-TEM-IDENTIDADE-VISUAL-05.jpg',
    title: 'Preços Acessíveis & Melhores Ofertas em Kz',
    badge: 'FLYER 05 - AQUI TEM ANGOLA'
  },
  {
    id: 6,
    url: getAssetUrl('banners/banner_6.jpg'),
    remoteUrl: 'https://i.ibb.co/qMSKVyXW/AQUI-TEM-IDENTIDADE-VISUAL-06.jpg',
    title: 'Atendimento Personalizado no WhatsApp 950752933',
    badge: 'FLYER 06 - AQUI TEM ANGOLA'
  },
  {
    id: 7,
    url: getAssetUrl('banners/banner_7.jpg'),
    remoteUrl: 'https://i.ibb.co/MyJ73mjQ/AQUI-TEM-IDENTIDADE-VISUAL-07.jpg',
    title: 'Garantia Oficial & Suporte Aqui Tem',
    badge: 'FLYER 07 - AQUI TEM ANGOLA'
  },
  {
    id: 8,
    url: getAssetUrl('banners/banner_8.jpg'),
    remoteUrl: 'https://i.ibb.co/prh7RQVM/AQUI-TEM-IDENTIDADE-VISUAL-08.jpg',
    title: 'Os Melhores Lançamentos de Tecnologia em Angola',
    badge: 'FLYER 08 - AQUI TEM ANGOLA'
  },
  {
    id: 9,
    url: getAssetUrl('banners/banner_9.jpg'),
    remoteUrl: 'https://i.ibb.co/W4Th26wg/AQUI-TEM-IDENTIDADE-VISUAL-09.jpg',
    title: 'Compre com Confiança na Aqui Tem',
    badge: 'FLYER 09 - AQUI TEM ANGOLA'
  },
  {
    id: 10,
    url: getAssetUrl('banners/banner_10.jpg'),
    remoteUrl: 'https://i.ibb.co/Z6h99Gnd/AQUI-TEM-IDENTIDADE-VISUAL-10.jpg',
    title: 'A Sua Loja de Confiança em Luanda',
    badge: 'FLYER 10 - AQUI TEM ANGOLA'
  },
  {
    id: 11,
    url: getAssetUrl('banners/banner_11.jpg'),
    remoteUrl: 'https://i.ibb.co/VY6ZtdfD/FLAYER-AQUI-TEM-03.jpg',
    title: 'Promoção Especial Aqui Tem',
    badge: 'FLYER 11 - OFERTA ESPECIAL'
  },
  {
    id: 12,
    url: getAssetUrl('banners/banner_12.jpg'),
    remoteUrl: 'https://i.ibb.co/3Ycyn5J0/FLAYER-MUNDIAL-copiar-Prancheta-1-c-pia.jpg',
    title: 'Campanha Mundial Aqui Tem',
    badge: 'FLYER 12 - CAMPANHA MUNDIAL'
  },
  {
    id: 13,
    url: getAssetUrl('banners/banner_13.jpg'),
    remoteUrl: 'https://i.ibb.co/vxF0LSdZ/FLAYER-MUNDIAL-OPSAO-Prancheta-1.jpg',
    title: 'Especiais de Tecnologia & Cozinha',
    badge: 'FLYER 13 - EDICÃO MUNDIAL'
  },
  {
    id: 14,
    url: getAssetUrl('banners/banner_14.jpg'),
    remoteUrl: 'https://i.ibb.co/5X9mTfk6/flayer-03.jpg',
    title: 'Lançamentos & Destaques da Semana',
    badge: 'FLYER 14 - DESTAQUE'
  },
  {
    id: 15,
    url: getAssetUrl('banners/banner_15.jpg'),
    remoteUrl: 'https://i.ibb.co/FbxrFhK9/5-04.jpg',
    title: 'Qualidade & Inovação no Seu Dia a Dia',
    badge: 'FLYER 15 - PROMOÇÃO'
  },
  {
    id: 16,
    url: getAssetUrl('banners/banner_16.png'),
    remoteUrl: 'https://i.ibb.co/nM1XLzQ6/ac.png',
    title: 'Loja Oficial Aqui Tem - Luanda, Angola',
    badge: 'FLYER 16 - AQUI TEM'
  }
];


