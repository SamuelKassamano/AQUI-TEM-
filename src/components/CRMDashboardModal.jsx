import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  BarChart3,
  Settings,
  RefreshCw,
  Save,
  Lock,
  Mail,
  Key,
  LogOut,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { sendAdminPasswordReset } from '../lib/crmService';

export default function CRMDashboardModal() {
  const {
    leads,
    analytics,
    webhookUrl,
    isCrmOpen,
    closeCRM,
    updateLeadStatus,
    deleteLead,
    saveWebhookUrl,
    refreshCRMData,
    isLoadingLeads,
    leadsError,
    tableMissingWarning
  } = useCRM();

  const [activeTab, setActiveTab] = useState('leads');
  const [webhook, setWebhook] = useState(webhookUrl || '');
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');

  // Sincroniza sessão do Supabase Auth
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured || !supabase) {
      setSession(null);
      setAuthChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      if (error || !data?.session?.user) {
        setSession(null);
      } else {
        setSession(data.session);
        refreshCRMData();
      }
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      if (currentSession?.user) {
        setSession(currentSession);
        refreshCRMData();
      } else {
        setSession(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [refreshCRMData]);

  useEffect(() => {
    if (webhookUrl) {
      setWebhook(webhookUrl);
    }
  }, [webhookUrl]);

  if (!isCrmOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setResetSuccess('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setAuthError('Preencha o e-mail e a palavra-passe do administrador.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setAuthError('Supabase Authentication não configurado.');
      return;
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password
      });

      if (error || !data?.session?.user) {
        setAuthError(
          error?.message?.toLowerCase().includes('invalid')
            ? 'Credenciais inválidas: e-mail ou palavra-passe incorretos no Supabase.'
            : error?.message || 'Falha na autenticação administrativa.'
        );
        return;
      }

      setSession(data.session);
      setPassword('');
      refreshCRMData();
    } catch (err) {
      setAuthError(err.message || 'Erro ao realizar login.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setAuthError('Digite o seu e-mail de administrador para recuperar a palavra-passe.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      await sendAdminPasswordReset(email.trim());
      setResetSuccess(`Instruções de redefinição enviadas para ${email.trim()}. Verifique a caixa de entrada.`);
    } catch (err) {
      setAuthError(err.message || 'Erro ao solicitar redefinição.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveWebhook = async () => {
    await saveWebhookUrl(webhook.trim());
    alert('Webhook salvo com sucesso!');
  };

  const statuses = [
    'Novo Lead',
    'Em Atendimento',
    'Venda Realizada',
    'Perdido',
    'Nutrição'
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}
      >
        {/* Header do Modal */}
        <div
          style={{
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #eee',
            background: '#fafafa'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F37021', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Lock size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111' }}>
                CRM & Gestão Comercial
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                AQUI TEM — Acesso Restrito a Administradores
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {session && (
              <span style={{ fontSize: '0.75rem', background: '#e6f4ea', color: '#137333', padding: '4px 8px', borderRadius: 6, fontWeight: 600 }}>
                {session.user?.email}
              </span>
            )}
            <button
              onClick={closeCRM}
              style={{
                border: 0,
                background: 'transparent',
                cursor: 'pointer',
                color: '#666',
                padding: '6px'
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Se NÃO autenticado -> Exige Login Seguro */}
        {!session ? (
          <div style={{ padding: '40px 24px', maxWidth: '440px', margin: 'auto', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(243, 112, 33, 0.1)', borderRadius: '50%', color: '#F37021', marginBottom: '12px' }}>
                <Lock size={32} />
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 700 }}>Área Administrativa Restrita</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                O CRM e a base de clientes são confidenciais. Inicie sessão com a sua conta de administrador no Supabase.
              </p>
            </div>

            {authError && (
              <div style={{ padding: '12px', background: '#fdeded', border: '1px solid #f5c2c7', borderRadius: '8px', color: '#d32f2f', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>{authError}</span>
              </div>
            )}

            {resetSuccess && (
              <div style={{ padding: '12px', background: '#e6f4ea', border: '1px solid #b7e1cd', borderRadius: '8px', color: '#137333', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <CheckCircle size={18} style={{ flexShrink: 0 }} />
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>E-mail Administrativo</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#888' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@aquitem.ao"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Palavra-passe</label>
                <div style={{ position: 'relative' }}>
                  <Key size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#888' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  background: '#F37021',
                  color: '#fff',
                  border: 0,
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {authLoading ? 'Verificando...' : 'Entrar no CRM'}
              </button>
            </form>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={authLoading}
                style={{ background: 'transparent', border: 0, color: '#1E5C9E', cursor: 'pointer', padding: 0 }}
              >
                Esqueceu a palavra-passe?
              </button>

              <a
                href="/admin"
                style={{ color: '#F37021', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Painel /admin <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ) : (
          /* Se Autenticado -> Exibe Conteúdo Completo do CRM */
          <>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '12px 24px',
                borderBottom: '1px solid #eee',
                background: '#fff',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('leads')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: activeTab === 'leads' ? '#F37021' : '#ddd',
                    background: activeTab === 'leads' ? '#fff5ee' : '#fff',
                    color: activeTab === 'leads' ? '#F37021' : '#444',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Users size={16} /> Leads ({leads.length})
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: activeTab === 'analytics' ? '#F37021' : '#ddd',
                    background: activeTab === 'analytics' ? '#fff5ee' : '#fff',
                    color: activeTab === 'analytics' ? '#F37021' : '#444',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <BarChart3 size={16} /> Analytics & Vendas
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: activeTab === 'settings' ? '#F37021' : '#ddd',
                    background: activeTab === 'settings' ? '#fff5ee' : '#fff',
                    color: activeTab === 'settings' ? '#F37021' : '#444',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Settings size={16} /> Automação
                </button>

                <button
                  onClick={refreshCRMData}
                  disabled={isLoadingLeads}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    background: '#fff',
                    color: '#444',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={16} className={isLoadingLeads ? 'animate-spin' : ''} />
                  Atualizar
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href="/admin?tab=crm"
                  style={{
                    fontSize: '0.8rem',
                    color: '#1E5C9E',
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    background: '#eef4fb',
                    borderRadius: 6
                  }}
                >
                  Painel Completo <ExternalLink size={13} />
                </a>

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #f5c2c7',
                    background: '#fff',
                    color: '#dc3545',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={14} /> Sair
                </button>
              </div>
            </div>

            {/* Aviso se tabela crm_leads não foi criada no Supabase ainda */}
            {tableMissingWarning && (
              <div style={{ margin: '16px 24px 0', padding: '12px 16px', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '8px', color: '#856404', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Atenção:</strong> A tabela <code>public.crm_leads</code> ainda não foi criada no seu Supabase. Execute o script <code>supabase_crm_schema.sql</code> no SQL Editor do Supabase para persistência permanente e regras RLS ativas.
                </span>
              </div>
            )}

            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {activeTab === 'leads' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                      Leads e Clientes ({leads.length})
                    </h3>
                  </div>

                  {leads.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#777', border: '2px dashed #eee', borderRadius: '12px' }}>
                      <Users size={40} style={{ opacity: 0.4, marginBottom: '8px' }} />
                      <p style={{ margin: 0 }}>Nenhum lead capturado ainda.</p>
                      <span style={{ fontSize: '0.8rem', color: '#999' }}>Quando clientes enviarem pedidos para o WhatsApp ou finalizarem compras, aparecerão aqui.</span>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '14px' }}>
                      {leads.map((lead) => (
                        <div
                          key={lead.id}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '16px',
                            background: '#fff',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '12px',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ fontSize: '1rem', color: '#111' }}>{lead.name}</strong>
                              <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#f1f5f9', borderRadius: 4, color: '#64748b' }}>
                                {lead.leadCode || 'LEAD'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '4px' }}>
                              📍 {lead.city || 'Luanda'} • {lead.address}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                              Data: {new Date(lead.createdAt).toLocaleString('pt-AO')}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E5C9E' }}>
                              📦 {lead.productName}
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F37021', marginTop: '2px' }}>
                              {Number(lead.totalValue).toLocaleString('pt-AO')} Kz
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                              Origem: {lead.trafficSource} ({lead.timeOnSite})
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>Status:</label>
                              <select
                                value={lead.status}
                                onChange={(e) =>
                                  updateLeadStatus(
                                    lead.id,
                                    e.target.value,
                                    'Atualizado no painel CRM'
                                  )
                                }
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  background: '#fff',
                                  cursor: 'pointer'
                                }}
                              >
                                {statuses.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                              {lead.phone && (
                                <a
                                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '6px 10px',
                                    background: '#25D366',
                                    color: '#fff',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    fontSize: '0.8rem',
                                    fontWeight: 700
                                  }}
                                >
                                  <MessageCircle size={14} /> WhatsApp ({lead.phone})
                                </a>
                              )}

                              <button
                                onClick={() => {
                                  if (confirm(`Deseja remover o lead de ${lead.name}?`)) {
                                    deleteLead(lead.id);
                                  }
                                }}
                                title="Eliminar lead"
                                style={{
                                  padding: '6px 8px',
                                  background: '#fff',
                                  border: '1px solid #fecdd3',
                                  borderRadius: '6px',
                                  color: '#e11d48',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '20px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total de Visitas</span>
                      <h4 style={{ margin: '8px 0 0', fontSize: '1.8rem', color: '#1e293b' }}>{analytics.totalVisits}</h4>
                    </div>

                    <div style={{ padding: '20px', borderRadius: '12px', background: '#fff5ee', border: '1px solid #ffd8be' }}>
                      <span style={{ fontSize: '0.85rem', color: '#c2410c' }}>Leads Capturados</span>
                      <h4 style={{ margin: '8px 0 0', fontSize: '1.8rem', color: '#ea580c' }}>{leads.length || analytics.totalLeads}</h4>
                    </div>

                    <div style={{ padding: '20px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <span style={{ fontSize: '0.85rem', color: '#15803d' }}>Vendas Concluídas</span>
                      <h4 style={{ margin: '8px 0 0', fontSize: '1.8rem', color: '#16a34a' }}>
                        {leads.filter(l => l.status === 'Venda Realizada').length}
                      </h4>
                    </div>

                    <div style={{ padding: '20px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                      <span style={{ fontSize: '0.85rem', color: '#1d4ed8' }}>Volume em Pipeline</span>
                      <h4 style={{ margin: '8px 0 0', fontSize: '1.4rem', color: '#2563eb' }}>
                        {leads.reduce((sum, l) => sum + (Number(l.totalValue) || 0), 0).toLocaleString('pt-AO')} Kz
                      </h4>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '1rem' }}>Origem dos Acessos</h4>
                    {Object.entries(analytics.sources || {}).length === 0 ? (
                      <p style={{ color: '#888', fontSize: '0.85rem' }}>Nenhum dado de origem registrado ainda.</p>
                    ) : (
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {Object.entries(analytics.sources || {}).map(([source, val]) => (
                          <div key={source} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: 6, fontSize: '0.85rem' }}>
                            <span>{source}</span>
                            <strong>{val}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div style={{ maxWidth: '600px' }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Automação & Integração de Webhook</h3>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>
                    Configure uma URL de webhook (n8n, Make, Zapier, Google Sheets) para receber notificações instantâneas a cada novo lead capturado no site.
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>URL de Destino HTTP (POST)</label>
                    <input
                      type="url"
                      value={webhook}
                      onChange={(e) => setWebhook(e.target.value)}
                      placeholder="https://seu-n8n.com/webhook/aquitem-leads"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <button
                    onClick={handleSaveWebhook}
                    style={{
                      padding: '10px 18px',
                      background: '#1E5C9E',
                      color: '#fff',
                      border: 0,
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Save size={16} /> Salvar Configuração
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}