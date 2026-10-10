import { createClient } from '@supabase/supabase-js';
import { createSlug } from '../utils/slug';
import { PRODUCTS, PRODUCT_FALLBACK_IMAGES } from '../../data/products';

export const SUPABASE_PROJECT_ID = 'essjwjbtzytefycjodgh';
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  `https://${SUPABASE_PROJECT_ID}.supabase.co`;

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY && SUPABASE_PUBLISHABLE_KEY.length > 10
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

/**
 * Safely returns the effective selling price of a product.
 * Uses sale_price if > 0, otherwise price. Never returns NaN or negative.
 */
export function getEffectivePrice(product) {
  if (!product) return 0;
  const salePrice = Number(product.sale_price ?? product.salePrice);
  const regularPrice = Number(product.price);

  if (Number.isFinite(salePrice) && salePrice > 0) {
    return salePrice;
  }
  if (Number.isFinite(regularPrice) && regularPrice > 0) {
    return regularPrice;
  }
  return 0;
}

/**
 * Safely returns the previous/crossed-out price (old_price or price when sale_price is active).
 * Only returns a number if it is strictly greater than the effective price.
 */
export function getPreviousPrice(product) {
  if (!product) return null;
  const effective = getEffectivePrice(product);
  const oldPrice = Number(product.old_price ?? product.oldPrice);
  const regularPrice = Number(product.price);

  if (Number.isFinite(oldPrice) && oldPrice > effective && effective > 0) {
    return oldPrice;
  }
  if (
    Number.isFinite(regularPrice) &&
    regularPrice > effective &&
    effective > 0
  ) {
    return regularPrice;
  }
  return null;
}

/**
 * Formats a price in Kwanzas (Kz).
 * Never outputs "0 Kz", "NaN", or "undefined".
 */
export function formatPriceKz(val, lang = 'pt') {
  const num = Number(val);
  if (!Number.isFinite(num) || num <= 0) {
    return lang === 'en' ? 'Contact for price' : 'Sob consulta';
  }
  return new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 0 }).format(Math.round(num)) + ' Kz';
}

/**
 * Infers brand from product data or name
 */
export function inferBrand(raw) {
  if (raw?.brand && String(raw.brand).trim()) {
    return String(raw.brand).trim();
  }
  const name = String(raw?.name || '').toLowerCase();
  if (name.includes('oraimo')) return 'Oraimo';
  if (name.includes('smart tv')) return 'Crystal UHD';
  if (name.includes('geladeira')) return 'Inverse Inox';
  return 'Oraimo';
}

/**
 * Normalizes a product record from Supabase (`products` table) or local catalog
 * so both schemas work seamlessly across the entire app.
 */
export function normalizeProduct(raw, index = 0) {
  if (!raw) return null;

  const baseMatch = PRODUCTS.find(
    p =>
      String(p.id) === String(raw.id) ||
      (raw.slug && (p.slug === raw.slug || createSlug(p.name) === raw.slug)) ||
      (raw.name && createSlug(p.name) === createSlug(raw.name))
  );

  const name = String(raw.name || baseMatch?.name || 'Produto AQUI TEM').trim();
  const slug = String(raw.slug || baseMatch?.slug || createSlug(name)).trim();
  const price = Number(raw.price ?? baseMatch?.price ?? 0);
  const salePriceRaw = raw.sale_price ?? raw.salePrice ?? baseMatch?.sale_price ?? null;
  const sale_price =
    salePriceRaw !== null && salePriceRaw !== '' && Number(salePriceRaw) > 0
      ? Number(salePriceRaw)
      : null;

  const oldPriceRaw = raw.old_price ?? raw.oldPrice ?? baseMatch?.old_price ?? baseMatch?.oldPrice ?? null;
  const old_price =
    oldPriceRaw !== null && oldPriceRaw !== '' && Number(oldPriceRaw) > 0
      ? Number(oldPriceRaw)
      : null;

  const stockRaw = raw.stock ?? baseMatch?.stock;
  const stock =
    stockRaw !== undefined && stockRaw !== null && stockRaw !== ''
      ? Math.max(0, parseInt(stockRaw, 10) || 0)
      : 0;

  const image_url = String(raw.image_url || raw.image || baseMatch?.image || '/logo.jpg').trim();
  const fallbackImage =
    raw.fallbackImage ||
    baseMatch?.fallbackImage ||
    PRODUCT_FALLBACK_IMAGES.boompop;

  const ratingRaw = Number(raw.rating ?? baseMatch?.rating ?? 4.9);
  const rating = Number.isFinite(ratingRaw) && ratingRaw > 0 ? Math.min(5, Math.max(1, ratingRaw)) : 4.9;

  const reviewsCountRaw = Number(raw.reviews_count ?? raw.reviewsCount ?? baseMatch?.reviewsCount ?? 50);
  const reviews_count = Number.isFinite(reviewsCountRaw) && reviewsCountRaw >= 0 ? Math.round(reviewsCountRaw) : 50;

  const specs =
    Array.isArray(raw.specs) && raw.specs.length > 0
      ? raw.specs.filter(Boolean)
      : typeof raw.specs === 'string' && raw.specs.trim()
      ? raw.specs.split('\n').map(s => s.trim()).filter(Boolean)
      : Array.isArray(baseMatch?.specs)
      ? baseMatch.specs
      : [];

  const active = raw.active !== undefined && raw.active !== null ? Boolean(raw.active) : true;
  const category = String(raw.category || baseMatch?.category || 'Acessórios & Tech').trim();
  const brand = inferBrand(raw.brand ? raw : baseMatch || raw);
  const sku = String(
    raw.sku ||
      baseMatch?.sku ||
      `AT-${String(index + 1).padStart(3, '0')}`
  ).trim();
  const badge =
    raw.badge !== undefined && raw.badge !== null && String(raw.badge).trim() !== ''
      ? String(raw.badge).trim()
      : (baseMatch?.badge || '');

  return {
    ...baseMatch,
    ...raw,
    id: raw.id ?? baseMatch?.id ?? `local-${index + 1}`,
    created_at: raw.created_at || new Date().toISOString(),
    name,
    slug,
    slugAliases: raw.slugAliases || baseMatch?.slugAliases || [],
    description: String(raw.description || baseMatch?.description || '').trim(),
    price: Number.isFinite(price) && price > 0 ? price : (baseMatch?.price || 10000),
    sale_price,
    salePrice: sale_price,
    old_price,
    oldPrice: old_price,
    category,
    brand,
    stock,
    sku,
    image_url,
    image: image_url,
    fallbackImage,
    whiteBg: raw.whiteBg !== undefined ? Boolean(raw.whiteBg) : Boolean(baseMatch?.whiteBg),
    orangeBg: raw.orangeBg !== undefined ? Boolean(raw.orangeBg) : Boolean(baseMatch?.orangeBg),
    active,
    rating,
    reviews_count,
    reviewsCount: reviews_count,
    badge,
    specs
  };
}

