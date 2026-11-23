/**
 * Serviço de Notificações WhatsApp da Empresa — AQUI TEM Angola
 * Destino Oficial: +244 950 752 933
 * Suporta MODO MOCK (Simulação) e MODO CLOUD API (Produção)
 * 
 * Eventos monitorizados:
 * 1. order_created: Nova encomenda registada no checkout
 * 2. receipt_submitted: Comprovativo bancário anexado (pendente de validação financeira)
 * 3. payment_confirmed: Pagamento aprovado pela administração & encomenda agendada
 * 4. order_processing: Embalagem e controlo de qualidade iniciado
 * 5. order_shipped: Encomenda em rota com estafeta
 * 6. order_delivered: Entrega finalizada ao cliente
 * 7. lead_captured: Novo lead captado através do site / formulário
 */

import { supabase, isSupabaseConfigured } from './supabase.js';
import { addNotificationToFeed } from '../utils/notificationSystem.js';

export const COMPANY_WHATSAPP_NUMBER = '244950752933';
export const COMPANY_WHATSAPP_DISPLAY = '+244 950 752 933';

// Cache em memória para prevenção estrita de notificações duplicadas no cliente
const deduplicationCache = new Set();

function isDuplicate(key) {
  if (!key) return false;
  if (deduplicationCache.has(key)) return true;
  try {
    const stored = sessionStorage.getItem(`aqt_wa_sent_${key}`);
    if (stored) return true;
  } catch (_e) {}
  return false;
}

function markAsSent(key) {
  if (!key) return;
  deduplicationCache.add(key);
  try {
    sessionStorage.setItem(`aqt_wa_sent_${key}`, String(Date.now()));
  } catch (_e) {}
}

/**
 * Notifica a equipa da empresa (+244 950 752 933) sobre eventos do ciclo de encomendas.
 * Em modo MOCK, simula e regista como SIMULATED. Em modo CLOUD_API, despacha via Meta.
 */
export async function notifyCompanyWhatsApp({
  eventType,
  orderData,
  deduplicationKey
}) {
  if (!orderData || !orderData.id) {
    console.warn('Aviso: notifyCompanyWhatsApp chamado sem orderData.id válido.');
    return { success: false, message: 'Dados da encomenda em falta.' };
  }

  const finalKey = deduplicationKey || `wa-${orderData.id}-${eventType}`;
  if (isDuplicate(finalKey)) {
    return {
      success: true,
      duplicate: true,
      message: `Notificação WhatsApp para ${orderData.id} (${eventType}) já foi despachada anteriormente.`
    };
  }

  markAsSent(finalKey);

  // 1. Despachar via Edge Function oficial 'whatsapp-api'
  if (isSupabaseConfigured && supabase?.functions) {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-api', {
        body: {
          action: 'notify-company',
          eventType,
          orderData,
          deduplicationKey: finalKey
        }
      });

      if (!error && data) {
        const isMock = data.mode === 'mock';

        addNotificationToFeed({
          type: 'whatsapp_company',
          title: `WhatsApp (${isMock ? 'MOCK' : 'API'}): #${orderData.id}`,
          message: isMock
            ? `[Simulação] Notificação de ${eventType} registada com sucesso no painel.`
            : (data.configured
                ? `Notificação enviada com sucesso para ${COMPANY_WHATSAPP_DISPLAY} via Cloud API.`
                : `Mensagem formatada para envio manual (${COMPANY_WHATSAPP_DISPLAY}).`),
          link: data.waLink || null
        });

        return {
          success: Boolean(data.success),
          mode: data.mode || (isMock ? 'mock' : 'cloud_api'),
          status: data.status || (isMock ? 'SIMULATED' : 'SENT'),
          isMock,
          destination: COMPANY_WHATSAPP_DISPLAY,
          formattedMessage: data.formattedMessage,
          waLink: data.waLink,
          temporarySignedUrl: data.temporarySignedUrl || null,
          documentProcessed: data.documentProcessed || null,
          message: data.message
        };
      }
    } catch (edgeErr) {
      console.warn('Aviso ao contactar Edge Function whatsapp-api:', edgeErr.message);
    }
  }

  // 2. Fallback de formatação local determinística caso a função esteja temporariamente offline
  const formatted = formatLocalCompanyMessage(eventType, orderData);
  const fallbackWaLink = `https://wa.me/${COMPANY_WHATSAPP_NUMBER}?text=${encodeURIComponent(formatted)}`;

  return {
    success: false,
    mode: 'mock',
    status: 'SIMULATED',
    fallback: true,
    destination: COMPANY_WHATSAPP_DISPLAY,
    formattedMessage: formatted,
    waLink: fallbackWaLink,
    message: 'Edge Function indisponível; mensagem formatada localmente para teste.'
  };
}

