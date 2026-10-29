import { PRODUCTS } from '../../data/products.js';
import { PRODUCT_VIDEOS } from '../data/videos.js';
import { TESTIMONIALS } from '../data/testimonials.js';

export function getTranslatedProduct(product, lang) {
  if (!product) return product;

  // Match base product by supabaseId, id, slug, slugAliases, or name so Supabase UUID rows still match translations & fallbacks
  const pSlug = product.slug ? String(product.slug).toLowerCase().trim() : '';
  const baseProduct =
    PRODUCTS.find(
      p =>
        String(p.supabaseId) === String(product.id) ||
        String(p.id) === String(product.id) ||
        (pSlug &&
          (p.slug === pSlug ||
            (Array.isArray(p.slugAliases) &&
              p.slugAliases.map(a => a.toLowerCase()).includes(pSlug)))) ||
        (product.name && p.name.toLowerCase() === product.name.toLowerCase())
    ) || product;

  const rawSupabaseImageUrl =
    typeof product.image_url === 'string' ? product.image_url.trim() : '';

  const mainImage =
    rawSupabaseImageUrl !== ''
      ? rawSupabaseImageUrl
      : (typeof product.image === 'string' && product.image.trim() !== ''
          ? product.image.trim()
          : baseProduct?.image || baseProduct?.fallbackImage || '/logo.jpg');

  const mergedProduct = {
    ...baseProduct,
    ...product,
    image_url: mainImage,
    image: mainImage,
    originalCategory: product.category || baseProduct.category,
    fallbackImage: baseProduct?.image || product.fallbackImage || baseProduct?.fallbackImage,
    svgFallbackImage: baseProduct?.fallbackImage || product.svgFallbackImage,
    quantity: product.quantity || baseProduct.quantity
  };

  if (lang !== 'en') {
    return mergedProduct;
  }

  const enMap = {
    1: {
      name: 'BOOM POP PRO - Oraimo Premium Wireless Headphone',
      category: 'Audio & Sound',
      badge: 'NEW ARRIVAL',
      description: 'Oraimo Boom Pop Pro wireless headphone with deep bass, ergonomic ultra-soft leather padding, and extended battery life.',
      specs: ['Passive Noise Cancellation', 'Bluetooth 5.3 Connection', 'Up to 40h Music Playtime']
    },
    2: {
      name: 'WATCH NOVA 2 - Oraimo Smart Watch',
      category: 'Accessories & Tech',
      badge: 'OFFER OF THE MONTH',
      description: 'Oraimo Watch Nova 2 Smartwatch featuring HD touchscreen, heart rate tracking, call notifications, and multi-sport modes.',
      specs: ['IP68 Water Resistance', 'WhatsApp & Call Notifications', 'Health & Sleep Tracker']
    },
    3: {
      name: 'NUTRIFRY S1 ULTRA 6L - Oraimo Air Fryer',
      category: 'Home Appliances',
      badge: 'GREAT DEAL',
      description: 'Oraimo NutriFry S1 Ultra Air Fryer with 6L clear viewing window. Cook crispy, healthy meals without oil.',
      specs: ['6 Liter Capacity', 'Digital Touch Screen Panel', 'Panoramic Viewing Window']
    },
    4: {
      name: 'FLEXICOOKER - Oraimo Electric Induction Hob',
      category: 'Home Appliances',
      badge: 'SPECIAL DISCOUNT',
      description: 'Oraimo FlexiCooker Electric Induction Hob with high-precision digital temperature control and ultra-fast heating.',
      specs: ['Touch Panel with LED Display', 'Energy Saving System', 'Easy-Clean Glass Surface']
    },
    5: {
      name: 'THERMOGO VACUUM - Oraimo Premium Thermal Tumbler',
      category: 'Accessories & Home',
      badge: 'POPULAR',
      description: 'Oraimo Vacuum Bottle and Tumbler with maximum temperature retention (hot & cold) for up to 12 hours. Matte ergonomic design.',
      specs: ['Advanced Thermal Retention', 'High-Grade Stainless Steel', 'Official Oraimo Brand']
    },
    6: {
      name: 'MAGPOWER 15 - Oraimo 15W Magnetic Powerbank',
      category: 'Accessories & Tech',
      badge: 'PROMOTION',
      description: 'Oraimo 15W wireless magnetic portable charger. Snaps magnetically to your smartphone for fast and secure charging on the go.',
      specs: ['15W Wireless Magnetic Charging', 'Ultra Slim & Portable Design', 'MFI & Oraimo Safety Certified']
    },
    7: {
      name: 'ORAIMO OPENSNAP - TWS Wireless Earbuds',
      category: 'Audio & Sound',
      badge: 'BEST SELLER',
      description: 'Oraimo OpenSnap wireless earbuds with ergonomic fit, high-fidelity crystal sound, and long battery life with smart charging case.',
      specs: ['Bluetooth 5.3 Connection', 'Sweat & Splash Resistant', 'Extended Battery Charging Case']
    },
    8: {
      name: 'Smart TV 55" Crystal UHD 4K HDR Next Gen',
      category: 'TV & Video',
      badge: 'FEATURED',
      description: '55" 4K Smart TV with intelligent operating system, voice control, and ultra-realistic vibrant colors.',
      specs: ['4K Ultra HD Resolution', 'HDMI, USB, 5G Wi-Fi', 'Voice Remote Control']
    },
    9: {
      name: 'Frost Free Inverse Refrigerator 450L Stainless Steel',
      category: 'Home Appliances',
      badge: 'A+++ ENERGY SAVER',
      description: 'Bottom freezer and top refrigerator. Saves up to 45% on electricity bills.',
      specs: ['450 Liter Capacity', 'Quiet Inverter Technology', 'External Touch Control Panel']
    },
    10: {
      name: 'Fast Charger 22.5W Oraimo with USB-C Cable',
      category: 'Accessories & Tech',
      badge: 'UTILITY',
      description: 'Oraimo fast wall charger with surge protection and heavy-duty ultra-durable cable.',
      specs: ['22.5W Fast Charge Power', 'Smart Over-Voltage Protection', 'Type-C Cable Included']
    }
  };

  const lookupId = baseProduct?.id ?? product.id;
  const translated = enMap[lookupId];
  if (!translated) return mergedProduct;

  return {
    ...mergedProduct,
    ...translated,
    // Keep custom overrides if edited in Admin
    price: product.price ?? baseProduct.price,
    sale_price: product.sale_price ?? baseProduct.sale_price,
    old_price: product.old_price ?? product.oldPrice ?? baseProduct.old_price,
    oldPrice: product.old_price ?? product.oldPrice ?? baseProduct.oldPrice,
    stock: product.stock ?? baseProduct.stock,
    image: mainImage,
    image_url: mainImage,
    quantity: product.quantity || baseProduct.quantity
  };
}

