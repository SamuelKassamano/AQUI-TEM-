import { PRODUCTS } from '../../data/products';
import { PRODUCT_VIDEOS } from '../data/videos';
import { TESTIMONIALS } from '../data/testimonials';

export function getTranslatedProduct(product, lang) {
  if (!product) return product;

  // Always find base product from PRODUCTS array to guarantee we can recover original Portuguese text
  const baseProduct = PRODUCTS.find(p => p.id === product.id) || product;

  if (lang !== 'en') {
    return {
      ...baseProduct,
      quantity: product.quantity || baseProduct.quantity
    };
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

  const translated = enMap[product.id];
  if (!translated) return baseProduct;

  return {
    ...baseProduct,
    ...translated,
    quantity: product.quantity || baseProduct.quantity
  };
}

export function getTranslatedCategory(category, lang) {
  if (!category) return category;

  const mapToEn = {
    'Todos': 'All',
    'Acessórios & Tech': 'Accessories & Tech',
    'Áudio & Som': 'Audio & Sound',
    'Eletrodomésticos': 'Home Appliances',
    'Acessórios & Casa': 'Accessories & Home',
    'TV & Vídeo': 'TV & Video'
  };

  const mapToPt = {
    'All': 'Todos',
    'Accessories & Tech': 'Acessórios & Tech',
    'Audio & Sound': 'Áudio & Som',
    'Home Appliances': 'Eletrodomésticos',
    'Accessories & Home': 'Acessórios & Casa',
    'TV & Video': 'TV & Vídeo'
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
  const matched = TESTIMONIALS.filter(t => t.productId === product.id);
  const list = matched.length > 0 ? matched : TESTIMONIALS.slice(0, 2);
  return list.map(item => getTranslatedTestimonial(item, lang));
}
