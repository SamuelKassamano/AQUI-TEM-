import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  Save,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  MessageCircle,
  Phone,
  Clock,
  FileText,
  Send,
  Check,
  Mail,
  Key,
  Terminal,
  AlertCircle,
  Globe
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCRM } from '../context/CRMContext';
import {
  supabase,
  isSupabaseConfigured,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  uploadProductImageToSupabase
} from '../lib/supabase';
import { sendAdminPasswordReset, checkUserIsAdmin } from '../lib/crmService';
import { CATEGORIES } from '../../data/products';
import { createSlug } from '../utils/slug';
import OriginalLogoImage from '../components/OriginalLogoImage';

const EMPTY_FORM = {
  name: '',
  brand: 'Oraimo',
  category: 'Acessórios & Tech',
  sku: '',
  slug: '',
  price: '',
  old_price: '',
  sale_price: '',
  stock: 15,
  description: '',
  image_url: '',
  active: true,
  seo_title: '',
  seo_description: '',
  badge: 'NOVIDADE',
  rating: 4.9,
  reviews_count: 25,
  specsText: ''
};

const EMPTY_LEAD_FORM = {
  name: '',
  phone: '',
  city: 'Luanda',
  address: '',
  productName: '',
  totalValue: '',
  notes: ''
};

export default function AdminPage({ defaultTab = 'products' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || defaultTab || 'products';

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

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

  const {
    leads,
    analytics,
    webhookUrl,
    refreshCRMData,
    isLoadingLeads,
    leadsError,
    tableMissingWarning,
    updateLeadStatus,
    deleteLead,
    captureLead,
    saveWebhookUrl
  } = useCRM();

  // Auth State (Strictly backed by Supabase Auth)
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isAdminRole, setIsAdminRole] = useState(true);

  // Password Recovery
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Password Recovery Return Mode (when user lands via email reset link)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');

  // Products UI Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('all');

  // Product Modals State
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

  // CRM State
  const [leadSearch, setLeadSearch] = useState('');
  const [leadFilterStatus, setLeadFilterStatus] = useState('all');
  const [selectedLeadHistory, setSelectedLeadHistory] = useState(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState(EMPTY_LEAD_FORM);
  const [savingNewLead, setSavingNewLead] = useState(false);

  // Webhook State
  const [webhookInput, setWebhookInput] = useState('');
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [testWebhookLoading, setTestWebhookLoading] = useState(false);
  const [testWebhookResult, setTestWebhookResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    document.title = 'Painel Administrativo & CRM | AQUI TEM Angola';
  }, []);

  useEffect(() => {
    if (webhookUrl) {
      setWebhookInput(webhookUrl);
    }
  }, [webhookUrl]);

  // Check Supabase Auth Session via supabase.auth.getSession()
  useEffect(() => {
    let isMounted = true;

    // Detect if landing from password reset link (#type=recovery or ?type=recovery)
    if (
      typeof window !== 'undefined' &&
      (window.location.hash.includes('type=recovery') ||
        window.location.search.includes('type=recovery'))
    ) {
      setIsRecoveryMode(true);
    }

    if (!isSupabaseConfigured || !supabase) {
      setSession(null);
      setAuthChecking(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (!isMounted) return;
        if (error || !data?.session?.user || !data?.session?.access_token) {
          setSession(null);
          setIsAdminRole(false);
        } else {
          setSession(data.session);
          const hasRole = await checkUserIsAdmin(data.session.user);
          if (isMounted) setIsAdminRole(hasRole);
          refreshCRMData();
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
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!isMounted) return;
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
      if (nextSession?.user && nextSession?.access_token) {
        setSession(nextSession);
        const hasRole = await checkUserIsAdmin(nextSession.user);
        if (isMounted) setIsAdminRole(hasRole);
        refreshCRMData();
      } else {
        setSession(null);
        setIsAdminRole(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [refreshCRMData]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');

    if (!newPassword || newPassword.length < 6) {
      setRecoveryError('A nova palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setRecoveryError('As palavras-passe não coincidem. Digite novamente.');
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      setRecoveryError('Supabase não está configurado. Verifique as variáveis de ambiente na Vercel.');
      return;
    }

    setRecoveryLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      setRecoverySuccess('Palavra-passe atualizada com sucesso!');
      showToast('Palavra-passe alterada com sucesso! Acesso concedido.');

      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      setTimeout(() => {
        setIsRecoveryMode(false);
        setNewPassword('');
        setConfirmNewPassword('');
      }, 1500);
    } catch (err) {
      setRecoveryError(err?.message || 'Erro ao redefinir a palavra-passe.');
    } finally {
      setRecoveryLoading(false);
    }
  };

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
        'Autenticação indisponível: A chave pública VITE_SUPABASE_PUBLISHABLE_KEY não está configurada na Vercel. Adicione a chave nas variáveis de ambiente do projeto na Vercel e faça um novo deploy.'
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

      // Verifica papel de administrador
      const hasAdminRole = await checkUserIsAdmin(data.session.user);
      if (!hasAdminRole) {
        await supabase.auth.signOut();
        setSession(null);
        setAuthError('Acesso Negado: Esta conta não possui privilégios de administrador.');
        return;
      }

      setSession(data.session);
      setIsAdminRole(true);
      setPassword('');
      showToast('Sessão administrativa iniciada com sucesso!');
      refreshProducts();
      refreshCRMData();
    } catch (err) {
      setSession(null);
      setAuthError(
        err?.message || 'Erro ao autenticar com o Supabase Authentication. Acesso bloqueado.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail.trim()) {
      setForgotError('Informe o seu e-mail de administrador.');
      return;
    }

    setForgotLoading(true);
    try {
      await sendAdminPasswordReset(forgotEmail.trim());
      setForgotSuccess(
        `Link de redefinição enviado com sucesso para ${forgotEmail.trim()}. Verifique o seu e-mail.`
      );
    } catch (err) {
      setForgotError(err?.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setForgotLoading(false);
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
      showToast('Sessão administrativa encerrada.');
    }
  };

  const isAuthenticated = Boolean(
    isSupabaseConfigured &&
      supabase &&
      session &&
      session.user &&
      session.access_token &&
      isAdminRole
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

  // Product Stats
  const productStats = useMemo(() => {
    const total = products.length;
    const activeCount = products.filter(p => p.active !== false).length;
    const inactiveCount = products.filter(p => p.active === false).length;
    const outOfStockCount = products.filter(p => Number(p.stock) <= 0).length;
    return { total, activeCount, inactiveCount, outOfStockCount };
  }, [products]);

  // Filtered CRM Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const q = leadSearch.toLowerCase().trim();
      const matchesQuery =
        !q ||
        (l.name || '').toLowerCase().includes(q) ||
        (l.phone || '').toLowerCase().includes(q) ||
        (l.city || '').toLowerCase().includes(q) ||
        (l.productName || '').toLowerCase().includes(q) ||
        (l.leadCode || '').toLowerCase().includes(q);

      const matchesStatus =
        leadFilterStatus === 'all' || l.status === leadFilterStatus;

      return matchesQuery && matchesStatus;
    });
  }, [leads, leadSearch, leadFilterStatus]);

  // CRM KPI Stats
  const crmStats = useMemo(() => {
    const total = leads.length;
    const novos = leads.filter(l => l.status === 'Novo Lead').length;
    const atendimento = leads.filter(l => l.status === 'Em Atendimento').length;
    const vendas = leads.filter(l => l.status === 'Venda Realizada').length;
    const perdidos = leads.filter(l => l.status === 'Perdido').length;
    const totalKz = leads.reduce((sum, l) => sum + (Number(l.totalValue) || 0), 0);
    const taxaConversao = total > 0 ? Math.round((vendas / total) * 100) : 0;
    return { total, novos, atendimento, vendas, perdidos, totalKz, taxaConversao };
  }, [leads]);

  // Open Add Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setSlugManuallyEdited(false);
    setFormData({
      ...EMPTY_FORM,
      sku: `AT-${String(products.length + 1).padStart(3, '0')}`
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    setSlugManuallyEdited(true);
    setFormData({
      name: product.name ?? '',
      brand: product.brand ?? 'Oraimo',
      category: product.category || 'Acessórios & Tech',
      sku: product.sku ?? '',
      slug: product.slug || createSlug(product.name || ''),
      price: product.price ?? '',
      sale_price:
        product.sale_price !== null && product.sale_price !== undefined
          ? product.sale_price
          : '',
      old_price:
        product.old_price !== null && product.old_price !== undefined
          ? product.old_price
          : '',
      stock:
        product.stock !== null && product.stock !== undefined
          ? Number(product.stock)
          : 0,
      description: product.description ?? '',
      image_url: product.raw_image_url || product.image_url || product.image || '',
      active: product.active !== false,
      seo_title: product.seo_title ?? '',
      seo_description: product.seo_description ?? '',
      badge: product.badge ?? '',
      rating:
        product.rating !== null && product.rating !== undefined
          ? product.rating
          : 4.9,
      reviews_count:
        product.reviews_count !== null && product.reviews_count !== undefined
          ? product.reviews_count
          : 0,
      specsText: Array.isArray(product.specs) ? product.specs.join('\n') : ''
    });
    setIsProductModalOpen(true);
  };

  // Image file upload to Supabase Storage `products`
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAuthenticated || !isSupabaseConfigured || !supabase) {
      showToast('Sessão administrativa necessária para enviar imagens.');
      return;
    }

    setPersistenceError('');
    setUploadingImage(true);
    try {
      const uploadResult = await uploadProductImageToSupabase(
        file,
        formData.slug || formData.name || editingProduct?.slug || editingProduct?.name || 'produto'
      );
      const publicUrl = typeof uploadResult === 'object' && uploadResult?.url ? uploadResult.url : uploadResult;
      const isStorage = typeof uploadResult === 'object' && uploadResult?.source === 'storage';

      setFormData(prev => ({ ...prev, image_url: publicUrl }));

      if (editingProduct?.id) {
        const updated = await updateProduct(editingProduct.id, {
          image_url: publicUrl
        });
        if (updated) {
          setEditingProduct(updated);
        }
        await refreshProducts();
        showToast(
          isStorage
            ? 'Imagem salva no Supabase Storage e gravada no produto!'
            : 'Imagem associada e salva no produto com sucesso!'
        );
      } else {
        showToast(
          isStorage
            ? 'Imagem salva no Supabase Storage! Conclua clicando em "Salvar Produto".'
            : 'Imagem carregada! Conclua o cadastro clicando em "Salvar Produto".'
        );
      }
    } catch (err) {
      const msg = err?.message || 'Não foi possível carregar o arquivo.';
      setPersistenceError(msg);
      showToast(`Erro no upload: ${msg}`);
    } finally {
      setUploadingImage(false);
      if (e.target) {
        e.target.value = '';
      }
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

    // Formatar e validar slug
    const cleanSlug = createSlug(formData.slug || formData.name);
    if (!cleanSlug) {
      showToast('Por favor, informe um slug ou nome válido.');
      return;
    }

    // Verificar se outro produto já possui esse mesmo slug
    const duplicateSlugProduct = products.find(
      p =>
        createSlug(p.slug || p.name) === cleanSlug &&
        String(p.id) !== String(editingProduct?.id) &&
        String(p.supabaseId) !== String(editingProduct?.id)
    );

    if (duplicateSlugProduct) {
      const errSlugMsg = `O slug "${cleanSlug}" já está sendo usado pelo produto "${duplicateSlugProduct.name}". Defina um slug diferente.`;
      setPersistenceError(errSlugMsg);
      showToast(errSlugMsg);
      return;
    }

    setSavingProduct(true);
    try {
      const payload = {
        name: formData.name.trim(),
        brand: formData.brand.trim() || 'Oraimo',
        category: formData.category,
        sku: formData.sku.trim() || null,
        slug: cleanSlug,
        description: formData.description.trim(),
        price: numericPrice,
        sale_price:
          formData.sale_price !== '' &&
          formData.sale_price !== null &&
          Number(formData.sale_price) > 0
            ? Number(formData.sale_price)
            : null,
        old_price:
          formData.old_price !== '' &&
          formData.old_price !== null &&
          Number(formData.old_price) > 0
            ? Number(formData.old_price)
            : null,
        stock: Number.isFinite(parsedStock) && parsedStock >= 0 ? parsedStock : 0,
        image_url:
          formData.image_url.trim() ||
          editingProduct?.raw_image_url ||
          editingProduct?.image_url ||
          editingProduct?.image ||
          '/logo.jpg',
        active: Boolean(formData.active),
        seo_title: formData.seo_title.trim() || null,
        seo_description: formData.seo_description.trim() || null,
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
          .filter(Boolean)
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
      showToast(`Erro de persistência: ${msg}`);
    } finally {
      setSavingProduct(false);
    }
  };

  // Sync catalog to Supabase
  const handleSyncToSupabase = async () => {
    if (!confirm('Deseja sincronizar o catálogo com a tabela public.products no Supabase?')) {
      return;
    }
    setPersistenceError('');
    setSyncingSupabase(true);
    try {
      const result = await syncCatalogToSupabase();
      await refreshProducts();
      showToast(
        `Catálogo sincronizado: ${result.inserted} novos, ${result.updated} atualizados.`
      );
    } catch (err) {
      const msg = err?.message || 'Erro ao sincronizar base com Supabase.';
      setPersistenceError(msg);
      showToast(`Erro na sincronização: ${msg}`);
    } finally {
      setSyncingSupabase(false);
    }
  };

  // Save manual lead
  const handleSaveManualLead = async (e) => {
    e.preventDefault();
    if (!newLeadForm.name.trim()) {
      showToast('Informe o nome do cliente.');
      return;
    }

    setSavingNewLead(true);
    try {
      await captureLead({
        name: newLeadForm.name.trim(),
        phone: newLeadForm.phone.trim(),
        city: newLeadForm.city.trim() || 'Luanda',
        address: newLeadForm.address.trim() || 'Angola',
        productName: newLeadForm.productName.trim() || 'Atendimento Balcão / Loja',
        totalValue: Number(newLeadForm.totalValue) || 0,
        notes: newLeadForm.notes.trim() || 'Cadastrado manualmente pelo painel CRM'
      });
      setIsNewLeadModalOpen(false);
      setNewLeadForm(EMPTY_LEAD_FORM);
      showToast('Lead cadastrado com sucesso no Supabase!');
    } catch (err) {
      showToast(`Erro ao salvar lead: ${err.message}`);
    } finally {
      setSavingNewLead(false);
    }
  };

  // Save Webhook
  const handleSaveWebhookUrl = async () => {
    setSavingWebhook(true);
    try {
      await saveWebhookUrl(webhookInput.trim());
      showToast('Webhook salvo no Supabase com sucesso!');
    } catch (err) {
      showToast(`Erro ao salvar webhook: ${err.message}`);
    } finally {
      setSavingWebhook(false);
    }
  };

  // Test Webhook
  const handleTestWebhook = async () => {
    const targetUrl = webhookInput.trim();
    if (!targetUrl) {
      showToast('Informe a URL do webhook antes de testar.');
      return;
    }

    setTestWebhookLoading(true);
    setTestWebhookResult(null);
    try {
      const testPayload = {
        event: 'test.ping',
        timestamp: new Date().toISOString(),
        site: 'AQUI TEM Angola',
        testLead: {
          name: 'Cliente Teste AQUI TEM',
          phone: '+244950752933',
          product: 'Oraimo BoomPop Pro',
          value: 35000,
          city: 'Luanda'
        }
      };

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });

      setTestWebhookResult({
        success: res.ok,
        status: res.status,
        statusText: res.statusText || 'OK'
      });
      showToast(res.ok ? 'Webhook testado com sucesso!' : `Servidor respondeu HTTP ${res.status}`);
    } catch (err) {
      setTestWebhookResult({
        success: false,
        error: err.message
      });
      showToast(`Falha no envio do teste: ${err.message}`);
    } finally {
      setTestWebhookLoading(false);
    }
  };

  const crmStatusList = [
    'Novo Lead',
    'Em Atendimento',
    'Venda Realizada',
    'Perdido',
    'Nutrição'
  ];

  // SQL Script text for copy
  const sqlScriptContent = `-- Executar no SQL Editor do Supabase:
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_code TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  city TEXT DEFAULT 'Luanda',
  address TEXT DEFAULT 'Angola',
  product_name TEXT DEFAULT 'Consulta Geral',
  product_price NUMERIC(14, 2) DEFAULT 0,
  total_value NUMERIC(14, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Novo Lead',
  traffic_source TEXT DEFAULT 'Direto',
  time_on_site TEXT DEFAULT '0m 0s',
  pages_viewed INTEGER DEFAULT 1,
  notes TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.crm_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.crm_settings ENABLE ROW LEVEL SECURITY;

-- RLS: Qualquer cliente insere novo pedido; apenas admins autenticados leem/editam
CREATE POLICY "Public checkout can insert leads" ON public.crm_leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view leads" ON public.crm_leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update leads" ON public.crm_leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete leads" ON public.crm_leads FOR DELETE TO authenticated USING (true);
CREATE POLICY "Admins can manage crm_settings" ON public.crm_settings FOR ALL TO authenticated USING (true);`;

  // Se está verificando sessão inicial
  if (authChecking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-body)'
        }}
      >
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Verificando autenticação no Supabase...</p>
        </div>
      </div>
    );
  }

  // Se está em modo de recuperação de senha (clicou no link do email de recuperação)
  if (isRecoveryMode) {
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
            maxWidth: '450px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '20px',
            padding: '34px',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
            <OriginalLogoImage src="/logo.jpg" alt="AQUI TEM" height={40} />
            <button
              type="button"
              onClick={() => {
                setIsRecoveryMode(false);
                if (typeof window !== 'undefined' && window.history?.replaceState) {
                  window.history.replaceState(null, '', window.location.pathname);
                }
              }}
              className="nav-btn"
              style={{ fontSize: '0.82rem' }}
            >
              <ArrowLeft size={15} /> Voltar ao Login
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '6px' }}>
            <Key size={15} /> Recuperação de Palavra-passe
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '6px', color: 'var(--text-main)' }}>
            Definir Nova Palavra-passe
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '22px', lineHeight: 1.5 }}>
            Defina uma nova palavra-passe para a sua conta de administrador no Supabase Auth.
          </p>

          {recoverySuccess && (
            <div
              style={{
                background: '#e6f4ea',
                border: '1px solid #ceead6',
                color: '#137333',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '18px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}
            >
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              <span>{recoverySuccess}</span>
            </div>
          )}

          {recoveryError && (
            <div
              style={{
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                color: '#DC2626',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '18px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{recoveryError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                Nova Palavra-passe (mínimo 6 caracteres) *
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '38px', width: '100%', boxSizing: 'border-box' }}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                Confirmar Nova Palavra-passe *
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '38px', width: '100%', boxSizing: 'border-box' }}
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={recoveryLoading}
              className="nav-btn nav-btn-orange"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem' }}
            >
              <Lock size={17} /> {recoveryLoading ? 'Atualizando Palavra-passe...' : 'Salvar Nova Palavra-passe'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Se NÃO autenticado -> Exibe Tela de Login Profissional
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
            maxWidth: '450px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '20px',
            padding: '34px',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
            <OriginalLogoImage src="/logo.jpg" alt="AQUI TEM" height={40} />
            <Link to="/" className="nav-btn" style={{ textDecoration: 'none', fontSize: '0.82rem' }}>
              <ArrowLeft size={15} /> Voltar à Loja
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '6px' }}>
            <Lock size={15} /> Acesso Restrito Administrativo & CRM
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '6px', color: 'var(--text-main)' }}>
            Painel de Gestão AQUI TEM
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '22px', lineHeight: 1.5 }}>
            Entre com a sua conta de administrador no Supabase Auth para aceder ao CRM, catálogo, preços e estoque.
          </p>

          {!isSupabaseConfigured && (
            <div
              style={{
                background: 'rgba(234, 88, 12, 0.1)',
                border: '1px solid rgba(234, 88, 12, 0.3)',
                color: '#EA580C',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '18px',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div><strong>Atenção:</strong> Variáveis de ambiente do Supabase não detetadas.</div>
                <div style={{ fontSize: '0.78rem', marginTop: '4px', opacity: 0.9 }}>
                  Defina <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> nas configurações de ambiente da Vercel e faça um novo deploy.
                </div>
              </div>
            </div>
          )}

          {authError && (
            <div
              style={{
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                color: '#DC2626',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '18px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                E-mail do Administrador *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  placeholder="admin@aquitem.ao"
                  className="form-input"
                  style={{ paddingLeft: '38px', width: '100%', boxSizing: 'border-box' }}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
                  Palavra-passe *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgotModal(true);
                  }}
                  style={{ background: 'transparent', border: 0, color: 'var(--primary-orange)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                >
                  Esqueceu a palavra-passe?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Key size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '38px', width: '100%', boxSizing: 'border-box' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="nav-btn nav-btn-orange"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '6px', fontSize: '0.95rem' }}
            >
              <Lock size={17} /> {authLoading ? 'Verificando Credenciais...' : 'Entrar no Painel Seguro'}
            </button>
          </form>

          {/* Modal de Recuperação de Palavra-passe */}
          {showForgotModal && (
            <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
              <div
                className="modal-content"
                style={{ maxWidth: '420px', padding: '24px' }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Recuperar Palavra-passe</h3>
                  <button onClick={() => setShowForgotModal(false)} style={{ background: 'transparent', border: 0, cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                  Insira o seu e-mail de administrador para receber o link seguro de redefinição de palavra-passe do Supabase Authentication.
                </p>

                {forgotSuccess && (
                  <div style={{ padding: '12px', background: '#e6f4ea', color: '#137333', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px' }}>
                    {forgotSuccess}
                  </div>
                )}

                {forgotError && (
                  <div style={{ padding: '12px', background: '#fdeded', color: '#d32f2f', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px' }}>
                    {forgotError}
                  </div>
                )}

                <form onSubmit={handleForgotPassword}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>E-mail</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="admin@aquitem.ao"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button type="button" className="nav-btn" onClick={() => setShowForgotModal(false)}>
                      Fechar
                    </button>
                    <button type="submit" disabled={forgotLoading} className="nav-btn nav-btn-orange">
                      {forgotLoading ? 'Enviando...' : 'Enviar Link'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // SE AUTENTICADO -> Painel Completo com Navegação de Abas
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
            maxWidth: '1360px',
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
                Painel Administrativo & CRM — AQUI TEM
              </h1>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database size={12} />
                <span>
                  Supabase ({SUPABASE_PROJECT_ID}):{' '}
                  <strong style={{ color: supabaseConnected ? '#16A34A' : '#D97706' }}>
                    {supabaseConnected ? 'Conectado' : 'Reconectando...'}
                  </strong>
                  {session?.user?.email && (
                    <span> • Admin: <strong>{session.user.email}</strong></span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {currentTab === 'products' && (
              <>
                <button
                  className="nav-btn"
                  onClick={refreshProducts}
                  disabled={loadingProducts}
                  title="Recarregar produtos do Supabase"
                >
                  <RefreshCw size={15} /> Atualizar
                </button>

                <button
                  className="nav-btn"
                  onClick={handleSyncToSupabase}
                  disabled={syncingSupabase}
                  title="Sincronizar catálogo inicial com o Supabase"
                >
                  <Database size={15} /> {syncingSupabase ? 'Sincronizando...' : 'Sincronizar Base'}
                </button>

                <button className="nav-btn nav-btn-orange" onClick={handleOpenAddProduct}>
                  <Plus size={16} /> Novo Produto
                </button>
              </>
            )}

            {currentTab === 'crm' && (
              <>
                <button
                  className="nav-btn"
                  onClick={refreshCRMData}
                  disabled={isLoadingLeads}
                  title="Recarregar leads do Supabase"
                >
                  <RefreshCw size={15} className={isLoadingLeads ? 'animate-spin' : ''} />
                  Atualizar Leads
                </button>

                <button className="nav-btn nav-btn-orange" onClick={() => setIsNewLeadModalOpen(true)}>
                  <Plus size={16} /> Novo Lead Manual
                </button>
              </>
            )}

            <Link to="/" className="nav-btn" style={{ textDecoration: 'none' }}>
              <ArrowLeft size={15} /> Ver Loja
            </Link>

            <button className="nav-btn" onClick={handleLogout} style={{ color: '#DC2626' }}>
              <LogOut size={15} /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Modern Navigation Tabs Bar */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-light)',
          padding: '0 24px'
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingTop: '6px'
          }}
        >
          <button
            onClick={() => setTab('products')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              borderBottom: currentTab === 'products' ? '3px solid #F37021' : '3px solid transparent',
              color: currentTab === 'products' ? '#F37021' : 'var(--text-muted)',
              fontWeight: currentTab === 'products' ? 800 : 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <Package size={17} /> Produtos & Estoque ({products.length})
          </button>

          <button
            onClick={() => setTab('crm')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              borderBottom: currentTab === 'crm' ? '3px solid #F37021' : '3px solid transparent',
              color: currentTab === 'crm' ? '#F37021' : 'var(--text-muted)',
              fontWeight: currentTab === 'crm' ? 800 : 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <Users size={17} /> CRM & Leads ({leads.length})
            {crmStats.novos > 0 && (
              <span style={{ background: '#F37021', color: '#FFF', padding: '2px 7px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800 }}>
                {crmStats.novos} novos
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('analytics')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              borderBottom: currentTab === 'analytics' ? '3px solid #F37021' : '3px solid transparent',
              color: currentTab === 'analytics' ? '#F37021' : 'var(--text-muted)',
              fontWeight: currentTab === 'analytics' ? 800 : 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <BarChart3 size={17} /> Relatórios & Vendas
          </button>

          <button
            onClick={() => setTab('automations')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              borderBottom: currentTab === 'automations' ? '3px solid #F37021' : '3px solid transparent',
              color: currentTab === 'automations' ? '#F37021' : 'var(--text-muted)',
              fontWeight: currentTab === 'automations' ? 800 : 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <Settings size={17} /> Automação & Webhooks
          </button>

          <button
            onClick={() => setTab('security')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              borderBottom: currentTab === 'security' ? '3px solid #F37021' : '3px solid transparent',
              color: currentTab === 'security' ? '#F37021' : 'var(--text-muted)',
              fontWeight: currentTab === 'security' ? 800 : 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <ShieldCheck size={17} /> Segurança & SQL Supabase
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1360px', margin: '24px auto', padding: '0 20px' }}>
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
              <strong>Aviso de Persistência no Supabase:</strong> {persistenceError}
            </div>
            <button
              onClick={() => setPersistenceError('')}
              style={{ background: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 800 }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 1: PRODUTOS & ESTOQUE */}
        {/* ============================================================== */}
        {currentTab === 'products' && (
          <div>
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
                  {productStats.total}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Ativos no Catálogo</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '4px', color: '#16A34A', fontVariantNumeric: 'tabular-nums' }}>
                  {productStats.activeCount}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Inativos / Ocultos</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '4px', color: '#64748B', fontVariantNumeric: 'tabular-nums' }}>
                  {productStats.inactiveCount}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Produtos Esgotados (stock = 0)</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '4px', color: productStats.outOfStockCount > 0 ? '#DC2626' : '#16A34A', fontVariantNumeric: 'tabular-nums' }}>
                  {productStats.outOfStockCount}
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
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Pesquisar por nome, SKU, categoria..."
                    className="form-input"
                    style={{ paddingLeft: '36px', width: '100%', boxSizing: 'border-box' }}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="form-input"
                  style={{ width: 'auto', minWidth: '160px' }}
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                >
                  <option value="Todos">Todas as Categorias</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  className="form-input"
                  style={{ width: 'auto', minWidth: '150px' }}
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos os Estados</option>
                  <option value="active">Apenas Ativos</option>
                  <option value="inactive">Apenas Inativos</option>
                  <option value="promo">Em Promoção</option>
                  <option value="out_of_stock">Esgotados</option>
                </select>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {filteredProducts.length} de {products.length} produtos
              </div>
            </div>

            {/* Products Table */}
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1px solid var(--border-light)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-body)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Produto</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Categoria</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Preço Efetivo</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Estoque</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Estado</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          Nenhum produto encontrado com os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map(p => {
                        const effective = getEffectivePrice(p);
                        const prevPrice = getPreviousPrice(p);
                        const isOut = Number(p.stock) <= 0;

                        return (
                          <tr
                            key={p.id}
                            style={{
                              borderBottom: '1px solid var(--border-light)',
                              opacity: p.active === false ? 0.6 : 1
                            }}
                          >
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img
                                  src={p.image_url || p.image || '/logo.jpg'}
                                  alt={p.name}
                                  style={{
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '8px',
                                    objectFit: 'cover',
                                    border: '1px solid var(--border-light)',
                                    background: '#f8fafc'
                                  }}
                                  onError={(e) => { e.currentTarget.src = '/logo.jpg'; }}
                                />
                                <div>
                                  <div style={{ fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {p.name}
                                    {p.badge && (
                                      <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'var(--primary-orange)', color: '#FFF', fontWeight: 800 }}>
                                        {p.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                    SKU: {p.sku || 'N/A'} • Slug: {p.slug || createSlug(p.name)}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-body)', border: '1px solid var(--border-light)' }}>
                                {p.category}
                              </span>
                            </td>

                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 800, color: 'var(--primary-orange)' }}>
                                {formatPriceKz(effective)}
                              </div>
                              {prevPrice && (
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                  {formatPriceKz(prevPrice)}
                                </div>
                              )}
                            </td>

                            <td style={{ padding: '12px 16px' }}>
                              <button
                                onClick={() => {
                                  setStockModalProduct(p);
                                  setStockValue(Number(p.stock) || 0);
                                }}
                                style={{
                                  border: '1px solid',
                                  borderColor: isOut ? '#DC2626' : '#16A34A',
                                  color: isOut ? '#DC2626' : '#16A34A',
                                  background: isOut ? 'rgba(220, 38, 38, 0.08)' : 'rgba(22, 163, 74, 0.08)',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 800,
                                  cursor: 'pointer'
                                }}
                              >
                                {isOut ? 'Esgotado (0)' : `${p.stock} un.`}
                              </button>
                            </td>

                            <td style={{ padding: '12px 16px' }}>
                              <button
                                onClick={async () => {
                                  try {
                                    await toggleProductActive(p);
                                    await refreshProducts();
                                  } catch (e) {
                                    showToast(`Erro ao alterar estado: ${e.message}`);
                                  }
                                }}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  color: p.active !== false ? '#16A34A' : '#DC2626',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.8rem',
                                  fontWeight: 700
                                }}
                              >
                                {p.active !== false ? (
                                  <>
                                    <Eye size={14} /> Ativo
                                  </>
                                ) : (
                                  <>
                                    <EyeOff size={14} /> Inativo
                                  </>
                                )}
                              </button>
                            </td>

                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                <button
                                  className="nav-btn nav-btn-icon"
                                  onClick={() => handleOpenEditProduct(p)}
                                  title="Editar Produto"
                                  style={{ padding: '6px' }}
                                >
                                  <Edit3 size={15} />
                                </button>

                                <button
                                  className="nav-btn nav-btn-icon"
                                  onClick={() => {
                                    setPriceModalProduct(p);
                                    setPriceForm({
                                      price: p.price ?? '',
                                      sale_price: p.sale_price ?? '',
                                      old_price: p.old_price ?? ''
                                    });
                                  }}
                                  title="Alterar Preço Rápido"
                                  style={{ padding: '6px' }}
                                >
                                  <DollarSign size={15} />
                                </button>

                                <button
                                  className="nav-btn nav-btn-icon"
                                  onClick={async () => {
                                    await duplicateProduct(p);
                                    await refreshProducts();
                                  }}
                                  title="Duplicar Produto"
                                  style={{ padding: '6px' }}
                                >
                                  <Copy size={15} />
                                </button>

                                <button
                                  className="nav-btn nav-btn-icon"
                                  onClick={() => setDeleteConfirmProduct(p)}
                                  title="Excluir Produto"
                                  style={{ padding: '6px', color: '#DC2626' }}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 2: CRM & LEADS COMERCIAIS */}
        {/* ============================================================== */}
        {currentTab === 'crm' && (
          <div>
            {/* Aviso se a tabela crm_leads não existir no Supabase */}
            {tableMissingWarning && (
              <div
                style={{
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  color: '#92400E',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <AlertTriangle size={22} style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.86rem', lineHeight: 1.5, flex: 1 }}>
                  <strong>Aviso de Banco de Dados:</strong> A tabela <code>public.crm_leads</code> ainda não existe no seu projeto Supabase. Os leads atuais estão protegidos em sessão. Para persistência permanente com segurança RLS, abra a aba <strong>Segurança & SQL Supabase</strong> e execute o script SQL.
                </div>
                <button
                  onClick={() => setTab('security')}
                  className="nav-btn nav-btn-orange"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  Ver Script SQL
                </button>
              </div>
            )}

            {/* KPI Cards do CRM */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}
            >
              <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total de Leads</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
                  {crmStats.total}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 700 }}>Novos Leads (Pendentes)</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '4px', color: '#D97706', fontVariantNumeric: 'tabular-nums' }}>
                  {crmStats.novos}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 700 }}>Vendas Realizadas</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '4px', color: '#16A34A', fontVariantNumeric: 'tabular-nums' }}>
                  {crmStats.vendas}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.8rem', color: '#0EA5E9', fontWeight: 700 }}>Taxa de Conversão</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '4px', color: '#0EA5E9', fontVariantNumeric: 'tabular-nums' }}>
                  {crmStats.taxaConversao}%
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-orange)', fontWeight: 700 }}>Volume em Pipeline</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '6px', color: 'var(--primary-orange)', fontVariantNumeric: 'tabular-nums' }}>
                  {Number(crmStats.totalKz).toLocaleString('pt-AO')} Kz
                </div>
              </div>
            </div>

            {/* Leads Search & Filter Bar */}
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
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Pesquisar por cliente, telefone, cidade, produto..."
                    className="form-input"
                    style={{ paddingLeft: '36px', width: '100%', boxSizing: 'border-box' }}
                    value={leadSearch}
                    onChange={e => setLeadSearch(e.target.value)}
                  />
                </div>

                <select
                  className="form-input"
                  style={{ width: 'auto', minWidth: '170px' }}
                  value={leadFilterStatus}
                  onChange={e => setLeadFilterStatus(e.target.value)}
                >
                  <option value="all">Todos os Estados</option>
                  {crmStatusList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {filteredLeads.length} de {leads.length} leads
              </div>
            </div>

            {/* Leads Cards Grid */}
            {filteredLeads.length === 0 ? (
              <div
                style={{
                  background: 'var(--bg-card)',
                  padding: '50px 20px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  border: '1px solid var(--border-light)'
                }}
              >
                <Users size={48} style={{ opacity: 0.3, color: 'var(--primary-orange)', margin: '0 auto 12px' }} />
                <h3 style={{ margin: '0 0 6px', fontWeight: 800 }}>Nenhum Lead Encontrado</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Novos leads gerados no site via WhatsApp ou cadastrados manualmente aparecerão aqui.
                </p>
                <button
                  onClick={() => setIsNewLeadModalOpen(true)}
                  className="nav-btn nav-btn-orange"
                  style={{ marginTop: '16px' }}
                >
                  <Plus size={16} /> Criar Primeiro Lead
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '14px' }}>
                {filteredLeads.map(lead => {
                  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
                  const waUrl = cleanPhone
                    ? `https://wa.me/${cleanPhone.startsWith('244') ? cleanPhone : `244${cleanPhone}`}?text=${encodeURIComponent(`Olá ${lead.name}, confirmamos o seu interesse na AQUI TEM Angola a respeito de ${lead.productName || 'nossos produtos'}. Podemos ajudar?`)}`
                    : null;

                  return (
                    <div
                      key={lead.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '14px',
                        padding: '18px 20px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '16px',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{lead.name}</strong>
                          <span style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'var(--bg-body)', borderRadius: '6px', color: 'var(--text-muted)', fontWeight: 700 }}>
                            {lead.leadCode || 'LEAD'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          📍 {lead.city || 'Luanda'} • {lead.address || 'Angola'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {new Date(lead.createdAt).toLocaleString('pt-AO')}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E5C9E' }}>
                          📦 {lead.productName || 'Consulta Geral'}
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--primary-orange)', marginTop: '2px' }}>
                          {Number(lead.totalValue).toLocaleString('pt-AO')} Kz
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Origem: <strong>{lead.trafficSource}</strong> ({lead.timeOnSite})
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>ESTADO:</label>
                          <select
                            value={lead.status}
                            onChange={async (e) => {
                              try {
                                await updateLeadStatus(lead.id, e.target.value, 'Atualizado no painel CRM');
                                showToast(`Estado de ${lead.name} alterado para ${e.target.value}`);
                              } catch (err) {
                                showToast(`Erro ao atualizar: ${err.message}`);
                              }
                            }}
                            className="form-input"
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              background: 'var(--bg-body)',
                              borderColor:
                                lead.status === 'Venda Realizada'
                                  ? '#16A34A'
                                  : lead.status === 'Novo Lead'
                                  ? '#D97706'
                                  : 'var(--border-light)'
                            }}
                          >
                            {crmStatusList.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '6px 12px',
                                background: '#25D366',
                                color: '#FFF',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 700
                              }}
                            >
                              <MessageCircle size={14} /> WhatsApp ({cleanPhone})
                            </a>
                          )}

                          <button
                            onClick={() => setSelectedLeadHistory(lead)}
                            title="Ver Histórico e Notas"
                            className="nav-btn nav-btn-icon"
                            style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <FileText size={14} /> Histórico ({lead.history?.length || 0})
                          </button>

                          <button
                            onClick={async () => {
                              if (confirm(`Deseja eliminar o lead de ${lead.name}?`)) {
                                try {
                                  await deleteLead(lead.id);
                                  showToast('Lead excluído.');
                                } catch (err) {
                                  showToast(`Erro ao excluir: ${err.message}`);
                                }
                              }
                            }}
                            title="Eliminar Lead"
                            className="nav-btn nav-btn-icon"
                            style={{ padding: '6px 10px', color: '#DC2626' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 3: RELATÓRIOS & VENDAS */}
        {/* ============================================================== */}
        {currentTab === 'analytics' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Sales Pipeline Funnel */}
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', fontWeight: 800 }}>
                Funil Comercial & Conversão de Vendas
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-body)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>1. Visitas ao Site</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: '4px' }}>{analytics.totalVisits}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>100% tráfego inicial</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(243, 112, 33, 0.08)', border: '1px solid rgba(243, 112, 33, 0.2)' }}>
                  <div style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 700 }}>2. Leads Capturados</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: '4px', color: 'var(--primary-orange)' }}>
                    {crmStats.total}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#D97706', marginTop: '4px' }}>
                    {analytics.totalVisits > 0 ? ((crmStats.total / analytics.totalVisits) * 100).toFixed(1) : 0}% de conversão
                  </div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                  <div style={{ fontSize: '0.78rem', color: '#0EA5E9', fontWeight: 700 }}>3. Em Atendimento</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: '4px', color: '#0EA5E9' }}>
                    {crmStats.atendimento}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#0EA5E9', marginTop: '4px' }}>Negociações ativas</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
                  <div style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 700 }}>4. Vendas Fechadas</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: '4px', color: '#16A34A' }}>
                    {crmStats.vendas}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#16A34A', marginTop: '4px' }}>
                    {crmStats.taxaConversao}% de aproveitamento
                  </div>
                </div>
              </div>
            </div>

            {/* Fontes de Tráfego & Produtos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 800 }}>Origem dos Acessos & Campanhas</h4>
                {Object.entries(analytics.sources || {}).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum dado de origem registrado ainda.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {Object.entries(analytics.sources || {}).map(([source, val]) => (
                      <div key={source} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-body)', borderRadius: '8px', fontSize: '0.88rem' }}>
                        <span>🌐 {source}</span>
                        <strong>{val} acessos</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 800 }}>Produtos com Maior Intenção de Compra</h4>
                {Object.entries(analytics.productViews || {}).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum produto consultado ainda.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {Object.entries(analytics.productViews || {}).map(([prod, count]) => (
                      <div key={prod} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-body)', borderRadius: '8px', fontSize: '0.88rem' }}>
                        <span style={{ fontWeight: 600 }}>📦 {prod}</span>
                        <strong style={{ color: 'var(--primary-orange)' }}>{count} cliques</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 4: AUTOMAÇÕES & WEBHOOKS */}
        {/* ============================================================== */}
        {currentTab === 'automations' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ padding: '10px', background: 'rgba(243, 112, 33, 0.1)', borderRadius: '10px', color: 'var(--primary-orange)' }}>
                  <Settings size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                    Integração Externa de Webhooks
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    Conecte o seu CRM AQUI TEM ao n8n, Make, Zapier ou Google Sheets.
                  </p>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '20px' }}>
                Sempre que um cliente clicar para falar no WhatsApp ou realizar um pedido na loja, um evento <code>lead.captured</code> será disparado automaticamente via requisição HTTP POST para o endereço configurado abaixo.
              </p>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  URL de Destino do Webhook (HTTP POST) *
                </label>
                <input
                  type="url"
                  placeholder="https://seu-n8n.com/webhook/aquitem-leads"
                  className="form-input"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px' }}
                  value={webhookInput}
                  onChange={e => setWebhookInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <button
                  onClick={handleSaveWebhookUrl}
                  disabled={savingWebhook}
                  className="nav-btn nav-btn-orange"
                  style={{ padding: '10px 18px' }}
                >
                  <Save size={16} /> {savingWebhook ? 'Salvando...' : 'Salvar Webhook no Supabase'}
                </button>

                <button
                  onClick={handleTestWebhook}
                  disabled={testWebhookLoading || !webhookInput.trim()}
                  className="nav-btn"
                  style={{ padding: '10px 18px' }}
                >
                  <Send size={16} /> {testWebhookLoading ? 'Enviando Teste...' : 'Testar Disparo'}
                </button>
              </div>

              {testWebhookResult && (
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    fontSize: '0.86rem',
                    background: testWebhookResult.success ? '#e6f4ea' : '#fdeded',
                    color: testWebhookResult.success ? '#137333' : '#d32f2f',
                    border: '1px solid',
                    borderColor: testWebhookResult.success ? '#b7e1cd' : '#f5c2c7'
                  }}
                >
                  {testWebhookResult.success ? (
                    <div>
                      <strong>Teste Concluído com Sucesso!</strong> O endpoint respondeu status <code>{testWebhookResult.status} {testWebhookResult.statusText}</code>.
                    </div>
                  ) : (
                    <div>
                      <strong>Falha no Teste:</strong> {testWebhookResult.error || `Status HTTP ${testWebhookResult.status}`}. Verifique se a URL aceita CORS e conexões públicas.
                    </div>
                  )}
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 800 }}>
                  Estrutura JSON do Payload Enviado
                </h4>
                <pre
                  style={{
                    background: 'var(--bg-body)',
                    padding: '14px',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    overflowX: 'auto',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-main)',
                    margin: 0
                  }}
                >
{`{
  "event": "lead.captured",
  "timestamp": "2026-10-15T21:00:00.000Z",
  "site": "AQUI TEM Angola",
  "siteUrl": "https://aqui-tem29.vercel.app/",
  "lead": {
    "leadCode": "LEAD-123456",
    "name": "João Manuel",
    "phone": "950752933",
    "city": "Luanda",
    "address": "Talatona",
    "productName": "Oraimo BoomPop Pro",
    "totalValue": 35000,
    "status": "Novo Lead",
    "trafficSource": "Instagram (Social Media)",
    "timeOnSite": "2m 14s"
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 5: SEGURANÇA & SQL SUPABASE */}
        {/* ============================================================== */}
        {currentTab === 'security' && (
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gap: '24px' }}>
            {/* Status de Segurança */}
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ padding: '10px', background: 'rgba(22, 163, 74, 0.1)', borderRadius: '10px', color: '#16A34A' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Status de Segurança & Acesso</h3>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    Row Level Security (RLS) e Supabase Authentication
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '14px', background: 'var(--bg-body)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ADMINISTRADOR AUTENTICADO</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, marginTop: '4px', wordBreak: 'break-all' }}>{session?.user?.email}</div>
                </div>

                <div style={{ padding: '14px', background: 'var(--bg-body)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>PROJETO SUPABASE</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, marginTop: '4px' }}>{SUPABASE_PROJECT_ID}</div>
                </div>

                <div style={{ padding: '14px', background: 'var(--bg-body)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>STORAGE BUCKET</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, marginTop: '4px', color: '#16A34A' }}>products (Público)</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-btn nav-btn-orange"
                  style={{ textDecoration: 'none' }}
                >
                  <ExternalLink size={16} /> Abrir SQL Editor no Supabase
                </a>

                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/auth/users`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-btn"
                  style={{ textDecoration: 'none' }}
                >
                  <Users size={16} /> Gerir Administradores no Supabase Auth
                </a>
              </div>
            </div>

            {/* Script SQL para Configuração do CRM no Supabase */}
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                    Script SQL para Criação das Tabelas do CRM e Políticas RLS
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Copie e execute este código no SQL Editor do Supabase se ainda não executou.
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sqlScriptContent);
                    setCopiedSql(true);
                    showToast('Script SQL copiado para a área de transferência!');
                    setTimeout(() => setCopiedSql(false), 3000);
                  }}
                  className="nav-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {copiedSql ? <Check size={16} color="#16A34A" /> : <Copy size={16} />}
                  {copiedSql ? 'Copiado!' : 'Copiar Código SQL'}
                </button>
              </div>

              <pre
                style={{
                  background: 'var(--bg-body)',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  overflowX: 'auto',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-main)',
                  maxHeight: '360px',
                  lineHeight: 1.5,
                  margin: 0
                }}
              >
                {sqlScriptContent}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL: HISTÓRICO DO LEAD */}
      {/* ============================================================== */}
      {selectedLeadHistory && (
        <div className="modal-overlay" onClick={() => setSelectedLeadHistory(null)}>
          <div className="modal-content" style={{ maxWidth: '520px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Histórico do Lead</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{selectedLeadHistory.name} ({selectedLeadHistory.leadCode})</p>
              </div>
              <button onClick={() => setSelectedLeadHistory(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-body)', borderRadius: '10px', fontSize: '0.85rem' }}>
              <div><strong>Produto:</strong> {selectedLeadHistory.productName}</div>
              <div><strong>Valor:</strong> {Number(selectedLeadHistory.totalValue).toLocaleString('pt-AO')} Kz</div>
              <div><strong>Notas:</strong> {selectedLeadHistory.notes || 'Sem notas adicionais'}</div>
            </div>

            <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: 700 }}>Linha do Tempo</h4>
            <div style={{ display: 'grid', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {(selectedLeadHistory.history || []).length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sem registros anteriores de alterações.</p>
              ) : (
                selectedLeadHistory.history.map((h, i) => (
                  <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary-orange)' }}>{h.action}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{new Date(h.date).toLocaleString('pt-AO')}</div>
                    {h.details && <div style={{ marginTop: '2px' }}>{h.details}</div>}
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button className="nav-btn" onClick={() => setSelectedLeadHistory(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NOVO LEAD MANUAL */}
      {/* ============================================================== */}
      {isNewLeadModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewLeadModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '480px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Novo Lead Manual</h3>
              <button onClick={() => setIsNewLeadModalOpen(false)} style={{ background: 'transparent', border: 0, cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveManualLead}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manuel António"
                  className="form-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  value={newLeadForm.name}
                  onChange={e => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="Ex: 950752933"
                  className="form-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  value={newLeadForm.phone}
                  onChange={e => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Cidade / Província</label>
                  <input
                    type="text"
                    placeholder="Luanda"
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={newLeadForm.city}
                    onChange={e => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Valor (Kz)</label>
                  <input
                    type="number"
                    placeholder="Ex: 25000"
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={newLeadForm.totalValue}
                    onChange={e => setNewLeadForm({ ...newLeadForm, totalValue: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Produto de Interesse</label>
                <input
                  type="text"
                  placeholder="Ex: Fones Oraimo BoomPop Pro"
                  className="form-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  value={newLeadForm.productName}
                  onChange={e => setNewLeadForm({ ...newLeadForm, productName: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', display: 'block' }}>Observações</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Pedido feito presencialmente no showroom."
                  className="form-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  value={newLeadForm.notes}
                  onChange={e => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="nav-btn" onClick={() => setIsNewLeadModalOpen(false)}>Cancelar</button>
                <button type="submit" disabled={savingNewLead} className="nav-btn nav-btn-orange">
                  {savingNewLead ? 'Gravando...' : 'Salvar Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDITAR / CRIAR PRODUTO */}
      {/* ============================================================== */}
      {isProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '780px', maxHeight: '92vh', overflowY: 'auto', padding: '24px 28px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={22} color="var(--primary-orange)" />
                  {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {editingProduct
                    ? `Atualize as informações comerciais, estoque e SEO do produto "${editingProduct.name}".`
                    : 'Preencha os dados completos do produto para publicação no catálogo e mecanismos de busca.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

              {/* SEÇÃO 1: INFORMAÇÕES DO PRODUTO */}
              <div style={{ background: 'var(--bg-body)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Package size={16} /> 1. Informações do Produto
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: WATCH NOVA 2 - Smartwatch Inteligente Oraimo"
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

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Marca</label>
                    <input
                      type="text"
                      placeholder="Ex: Oraimo"
                      className="form-input"
                      value={formData.brand}
                      onChange={e => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Categoria *</label>
                    <select
                      className="form-input"
                      value={formData.category}
                      onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">SKU (Código Único)</label>
                    <input
                      type="text"
                      placeholder="Ex: AT-WN2-002"
                      className="form-input"
                      value={formData.sku}
                      onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>URL Amigável (Slug) *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setSlugManuallyEdited(false);
                        setFormData(prev => ({ ...prev, slug: createSlug(prev.name) }));
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary-orange)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      Auto-gerar do Nome
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="watch-nova-2-smartwatch-inteligente-oraimo"
                    className="form-input"
                    value={formData.slug}
                    onChange={e => {
                      setSlugManuallyEdited(true);
                      setFormData(prev => ({ ...prev, slug: createSlug(e.target.value) }));
                    }}
                  />
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Link público do produto: <code>/produto/{formData.slug || 'slug-do-produto'}</code>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: PREÇO E ESTOQUE */}
              <div style={{ background: 'var(--bg-body)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#10B981', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <DollarSign size={16} /> 2. Preço e Estoque
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Preço Regular (Kz) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Ex: 48900"
                      className="form-input"
                      value={formData.price}
                      onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preço Promocional (Kz)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ex: 41500 (Opcional)"
                      className="form-input"
                      value={formData.sale_price}
                      onChange={e => setFormData(prev => ({ ...prev, sale_price: e.target.value }))}
                    />
                    {Number(formData.sale_price) > 0 && Number(formData.price) > Number(formData.sale_price) && (
                      <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700, marginTop: '2px', display: 'block' }}>
                        Desconto de {Math.round(((formData.price - formData.sale_price) / formData.price) * 100)}% aplicado!
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estoque (Unidades) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Ex: 15"
                      className="form-input"
                      value={formData.stock}
                      onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    />
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, marginTop: '2px', display: 'block', color: Number(formData.stock) > 0 ? '#10B981' : '#DC2626' }}>
                      {Number(formData.stock) > 0 ? `Disponível (${formData.stock} un)` : 'Esgotado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 3: DESCRIÇÃO COMPLETA */}
              <div style={{ background: 'var(--bg-body)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1E5C9E', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <FileText size={16} /> 3. Descrição Completa do Produto
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Insira o texto completo, parágrafos, destaques e especificações com bullet points (•). Aparecerá de forma organizada na página pública.
                </p>
                <textarea
                  rows={8}
                  className="form-input"
                  style={{ fontFamily: 'inherit', fontSize: '0.88rem', lineHeight: 1.6 }}
                  placeholder={"Mais tecnologia no seu pulso.\n\nO Oraimo Watch Nova 2 combina um design moderno com uma tela AMOLED curva de 2,01\", proporcionando uma experiência visual confortável e envolvente.\n\nPrincipais recursos:\n• Tela AMOLED curva de 2,01\"\n• Bluetooth 5.3\n• Monitoramento de frequência cardíaca\n• Bateria de longa duração\n• Resistência IP68"}
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* SEÇÃO 4: IMAGEM DO PRODUTO */}
              <div style={{ background: 'var(--bg-body)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Upload size={16} /> 4. Imagem do Produto
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', alignItems: 'center' }}>
                  {/* Pré-visualização da imagem */}
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '12px',
                      border: '2px dashed var(--border-light)',
                      background: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    {formData.image_url ? (
                      <img
                        src={formData.image_url}
                        alt="Pré-visualização"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.currentTarget.src = '/logo.jpg'; }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem', padding: '6px' }}>
                        Sem imagem selecionada
                      </div>
                    )}
                  </div>

                  {/* Ações e URL da Imagem */}
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <label
                        className="nav-btn nav-btn-orange"
                        style={{
                          cursor: uploadingImage ? 'wait' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          fontSize: '0.84rem'
                        }}
                      >
                        <Upload size={15} />
                        <span>{uploadingImage ? 'Enviando ao Storage...' : (formData.image_url ? 'Alterar Imagem' : 'Carregar Imagem (Storage)')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          disabled={uploadingImage}
                          onChange={handleImageFileUpload}
                        />
                      </label>

                      {formData.image_url && (
                        <button
                          type="button"
                          className="nav-btn"
                          onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Ou cole aqui o link da imagem (URL pública ou Storage)..."
                      className="form-input"
                      value={formData.image_url}
                      onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    />

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Bucket de destino: <code>products</code> no Supabase Storage. Se você não selecionar uma nova imagem ao editar, a imagem anterior será mantida automaticamente.
                    </div>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 5: PUBLICAÇÃO */}
              <div style={{ background: 'var(--bg-body)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Globe size={16} color="var(--primary-orange)" /> 5. Publicação no Site
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Controle a visibilidade pública deste produto no catálogo da loja online.
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'var(--bg-card)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <input
                      type="checkbox"
                      id="prod-active-toggle"
                      checked={formData.active}
                      onChange={e => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    />
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: formData.active ? '#10B981' : '#DC2626' }}>
                      {formData.active ? 'Produto Ativo (Visível na loja)' : 'Produto Inativo (Oculto)'}
                    </span>
                  </label>
                </div>
              </div>

              {/* SEÇÃO 6: SEO — OTIMIZAÇÃO PARA MECANISMOS DE BUSCA */}
              <div style={{ background: 'linear-gradient(135deg, rgba(30, 92, 158, 0.05) 0%, rgba(255, 101, 0, 0.05) 100%)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(30, 92, 158, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1E5C9E', fontWeight: 900, fontSize: '0.92rem' }}>
                  <Search size={18} /> 🔎 SEO — Otimização para mecanismos de busca
                </div>

                {/* Nota explicativa oficial */}
                <div style={{ background: 'rgba(30, 92, 158, 0.08)', padding: '10px 14px', borderRadius: '8px', borderLeft: '4px solid #1E5C9E', fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '16px', lineHeight: 1.5 }}>
                  <strong>Aviso Importante:</strong> Esses campos são utilizados para ajudar o Google e outros mecanismos de busca a encontrar e compreender melhor este produto. Eles <strong>não são exibidos como conteúdo da página</strong> para os visitantes.
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Título SEO (Meta Title)</label>
                    <span style={{ fontSize: '0.74rem', color: formData.seo_title?.length > 60 ? '#DC2626' : 'var(--text-muted)' }}>
                      {formData.seo_title?.length || 0} / 60 caracteres recomendados
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder='Ex: Oraimo Watch Nova 2 2.01" AMOLED | AQUI TEM Angola'
                    className="form-input"
                    value={formData.seo_title}
                    onChange={e => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                  />
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Aplicado na tag <code>&lt;title&gt;</code> do navegador e no título do resultado de busca do Google.
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Descrição SEO (Meta Description)</label>
                    <span style={{ fontSize: '0.74rem', color: formData.seo_description?.length > 160 ? '#DC2626' : 'var(--text-muted)' }}>
                      {formData.seo_description?.length || 0} / 160 caracteres recomendados
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder={'Ex: Compre o Oraimo Watch Nova 2 na AQUI TEM Angola. Smartwatch com tela AMOLED de 2,01", Bluetooth 5.3, monitoramento de saúde, IP68 e bateria de longa duração.'}
                    className="form-input"
                    value={formData.seo_description}
                    onChange={e => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                  />
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Aplicado na tag <code>&lt;meta name="description"&gt;</code> e na prévia do link no WhatsApp e Facebook.
                  </div>
                </div>
              </div>

              {/* RODAPÉ DO FORMULÁRIO */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                <button
                  type="button"
                  className="nav-btn"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  Cancelar
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="nav-btn nav-btn-orange"
                    style={{ padding: '10px 24px', fontSize: '0.92rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Save size={16} />
                    {savingProduct ? 'Gravando no Supabase...' : (editingProduct ? 'Salvar Alterações' : 'Salvar Produto')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ESTOQUE RÁPIDO */}
      {/* ============================================================== */}
      {stockModalProduct && (
        <div className="modal-overlay" onClick={() => setStockModalProduct(null)}>
          <div className="modal-content" style={{ maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Ajustar Estoque</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {stockModalProduct.name}
            </p>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="number"
                min="0"
                className="form-input"
                style={{ width: '100%', fontSize: '1.1rem', fontWeight: 800, boxSizing: 'border-box' }}
                value={stockValue}
                onChange={e => setStockValue(parseInt(e.target.value, 10) || 0)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="nav-btn" onClick={() => setStockModalProduct(null)}>Cancelar</button>
              <button
                className="nav-btn nav-btn-orange"
                onClick={async () => {
                  try {
                    await updateProduct(stockModalProduct.id, { stock: Math.max(0, stockValue) });
                    await refreshProducts();
                    showToast('Estoque atualizado no Supabase!');
                    setStockModalProduct(null);
                  } catch (e) {
                    showToast(`Erro: ${e.message}`);
                  }
                }}
              >
                Salvar Estoque
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: PREÇO RÁPIDO */}
      {/* ============================================================== */}
      {priceModalProduct && (
        <div className="modal-overlay" onClick={() => setPriceModalProduct(null)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Alterar Preço</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {priceModalProduct.name}
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Preço Regular (Kz)</label>
              <input
                type="number"
                className="form-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={priceForm.price}
                onChange={e => setPriceForm({ ...priceForm, price: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Preço Promocional (Kz)</label>
              <input
                type="number"
                className="form-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={priceForm.sale_price}
                onChange={e => setPriceForm({ ...priceForm, sale_price: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="nav-btn" onClick={() => setPriceModalProduct(null)}>Cancelar</button>
              <button
                className="nav-btn nav-btn-orange"
                onClick={async () => {
                  try {
                    await updateProduct(priceModalProduct.id, {
                      price: Number(priceForm.price) || priceModalProduct.price,
                      sale_price: priceForm.sale_price ? Number(priceForm.sale_price) : null
                    });
                    await refreshProducts();
                    showToast('Preço atualizado no Supabase!');
                    setPriceModalProduct(null);
                  } catch (e) {
                    showToast(`Erro: ${e.message}`);
                  }
                }}
              >
                Salvar Preço
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRMAR EXCLUSÃO */}
      {/* ============================================================== */}
      {deleteConfirmProduct && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmProduct(null)}>
          <div className="modal-content" style={{ maxWidth: '440px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626', marginBottom: '12px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Confirmar Exclusão</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '14px' }}>
              Tem certeza que deseja excluir o produto <strong>"{deleteConfirmProduct.name}"</strong>?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="nav-btn" onClick={() => setDeleteConfirmProduct(null)}>Cancelar</button>
              <button
                className="nav-btn"
                style={{ background: '#DC2626', color: '#FFF', border: 'none' }}
                onClick={async () => {
                  const prod = deleteConfirmProduct;
                  setDeleteConfirmProduct(null);
                  try {
                    await deleteProduct(prod.id);
                    await refreshProducts();
                    showToast(`Produto "${prod.name}" excluído.`);
                  } catch (err) {
                    showToast(`Erro ao excluir: ${err.message}`);
                  }
                }}
              >
                <Trash2 size={15} /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
