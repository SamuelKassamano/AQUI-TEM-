import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Edit3,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  DollarSign,
  Boxes,
  Upload,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  LogOut,
  Lock,
  RefreshCw,
  Database,
  ExternalLink,
  X,
  Save
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  supabase,
  isSupabaseConfigured,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  uploadProductImageToSupabase
} from '../lib/supabase';
import { CATEGORIES } from '../../data/products';
import { createSlug } from '../utils/slug';
import OriginalLogoImage from '../components/OriginalLogoImage';

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  price: '',
  old_price: '',
  sale_price: '',
  category: 'Acessórios & Tech',
  brand: 'Oraimo',
  sku: '',
  stock: 15,
  image_url: '',
  badge: 'NOVIDADE',
  rating: 4.9,
  reviews_count: 25,
  specsText: '',
  active: true
};

export default function AdminPage() {
  const {
    products,
    loadingProducts,
    supabaseConnected,
    refreshProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    toggleProductActive,
    syncCatalogToSupabase,
    getEffectivePrice,
     getPreviousPrice,
    formatPriceKz,
    showToast,
    toastMessage
  } = useStore();

  // Auth State (Strictly backed by Supabase Auth)
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Admin UI Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Quick Price Modal
  const [priceModalProduct, setPriceModalProduct] = useState(null);
  const [priceForm, setPriceForm] = useState({ price: '', sale_price: '', old_price: '' });

  // Quick Stock Modal
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [stockValue, setStockValue] = useState(0);

  // Delete Confirmation Modal
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const [persistenceError, setPersistenceError] = useState('');

  useEffect(() => {
    document.title = 'Painel Administrativo | AQUI TEM Angola';
  }, []);

  // Check Supabase Auth Session via supabase.auth.getSession()
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured || !supabase) {
      setSession(null);
      setAuthChecking(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error || !data?.session?.user || !data?.session?.access_token) {
          setSession(null);
        } else {
          setSession(data.session);
        }
        setAuthChecking(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setSession(null);
        setAuthChecking(false);
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      if (nextSession?.user && nextSession?.access_token) {
        setSession(nextSession);
      } else {
        setSession(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setSession(null);
      setAuthError('Preencha o e-mail e a palavra-passe do administrador.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setSession(null);
      setAuthError(
        'Autenticação indisponível: A chave pública VITE_SUPABASE_PUBLISHABLE_KEY não está configurada. O acesso ao painel administrativo está bloqueado.'
      );
      return;
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password
      });

      if (error || !data?.session?.user || !data?.session?.access_token) {
        setSession(null);
        const rawMsg = error?.message || '';
        const isInvalidCredentials =
          rawMsg.toLowerCase().includes('invalid login credentials') ||
          error?.status === 400;

        setAuthError(
          isInvalidCredentials
            ? 'Credenciais inválidas: E-mail ou palavra-passe incorretos no Supabase Authentication. Acesso bloqueado.'
            : rawMsg || 'Credenciais inválidas no Supabase Authentication. Acesso bloqueado.'
        );
        return;
      }

      setSession(data.session);
      setPassword('');
      showToast('Sessão administrativa iniciada com sucesso!');
      refreshProducts();
    } catch (err) {
      setSession(null);
      setAuthError(
        err?.message || 'Erro ao autenticar com o Supabase Authentication. Acesso bloqueado.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } finally {
      setSession(null);
      setPassword('');
      setAuthError('');
      setAuthLoading(false);
      showToast('Sessão encerrada.');
    }
  };

  const isAuthenticated = Boolean(
    isSupabaseConfigured &&
      supabase &&
      session &&
      session.user &&
      session.access_token
  );

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === 'Todos' || p.category === categoryFilter;

      const isOut = Number(p.stock) <= 0;
      const hasPromo = Number(p.sale_price) > 0;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p.active !== false) ||
        (statusFilter === 'inactive' && p.active === false) ||
        (statusFilter === 'out_of_stock' && isOut) ||
        (statusFilter === 'promo' && hasPromo);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = products.length;
    const activeCount = products.filter(p => p.active !== false).length;
    const inactiveCount = products.filter(p => p.active === false).length;
    const outOfStockCount = products.filter(p => Number(p.stock) <= 0).length;
    return { total, activeCount, inactiveCount, outOfStockCount };
  }, [products]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setSlugManuallyEdited(false);
    setFormData({
      ...EMPTY_FORM,
      sku: `AT-${String(products.length + 1).padStart(3, '0')}`
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setSlugManuallyEdited(true);
    setFormData({
      name: product.name ?? '',
      slug: product.slug || createSlug(product.name || ''),
      description: product.description ?? '',
      price: product.price ?? '',
      old_price:
        product.old_price !== null && product.old_price !== undefined
          ? product.old_price
          : '',
      sale_price:
        product.sale_price !== null && product.sale_price !== undefined
          ? product.sale_price
          : '',
      category: product.category || 'Acessórios & Tech',
      brand: product.brand ?? 'Oraimo',
      sku: product.sku ?? '',
      stock:
        product.stock !== null && product.stock !== undefined
          ? Number(product.stock)
          : 0,
      image_url: product.raw_image_url || product.image_url || product.image || '',
      badge: product.badge ?? '',
      rating:
        product.rating !== null && product.rating !== undefined
          ? product.rating
          : 4.9,
      reviews_count:
        product.reviews_count !== null && product.reviews_count !== undefined
          ? product.reviews_count
          : 0,
      specsText: Array.isArray(product.specs) ? product.specs.join('\n') : '',
      active: product.active !== false
    });
    setIsProductModalOpen(true);
  };

  // Image file upload to Supabase Storage `product-images`
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAuthenticated || !isSupabaseConfigured || !supabase) {
      showToast('Sessão administrativa necessária para enviar imagens.');
      return;
    }

    setUploadingImage(true);
    try {
      const publicUrl = await uploadProductImageToSupabase(
        file,
        formData.slug || formData.name || 'produto'
      );
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      showToast('Imagem enviada para o Supabase Storage!');
    } catch (err) {
      showToast(`Erro no upload: ${err.message || 'Verifique permissões de Storage no Supabase.'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Product (Create via INSERT or Update via UPDATE by id in public.products)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setPersistenceError('');
    if (!formData.name.trim()) {
      showToast('Informe o nome do produto.');
      return;
    }
    const numericPrice = Number(formData.price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      showToast('O preço deve ser um número maior que 0 Kz.');
      return;
    }

    const parsedStock = parseInt(formData.stock, 10);
    const parsedReviews = parseInt(formData.reviews_count, 10);
    const parsedRating = Number(formData.rating);

    setSavingProduct(true);
    try {
      const payload = {
        name: formData.name.trim(),
        slug: (formData.slug || createSlug(formData.name)).trim(),
        description: formData.description.trim(),
        price: numericPrice,
        old_price:
          formData.old_price !== '' &&
          formData.old_price !== null &&
          Number(formData.old_price) > 0
            ? Number(formData.old_price)
            : null,
        sale_price:
          formData.sale_price !== '' &&
          formData.sale_price !== null &&
          Number(formData.sale_price) > 0
            ? Number(formData.sale_price)
            : null,
        category: formData.category,
        brand: formData.brand.trim() || 'Oraimo',
        sku: formData.sku.trim() || null,
        stock: Number.isFinite(parsedStock) && parsedStock >= 0 ? parsedStock : 0,
        image_url:
          formData.image_url.trim() ||
          editingProduct?.raw_image_url ||
          editingProduct?.image_url ||
          '/logo.jpg',
        badge: formData.badge.trim() || null,
        rating:
          Number.isFinite(parsedRating) && parsedRating > 0
            ? Math.min(5, Math.max(1, parsedRating))
            : 4.9,
        reviews_count:
          Number.isFinite(parsedReviews) && parsedReviews >= 0 ? parsedReviews : 0,
        specs: formData.specsText
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean),
        active: Boolean(formData.active)
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        await refreshProducts();
        showToast(`Produto "${payload.name}" gravado no Supabase com sucesso!`);
      } else {
        await createProduct(payload);
        await refreshProducts();
        showToast(`Produto "${payload.name}" inserido no Supabase com sucesso!`);
      }
      setIsProductModalOpen(false);
    } catch (err) {
      const msg = err?.message || 'Erro ao gravar na tabela public.products do Supabase.';
      setPersistenceError(msg);
      showToast(`Erro ao salvar no Supabase: ${msg}`);
    } finally {
      setSavingProduct(false);
    }
  };

  // Quick Price Update
  const handleOpenPriceModal = (product) => {
    setPriceModalProduct(product);
    setPriceForm({
      price: product.price ?? '',
      sale_price:
        product.sale_price !== null && product.sale_price !== undefined
          ? product.sale_price
          : '',
      old_price:
        product.old_price !== null && product.old_price !== undefined
          ? product.old_price
          : ''
    });
  };

  const handleSaveQuickPrice = async (e) => {
    e.preventDefault();
    if (!priceModalProduct) return;
    setPersistenceError('');
    const priceNum = Number(priceForm.price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      showToast('Informe um preço base válido maior que 0 Kz.');
      return;
    }
    try {
      await updateProduct(priceModalProduct.id, {
        price: priceNum,
        sale_price:
          priceForm.sale_price !== '' &&
          priceForm.sale_price !== null &&
          Number(priceForm.sale_price) > 0
            ? Number(priceForm.sale_price)
            : null,
        old_price:
          priceForm.old_price !== '' &&
          priceForm.old_price !== null &&
          Number(priceForm.old_price) > 0
            ? Number(priceForm.old_price)
            : null
      });
      await refreshProducts();
      showToast('Preços gravados no Supabase com sucesso!');
      setPriceModalProduct(null);
    } catch (err) {
      const msg = err?.message || 'Erro ao atualizar preço no Supabase.';
      setPersistenceError(msg);
      showToast(`Erro ao atualizar preço: ${msg}`);
    }
  };

  // Quick Stock Update
  const handleOpenStockModal = (product) => {
    setStockModalProduct(product);
    setStockValue(Number(product.stock ?? 0));
  };

  const handleSaveQuickStock = async (e) => {
    e.preventDefault();
    if (!stockModalProduct) return;
    setPersistenceError('');
    try {
      const parsed = parseInt(stockValue, 10);
      const nextStock = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
      await updateProduct(stockModalProduct.id, { stock: nextStock });
      await refreshProducts();
      showToast(`Estoque gravado no Supabase (${nextStock} unidades)!`);
      setStockModalProduct(null);
    } catch (err) {
      const msg = err?.message || 'Erro ao atualizar estoque no Supabase.';
      setPersistenceError(msg);
      showToast(`Erro ao atualizar estoque: ${msg}`);
    }
  };

  // Sync initial products to Supabase
  const handleSyncToSupabase = async () => {
    setSyncingSupabase(true);
    try {
      await syncCatalogToSupabase();
      showToast('Catálogo sincronizado com a tabela products no Supabase!');
    } catch (err) {
      showToast(`Aviso: ${err.message}`);
    } finally {
      setSyncingSupabase(false);
    }
  };

  if (authChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Verificando sessão administrativa...
        </div>
      </div>
    );
  }

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-body)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <OriginalLogoImage src="/logo.jpg" alt="AQUI TEM" height={38} />
            <Link to="/" className="nav-btn" style={{ textDecoration: 'none', fontSize: '0.82rem' }}>
              <ArrowLeft size={15} /> Voltar à Loja
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '6px' }}>
            <Lock size={15} /> Acesso Restrito
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '6px', color: 'var(--text-main)' }}>
            Painel Administrativo AQUI TEM
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
            Autentique-se com a sua conta de administrador do Supabase (Projeto: <code>{SUPABASE_PROJECT_ID}</code>) para gerir produtos, preços e estoque.
          </p>

          {!isSupabaseConfigured && (
            <div
              style={{
                background: 'rgba(243, 112, 33, 0.08)',
                border: '1px solid rgba(243, 112, 33, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '0.8rem',
                color: 'var(--text-main)',
                marginBottom: '16px',
                lineHeight: 1.5
              }}
            >
              <strong>Nota de Ambiente:</strong> Defina <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> nas variáveis de ambiente (Vercel / <code>.env</code>) para conectar ao Supabase em produção (<code>{SUPABASE_URL}</code>).
            </div>
          )}

          {authError && (
            <div
              style={{
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                color: '#DC2626',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '16px'
              }}
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">E-mail do Administrador *</label>
              <input
                type="email"
                required
                placeholder="admin@aquitem.ao"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Palavra-passe *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="nav-btn nav-btn-orange"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '12px', fontSize: '0.95rem' }}
            >
              <Lock size={17} /> {authLoading ? 'Autenticando...' : 'Entrar no Painel Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)', color: 'var(--text-main)', paddingBottom: '60px' }}>
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #F37021, #D95D12)',
            color: '#FFF',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(243, 112, 33, 0.4)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 700
          }}
        >
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <header
        style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-light)',
          padding: '14px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <OriginalLogoImage src="/logo.jpg" alt="AQUI TEM" height={36} />
            </Link>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                Painel Administrativo — AQUI TEM
              </h1>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database size={12} />
                <span>
                  Supabase ({SUPABASE_PROJECT_ID}):{' '}
                  <strong style={{ color: supabaseConnected ? '#16A34A' : '#D97706' }}>
                    {supabaseConnected ? 'Conectado (products)' : 'Reconectando...'}
                  </strong>
                  {session?.user?.email && (
                    <span> • Sessão: <strong>{session.user.email}</strong></span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="nav-btn"
              onClick={refreshProducts}
              disabled={loadingProducts}
              title="Recarregar produtos do Supabase"
            >
              <RefreshCw size={15} /> Atualizar
            </button>

            {isSupabaseConfigured && (
              <button
                className="nav-btn"
                onClick={handleSyncToSupabase}
                disabled={syncingSupabase}
                title="Sincronizar catálogo inicial com a tabela products do Supabase"
              >
                <Database size={15} /> {syncingSupabase ? 'Sincronizando...' : 'Sincronizar Base'}
              </button>
            )}

            <button className="nav-btn nav-btn-orange" onClick={handleOpenAdd}>
              <Plus size={16} /> Novo Produto
            </button>

            <Link to="/" className="nav-btn" style={{ textDecoration: 'none' }}>
              <ArrowLeft size={15} /> Ver Loja Pública
            </Link>

            <button className="nav-btn" onClick={handleLogout} style={{ color: '#DC2626' }}>
              <LogOut size={15} /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1320px', margin: '24px auto', padding: '0 20px' }}>
        {persistenceError && (
          <div
            style={{
              background: 'rgba(220, 38, 38, 0.08)',
              border: '1px solid rgba(220, 38, 38, 0.35)',
              color: '#DC2626',
              padding: '14px 18px',
              borderRadius: '14px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '0.86rem', lineHeight: 1.5 }}>
              <strong>Erro de Persistência no Supabase (public.products):</strong> {persistenceError}
            </div>
            <button
              onClick={() => setPersistenceError('')}
              style={{ background: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 800 }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* KPI Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}
        >
          <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total de Produtos</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
              {stats.total}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Ativos no Catálogo</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '4px', color: '#16A34A', fontVariantNumeric: 'tabular-nums' }}>
              {stats.activeCount}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Inativos / Ocultos</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '4px', color: '#64748B', fontVariantNumeric: 'tabular-nums' }}>
              {stats.inactiveCount}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Produtos Esgotados (stock = 0)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '4px', color: stats.outOfStockCount > 0 ? '#DC2626' : '#16A34A', fontVariantNumeric: 'tabular-nums' }}>
              {stats.outOfStockCount}
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '16px',
            borderRadius: '14px',
            border: '1px solid var(--border-light)',
            marginBottom: '20px',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <div style={{ flex: '1 1 280px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Pesquisar por nome, SKU, marca ou descrição..."
              className="form-input"
              style={{ paddingLeft: '36px', width: '100%' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-input"
            style={{ width: 'auto', minWidth: '180px' }}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                Categoria: {c}
              </option>
            ))}
          </select>

          <select
            className="form-input"
            style={{ width: 'auto', minWidth: '180px' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os Estados</option>
            <option value="active">Somente Ativos (active = true)</option>
            <option value="inactive">Somente Inativos (active = false)</option>
            <option value="out_of_stock">Esgotados (stock = 0)</option>
            <option value="promo">Com Preço Promocional</option>
          </select>
        </div>

        {/* Products Table */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-light)',
            overflowX: 'auto'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 16px' }}>Produto</th>
                <th style={{ padding: '14px 12px' }}>Categoria / Marca</th>
                <th style={{ padding: '14px 12px' }}>SKU</th>
                <th style={{ padding: '14px 12px' }}>Preços (Kz)</th>
                <th style={{ padding: '14px 12px' }}>Estoque</th>
                <th style={{ padding: '14px 12px' }}>Estado</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const effectivePrice = getEffectivePrice(product);
                const prevPrice = getPreviousPrice(product);
                const isOutOfStock = Number(product.stock) <= 0;
                const slug = product.slug || createSlug(product.name);

                return (
                  <tr
                    key={product.id}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      opacity: product.active === false ? 0.65 : 1
                    }}
                  >
                    <td style={{ padding: '12px 16px', minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          key={product.image_url || product.image}
                          src={product.image_url || product.image}
                          alt={product.name}
                          style={{
                            width: '52px',
                            height: '52px',
                            objectFit: 'contain',
                            background: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                            padding: '2px',
                            flexShrink: 0
                          }}
                          onError={e => {
                            if (product.fallbackImage && e.currentTarget.src !== product.fallbackImage) {
                              e.currentTarget.src = product.fallbackImage;
                            } else if (product.svgFallbackImage) {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = product.svgFallbackImage;
                            } else {
                              e.currentTarget.onerror = null;
                            }
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.25 }}>
                            {product.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>/produto/{slug}</span>
                            <Link to={`/produto/${slug}`} target="_blank" style={{ color: 'var(--primary-orange)' }} title="Abrir página do produto">
                              <ExternalLink size={12} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700 }}>{product.category}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {product.brand || 'Oraimo'} {product.badge ? `• ${product.badge}` : ''}
                      </div>
                    </td>

                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {product.sku || `AT-${product.id}`}
                    </td>

                    <td style={{ padding: '12px', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary-orange)', fontSize: '0.95rem' }}>
                        {formatPriceKz(effectivePrice)}
                      </div>
                      {prevPrice && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          Antes: {formatPriceKz(prevPrice)}
                        </div>
                      )}
                      {Number(product.sale_price) > 0 && (
                        <div style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700 }}>
                          Promo ativa (Base: {formatPriceKz(product.price)})
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '12px', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            color: isOutOfStock ? '#DC2626' : '#16A34A'
                          }}
                        >
                          {isOutOfStock ? '0 (Esgotado)' : `${product.stock} un.`}
                        </span>
                        <button
                          className="nav-btn nav-btn-icon"
                          style={{ width: '26px', height: '26px', padding: 0 }}
                          onClick={() => handleOpenStockModal(product)}
                          title="Alterar Estoque"
                        >
                          <Boxes size={13} />
                        </button>
                      </div>
                    </td>

                    <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          color: product.active !== false ? '#16A34A' : '#64748B'
                        }}
                      >
                        {product.active !== false ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          className="nav-btn"
                          style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                          onClick={() => handleOpenEdit(product)}
                          title="Editar todos os dados do produto"
                        >
                          <Edit3 size={13} /> Editar
                        </button>

                        <button
                          className="nav-btn"
                          style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                          onClick={() => handleOpenPriceModal(product)}
                          title="Alterar Preço / Promoção"
                        >
                          <DollarSign size={13} /> Preço
                        </button>

                        <button
                          className="nav-btn"
                          style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                          onClick={() => handleOpenStockModal(product)}
                          title="Alterar Estoque"
                        >
                          <Boxes size={13} /> Estoque
                        </button>

                        <button
                          className="nav-btn"
                          style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                          onClick={async () => {
                            setPersistenceError('');
                            try {
                              await duplicateProduct(product);
                              await refreshProducts();
                              showToast(`Cópia de "${product.name}" criada no Supabase!`);
                            } catch (err) {
                              const msg = err?.message || 'Erro ao duplicar produto no Supabase.';
                              setPersistenceError(msg);
                              showToast(`Erro ao duplicar: ${msg}`);
                            }
                          }}
                          title="Duplicar Produto"
                        >
                          <Copy size={13} /> Duplicar
                        </button>

                        <button
                          className="nav-btn"
                          style={{
                            padding: '6px 10px',
                            fontSize: '0.76rem',
                            color: product.active !== false ? '#D97706' : '#16A34A'
                          }}
                          onClick={async () => {
                            setPersistenceError('');
                            try {
                              await toggleProductActive(product);
                              await refreshProducts();
                              showToast(
                                product.active !== false
                                  ? `"${product.name}" desativado no Supabase.`
                                  : `"${product.name}" ativado no Supabase!`
                              );
                            } catch (err) {
                              const msg = err?.message || 'Erro ao alterar estado no Supabase.';
                              setPersistenceError(msg);
                              showToast(`Erro ao alterar estado: ${msg}`);
                            }
                          }}
                          title={product.active !== false ? 'Desativar produto' : 'Ativar produto'}
                        >
                          {product.active !== false ? <EyeOff size={13} /> : <Eye size={13} />}
                          {product.active !== false ? 'Desativar' : 'Ativar'}
                        </button>

                        <button
                          className="nav-btn"
                          style={{ padding: '6px 10px', fontSize: '0.76rem', color: '#DC2626' }}
                          onClick={() => setDeleteConfirmProduct(product)}
                          title="Excluir Produto"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add / Edit Full Product Modal */}
      {isProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)} style={{ zIndex: 2000 }}>
          <div
            className="modal-content"
            style={{ maxWidth: '760px', width: '96%', maxHeight: '92vh', overflowY: 'auto', padding: '28px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0 }}>
                {editingProduct ? `Editar Produto: ${editingProduct.name}` : 'Adicionar Novo Produto'}
              </h2>
              <button onClick={() => setIsProductModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={e => {
                      const nextName = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        name: nextName,
                        slug: slugManuallyEdited ? prev.slug : createSlug(nextName)
                      }));
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Slug (URL amigável) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.slug}
                    onChange={e => {
                      setSlugManuallyEdited(true);
                      setFormData(prev => ({ ...prev, slug: createSlug(e.target.value) }));
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Categoria *</label>
                  <select
                    className="form-input"
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {CATEGORIES.filter(c => c !== 'Todos').map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Marca</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Oraimo"
                    value={formData.brand}
                    onChange={e => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preço Normal (price em Kz) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-input"
                    value={formData.price}
                    onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preço Promocional (sale_price em Kz - Opcional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Deixe vazio se sem promoção"
                    className="form-input"
                    value={formData.sale_price}
                    onChange={e => setFormData(prev => ({ ...prev, sale_price: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preço Antigo (old_price em Kz - Opcional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 48900"
                    className="form-input"
                    value={formData.old_price}
                    onChange={e => setFormData(prev => ({ ...prev, old_price: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estoque (stock) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="form-input"
                    value={formData.stock}
                    onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: OR-WN2-002"
                    value={formData.sku}
                    onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Badge / Destaque</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: OFERTA DO MÊS"
                    value={formData.badge}
                    onChange={e => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Avaliação (rating 1 a 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    className="form-input"
                    value={formData.rating}
                    onChange={e => setFormData(prev => ({ ...prev, rating: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nº de Avaliações (reviews_count)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.reviews_count}
                    onChange={e => setFormData(prev => ({ ...prev, reviews_count: e.target.value }))}
                  />
                </div>
              </div>

              {/* Image URL & Upload */}
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label className="form-label">Imagem do Produto (URL ou Upload para Supabase Storage `product-images`)</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, minWidth: '220px' }}
                    placeholder="URL da imagem (ex: /product_watchnova2.jpg ou https://...)"
                    value={formData.image_url}
                    onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  />
                  <label
                    className="nav-btn"
                    style={{ cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Upload size={15} />
                    <span>{uploadingImage ? 'Enviando...' : 'Upload Imagem'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageFileUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descrição Completa *</label>
                <textarea
                  rows={3}
                  required
                  className="form-input"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Especificações Técnicas (1 por linha)</label>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="Resistência à água IP68&#10;Notificações WhatsApp e Chamadas&#10;Monitor de Saúde e Sono"
                  value={formData.specsText}
                  onChange={e => setFormData(prev => ({ ...prev, specsText: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  id="product-active-toggle"
                  checked={formData.active}
                  onChange={e => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="product-active-toggle" style={{ fontWeight: 700, cursor: 'pointer' }}>
                  Produto Ativo no Catálogo Público (`active = true`)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="nav-btn" onClick={() => setIsProductModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" disabled={savingProduct} className="nav-btn nav-btn-orange">
                  <Save size={16} /> {savingProduct ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Price Modal */}
      {priceModalProduct && (
        <div className="modal-overlay" onClick={() => setPriceModalProduct(null)} style={{ zIndex: 2100 }}>
          <div className="modal-content" style={{ maxWidth: '420px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px' }}>Alterar Preço</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {priceModalProduct.name}
            </p>
            <form onSubmit={handleSaveQuickPrice}>
              <div className="form-group">
                <label className="form-label">Preço Normal (price em Kz) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="form-input"
                  value={priceForm.price}
                  onChange={e => setPriceForm(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Preço Promocional (sale_price em Kz)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Opcional"
                  className="form-input"
                  value={priceForm.sale_price}
                  onChange={e => setPriceForm(prev => ({ ...prev, sale_price: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Preço Antigo (old_price em Kz)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Opcional"
                  className="form-input"
                  value={priceForm.old_price}
                  onChange={e => setPriceForm(prev => ({ ...prev, old_price: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="nav-btn" onClick={() => setPriceModalProduct(null)}>
                  Cancelar
                </button>
                <button type="submit" className="nav-btn nav-btn-orange">
                  Salvar Preços
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stock Modal */}
      {stockModalProduct && (
        <div className="modal-overlay" onClick={() => setStockModalProduct(null)} style={{ zIndex: 2100 }}>
          <div className="modal-content" style={{ maxWidth: '400px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px' }}>Alterar Estoque</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {stockModalProduct.name}
            </p>
            <form onSubmit={handleSaveQuickStock}>
              <div className="form-group">
                <label className="form-label">Quantidade Disponível (stock = 0 exibe Esgotado)</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="form-input"
                  value={stockValue}
                  onChange={e => setStockValue(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button type="button" className="nav-btn" onClick={() => setStockValue(0)}>
                  Marcar Esgotado (0)
                </button>
                <button type="button" className="nav-btn" onClick={() => setStockValue(prev => Number(prev) + 10)}>
                  +10 un.
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="nav-btn" onClick={() => setStockModalProduct(null)}>
                  Cancelar
                </button>
                <button type="submit" className="nav-btn nav-btn-orange">
                  Salvar Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmProduct(null)} style={{ zIndex: 2200 }}>
          <div className="modal-content" style={{ maxWidth: '460px', padding: '26px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626', marginBottom: '12px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Confirmar Exclusão</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '12px' }}>
              Tem certeza que deseja excluir permanentemente o produto <strong>"{deleteConfirmProduct.name}"</strong>?
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px', background: 'var(--bg-body)', padding: '12px', borderRadius: '10px' }}>
              💡 <strong>Recomendação de SEO:</strong> Desativar o produto (<code>active = false</code>) oculta-o do catálogo público mantendo o histórico e preservando a URL amigável.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="nav-btn" onClick={() => setDeleteConfirmProduct(null)}>
                Cancelar
              </button>
              {deleteConfirmProduct.active !== false && (
                <button
                  className="nav-btn"
                  style={{ borderColor: '#D97706', color: '#D97706' }}
                  onClick={async () => {
                    setPersistenceError('');
                    try {
                      await toggleProductActive(deleteConfirmProduct);
                      await refreshProducts();
                      showToast(`"${deleteConfirmProduct.name}" foi desativado no Supabase.`);
                      setDeleteConfirmProduct(null);
                    } catch (err) {
                      const msg = err?.message || 'Erro ao desativar produto no Supabase.';
                      setPersistenceError(msg);
                      showToast(`Erro: ${msg}`);
                    }
                  }}
                >
                  <EyeOff size={14} /> Apenas Desativar
                </button>
              )}
              <button
                className="nav-btn"
                style={{ background: '#DC2626', color: '#FFF', border: 'none' }}
                onClick={async () => {
                  setPersistenceError('');
                  try {
                    const name = deleteConfirmProduct.name;
                    await deleteProduct(deleteConfirmProduct.id);
                    await refreshProducts();
                    showToast(`Produto "${name}" excluído permanentemente do Supabase.`);
                    setDeleteConfirmProduct(null);
                  } catch (err) {
                    const msg = err?.message || 'Erro ao excluir produto no Supabase.';
                    setPersistenceError(msg);
                    showToast(`Erro ao excluir: ${msg}`);
                  }
                }}
              >
                <Trash2 size={14} /> Excluir Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
