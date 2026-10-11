import { createClient } from '@supabase/supabase-js';
import { createSlug } from '../utils/slug';
import { PRODUCTS, PRODUCT_FALLBACK_IMAGES } from '../../data/products';

export const SUPABASE_PROJECT_ID = 'essjwjbtzytefycjodgh';

const rawEnvUrl = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_URL =
  (rawEnvUrl.split('VITE_SUPABASE_')[0] || '').trim() ||
  `https://${SUPABASE_PROJECT_ID}.supabase.co`;

const rawEnvKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

const sanitizedKey = rawEnvKey
  .split('VITE_SUPABASE_')[0]
  .trim();

// Never allow a Supabase Secret Key / service_role key in the frontend client
const isForbiddenSecretKey =
  sanitizedKey.startsWith('sb_secret_') ||
  sanitizedKey.includes('service_role');

export const SUPABASE_PUBLISHABLE_KEY = isForbiddenSecretKey ? '' : sanitizedKey;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY && SUPABASE_PUBLISHABLE_KEY.length > 10
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

/**
 * Verifies that there is a valid authenticated session in Supabase Auth.
 * Throws an error if no valid session exists.
 */
export async function requireAdminSession() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Cliente Supabase não configurado (VITE_SUPABASE_PUBLISHABLE_KEY ausente).'
    );
  }
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.user || !data?.session?.access_token) {
    throw new Error(
      'Sessão administrativa inválida ou expirada. Faça login novamente no Supabase Auth.'
    );
  }
  return data.session;
}

/**
 * Safely returns the effective selling price of a product.
 * Uses sale_price if > 0 and lower than regular price (or when regular price is 0), otherwise price.
 * Never returns NaN or negative.
 */
