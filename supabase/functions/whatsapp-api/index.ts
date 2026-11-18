import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Lista de origens permitidas (CORS)
const ALLOWED_ORIGINS = [
  'https://loja.aqui-tem.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

const COMPANY_WHATSAPP_NUMBER = '244950752933';

interface OrderItem {
  name: string;
  quantity?: number;
  price?: number | string;
  description?: string;
}

interface NotificationPayload {
  action: 'notify-company' | 'check-status';
  eventType?: 'order_created' | 'receipt_submitted' | 'payment_confirmed' | 'order_processing' | 'order_shipped' | 'order_delivered';
  orderData?: {
    id: string;
    orderDate?: string;
    total?: number | string;
    subtotal?: number | string;
    deliveryFee?: number | string;
    items?: OrderItem[];
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    province?: string;
    municipality?: string;
    address?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    trackingNumber?: string;
    estimatedDeliveryDate?: string;
    receiptStoragePath?: string;
    receiptToken?: string;
    receiptDate?: string;
  };
  deduplicationKey?: string;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Método não permitido. Utilize POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const whatsappToken = Deno.env.get('WHATSAPP_TOKEN') || Deno.env.get('WHATSAPP_API_TOKEN') || '';
  const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '';

  try {
    const body: NotificationPayload = await req.json();
    const { action = 'notify-company', eventType = 'order_created', orderData } = body;

    // Verificar estado de configuração da integração
    if (action === 'check-status') {
      const isConfigured = Boolean(whatsappToken && whatsappPhoneNumberId);
      return new Response(
        JSON.stringify({
          success: true,
          configured: isConfigured,
          destinationNumber: `+${COMPANY_WHATSAPP_NUMBER}`,
          missingCredentials: [
            ...(!whatsappToken ? ['WHATSAPP_TOKEN'] : []),
            ...(!whatsappPhoneNumberId ? ['WHATSAPP_PHONE_NUMBER_ID'] : [])
          ],
          message: isConfigured
            ? 'WhatsApp Business Cloud API está configurada com token e Phone Number ID.'
            : 'WhatsApp Business Cloud API não está activa. Faltam credenciais nos secrets do Supabase.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!orderData || !orderData.id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Dados da encomenda (orderData.id) são obrigatórios.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inicializar cliente Supabase Admin caso seja necessário gerar signed URLs
    let supabaseAdmin = null;
    if (supabaseUrl && supabaseServiceRoleKey) {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false }
      });
    }

    // Se o evento for receipt_submitted, gerar Signed URL temporário para o comprovativo
    let secureReceiptUrl = '';
    if (eventType === 'receipt_submitted' && supabaseAdmin) {
      let path = orderData.receiptStoragePath;
      if (!path) {
        // Tentar obter o caminho do comprovativo a partir da tabela crm_leads
        const { data: lead } = await supabaseAdmin
          .from('crm_leads')
          .select('receipt_storage_path')
          .eq('lead_code', orderData.id)
          .single();
        if (lead?.receipt_storage_path) {
          path = lead.receipt_storage_path;
        }
      }

      if (path) {
        // Gera Signed URL com validade de 24 horas (86400 segundos) para conferência da equipa
        const { data: signedData } = await supabaseAdmin.storage
          .from('payment-receipts')
          .createSignedUrl(path, 86400);

        if (signedData?.signedUrl) {
          secureReceiptUrl = signedData.signedUrl;
        }
      }
    }

    // Formatação das mensagens oficiais em texto estruturado com markdown WhatsApp
    const orderId = orderData.id;
    const clientName = orderData.customerName || 'Cliente AQUI TEM';
    const clientPhone = orderData.customerPhone || 'Não informado';
    const clientEmail = orderData.customerEmail || 'Não informado';
    const totalKz = Number(orderData.total || 0).toLocaleString('pt-AO');
    const paymentMeth = orderData.paymentMethod || 'Transferência Bancária / Multicaixa Express';
    const addressStr = `${orderData.address || ''}, ${orderData.municipality || ''}, ${orderData.province || 'Luanda'}`.replace(/^[\s,]+|[\s,]+$/g, '');

    let formattedMessage = '';

    switch (eventType) {
      case 'order_created': {
        formattedMessage = `🔔 *NOVA ENCOMENDA REGISTADA — AQUI TEM ANGOLA*\n\n`;
        formattedMessage += `📦 *Código:* #${orderId}\n`;
        formattedMessage += `👤 *Cliente:* ${clientName}\n`;
        formattedMessage += `📞 *Telefone:* ${clientPhone}\n`;
        formattedMessage += `✉️ *E-mail:* ${clientEmail}\n`;
        if (addressStr) {
          formattedMessage += `📍 *Endereço:* ${addressStr}\n`;
        }
        formattedMessage += `\n🛍️ *Produtos Encomendados:*\n`;
        if (orderData.items && orderData.items.length > 0) {
          orderData.items.forEach((item, idx) => {
            const q = item.quantity || 1;
            const p = Number(item.price || 0).toLocaleString('pt-AO');
            formattedMessage += `• ${idx + 1}. *${item.name}* (x${q}) — ${p} Kz\n`;
          });
        } else {
          formattedMessage += `• Artigos registados no pedido\n`;
        }
        if (orderData.subtotal) {
          formattedMessage += `\n📊 *Subtotal:* ${Number(orderData.subtotal).toLocaleString('pt-AO')} Kz\n`;
        }
        if (orderData.deliveryFee !== undefined) {
          formattedMessage += `🚚 *Taxa de Entrega:* ${Number(orderData.deliveryFee).toLocaleString('pt-AO')} Kz\n`;
        }
        formattedMessage += `💵 *VALOR TOTAL:* ${totalKz} Kz\n`;
        formattedMessage += `💳 *Método de Pagamento:* ${paymentMeth}\n`;
        formattedMessage += `⏳ *Estado Atual:* Aguardando Pagamento\n\n`;
        formattedMessage += `⚠️ _Aguardando realização do pagamento ou envio de comprovativo pelo cliente._`;
        break;
      }

      case 'receipt_submitted': {
        const nowFormatted = orderData.receiptDate || new Date().toLocaleString('pt-AO');
        formattedMessage = `📄 *NOVO COMPROVATIVO RECEBIDO — AQUI TEM ANGOLA*\n\n`;
        formattedMessage += `📦 *Código da Encomenda:* #${orderId}\n`;
        formattedMessage += `👤 *Cliente:* ${clientName} (${clientPhone})\n`;
        formattedMessage += `💰 *Valor da Encomenda:* ${totalKz} Kz\n`;
        formattedMessage += `🕒 *Data e Hora do Envio:* ${nowFormatted}\n\n`;
        formattedMessage += `⚠️ *Estado:* PENDENTE DE VALIDAÇÃO FINANCEIRA\n`;
        formattedMessage += `_Aviso de Segurança: O envio do comprovativo não confirma o pagamento automaticamente._\n\n`;
        if (secureReceiptUrl) {
          formattedMessage += `🔐 *Ligação Segura para Conferência (Válida 24h):*\n${secureReceiptUrl}\n\n`;
        } else {
          formattedMessage += `🔐 *Acesso:* Comprovativo guardado com segurança no bucket privado payment-receipts. Consulte o painel administrativo para gerar Signed URL.\n\n`;
        }
        formattedMessage += `👉 _Acesse o Painel Administrativo para conferir a entrada bancária e aprovar a encomenda._`;
        break;
      }

      case 'payment_confirmed': {
        formattedMessage = `✅ *PAGAMENTO APROVADO & ENCOMENDA AGENDADA*\n\n`;
        formattedMessage += `📦 *Código:* #${orderId}\n`;
        formattedMessage += `👤 *Cliente:* ${clientName}\n`;
        formattedMessage += `💰 *Valor Confirmado:* ${totalKz} Kz\n`;
        if (orderData.estimatedDeliveryDate) {
          formattedMessage += `📅 *Previsão de Entrega (3 dias úteis):* ${orderData.estimatedDeliveryDate}\n`;
        }
        if (orderData.trackingNumber) {
          formattedMessage += `📍 *Código de Rastreio Oficial:* ${orderData.trackingNumber}\n`;
        }
        formattedMessage += `\n🚀 _A administração confirmou a entrada financeira. Encomenda agendada para expedição._`;
        break;
      }

      case 'order_processing': {
        formattedMessage = `📦 *ENCOMENDA EM PREPARAÇÃO & CONTROLO DE QUALIDADE*\n\n`;
        formattedMessage += `📦 *Código:* #${orderId}\n`;
        formattedMessage += `👤 *Cliente:* ${clientName} (${clientPhone})\n`;
        formattedMessage += `🔍 *Estado:* Empacotamento anti-impacto e conferência técnica dos equipamentos em curso no centro de expedição.\n`;
        break;
      }

      case 'order_shipped': {
        formattedMessage = `🚚 *ENCOMENDA EM ROTA DE ENTREGA*\n\n`;
        formattedMessage += `📦 *Código:* #${orderId}\n`;
        formattedMessage += `👤 *Cliente:* ${clientName} (${clientPhone})\n`;
        if (addressStr) {
          formattedMessage += `📍 *Endereço de Destino:* ${addressStr}\n`;
        }
        formattedMessage += `🛵 *Estado:* Viatura express / estafeta despachado com a encomenda para entrega prioritária.\n`;
        break;
      }

      case 'order_delivered': {
        formattedMessage = `🎉 *ENCOMENDA ENTREGUE COM SUCESSO*\n\n`;
        formattedMessage += `📦 *Código:* #${orderId}\n`;
        formattedMessage += `👤 *Cliente:* ${clientName}\n`;
        formattedMessage += `✅ *Estado:* Entrega concluída com sucesso no endereço do cliente. Garantia oficial de 7 dias activada.\n`;
        break;
      }

      default: {
        formattedMessage = `ℹ️ *NOTIFICAÇÃO DE ENCOMENDA #${orderId}*\nCliente: ${clientName}\nEstado: ${eventType}\nTotal: ${totalKz} Kz`;
      }
    }

    const waLink = `https://wa.me/${COMPANY_WHATSAPP_NUMBER}?text=${encodeURIComponent(formattedMessage)}`;

    // Se as credenciais da Meta WhatsApp Cloud API existirem, despacha de forma real
    if (whatsappToken && whatsappPhoneNumberId) {
      const metaUrl = `https://graph.facebook.com/v21.0/${whatsappPhoneNumberId}/messages`;
      const metaPayload = {
        messaging_product: 'whatsapp',
        to: COMPANY_WHATSAPP_NUMBER,
        type: 'text',
        text: {
          preview_url: true,
          body: formattedMessage
        }
      };

      const metaRes = await fetch(metaUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metaPayload)
      });

      const metaJson = await metaRes.json();

      if (!metaRes.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            apiUsed: true,
            configured: true,
            destination: `+${COMPANY_WHATSAPP_NUMBER}`,
            metaStatus: metaRes.status,
            metaError: metaJson,
            message: 'Erro na chamada à WhatsApp Cloud API da Meta.',
            formattedMessage,
            waLink
          }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          apiUsed: true,
          configured: true,
          destination: `+${COMPANY_WHATSAPP_NUMBER}`,
          metaResponse: metaJson,
          message: 'Notificação enviada com sucesso para o WhatsApp da empresa via WhatsApp Cloud API.',
          formattedMessage,
          waLink
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Se as credenciais NÃO estiverem configuradas, reporta com transparência estrita
    return new Response(
      JSON.stringify({
        success: false,
        apiUsed: false,
        configured: false,
        destination: `+${COMPANY_WHATSAPP_NUMBER}`,
        message: 'WhatsApp Business Cloud API não está configurada nos secrets do Supabase (WHATSAPP_TOKEN e WHATSAPP_PHONE_NUMBER_ID em falta). Notificação formatada pronta para despacho manual ou para quando as credenciais Meta forem inseridas.',
        formattedMessage,
        waLink
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erro interno no serviço de notificações WhatsApp: ${err.message || String(err)}`
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