export function getTranslatedCategory(category, lang) {
  if (!category) return category;

  const mapToEn = {
    'Todos': 'All',
    'Acessórios & Tech': 'Accessories & Tech',
    'Áudio & Som': 'Audio & Sound',
    'Áudio': 'Audio',
    'Smartwatches': 'Smartwatches',
    'Eletrodomésticos': 'Home Appliances',
    'Acessórios & Casa': 'Accessories & Home',
    'Casa': 'Home',
    'Energia': 'Power & Energy',
    'Celular': 'Mobile & Phones',
    'TV & Vídeo': 'TV & Video',
    'Outros': 'Others'
  };

  const mapToPt = {
    'All': 'Todos',
    'Accessories & Tech': 'Acessórios & Tech',
    'Audio & Sound': 'Áudio & Som',
    'Audio': 'Áudio & Som',
    'Smartwatches': 'Smartwatches',
    'Home Appliances': 'Eletrodomésticos',
    'Accessories & Home': 'Acessórios & Casa',
    'Home': 'Acessórios & Casa',
    'Power & Energy': 'Energia',
    'Mobile & Phones': 'Celular',
    'TV & Video': 'TV & Vídeo',
    'Others': 'Outros'
  };

  if (lang === 'en') {
    return mapToEn[category] || category;
  }
  return mapToPt[category] || category;
}

