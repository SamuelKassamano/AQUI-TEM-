/**
 * Serviço de Notificações WhatsApp da Empresa — AQUI TEM Angola
 * Destino Oficial: +244 950 752 933
 * 
 * Eventos monitorizados:
 * 1. order_created: Nova encomenda registada no checkout
 * 2. receipt_submitted: Comprovativo bancário anexado (pendente de validação financeira)
 * 3. payment_confirmed: Pagamento aprovado pela administração & encomenda agendada
 * 4. order_processing: Embalagem e controlo de qualidade iniciado
 * 5. order_shipped: Encomenda em rota com estafeta
 * 6. order_delivered: Entrega finalizada ao cliente
 */

import { supabase, isSupabaseConfigured } from './supabase.js';
import { addNotificationToFeed } from '../utils/notificationSystem.js';

export const COMPANY_WHATSAPP_NUMBER = '244950752933';
export const COMPANY_WHATSAPP_DISPLAY = '+244 950 752 933';

// Cache em memória para prevenção estrita de notificações duplicadas
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

  // 1. Tentar despachar via Edge Function oficial 'whatsapp-api'
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
        // Regista no log do sistema
        addNotificationToFeed({
          type: 'whatsapp_company',
          title: `WhatsApp Empresa (${eventType}): #${orderData.id}`,
          message: data.configured
            ? `Notificação enviada com sucesso para ${COMPANY_WHATSAPP_DISPLAY} via Cloud API.`
            : `Mensagem formatada para a empresa (${COMPANY_WHATSAPP_DISPLAY}). Cloud API pendente de credenciais Meta.`,
          link: data.waLink || null
        });

        return {
          success: Boolean(data.success),
          configured: Boolean(data.configured),
          destination: COMPANY_WHATSAPP_DISPLAY,
          formattedMessage: data.formattedMessage,
          waLink: data.waLink,
          message: data.message
        };
      }
    } catch (edgeErr) {
      console.warn('Aviso ao contactar Edge Function whatsapp-api:', edgeErr.message);
    }
  }

  // 2. Fallback de formatação local determinística caso a função esteja offline
  const formatted = formatLocalCompanyMessage(eventType, orderData);
  const fallbackWaLink = `https://wa.me/${COMPANY_WHATSAPP_NUMBER}?text=${encodeURIComponent(formatted)}`;

  return {
    success: false,
    configured: false,
    fallback: true,
    destination: COMPANY_WHATSAPP_DISPLAY,
    formattedMessage: formatted,
    waLink: fallbackWaLink,
    message: 'Edge Function indisponível; mensagem formatada localmente para envio directo.'
  };
}

/**
 * Consulta o estado da integração com a WhatsApp Business Cloud API
 */
export async function checkWhatsAppApiStatus() {
  if (!isSupabaseConfigured || !supabase?.functions) {
    return {
      configured: false,
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
        message: error?.message || 'Falha ao consultar estado da API de WhatsApp.'
      };
    }

    return data;
  } catch (err) {
    return {
      configured: false,
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
        addNotificationToFeed({
          type: 'whatsapp_lead',
          title: `WhatsApp Lead: ${leadData.name || 'Novo Contacto'}`,
          message: data.configured
            ? `Lead despachado para ${COMPANY_WHATSAPP_DISPLAY} via Cloud API.`
            : `Lead formatado para o WhatsApp da empresa (${COMPANY_WHATSAPP_DISPLAY}).`,
          link: data.waLink || null
        });

        return {
          success: Boolean(data.success),
          configured: Boolean(data.configured),
          waLink: data.waLink
        };
      }
    } catch (_err) {}
  }

  return { success: false, configured: false };
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
      let msg = `🔔 *NOVA ENCOMENDA REGISTADA — AQUI TEM ANGOLA*\n\n`;
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
      let msg = `📄 *NOVO COMPROVATIVO RECEBIDO — AQUI TEM ANGOLA*\n\n`;
      msg += `📦 *Código:* #${orderId}\n`;
      msg += `👤 *Cliente:* ${clientName} (${clientPhone})\n`;
      msg += `💰 *Valor:* ${totalKz} Kz\n`;
      msg += `🕒 *Data/Hora:* ${orderData.receiptDate || new Date().toLocaleString('pt-AO')}\n`;
      msg += `⚠️ *Estado:* PENDENTE DE VALIDAÇÃO FINANCEIRA\n`;
      msg += `(O envio do comprovativo não confirma o pagamento)\n`;
      return msg;
    }
    case 'payment_confirmed': {
      let msg = `✅ *PAGAMENTO APROVADO & ENCOMENDA AGENDADA*\n\n`;
      msg += `📦 *Código:* #${orderId}\n`;
      msg += `👤 *Cliente:* ${clientName}\n`;
      msg += `💰 *Valor:* ${totalKz} Kz\n`;
      if (orderData.estimatedDeliveryDate) {
        msg += `📅 *Previsão de Entrega (3 dias úteis):* ${orderData.estimatedDeliveryDate}\n`;
      }
      return msg;
    }
    case 'order_processing': {
      return `📦 *ENCOMENDA EM PREPARAÇÃO*\n\nCódigo: #${orderId}\nCliente: ${clientName}\nEstado: Empacotamento e controlo de qualidade iniciado.`;
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
