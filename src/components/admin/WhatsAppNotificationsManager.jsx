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
  Sparkles
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
  const [pageSize] = useState(25);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');

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
      const [statusRes, logsRes] = await Promise.all([
        checkWhatsAppApiStatus(),
        fetchWhatsAppLogs({ page: currentPage, limit: pageSize, statusFilter: statusFilter !== 'all' ? statusFilter : undefined })
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
  }, [currentPage, pageSize, statusFilter, showToast]);

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
      // Recarrega os logs para refletir a nova simulação imediatamente
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
    let sent = 0;
    let failed = 0;
    let receipts = 0;

    logs.forEach((log) => {
      if (log.status === 'SIMULATED') simulated++;
      else if (log.status === 'SENT' || log.status === 'DELIVERED' || log.status === 'READ') sent++;
      else if (log.status === 'FAILED') failed++;

      if (log.document_storage_path || log.message_type === 'document' || log.message_type === 'image') {
        receipts++;
      }
    });

    return {
      total: logs.length,
      simulated,
      sent,
      failed,
      receipts
    };
  }, [logs]);

  // ---------------------------------------------------------------------------
  // 5. FILTRAGEM LOCAL DE REGISTOS
  // ---------------------------------------------------------------------------
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (eventFilter !== 'all' && log.event_type !== eventFilter) return false;
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchOrder = log.order_code?.toLowerCase().includes(q);
        const matchRecipient = log.recipient?.toLowerCase().includes(q);
        const matchEvent = log.event_type?.toLowerCase().includes(q);
        const matchMsg = log.formatted_body?.toLowerCase().includes(q);
        return matchOrder || matchRecipient || matchEvent || matchMsg;
      }

      return true;
    });
  }, [logs, eventFilter, statusFilter, searchQuery]);

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
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {isMockModeActive ? (
                  <>
                    O sistema está a operar em <strong>Modo Mock 100% seguro e sem custos</strong>. Nenhuma mensagem é enviada à Meta.
                    Todos os fluxos de encomendas, comprovativos PDF e leads são simulados e auditados com o estado{' '}
                    <code style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', padding: '2px 6px', borderRadius: '4px' }}>SIMULATED</code>.
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
      {/* CARDS DE ESTATÍSTICAS                                                 */}
      {/* ===================================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total de Registos</span>
            <Layers size={18} style={{ color: '#F37021' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px' }}>{totalCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Histórico completo</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Notificações Simuladas</span>
            <Sparkles size={18} style={{ color: '#8B5CF6' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: '#8B5CF6' }}>
            {stats.simulated}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Status SIMULATED</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Comprovativos Processados</span>
            <FileCheck size={18} style={{ color: '#3B82F6' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: '#3B82F6' }}>
            {stats.receipts}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>PDFs do Bucket Privado</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Falhas Registadas</span>
            <AlertTriangle size={18} style={{ color: '#EF4444' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: stats.failed > 0 ? '#EF4444' : 'inherit' }}>
            {stats.failed}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Erros ou rejeições</div>
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
          {/* Botão 1: Nova Encomenda */}
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
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F37021', fontWeight: 700, fontSize: '0.9rem' }}>
              <Package size={17} /> Simular Nova Encomenda
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Dispara evento <code>order_created</code> com itens fictícios e valor total.
            </span>
          </button>

          {/* Botão 2: Novo Lead */}
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
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3B82F6', fontWeight: 700, fontSize: '0.9rem' }}>
              <UserCheck size={17} /> Simular Novo Lead
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Dispara evento <code>lead_captured</code> com contacto e produto pretendido.
            </span>
          </button>

          {/* Botão 3: Comprovativo PDF */}
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
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B5CF6', fontWeight: 700, fontSize: '0.9rem' }}>
              <FileCheck size={17} /> Simular Recibo PDF
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Vincula PDF real do bucket privado e testa link assinado temporário.
            </span>
          </button>

          {/* Botão 4: Pagamento Aprovado */}
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
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 700, fontSize: '0.9rem' }}>
              <CheckCircle2 size={17} /> Simular Pagamento Aprovado
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Dispara evento <code>payment_confirmed</code> com rastreio e prazo de entrega.
            </span>
          </button>
        </div>

        {/* Painel de Resultado do Teste Imediato */}
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

            {simulationResult.formattedMessage && (
              <details style={{ marginTop: '10px' }}>
                <summary style={{ fontSize: '0.8rem', color: '#8B5CF6', cursor: 'pointer', fontWeight: 600 }}>
                  Ver corpo da mensagem simulada
                </summary>
                <pre
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--bg-primary)',
                    fontSize: '0.78rem',
                    whiteSpace: 'pre-wrap',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  {simulationResult.formattedMessage}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* TABELA DE HISTÓRICO DE DESPACHOS & AUDITORIA DE NOTIFICAÇÕES         */}
      {/* ===================================================================== */}
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
              Registo Histórico de Notificações WhatsApp
            </h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Registo imutável de despachos, documentos vinculados, estado e integridade das mensagens.
            </p>
          </div>

          {/* Barra de Filtros */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Pesquisar código, evento..."
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
              <option value="order_processing">Em Preparação</option>
              <option value="order_shipped">Em Rota</option>
              <option value="order_delivered">Entregue</option>
              <option value="lead_captured">Novo Lead</option>
            </select>
          </div>
        </div>

        {/* Tabela de Dados */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 8px' }}>Data / Hora</th>
                <th style={{ padding: '12px 8px' }}>Evento</th>
                <th style={{ padding: '12px 8px' }}>Referência</th>
                <th style={{ padding: '12px 8px' }}>Modo</th>
                <th style={{ padding: '12px 8px' }}>Estado</th>
                <th style={{ padding: '12px 8px' }}>Comprovativo</th>
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
                  const isSimulated = log.status === 'SIMULATED';
                  const isFailed = log.status === 'FAILED';
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

                      {/* Evento */}
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          {log.event_type}
                        </span>
                      </td>

                      {/* Referência */}
                      <td style={{ padding: '12px 8px' }}>
                        {log.order_code ? (
                          <strong style={{ color: '#F37021' }}>#{log.order_code}</strong>
                        ) : log.payload?.leadName ? (
                          <span>{log.payload.leadName}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      {/* Modo */}
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            background: log.dispatch_mode === 'mock' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                            color: log.dispatch_mode === 'mock' ? '#8B5CF6' : '#10B981',
                            textTransform: 'uppercase'
                          }}
                        >
                          {log.dispatch_mode || (isSimulated ? 'mock' : 'cloud_api')}
                        </span>
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
                              : isSent
                              ? 'rgba(16, 185, 129, 0.18)'
                              : 'rgba(239, 68, 68, 0.18)',
                            color: isSimulated
                              ? '#8B5CF6'
                              : isSent
                              ? '#059669'
                              : '#DC2626'
                          }}
                        >
                          {isSimulated && '🧪 SIMULATED'}
                          {isSent && '✓ ' + log.status}
                          {isFailed && '✗ FAILED'}
                          {!isSimulated && !isSent && !isFailed && log.status}
                        </span>
                      </td>

                      {/* Comprovativo */}
                      <td style={{ padding: '12px 8px' }}>
                        {hasReceipt ? (
                          <button
                            onClick={() => handleOpenReceipt(log)}
                            disabled={loadingReceiptId === log.id}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px solid rgba(59, 130, 246, 0.4)',
                              background: 'rgba(59, 130, 246, 0.08)',
                              color: '#2563EB',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.76rem',
                              fontWeight: 700
                            }}
                          >
                            <FileText size={13} />
                            {loadingReceiptId === log.id ? 'A gerar link...' : 'Ver PDF Seguro'}
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Sem documento</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => setSelectedLog(log)}
                            title="Ver Detalhes da Notificação"
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
      {/* MODAL DE DETALHES DA MENSAGEM / LOG SELECIONADO                       */}
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
                  Detalhes da Notificação WhatsApp
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

            {/* Metadados */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '12px',
                borderRadius: '10px',
                background: 'var(--bg-primary)',
                marginBottom: '16px',
                fontSize: '0.82rem'
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Evento: </span>
                <strong>{selectedLog.event_type}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Modo: </span>
                <strong style={{ color: selectedLog.dispatch_mode === 'mock' ? '#8B5CF6' : '#10B981' }}>
                  {selectedLog.dispatch_mode?.toUpperCase() || 'MOCK'}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Estado: </span>
                <strong>{selectedLog.status}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Destino: </span>
                <strong>+{selectedLog.recipient}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Meta Message ID: </span>
                <code style={{ fontSize: '0.75rem' }}>{selectedLog.meta_message_id || 'N/A'}</code>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Deduplication Key: </span>
                <code style={{ fontSize: '0.75rem' }}>{selectedLog.deduplication_key || 'N/A'}</code>
              </div>
            </div>

            {/* Ficheiro Vinculado */}
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

            {/* Mensagem Formatada */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Corpo da Mensagem WhatsApp:</span>
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
                  maxHeight: '250px',
                  overflowY: 'auto'
                }}
              >
                {selectedLog.formatted_body || 'Nenhum corpo de texto formatado guardado.'}
              </pre>
            </div>

            {/* Erro registado se houver */}
            {selectedLog.last_error && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  fontSize: '0.8rem',
                  color: '#DC2626'
                }}
              >
                <strong>Último Erro: </strong>
                {selectedLog.last_error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
