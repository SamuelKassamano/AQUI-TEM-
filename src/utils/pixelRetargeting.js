// ==========================================================================
// AQUI TEM - PIXEL RETARGETING & SOCIAL MEDIA AUTOMATION ENGINE
// Integra: Facebook Pixel, Instagram, TikTok Pixel, Twitter/X Pixel
// ==========================================================================

// ---- PIXEL IDs (configurar via CRM Dashboard) ----
const STORAGE_PIXELS = 'aqui_tem_pixels';

export function getPixelConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_PIXELS);
    if (!raw) return { fb: '', tt: '', tw: '', snap: '' };
    return JSON.parse(raw);
  } catch (e) {
    return { fb: '', tt: '', tw: '', snap: '' };
  }
}

export function savePixelConfig(config) {
  localStorage.setItem(STORAGE_PIXELS, JSON.stringify(config));
}

// ==========================================================================
// FACEBOOK PIXEL (também cobre Instagram - mesmo pixel)
// ==========================================================================
export function initFacebookPixel(pixelId) {
  if (!pixelId || typeof window === 'undefined') return;
  if (window.fbq) return; // já inicializado

  /* eslint-disable */
  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod
        ? n.callMethod.apply(n, arguments)
        : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js'
  );
  /* eslint-enable */

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
}

export function fbTrackViewContent(productName, price, currency = 'AOA') {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'ViewContent', {
    content_name: productName,
    content_type: 'product',
    value: price,
    currency: currency,
  });
}

export function fbTrackAddToCart(productName, price, currency = 'AOA') {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'AddToCart', {
    content_name: productName,
    value: price,
    currency: currency,
  });
}

export function fbTrackLead(productName) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'Lead', {
    content_name: productName,
  });
}

export function fbTrackPurchase(value, currency = 'AOA') {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'Purchase', { value, currency });
}

export function fbTrackInitiateCheckout(value, currency = 'AOA') {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'InitiateCheckout', { value, currency });
}

export function fbTrackContact() {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'Contact');
}

// ==========================================================================
// TIKTOK PIXEL
// ==========================================================================
export function initTikTokPixel(pixelId) {
  if (!pixelId || typeof window === 'undefined') return;
  if (window.ttq) return;

  /* eslint-disable */
  !(function (w, d, t) {
    w.TiktokAnalyticsObject = t;
    var ttq = (w[t] = w[t] || []);
    (ttq.methods = [
      'page',
      'track',
      'identify',
      'instances',
      'debug',
      'on',
      'off',
      'once',
      'ready',
      'alias',
      'group',
      'enableCookie',
      'disableCookie',
    ]),
      (ttq.setAndDefer = function (t, e) {
        t[e] = function () {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      });
    for (var i = 0; i < ttq.methods.length; i++)
      ttq.setAndDefer(ttq, ttq.methods[i]);
    (ttq.instance = function (t) {
      for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)
        ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    }),
      (ttq.load = function (e, n) {
        var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        (ttq._i = ttq._i || {}),
          (ttq._i[e] = []),
          (ttq._i[e]._u = i),
          (ttq._t = ttq._t || {}),
          (ttq._t[e] = +new Date()),
          (ttq._o = ttq._o || {}),
          (ttq._o[e] = n || {});
        n = document.createElement('script');
        (n.type = 'text/javascript'),
          (n.async = !0),
          (n.src = i + '?sdkid=' + e + '&lib=' + t);
        e = document.getElementsByTagName('script')[0];
        e.parentNode.insertBefore(n, e);
      });
    ttq.load(pixelId);
    ttq.page();
  })(window, document, 'ttq');
  /* eslint-enable */
}

export function ttTrackViewContent(productName, price, currency = 'AOA') {
  if (typeof window === 'undefined' || !window.ttq) return;
  window.ttq.track('ViewContent', {
    content_name: productName,
    value: price,
    currency: currency,
  });
}

export function ttTrackAddToCart(productName, price, currency = 'AOA') {
  if (typeof window === 'undefined' || !window.ttq) return;
  window.ttq.track('AddToCart', {
    content_name: productName,
    value: price,
    currency: currency,
  });
}

export function ttTrackContact() {
  if (typeof window === 'undefined' || !window.ttq) return;
  window.ttq.track('Contact');
}

export function ttTrackPurchase(value, currency = 'AOA') {
  if (typeof window === 'undefined' || !window.ttq) return;
  window.ttq.track('CompletePayment', { value, currency });
}

// ==========================================================================
// TWITTER / X PIXEL
// ==========================================================================
export function initTwitterPixel(pixelId) {
  if (!pixelId || typeof window === 'undefined') return;
  if (window.twq) return;

  /* eslint-disable */
  !(function (e, t, n, s, u, a) {
    e.twq ||
      ((s = e.twq = function () {
        s.exe ? s.exe.apply(s, arguments) : s.queue.push(arguments);
      }),
      (s.version = '1.1'),
      (s.queue = []),
      (u = t.createElement(n)),
      (u.async = !0),
      (u.src = 'https://static.ads-twitter.com/uwt.js'),
      (a = t.getElementsByTagName(n)[0]),
      a.parentNode.insertBefore(u, a));
  })(window, document, 'script');
  /* eslint-enable */

  window.twq('config', pixelId);
}

export function twTrackPageView() {
  if (typeof window === 'undefined' || !window.twq) return;
  window.twq('event', 'tw-pageview');
}

export function twTrackViewContent() {
  if (typeof window === 'undefined' || !window.twq) return;
  window.twq('event', 'tw-viewcontent');
}

export function twTrackLead() {
  if (typeof window === 'undefined' || !window.twq) return;
  window.twq('event', 'tw-lead');
}

export function twTrackPurchase(value) {
  if (typeof window === 'undefined' || !window.twq) return;
  window.twq('event', 'tw-purchase', { value });
}

// ==========================================================================
// INIT ALL PIXELS (chamado na inicialização do app)
// ==========================================================================
export function initAllPixels() {
  const config = getPixelConfig();
  if (config.fb) initFacebookPixel(config.fb);
  if (config.tt) initTikTokPixel(config.tt);
  if (config.tw) initTwitterPixel(config.tw);
}

// ==========================================================================
// TRACK PRODUCT VIEW (dispara todos os pixels ativos)
// ==========================================================================
export function trackProductView(productName, price) {
  const config = getPixelConfig();
  if (config.fb && window.fbq) fbTrackViewContent(productName, price);
  if (config.tt && window.ttq) ttTrackViewContent(productName, price);
}

// ==========================================================================
// TRACK WHATSAPP CLICK / LEAD (dispara todos os pixels ativos)
// ==========================================================================
export function trackWhatsAppLead(productName, price) {
  const config = getPixelConfig();
  if (config.fb && window.fbq) {
    fbTrackLead(productName);
    fbTrackInitiateCheckout(price);
    fbTrackContact();
  }
  if (config.tt && window.ttq) {
    ttTrackAddToCart(productName, price);
    ttTrackContact();
  }
  if (config.tw && window.twq) {
    twTrackLead();
  }
}