import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Search,
  CheckCircle,
  Clock,
  Truck,
  ShieldCheck,
  CreditCard,
  MapPin,
  MessageCircle,
  Bell,
  BellRing,
  ShoppingBag,
  User,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Mail,
  Phone,
  AlertTriangle,
  FileText,
  Upload
} from 'lucide-react';

import Layout from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';
import { uploadReceiptDocument } from '../lib/supabase';
import {
  getLocalOrders,
  findOrder,
  trackOrderOnline,
  getSavedCustomerProfile,
  saveCustomerProfile,
  getAbandonedCart,
  clearAbandonedCart,
  attachPaymentReceipt,
  updateOrderStatus,
  fetchReceiptSignedUrl
} from '../utils/customerOrders';
import { syncBrevoContact } from '../lib/brevoService';
import {
  getNotificationFeed,
  getNotificationPrefs,
  saveNotificationPrefs,
  requestBrowserNotificationPermission,
  trackAndSubscribeVisitor
} from '../utils/notificationSystem';

export default function CustomerAreaPage() {
  const { lang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen, formatPriceKz } = useStore();

  // Abas: rastreio | historico | carrinho | perfil | notificacoes
  const [activeTab, setActiveTab] = useState('rastreio');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [receiptSuccessMsg, setReceiptSuccessMsg] = useState('');

  // Perfil do Cliente
  const [profile, setProfile] = useState(() => {
    return getSavedCustomerProfile() || {
      name: '',
      phone: '',
      email: '',
      address: '',
      city: 'Luanda'
    };
  });
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Lista de Encomendas
  const [orders, setOrders] = useState([]);

  // Carrinho Abandonado
  const [abandonedCart, setAbandonedCart] = useState(null);

  // Notificações
  const [notifications, setNotifications] = useState([]);
  const [notifPrefs, setNotifPrefs] = useState(() => getNotificationPrefs());
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribePhone, setSubscribePhone] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Área do Cliente & Rastreio de Encomendas — AQUI TEM Angola';

    const localOrders = getLocalOrders();
    setOrders(localOrders);

    const savedCart = getAbandonedCart();
    setAbandonedCart(savedCart);

    const notifs = getNotificationFeed();
    setNotifications(notifs);

    // Se houver query param "?tracking=AQT-XXXX" ou "?tab=..."
    const params = new URLSearchParams(location.search);
    const trackingCode = params.get('tracking');
    const tabParam = params.get('tab');

    if (tabParam && ['rastreio', 'historico', 'carrinho', 'perfil', 'notificacoes'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    if (trackingCode) {
      setSearchQuery(trackingCode);
      const found = findOrder(trackingCode);
      if (found) {
        setSelectedOrder(found);
        setActiveTab('rastreio');
      }

      // Consulta de estado actualizado online em background
      trackOrderOnline(trackingCode)
        .then(remoteOrder => {
          setSelectedOrder(remoteOrder);
          setActiveTab('rastreio');
          setOrders(getLocalOrders());
        })
        .catch(() => {});
    } else if (localOrders.length > 0) {
      // Abre a encomenda mais recente por padrão
      setSelectedOrder(localOrders[0]);
    }
  }, [location.search]);

  // Pesquisar encomenda
  const handleSearchOrder = async (e) => {
    e?.preventDefault();
    setSearchError('');

    const query = searchQuery.trim();
    if (!query) {
      setSearchError('Por favor, digite o código da encomenda (ex: AQT-1234) ou número de rastreio (ex: AQT-TRK-1234).');
      return;
    }

    // 1. Tenta carregar do cache local imediatamente
    const local = findOrder(query);
    if (local) {
      setSelectedOrder(local);
    }

    setIsSearching(true);
    try {
      // 2. Consulta online autorizada e sincroniza estado oficial
      const order = await trackOrderOnline(query);
      setSelectedOrder(order);
      setOrders(getLocalOrders());
      setSearchError('');
    } catch (err) {
      if (!local) {
        setSearchError(err.message || `Nenhuma encomenda encontrada com "${query}". Verifique o código recebido no WhatsApp ou e-mail.`);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Salvar alterações de perfil
  const handleSaveProfile = (e) => {
    e.preventDefault();
    saveCustomerProfile(profile);
    setProfileSavedMsg(true);

    // Sincronizar dados actualizados com o Brevo em background
    if (profile.email && profile.email.includes('@')) {
      syncBrevoContact({
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        city: profile.city,
        address: profile.address,
        marketingConsent: Boolean(profile.marketingConsent)
      }).catch(() => { });
    }

    setTimeout(() => setProfileSavedMsg(false), 3000);
  };

  // Recuperar carrinho abandonado
  const handleRecoverCart = () => {
    if (!abandonedCart || !abandonedCart.items) return;
    abandonedCart.items.forEach(item => {
      addToCart(item, item.quantity || 1);
    });
    clearAbandonedCart();
    setAbandonedCart(null);
    setIsCartOpen(true);
  };

  // Subscrição rápida de notificações / rastreio de visitante
  const handleSubscribeAlerts = async (e) => {
    e.preventDefault();
    if (!subscribeEmail && !subscribePhone) return;

    await trackAndSubscribeVisitor({
      name: profile.name || 'Cliente VIP',
      email: subscribeEmail,
      phone: subscribePhone,
      source: 'area_do_cliente'
    });

    setSubscribeSuccess(true);
    setNotifications(getNotificationFeed());
    setTimeout(() => setSubscribeSuccess(false), 4000);
  };

  // Pedir permissão de notificações push
  const handleEnablePush = async () => {
    const res = await requestBrowserNotificationPermission();
    setNotifPrefs(getNotificationPrefs());
  };

  const [openingReceipt, setOpeningReceipt] = useState(false);

  // Visualização Segura do Comprovativo (Exclusivamente via Backend Signed URL)
  const handleViewReceipt = async (order) => {
    if (!order) return;
    try {
      setOpeningReceipt(true);
      const res = await fetchReceiptSignedUrl({
        orderCode: order.id,
        receiptToken: order.receiptToken
      });
      if (res?.signedUrl) {
        window.open(res.signedUrl, '_blank', 'noopener,noreferrer');
        return;
      }
    } catch (_err) {
      if (order.receiptUrl) {
        window.open(order.receiptUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      alert('Não foi possível gerar um URL assinado seguro para este comprovativo.');
    } finally {
      setOpeningReceipt(false);
    }
  };

  return (
    <Layout>
      <div className="client-portal-wrapper" style={{ background: '#07090e', color: '#ffffff', minHeight: '85vh', padding: '36px 16px 64px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Header da Área do Cliente */}
          <div
            className="client-portal-header"
            style={{
              background: 'linear-gradient(135deg, #0d121f 0%, #080c14 100%)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '28px',
              marginBottom: '28px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px'
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#ff8a3d',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                <Sparkles size={13} color="#ff6500" /> Portal Oficial do Cliente • AQUI TEM Angola
              </div>
              <h1 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                Área do Cliente & Rastreamento
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '6px', maxWidth: '620px', lineHeight: '1.5' }}>
                Consulte em tempo real o estado de confirmação e rota da sua encomenda, recupere o seu carrinho e acompanhe o histórico de compras com garantia oficial.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href="https://wa.me/244950752933?text=Ol%C3%A1%20AQUI%20TEM!%20Preciso%20de%20ajuda%20com%20o%20rastreio%20do%20meu%20pedido."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#22c55e',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <MessageCircle size={16} /> Suporte WhatsApp (+244 950 752 933)
              </a>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '12px',
              marginBottom: '24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <button
              onClick={() => setActiveTab('rastreio')}
              style={{
                background: activeTab === 'rastreio' ? '#ff6500' : 'rgba(255, 255, 255, 0.04)',
                color: '#ffffff',
                border: activeTab === 'rastreio' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <Truck size={16} /> Rastrear Encomenda
            </button>

            <button
              onClick={() => setActiveTab('historico')}
              style={{
                background: activeTab === 'historico' ? '#ff6500' : 'rgba(255, 255, 255, 0.04)',
                color: '#ffffff',
                border: activeTab === 'historico' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <Package size={16} /> Histórico de Compras ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('carrinho')}
              style={{
                background: activeTab === 'carrinho' ? '#ff6500' : 'rgba(255, 255, 255, 0.04)',
                color: '#ffffff',
                border: activeTab === 'carrinho' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                position: 'relative'
              }}
            >
              <ShoppingBag size={16} /> Recuperação de Carrinho
              {abandonedCart?.items?.length > 0 && (
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff6500', display: 'inline-block' }} />
              )}
            </button>

            <button
              onClick={() => setActiveTab('perfil')}
              style={{
                background: activeTab === 'perfil' ? '#ff6500' : 'rgba(255, 255, 255, 0.04)',
                color: '#ffffff',
                border: activeTab === 'perfil' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <User size={16} /> Dados Pessoais
            </button>

            <button
              onClick={() => setActiveTab('notificacoes')}
              style={{
                background: activeTab === 'notificacoes' ? '#ff6500' : 'rgba(255, 255, 255, 0.04)',
                color: '#ffffff',
                border: activeTab === 'notificacoes' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <Bell size={16} /> Notificações & Alertas
            </button>
          </div>

          {/* ========================================================= */}
          {/* ABA 1: RASTREAR ENCOMENDA                                 */}
          {/* ========================================================= */}
          {activeTab === 'rastreio' && (
            <div style={{ display: 'grid', gap: '24px' }}>

              {/* Caixa de Busca */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '20px'
                }}
              >
                <form onSubmit={handleSearchOrder} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: '1 1 300px' }}>
                    <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Insira o Código da Encomenda (ex: AQT-1234), E-mail ou Telemóvel..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      background: '#ff6500',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Search size={16} /> Consultar Pedido
                  </button>
                </form>

                {searchError && (
                  <div style={{ color: '#ef4444', fontSize: '0.84rem', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} /> {searchError}
                  </div>
                )}
              </div>

              {/* Detalhe da Encomenda Selecionada */}
              {selectedOrder ? (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #0d121f 0%, #07090e 100%)',
                    borderRadius: '18px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '28px',
                    position: 'relative'
                  }}
                >
                  {/* Status Banner */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                      paddingBottom: '20px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      marginBottom: '24px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Código da Encomenda & Rastreio Oficial
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.04em' }}>
                        #{selectedOrder.id}
                      </div>
                      {selectedOrder.trackingNumber && (
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ff8a3d', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Truck size={15} /> Número de Rastreio: <span>{selectedOrder.trackingNumber}</span>
                        </div>
                      )}
                      <div style={{ color: '#cbd5e1', fontSize: '0.82rem', marginTop: '4px' }}>
                        Data da Encomenda: <strong>{new Date(selectedOrder.createdAt).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          background: selectedOrder.status === 'Aguardando Pagamento'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : selectedOrder.status === 'Comprovativo Recebido' || selectedOrder.status === 'Pendente de Confirmação'
                            ? 'rgba(59, 130, 246, 0.15)'
                            : selectedOrder.status === 'Em Preparação'
                            ? 'rgba(168, 85, 247, 0.15)'
                            : 'rgba(34, 197, 94, 0.15)',
                          color: selectedOrder.status === 'Aguardando Pagamento'
                            ? '#f59e0b'
                            : selectedOrder.status === 'Comprovativo Recebido' || selectedOrder.status === 'Pendente de Confirmação'
                            ? '#60a5fa'
                            : selectedOrder.status === 'Em Preparação'
                            ? '#c084fc'
                            : '#22c55e',
                          border: `1px solid ${
                            selectedOrder.status === 'Aguardando Pagamento'
                              ? 'rgba(245, 158, 11, 0.35)'
                              : selectedOrder.status === 'Comprovativo Recebido' || selectedOrder.status === 'Pendente de Confirmação'
                              ? 'rgba(59, 130, 246, 0.35)'
                              : selectedOrder.status === 'Em Preparação'
                              ? 'rgba(168, 85, 247, 0.35)'
                              : 'rgba(34, 197, 94, 0.35)'
                          }`,
                          padding: '6px 14px',
                          borderRadius: '9999px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <CheckCircle size={14} /> {selectedOrder.statusLabel || selectedOrder.status || 'Aguardando Pagamento'}
                      </span>
                      {selectedOrder.paymentConfirmedAt && (
                        <div style={{ color: '#22c55e', fontSize: '0.82rem', marginTop: '6px', fontWeight: 600 }}>
                          ✓ Pagamento Confirmado em: {new Date(selectedOrder.paymentConfirmedAt).toLocaleDateString('pt-AO')}
                        </div>
                      )}
                      <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '6px' }}>
                        Data Prevista de Entrega: <strong style={{ color: '#ffffff' }}>{selectedOrder.estimatedDeliveryDate || selectedOrder.deliveryZone?.estimatedTime || '3 dias úteis'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 🟢 ROTA DESBLOQUEADA (Apenas no estado "Em Rota", nunca em "Encomenda Agendada") */}
                  {(selectedOrder.status === 'Em Rota' || selectedOrder.status === 'rota') && selectedOrder.driver && (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.14) 0%, rgba(16, 185, 129, 0.06) 100%)',
                        border: '1px solid #22c55e',
                        borderRadius: '16px',
                        padding: '20px',
                        marginBottom: '26px',
                        boxShadow: '0 0 25px rgba(34, 197, 94, 0.22)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#22c55e', fontWeight: 800, fontSize: '1rem', marginBottom: '8px' }}>
                        <Truck size={22} /> 🟢 ROTA DE ENTREGA DESBLOQUEADA EM TEMPO RECORDE!
                      </div>
                      <p style={{ color: '#e2e8f0', fontSize: '0.86rem', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                        O pagamento foi confirmado e a sua encomenda já se encontra na viatura em rota prioritária para o endereço indicado.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px', background: 'rgba(0, 0, 0, 0.35)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Motorista Responsável</div>
                          <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem', marginTop: '2px' }}>{selectedOrder.driver?.driverName || 'Mateus Domingos'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Viatura Express</div>
                          <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem', marginTop: '2px' }}>{selectedOrder.driver?.vehicle || 'Toyota Starlet Prata (LD-44-82-AO)'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Previsão de Chegada</div>
                          <div style={{ color: '#22c55e', fontWeight: 800, fontSize: '0.92rem', marginTop: '2px' }}>{selectedOrder.driver?.estimatedArrival || selectedOrder.deliveryZone?.estimatedTime || 'Hoje (Tempo Recorde)'}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <a
                            href={`tel:${selectedOrder.driver?.driverPhone?.replace(/\s+/g, '') || '+244924812345'}`}
                            style={{ background: '#22c55e', color: '#ffffff', textDecoration: 'none', padding: '7px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                          >
                            <Phone size={13} /> Ligar ao Motorista
                          </a>
                          <a
                            href={`https://wa.me/${(selectedOrder.driver?.driverPhone || '244924812345').replace(/\D/g, '')}?text=Ol%C3%A1%20motorista%20da%20AQUI%20TEM,%20sou%20o%20cliente%20da%20encomenda%20%23${selectedOrder.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', textDecoration: 'none', padding: '7px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                          >
                            <MessageCircle size={13} color="#22c55e" /> WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5-Step Visual Timeline */}
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} color="#ff6500" /> Linha do Tempo da Encomenda (Passo a Passo)
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      {selectedOrder.timeline.map((step, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: step.completed ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                            border: step.completed ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '12px',
                            padding: '14px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <div
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: step.completed ? '#22c55e' : 'rgba(255, 255, 255, 0.1)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.72rem',
                                fontWeight: 800
                              }}
                            >
                              {step.completed ? '✓' : step.step}
                            </div>
                            <span style={{ fontSize: '0.74rem', color: step.completed ? '#22c55e' : '#94a3b8', fontWeight: 700 }}>
                              Passo {step.step}
                            </span>
                          </div>
                          <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.82rem', marginBottom: '4px' }}>
                            {step.title}
                          </div>
                          <div style={{ color: '#cbd5e1', fontSize: '0.74rem', lineHeight: '1.4' }}>
                            {step.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumo da Encomenda & Morada */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

                    {/* Lista de Itens */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                        Artigos Encomendados
                      </div>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', background: '#ffffff' }}
                              onError={(e) => { e.currentTarget.src = '/logo.jpg'; }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ color: '#ffffff', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.name}
                              </div>
                              <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>
                                Quantidade: {item.quantity} • {formatPriceKz(item.price, lang)} un.
                              </div>
                            </div>
                            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.84rem' }}>
                              {formatPriceKz(item.price * item.quantity, lang)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Totais: Sem subtotal de artigos, taxa de transporte (mínimo 3.000 Kz) e total final */}
                      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.84rem', display: 'grid', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff8a3d' }}>
                          <span>Taxa de Transporte ({selectedOrder.deliveryZone?.shortName || selectedOrder.deliveryZone?.name || 'Entrega'}):</span>
                          <span style={{ fontWeight: 700 }}>{formatPriceKz(Math.max(Number(selectedOrder.deliveryFee) || 3000, 3000), lang)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff', fontWeight: 800, fontSize: '1.05rem', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <span>Total da Compra:</span>
                          <span style={{ color: '#22c55e' }}>{formatPriceKz(selectedOrder.total, lang)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dados de Entrega & Pagamento */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                        Dados do Destinatário & Despacho
                      </div>
                      <div style={{ display: 'grid', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                        <div>
                          <strong style={{ color: '#94a3b8' }}>Nome:</strong> <span style={{ color: '#ffffff' }}>{selectedOrder.customer?.name}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#94a3b8' }}>Telemóvel:</strong> <span style={{ color: '#ffffff' }}>{selectedOrder.customer?.phone}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#94a3b8' }}>E-mail:</strong> <span style={{ color: '#ffffff' }}>{selectedOrder.customer?.email}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#94a3b8' }}>Morada:</strong> <span style={{ color: '#ffffff' }}>{selectedOrder.customer?.address}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#94a3b8' }}>Província / Zona:</strong> <span style={{ color: '#ffffff' }}>{selectedOrder.deliveryZone?.name}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#94a3b8' }}>Método de Pagamento:</strong> <span style={{ color: '#ff8a3d' }}>{selectedOrder.paymentMethod}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#94a3b8' }}>Estado do Pagamento:</strong>{' '}
                          <span style={{ color: selectedOrder.paymentConfirmedAt ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>
                            {selectedOrder.paymentConfirmedAt ? 'Pagamento Confirmado' : (selectedOrder.receiptFileName || selectedOrder.receiptStoragePath ? 'Comprovativo Recebido / Em Validação' : 'Aguardando Pagamento')}
                          </span>
                        </div>
                      </div>

                      {selectedOrder.receiptFileName && (
                        <div style={{ marginTop: '14px', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} color="#22c55e" /> Comprovativo anexado: <strong style={{ color: '#ffffff' }}>{selectedOrder.receiptFileName}</strong>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Package size={48} color="#94a3b8" style={{ marginBottom: '14px' }} />
                  <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '6px' }}>Nenhuma Encomenda Selecionada</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.86rem', maxWidth: '440px', margin: '0 auto 16px' }}>
                    Digite acima o código do seu pedido (ex: AQT-1234) ou telefone para consultar a timeline completa de entrega.
                  </p>
                  <Link to="/produtos" style={{ background: '#ff6500', color: '#ffffff', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    Explorar Catálogo <ArrowRight size={15} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 2: HISTÓRICO DE COMPRAS                               */}
          {/* ========================================================= */}
          {activeTab === 'historico' && (
            <div>
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <ShoppingBag size={48} color="#94a3b8" style={{ marginBottom: '14px' }} />
                  <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '6px' }}>Ainda não tem compras registradas neste dispositivo</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.86rem', maxWidth: '440px', margin: '0 auto 16px' }}>
                    Assim que concluir uma encomenda pelo carrinho ou WhatsApp, todo o histórico ficará salvo aqui com faturas e garantias.
                  </p>
                  <Link to="/produtos" style={{ background: '#ff6500', color: '#ffffff', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.86rem' }}>
                    Fazer Primeira Compra
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {orders.map((ord, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '14px',
                        padding: '20px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>#{ord.id}</span>
                          <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                            {ord.statusLabel || 'Registado'}
                          </span>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                          Data: {new Date(ord.createdAt).toLocaleDateString('pt-AO')} • {ord.items.length} artigo(s) • Destino: {ord.deliveryZone?.shortName}
                        </div>
                        <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem', marginTop: '6px' }}>
                          Total: <span style={{ color: '#22c55e' }}>{formatPriceKz(ord.total, lang)}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setActiveTab('rastreio');
                          }}
                          style={{
                            background: '#ff6500',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Truck size={14} /> Rastrear ao Vivo
                        </button>
                        <a
                          href={`https://wa.me/244950752933?text=Ol%C3%A1%20AQUI%20TEM!%20Gostaria%20de%20consultar%20a%20minha%20encomenda%20%23${ord.id}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: '#ffffff',
                            textDecoration: 'none',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <MessageCircle size={14} /> Falar com Suporte
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 3: RECUPERAÇÃO DE CARRINHO                            */}
          {/* ========================================================= */}
          {activeTab === 'carrinho' && (
            <div
              style={{
                background: 'linear-gradient(135deg, #0d121f 0%, #07090e 100%)',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '28px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <ShoppingBag size={20} color="#ff6500" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Recuperação Automática de Carrinho
                </h3>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.86rem', lineHeight: '1.5', maxWidth: '640px', marginBottom: '22px' }}>
                Se teve de interromper uma compra ou fechar a janela, o nosso sistema inteligente guarda os seus produtos reservados para não perder o stock oficial.
              </p>

              {abandonedCart && abandonedCart.items?.length > 0 ? (
                <div>
                  <div style={{ background: 'rgba(255, 101, 0, 0.08)', border: '1px solid rgba(255, 101, 0, 0.2)', padding: '14px 18px', borderRadius: '12px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ color: '#ff8a3d', fontWeight: 700, fontSize: '0.9rem' }}>
                        Encontrámos {abandonedCart.items.length} produto(s) pendente(s) da sua última visita!
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.78rem' }}>
                        Guardado em: {new Date(abandonedCart.savedAt).toLocaleDateString('pt-AO')} às {new Date(abandonedCart.savedAt).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <button
                      onClick={handleRecoverCart}
                      style={{
                        background: '#ff6500',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 22px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <RefreshCw size={15} /> Restaurar Carrinho & Finalizar
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: '10px' }}>
                    {abandonedCart.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={item.image || item.image_url || '/logo.jpg'} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.84rem' }}>{item.name}</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.76rem' }}>Quantidade: {item.quantity || 1}</div>
                          </div>
                        </div>
                        <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.88rem' }}>
                          {formatPriceKz(item.price * (item.quantity || 1), lang)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                  <CheckCircle size={40} color="#22c55e" style={{ marginBottom: '10px' }} />
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                    Não tem carrinhos pendentes!
                  </div>
                  <div style={{ fontSize: '0.84rem' }}>
                    Todas as suas escolhas anteriores foram concluídas ou o seu carrinho está limpo.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 4: DADOS PESSOAIS & MORADA                            */}
          {/* ========================================================= */}
          {activeTab === 'perfil' && (
            <div
              style={{
                background: 'linear-gradient(135deg, #0d121f 0%, #07090e 100%)',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '28px',
                maxWidth: '680px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <User size={20} color="#ff6500" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Dados Pessoais & Morada de Entrega
                </h3>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.86rem', marginBottom: '20px', lineHeight: '1.5' }}>
                Mantenha os seus dados atualizados para agilizar futuras encomendas e receber as notificações oficiais no seu telemóvel e e-mail.
              </p>

              <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Ex: Samuel Kassamano"
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>Telemóvel / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="Ex: +244 950 752 933"
                      style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>E-mail Oficial (Notificações & Fatura) *</label>
                    <input
                      type="email"
                      required
                      value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                      placeholder="Ex: cliente@gmail.com"
                      style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>Morada Habitual em Angola *</label>
                  <input
                    type="text"
                    required
                    value={profile.address}
                    onChange={e => setProfile({ ...profile, address: e.target.value })}
                    placeholder="Bairro, Rua, Edifício, Ponto de Referência"
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>Província / Cidade *</label>
                  <input
                    type="text"
                    required
                    value={profile.city}
                    onChange={e => setProfile({ ...profile, city: e.target.value })}
                    placeholder="Ex: Luanda"
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                  <button
                    type="submit"
                    style={{
                      background: '#ff6500',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 28px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    Guardar Dados Pessoais
                  </button>

                  {profileSavedMsg && (
                    <span style={{ color: '#22c55e', fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={15} /> Dados guardados com sucesso!
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 5: NOTIFICAÇÕES & RASTREAMENTO                        */}
          {/* ========================================================= */}
          {activeTab === 'notificacoes' && (
            <div style={{ display: 'grid', gap: '24px' }}>

              {/* Card de Configuração de Notificações */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0d121f 0%, #07090e 100%)',
                  borderRadius: '18px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '24px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div>
                    <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BellRing size={18} color="#ff6500" /> Notificações do Navegador & Alertas VIP
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>
                      Receba avisos instantâneos quando a sua encomenda mudar de estado ou novos produtos Oraimo chegarem.
                    </div>
                  </div>

                  <button
                    onClick={handleEnablePush}
                    style={{
                      background: notifPrefs.browserPush ? 'rgba(34, 197, 94, 0.15)' : '#ff6500',
                      color: notifPrefs.browserPush ? '#22c55e' : '#ffffff',
                      border: notifPrefs.browserPush ? '1px solid rgba(34, 197, 94, 0.3)' : 'none',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Bell size={15} /> {notifPrefs.browserPush ? 'Notificações Ativas ✓' : 'Ativar Notificações no Navegador'}
                  </button>
                </div>

                {/* Subscrição de E-mail / Telemóvel para Rastreio */}
                <form onSubmit={handleSubscribeAlerts} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                    Subscrever Alertas de Novos Produtos, Promoções e Stock Limitado:
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <input
                      type="email"
                      placeholder="O seu melhor e-mail..."
                      value={subscribeEmail}
                      onChange={e => setSubscribeEmail(e.target.value)}
                      style={{ flex: '1 1 200px', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <input
                      type="tel"
                      placeholder="Telemóvel / WhatsApp..."
                      value={subscribePhone}
                      onChange={e => setSubscribePhone(e.target.value)}
                      style={{ flex: '1 1 180px', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <button
                      type="submit"
                      style={{
                        background: '#ff6500',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Subscrever Alertas
                    </button>
                  </div>
                  {subscribeSuccess && (
                    <div style={{ color: '#22c55e', fontSize: '0.82rem', marginTop: '8px', fontWeight: 700 }}>
                      ✓ Subscrição ativada! Você receberá novidades e alertas prioritários.
                    </div>
                  )}
                </form>
              </div>

              {/* Feed de Notificações */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '18px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '24px'
                }}
              >
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} color="#ff6500" /> Histórico de Notificações da Loja
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {notifications.map((notif, idx) => (
                    <div
                      key={notif.id || idx}
                      style={{
                        background: notif.isUnread ? 'rgba(255, 101, 0, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                        border: notif.isUnread ? '1px solid rgba(255, 101, 0, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '14px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ flex: '1 1 300px' }}>
                        <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.86rem', marginBottom: '2px' }}>
                          {notif.title}
                        </div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.78rem', lineHeight: '1.4' }}>
                          {notif.message}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '4px' }}>
                          {notif.date}
                        </div>
                      </div>

                      {notif.link && (
                        <Link
                          to={notif.link}
                          style={{
                            color: '#ff8a3d',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Ver Detalhes <ArrowRight size={13} />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