/**
 * Consulta o estado da integração com a WhatsApp Business Cloud API e modo actual
 */
export async function checkWhatsAppApiStatus() {
  if (!isSupabaseConfigured || !supabase?.functions) {
    return {
      configured: false,
      mode: 'mock',
      isMock: true,
      message: 'Supabase não está configurado.'
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('whatsapp-api', {
      body: { action: 'check-status' }
    });

    if (error || !data) {
      return {
        configured: false,
        mode: 'mock',
        isMock: true,
        message: error?.message || 'Falha ao consultar estado da API de WhatsApp.'
      };
    }

    return data;
  } catch (err) {
    return {
      configured: false,
      mode: 'mock',
      isMock: true,
      message: err.message || 'Erro ao conectar à função whatsapp-api.'
    };
  }
}

/**
 * Notifica a equipa da empresa (+244 950 752 933) sobre novos leads captados
 */
export async function notifyCompanyNewLead(leadData) {
  if (!leadData) return { success: false, message: 'Dados do lead em falta.' };

  const deduplicationKey = `lead-${leadData.phone || leadData.email || Date.now()}-${leadData.productName || 'geral'}`;
  if (isDuplicate(deduplicationKey)) {
    return { success: true, duplicate: true };
  }
  markAsSent(deduplicationKey);

  if (isSupabaseConfigured && supabase?.functions) {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-api', {
        body: {
          action: 'notify-lead',
          eventType: 'lead_captured',
          leadData,
          deduplicationKey
        }
      });

      if (!error && data) {
        const isMock = data.mode === 'mock';

        addNotificationToFeed({
          type: 'whatsapp_lead',
          title: `WhatsApp Lead (${isMock ? 'MOCK' : 'API'}): ${leadData.name || 'Novo Contacto'}`,
          message: isMock
            ? `[Simulação] Lead de ${leadData.name || 'Novo Contacto'} registado com sucesso.`
            : (data.configured
                ? `Lead despachado para ${COMPANY_WHATSAPP_DISPLAY} via Cloud API.`
                : `Lead formatado para o WhatsApp da empresa (${COMPANY_WHATSAPP_DISPLAY}).`),
          link: data.waLink || null
        });

        return {
          success: Boolean(data.success),
          mode: data.mode || (isMock ? 'mock' : 'cloud_api'),
          status: data.status || (isMock ? 'SIMULATED' : 'SENT'),
          isMock,
          waLink: data.waLink,
          formattedMessage: data.formattedMessage
        };
      }
    } catch (_err) {}
  }

  return { success: false, configured: false, mode: 'mock' };
}

/**
 * Lista os registos históricos de despacho de notificações WhatsApp
 */
export async function fetchWhatsAppLogs({ page = 1, limit = 50, statusFilter = 'all' } = {}) {
  if (!isSupabaseConfigured || !supabase?.functions) {
    return { success: false, logs: [], totalCount: 0 };
  }

  try {
    const { data, error } = await supabase.functions.invoke('whatsapp-api', {
      body: {
        action: 'list-logs',
        page,
        limit,
        statusFilter
      }
    });

    if (error || !data) {
      return { success: false, logs: [], totalCount: 0, error: error?.message };
    }

    return data;
  } catch (err) {
    return { success: false, logs: [], totalCount: 0, error: err.message };
  }
}

