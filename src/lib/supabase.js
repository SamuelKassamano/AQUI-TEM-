import { createClient } from '@supabase/supabase-js';
import { createSlug } from '../utils/slug';
import { PRODUCTS, PRODUCT_FALLBACK_IMAGES } from '../../data/products';
import { getOfficialPricing } from '../data/productPricing.js';

export const SUPABASE_PROJECT_ID = 'essjwjbtzytefycjodgh';

/**
 * Normaliza e limpa valores de variáveis de ambiente.
 * Suporta remoção de aspas, espaços e prefixos acidentais caso o utilizador
 * tenha colado a linha inteira "KEY=VALOR" no campo de valor da Vercel.
 */
function cleanEnvValue(val) {
  if (!val || typeof val !== 'string') return '';
  let cleaned = val.trim();
  // Se o utilizador colou "KEY=VALOR", extrai apenas o valor após o '='
  if (cleaned.includes('=')) {
    const parts = cleaned.split('=');
    cleaned = parts.slice(1).join('=').trim();
  }
  // Remove aspas simples ou duplas ao redor do valor
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

const rawEnvUrl =
  cleanEnvValue(import.meta.env.VITE_SUPABASE_URL) ||
  cleanEnvValue(import.meta.env.SUPABASE_URL) ||
  cleanEnvValue(import.meta.env.VITE_SUPABASE_PROJECT_URL) ||
  '';

export const SUPABASE_URL =
  rawEnvUrl || `https://${SUPABASE_PROJECT_ID}.supabase.co`;

const rawEnvKey =
  cleanEnvValue(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  cleanEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  cleanEnvValue(import.meta.env.SUPABASE_PUBLISHABLE_KEY) ||
  cleanEnvValue(import.meta.env.SUPABASE_ANON_KEY) ||
  '';

// Segurança rigorosa: NUNCA permitir service_role ou secret key no frontend
const isForbiddenSecretKey =
  rawEnvKey.startsWith('sb_secret_') ||
  rawEnvKey.includes('service_role');

if (isForbiddenSecretKey) {
  console.error(
    'AVISO DE SEGURANÇA: Chave privada do Supabase (service_role ou secret key) detetada no frontend! O uso desta chave foi bloqueado. Utilize apenas a VITE_SUPABASE_PUBLISHABLE_KEY ou VITE_SUPABASE_ANON_KEY.'
  );
}

export const SUPABASE_PUBLISHABLE_KEY = isForbiddenSecretKey ? '' : rawEnvKey;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_PUBLISHABLE_KEY &&
    SUPABASE_PUBLISHABLE_KEY.length > 10
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
  // If official catalog pricing applies, always enforce the verified formula (Cost + 25% + 4000 Kz)
  const official = getOfficialPricing(product);
  if (official && Number(official.calculatedSalePrice) > 0) {
    return Number(official.calculatedSalePrice);
  }

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
  const official = getOfficialPricing(product);

  if (official && Number(official.regularPrice) > effective && effective > 0) {
    return Number(official.regularPrice);
  }

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
    if (
      !rawImageUrl.startsWith('http://') &&
      !rawImageUrl.startsWith('https://') &&
      !rawImageUrl.startsWith('/') &&
      !rawImageUrl.startsWith('data:')
    ) {
      const cleanObjectPath = rawImageUrl.replace(/^products\//, '');
      if (supabase) {
        const { data } = supabase.storage
          .from('products')
          .getPublicUrl(cleanObjectPath);
        if (data?.publicUrl) return data.publicUrl;
      }
      return `${SUPABASE_URL}/storage/v1/object/public/products/${cleanObjectPath}`;
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

const SEO_STORAGE_KEY = 'aquitem_products_seo_v1';

export function getLocalSeoMetadata(productIdOrSlug) {
  if (typeof window === 'undefined' || !productIdOrSlug) return null;
  try {
    const raw = localStorage.getItem(SEO_STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[String(productIdOrSlug).trim()] || null;
  } catch {
    return null;
  }
}

export function saveLocalSeoMetadata(productIdOrSlug, seoTitle, seoDescription) {
  if (typeof window === 'undefined' || !productIdOrSlug) return;
  try {
    const raw = localStorage.getItem(SEO_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const key = String(productIdOrSlug).trim();
    map[key] = {
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(SEO_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/**
 * Normalizes a product record from Supabase (`products` table) or local catalog
 * so both schemas work seamlessly across the entire app.
 */
export function normalizeProduct(raw, index = 0) {
  if (!raw) return null;

  const baseMatch = findBaseCatalogMatch(raw);
  const official = getOfficialPricing(raw) || (baseMatch ? getOfficialPricing(baseMatch) : null);
  const isSupabaseRow = Boolean(
    raw.id && typeof raw.id === 'string' && raw.id.length > 10
  );

  const name = String(raw.name ?? official?.name ?? baseMatch?.name ?? 'Produto AQUI TEM').trim();
  const slug = String(raw.slug || official?.slug || baseMatch?.slug || createSlug(name)).trim();
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

  const resolvedPrice = official?.regularPrice
    ? official.regularPrice
    : Number.isFinite(price) && price > 0
    ? price
    : (baseMatch?.price || 10000);

  const resolvedSalePrice = official?.calculatedSalePrice
    ? official.calculatedSalePrice
    : sale_price;

  const resolvedOldPrice = official?.regularPrice
    ? official.regularPrice
    : old_price;

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
    raw.category || official?.category || baseMatch?.category || 'Acessórios & Tech'
  ).trim();
  const brand =
    raw.brand !== undefined && raw.brand !== null && String(raw.brand).trim() !== ''
      ? String(raw.brand).trim()
      : (official?.brand || inferBrand(baseMatch || raw));
  const sku =
    raw.sku !== undefined && raw.sku !== null && String(raw.sku).trim() !== ''
      ? String(raw.sku).trim()
      : String(official?.sku || baseMatch?.sku || `AT-${String(index + 1).padStart(3, '0')}`).trim();
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
      ...(slug ? [slug] : []),
      ...(official?.slug ? [official.slug] : [])
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
    price: resolvedPrice,
    sale_price: resolvedSalePrice,
    salePrice: resolvedSalePrice,
    old_price: resolvedOldPrice,
    oldPrice: resolvedOldPrice,
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
    specs,
    seo_title:
      raw.seo_title ||
      official?.seoTitle ||
      getLocalSeoMetadata(raw.id)?.seo_title ||
      getLocalSeoMetadata(slug)?.seo_title ||
      null,
    seo_description:
      raw.seo_description ||
      official?.seoDescription ||
      getLocalSeoMetadata(raw.id)?.seo_description ||
      getLocalSeoMetadata(slug)?.seo_description ||
      null
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
 * - seo_title (text)
 * - seo_description (text)
 */
export function toSupabaseProductPayload(product) {
  const baseMatch = findBaseCatalogMatch(product);
  const official = getOfficialPricing(product) || (baseMatch ? getOfficialPricing(baseMatch) : null);

  const name = String(product.name ?? official?.name ?? baseMatch?.name ?? '').trim();
  const slug = String(product.slug || official?.slug || baseMatch?.slug || createSlug(name)).trim();
  const description = String(product.description ?? '').trim();

  const priceNum = Number(product.price);
  const price = official?.regularPrice
    ? official.regularPrice
    : Number.isFinite(priceNum) && priceNum > 0
    ? priceNum
    : (baseMatch?.price || 1000);

  const rawSalePrice = 'sale_price' in product ? product.sale_price : product.salePrice;
  const salePriceNum =
    rawSalePrice !== null && rawSalePrice !== undefined && rawSalePrice !== ''
      ? Number(rawSalePrice)
      : null;
  const sale_price = official?.calculatedSalePrice
    ? official.calculatedSalePrice
    : salePriceNum !== null && Number.isFinite(salePriceNum) && salePriceNum > 0
    ? salePriceNum
    : null;

  const rawOldPrice = 'old_price' in product ? product.old_price : product.oldPrice;
  const oldPriceNum =
    rawOldPrice !== null && rawOldPrice !== undefined && rawOldPrice !== ''
      ? Number(rawOldPrice)
      : null;
  const old_price = official?.regularPrice
    ? official.regularPrice
    : oldPriceNum !== null && Number.isFinite(oldPriceNum) && oldPriceNum > 0
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

  const seo_title =
    typeof product.seo_title === 'string' && product.seo_title.trim() !== ''
      ? product.seo_title.trim()
      : null;

  const seo_description =
    typeof product.seo_description === 'string' && product.seo_description.trim() !== ''
      ? product.seo_description.trim()
      : null;

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
    specs,
    seo_title,
    seo_description
  };
}

/**
 * Converts a selected image file to an optimized, resized base64 data URL
 * so products can always display crisp images even if Storage RLS is strict.
 */
export function readFileAsOptimizedDataUrl(file, maxWidth = 1200, maxHeight = 1200) {
  return new Promise((resolve) => {
    if (!file || typeof window === 'undefined' || !window.FileReader) {
      resolve('/logo.jpg');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => resolve('/logo.jpg');
    reader.onload = () => {
      const resultStr = typeof reader.result === 'string' ? reader.result : '';
      if (!resultStr || typeof Image === 'undefined') {
        resolve(resultStr || '/logo.jpg');
        return;
      }
      const img = new Image();
      img.onerror = () => resolve(resultStr);
      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width || maxWidth;
          let height = img.naturalHeight || img.height || maxHeight;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(resultStr);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const isPng = file.type === 'image/png';
          const mime = isPng ? 'image/png' : 'image/jpeg';
          const quality = isPng ? undefined : 0.86;
          resolve(canvas.toDataURL(mime, quality));
        } catch {
          resolve(resultStr);
        }
      };
      img.src = resultStr;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file strictly to Supabase Storage bucket `products`
 * using `supabase.storage.from('products')`.
 * If Storage upload succeeds, returns the Storage public URL.
 * If Storage RLS or network prevents direct upload, seamlessly falls back to
 * an optimized image data URL so the product is never blocked.
 */
export async function uploadProductImageToSupabase(file, slugPrefix = 'produto') {
  if (!file) throw new Error('Nenhum arquivo de imagem fornecido.');

  await requireAdminSession();

  const rawExt = file.name ? file.name.split('.').pop() : '';
  const ext = (rawExt || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const safeSlug = createSlug(slugPrefix || 'produto') || 'produto';
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const filePath = `${safeSlug}-${uniqueSuffix}.${ext}`;
  const contentType =
    file.type ||
    (ext === 'png'
      ? 'image/png'
      : ext === 'webp'
      ? 'image/webp'
      : 'image/jpeg');

  // Attempt upload to Supabase Storage bucket `products`
  let storageErrorMessage = null;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType
        });

      if (!uploadError) {
        const finalPath = uploadData?.path || filePath;
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(finalPath);

        if (publicUrlData?.publicUrl) {
          return {
            url: publicUrlData.publicUrl,
            source: 'storage',
            path: finalPath
          };
        }
      } else {
        storageErrorMessage = uploadError.message || String(uploadError);
        console.warn('Upload ao bucket products retornou aviso:', storageErrorMessage);
      }
    } catch (storageErr) {
      storageErrorMessage = storageErr?.message || String(storageErr);
      console.warn('Falha no upload do Supabase Storage:', storageErrorMessage);
    }
  }

  // Graceful fallback to optimized data URL so adding/editing products never fails
  const fallbackDataUrl = await readFileAsOptimizedDataUrl(file);
  return {
    url: fallbackDataUrl,
    source: 'data_url',
    storageError: storageErrorMessage
  };
}


