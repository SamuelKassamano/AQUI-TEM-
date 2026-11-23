import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  Eye,
  Copy,
  Check,
  Terminal,
  Send,
  AlertCircle,
  FileCheck,
  HelpCircle,
  Layers,
  ArrowRight,
  UserCheck,
  Package,
  Sparkles,
  Radio,
  Globe,
  Activity
} from 'lucide-react';
import {
  checkWhatsAppApiStatus,
  fetchWhatsAppLogs,
  getTemporaryReceiptSignedUrl,
  simulateWhatsAppTestEvent,
  COMPANY_WHATSAPP_DISPLAY,
  COMPANY_WHATSAPP_NUMBER
} from '../../lib/whatsappNotificationService';

export default function WhatsAppNotificationsManager({
  session = null,
  formatPriceKz = (v) => `${Number(v || 0).toLocaleString('pt-AO')} Kz`,
  showToast = () => {}
}) {
  // Estado de configuração e modo
  const [apiStatus, setApiStatus] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Estado dos logs históricos
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [originTab, setOriginTab] = useState('all'); // 'all' | 'mock' | 'cloud_api' | 'external_meta'

  // Estado dos Testes de Simulação
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  // Modal de Detalhes da Mensagem
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedText, setCopiedText] = useState(false);

  // Estado de Abertura de Recibo
  const [loadingReceiptId, setLoadingReceiptId] = useState(null);

  // ---------------------------------------------------------------------------
  // 1. CARREGAMENTO INICIAL E ATUALIZAÇÃO
  // ---------------------------------------------------------------------------
  const loadStatusAndLogs = useCallback(async () => {
    setIsLoadingStatus(true);
    setIsLoadingLogs(true);
    try {
      // Carrega o conjunto completo dos últimos 100 registos para manter contadores estáveis entre abas
      const [statusRes, logsRes] = await Promise.all([
        checkWhatsAppApiStatus(),
        fetchWhatsAppLogs({
          page: 1,
          limit: 100,
          statusFilter: undefined,
          originFilter: undefined
        })
      ]);

      if (statusRes) {
        setApiStatus(statusRes);
      }

      if (logsRes && logsRes.logs) {
        setLogs(logsRes.logs);
        setTotalCount(logsRes.totalCount || logsRes.logs.length);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados de WhatsApp:', err);
      showToast('Aviso: Falha ao carregar registos de WhatsApp.', 'error');
    } finally {
      setIsLoadingStatus(false);
      setIsLoadingLogs(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadStatusAndLogs();
  }, [loadStatusAndLogs]);

  // ---------------------------------------------------------------------------
  // 2. DISPARO DE TESTE DE SIMULAÇÃO (MOCK)
  // ---------------------------------------------------------------------------
  const handleTriggerSimulation = async (eventType) => {
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const res = await simulateWhatsAppTestEvent(eventType);
      setSimulationResult({
        eventType,
        success: res.success,
        mode: res.mode,
        status: res.status,
        message: res.message,
        formattedMessage: res.formattedMessage,
        waLink: res.waLink,
        documentProcessed: res.documentProcessed,
        timestamp: new Date().toLocaleTimeString('pt-AO')
      });

      showToast(`Simulação (${eventType}) executada com sucesso!`, 'success');
      loadStatusAndLogs();
    } catch (err) {
      setSimulationResult({
        eventType,
        success: false,
        error: err.message || 'Erro desconhecido na simulação.',
        timestamp: new Date().toLocaleTimeString('pt-AO')
      });
      showToast(`Erro na simulação: ${err.message}`, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. ABERTURA SEGURA DE COMPROVATIVO SOB DEMANDA
  // ---------------------------------------------------------------------------
  const handleOpenReceipt = async (logItem) => {
    const path = logItem.document_storage_path;
    if (!path) {
      showToast('Nenhum caminho de comprovativo associado a este registo.', 'warning');
      return;
    }

    setLoadingReceiptId(logItem.id);
    try {
      const { success, signedUrl, message } = await getTemporaryReceiptSignedUrl(path);
      if (success && signedUrl) {
        window.open(signedUrl, '_blank', 'noopener,noreferrer');
        showToast('Comprovativo aberto em separador seguro.', 'success');
      } else {
        showToast(message || 'Erro ao gerar ligação segura para o comprovativo.', 'error');
      }
    } catch (err) {
      showToast('Erro ao aceder ao comprovativo no bucket.', 'error');
    } finally {
      setLoadingReceiptId(null);
    }
  };

  // ---------------------------------------------------------------------------
  // 4. ESTATÍSTICAS COMPUTADAS
  // ---------------------------------------------------------------------------
  const stats = useMemo(() => {
    let simulated = 0;
    let website = 0;
    let externalMeta = 0;
    let failed = 0;
    let receipts = 0;

    logs.forEach((log) => {
      if (log.dispatch_mode === 'mock' || log.status === 'SIMULATED') simulated++;
      else if (log.dispatch_mode === 'cloud_api' || log.dispatch_mode === 'controlled_test') website++;
      else if (log.dispatch_mode === 'external_meta') externalMeta++;

      if (log.status === 'FAILED' || log.error_code) failed++;

      if (log.document_storage_path || log.message_type === 'document' || log.message_type === 'image') {
        receipts++;
      }
    });

    return {
      total: logs.length,
      simulated,
      website,
      externalMeta,
      failed,
      receipts
    };
  }, [logs]);

  // ---------------------------------------------------------------------------
  // 5. FILTRAGEM LOCAL DE REGISTOS
  // ---------------------------------------------------------------------------
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Filtro por aba de Origem
      if (originTab === 'mock' && log.dispatch_mode !== 'mock') return false;
      if (originTab === 'cloud_api' && log.dispatch_mode !== 'cloud_api' && log.dispatch_mode !== 'controlled_test') return false;
      if (originTab === 'external_meta' && log.dispatch_mode !== 'external_meta') return false;

      // Filtro por Tipo de Evento
      if (eventFilter !== 'all' && log.event_type !== eventFilter) return false;

      // Filtro por Estado
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;

      // Pesquisa por texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchOrder = log.order_code?.toLowerCase().includes(q);
        const matchRecipient = log.recipient?.toLowerCase().includes(q);
        const matchEvent = log.event_type?.toLowerCase().includes(q);
        const matchMsg = log.formatted_body?.toLowerCase().includes(q);
        const matchMetaId = log.meta_message_id?.toLowerCase().includes(q);
        const matchErr = log.error_code?.toLowerCase().includes(q) || log.error_details?.toLowerCase().includes(q);
        return matchOrder || matchRecipient || matchEvent || matchMsg || matchMetaId || matchErr;
      }

      return true;
    });
  }, [logs, originTab, eventFilter, statusFilter, searchQuery]);

  // Copiar texto para o clipboard
  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const isMockModeActive = apiStatus?.isMock || apiStatus?.mode === 'mock';

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* ===================================================================== */}
      {/* BANNER DE IDENTIFICAÇÃO DE MODO (MOCK vs CLOUD API)                   */}
      {/* ===================================================================== */}
      <div
        style={{
          background: isMockModeActive
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.12) 100%)'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.12) 100%)',
          borderRadius: '16px',
          border: isMockModeActive ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: isMockModeActive ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isMockModeActive ? '#8B5CF6' : '#10B981',
                flexShrink: 0
              }}
            >
              <MessageCircle size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  Integração WhatsApp Business Cloud API
                </h3>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: isMockModeActive ? '#8B5CF6' : '#10B981',
                    color: '#FFFFFF'
                  }}
                >
                  {isMockModeActive ? '🧪 MODO SIMULAÇÃO (MOCK)' : '🟢 CLOUD API PRODUÇÃO'}
                </span>
                {apiStatus?.hasAppSecretConfigured && (
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#059669',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ShieldCheck size={13} /> Assinatura HMAC Ativa
                  </span>
                )}
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {isMockModeActive ? (
                  <>
                    O website opera em <strong>Modo Mock seguro</strong>. Notificações internas são auditadas como{' '}
                    <code style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', padding: '2px 6px', borderRadius: '4px' }}>SIMULATED</code>.
                    Eventos de webhook enviados diretamente pela Meta (incluindo falhas de entrega da consola Meta) são capturados e auditados em{' '}
                    <code style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706', padding: '2px 6px', borderRadius: '4px' }}>external_meta</code>.
                  </>
                ) : (
                  <>
                    A integração está a operar em <strong>Modo de Produção Real</strong> conectada à WhatsApp Cloud API da Meta.
                  </>
                )}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                fontSize: '0.82rem'
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Destinatário Oficial: </span>
              <strong style={{ color: '#25D366' }}>{COMPANY_WHATSAPP_DISPLAY}</strong>
            </div>

            <button
              onClick={loadStatusAndLogs}
              disabled={isLoadingLogs}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <RefreshCw size={15} className={isLoadingLogs ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CARDS DE ESTATÍSTICAS E SEPARAÇÃO DE ORIGENS                          */}
      {/* ===================================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div
          onClick={() => setOriginTab('all')}
          style={{
            background: 'var(--bg-card)',
            padding: '18px',
            borderRadius: '14px',
            border: originTab === 'all' ? '2px solid #F37021' : '1px solid var(--border-light)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Geral</span>
            <Layers size={18} style={{ color: '#F37021' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px' }}>{totalCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Todos os registos</div>
        </div>

        <div
          onClick={() => setOriginTab('mock')}
          style={{
            background: 'var(--bg-card)',
            padding: '18px',
            borderRadius: '14px',
            border: originTab === 'mock' ? '2px solid #8B5CF6' : '1px solid var(--border-light)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Simulações (Mock)</span>
            <Sparkles size={18} style={{ color: '#8B5CF6' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: '#8B5CF6' }}>
            {stats.simulated}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Modo Mock Seguro</div>
        </div>

        <div
          onClick={() => setOriginTab('external_meta')}
          style={{
            background: 'var(--bg-card)',
            padding: '18px',
            borderRadius: '14px',
            border: originTab === 'external_meta' ? '2px solid #D97706' : '1px solid var(--border-light)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Eventos Externos Meta</span>
            <Radio size={18} style={{ color: '#D97706' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: '#D97706' }}>
            {stats.externalMeta}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Recebidos via Webhook Meta</div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'FAILED' ? 'all' : 'FAILED')}
          style={{
            background: 'var(--bg-card)',
            padding: '18px',
            borderRadius: '14px',
            border: statusFilter === 'FAILED' ? '2px solid #EF4444' : '1px solid var(--border-light)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Erros e Falhas</span>
            <AlertTriangle size={18} style={{ color: '#EF4444' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: stats.failed > 0 ? '#EF4444' : 'inherit' }}>
            {stats.failed}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Com código de erro Meta</div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ÁREA DE TESTES E SIMULAÇÃO DE NOTIFICAÇÕES (1-CLIQUE)                 */}
      {/* ===================================================================== */}
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={18} style={{ color: '#F37021' }} />
              Testes de Simulação em 1-Clique (Sem Afetar Dados de Produção)
            </h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Dispare simulações completas para cada tipo de evento. Não cria encomendas, leads nem auditorias reais.
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#8B5CF6', background: 'rgba(139, 92, 246, 0.1)', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
            Idempotência & Deduplicação Ativas
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <button
            onClick={() => handleTriggerSimulation('order_created')}
            disabled={isSimulating}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-primary)',
              cursor: isSimulating ? 'not-allowed' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F37021', fontWeight: 700, fontSize: '0.9rem' }}>
              <Package size={17} /> Simular Nova Encomenda
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Dispara evento <code>order_created</code> com itens fictícios.
            </span>
          </button>

          <button
            onClick={() => handleTriggerSimulation('lead_captured')}
            disabled={isSimulating}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-primary)',
              cursor: isSimulating ? 'not-allowed' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3B82F6', fontWeight: 700, fontSize: '0.9rem' }}>
              <UserCheck size={17} /> Simular Novo Lead
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Dispara evento <code>lead_captured</code> com contacto fictício.
            </span>
          </button>

          <button
            onClick={() => handleTriggerSimulation('receipt_submitted')}
            disabled={isSimulating}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-primary)',
              cursor: isSimulating ? 'not-allowed' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B5CF6', fontWeight: 700, fontSize: '0.9rem' }}>
              <FileCheck size={17} /> Simular Recibo PDF
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Vincula PDF real do bucket privado e testa link temporário.
            </span>
          </button>

          <button
            onClick={() => handleTriggerSimulation('payment_confirmed')}
            disabled={isSimulating}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-primary)',
              cursor: isSimulating ? 'not-allowed' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 700, fontSize: '0.9rem' }}>
              <CheckCircle2 size={17} /> Simular Pagamento Aprovado
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Dispara evento <code>payment_confirmed</code> com dados de entrega.
            </span>
          </button>
        </div>

        {simulationResult && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              borderRadius: '12px',
              background: simulationResult.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: simulationResult.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {simulationResult.success ? (
                  <CheckCircle2 size={18} style={{ color: '#10B981' }} />
                ) : (
                  <AlertTriangle size={18} style={{ color: '#EF4444' }} />
                )}
                <strong style={{ fontSize: '0.9rem' }}>
                  Resultado da Simulação [{simulationResult.eventType}]: {simulationResult.success ? 'Sucesso' : 'Falha'}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ({simulationResult.timestamp})
                </span>
              </div>

              {simulationResult.waLink && (
                <a
                  href={simulationResult.waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#25D366',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <MessageCircle size={14} /> Abrir no WhatsApp Manual
                </a>
              )}
            </div>

            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
              {simulationResult.message || simulationResult.error}
            </p>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* TABELA DE HISTÓRICO DE DESPACHOS & AUDITORIA DE NOTIFICAÇÕES         */}
      {/* ===================================================================== */}
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
        {/* Separador de Abas de Origem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setOriginTab('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: originTab === 'all' ? 'var(--bg-primary)' : 'transparent',
              fontWeight: originTab === 'all' ? 800 : 600,
              color: originTab === 'all' ? '#F37021' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.86rem'
            }}
          >
            Todas ({stats.total})
          </button>
          <button
            onClick={() => setOriginTab('mock')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: originTab === 'mock' ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
              fontWeight: originTab === 'mock' ? 800 : 600,
              color: originTab === 'mock' ? '#8B5CF6' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} /> 🧪 Simuladas ({stats.simulated})
          </button>
          <button
            onClick={() => setOriginTab('cloud_api')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: originTab === 'cloud_api' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
              fontWeight: originTab === 'cloud_api' ? 800 : 600,
              color: originTab === 'cloud_api' ? '#10B981' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Globe size={14} /> 🌐 Website / Produção ({stats.website})
          </button>
          <button
            onClick={() => setOriginTab('external_meta')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: originTab === 'external_meta' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              fontWeight: originTab === 'external_meta' ? 800 : 600,
              color: originTab === 'external_meta' ? '#D97706' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Radio size={14} /> 📡 Eventos Externos Meta ({stats.externalMeta})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
              {originTab === 'external_meta'
                ? 'Auditoria de Eventos Externos Recebidos da Meta'
                : originTab === 'mock'
                ? 'Registo de Notificações em Modo Simulação'
                : 'Registo Histórico de Notificações WhatsApp'}
            </h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {originTab === 'external_meta'
                ? 'Eventos despachados diretamente pelo webhook da Meta (incluindo tentativas de envio do painel Meta e erros de entrega).'
                : 'Histórico auditável com código de erro, identificadores Meta e validação temporal.'}
            </p>
          </div>

          {/* Barra de Filtros */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Pesquisar código, erro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '7px 12px 7px 32px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-primary)',
                  fontSize: '0.82rem',
                  minWidth: '200px'
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-primary)',
                fontSize: '0.82rem'
              }}
            >
              <option value="all">Todos os Estados</option>
              <option value="SIMULATED">🧪 SIMULATED (Mock)</option>
              <option value="SENT">🟢 SENT (Enviado)</option>
              <option value="DELIVERED">🔵 DELIVERED (Entregue)</option>
              <option value="READ">🟣 READ (Lido)</option>
              <option value="FAILED">🔴 FAILED (Falhou)</option>
            </select>

            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-primary)',
                fontSize: '0.82rem'
              }}
            >
              <option value="all">Todos os Eventos</option>
              <option value="order_created">Nova Encomenda</option>
              <option value="receipt_submitted">Comprovativo Anexado</option>
              <option value="payment_confirmed">Pagamento Aprovado</option>
              <option value="lead_captured">Novo Lead</option>
              <option value="external_meta">Evento Externo Meta</option>
            </select>
          </div>
        </div>

        {/* Tabela de Dados */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 8px' }}>Data / Hora</th>
                <th style={{ padding: '12px 8px' }}>Origem</th>
                <th style={{ padding: '12px 8px' }}>Evento / WAMID</th>
                <th style={{ padding: '12px 8px' }}>Destinatário</th>
                <th style={{ padding: '12px 8px' }}>Estado</th>
                <th style={{ padding: '12px 8px' }}>Diagnóstico / Erro</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                    {isLoadingLogs ? 'A carregar registos...' : 'Nenhum registo de notificação encontrado para os filtros selecionados.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isSimulated = log.status === 'SIMULATED' || log.dispatch_mode === 'mock';
                  const isExternal = log.dispatch_mode === 'external_meta';
                  const isFailed = log.status === 'FAILED' || Boolean(log.error_code);
                  const isSent = log.status === 'SENT' || log.status === 'DELIVERED' || log.status === 'READ';
                  const hasReceipt = Boolean(log.document_storage_path);

                  return (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Data / Hora */}
                      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(log.created_at).toLocaleString('pt-AO')}
                      </td>

                      {/* Origem */}
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            background: isExternal
                              ? 'rgba(245, 158, 11, 0.15)'
                              : isSimulated
                              ? 'rgba(139, 92, 246, 0.12)'
                              : 'rgba(16, 185, 129, 0.12)',
                            color: isExternal ? '#D97706' : isSimulated ? '#8B5CF6' : '#10B981'
                          }}
                        >
                          {log.dispatch_mode === 'controlled_test'
                            ? '🧪 Teste Real'
                            : isExternal
                            ? '📡 Meta Externo'
                            : isSimulated
                            ? '🧪 Mock'
                            : '🌐 Website'}
                        </span>
                      </td>

                      {/* Evento / WAMID */}
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                            {log.order_code ? `#${log.order_code}` : log.event_type}
                          </span>
                          {log.meta_message_id && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              {log.meta_message_id.length > 25 ? `${log.meta_message_id.substring(0, 22)}...` : log.meta_message_id}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Destinatário */}
                      <td style={{ padding: '12px 8px', fontSize: '0.82rem' }}>
                        +{log.recipient}
                      </td>

                      {/* Estado */}
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '3px 10px',
                            borderRadius: '14px',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: isSimulated
                              ? 'rgba(139, 92, 246, 0.18)'
                              : isFailed
                              ? 'rgba(239, 68, 68, 0.18)'
                              : 'rgba(16, 185, 129, 0.18)',
                            color: isSimulated
                              ? '#8B5CF6'
                              : isFailed
                              ? '#DC2626'
                              : '#059669'
                          }}
                        >
                          {isSimulated ? '🧪 SIMULATED' : isFailed ? '✗ FAILED' : '✓ ' + log.status}
                        </span>
                      </td>

                      {/* Diagnóstico / Erro Meta */}
                      <td style={{ padding: '12px 8px' }}>
                        {log.error_code ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                padding: '2px 7px',
                                borderRadius: '6px',
                                background: 'rgba(239, 68, 68, 0.12)',
                                color: '#DC2626',
                                fontWeight: 800,
                                fontSize: '0.75rem'
                              }}
                              title={log.error_details || log.last_error}
                            >
                              Erro {log.error_code}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {log.error_details || 'Falha de entrega'}
                            </span>
                          </div>
                        ) : hasReceipt ? (
                          <button
                            onClick={() => handleOpenReceipt(log)}
                            disabled={loadingReceiptId === log.id}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              border: '1px solid rgba(59, 130, 246, 0.4)',
                              background: 'rgba(59, 130, 246, 0.08)',
                              color: '#2563EB',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            <FileText size={12} />
                            {loadingReceiptId === log.id ? '...' : 'PDF Seguro'}
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => setSelectedLog(log)}
                            title="Ver Detalhes Técnicos"
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-light)',
                              background: 'var(--bg-primary)',
                              cursor: 'pointer',
                              color: 'var(--text-main)'
                            }}
                          >
                            <Eye size={14} />
                          </button>

                          {log.formatted_body && (
                            <a
                              href={`https://wa.me/${COMPANY_WHATSAPP_NUMBER}?text=${encodeURIComponent(log.formatted_body)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Abrir no WhatsApp Manual"
                              style={{
                                padding: '6px',
                                borderRadius: '6px',
                                border: '1px solid rgba(37, 211, 102, 0.4)',
                                background: 'rgba(37, 211, 102, 0.1)',
                                color: '#16A34A',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
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

      {/* ===================================================================== */}
      {/* MODAL DE DETALHES TÉCNICOS / DIAGNÓSTICO DO EVENTO                    */}
      {/* ===================================================================== */}
      {selectedLog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setSelectedLog(null)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '16px',
              border: '1px solid var(--border-light)',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  Auditoria Técnica do Evento WhatsApp
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ID: {selectedLog.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                ✕
              </button>
            </div>

            {/* Painel Destacado de Erro da Meta se existir */}
            {selectedLog.error_code && (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontWeight: 800, marginBottom: '8px' }}>
                  <AlertTriangle size={18} />
                  <span>Código de Erro Meta: {selectedLog.error_code}</span>
                </div>
                {selectedLog.error_details && (
                  <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    <strong>Detalhes da Meta: </strong> {selectedLog.error_details}
                  </p>
                )}
                {selectedLog.fbtrace_id && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <strong>FB Trace ID: </strong> <code>{selectedLog.fbtrace_id}</code>
                  </div>
                )}
              </div>
            )}

            {/* Metadados Técnicos */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '14px',
                borderRadius: '10px',
                background: 'var(--bg-primary)',
                marginBottom: '16px',
                fontSize: '0.82rem'
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Origem: </span>
                <strong style={{ color: selectedLog.dispatch_mode === 'external_meta' ? '#D97706' : selectedLog.dispatch_mode === 'mock' ? '#8B5CF6' : '#10B981' }}>
                  {selectedLog.dispatch_mode === 'external_meta' ? 'EVENTO EXTERNO META' : selectedLog.dispatch_mode?.toUpperCase()}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Estado: </span>
                <strong>{selectedLog.status}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Destinatário: </span>
                <strong>+{selectedLog.recipient}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Tipo de Mensagem: </span>
                <code>{selectedLog.message_type}</code>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-muted)' }}>Meta Message ID (WAMID): </span>
                <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{selectedLog.meta_message_id || 'N/A'}</code>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-muted)' }}>Chave de Deduplicação: </span>
                <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{selectedLog.deduplication_key || 'N/A'}</code>
              </div>
            </div>

            {/* Comprovativo no bucket se houver */}
            {selectedLog.document_storage_path && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563EB' }}>
                    Documento Anexo (Bucket payment-receipts)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Caminho: {selectedLog.document_storage_path}
                  </div>
                </div>
                <button
                  onClick={() => handleOpenReceipt(selectedLog)}
                  disabled={loadingReceiptId === selectedLog.id}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {loadingReceiptId === selectedLog.id ? 'A carregar...' : 'Visualizar PDF'}
                </button>
              </div>
            )}

            {/* Mensagem Formatada ou Payload */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Corpo da Notificação / Registo Técnico:</span>
                <button
                  onClick={() => copyToClipboard(selectedLog.formatted_body)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-primary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  {copiedText ? <Check size={12} style={{ color: '#10B981' }} /> : <Copy size={12} />}
                  {copiedText ? 'Copiado!' : 'Copiar Texto'}
                </button>
              </div>
              <pre
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.8rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}
              >
                {selectedLog.formatted_body || 'Nenhum corpo de texto formatado guardado.'}
              </pre>
            </div>

            {/* Erro Bruto se existir */}
            {selectedLog.last_error && (
              <div style={{ marginTop: '10px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Payload Bruto de Erros (Meta):</span>
                <pre
                  style={{
                    marginTop: '4px',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.72rem',
                    whiteSpace: 'pre-wrap',
                    color: '#DC2626',
                    maxHeight: '120px',
                    overflowY: 'auto'
                  }}
                >
                  {selectedLog.last_error}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