/**
 * Formats a product object into the exact columns of the Supabase `products` table
 */
export function toSupabaseProductPayload(product) {
  const baseMatch = PRODUCTS.find(
    p =>
      String(p.id) === String(product.id) ||
      (product.slug && (p.slug === product.slug || createSlug(p.name) === product.slug)) ||
      (product.name && createSlug(p.name) === createSlug(product.name))
  );

  const name = String(product.name || baseMatch?.name || '').trim();
  const slug = String(product.slug || baseMatch?.slug || createSlug(name)).trim();
  const price = Number(product.price ?? baseMatch?.price) || 0;
  const salePriceNum = Number(product.sale_price ?? product.salePrice);
  const oldPriceNum = Number(product.old_price ?? product.oldPrice ?? baseMatch?.old_price);
  const stockNum = parseInt(product.stock ?? baseMatch?.stock ?? 0, 10);
  const ratingNum = Number(product.rating ?? baseMatch?.rating ?? 5.0);
  const reviewsCountNum = parseInt(
    product.reviews_count ?? product.reviewsCount ?? baseMatch?.reviewsCount ?? 50,
    10
  );

  const specsArray =
    Array.isArray(product.specs) && product.specs.length > 0
      ? product.specs.map(s => String(s).trim()).filter(Boolean)
      : typeof product.specs === 'string' && product.specs.trim()
      ? product.specs.split('\n').map(s => s.trim()).filter(Boolean)
      : Array.isArray(baseMatch?.specs)
      ? baseMatch.specs
      : [];

  const badgeVal =
    product.badge !== undefined && product.badge !== null && String(product.badge).trim() !== ''
      ? String(product.badge).trim()
      : (baseMatch?.badge || null);

  return {
    name,
    slug,
    description: String(product.description || baseMatch?.description || '').trim(),
    price: price > 0 ? price : (baseMatch?.price || 1000),
    sale_price: Number.isFinite(salePriceNum) && salePriceNum > 0 ? salePriceNum : null,
    old_price: Number.isFinite(oldPriceNum) && oldPriceNum > 0 ? oldPriceNum : null,
    category: String(product.category || baseMatch?.category || 'Acessórios & Tech').trim(),
    brand: String(product.brand || baseMatch?.brand || inferBrand(product)).trim(),
    stock: Number.isFinite(stockNum) && stockNum >= 0 ? stockNum : 0,
    sku: String(product.sku || baseMatch?.sku || '').trim() || `AT-${Date.now().toString().slice(-5)}`,
    image_url: String(product.image_url || product.image || baseMatch?.image || '/logo.jpg').trim(),
    active: product.active !== undefined ? Boolean(product.active) : true,
    rating: Number.isFinite(ratingNum) && ratingNum > 0 ? ratingNum : 5.0,
    reviews_count: Number.isFinite(reviewsCountNum) && reviewsCountNum >= 0 ? reviewsCountNum : 10,
    badge: badgeVal,
    specs: specsArray
  };
}

/**
 * Uploads an image file to Supabase Storage bucket `product-images`
 */
export async function uploadProductImageToSupabase(file, slugPrefix = 'produto') {
  if (!supabase) {
    throw new Error('Supabase não está configurado com a chave pública.');
  }
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const safeSlug = createSlug(slugPrefix || 'produto') || 'produto';
  const filePath = `products/${safeSlug}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
  return data.publicUrl;
}