export function getEffectivePrice(product) {
  if (!product) return 0;
  const salePrice = Number(product.sale_price ?? product.salePrice);
  const regularPrice = Number(product.price);

  if (
    Number.isFinite(salePrice) &&
    salePrice > 0 &&
    (!Number.isFinite(regularPrice) || regularPrice <= 0 || salePrice < regularPrice)
  ) {
    return salePrice;
  }
  if (Number.isFinite(regularPrice) && regularPrice > 0) {
    return regularPrice;
  }
  if (Number.isFinite(salePrice) && salePrice > 0) {
    return salePrice;
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
 * Finds matching fallback product from local catalog by supabaseId, id, slug, slugAliases, sku, or name
 */
export function findBaseCatalogMatch(raw) {
  if (!raw) return null;
  const rawId = raw.id !== undefined && raw.id !== null ? String(raw.id).trim() : '';
  const rawSlug = raw.slug ? String(raw.slug).toLowerCase().trim() : '';
  const rawNameSlug = raw.name ? createSlug(raw.name).toLowerCase() : '';
  const rawSku = raw.sku ? String(raw.sku).toLowerCase().trim() : '';

  return (
    PRODUCTS.find(p => {
      if (rawId && (String(p.supabaseId) === rawId || String(p.id) === rawId)) return true;
      if (rawSku && p.sku && String(p.sku).toLowerCase().trim() === rawSku) return true;
      const pSlug = (p.slug || createSlug(p.name)).toLowerCase();
      const aliases = Array.isArray(p.slugAliases)
        ? p.slugAliases.map(a => a.toLowerCase())
        : [];
      if (rawSlug && (pSlug === rawSlug || aliases.includes(rawSlug))) return true;
      if (
        rawNameSlug &&
        (pSlug === rawNameSlug ||
          createSlug(p.name) === rawNameSlug ||
          aliases.includes(rawNameSlug))
      ) {
        return true;
      }
      return false;
    }) || null
  );
}

/**
 * Resolves the primary product image URL.
 * When product.image_url exists and is non-empty, uses it directly.
 * Only falls back to local/existing images when image_url is empty.
 */
export function getProductMainImage(product, baseMatch = null) {
  if (!product) return '/logo.jpg';
  const match = baseMatch || findBaseCatalogMatch(product);

  const rawImageUrl =
    typeof product.image_url === 'string'
      ? product.image_url.trim().replace(/^['"]+|['"]+$/g, '')
      : '';

  if (rawImageUrl !== '') {
    if (rawImageUrl.startsWith('/storage/v1/')) {
      return `${SUPABASE_URL}${rawImageUrl}`;
    }
    return rawImageUrl;
  }

  const fallbackLocal =
    (typeof product.image === 'string' && product.image.trim() !== ''
      ? product.image.trim()
      : '') ||
    match?.image ||
    product.fallbackImage ||
    match?.fallbackImage ||
    '/logo.jpg';

  return fallbackLocal;
}

/**
 * Normalizes a product record from Supabase (`products` table) or local catalog
 * so both schemas work seamlessly across the entire app.
 */
export function normalizeProduct(raw, index = 0) {
  if (!raw) return null;

  const baseMatch = findBaseCatalogMatch(raw);
  const isSupabaseRow = Boolean(
    raw.id && typeof raw.id === 'string' && raw.id.length > 10
  );

  const name = String(raw.name ?? baseMatch?.name ?? 'Produto AQUI TEM').trim();
  const slug = String(raw.slug || baseMatch?.slug || createSlug(name)).trim();
  const price = Number(raw.price ?? baseMatch?.price ?? 0);

  const salePriceRaw = isSupabaseRow
    ? raw.sale_price
    : (raw.sale_price ?? raw.salePrice ?? baseMatch?.sale_price ?? null);
  const sale_price =
    salePriceRaw !== null &&
    salePriceRaw !== undefined &&
    salePriceRaw !== '' &&
    Number(salePriceRaw) > 0
      ? Number(salePriceRaw)
      : null;

  const oldPriceRaw = isSupabaseRow
    ? raw.old_price
    : (raw.old_price ?? raw.oldPrice ?? baseMatch?.old_price ?? baseMatch?.oldPrice ?? null);
  const old_price =
    oldPriceRaw !== null &&
    oldPriceRaw !== undefined &&
    oldPriceRaw !== '' &&
    Number(oldPriceRaw) > 0
      ? Number(oldPriceRaw)
      : null;

  const stockRaw = isSupabaseRow ? raw.stock : (raw.stock ?? baseMatch?.stock);
  const parsedStock = parseInt(stockRaw, 10);
  const stock = Number.isFinite(parsedStock) && parsedStock >= 0 ? parsedStock : 0;

  const rawSupabaseImage =
    typeof raw.image_url === 'string'
      ? raw.image_url.trim().replace(/^['"]+|['"]+$/g, '')
      : '';
  const mainImage = getProductMainImage(raw, baseMatch);
  const image_url = rawSupabaseImage !== '' ? mainImage : mainImage;

  const fallbackImage =
    baseMatch?.image ||
    raw.fallbackImage ||
    baseMatch?.fallbackImage ||
    PRODUCT_FALLBACK_IMAGES.boompop;

  const ratingRaw = Number(
    isSupabaseRow ? (raw.rating ?? 4.9) : (raw.rating ?? baseMatch?.rating ?? 4.9)
  );
  const rating =
    Number.isFinite(ratingRaw) && ratingRaw > 0
      ? Math.min(5, Math.max(1, ratingRaw))
      : 4.9;

  const reviewsCountRaw = Number(
    isSupabaseRow
      ? (raw.reviews_count ?? 0)
      : (raw.reviews_count ?? raw.reviewsCount ?? baseMatch?.reviewsCount ?? 50)
  );
  const reviews_count =
    Number.isFinite(reviewsCountRaw) && reviewsCountRaw >= 0
      ? Math.round(reviewsCountRaw)
      : 0;

  const specs = Array.isArray(raw.specs)
    ? raw.specs.filter(Boolean)
    : typeof raw.specs === 'string' && raw.specs.trim()
    ? raw.specs.split('\n').map(s => s.trim()).filter(Boolean)
    : !isSupabaseRow && Array.isArray(baseMatch?.specs)
    ? baseMatch.specs
    : [];

  const active =
    raw.active !== undefined && raw.active !== null ? Boolean(raw.active) : true;
  const category = String(
    raw.category || baseMatch?.category || 'Acessórios & Tech'
  ).trim();
  const brand =
    raw.brand !== undefined && raw.brand !== null && String(raw.brand).trim() !== ''
      ? String(raw.brand).trim()
      : inferBrand(baseMatch || raw);
  const sku =
    raw.sku !== undefined && raw.sku !== null && String(raw.sku).trim() !== ''
      ? String(raw.sku).trim()
      : String(baseMatch?.sku || `AT-${String(index + 1).padStart(3, '0')}`).trim();
  const badge = isSupabaseRow
    ? (raw.badge !== undefined && raw.badge !== null ? String(raw.badge).trim() : '')
    : (raw.badge !== undefined && raw.badge !== null && String(raw.badge).trim() !== ''
        ? String(raw.badge).trim()
        : (baseMatch?.badge || ''));

  const mergedAliases = Array.from(
    new Set([
      ...(Array.isArray(baseMatch?.slugAliases) ? baseMatch.slugAliases : []),
      ...(Array.isArray(raw.slugAliases) ? raw.slugAliases : []),
      ...(baseMatch?.slug ? [baseMatch.slug] : []),
      ...(slug ? [slug] : [])
    ])
  );

  return {
    ...baseMatch,
    ...raw,
    id: raw.id ?? baseMatch?.supabaseId ?? baseMatch?.id ?? `local-${index + 1}`,
    created_at: raw.created_at || new Date().toISOString(),
    name,
    slug,
    slugAliases: mergedAliases,
    description: String(
      isSupabaseRow
        ? (raw.description ?? '')
        : (raw.description || baseMatch?.description || '')
    ).trim(),
    price: Number.isFinite(price) && price > 0 ? price : (baseMatch?.price || 10000),
    sale_price,
    salePrice: sale_price,
    old_price,
    oldPrice: old_price,
    category,
    brand,
    stock,
    sku,
    raw_image_url: rawSupabaseImage,
    image_url,
    image: mainImage,
    fallbackImage,
    svgFallbackImage: baseMatch?.fallbackImage || PRODUCT_FALLBACK_IMAGES.boompop,
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
 * Formats a product object into the exact columns of the Supabase `public.products` table:
 * - name
 * - slug
 * - description
 * - price
 * - sale_price
 * - old_price
 * - category
 * - brand
 * - stock
 * - sku
 * - image_url
 * - active
 * - rating
 * - reviews_count
 * - badge
 * - specs
 */
export function toSupabaseProductPayload(product) {
  const baseMatch = findBaseCatalogMatch(product);

  const name = String(product.name ?? baseMatch?.name ?? '').trim();
  const slug = String(product.slug || baseMatch?.slug || createSlug(name)).trim();
  const description = String(product.description ?? '').trim();

  const priceNum = Number(product.price);
  const price = Number.isFinite(priceNum) && priceNum > 0 ? priceNum : (baseMatch?.price || 1000);

  const rawSalePrice = 'sale_price' in product ? product.sale_price : product.salePrice;
  const salePriceNum =
    rawSalePrice !== null && rawSalePrice !== undefined && rawSalePrice !== ''
      ? Number(rawSalePrice)
      : null;
  const sale_price =
    salePriceNum !== null && Number.isFinite(salePriceNum) && salePriceNum > 0
      ? salePriceNum
      : null;

  const rawOldPrice = 'old_price' in product ? product.old_price : product.oldPrice;
  const oldPriceNum =
    rawOldPrice !== null && rawOldPrice !== undefined && rawOldPrice !== ''
      ? Number(rawOldPrice)
      : null;
  const old_price =
    oldPriceNum !== null && Number.isFinite(oldPriceNum) && oldPriceNum > 0
      ? oldPriceNum
      : null;

  const category = String(
    product.category || baseMatch?.category || 'Acessórios & Tech'
  ).trim();

  const brand =
    product.brand !== undefined && product.brand !== null && String(product.brand).trim() !== ''
      ? String(product.brand).trim()
      : String(baseMatch?.brand || inferBrand(product)).trim();

  const stockParsed = parseInt(product.stock, 10);
  const stock = Number.isFinite(stockParsed) && stockParsed >= 0 ? stockParsed : 0;

  const sku =
    product.sku !== undefined && product.sku !== null && String(product.sku).trim() !== ''
      ? String(product.sku).trim()
      : null;

  const explicitImageUrl =
    typeof product.image_url === 'string'
      ? product.image_url.trim().replace(/^['"]+|['"]+$/g, '')
      : '';
  const image_url =
    explicitImageUrl !== ''
      ? explicitImageUrl
      : getProductMainImage(product, baseMatch);

  const active =
    product.active !== undefined && product.active !== null
      ? Boolean(product.active)
      : true;

  const ratingParsed = Number(product.rating);
  const rating =
    Number.isFinite(ratingParsed) && ratingParsed > 0
      ? Math.min(5, Math.max(1, ratingParsed))
      : 4.9;

  const rawReviews =
    'reviews_count' in product ? product.reviews_count : product.reviewsCount;
  const reviewsParsed = parseInt(rawReviews, 10);
  const reviews_count =
    Number.isFinite(reviewsParsed) && reviewsParsed >= 0 ? reviewsParsed : 0;

  const badge =
    product.badge !== undefined && product.badge !== null && String(product.badge).trim() !== ''
      ? String(product.badge).trim()
      : null;

  const specs = Array.isArray(product.specs)
    ? product.specs.map(s => String(s).trim()).filter(Boolean)
    : typeof product.specs === 'string' && product.specs.trim() !== ''
    ? product.specs
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
    : [];

  return {
    name,
    slug,
    description,
    price,
    sale_price,
    old_price,
    category,
    brand,
    stock,
    sku,
    image_url,
    active,
    rating,
    reviews_count,
    badge,
    specs
  };
}

/**
 * Uploads an image file to Supabase Storage bucket (`products` or `product-images`)
 */
export async function uploadProductImageToSupabase(file, slugPrefix = 'produto') {
  await requireAdminSession();
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const safeSlug = createSlug(slugPrefix || 'produto') || 'produto';
  const fileName = `${safeSlug}-${Date.now()}.${ext}`;

  // Try bucket `products` first (already configured in project), fallback to `product-images`
  const bucketsToTry = ['products', 'product-images'];
  let lastError = null;

  for (const bucketName of bucketsToTry) {
    const filePath = bucketName === 'products' ? fileName : `products/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (!uploadError) {
      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      return data.publicUrl;
    }
    lastError = uploadError;
  }

  throw lastError || new Error('Erro ao enviar imagem para o Supabase Storage.');
}
