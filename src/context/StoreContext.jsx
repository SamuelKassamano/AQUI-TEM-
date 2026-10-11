import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { PRODUCTS } from '../../data/products';
import { createSlug } from '../utils/slug';
import { getTranslatedProduct } from '../utils/productTranslations';
import {
  supabase,
  isSupabaseConfigured,
  requireAdminSession,
  normalizeProduct,
  toSupabaseProductPayload,
  getEffectivePrice,
  getPreviousPrice,
  formatPriceKz
} from '../lib/supabase';
import { useLanguage } from './LanguageContext';

const StoreContext = createContext();

const CART_STORAGE_KEY = 'aquitem_cart_v1';
const WISHLIST_STORAGE_KEY = 'aquitem_wishlist_v1';
const THEME_STORAGE_KEY = 'aquitem_theme_v1';

export function StoreProvider({ children }) {
  const { lang } = useLanguage();

  // Clear any legacy local product caches so localStorage is never used as product source
  useEffect(() => {
    try {
      localStorage.removeItem('aquitem_admin_products_v1');
      localStorage.removeItem('aquitem_admin_products_v2');
      localStorage.removeItem('aquitem_admin_products_v3');
      localStorage.removeItem('aquitem_admin_products_v4');
    } catch (e) {
      // ignore
    }
  }, []);

  // Products state (loaded from Supabase `public.products` on mount; local catalog only as initial render placeholder)
  const [products, setProducts] = useState(() =>
    PRODUCTS.map((p, idx) => normalizeProduct(p, idx))
  );

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // Cart state persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  // Wishlist (Favoritos) state persisted in localStorage
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  // Theme state
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {
      // ignore
    }
    return 'light';
  });

  // UI Drawers & Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [directCheckoutItem, setDirectCheckoutItem] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Sync theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Toast helper
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  // Save wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      // ignore
    }
  }, [wishlist]);

  // Fetch products directly from Supabase `public.products` table
  const refreshProducts = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setSupabaseConnected(false);
      return null;
    }

    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data)) {
        setSupabaseConnected(true);
        const normalized = data
          .map((row, idx) => normalizeProduct(row, idx))
          .filter(Boolean);

        if (normalized.length > 0) {
          setProducts(normalized);

          // Sync any cart items with the latest product data (including image_url, price, stock) from Supabase
          setCart(prevCart =>
            prevCart.map(item => {
              const liveMatch = normalized.find(
                p =>
                  String(p.id) === String(item.id) ||
                  (item.slug && p.slug === item.slug) ||
                  (item.name && p.name === item.name)
              );
              if (!liveMatch) return item;
              return {
                ...item,
                image_url: liveMatch.image_url,
                image: liveMatch.image,
                price: getEffectivePrice(liveMatch),
                stock: liveMatch.stock
              };
            })
          );
        }
        return normalized;
      } else {
        setSupabaseConnected(false);
        return null;
      }
    } catch (err) {
      setSupabaseConnected(false);
      return null;
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();

    const handleFocus = () => {
      refreshProducts();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshProducts]);

  // Public active products only (active = true)
  const activeProducts = useMemo(() => {
    return products.filter(p => p.active !== false);
  }, [products]);

  // Find product by slug (supports exact slug, createSlug(name), slugAliases, and prefix fallback like /produto/smart-tv-55)
  const findProductBySlug = useCallback(
    (slugParam) => {
      if (!slugParam) return null;
      const cleanSlug = decodeURIComponent(slugParam).toLowerCase().trim();

      // 1. Exact match on slug or createSlug(name) or slugAliases
      const exact = products.find(p => {
        const pSlug = (p.slug || createSlug(p.name)).toLowerCase();
        const nameSlug = createSlug(p.name).toLowerCase();
        const aliases = Array.isArray(p.slugAliases)
          ? p.slugAliases.map(a => a.toLowerCase())
          : [];
        return (
          pSlug === cleanSlug ||
          nameSlug === cleanSlug ||
          aliases.includes(cleanSlug)
        );
      });
      if (exact) return exact;

      // 2. Prefix match (e.g. /produto/smart-tv-55 matches smart-tv-55-crystal-uhd-4k-hdr-nova-geracao)
      const prefixMatch = products.find(p => {
        const pSlug = (p.slug || createSlug(p.name)).toLowerCase();
        const nameSlug = createSlug(p.name).toLowerCase();
        return pSlug.startsWith(cleanSlug) || nameSlug.startsWith(cleanSlug);
      });
      return prefixMatch || null;
    },
    [products]
  );

  // Cart actions
  const addToCart = useCallback(
    (product, quantity = 1) => {
      if (!product) return false;
      const normalized = normalizeProduct(product);

      if (Number(normalized.stock) <= 0) {
        showToast(
          lang === 'en'
            ? 'Product out of stock. Contact us on WhatsApp for restock/import.'
            : 'Produto esgotado no momento. Consulte reposição/importação no WhatsApp.'
        );
        return false;
      }

      const translatedProd = getTranslatedProduct(normalized, lang);
      const effectivePrice = getEffectivePrice(normalized);

      setCart(prevCart => {
        const existing = prevCart.find(item => String(item.id) === String(normalized.id));
        if (existing) {
          const nextQty = existing.quantity + quantity;
          return prevCart.map(item =>
            String(item.id) === String(normalized.id)
              ? { ...item, ...translatedProd, price: effectivePrice, quantity: nextQty }
              : item
          );
        }
        return [
          ...prevCart,
          {
            ...translatedProd,
            price: effectivePrice,
            quantity: Math.max(1, quantity)
          }
        ];
      });

      showToast(
        `"${translatedProd.name.slice(0, 26)}..." ${
          lang === 'en' ? 'added to cart!' : 'adicionado ao carrinho!'
        }`
      );
      return true;
    },
    [lang, showToast]
  );

  const updateQuantity = useCallback((id, delta) => {
    setCart(prevCart =>
      prevCart
        .map(item => {
          if (String(item.id) === String(id)) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prevCart => prevCart.filter(item => String(item.id) !== String(id)));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Wishlist actions
  const toggleWishlist = useCallback(
    (productOrId) => {
      const targetId = typeof productOrId === 'object' ? productOrId?.id : productOrId;
      if (targetId === undefined || targetId === null) return;

      setWishlist(prev => {
        const exists = prev.some(id => String(id) === String(targetId));
        if (exists) {
          showToast(lang === 'en' ? 'Removed from favorites' : 'Removido dos favoritos');
          return prev.filter(id => String(id) !== String(targetId));
        } else {
          showToast(lang === 'en' ? 'Added to favorites ❤️' : 'Adicionado aos favoritos ❤️');
          return [...prev, targetId];
        }
      });
    },
    [lang, showToast]
  );

  const isInWishlist = useCallback(
    (productId) => {
      return wishlist.some(id => String(id) === String(productId));
    },
    [wishlist]
  );

  const wishlistProducts = useMemo(() => {
    return products.filter(p => wishlist.some(id => String(id) === String(p.id)));
  }, [products, wishlist]);

  // Coupon handler
  const handleApplyCoupon = useCallback(
    (e) => {
      if (e && e.preventDefault) e.preventDefault();
      if (coupon.trim().toUpperCase() === 'AQUITEM10') {
        setAppliedDiscount(0.1);
        showToast(
          lang === 'en'
            ? 'Coupon AQUITEM10 applied! 10% discount.'
            : 'Cupom AQUITEM10 aplicado! 10% de desconto.'
        );
      } else {
        showToast(
          lang === 'en'
            ? 'Invalid coupon. Try AQUITEM10'
            : 'Cupom inválido. Tente AQUITEM10'
        );
      }
    },
    [coupon, lang, showToast]
  );

  // Cart totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const itemPrice = getEffectivePrice(item);
      return sum + itemPrice * (Number(item.quantity) || 1);
    }, 0);
  }, [cart]);

  const discountAmount = subtotal * appliedDiscount;
  const shippingFee = subtotal > 150000 || subtotal === 0 ? 0 : 3000;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Admin CRUD Operations (Strictly persisted in Supabase `public.products` and reloaded from Supabase)
  const createProduct = useCallback(
    async (productData) => {
      await requireAdminSession();
      const payload = toSupabaseProductPayload(productData);

      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select('*');

      if (error) {
        throw error;
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(
          'O produto não foi gravado na tabela public.products do Supabase (0 linhas inseridas). Verifique se a política RLS de INSERT para utilizadores autenticados está ativa na tabela public.products.'
        );
      }

      const insertedRow = data[0];
      const reloaded = await refreshProducts();
      const confirmed =
        (Array.isArray(reloaded)
          ? reloaded.find(p => String(p.id) === String(insertedRow.id))
          : null) || normalizeProduct(insertedRow, products.length);

      return confirmed;
    },
    [products.length, refreshProducts]
  );

  const updateProduct = useCallback(
    async (id, updates) => {
      await requireAdminSession();
      const existing = products.find(
        p => String(p.id) === String(id) || String(p.supabaseId) === String(id)
      );

      const merged = {
        ...(existing || {}),
        ...updates
      };
      if ('sale_price' in updates) merged.salePrice = updates.sale_price;
      if ('old_price' in updates) merged.oldPrice = updates.old_price;
      if ('reviews_count' in updates) merged.reviewsCount = updates.reviews_count;
      if ('image_url' in updates) merged.image = updates.image_url;

      const payload = toSupabaseProductPayload(merged);

      let targetId =
        typeof id === 'string' && id.length > 10 && !id.startsWith('local-')
          ? id
          : existing?.supabaseId || null;

      if (!targetId && existing?.slug) {
        const { data: matchRows, error: findErr } = await supabase
          .from('products')
          .select('id')
          .eq('slug', existing.slug)
          .limit(1);
        if (findErr) throw findErr;
        if (Array.isArray(matchRows) && matchRows[0]?.id) {
          targetId = matchRows[0].id;
        }
      }

      if (!targetId) {
        throw new Error('ID do produto inválido para atualização no Supabase.');
      }

      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', targetId)
        .select('*');

      if (error) {
        throw error;
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(
          'A alteração não foi persistida na tabela public.products do Supabase (0 linhas atualizadas). Verifique se a política RLS de UPDATE para utilizadores autenticados está ativa na tabela public.products.'
        );
      }

      const updatedRow = data[0];
      const reloaded = await refreshProducts();
      const confirmed =
        (Array.isArray(reloaded)
          ? reloaded.find(p => String(p.id) === String(updatedRow.id))
          : null) || normalizeProduct(updatedRow);

      return confirmed;
    },
    [products, refreshProducts]
  );

  const deleteProduct = useCallback(
    async (id) => {
      await requireAdminSession();
      const existing = products.find(
        p => String(p.id) === String(id) || String(p.supabaseId) === String(id)
      );
      const targetId =
        typeof id === 'string' && id.length > 10 && !id.startsWith('local-')
          ? id
          : existing?.supabaseId || id;

      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', targetId)
        .select('id');

      if (error) {
        throw error;
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(
          'O produto não foi excluído na tabela public.products do Supabase (0 linhas afetadas). Verifique se a política RLS de DELETE para utilizadores autenticados está ativa.'
        );
      }

      await refreshProducts();
    },
    [products, refreshProducts]
  );

  const duplicateProduct = useCallback(
    async (product) => {
      await requireAdminSession();
      const baseName = `${product.name} (Cópia)`;
      const newSlug = `${product.slug || createSlug(product.name)}-copia-${Date.now().toString().slice(-4)}`;
      const newSku = `${product.sku || 'AT'}-COPY-${Date.now().toString().slice(-3)}`;

      return createProduct({
        ...product,
        id: undefined,
        name: baseName,
        slug: newSlug,
        sku: newSku,
        active: false
      });
    },
    [createProduct]
  );

  const toggleProductActive = useCallback(
    async (product) => {
      await requireAdminSession();
      return updateProduct(product.id, { active: !product.active });
    },
    [updateProduct]
  );

  const syncCatalogToSupabase = useCallback(async () => {
    await requireAdminSession();

    const { data: existingRows, error: fetchErr } = await supabase
      .from('products')
      .select('*');

    if (fetchErr) throw fetchErr;

    const existingList = Array.isArray(existingRows) ? existingRows : [];
    const results = [];

    // Sync current products without overwriting existing database stock/prices with static defaults
    for (const p of products) {
      const payload = toSupabaseProductPayload(p);
      const pAliases = Array.isArray(p.slugAliases) ? p.slugAliases : [];
      const match = existingList.find(
        row =>
          String(row.id) === String(p.id) ||
          (row.slug && (row.slug === payload.slug || pAliases.includes(row.slug))) ||
          (row.name && createSlug(row.name) === payload.slug)
      );

      if (match && match.id) {
        const { data: updated, error: updErr } = await supabase
          .from('products')
          .update(payload)
          .eq('id', match.id)
          .select('*');
        if (updErr) throw updErr;
        if (Array.isArray(updated) && updated[0]) results.push(updated[0]);
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from('products')
          .insert([payload])
          .select('*');
        if (insErr) throw insErr;
        if (Array.isArray(inserted) && inserted[0]) results.push(inserted[0]);
      }
    }

    await refreshProducts();
    return results;
  }, [products, refreshProducts]);

  return (
    <StoreContext.Provider
      value={{
        products,
        activeProducts,
        loadingProducts,
        supabaseConnected,
        refreshProducts,
        findProductBySlug,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        directCheckoutItem,
        setDirectCheckoutItem,
        wishlist,
        wishlistProducts,
        toggleWishlist,
        isInWishlist,
        coupon,
        setCoupon,
        appliedDiscount,
        handleApplyCoupon,
        subtotal,
        discountAmount,
        shippingFee,
        finalTotal,
        theme,
        toggleTheme,
        toastMessage,
        showToast,
        createProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        toggleProductActive,
        syncCatalogToSupabase,
        getEffectivePrice,
        getPreviousPrice,
        formatPriceKz
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore deve ser usado dentro de um StoreProvider');
  }
  return context;
}
