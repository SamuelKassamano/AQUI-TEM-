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
      comment: 'I bought my Oraimo Watch Nova 2 smartwatch from Aqui Tem and was impressed! Delivered to Kilamba on the same day and paid via POS upon delivery. 100% genuine watch!'
    },
    2: {
      date: '4 days ago',
      comment: 'The Oraimo Air Fryer changed my kitchen! Very easy to use and saves oil. Excellent customer service on WhatsApp 950752933, answered all my questions.'
    },
    3: {
      date: '1 week ago',
      comment: 'I live in Benguela and the shipment arrived in 24h via Macon carrier. The headphones have high audio quality and the battery lasts a long time. Highly recommend Aqui Tem!'
    },
    4: {
      date: '1 week ago',
      comment: 'Wonderful induction cooker, fast to cook and low power consumption. The Aqui Tem team was super attentive and sent a video test before shipping to Huambo.'
    },
    5: {
      date: '2 weeks ago',
      comment: 'Super powerful powerbank, holds my iPhone wireless charging at work. Arrived well packaged here in Lubango. Serious and reliable store!'
    },
    6: {
      date: '2 weeks ago',
      comment: 'Top line thermal bottle and tumbler! Keeps water ice cold all day long in Luanda heat. Fast delivery in Zango.'
    },
    7: {
      date: '3 weeks ago',
      comment: 'Very comfortable earbuds for walks and workouts. Crystal clear audio. Arrived perfectly in Cabinda. 10/10 service!'
    },
    8: {
      date: '1 month ago',
      comment: 'The Oraimo desk fan is super powerful and quiet! Saves my work routine in Maianga. Top service!'
    }
  };

  const translated = enMap[testimonial.id];
  if (!translated) return base;

  return {
    ...base,
    ...translated
  };
}