/**
 * Obtém URL assinado temporário para visualização de comprovativo sob procura
 */
export async function getTemporaryReceiptSignedUrl(storagePath) {
  if (!storagePath) return { success: false, message: 'storagePath em falta.' };

  if (isSupabaseConfigured && supabase?.functions) {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-api', {
        body: {
          action: 'get-receipt-url',
          storagePath
        }
      });

      if (!error && data?.signedUrl) {
        return { success: true, signedUrl: data.signedUrl };
      }
    } catch (_err) {}
  }

  // Fallback directo ao storage se Edge Function não responder
  if (supabase?.storage) {
    try {
      const { data, error } = await supabase.storage
        .from('payment-receipts')
        .createSignedUrl(storagePath, 1800);
      if (!error && data?.signedUrl) {
        return { success: true, signedUrl: data.signedUrl };
      }
    } catch (_e) {}
  }

  return { success: false, message: 'Não foi possível gerar ligação segura.' };
}

/**
 * Executa um teste de simulação com dados fictícios para qualquer um dos 4 eventos principais
 * Não cria encomendas nem leads reais no CRM ou na auditoria financeira.
 */
export async function simulateWhatsAppTestEvent(eventType) {
  const testId = `SIM-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toISOString();

  let body = {};

  if (eventType === 'lead_captured') {
    body = {
      action: 'notify-lead',
      eventType: 'lead_captured',
      leadData: {
        id: testId,
        name: 'Cliente Simulação Teste',
        phone: '+244 923 000 000',
        email: 'simulacao@aquitem.ao',
        productName: 'A9 Pro Touch Screen Smart Earphones (MOCK)',
        notes: 'Simulação automatizada de teste sem criar dados reais no CRM.',
        trafficSource: 'Painel Admin (Simulação)',
        isSimulation: true
      },
      deduplicationKey: `mock-lead-${testId}-${Date.now()}`
    };
  } else if (eventType === 'receipt_submitted') {
    body = {
      action: 'notify-company',
      eventType: 'receipt_submitted',
      orderData: {
        id: testId,
        customerName: 'Cliente Simulação Recibo',
        customerPhone: '+244 923 000 000',
        customerEmail: 'simulacao@aquitem.ao',
        total: 25000,
        paymentMethod: 'Transferência Bancária (Simulada)',
        receiptStoragePath: 'AQT-7816/AQT-7816-1794968098660-y37m.pdf', // Recibo real existente no bucket para teste
        receiptDate: new Date().toLocaleString('pt-AO'),
        isSimulation: true
      },
      deduplicationKey: `mock-receipt-${testId}-${Date.now()}`
    };
  } else if (eventType === 'payment_confirmed') {
    body = {
      action: 'notify-company',
      eventType: 'payment_confirmed',
      orderData: {
        id: testId,
        customerName: 'Cliente Simulação Aprovado',
        customerPhone: '+244 923 000 000',
        customerEmail: 'simulacao@aquitem.ao',
        total: 25000,
        paymentMethod: 'Multicaixa Express (Simulado)',
        receiptStoragePath: 'AQT-7816/AQT-7816-1794968098660-y37m.pdf',
        estimatedDeliveryDate: '3 dias úteis',
        trackingNumber: `AQT-EXP-${testId}`,
        isSimulation: true
      },
      deduplicationKey: `mock-payment-${testId}-${Date.now()}`
    };
  } else {
    // order_created por defeito
    body = {
      action: 'notify-company',
      eventType: 'order_created',
      orderData: {
        id: testId,
        customerName: 'Cliente Simulação Teste',
        customerPhone: '+244 923 000 000',
        customerEmail: 'simulacao@aquitem.ao',
        province: 'Luanda',
        municipality: 'Talatona',
        address: 'Condomínio Teste, Bloco 1',
        total: 35000,
        subtotal: 32000,
        deliveryFee: 3000,
        paymentMethod: 'Transferência Bancária (Simulada)',
        items: [
          { name: 'Oraimo FreePods 4 (MOCK)', quantity: 1, price: 20000 },
          { name: 'Cabo Tipo-C Fast Charge (MOCK)', quantity: 2, price: 6000 }
        ],
        isSimulation: true
      },
      deduplicationKey: `mock-order-${testId}-${Date.now()}`
    };
  }

  if (isSupabaseConfigured && supabase?.functions) {
    const { data, error } = await supabase.functions.invoke('whatsapp-api', { body });
    if (error) {
      throw new Error(error.message || 'Falha ao executar simulação.');
    }
    return data;
  }

  throw new Error('Supabase functions não disponível.');
}

/**
 * Formatador local de mensagens com markdown do WhatsApp
 */
export function formatLocalCompanyMessage(eventType, orderData) {
  const orderId = orderData.id;
  const clientName = orderData.customerName || orderData.name || 'Cliente';
  const clientPhone = orderData.customerPhone || orderData.phone || 'Não informado';
  const totalKz = Number(orderData.total || 0).toLocaleString('pt-AO');

  switch (eventType) {
    case 'order_created': {
      let msg = `🧪 *[SIMULAÇÃO / MOCK — AQUI TEM ANGOLA]*\n🔔 *NOVA ENCOMENDA REGISTADA*\n\n`;
      msg += `📦 *Código:* #${orderId}\n`;
      msg += `👤 *Cliente:* ${clientName}\n`;
      msg += `📞 *Telefone:* ${clientPhone}\n`;
      msg += `✉️ *E-mail:* ${orderData.customerEmail || orderData.email || 'Não informado'}\n`;
      msg += `💵 *VALOR TOTAL:* ${totalKz} Kz\n`;
      msg += `💳 *Método de Pagamento:* ${orderData.paymentMethod || 'Transferência Bancária'}\n`;
      msg += `⏳ *Estado:* Aguardando Pagamento\n`;
      return msg;
    }
    case 'receipt_submitted': {
      let msg = `🧪 *[SIMULAÇÃO / MOCK — AQUI TEM ANGOLA]*\n📄 *NOVO COMPROVATIVO RECEBIDO*\n\n`;
      msg += `📦 *Código:* #${orderId}\n`;
      msg += `👤 *Cliente:* ${clientName} (${clientPhone})\n`;
      msg += `💰 *Valor:* ${totalKz} Kz\n`;
      msg += `🕒 *Data/Hora:* ${orderData.receiptDate || new Date().toLocaleString('pt-AO')}\n`;
      msg += `⚠️ *Estado:* PENDENTE DE VALIDAÇÃO FINANCEIRA\n`;
      return msg;
    }
    case 'payment_confirmed': {
      let msg = `🧪 *[SIMULAÇÃO / MOCK — AQUI TEM ANGOLA]*\n✅ *PAGAMENTO APROVADO & ENCOMENDA AGENDADA*\n\n`;
      msg += `📦 *Código:* #${orderId}\n`;
      msg += `👤 *Cliente:* ${clientName}\n`;
      msg += `💰 *Valor:* ${totalKz} Kz\n`;
      if (orderData.estimatedDeliveryDate) {
        msg += `📅 *Previsão de Entrega:* ${orderData.estimatedDeliveryDate}\n`;
      }
      return msg;
    }
    case 'order_processing': {
      return `📦 *ENCOMENDA EM PREPARAÇÃO*\n\nCódigo: #${orderId}\nCliente: ${clientName}\nEstado: Empacotamento iniciado.`;
    }
    case 'order_shipped': {
      return `🚚 *ENCOMENDA EM ROTA DE ENTREGA*\n\nCódigo: #${orderId}\nCliente: ${clientName} (${clientPhone})\nEstado: Viatura express despachada.`;
    }
    case 'order_delivered': {
      return `🎉 *ENCOMENDA ENTREGUE COM SUCESSO*\n\nCódigo: #${orderId}\nCliente: ${clientName}\nEstado: Concluída e entregue ao cliente.`;
    }
    default: {
      return `ℹ️ Encomenda #${orderId} - Estado: ${eventType}`;
    }
  }
}