export function getTranslatedVideo(video, lang) {
  if (!video) return video;
  const baseVideo = PRODUCT_VIDEOS.find(v => v.id === video.id) || video;

  if (lang !== 'en') {
    return baseVideo;
  }

  const enMap = {
    1: {
      title: 'Oraimo Portable Desk Fan',
      category: 'Home Appliances',
      description: 'Oraimo compact and portable desk fan with ultra-quiet motor and adjustable airflow, perfect for office desks, bedrooms, and study tables.',
      tag: 'MINI FAN'
    },
    2: {
      title: 'Oraimo Smartwatch',
      category: 'Smartwatches',
      description: 'Smartwatch featuring HD touch screen, adjustable ergonomic strap, magnetic charging, and full health tracking.',
      tag: 'SMARTWATCH'
    },
    3: {
      title: 'Oraimo Smartphone & Protective Case',
      category: 'Phones & Accessories',
      description: 'Stylish smartphone featuring a high-durability purple protective case, offering comfort, speed, and seamless integration.',
      tag: 'TECHNOLOGY'
    },
    4: {
      title: 'Oraimo Sports Vacuum Flask',
      category: 'Accessories & Home',
      description: 'Stainless steel sports vacuum flask with safety lock, side handle for easy carrying, and long-lasting thermal insulation.',
      tag: 'HYDRATION'
    },
    5: {
      title: 'Oraimo Portable Garment Steamer',
      category: 'Home Appliances',
      description: 'Portable clothes steamer and iron: quickly remove wrinkles and sanitize fabrics at home or while traveling.',
      tag: 'CLOTHES STEAMER'
    },
    6: {
      title: 'Oraimo Portable Bluetooth Speaker',
      category: 'Audio & Electronics',
      description: 'Portable Bluetooth speaker with immersive bass, long battery life, and crystal-clear sound for any room.',
      tag: 'BLUETOOTH AUDIO'
    }
  };

  const translated = enMap[video.id];
  if (!translated) return baseVideo;

  return {
    ...baseVideo,
    ...translated
  };
}

export function getTranslatedTestimonial(testimonial, lang) {
  if (!testimonial) return testimonial;
  const base = TESTIMONIALS.find(t => t.id === testimonial.id) || testimonial;

  if (lang !== 'en') {
    return base;
  }

  const enMap = {
    1: {
      date: '2 days ago',
      comment: 'Incredible sound! The noise cancellation and comfort of the Boom Pop Pro ear cushions are next level. I use them at the office and while traveling every day.'
    },
    2: {
      date: '5 days ago',
      comment: 'Super punchy bass and battery that lasts the whole week without charging. 100% genuine Oraimo product delivered in hand!'
    },
    3: {
      date: '2 days ago',
      comment: 'Bought my Oraimo Watch Nova 2 at Aqui Tem and was impressed! Delivered to Kilamba on the same day and paid by POS upon delivery.'
    },
    4: {
      date: '5 days ago',
      comment: 'Super bright round screen and receives all WhatsApp notifications and calls clearly. Battery lasts over a week!'
    },
    5: {
      date: '4 days ago',
      comment: 'The Oraimo Air Fryer changed my kitchen! Very easy to use, great viewing window, and saves oil. 10/10 service!'
    },
    6: {
      date: '1 week ago',
      comment: 'Fits a whole chicken easily in the 6 liters! Roasts super fast and the window lets you check without opening the basket.'
    },
    7: {
      date: '1 week ago',
      comment: 'Wonderful induction cooker, fast to cook and low power consumption. The Aqui Tem team sent a test video before shipping to Huambo.'
    },
    8: {
      date: '6 days ago',
      comment: 'No more worrying about running out of gas at home! Boils water in seconds and the touch panel is very easy to clean.'
    },
    9: {
      date: '3 days ago',
      comment: 'Keeps water ice cold all day even in Luanda heat! Super sleek matte finish and never sweats on the outside.'
    },
    10: {
      date: '1 week ago',
      comment: 'I take hot coffee to work in the morning and by afternoon it is still hot. Excellent Oraimo quality!'
    },
    11: {
      date: '1 week ago',
      comment: 'Super powerful powerbank, holds my smartphone charging wirelessly with a strong magnet. Arrived well packaged in Lubango!'
    },
    12: {
      date: '5 days ago',
      comment: 'Very slim and sleek, fits in the pocket with the phone. 15W magnetic charging is super fast and safe.'
    },
    13: {
      date: '1 week ago',
      comment: 'Very comfortable earbuds for walks and workouts. Crystal clear audio and never fall off the ear. Arrived perfectly in Cabinda!'
    },
    14: {
      date: '4 days ago',
      comment: 'Modern design and super compact case. Bluetooth connection is instant as soon as I open the box. 100% recommend!'
    },
    15: {
      date: '3 days ago',
      comment: 'Stunning 4K picture for watching football and Netflix with the family! Delivered and tested right in my living room in Talatona.'
    },
    16: {
      date: '1 week ago',
      comment: 'Super vivid colors, clean sound, and voice control makes everything so easy. Great service from the Aqui Tem team!'
    },
    17: {
      date: '5 days ago',
      comment: 'Super spacious, quiet, and energy-saving refrigerator. The stainless steel finish looks perfect in the kitchen.'
    },
    18: {
      date: '1 week ago',
      comment: 'Cools very fast and the touch panel on the door is super practical. Careful delivery right to our apartment in Nova Vida!'
    },
    19: {
      date: '2 days ago',
      comment: 'Charges my phone from 0 to 80% in no time without heating up! The included cable is thick and durable.'
    },
    20: {
      date: '6 days ago',
      comment: 'Genuine Oraimo charger with power surge protection. Totally worth it!'
    }
  };

  const translated = enMap[testimonial.id];
  if (!translated) return base;

  return {
    ...base,
    ...translated
  };
}

