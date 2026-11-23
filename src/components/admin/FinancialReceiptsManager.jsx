import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  Printer,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Truck,
  Calendar,
  DollarSign,
  TrendingUp,
  X,
  MessageCircle,
  RefreshCw,
  Eye,
  ChevronRight,
  AlertCircle,
  Image as ImageIcon,
  FolderOpen,
  Maximize2,
  Check,
  Upload
} from 'lucide-react';
import { calculateEstimatedDeliveryDate } from '../../utils/angolaLocations';
import { updateOrderStatus } from '../../utils/customerOrders';
import { sendBrevoTransactionalEmail } from '../../lib/brevoService';
import { notifyCompanyWhatsApp } from '../../lib/whatsappNotificationService';
import { supabase } from '../../lib/supabase';

export default function FinancialReceiptsManager({
  leads = [],
  session = null,
  updateLeadStatus,
  refreshCRMData,
  showToast = () => { }
}) {
  // Navegação interna do módulo
  // Abas: visao-geral | novos | pendentes | aprovados | rejeitados | armazenamento | auditoria | relatorios
  const [activeTab, setActiveTab] = useState('visao-geral');

  // Filtros Globais
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [datePeriodFilter, setDatePeriodFilter] = useState('all'); // all | today | 7days | month
  const [sortOrder, setSortOrder] = useState('recent'); // recent | oldest | highest | lowest

  // Modais de Operação
  const [selectedReceiptLead, setSelectedReceiptLead] = useState(null);
  const [documentSignedUrl, setDocumentSignedUrl] = useState(null);
  const [loadingSignedUrl, setLoadingSignedUrl] = useState(false);

  // Armazenamento & Galeria de Comprovativos
  const [galleryFilter, setGalleryFilter] = useState('all'); // 'all' | 'images' | 'pdfs'
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryStatusFilter, setGalleryStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [cachedSignedUrls, setCachedSignedUrls] = useState({});
  const [loadingGalleryUrls, setLoadingGalleryUrls] = useState(false);
  const [storageReceipts, setStorageReceipts] = useState([]);
  const [loadingStorageReceipts, setLoadingStorageReceipts] = useState(false);

  // Modal de Aprovação com Confirmação Explícita
  const [approvingLead, setApprovingLead] = useState(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);

  // Modal de Rejeição com Motivo Obrigatório
  const [rejectingLead, setRejectingLead] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [isProcessingRejection, setIsProcessingRejection] = useState(false);

  // ---------------------------------------------------------------------------
  // PROCESSAMENTO DE LEADS E NORMALIZAÇÃO DE COMPROVATIVOS
  // ---------------------------------------------------------------------------
  const receiptOrders = useMemo(() => {
    return (leads || []).map(lead => {
      const orderCode = lead.leadCode || lead.lead_code || `AQT-${String(lead.id).slice(0, 6)}`;
      const status = lead.status || 'Novo Lead';
      const notes = lead.notes || '';
      const history = Array.isArray(lead.history) ? lead.history : [];

      // Identificação se possui comprovativo anexado ou intenção financeira
      const hasStoragePath = Boolean(lead.receiptStoragePath || lead.receipt_storage_path);
      const isReceiptStatus = status === 'Comprovativo Recebido' || status === 'Pendente de Confirmação';
      const notesMentionReceipt = notes.toLowerCase().includes('comprovativo') || notes.toLowerCase().includes('receipt');
      const hasReceipt = hasStoragePath || isReceiptStatus || notesMentionReceipt;

      // Classificação financeira canónica
      const isApproved = status === 'Encomenda Agendada' || status === 'Venda Realizada' || status === 'Em Preparação' || status === 'Em Rota' || status === 'Entregue';
      const isRejected = notes.toLowerCase().includes('rejeitado') || history.some(h => (h.action || '').toLowerCase().includes('rejeitado'));
      const isPending = !isApproved && (isReceiptStatus || hasStoragePath || status === 'Novo Lead' || status === 'Em Atendimento' || status === 'Aguardando Pagamento');

      // Determinação do método de pagamento
      let paymentMethod = lead.paymentMethod || 'Transferência Bancária BFA';
      if (notes.toLowerCase().includes('express') || notes.toLowerCase().includes('paypay') || (lead.paymentMethod && lead.paymentMethod.includes('Express'))) {
        paymentMethod = 'Multicaixa Express / PayPay';
      } else if (notes.toLowerCase().includes('bfa') || notes.toLowerCase().includes('transferência') || (lead.paymentMethod && lead.paymentMethod.includes('BFA'))) {
        paymentMethod = 'Transferência Bancária BFA';
      }

      const totalValue = Number(lead.totalValue || lead.productPrice || 0);
      const deliveryFee = Math.max(Number(lead.deliveryFee || 3000), 3000);
      const trackingNumber = lead.trackingNumber || lead.tracking_number || `AQT-TRK-${orderCode}`;

      // Extração resiliente de e-mail a partir das notas
      let customerEmail = lead.email || '';
      if (!customerEmail || !customerEmail.includes('@')) {
        const match = notes.match(/Email:\s*([^\s|]+@[^\s|]+)/i) || notes.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (match && match[1]) customerEmail = match[1].trim();
      }

      const storagePath = lead.receiptStoragePath || lead.receipt_storage_path || null;
      const fileName = lead.receiptFileName || (storagePath ? storagePath.split('/').pop() : 'Comprovativo Bancário');
      const isPdf = Boolean((storagePath && storagePath.toLowerCase().endsWith('.pdf')) || (fileName && fileName.toLowerCase().endsWith('.pdf')));

      return {
        ...lead,
        orderCode,
        email: customerEmail,
        hasReceipt,
        isApproved,
        isRejected,
        isPending,
        paymentMethod,
        totalValue,
        deliveryFee,
        trackingNumber,
        history,
        storagePath,
        fileName,
        isPdf,
        uploadedAt: lead.receiptUploadedAt || lead.receipt_uploaded_at || lead.createdAt
      };
    }).filter(item => item.hasReceipt || item.isPending || item.isApproved || item.isRejected);
  }, [leads]);

  // ---------------------------------------------------------------------------
  // INDICADORES AUTOMÁTICOS DO DASHBOARD FINANCEIRO (Supabase Live Metrics)
  // ---------------------------------------------------------------------------
  const metrics = useMemo(() => {
    const totalCount = receiptOrders.length;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    let totalPendingKz = 0;
    let totalApprovedKz = 0;
    let totalRejectedKz = 0;

    for (const ord of receiptOrders) {
      const val = ord.totalValue;
      if (ord.isApproved) {
        approvedCount++;
        totalApprovedKz += val;
      } else if (ord.isRejected) {
        rejectedCount++;
        totalRejectedKz += val;
      } else {
        pendingCount++;
        totalPendingKz += val;
      }
    }

    return {
      totalCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      totalPendingKz,
      totalApprovedKz,
      totalRejectedKz,
      totalGeneralKz: totalPendingKz + totalApprovedKz + totalRejectedKz
    };
  }, [receiptOrders]);

  // ---------------------------------------------------------------------------
  // FILTRAGEM E PESQUISA DINÂMICA
  // ---------------------------------------------------------------------------
  const filteredOrders = useMemo(() => {
    return receiptOrders.filter(ord => {
      // 1. Filtro da Aba
      if (activeTab === 'novos') {
        const isRecent = ord.isPending && ord.status === 'Novo Lead';
        if (!isRecent) return false;
      } else if (activeTab === 'pendentes') {
        if (!ord.isPending) return false;
      } else if (activeTab === 'aprovados') {
        if (!ord.isApproved) return false;
      } else if (activeTab === 'rejeitados') {
        if (!ord.isRejected) return false;
      }

      // 2. Filtro de Método de Pagamento
      if (paymentMethodFilter !== 'all') {
        if (paymentMethodFilter === 'express' && !ord.paymentMethod.includes('Express')) return false;
        if (paymentMethodFilter === 'bfa' && !ord.paymentMethod.includes('BFA')) return false;
      }

      // 3. Filtro de Período
      if (datePeriodFilter !== 'all') {
        const ordDate = new Date(ord.createdAt || ord.uploadedAt);
        const now = new Date();
        if (datePeriodFilter === 'today') {
          const isToday = ordDate.toDateString() === now.toDateString();
          if (!isToday) return false;
        } else if (datePeriodFilter === '7days') {
          const diffDays = (now - ordDate) / (1000 * 60 * 60 * 24);
          if (diffDays > 7) return false;
        } else if (datePeriodFilter === 'month') {
          const sameMonth = ordDate.getMonth() === now.getMonth() && ordDate.getFullYear() === now.getFullYear();
          if (!sameMonth) return false;
        }
      }

      // 4. Pesquisa de Texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const code = (ord.orderCode || '').toLowerCase();
        const name = (ord.name || '').toLowerCase();
        const phone = (ord.phone || '').toLowerCase();
        const email = (ord.email || '').toLowerCase();
        const prod = (ord.productName || '').toLowerCase();
        return code.includes(q) || name.includes(q) || phone.includes(q) || email.includes(q) || prod.includes(q);
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'recent') {
        return new Date(b.createdAt || b.uploadedAt) - new Date(a.createdAt || a.uploadedAt);
      }
      if (sortOrder === 'oldest') {
        return new Date(a.createdAt || a.uploadedAt) - new Date(b.createdAt || b.uploadedAt);
      }
      if (sortOrder === 'highest') {
        return b.totalValue - a.totalValue;
      }
      if (sortOrder === 'lowest') {
        return a.totalValue - b.totalValue;
      }
      return 0;
    });
  }, [receiptOrders, activeTab, paymentMethodFilter, datePeriodFilter, searchQuery, sortOrder]);

  // ---------------------------------------------------------------------------
  // PROCESSAMENTO EXCLUSIVO DA GALERIA & ARMAZENAMENTO DE COMPROVATIVOS
  // ---------------------------------------------------------------------------
  const galleryOrders = useMemo(() => {
    // Unifica comprovativos directos do storage com os do CRM
    const combined = [...storageReceipts];
    const seenPaths = new Set(storageReceipts.map(r => r.storagePath).filter(Boolean));

    for (const ord of receiptOrders) {
      if (ord.storagePath && !seenPaths.has(ord.storagePath)) {
        seenPaths.add(ord.storagePath);
        combined.push(ord);
      } else if (!ord.storagePath && ord.hasReceipt) {
        combined.push(ord);
      }
    }

    return combined.filter(ord => {
      // Filtrar registos com comprovativo anexado ou pendente de validação
      const hasDoc = ord.hasReceipt || Boolean(ord.storagePath) || Boolean(ord.signedUrl);
      if (!hasDoc) return false;

      // Filtro por Formato (Imagens vs PDFs)
      if (galleryFilter === 'images' && ord.isPdf) return false;
      if (galleryFilter === 'pdfs' && !ord.isPdf) return false;

      // Filtro por Estado Financeiro
      if (galleryStatusFilter === 'pending' && !ord.isPending) return false;
      if (galleryStatusFilter === 'approved' && !ord.isApproved) return false;
      if (galleryStatusFilter === 'rejected' && !ord.isRejected) return false;

      // Pesquisa interna na Galeria
      if (gallerySearch.trim()) {
        const q = gallerySearch.toLowerCase().trim();
        const code = (ord.orderCode || '').toLowerCase();
        const name = (ord.customerName || ord.name || '').toLowerCase();
        const phone = (ord.customerPhone || ord.phone || '').toLowerCase();
        const email = (ord.customerEmail || ord.email || '').toLowerCase();
        const file = (ord.fileName || '').toLowerCase();
        return code.includes(q) || name.includes(q) || phone.includes(q) || email.includes(q) || file.includes(q);
      }

      return true;
    });
  }, [receiptOrders, storageReceipts, galleryFilter, galleryStatusFilter, gallerySearch]);

  // Carregar todos os comprovativos do bucket payment-receipts via Edge Function
  const fetchStorageReceipts = useCallback(async () => {
    if (!supabase?.functions) return;
    try {
      setLoadingStorageReceipts(true);
      const { data, error } = await supabase.functions.invoke('receipt-access', {
        body: { action: 'list-all-receipts' }
      });
      if (!error && data?.success && Array.isArray(data.receipts)) {
        setStorageReceipts(data.receipts);
        const urlMap = {};
        data.receipts.forEach(r => {
          if (r.storagePath && r.signedUrl) {
            urlMap[r.storagePath] = r.signedUrl;
          }
        });
        setCachedSignedUrls(prev => ({ ...prev, ...urlMap }));
      }
    } catch (e) {
      console.warn('Aviso ao carregar comprovativos do storage:', e);
    } finally {
      setLoadingStorageReceipts(false);
    }
  }, []);

  useEffect(() => {
    fetchStorageReceipts();
  }, [fetchStorageReceipts]);

  // ---------------------------------------------------------------------------
  // CONSULTA DE URL ASSINADO SEGURO NO BACKEND (Storage Privado payment-receipts)
  // ---------------------------------------------------------------------------
  const handleFetchSignedUrl = useCallback(async (order) => {
    if (!order) return;
    try {
      setLoadingSignedUrl(true);
      setDocumentSignedUrl(null);

      // 1. Tentar URL directa já emitida
      if (order.signedUrl) {
        setDocumentSignedUrl(order.signedUrl);
        setLoadingSignedUrl(false);
        return;
      }

      // 2. Tentar cache local
      if (order.storagePath && cachedSignedUrls[order.storagePath]) {
        setDocumentSignedUrl(cachedSignedUrls[order.storagePath]);
        setLoadingSignedUrl(false);
        return;
      }

      // 3. Invocar Edge Function oficial receipt-access
      if (supabase?.functions) {
        const { data, error } = await supabase.functions.invoke('receipt-access', {
          body: {
            action: 'get-signed-url',
            orderCode: order.orderCode,
            storagePath: order.storagePath,
            expiresIn: 3600 // 60 minutos de acesso autorizado
          }
        });

        if (!error && data?.success && data?.signedUrl) {
          setDocumentSignedUrl(data.signedUrl);
          if (order.storagePath) {
            setCachedSignedUrls(prev => ({ ...prev, [order.storagePath]: data.signedUrl }));
          }
          return;
        }
      }

      // 4. Fallback directo se houver receiptUrl
      if (order.receiptUrl) {
        setDocumentSignedUrl(order.receiptUrl);
        return;
      }

      throw new Error('Não foi possível gerar acesso seguro ao documento no bucket payment-receipts.');
    } catch (err) {
      showToast(`Erro no acesso ao comprovativo: ${err.message}`);
    } finally {
      setLoadingSignedUrl(false);
    }
  }, [cachedSignedUrls, showToast]);

  const handleOpenReceiptDetail = (order) => {
    setSelectedReceiptLead(order);
    handleFetchSignedUrl(order);
  };

  // ---------------------------------------------------------------------------
  // APROVAÇÃO FINANCEIRA COM CONFIRMAÇÃO EXPLÍCITA
  // ---------------------------------------------------------------------------
  const handleExecuteApproval = async () => {
    if (!approvingLead || isProcessingApproval) return;

    try {
      setIsProcessingApproval(true);
      const lead = approvingLead;
      const adminEmail = session?.user?.email || 'admin@aquitem.ao';
      const formattedTimestamp = new Date().toLocaleString('pt-AO');
      const calc = calculateEstimatedDeliveryDate(new Date(), 3);
      const trackingCode = lead.trackingNumber || `AQT-TRK-${lead.orderCode}`;

      showToast(`A validar pagamento e agendar entrega para ${calc.formattedDate}...`);

      const auditNote = `[PAGAMENTO APROVADO] Confirmado pelo administrador (${adminEmail}) em ${formattedTimestamp}. Previsão de entrega: ${calc.formattedDate} (3 dias úteis). Código de rastreio: ${trackingCode}. ${approvalNote ? `Obs: ${approvalNote}` : ''}`.trim();

      // 1. Actualizar estado da encomenda no CRM / Supabase
      await updateLeadStatus(lead.id, 'Encomenda Agendada', auditNote);

      // 2. Sincronizar com o gestor de encomendas local
      updateOrderStatus(lead.orderCode, 'Encomenda Agendada', null, trackingCode, calc.formattedDate);

      // 3. Registo de Auditoria Financeira Imutável no Supabase
      try {
        if (supabase) {
          await supabase.from('receipt_financial_audits').insert([{
            order_code: lead.orderCode,
            lead_id: lead.id,
            decision: 'APROVADO',
            previous_status: lead.status || 'Comprovativo Recebido',
            new_status: 'Encomenda Agendada',
            amount_total: lead.totalValue,
            payment_method: lead.paymentMethod,
            receipt_storage_path: lead.storagePath,
            admin_email: adminEmail,
            reason_or_notes: auditNote
          }]);
        }
      } catch (_auditErr) {
        console.warn('Registo na tabela de auditoria (opcional se não criada):', _auditErr);
      }

      // 4. Envio de e-mail transaccional automático pelo Brevo
      const customerEmail = lead.email || (lead.notes ? (lead.notes.match(/Email:\s*([^\s|]+@[^\s|]+)/i) || lead.notes.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/))?.[1] : '');
      if (customerEmail && customerEmail.includes('@')) {
        const orderDateStr = lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-AO') : new Date().toLocaleDateString('pt-AO');
        const prodPrice = Number(lead.productPrice || lead.totalValue);

        const emailRes = await sendBrevoTransactionalEmail({
          templateType: 'payment_confirmed',
          to: customerEmail,
          recipientName: lead.name,
          orderData: {
            id: lead.orderCode,
            orderDate: orderDateStr,
            total: lead.totalValue,
            subtotal: prodPrice,
            deliveryFee: lead.deliveryFee,
            items: [{
              name: lead.productName || 'Artigo AQUI TEM',
              description: 'Equipamento Original com Garantia Oficial de 7 Dias',
              price: prodPrice,
              quantity: 1
            }],
            customerPhone: lead.phone,
            customerEmail: customerEmail,
            province: lead.city || 'Luanda',
            municipality: lead.city || 'Luanda',
            address: lead.address,
            paymentStatus: 'Encomenda Agendada (Pagamento Confirmado)',
            trackingNumber: trackingCode,
            estimatedDeliveryDate: calc.formattedDate
          },
          deduplicationKey: `payment_confirmed-${lead.orderCode}`,
          force: true
        });

        if (emailRes?.success) {
          showToast(`✓ Pagamento da encomenda #${lead.orderCode} aprovado! E-mail oficial enviado via Brevo.`);
        } else {
          showToast(`✓ Pagamento aprovado na BD! Aviso Brevo: ${emailRes?.error || 'e-mail em processamento'}`);
        }
      } else {
        showToast(`✓ Pagamento da encomenda #${lead.orderCode} aprovado com sucesso!`);
      }

      // 5. Notificação WhatsApp para a Empresa (+244 950 752 933) com comprovativo PDF
      try {
        notifyCompanyWhatsApp({
          eventType: 'payment_confirmed',
          orderData: {
            id: lead.orderCode,
            total: lead.totalValue,
            customerName: lead.name,
            customerPhone: lead.phone,
            customerEmail: customerEmail || lead.email,
            province: lead.city,
            address: lead.address,
            paymentMethod: lead.paymentMethod,
            trackingNumber: trackingCode,
            estimatedDeliveryDate: calc.formattedDate,
            receiptStoragePath: lead.storagePath,
            paymentStatus: 'Encomenda Agendada (Pagamento Confirmado)'
          },
          deduplicationKey: `company-wa-approved-${lead.orderCode}`
        }).catch(waErr => console.warn('Aviso WhatsApp aprovação:', waErr));
      } catch (_waEx) {}

      setApprovingLead(null);
      setApprovalNote('');
      if (selectedReceiptLead?.id === lead.id) {
        setSelectedReceiptLead(null);
      }
    } catch (err) {
      showToast(`Erro ao aprovar pagamento: ${err.message}`);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // ---------------------------------------------------------------------------
  // TRANSIÇÃO DE ESTADOS LOGÍSTICOS & DISPARO DE E-MAILS TRANSACCIONAIS BREVO
  // Modelos Oficiais:
  // - Encomenda Agendada -> payment_confirmed
  // - Em Preparação -> order_processing
  // - Em Rota -> order_shipped
  // - Entregue -> order_delivered
  // ---------------------------------------------------------------------------
  const handleAdvanceOrderStatus = async (order, targetStatus) => {
    if (!order || isProcessingApproval) return;

    try {
      setIsProcessingApproval(true);
      const adminEmail = session?.user?.email || 'admin@aquitem.ao';
      const formattedTimestamp = new Date().toLocaleString('pt-AO');
      const calc = calculateEstimatedDeliveryDate(new Date(), 3);
      const trackingCode = order.trackingNumber || `AQT-TRK-${order.orderCode}`;

      const templateMap = {
        'Encomenda Agendada': 'payment_confirmed',
        'Em Preparação': 'order_processing',
        'Em Rota': 'order_shipped',
        'Entregue': 'order_delivered'
      };

      const templateType = templateMap[targetStatus];
      const auditNote = `[ESTADO ATUALIZADO: ${targetStatus.toUpperCase()}] Atualizado pelo administrador (${adminEmail}) em ${formattedTimestamp}. Rastreio: ${trackingCode}.`;

      showToast(`A actualizar encomenda #${order.orderCode} para "${targetStatus}"...`);

      // 1. Atualizar lead no CRM / Supabase
      await updateLeadStatus(order.id, targetStatus, auditNote);

      // 2. Atualizar gestor de encomendas local
      updateOrderStatus(order.orderCode, targetStatus, null, trackingCode, calc.formattedDate);

      // 3. Enviar e-mail correspondente via Brevo
      const customerEmail = order.email || (order.notes ? (order.notes.match(/Email:\s*([^\s|]+@[^\s|]+)/i) || order.notes.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/))?.[1] : '');
      if (templateType && customerEmail && customerEmail.includes('@')) {
        const orderDateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-AO') : new Date().toLocaleDateString('pt-AO');
        const prodPrice = Number(order.productPrice || order.totalValue);

        const emailRes = await sendBrevoTransactionalEmail({
          templateType,
          to: customerEmail,
          recipientName: order.name,
          orderData: {
            id: order.orderCode,
            orderDate: orderDateStr,
            total: order.totalValue,
            subtotal: prodPrice,
            deliveryFee: order.deliveryFee,
            items: [{
              name: order.productName || 'Artigo AQUI TEM',
              description: 'Equipamento Original com Garantia Oficial de 7 Dias',
              price: prodPrice,
              quantity: 1
            }],
            customerPhone: order.phone,
            customerEmail,
            province: order.city || 'Luanda',
            municipality: order.city || 'Luanda',
            address: order.address,
            paymentStatus: targetStatus,
            trackingNumber: trackingCode,
            estimatedDeliveryDate: calc.formattedDate
          },
          deduplicationKey: `${templateType}-${order.orderCode}`,
          force: true
        });

        if (emailRes?.success) {
          showToast(`✓ Estado alterado para "${targetStatus}"! E-mail oficial disparado via Brevo.`);
        } else {
          showToast(`✓ Estado alterado para "${targetStatus}". Aviso Brevo: ${emailRes?.error || 'e-mail em processamento'}`);
        }
      } else {
        showToast(`✓ Estado da encomenda #${order.orderCode} alterado para "${targetStatus}"!`);
      }
      if (refreshCRMData) await refreshCRMData();
    } catch (err) {
      showToast(`Erro ao alterar estado: ${err.message}`);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // ---------------------------------------------------------------------------
  // REJEIÇÃO FINANCEIRA COM MOTIVO OBRIGATÓRIO
  // ---------------------------------------------------------------------------
  const handleExecuteRejection = async () => {
    if (!rejectingLead || isProcessingRejection) return;

    const cleanReason = rejectionReason.trim();
    if (!cleanReason) {
      setRejectionError('O motivo da rejeição é estritamente obrigatório.');
      return;
    }

    try {
      setIsProcessingRejection(true);
      const lead = rejectingLead;
      const adminEmail = session?.user?.email || 'admin@aquitem.ao';
      const formattedTimestamp = new Date().toLocaleString('pt-AO');

      const auditNote = `[COMPROVATIVO REJEITADO] Rejeitado pelo administrador (${adminEmail}) em ${formattedTimestamp}. Motivo obrigatório: "${cleanReason}". Pagamento mantido NÃO CONFIRMADO. Cliente notificado para novo envio.`;

      // 1. Actualizar estado no CRM
      await updateLeadStatus(lead.id, 'Aguardando Pagamento', auditNote);

      // 2. Sincronizar com gestor local
      updateOrderStatus(lead.orderCode, 'Aguardando Pagamento');

      // 3. Registo de Auditoria Imutável
      try {
        if (supabase) {
          await supabase.from('receipt_financial_audits').insert([{
            order_code: lead.orderCode,
            lead_id: lead.id,
            decision: 'REJEITADO',
            previous_status: lead.status || 'Comprovativo Recebido',
            new_status: 'Aguardando Pagamento',
            amount_total: lead.totalValue,
            payment_method: lead.paymentMethod,
            receipt_storage_path: lead.storagePath,
            admin_email: adminEmail,
            reason_or_notes: cleanReason
          }]);
        }
      } catch (_auditErr) {
        console.warn('Registo na tabela de auditoria (opcional):', _auditErr);
      }

      // 4. Notificar cliente por e-mail pelo Brevo
      if (lead.email && lead.email.includes('@')) {
        sendBrevoTransactionalEmail({
          templateType: 'receipt_rejected',
          to: lead.email,
          recipientName: lead.name,
          orderData: {
            id: lead.orderCode,
            customerName: lead.name,
            reason: cleanReason
          }
        }).catch(err => console.warn('Aviso no envio de e-mail Brevo rejeição:', err));
      }

      showToast(`Comprovativo da encomenda #${lead.orderCode} rejeitado. Motivo registado no histórico.`);
      setRejectingLead(null);
      setRejectionReason('');
      setRejectionError('');
      if (selectedReceiptLead?.id === lead.id) {
        setSelectedReceiptLead(null);
      }
    } catch (err) {
      showToast(`Erro ao rejeitar comprovativo: ${err.message}`);
    } finally {
      setIsProcessingRejection(false);
    }
  };

  // ---------------------------------------------------------------------------
  // EXPORTAÇÃO DE RELATÓRIO FINANCEIRO (CSV)
  // ---------------------------------------------------------------------------
  const handleExportCSV = () => {
    try {
      const headers = [
        'Código AQT',
        'Cliente',
        'Telefone',
        'E-mail',
        'Província',
        'Produto',
        'Valor Total (Kz)',
        'Taxa Transporte (Kz)',
        'Método Pagamento',
        'Estado',
        'Decisão Financeira',
        'Data Encomenda',
        'Nº Rastreio'
      ];

      const rows = filteredOrders.map(ord => [
        `"${ord.orderCode}"`,
        `"${(ord.name || '').replace(/"/g, '""')}"`,
        `"${ord.phone || ''}"`,
        `"${ord.email || ''}"`,
        `"${ord.city || 'Luanda'}"`,
        `"${(ord.productName || '').replace(/"/g, '""')}"`,
        ord.totalValue,
        ord.deliveryFee,
        `"${ord.paymentMethod}"`,
        `"${ord.status}"`,
        ord.isApproved ? '"APROVADO"' : (ord.isRejected ? '"REJEITADO"' : '"PENDENTE"'),
        `"${ord.createdAt ? new Date(ord.createdAt).toLocaleString('pt-AO') : ''}"`,
        `"${ord.trackingNumber}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_comprovativos_aquitem_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Relatório financeiro exportado com sucesso em CSV!');
    } catch (err) {
      showToast(`Erro ao exportar relatório: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>

      {/* ===================================================================== */}
      {/* 1. DASHBOARD FINANCEIRO — KPIS REAIS SUPABASE                         */}
      {/* ===================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '12px'
        }}
      >
        {/* Total Recebidos */}
        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Comprovativos
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.totalCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Volume: <strong>{metrics.totalGeneralKz.toLocaleString('pt-AO')} Kz</strong>
          </div>
        </div>

        {/* Pendentes */}
        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(2, 132, 199, 0.35)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pendentes
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0284c7', marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.pendingCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '2px', fontWeight: 700 }}>
            {metrics.totalPendingKz.toLocaleString('pt-AO')} Kz a validar
          </div>
        </div>

        {/* Aprovados */}
        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(22, 163, 74, 0.35)' }}>
          <div style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Aprovados
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#16A34A', marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.approvedCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#16A34A', marginTop: '2px', fontWeight: 700 }}>
            {metrics.totalApprovedKz.toLocaleString('pt-AO')} Kz confirmados
          </div>
        </div>

        {/* Rejeitados */}
        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(220, 38, 38, 0.35)' }}>
          <div style={{ fontSize: '0.74rem', color: '#DC2626', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Rejeitados
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#DC2626', marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.rejectedCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '2px', fontWeight: 700 }}>
            {metrics.totalRejectedKz.toLocaleString('pt-AO')} Kz recusados
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. SUB-MENU DE NAVEGAÇÃO & CENTRO DE CONTROLO                         */}
      {/* ===================================================================== */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: '14px',
          border: '1px solid var(--border-light)',
          padding: '8px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', overflowX: 'auto' }}>
          {[
            { id: 'visao-geral', label: 'Visão Geral', count: null },
            { id: 'novos', label: 'Novos', count: receiptOrders.filter(o => o.isPending && o.status === 'Novo Lead').length },
            { id: 'pendentes', label: 'Pendentes de Validação', count: metrics.pendingCount },
            { id: 'aprovados', label: 'Pagamentos Aprovados', count: metrics.approvedCount },
            { id: 'rejeitados', label: 'Comprovativos Rejeitados', count: metrics.rejectedCount },
            { id: 'auditoria', label: 'Histórico & Auditoria', count: null },
            { id: 'relatorios', label: 'Relatórios & Exportação', count: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'var(--primary-orange)' : 'transparent',
                color: activeTab === tab.id ? '#FFF' : 'var(--text-main)',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
              {tab.count !== null && (
                <span
                  style={{
                    background: activeTab === tab.id ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: '#FFF',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    fontSize: '0.70rem',
                    fontWeight: 800
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={refreshCRMData}
            className="nav-btn"
            style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            title="Sincronizar com base de dados Supabase"
          >
            <RefreshCw size={13} /> Atualizar
          </button>
          <button
            onClick={handleExportCSV}
            className="nav-btn nav-btn-orange"
            style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            title="Exportar dados filtrados em formato CSV"
          >
            <Download size={13} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. BARRA DE PESQUISA & FILTROS MULTIDIMENSIONAIS                      */}
      {/* ===================================================================== */}
      {activeTab !== 'auditoria' && activeTab !== 'relatorios' && (
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', flex: 1, minWidth: '280px' }}>
            {/* Campo de Pesquisa Textual */}
            <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '200px' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Pesquisar código AQT, cliente, telefone, e-mail..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '34px', width: '100%', boxSizing: 'border-box', fontSize: '0.84rem' }}
              />
            </div>

            {/* Filtro por Método de Pagamento */}
            <select
              value={paymentMethodFilter}
              onChange={e => setPaymentMethodFilter(e.target.value)}
              className="form-input"
              style={{ width: 'auto', minWidth: '160px', fontSize: '0.82rem' }}
            >
              <option value="all">Todos os Pagamentos</option>
              <option value="express">Multicaixa Express / PayPay</option>
              <option value="bfa">Transferência Bancária BFA</option>
            </select>

            {/* Filtro por Período */}
            <select
              value={datePeriodFilter}
              onChange={e => setDatePeriodFilter(e.target.value)}
              className="form-input"
              style={{ width: 'auto', minWidth: '130px', fontSize: '0.82rem' }}
            >
              <option value="all">Todo o Período</option>
              <option value="today">Hoje</option>
              <option value="7days">Últimos 7 Dias</option>
              <option value="month">Este Mês</option>
            </select>

            {/* Ordenação */}
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className="form-input"
              style={{ width: 'auto', minWidth: '130px', fontSize: '0.82rem' }}
            >
              <option value="recent">Mais Recentes</option>
              <option value="oldest">Mais Antigos</option>
              <option value="highest">Maior Valor</option>
              <option value="lowest">Menor Valor</option>
            </select>
          </div>

          <div style={{ fontSize: '0.80rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {filteredOrders.length} de {receiptOrders.length} encomendas
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. LISTA PRINCIPAL DE COMPROVATIVOS (Cards Responsivos)               */}
      {/* ===================================================================== */}
      {activeTab !== 'auditoria' && activeTab !== 'relatorios' && (
        <div>
          {filteredOrders.length === 0 ? (
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '48px 20px',
                borderRadius: '14px',
                border: '1px solid var(--border-light)',
                textAlign: 'center'
              }}
            >
              <FileText size={44} style={{ opacity: 0.25, color: '#0284c7', margin: '0 auto 10px' }} />
              <h3 style={{ margin: '0 0 6px', fontWeight: 800 }}>Nenhum Comprovativo Neste Separador</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: '440px', marginInline: 'auto' }}>
                Os comprovativos bancários submetidos pelos clientes no checkout ou pelo portal surgirão automaticamente aqui para conferência.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {filteredOrders.map(order => {
                const isApproved = order.isApproved;
                const isRejected = order.isRejected;
                const cleanPhone = (order.phone || '').replace(/[^0-9]/g, '');

                return (
                  <div
                    key={order.id}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: '12px',
                      border: isApproved
                        ? '1px solid rgba(22, 163, 74, 0.3)'
                        : isRejected
                          ? '1px solid rgba(220, 38, 38, 0.3)'
                          : '1px solid rgba(2, 132, 199, 0.3)',
                      padding: '16px 18px',
                      display: 'grid',
                      gap: '12px',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    {/* Header do Card */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.02em' }}>
                          #{order.orderCode}
                        </span>
                        <span
                          style={{
                            background: isApproved ? 'rgba(22, 163, 74, 0.12)' : isRejected ? 'rgba(220, 38, 38, 0.12)' : 'rgba(2, 132, 199, 0.12)',
                            color: isApproved ? '#16A34A' : isRejected ? '#DC2626' : '#0284c7',
                            border: `1px solid ${isApproved ? 'rgba(22, 163, 74, 0.3)' : isRejected ? 'rgba(220, 38, 38, 0.3)' : 'rgba(2, 132, 199, 0.3)'}`,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isApproved ? <CheckCircle size={12} /> : isRejected ? <AlertTriangle size={12} /> : <Clock size={12} />}
                          {isApproved ? 'Pagamento Aprovado • Agendado' : isRejected ? 'Comprovativo Rejeitado' : 'Pendente de Validação'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#ff8a3d', fontWeight: 700 }}>
                          {order.paymentMethod}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Data: <strong>{new Date(order.createdAt).toLocaleDateString('pt-AO')}</strong> às {new Date(order.createdAt).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Dados em 3 colunas compactas */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', fontSize: '0.82rem' }}>
                      {/* Cliente */}
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.92rem' }}>{order.name}</div>
                        <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>📞 {order.phone || 'Sem telemóvel'}</div>
                        {order.email && <div style={{ color: '#0284c7', marginTop: '1px' }}>✉️ {order.email}</div>}
                        <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>📍 {order.city || 'Luanda'} • {order.address || 'Angola'}</div>
                      </div>

                      {/* Artigos e Total */}
                      <div>
                        <div style={{ fontWeight: 700, color: '#1E5C9E' }}>📦 {order.productName || 'Artigo da Loja'}</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary-orange)', marginTop: '2px' }}>
                          {order.totalValue.toLocaleString('pt-AO')} Kz
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Taxa de Transporte: <strong>{order.deliveryFee.toLocaleString('pt-AO')} Kz</strong>
                        </div>
                      </div>

                      {/* Rastreio e Comprovativo */}
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>
                          Bucket: <strong style={{ color: '#0284c7' }}>payment-receipts (Privado)</strong>
                        </div>
                        <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                          Doc: <strong>{order.fileName}</strong>
                        </div>
                        <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                          Nº Rastreio: <strong style={{ color: '#ff6500' }}>{order.trackingNumber}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Ações Rápidas */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
                      <button
                        onClick={() => handleOpenReceiptDetail(order)}
                        className="nav-btn"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.25)', fontWeight: 700 }}
                      >
                        <Eye size={13} /> Ficha do Comprovativo
                      </button>

                      {!isApproved && (
                        <button
                          onClick={() => {
                            setApprovingLead(order);
                            setApprovalNote('');
                          }}
                          className="nav-btn"
                          style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#16A34A', color: '#FFF', border: 'none', fontWeight: 800 }}
                        >
                          <CheckCircle size={13} /> APROVAR PAGAMENTO
                        </button>
                      )}

                      {!isApproved && (
                        <button
                          onClick={() => {
                            setRejectingLead(order);
                            setRejectionReason('');
                            setRejectionError('');
                          }}
                          className="nav-btn"
                          style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', border: '1px solid rgba(220, 38, 38, 0.25)', fontWeight: 700 }}
                        >
                          <AlertTriangle size={13} /> REJEITAR COMPROVATIVO
                        </button>
                      )}

                      {/* Acções de Avanço do Ciclo de Vida da Encomenda (Modelos Oficiais Brevo) */}
                      {isApproved && (
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {order.status !== 'Em Preparação' && order.status !== 'Em Rota' && order.status !== 'Entregue' && (
                            <button
                              onClick={() => handleAdvanceOrderStatus(order, 'Em Preparação')}
                              className="nav-btn"
                              style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#2563EB', color: '#FFF', border: 'none', fontWeight: 700 }}
                              title="Avançar para Preparação & Controlo de Qualidade (Dispara e-mail de preparação)"
                            >
                              <Package size={13} /> Preparação
                            </button>
                          )}

                          {order.status !== 'Em Rota' && order.status !== 'Entregue' && (
                            <button
                              onClick={() => handleAdvanceOrderStatus(order, 'Em Rota')}
                              className="nav-btn"
                              style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#EA580C', color: '#FFF', border: 'none', fontWeight: 700 }}
                              title="Despachar viatura com estafeta (Dispara e-mail em rota)"
                            >
                              <Truck size={13} /> Despachar em Rota
                            </button>
                          )}

                          {order.status !== 'Entregue' && (
                            <button
                              onClick={() => handleAdvanceOrderStatus(order, 'Entregue')}
                              className="nav-btn"
                              style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#059669', color: '#FFF', border: 'none', fontWeight: 700 }}
                              title="Confirmar entrega finalizada e activar garantia (Dispara e-mail de garantia)"
                            >
                              <CheckCircle size={13} /> Concluir Entrega
                            </button>
                          )}
                        </div>
                      )}

                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone.startsWith('244') ? cleanPhone : `244${cleanPhone}`}?text=${encodeURIComponent(`Olá ${order.name}, entramos em contacto da AQUI TEM Angola a respeito da sua encomenda #${order.orderCode}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#25D366',
                            color: '#FFF',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 700
                          }}
                        >
                          <MessageCircle size={13} /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. SEPARADOR EXCLUSIVO: ARMAZENAMENTO & GALERIA DE RECIBOS            */}
      {/* ===================================================================== */}
      {activeTab === 'armazenamento' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Banner de Controlo do Armazenamento */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(255, 101, 0, 0.05) 100%)',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              borderRadius: '14px',
              padding: '18px 22px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <FolderOpen size={16} /> Bucket Privado Supabase Storage: payment-receipts
              </div>
              <h2 style={{ margin: '4px 0 6px 0', fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)' }}>
                Galeria de Armazenamento de Comprovativos Bancários
              </h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                Repositório oficial dos ficheiros (JPG, PNG, PDF) submetidos pelos clientes no checkout e portal. Todos os ficheiros permanecem protegidos com acesso via URLs assinados temporários.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ background: 'var(--bg-card)', padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Ficheiros</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-orange)' }}>{galleryOrders.length}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Imagens</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0284c7' }}>{galleryOrders.filter(o => !o.isPdf).length}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Documentos PDF</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#DC2626' }}>{galleryOrders.filter(o => o.isPdf).length}</div>
              </div>
            </div>
          </div>

          {/* Barra de Filtros da Galeria */}
          <div
            style={{
              background: 'var(--bg-card)',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filtrar por código AQT, nome do cliente, telemóvel ou ficheiro..."
                  value={gallerySearch}
                  onChange={e => setGallerySearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '34px', width: '100%', boxSizing: 'border-box', fontSize: '0.84rem' }}
                />
              </div>

              {/* Filtro por Formato */}
              <select
                value={galleryFilter}
                onChange={e => setGalleryFilter(e.target.value)}
                className="form-input"
                style={{ width: 'auto', minWidth: '150px', fontSize: '0.82rem' }}
              >
                <option value="all">Todos os Formatos</option>
                <option value="images">Apenas Imagens (JPG/PNG)</option>
                <option value="pdfs">Apenas Documentos PDF</option>
              </select>

              {/* Filtro por Estado */}
              <select
                value={galleryStatusFilter}
                onChange={e => setGalleryStatusFilter(e.target.value)}
                className="form-input"
                style={{ width: 'auto', minWidth: '160px', fontSize: '0.82rem' }}
              >
                <option value="all">Todos os Estados</option>
                <option value="pending">Pendentes de Validação</option>
                <option value="approved">Pagamentos Aprovados</option>
                <option value="rejected">Comprovativos Rejeitados</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={refreshCRMData}
                className="nav-btn"
                style={{ padding: '7px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                title="Sincronizar ficheiros com Supabase Storage"
              >
                <RefreshCw size={13} className={loadingGalleryUrls ? 'spin' : ''} /> Actualizar Galeria
              </button>
            </div>
          </div>

          {/* Grid de Imagens e Documentos da Galeria */}
          {galleryOrders.length === 0 ? (
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '48px 20px',
                borderRadius: '14px',
                border: '1px solid var(--border-light)',
                textAlign: 'center'
              }}
            >
              <FolderOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 800 }}>Nenhum comprovativo encontrado</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                Não existem ficheiros no bucket que correspondam aos filtros de pesquisa actuais.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              }}
            >
              {galleryOrders.map(ord => {
                const signedUrl = cachedSignedUrls[ord.storagePath];
                const uploadDateFormatted = ord.uploadedAt
                  ? new Date(ord.uploadedAt).toLocaleString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'Data registada';

                return (
                  <div
                    key={ord.id}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: '14px',
                      border: ord.isApproved ? '1px solid rgba(22, 163, 74, 0.4)' : (ord.isRejected ? '1px solid rgba(220, 38, 38, 0.4)' : '1px solid rgba(2, 132, 199, 0.35)'),
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    {/* Área do Thumbnail / Pré-visualização */}
                    <div
                      style={{
                        height: '170px',
                        background: '#0B0F19',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden'
                      }}
                      onClick={() => {
                        setSelectedReceiptLead(ord);
                        handleFetchSignedUrl(ord);
                      }}
                      title="Clique para abrir e ampliar comprovativo em alta definição"
                    >
                      {ord.isPdf ? (
                        <div style={{ textAlign: 'center', color: '#FFF', padding: '16px' }}>
                          <FileText size={48} color="#EF4444" style={{ margin: '0 auto 8px' }} />
                          <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>Documento Digital PDF</div>
                          <div style={{ fontSize: '0.70rem', color: '#94A3B8', marginTop: '2px', wordBreak: 'break-all' }}>
                            {ord.fileName}
                          </div>
                        </div>
                      ) : signedUrl ? (
                        <img
                          src={signedUrl}
                          alt={`Recibo ${ord.orderCode}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.2s ease'
                          }}
                          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                      ) : (
                        <div style={{ textAlign: 'center', color: '#94A3B8', padding: '16px' }}>
                          <ImageIcon size={40} style={{ margin: '0 auto 6px', opacity: 0.6 }} />
                          <div style={{ fontSize: '0.75rem' }}>A carregar pré-visualização segura...</div>
                        </div>
                      )}

                      {/* Badge de Formato */}
                      <span
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          background: ord.isPdf ? '#EF4444' : '#0284c7',
                          color: '#FFF',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase'
                        }}
                      >
                        {ord.isPdf ? 'PDF' : (ord.fileName.split('.').pop() || 'IMG').toUpperCase()}
                      </span>

                      {/* Botão de Ampliação */}
                      <button
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: 'rgba(0,0,0,0.6)',
                          color: '#FFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Ampliar"
                      >
                        <Maximize2 size={14} />
                      </button>
                    </div>

                    {/* Conteúdo Informativo */}
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 900, color: 'var(--primary-orange)' }}>
                            #{ord.orderCode}
                          </div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                            {ord.name}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            background: ord.isApproved ? 'rgba(22, 163, 74, 0.15)' : (ord.isRejected ? 'rgba(220, 38, 38, 0.15)' : 'rgba(2, 132, 199, 0.15)'),
                            color: ord.isApproved ? '#16A34A' : (ord.isRejected ? '#DC2626' : '#0284c7'),
                            border: `1px solid ${ord.isApproved ? 'rgba(22, 163, 74, 0.3)' : (ord.isRejected ? 'rgba(220, 38, 38, 0.3)' : 'rgba(2, 132, 199, 0.3)')}`
                          }}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <div>📱 {ord.phone}</div>
                        {ord.email && <div style={{ marginTop: '2px', wordBreak: 'break-all' }}>✉️ {ord.email}</div>}
                        <div style={{ marginTop: '2px', color: 'var(--text-main)', fontWeight: 700 }}>
                          💰 {ord.totalValue.toLocaleString('pt-AO')} Kz • {ord.paymentMethod}
                        </div>
                        <div style={{ marginTop: '4px', fontSize: '0.72rem' }}>
                          🕒 Enviado em: <strong>{uploadDateFormatted}</strong>
                        </div>
                      </div>

                      {/* Barra de Ações Rápidas na Galeria */}
                      <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            setSelectedReceiptLead(ord);
                            handleFetchSignedUrl(ord);
                          }}
                          className="nav-btn"
                          style={{ flex: 1, padding: '6px 10px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.25)', fontWeight: 700 }}
                        >
                          <Eye size={12} /> Ver Recibo
                        </button>

                        {signedUrl && (
                          <a
                            href={signedUrl}
                            download={ord.fileName}
                            target="_blank"
                            rel="noreferrer"
                            className="nav-btn"
                            style={{ padding: '6px 10px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'var(--bg-body)', color: 'var(--text-main)', border: '1px solid var(--border-light)', textDecoration: 'none' }}
                            title="Descarregar ficheiro original"
                          >
                            <Download size={12} />
                          </a>
                        )}

                        {!ord.isApproved && (
                          <button
                            onClick={() => {
                              setApprovingLead(ord);
                              setApprovalNote('');
                            }}
                            className="nav-btn"
                            style={{ padding: '6px 10px', fontSize: '0.76rem', background: '#16A34A', color: '#FFF', border: 'none', fontWeight: 800 }}
                            title="Validar entrada bancária e aprovar encomenda"
                          >
                            <CheckCircle size={12} /> Aprovar
                          </button>
                        )}

                        {ord.isApproved && ord.status !== 'Em Preparação' && ord.status !== 'Em Rota' && ord.status !== 'Entregue' && (
                          <button
                            onClick={() => handleAdvanceOrderStatus(ord, 'Em Preparação')}
                            className="nav-btn"
                            style={{ padding: '6px 10px', fontSize: '0.76rem', background: '#2563EB', color: '#FFF', border: 'none', fontWeight: 700 }}
                            title="Avançar para Preparação (Dispara e-mail Brevo)"
                          >
                            <Package size={12} /> Preparar
                          </button>
                        )}

                        {ord.isApproved && ord.status === 'Em Preparação' && (
                          <button
                            onClick={() => handleAdvanceOrderStatus(ord, 'Em Rota')}
                            className="nav-btn"
                            style={{ padding: '6px 10px', fontSize: '0.76rem', background: '#EA580C', color: '#FFF', border: 'none', fontWeight: 700 }}
                            title="Despachar em Rota (Dispara e-mail Brevo)"
                          >
                            <Truck size={12} /> Despachar
                          </button>
                        )}

                        {ord.isApproved && ord.status === 'Em Rota' && (
                          <button
                            onClick={() => handleAdvanceOrderStatus(ord, 'Entregue')}
                            className="nav-btn"
                            style={{ padding: '6px 10px', fontSize: '0.76rem', background: '#059669', color: '#FFF', border: 'none', fontWeight: 700 }}
                            title="Confirmar Entrega (Dispara e-mail de Garantia)"
                          >
                            <CheckCircle size={12} /> Entregue
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. SEPARADOR: HISTÓRICO DE VALIDAÇÕES & AUDITORIA IMUTÁVEL            */}
      {/* ===================================================================== */}
      {activeTab === 'auditoria' && (
        <div style={{ background: 'var(--bg-card)', padding: '22px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldCheck size={20} color="#0284c7" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
              Registo de Auditoria Imutável de Decisões Financeiras
            </h3>
          </div>
          <p style={{ margin: '0 0 18px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
            Histórico cronológico detalhado de todas as aprovações e rejeições efectuadas por administradores autorizados. Este registo não permite eliminação pela interface.
          </p>

          <div style={{ display: 'grid', gap: '10px' }}>
            {receiptOrders.flatMap(ord => (ord.history || []).map((h, i) => ({ ...h, orderCode: ord.orderCode, clientName: ord.name, leadId: ord.id })))
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((audit, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-body)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '0.82rem',
                    display: 'grid',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary-orange)' }}>
                      #{audit.orderCode} • {audit.action}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                      {audit.date ? new Date(audit.date).toLocaleString('pt-AO') : 'Data registada'}
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-main)', marginTop: '2px', lineHeight: 1.4 }}>
                    {audit.details || 'Registo gravado no sistema financeiro.'}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '2px' }}>
                    Cliente: <strong>{audit.clientName}</strong>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. SEPARADOR: RELATÓRIOS CONSOLIDADOS & EXPORTAÇÃO                   */}
      {/* ===================================================================== */}
      {activeTab === 'relatorios' && (
        <div style={{ background: 'var(--bg-card)', padding: '22px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                Relatório Financeiro de Comprovativos
              </h3>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                Extrato executivo de receitas conferidas, valores em análise e eficácia de liquidação.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => window.print()}
                className="nav-btn"
                style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={14} /> Imprimir Relatório
              </button>
              <button
                onClick={handleExportCSV}
                className="nav-btn nav-btn-orange"
                style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} /> Descarregar CSV
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-body)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Faturado & Aprovado</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#16A34A', marginTop: '4px' }}>
                {metrics.totalApprovedKz.toLocaleString('pt-AO')} Kz
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {metrics.approvedCount} pagamentos validados
              </div>
            </div>

            <div style={{ background: 'var(--bg-body)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700 }}>Capital em Validação (Pendente)</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0284c7', marginTop: '4px' }}>
                {metrics.totalPendingKz.toLocaleString('pt-AO')} Kz
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {metrics.pendingCount} encomendas a aguardar
              </div>
            </div>

            <div style={{ background: 'var(--bg-body)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700 }}>Taxa de Aprovação Financeira</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--primary-orange)', marginTop: '4px' }}>
                {metrics.totalCount > 0 ? ((metrics.approvedCount / metrics.totalCount) * 100).toFixed(1) : 0}%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Eficácia de conversão de transferências
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. FICHA INDIVIDUAL DO COMPROVATIVO (Modal Detalhado)                 */}
      {/* ===================================================================== */}
      {selectedReceiptLead && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: '16px',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Header do Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                  Ficha Individual do Comprovativo
                </div>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  Encomenda #{selectedReceiptLead.orderCode}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceiptLead(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Grid 2 colunas com dados completos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', fontSize: '0.84rem' }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '6px' }}>
                  Dados do Cliente & Entrega
                </div>
                <div><strong>Nome:</strong> {selectedReceiptLead.name}</div>
                <div style={{ marginTop: '3px' }}><strong>Telemóvel:</strong> {selectedReceiptLead.phone}</div>
                <div style={{ marginTop: '3px' }}><strong>E-mail:</strong> {selectedReceiptLead.email || 'Não informado'}</div>
                <div style={{ marginTop: '3px' }}><strong>Província:</strong> {selectedReceiptLead.city || 'Luanda'}</div>
                <div style={{ marginTop: '3px' }}><strong>Morada Completa:</strong> {selectedReceiptLead.address || 'Angola'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '6px' }}>
                  Detalhes Financeiros
                </div>
                <div><strong>Produto:</strong> {selectedReceiptLead.productName}</div>
                <div style={{ marginTop: '3px' }}><strong>Taxa de Transporte:</strong> {selectedReceiptLead.deliveryFee.toLocaleString('pt-AO')} Kz</div>
                <div style={{ marginTop: '3px', fontSize: '1.05rem', fontWeight: 900, color: 'var(--primary-orange)' }}>
                  Total a Conferir: {selectedReceiptLead.totalValue.toLocaleString('pt-AO')} Kz
                </div>
                <div style={{ marginTop: '4px' }}><strong>Método:</strong> {selectedReceiptLead.paymentMethod}</div>
                <div style={{ marginTop: '3px' }}><strong>Nº de Rastreio:</strong> {selectedReceiptLead.trackingNumber}</div>
              </div>
            </div>

            {/* Visualizador Seguro do Documento */}
            <div style={{ marginTop: '20px', background: 'var(--bg-body)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} /> Documento Original no Storage Privado
                </div>
                {documentSignedUrl && (
                  <a
                    href={documentSignedUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.78rem', color: '#ff8a3d', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={13} /> Abrir em Nova Janela
                  </a>
                )}
              </div>

              {loadingSignedUrl ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  A gerar ligação assinada segura via Edge Function backend...
                </div>
              ) : documentSignedUrl ? (
                <div>
                  {(selectedReceiptLead?.isPdf || selectedReceiptLead?.storagePath?.toLowerCase().endsWith('.pdf') || selectedReceiptLead?.fileName?.toLowerCase().endsWith('.pdf')) ? (
                    <div style={{ padding: '26px 20px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', textAlign: 'center' }}>
                      <FileText size={44} color="#EF4444" style={{ margin: '0 auto 8px', display: 'block' }} />
                      <div style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '0.92rem' }}>
                        {selectedReceiptLead.fileName || 'Comprovativo_Pagamento.pdf'}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
                        Documento Oficial em formato PDF • Guardado com Segurança no Supabase Storage
                      </div>
                      <div style={{ marginTop: '14px' }}>
                        <a
                          href={documentSignedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="nav-btn"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', textDecoration: 'none', background: '#EF4444', color: '#FFF', fontWeight: 800, padding: '8px 18px', borderRadius: '8px' }}
                        >
                          <ExternalLink size={15} /> Abrir & Visualizar PDF Completo
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ maxHeight: '300px', overflow: 'hidden', borderRadius: '8px', display: 'flex', justifyContent: 'center', background: '#000' }}>
                        <img
                          src={documentSignedUrl}
                          alt="Comprovativo"
                          style={{ maxHeight: '300px', width: 'auto', objectFit: 'contain' }}
                        />
                      </div>
                      <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <a
                          href={documentSignedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="nav-btn"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', textDecoration: 'none', background: '#0284c7', color: '#FFF' }}
                        >
                          <Download size={14} /> Visualizar / Descarregar Imagem Original
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Nenhum comprovativo carregado ou acesso ainda não emitido.
                </div>
              )}
            </div>

            {/* Ações de Aprovação / Rejeição no Modal */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
              <button
                onClick={() => setSelectedReceiptLead(null)}
                className="nav-btn"
                style={{ padding: '8px 16px', fontSize: '0.84rem' }}
              >
                Fechar
              </button>

              {!selectedReceiptLead.isApproved && (
                <button
                  onClick={() => {
                    setRejectingLead(selectedReceiptLead);
                    setRejectionReason('');
                    setRejectionError('');
                  }}
                  className="nav-btn"
                  style={{ padding: '8px 16px', fontSize: '0.84rem', background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', border: '1px solid rgba(220, 38, 38, 0.3)', fontWeight: 700 }}
                >
                  <AlertTriangle size={14} /> REJEITAR
                </button>
              )}

              {!selectedReceiptLead.isApproved && (
                <button
                  onClick={() => {
                    setApprovingLead(selectedReceiptLead);
                    setApprovalNote('');
                  }}
                  className="nav-btn"
                  style={{ padding: '8px 18px', fontSize: '0.84rem', background: '#16A34A', color: '#FFF', border: 'none', fontWeight: 800 }}
                >
                  <CheckCircle size={14} /> APROVAR PAGAMENTO
                </button>
              )}

              {selectedReceiptLead.isApproved && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedReceiptLead.status !== 'Em Preparação' && selectedReceiptLead.status !== 'Em Rota' && selectedReceiptLead.status !== 'Entregue' && (
                    <button
                      onClick={() => {
                        handleAdvanceOrderStatus(selectedReceiptLead, 'Em Preparação');
                        setSelectedReceiptLead(null);
                      }}
                      className="nav-btn"
                      style={{ padding: '8px 14px', fontSize: '0.82rem', background: '#2563EB', color: '#FFF', border: 'none', fontWeight: 700 }}
                    >
                      <Package size={14} /> Em Preparação
                    </button>
                  )}
                  {selectedReceiptLead.status !== 'Em Rota' && selectedReceiptLead.status !== 'Entregue' && (
                    <button
                      onClick={() => {
                        handleAdvanceOrderStatus(selectedReceiptLead, 'Em Rota');
                        setSelectedReceiptLead(null);
                      }}
                      className="nav-btn"
                      style={{ padding: '8px 14px', fontSize: '0.82rem', background: '#EA580C', color: '#FFF', border: 'none', fontWeight: 700 }}
                    >
                      <Truck size={14} /> Despachar em Rota
                    </button>
                  )}
                  {selectedReceiptLead.status !== 'Entregue' && (
                    <button
                      onClick={() => {
                        handleAdvanceOrderStatus(selectedReceiptLead, 'Entregue');
                        setSelectedReceiptLead(null);
                      }}
                      className="nav-btn"
                      style={{ padding: '8px 14px', fontSize: '0.82rem', background: '#059669', color: '#FFF', border: 'none', fontWeight: 700 }}
                    >
                      <CheckCircle size={14} /> Confirmar Entregue
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 8. MODAL DE CONFIRMAÇÃO EXPLÍCITA DE APROVAÇÃO                       */}
      {/* ===================================================================== */}
      {approvingLead && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16A34A', marginBottom: '12px' }}>
              <CheckCircle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Confirmar Aprovação de Pagamento
              </h3>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.5, margin: '0 0 16px' }}>
              Confirma que verificou na conta bancária (BFA ou Multicaixa Express) a entrada efectiva do valor de{' '}
              <strong style={{ color: 'var(--primary-orange)' }}>{approvingLead.totalValue.toLocaleString('pt-AO')} Kz</strong>{' '}
              respeitante à encomenda <strong>#{approvingLead.orderCode}</strong> do cliente <strong>{approvingLead.name}</strong>?
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                Observação Administrativa Opcional:
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Entrada conferida no extrato BFA ref. 98035265..."
                value={approvalNote}
                onChange={e => setApprovalNote(e.target.value)}
                className="form-input"
                style={{ width: '100%', boxSizing: 'border-box', fontSize: '0.84rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                disabled={isProcessingApproval}
                onClick={() => setApprovingLead(null)}
                className="nav-btn"
                style={{ padding: '8px 16px', fontSize: '0.84rem' }}
              >
                Cancelar
              </button>
              <button
                disabled={isProcessingApproval}
                onClick={handleExecuteApproval}
                className="nav-btn"
                style={{
                  padding: '8px 20px',
                  fontSize: '0.84rem',
                  background: '#16A34A',
                  color: '#FFF',
                  border: 'none',
                  fontWeight: 800,
                  opacity: isProcessingApproval ? 0.6 : 1,
                  cursor: isProcessingApproval ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessingApproval ? 'A Processar...' : 'Sim, Aprovar Pagamento & Agendar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 9. MODAL DE REJEIÇÃO COM MOTIVO OBRIGATÓRIO                          */}
      {/* ===================================================================== */}
      {rejectingLead && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626', marginBottom: '12px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Rejeitar Comprovativo de Pagamento
              </h3>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.5, margin: '0 0 16px' }}>
              Indique o motivo pelo qual o comprovativo da encomenda <strong>#{rejectingLead.orderCode}</strong> não foi aceite. O cliente será notificado por e-mail com esta justificação e poderá submeter um novo documento.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                Motivo da Rejeição (Obrigatório):
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Valor transferido divergente do total da encomenda, dados do titular ilegíveis ou conta de destino incorreta..."
                value={rejectionReason}
                onChange={e => {
                  setRejectionReason(e.target.value);
                  if (rejectionError) setRejectionError('');
                }}
                className="form-input"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  fontSize: '0.84rem',
                  borderColor: rejectionError ? '#DC2626' : undefined
                }}
              />
              {rejectionError && (
                <div style={{ color: '#DC2626', fontSize: '0.76rem', marginTop: '4px', fontWeight: 700 }}>
                  {rejectionError}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                disabled={isProcessingRejection}
                onClick={() => {
                  setRejectingLead(null);
                  setRejectionReason('');
                  setRejectionError('');
                }}
                className="nav-btn"
                style={{ padding: '8px 16px', fontSize: '0.84rem' }}
              >
                Cancelar
              </button>
              <button
                disabled={isProcessingRejection}
                onClick={handleExecuteRejection}
                className="nav-btn"
                style={{
                  padding: '8px 20px',
                  fontSize: '0.84rem',
                  background: '#DC2626',
                  color: '#FFF',
                  border: 'none',
                  fontWeight: 800,
                  opacity: isProcessingRejection ? 0.6 : 1,
                  cursor: isProcessingRejection ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessingRejection ? 'A Registar...' : 'Confirmar Rejeição do Comprovativo'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
