import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Copy,
  ExternalLink,
  ShieldCheck,
  FileText,
  Settings,
  HelpCircle,
  Check,
  AlertCircle,
  ArrowRight,
  Code
} from 'lucide-react';
import {
  fetchBrevoEmailStats,
  fetchBrevoTemplates,
  saveBrevoTemplates,
  sendBrevoTestEmail,
  resendBrevoEmail,
  getBrevoNotificationLog
} from '../../lib/brevoService';

export default function EmailManagementManager({
  leads = [],
  session = null,
  formatPriceKz = (v) => `${Number(v || 0).toLocaleString('pt-AO')} Kz`,
  showToast = () => {}
}) {
  // Navegação por abas: dashboard | history | templates | test | webhook
  const [activeTab, setActiveTab] = useState('dashboard');

  // Estados dos dados
  const [stats, setStats] = useState({
    totalSent: 0,
    totalDelivered: 0,
    totalPending: 0,
    totalFailed: 0,
    totalBounced: 0,
    totalOpened: 0,
    openRate: '0.0%'
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [canonicalTemplates, setCanonicalTemplates] = useState({});
  const [customTemplates, setCustomTemplates] = useState({});
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('order_confirmation');
  const [editedSubject, setEditedSubject] = useState('');
  const [editedCustomMessage, setEditedCustomMessage] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateSaveSuccess, setTemplateSaveSuccess] = useState(false);

  // Histórico e Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // Teste de Envio
  const [testEmail, setTestEmail] = useState('');
  const [testTemplate, setTestTemplate] = useState('order_confirmation');
  const [testSubject, setTestSubject] = useState('');
  const [testCustomMessage, setTestCustomMessage] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Reenvio
  const [resendingLogId, setResendingLogId] = useState(null);
  const [resendResult, setResendResult] = useState(null);

  // Webhook URL
  const webhookUrl = 'https://essjwjbtzytefycjodgh.supabase.co/functions/v1/brevo-api';
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // ---------------------------------------------------------------------------
  // CARREGAMENTO DE DADOS INICIAIS
  // ---------------------------------------------------------------------------
  const loadData = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const [statsRes, tmplRes] = await Promise.all([
        fetchBrevoEmailStats(),
        fetchBrevoTemplates()
      ]);

      if (statsRes?.stats) {
        setStats(statsRes.stats);
      }

      if (tmplRes?.canonicalTemplates) {
        setCanonicalTemplates(tmplRes.canonicalTemplates);
        setCustomTemplates(tmplRes.customTemplates || {});

        const initialKey = selectedTemplateKey || 'order_confirmation';
        const defaultSubj = tmplRes.customTemplates?.[initialKey]?.subject || tmplRes.canonicalTemplates?.[initialKey]?.defaultSubject || '';
        const defaultMsg = tmplRes.customTemplates?.[initialKey]?.customMessage || '';
        setEditedSubject(defaultSubj);
        setEditedCustomMessage(defaultMsg);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do módulo de e-mails:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, [selectedTemplateKey]);

  useEffect(() => {
    loadData();
  }, []);

  // Sincroniza formulário ao mudar de modelo
  const handleSelectTemplate = (key) => {
    setSelectedTemplateKey(key);
    const sub = customTemplates?.[key]?.subject || canonicalTemplates?.[key]?.defaultSubject || '';
    const msg = customTemplates?.[key]?.customMessage || '';
    setEditedSubject(sub);
    setEditedCustomMessage(msg);
    setTemplateSaveSuccess(false);
  };

  // Guardar alterações ao modelo
  const handleSaveTemplate = async () => {
    setIsSavingTemplate(true);
    setTemplateSaveSuccess(false);

    try {
      const updated = {
        ...customTemplates,
        [selectedTemplateKey]: {
          subject: editedSubject.trim(),
          customMessage: editedCustomMessage.trim(),
          updatedAt: new Date().toISOString()
        }
      };

      const res = await saveBrevoTemplates(updated);
      if (res.success) {
        setCustomTemplates(updated);
        setTemplateSaveSuccess(true);
        setTimeout(() => setTemplateSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Erro ao guardar modelo:', err);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Executar disparo de teste
  const handleSendTestEmail = async (e) => {
    e?.preventDefault();
    if (!testEmail || !testEmail.includes('@')) {
      alert('Por favor, introduza um e-mail válido para o teste.');
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await sendBrevoTestEmail({
        to: testEmail,
        templateType: testTemplate,
        customSubject: testSubject,
        customMessage: testCustomMessage
      });
      setTestResult(res);
      loadData();
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Reenviar e-mail
  const handleResend = async (logItem) => {
    if (!confirm(`Deseja reenviar o e-mail "${logItem.subject}" para ${logItem.to}?`)) return;

    setResendingLogId(logItem.id);
    setResendResult(null);

    try {
      const res = await resendBrevoEmail({
        logId: logItem.id,
        to: logItem.to,
        templateType: logItem.templateType,
        orderData: logItem.payload?.orderData
      });
      setResendResult({ logId: logItem.id, ...res });
      loadData();
    } catch (err) {
      setResendResult({ logId: logItem.id, success: false, error: err.message });
    } finally {
      setResendingLogId(null);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // ---------------------------------------------------------------------------
  // COMBINAÇÃO E NORMALIZAÇÃO DO HISTÓRICO DE E-MAILS
  // ---------------------------------------------------------------------------
  const emailHistory = useMemo(() => {
    const localLogs = getBrevoNotificationLog();
    const historyList = [];

    // 1. Mensagens dos leads existentes (ex: Sr. Marculino)
    (leads || []).forEach(lead => {
      const hist = Array.isArray(lead.history) ? lead.history : [];
      const orderCode = lead.leadCode || lead.lead_code || `AQT-${String(lead.id).slice(0, 6)}`;
      const clientName = lead.name || 'Cliente';
      const clientEmail = lead.email || '';

      hist.forEach((entry, idx) => {
        if (entry.event === 'email_dispatch' || entry.event?.startsWith('email_')) {
          historyList.push({
            id: `lead-hist-${lead.id}-${idx}`,
            orderCode,
            leadId: lead.id,
            clientName,
            to: entry.recipient || clientEmail || 'Registado no sistema',
            subject: entry.subject || `Notificação: ${entry.template || 'Encomenda'}`,
            templateType: entry.template || entry.event.replace('email_', ''),
            timestamp: entry.sent_at || entry.date || lead.createdAt,
            messageId: entry.message_id || null,
            status: entry.event === 'email_delivered' ? 'DELIVERED' : (entry.event === 'email_opened' ? 'OPENED' : 'SENT'),
            error: entry.reason || null,
            payload: { orderData: { id: orderCode, customerEmail: clientEmail, recipientName: clientName } }
          });
        }
      });
    });

    // 2. Logs locais e de teste
    localLogs.forEach(log => {
      const orderData = log.payload?.orderData || {};
      const orderCode = orderData.id || log.payload?.customMessage ? 'TEST-AQT' : 'AQT-GERAL';
      historyList.push({
        id: log.id,
        orderCode,
        clientName: orderData.recipientName || (log.templateType?.startsWith('TEST_') ? 'Teste Administrador' : 'Cliente AQUI TEM'),
        to: log.to || '',
        subject: log.subject || `E-mail: ${log.templateType}`,
        templateType: log.templateType,
        timestamp: log.timestamp,
        messageId: log.messageId,
        status: log.status,
        error: log.error,
        payload: log.payload
      });
    });

    // Ordenação decrescente por data
    return historyList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [leads]);

  // Filtragem do Histórico
  const filteredHistory = useMemo(() => {
    return emailHistory.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        item.orderCode?.toLowerCase().includes(q) ||
        item.clientName?.toLowerCase().includes(q) ||
        item.to?.toLowerCase().includes(q) ||
        item.subject?.toLowerCase().includes(q) ||
        item.messageId?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'delivered' && (item.status === 'DELIVERED' || item.status === 'OPENED')) ||
        (statusFilter === 'opened' && item.status === 'OPENED') ||
        (statusFilter === 'sent' && (item.status === 'SENT' || item.status === 'SIMULATED')) ||
        (statusFilter === 'failed' && item.status === 'FAILED');

      const matchesType = typeFilter === 'all' || item.templateType?.includes(typeFilter);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [emailHistory, searchQuery, statusFilter, typeFilter]);

  // Template activo para edição e pré-visualização
  const currentTemplateMeta = canonicalTemplates[selectedTemplateKey] || {
    name: selectedTemplateKey,
    description: '',
    defaultSubject: '',
    variables: []
  };

  return (
    <div style={{ padding: '24px 0', minHeight: '80vh' }}>
      {/* -------------------------------------------------------------------- */}
      {/* CABEÇALHO DO MÓDULO */}
      {/* -------------------------------------------------------------------- */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
        background: 'var(--bg-card)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: '#FF6500',
              color: '#FFF',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mail size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Gestão de E-mails Transaccionais
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Centro de controlo Brevo: métricas em tempo real, auditoria forense de entregas e edição de modelos
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={loadData}
            disabled={isLoadingStats}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-body)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} className={isLoadingStats ? 'animate-spin' : ''} />
            Actualizar Dados
          </button>

          <button
            onClick={() => setActiveTab('test')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: '#FF6500',
              color: '#FFF',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Send size={15} />
            Disparar Teste Real
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* NAVEGAÇÃO INTERNA EM ABAS */}
      {/* -------------------------------------------------------------------- */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid var(--border-light)',
        marginBottom: '24px',
        overflowX: 'auto'
      }}>
        {[
          { key: 'dashboard', label: 'Dashboard & Métricas', icon: FileText },
          { key: 'history', label: `Histórico de Mensagens (${emailHistory.length})`, icon: Clock },
          { key: 'templates', label: 'Modelos Transaccionais (6)', icon: Settings },
          { key: 'test', label: 'Disparo de Teste', icon: Send },
          { key: 'webhook', label: 'Configuração do Webhook', icon: Code }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '3px solid #FF6500' : '3px solid transparent',
                color: isActive ? '#FF6500' : 'var(--text-muted)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* ABA 1: DASHBOARD & MÉTRICAS                                          */}
      {/* ==================================================================== */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Alerta de Segurança e Esclarecimento Brevo */}
          <div style={{
            background: 'rgba(30, 92, 158, 0.08)',
            border: '1px solid rgba(30, 92, 158, 0.25)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <ShieldCheck size={22} style={{ color: '#1E5C9E', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              <strong>Controlo Oficial de Auditoria & Segurança Transaccional:</strong>
              <div style={{ marginTop: '4px', color: 'var(--text-muted)' }}>
                A aceitação pelo Brevo (código HTTP 201 com <code>messageId</code>) confirma que o e-mail entrou na fila oficial de expedição. A confirmação de <strong>Entrega Efectiva</strong>, <strong>Abertura</strong> ou <strong>Devolução (Bounce)</strong> é actualizada automaticamente via Webhook e pela sincronização com a API SMTP do Brevo. As credenciais nunca são expostas no navegador.
              </div>
            </div>
          </div>

          {/* 6 Indicadores em Tempo Real */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '28px'
          }}>
            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Enviados</span>
                <Send size={18} style={{ color: '#1E5C9E' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#1E5C9E' }}>
                {stats.totalSent}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mensagens despachadas</span>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Entregues</span>
                <CheckCircle2 size={18} style={{ color: '#10b981' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#10b981' }}>
                {stats.totalDelivered}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Confirmação na caixa de entrada</span>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pendentes</span>
                <Clock size={18} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#f59e0b' }}>
                {stats.totalPending}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Em trânsito nos relays</span>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Falhados</span>
                <XCircle size={18} style={{ color: '#ef4444' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#ef4444' }}>
                {stats.totalFailed}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>Recusados / Bloqueados</span>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Devolvidos (Bounces)</span>
                <AlertTriangle size={18} style={{ color: '#8b5cf6' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#8b5cf6' }}>
                {stats.totalBounced}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Caixa cheia ou inexistente</span>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Abertos</span>
                <Eye size={18} style={{ color: '#0284c7' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: '#0284c7' }}>
                {stats.totalOpened}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>Taxa de Abertura: {stats.openRate}</span>
            </div>
          </div>

          {/* Tabela Resumo dos Últimos Envios */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Últimas Mensagens Transaccionais</h3>
              <button
                onClick={() => setActiveTab('history')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FF6500',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Ver Histórico Completo <ArrowRight size={14} />
              </button>
            </div>

            {emailHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Nenhuma mensagem transaccional registada até ao momento. Dispare um teste ou finalize uma encomenda para visualizar.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 8px' }}>Código AQT</th>
                      <th style={{ padding: '10px 8px' }}>Cliente</th>
                      <th style={{ padding: '10px 8px' }}>E-mail</th>
                      <th style={{ padding: '10px 8px' }}>Assunto</th>
                      <th style={{ padding: '10px 8px' }}>Estado Real</th>
                      <th style={{ padding: '10px 8px' }}>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailHistory.slice(0, 5).map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 700, color: '#FF6500' }}>#{item.orderCode}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>{item.clientName}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{item.to}</td>
                        <td style={{ padding: '12px 8px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.subject}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: item.status === 'DELIVERED' || item.status === 'OPENED' ? 'rgba(16, 185, 129, 0.15)' : (item.status === 'FAILED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(30, 92, 158, 0.15)'),
                            color: item.status === 'DELIVERED' || item.status === 'OPENED' ? '#10b981' : (item.status === 'FAILED' ? '#ef4444' : '#1E5C9E')
                          }}>
                            {item.status === 'DELIVERED' ? 'Entregue' : (item.status === 'OPENED' ? 'Aberto' : (item.status === 'FAILED' ? 'Falhado' : 'Enviado'))}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>
                          {item.timestamp ? new Date(item.timestamp).toLocaleString('pt-AO') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 2: HISTÓRICO DE MENSAGENS & AUDITORIA                            */}
      {/* ==================================================================== */}
      {activeTab === 'history' && (
        <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          {/* Barra de Pesquisa e Filtros */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Pesquisar por Código AQT, cliente, e-mail ou Message ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-body)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-body)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            >
              <option value="all">Todos os Estados</option>
              <option value="delivered">Entregues</option>
              <option value="opened">Abertos</option>
              <option value="sent">Enviados / Em Processamento</option>
              <option value="failed">Falhados</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-body)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            >
              <option value="all">Todos os Modelos</option>
              <option value="order_confirmation">Confirmação de Encomenda</option>
              <option value="receipt_submitted">Comprovativo Recebido</option>
              <option value="payment_confirmed">Pagamento Confirmado</option>
              <option value="order_processing">Em Preparação</option>
              <option value="order_shipped">Em Rota</option>
              <option value="order_delivered">Entregue</option>
            </select>
          </div>

          {/* Feedback de Reenvio */}
          {resendResult && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: resendResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${resendResult.success ? '#10b981' : '#ef4444'}`,
              color: resendResult.success ? '#10b981' : '#ef4444',
              fontSize: '0.85rem'
            }}>
              {resendResult.success
                ? `Mensagem reenviada com sucesso! Novo Message ID: ${resendResult.messageId || 'Gerado'}`
                : `Falha no reenvio: ${resendResult.error || 'Erro desconhecido'}`}
            </div>
          )}

          {/* Tabela do Histórico */}
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Nenhum registo encontrado para os filtros selecionados.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 8px' }}>Encomenda</th>
                    <th style={{ padding: '10px 8px' }}>Cliente</th>
                    <th style={{ padding: '10px 8px' }}>Destinatário</th>
                    <th style={{ padding: '10px 8px' }}>Assunto</th>
                    <th style={{ padding: '10px 8px' }}>Data / Hora</th>
                    <th style={{ padding: '10px 8px' }}>Message ID Brevo</th>
                    <th style={{ padding: '10px 8px' }}>Estado Real</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: '#FF6500' }}>#{item.orderCode}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>{item.clientName}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{item.to}</td>
                      <td style={{ padding: '12px 8px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.subject}
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleString('pt-AO') : '—'}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {item.messageId ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <code style={{ fontSize: '0.72rem', background: 'var(--bg-body)', padding: '2px 6px', borderRadius: '4px' }}>
                              {String(item.messageId).slice(0, 16)}...
                            </code>
                            <button
                              onClick={() => copyToClipboard(item.messageId, item.id)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                              title="Copiar Message ID"
                            >
                              {copiedId === item.id ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: item.status === 'DELIVERED' || item.status === 'OPENED' ? 'rgba(16, 185, 129, 0.15)' : (item.status === 'FAILED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(30, 92, 158, 0.15)'),
                          color: item.status === 'DELIVERED' || item.status === 'OPENED' ? '#10b981' : (item.status === 'FAILED' ? '#ef4444' : '#1E5C9E')
                        }}>
                          {item.status === 'DELIVERED' ? 'Entregue' : (item.status === 'OPENED' ? 'Aberto' : (item.status === 'FAILED' ? 'Falhado' : 'Enviado'))}
                        </span>
                        {item.error && (
                          <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '2px' }}>{item.error}</div>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleResend(item)}
                          disabled={resendingLogId === item.id}
                          style={{
                            background: '#1E5C9E',
                            color: '#FFF',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {resendingLogId === item.id ? 'Reenviando...' : 'Reenviar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 3: MODELOS TRANSACCIONAIS & EDITOR VISUAL                       */}
      {/* ==================================================================== */}
      {activeTab === 'templates' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Coluna 1: Lista e Editor de Modelos */}
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800 }}>Modelos Oficiais do Sistema</h3>

            {/* Selector de Modelos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {Object.keys(canonicalTemplates).map(key => {
                const tmpl = canonicalTemplates[key];
                const isSelected = selectedTemplateKey === key;
                const isCustomized = Boolean(customTemplates?.[key]?.subject || customTemplates?.[key]?.customMessage);

                return (
                  <button
                    key={key}
                    onClick={() => handleSelectTemplate(key)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #FF6500' : '1px solid var(--border-light)',
                      background: isSelected ? 'rgba(255, 101, 0, 0.05)' : 'var(--bg-body)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? '#FF6500' : 'var(--text-main)' }}>
                        {tmpl.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {tmpl.category}
                      </div>
                    </div>
                    {isCustomized && (
                      <span style={{ fontSize: '0.68rem', background: '#FF6500', color: '#FFF', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>
                        Personalizado
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Formulário de Edição */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  Assunto Oficial do E-mail:
                </label>
                <input
                  type="text"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-body)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  Mensagem Adicional da Loja (Opcional):
                </label>
                <textarea
                  rows={4}
                  value={editedCustomMessage}
                  onChange={(e) => setEditedCustomMessage(e.target.value)}
                  placeholder="Introduza notas, aviso de garantia ou mensagem especial que surgirá em destaque no e-mail..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-body)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              {/* Variáveis Dinâmicas Suportadas */}
              <div style={{ background: 'var(--bg-body)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  VARIÁVEIS DINÂMICAS DISPONÍVEIS:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(currentTemplateMeta.variables || []).map(v => (
                    <code
                      key={v}
                      onClick={() => setEditedSubject(prev => `${prev} ${v}`)}
                      style={{
                        fontSize: '0.7rem',
                        background: 'var(--bg-card)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-light)',
                        cursor: 'pointer',
                        color: '#1E5C9E'
                      }}
                      title="Clique para adicionar ao assunto"
                    >
                      {v}
                    </code>
                  ))}
                </div>
              </div>

              {templateSaveSuccess && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid #10b981',
                  color: '#10b981',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Check size={16} /> Alterações guardadas com sucesso no Supabase e ativas para os próximos envios reais!
                </div>
              )}

              <button
                onClick={handleSaveTemplate}
                disabled={isSavingTemplate}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#FF6500',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                {isSavingTemplate ? 'A Guardar Modelo no Supabase...' : 'Guardar Alterações do Modelo'}
              </button>
            </div>
          </div>

          {/* Coluna 2: Pré-visualizador Fiel do E-mail */}
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800 }}>Pré-visualização do Cliente</h3>

            <div style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)'
            }}>
              {/* Header do E-mail */}
              <div style={{ background: '#1A202C', padding: '20px', textAlign: 'center' }}>
                <h2 style={{ color: '#FFFFFF', margin: 0, fontSize: '20px', fontWeight: 800 }}>
                  AQUI TEM <span style={{ color: '#FF6500' }}>ANGOLA</span>
                </h2>
                <p style={{ color: '#CBD5E0', margin: '4px 0 0', fontSize: '11px' }}>
                  Tecnologia & Acessórios Premium • Selados e com Garantia Oficial
                </p>
              </div>

              {/* Corpo */}
              <div style={{ padding: '24px', color: '#2D3748', fontSize: '13px', lineHeight: 1.6 }}>
                <div style={{ borderBottom: '1px solid #EDF2F7', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#718096', textTransform: 'uppercase', fontWeight: 700 }}>Assunto:</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1A202C', marginTop: '2px' }}>
                    {editedSubject || currentTemplateMeta.defaultSubject}
                  </div>
                </div>

                <div style={{ color: '#4A5568', marginBottom: '14px' }}>
                  Olá, <strong>JOÃO CARLOS MARCULINO</strong>!
                </div>

                {editedCustomMessage && (
                  <div style={{
                    background: '#FFFDF0',
                    borderLeft: '4px solid #FF6500',
                    padding: '12px 14px',
                    borderRadius: '0 8px 8px 0',
                    margin: '14px 0',
                    color: '#2D3748',
                    fontSize: '12px'
                  }}>
                    <strong>📢 Mensagem da Loja:</strong>
                    <div style={{ marginTop: '4px' }}>{editedCustomMessage}</div>
                  </div>
                )}

                {/* Card de Resumo da Encomenda */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', margin: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#1A202C' }}>📋 Encomenda #AQT-574143</span>
                    <span style={{ fontSize: '11px', background: '#FF6500', color: '#FFF', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      Oficial
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#4A5568' }}>
                    <div><strong>Artigo:</strong> Oraimo Traveler 4 Power Bank 20000mAh (x1)</div>
                    <div><strong>Entrega:</strong> Mutamba, Rua da Tipografia Mamã Tita, Luanda</div>
                    <div><strong>Rastreio:</strong> AQT-TRK-574143 (3 dias úteis)</div>
                    <div style={{ marginTop: '6px', fontWeight: 800, color: '#FF6500', fontSize: '13px' }}>
                      TOTAL: 23.640 Kz
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <span style={{ background: '#FF6500', color: '#FFF', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', display: 'inline-block' }}>
                    Acompanhar Encomenda na Área do Cliente
                  </span>
                </div>
              </div>

              {/* Rodapé */}
              <div style={{ background: '#EDF2F7', padding: '14px', textAlign: 'center', fontSize: '11px', color: '#718096' }}>
                AQUI TEM Comércio Geral Lda — Luanda, Angola • Apoio: +244 950 752 933
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 4: DISPARO DE TESTE CONTROLADO                                  */}
      {/* ==================================================================== */}
      {activeTab === 'test' && (
        <div style={{ maxWidth: '680px', margin: '0 auto', background: 'var(--bg-card)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Send size={24} style={{ color: '#FF6500' }} />
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Disparo de Teste Real com Brevo</h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Envie um e-mail transaccional de teste para validar a entrega na sua própria caixa de entrada.
              </p>
            </div>
          </div>

          <form onSubmit={handleSendTestEmail} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                E-mail de Destino do Teste:
              </label>
              <input
                type="email"
                required
                placeholder="ex: seu.email@gmail.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-body)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Modelo a Testar:
              </label>
              <select
                value={testTemplate}
                onChange={(e) => setTestTemplate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-body)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              >
                <option value="order_confirmation">1. Encomenda Registada (Aguardando Pagamento)</option>
                <option value="receipt_submitted">2. Comprovativo Recebido (Validação Financeira)</option>
                <option value="payment_confirmed">3. Pagamento Confirmado & Agendada</option>
                <option value="order_processing">4. Em Preparação & Embalagem</option>
                <option value="order_shipped">5. Em Rota de Entrega</option>
                <option value="order_delivered">6. Encomenda Entregue & Garantia</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Assunto Personalizado (Opcional):
              </label>
              <input
                type="text"
                placeholder="Deixe em branco para usar o assunto padrão oficial"
                value={testSubject}
                onChange={(e) => setTestSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-body)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Mensagem Adicional de Teste (Opcional):
              </label>
              <textarea
                rows={3}
                placeholder="Mensagem livre para validação visual no e-mail de teste..."
                value={testCustomMessage}
                onChange={(e) => setTestCustomMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-body)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSendingTest}
              style={{
                padding: '14px',
                borderRadius: '8px',
                border: 'none',
                background: '#FF6500',
                color: '#FFF',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Send size={18} />
              {isSendingTest ? 'A Contactar a API Oficial Brevo...' : 'Enviar E-mail de Teste Agora'}
            </button>
          </form>

          {/* Resultado do Teste */}
          {testResult && (
            <div style={{
              marginTop: '24px',
              padding: '20px',
              borderRadius: '12px',
              background: testResult.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${testResult.success ? '#10b981' : '#ef4444'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: testResult.success ? '#10b981' : '#ef4444' }}>
                {testResult.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                {testResult.success ? 'E-mail Aceite com Sucesso pelo Brevo!' : 'Falha no Disparo do Teste'}
              </div>

              {testResult.success && (
                <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  <div><strong>Destinatário:</strong> {testEmail}</div>
                  <div><strong>Message ID Oficial Brevo:</strong> <code>{testResult.messageId}</code></div>
                  <div><strong>Modo:</strong> {testResult.simulated ? 'Ambiente Local/Simulado' : 'Produção Oficial Brevo API'}</div>
                  <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Verifique agora a sua caixa de entrada (ou pasta de Spam/Promoções). O evento de entrega será registado pelo webhook.
                  </div>
                </div>
              )}

              {!testResult.success && (
                <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#ef4444' }}>
                  <strong>Erro retornado pelo servidor:</strong> {testResult.error || 'Falha na comunicação com o Brevo.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 5: CONFIGURAÇÃO DE WEBHOOK BREVO                                */}
      {/* ==================================================================== */}
      {activeTab === 'webhook' && (
        <div style={{ maxWidth: '780px', margin: '0 auto', background: 'var(--bg-card)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Code size={24} style={{ color: '#1E5C9E' }} />
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Integração Oficial de Webhooks Brevo</h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Registe este endpoint no painel da Brevo para receber estados de entrega, aberturas e bounces em tempo real.
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              URL do Webhook (Supabase Edge Function):
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                readOnly
                value={webhookUrl}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-body)',
                  color: 'var(--text-main)',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem'
                }}
              />
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(webhookUrl);
                  setCopiedWebhook(true);
                  setTimeout(() => setCopiedWebhook(false), 2500);
                }}
                style={{
                  padding: '12px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: copiedWebhook ? '#10b981' : '#1E5C9E',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copiedWebhook ? <Check size={16} /> : <Copy size={16} />}
                {copiedWebhook ? 'Copiado!' : 'Copiar URL'}
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700 }}>
              Instruções de Configuração no Painel Brevo:
            </h4>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.8 }}>
              <li>Aceda à sua conta no painel oficial da Brevo (<a href="https://app.brevo.com" target="_blank" rel="noopener noreferrer" style={{ color: '#FF6500', fontWeight: 700 }}>app.brevo.com</a>).</li>
              <li>Navegue até <strong>Transacional</strong> &gt; <strong>Configurações</strong> &gt; <strong>Webhooks</strong>.</li>
              <li>Clique em <strong>Adicionar um novo webhook</strong>.</li>
              <li>Cole a URL acima no campo <strong>URL a chamar</strong>.</li>
              <li>Selecione os seguintes eventos obrigatórios:
                <ul style={{ marginTop: '4px', color: '#1E5C9E', fontWeight: 600 }}>
                  <li>Entregue (Delivered)</li>
                  <li>Aberto (Opened / First opening)</li>
                  <li>Soft bounce / Hard bounce (Devolvido)</li>
                  <li>Bloqueado / Spam (Blocked)</li>
                </ul>
              </li>
              <li>Guarde as configurações. O AQUI TEM Angola passará a registar automaticamente cada evento no histórico da encomenda!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