export function getProductTestimonials(product, lang = 'pt') {
  if (!product) return [];

  const rawId = String(product.id || product.supabaseId || '').toLowerCase().trim();
  const rawSlug = String(product.slug || '').toLowerCase().trim();
  const rawName = String(product.name || '').toLowerCase().trim();

  // 1. Direct match by productId or productSlug
  let matched = TESTIMONIALS.filter(t => {
    const tPid = String(t.productId || '').toLowerCase().trim();
    const tSlug = String(t.productSlug || '').toLowerCase().trim();
    if (rawId && tPid === rawId) return true;
    if (rawSlug && tSlug === rawSlug) return true;
    return false;
  });

  // 2. Keyword matching by product name or slug
  if (matched.length === 0) {
    if (rawName.includes('nova 2') || rawSlug.includes('nova-2') || rawName.includes('osw-814')) {
      matched = TESTIMONIALS.filter(t => t.productId === '250bfc74-fc6b-4c1a-867e-984b33a0ab06');
    } else if (rawName.includes('prisma') || rawSlug.includes('prisma')) {
      matched = TESTIMONIALS.filter(t => t.productId === '46e7034d-6a7f-41de-a4d8-e883040645a4');
    } else if (rawName.includes('1.8') || rawSlug.includes('18-bluetooth')) {
      matched = TESTIMONIALS.filter(t => t.productId === 'd8f54944-7134-4d66-907e-4b134a091afc');
    } else if (rawName.includes('boompop') || rawName.includes('boom pop') || rawSlug.includes('auscultadores-bluetooth')) {
      matched = TESTIMONIALS.filter(t => t.productId === 'b1665cb5-f5fc-4ff4-8dbf-379aacc9794b');
    } else if (rawName.includes('opensnap') || rawSlug.includes('opensnap') || rawName.includes('opn-371')) {
      matched = TESTIMONIALS.filter(t => t.productId === 'ce68593d-3752-4dff-99a3-d28b4237d6a2');
    } else if (rawName.includes('spacebuds') || rawSlug.includes('spacebuds') || rawName.includes('otw-324')) {
      matched = TESTIMONIALS.filter(t => t.productId === '9f9c71ca-5614-4385-8175-5e2e303a8709');
    } else if (rawName.includes('necklace') || rawSlug.includes('necklace') || rawName.includes('oeb-e311')) {
      matched = TESTIMONIALS.filter(t => t.productId === '8cfe6239-ef53-47d2-bd1d-8a849ab9e38d');
    } else if (rawName.includes('70w') || rawName.includes('bmx') || rawSlug.includes('bmx-70w')) {
      matched = TESTIMONIALS.filter(t => t.productId === '54afed87-d9a4-492c-922e-07819e34f07e');
    } else if (rawName.includes('power bank') || rawName.includes('10000mah') || rawSlug.includes('power-bank')) {
      matched = TESTIMONIALS.filter(t => t.productId === '28ce7427-2e08-4ad4-a568-c9558641d5c7');
    } else if (rawName.includes('tws') || rawSlug.includes('fones-de-ouvido-tws')) {
      matched = TESTIMONIALS.filter(t => t.productId === '3a1373b1-f09f-491e-ae85-8695398ac32a');
    } else if (rawName.includes('wiwu') || rawName.includes('45w') || rawSlug.includes('wiwu')) {
      matched = TESTIMONIALS.filter(t => t.productId === 'f18e3d33-95bf-4bfe-90bf-87969b094e32');
    } else if (rawName.includes('smart plug') || rawName.includes('tomada') || rawSlug.includes('smart-plug') || rawSlug.includes('tomada-inteligente')) {
      matched = TESTIMONIALS.filter(t => t.productId === '6be401b8-4dc3-4564-9818-6593bc764422');
    } else if (rawName.includes('defender') || rawName.includes('camera') || rawName.includes('câmera') || rawSlug.includes('camera')) {
      matched = TESTIMONIALS.filter(t => t.productId === '9961e2e9-98c6-462b-8b6c-fd584f9b7a6d');
    } else if (rawName.includes('projetor') || rawName.includes('projector') || rawSlug.includes('projetor')) {
      matched = TESTIMONIALS.filter(t => t.productId === '7c8a4192-3110-4f25-88de-8ef7a1599a01');
    } else if (rawName.includes('coluna') || rawSlug.includes('coluna-bluetooth')) {
      matched = TESTIMONIALS.filter(t => t.productId === '84f18b32-9cb4-482a-a9e3-2e78dc2361b2');
    } else if (rawName.includes('impressora') || rawSlug.includes('impressora')) {
      matched = TESTIMONIALS.filter(t => t.productId === '91dc572e-84a1-4322-9df7-e61a2578c909');
    } else if (rawName.includes('rastreador') || rawSlug.includes('rastreador')) {
      matched = TESTIMONIALS.filter(t => t.productId === 'a083d917-7e23-4581-be99-0e7f7b321a10');
    } else if (rawName.includes('glorious') || rawName.includes('model o') || rawSlug.includes('glorious')) {
      matched = TESTIMONIALS.filter(t => t.productId === '8a1e3b1c-7d6e-4f9a-8c2d-1b3a5f7e9d2b');
    } else if (rawName.includes('kapbom') && (rawName.includes('teclado') || rawSlug.includes('teclado'))) {
      matched = TESTIMONIALS.filter(t => t.productId === '2c4e6f8a-0b2d-4f6a-8c0e-2d4f6a8c0e2d');
    } else if (rawName.includes('mouse p') || rawSlug.includes('mouse-p')) {
      matched = TESTIMONIALS.filter(t => t.productId === 'f4a6e8c0-2d4f-6a8c-0e2d-4f6a8c0e2d4f');
    } else if (rawName.includes('kapbom') && (rawName.includes('webcam') || rawSlug.includes('webcam'))) {
      matched = TESTIMONIALS.filter(t => t.productId === 'a8c0e2d4-f6a8-c0e2-d4f6-a8c0e2d4f6a8');
    } else if (rawName.includes('microfone') || rawSlug.includes('microfone')) {
      matched = TESTIMONIALS.filter(t => t.productId === 'e2d4f6a8-c0e2-d4f6-a8c0-e2d4f6a8c0e2');
    } else if (rawName.includes('magcable') || rawSlug.includes('magcable')) {
      matched = TESTIMONIALS.filter(t => t.productId === '6a8c0e2d-4f6a-8c0e-2d4f-6a8c0e2d4f6a');
    } else if (rawName.includes('duraline') || rawSlug.includes('duraline')) {
      matched = TESTIMONIALS.filter(t => t.productId === '0e2d4f6a-8c0e-2d4f-6a8c-0e2d4f6a8c0e');
    } else if (rawName.includes('mouse f') || rawSlug.includes('mouse-f')) {
      matched = TESTIMONIALS.filter(t => t.productId === '4f6a8c0e-2d4f-6a8c-0e2d-4f6a8c0e2d4f');
    } else if (rawName.includes('hub') || rawSlug.includes('hub')) {
      matched = TESTIMONIALS.filter(t => t.productId === '8c0e2d4f-6a8c-0e2d-4f6a-8c0e2d4f6a8c');
    } else if (rawName.includes('suporte') || rawSlug.includes('suporte')) {
      matched = TESTIMONIALS.filter(t => t.productId === 'd4f6a8c0-e2d4-f6a8-c0e2-d4f6a8c0e2d4');
    } else if (rawName.includes('tigre') || rawSlug.includes('tigre')) {
      matched = TESTIMONIALS.filter(t => t.productId === '1e2d3c4b-5a6b-7c8d-9e0f-1a2b3c4d5e6f');
    }
  }

  // 3. Fallback: hash product name so every product gets distinct reviews
  if (matched.length === 0) {
    let hash = 0;
    for (let i = 0; i < rawName.length; i++) {
      hash = (hash << 5) - hash + rawName.charCodeAt(i);
      hash |= 0;
    }
    const startIndex = Math.abs(hash) % Math.max(1, TESTIMONIALS.length - 2);
    matched = TESTIMONIALS.slice(startIndex, startIndex + 2);
  }

  return matched.map(item => getTranslatedTestimonial(item, lang));
}
