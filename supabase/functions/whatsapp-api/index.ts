import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Origens autorizadas (CORS)
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
const DEFAULT_WEBHOOK_VERIFY_TOKEN = 'aqui_tem_angola_wa_secret';

interface OrderItem {
  name: string;
  quantity?: number;
  price?: number | string;
  description?: string;
}

interface NotificationPayload {
  action?: 'notify-company' | 'notify-lead' | 'check-status';
  eventType?: 'order_created' | 'receipt_submitted' | 'payment_confirmed' | 'order_processing' | 'order_shipped' | 'order_delivered' | 'lead_captured';
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
  leadData?: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    address?: string;
    productName?: string;
    productPrice?: number | string;
    notes?: string;
    trafficSource?: string;
  };
  deduplicationKey?: string;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // 1. Tratamento de Preflight CORS (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const whatsappToken = Deno.env.get('WHATSAPP_TOKEN') || Deno.env.get('WHATSAPP_API_TOKEN') || '';
  const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '';
  const webhookVerifyToken = Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN') || DEFAULT_WEBHOOK_VERIFY_TOKEN;

  // Inicializar cliente administrativo Supabase com service_role
  let supabaseAdmin: any = null;
  if (supabaseUrl && supabaseServiceRoleKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });
  }

  // =========================================================================
  // 2. META WEBHOOK VERIFICATION (GET)
  // Utilizado pela Meta para confirmar a titularidade do Webhook
  // =========================================================================
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === webhookVerifyToken) {
      console.log('Webhook Meta verificado com sucesso.');
      return new Response(challenge || 'OK', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return new Response('Token de verificação do Webhook inválido.', {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Método não permitido. Utilize POST ou GET.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: any = await req.json();

    // =========================================================================
    // 3. META WEBHOOK STATUS RECEIVER (POST da Meta com status de entrega)
    // Atualiza whatsapp_dispatch_logs com sent, delivered, read, failed
    // =========================================================================
    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const statuses = change.value?.statuses || [];
          for (const st of statuses) {
            const metaId = st.id;
            const metaStatus = (st.status || '').toUpperCase(); // SENT, DELIVERED, READ, FAILED
            const timestamp = st.timestamp ? new Date(Number(st.timestamp) * 1000).toISOString() : new Date().toISOString();
            const errors = st.errors || null;

            if (supabaseAdmin && metaId) {
              try {
                await supabaseAdmin
                  .from('whatsapp_dispatch_logs')
                  .update({
                    status: metaStatus === 'FAILED' ? 'FAILED' : (metaStatus === 'DELIVERED' ? 'DELIVERED' : (metaStatus === 'READ' ? 'READ' : 'SENT')),
                    last_error: errors ? JSON.stringify(errors) : null,
                    updated_at: timestamp
                  })
                  .eq('meta_message_id', metaId);
              } catch (e: any) {
                console.warn('Aviso ao atualizar status de webhook Meta:', e.message);
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true, received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // =========================================================================
    // 4. OPERAÇÕES INTERNAS DA APLICAÇÃO
    // =========================================================================
    const { action = 'notify-company', eventType = 'order_created', orderData, leadData, deduplicationKey } = body as NotificationPayload;

    // 4.1 Verificação de Estado da Configuração
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
            : 'WhatsApp Business Cloud API aguarda configuração nos secrets do Supabase (WHATSAPP_TOKEN e WHATSAPP_PHONE_NUMBER_ID).'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4.2 Notificação de Novo Lead Geral (Formulário / Contacto / Intenção de Compra)
    if (action === 'notify-lead' || eventType === 'lead_captured') {
      const lead = leadData || orderData || {};
      const leadName = lead.customerName || lead.name || 'Novo Contacto';
      const leadPhone = lead.customerPhone || lead.phone || 'Não informado';
      const leadEmail = lead.customerEmail || lead.email || 'Não informado';
      const leadProduct = lead.productName || 'Consulta Geral';
      const leadNotes = lead.notes || '';
      const leadSource = lead.trafficSource || 'Loja Online';

      const leadMsg = `🌟 *NOVO LEAD CAPTADO — AQUI TEM ANGOLA*\n\n` +
        `👤 *Nome:* ${leadName}\n` +
        `📞 *Telefone:* ${leadPhone}\n` +
        `✉️ *E-mail:* ${leadEmail}\n` +
        `🛍️ *Artigo / Interesse:* ${leadProduct}\n` +
        `🌐 *Origem:* ${leadSource}\n` +
        (leadNotes ? `📝 *Observações:* ${leadNotes}\n` : '') +
        `\n👉 _Contacto registado no CRM para atendimento pela equipa comercial._`;

      const leadWaLink = `https://wa.me/${COMPANY_WHATSAPP_NUMBER}?text=${encodeURIComponent(leadMsg)}`;

      if (whatsappToken && whatsappPhoneNumberId) {
        try {
          const metaRes = await fetch(`https://graph.facebook.com/v21.0/${whatsappPhoneNumberId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${whatsappToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: COMPANY_WHATSAPP_NUMBER,
              type: 'text',
              text: { preview_url: true, body: leadMsg }
            })
          });

          const metaJson = await metaRes.json();
          const metaMsgId = metaJson?.messages?.[0]?.id || null;

          if (supabaseAdmin) {
            try {
              await supabaseAdmin.from('whatsapp_dispatch_logs').insert([{
                event_type: 'lead_captured',
                order_code: null,
                recipient: COMPANY_WHATSAPP_NUMBER,
                status: metaRes.ok ? 'SENT' : 'FAILED',
                message_type: 'text',
                meta_message_id: metaMsgId,
                last_error: metaRes.ok ? null : JSON.stringify(metaJson),
                payload: { leadName, leadPhone, leadProduct, source: leadSource }
              }]);
            } catch (_logErr) {}
          }

          return new Response(JSON.stringify({
            success: metaRes.ok,
            apiUsed: true,
            configured: true,
            metaResponse: metaJson,
            formattedMessage: leadMsg,
            waLink: leadWaLink
          }), { status: metaRes.ok ? 200 : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (apiErr: any) {
          return new Response(JSON.stringify({
            success: false,
            apiUsed: true,
            configured: true,
            error: apiErr.message,
            formattedMessage: leadMsg,
            waLink: leadWaLink
          }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      return new Response(JSON.stringify({
        success: false,
        apiUsed: false,
        configured: false,
        message: 'WhatsApp Business Cloud API aguarda secrets no Supabase. Link para despacho manual gerado.',
        formattedMessage: leadMsg,
        waLink: leadWaLink
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 4.3 Notificação de Ciclo de Encomenda
    if (!orderData || !orderData.id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Dados da encomenda (orderData.id) são obrigatórios.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderId = orderData.id;
    const clientName = orderData.customerName || 'Cliente AQUI TEM';
    const clientPhone = orderData.customerPhone || 'Não informado';
    const clientEmail = orderData.customerEmail || 'Não informado';
    const totalKz = Number(orderData.total || 0).toLocaleString('pt-AO');
    const paymentMeth = orderData.paymentMethod || 'Transferência Bancária / Multicaixa Express';
    const addressStr = `${orderData.address || ''}, ${orderData.municipality || ''}, ${orderData.province || 'Luanda'}`.replace(/^[\s,]+|[\s,]+$/g, '');

    // Deduplicação no banco de dados
    const finalKey = deduplicationKey || `wa-${orderId}-${eventType}`;
    if (supabaseAdmin) {
      try {
        const { data: existingLog } = await supabaseAdmin
          .from('whatsapp_dispatch_logs')
          .select('id, status, meta_message_id, created_at')
          .eq('deduplication_key', finalKey)
          .maybeSingle();

        if (existingLog && existingLog.status === 'SENT') {
          return new Response(
            JSON.stringify({
              success: true,
              duplicate: true,
              message: `Notificação WhatsApp para ${orderId} (${eventType}) já foi enviada anteriormente.`,
              existingLog
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (_dedupErr) {}
    }

    // Resolução de Comprovativo Bancário (PDF ou Imagem) no Storage Privado
    let secureReceiptUrl = '';
    let isReceiptPdf = false;
    let isReceiptImage = false;
    let receiptFileName = `Recibo-${orderId}.pdf`;

    if ((eventType === 'receipt_submitted' || eventType === 'payment_confirmed') && supabaseAdmin) {
      let path = orderData.receiptStoragePath;
      if (!path) {
        const { data: lead } = await supabaseAdmin
          .from('crm_leads')
          .select('receipt_storage_path')
          .or(`lead_code.eq.${orderId},notes.ilike.%${orderId}%`)
          .maybeSingle();
        if (lead?.receipt_storage_path) {
          path = lead.receipt_storage_path;
        }
      }

      if (path) {
        const ext = path.split('.').pop()?.toLowerCase() || '';
        isReceiptPdf = ext === 'pdf';
        isReceiptImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
        receiptFileName = path.split('/').pop() || `Recibo-${orderId}.${isReceiptPdf ? 'pdf' : 'jpg'}`;

        // Signed URL válido por 24 horas (86400s) para conferência da equipa
        const { data: signedData } = await supabaseAdmin.storage
          .from('payment-receipts')
          .createSignedUrl(path, 86400);

        if (signedData?.signedUrl) {
          secureReceiptUrl = signedData.signedUrl;
        }
      }
    }

    // Formatação da Mensagem Estruturada
    let formattedMessage = '';
    switch (eventType) {
      case 'order_created': {
        formattedMessage = `🔔 *NOVA ENCOMENDA REGISTADA — AQUI TEM ANGOLA*\n\n` +
          `📦 *Código:* #${orderId}\n` +
          `👤 *Cliente:* ${clientName}\n` +
          `📞 *Telefone:* ${clientPhone}\n` +
          `✉️ *E-mail:* ${clientEmail}\n` +
          (addressStr ? `📍 *Endereço:* ${addressStr}\n` : '') +
          `\n🛍️ *Produtos Encomendados:*\n`;
        if (orderData.items && orderData.items.length > 0) {
          orderData.items.forEach((item, idx) => {
            const q = item.quantity || 1;
            const p = Number(item.price || 0).toLocaleString('pt-AO');
            formattedMessage += `• ${idx + 1}. *${item.name}* (x${q}) — ${p} Kz\n`;
          });
        }
        if (orderData.subtotal) {
          formattedMessage += `\n📊 *Subtotal:* ${Number(orderData.subtotal).toLocaleString('pt-AO')} Kz\n`;
        }
        if (orderData.deliveryFee !== undefined) {
          formattedMessage += `🚚 *Taxa de Entrega:* ${Number(orderData.deliveryFee).toLocaleString('pt-AO')} Kz\n`;
        }
        formattedMessage += `💵 *VALOR TOTAL:* ${totalKz} Kz\n` +
          `💳 *Método de Pagamento:* ${paymentMeth}\n` +
          `⏳ *Estado:* Aguardando Pagamento\n\n` +
          `⚠️ _Aguardando realização da transferência ou anexo de comprovativo._`;
        break;
      }

      case 'receipt_submitted': {
        const nowFormatted = orderData.receiptDate || new Date().toLocaleString('pt-AO');
        formattedMessage = `📄 *NOVO COMPROVATIVO RECEBIDO — AQUI TEM ANGOLA*\n\n` +
          `📦 *Código da Encomenda:* #${orderId}\n` +
          `👤 *Cliente:* ${clientName} (${clientPhone})\n` +
          `💰 *Valor da Encomenda:* ${totalKz} Kz\n` +
          `🕒 *Data/Hora do Envio:* ${nowFormatted}\n\n` +
          `⚠️ *Estado:* PENDENTE DE VALIDAÇÃO FINANCEIRA\n` +
          `_Aviso de Segurança: O envio do comprovativo não confirma o pagamento automaticamente._\n\n` +
          (secureReceiptUrl ? `🔐 *Ligação Segura para Conferência (Válida 24h):*\n${secureReceiptUrl}\n\n` : '') +
          `👉 _Aceda ao Painel Administrativo para validar a entrada bancária e aprovar a entrega._`;
        break;
      }

      case 'payment_confirmed': {
        formattedMessage = `✅ *PAGAMENTO APROVADO & ENCOMENDA AGENDADA*\n\n` +
          `📦 *Código:* #${orderId}\n` +
          `👤 *Cliente:* ${clientName}\n` +
          `💰 *Valor Confirmado:* ${totalKz} Kz\n` +
          (orderData.estimatedDeliveryDate ? `📅 *Previsão de Entrega (3 dias úteis):* ${orderData.estimatedDeliveryDate}\n` : '') +
          (orderData.trackingNumber ? `📍 *Código de Rastreio Oficial:* ${orderData.trackingNumber}\n` : '') +
          (secureReceiptUrl ? `\n📄 *Recibo Anexado (Link Seguro 24h):*\n${secureReceiptUrl}\n` : '') +
          `\n🚀 _A administração confirmou a entrada financeira. Encomenda agendada para expedição._`;
        break;
      }

      case 'order_processing': {
        formattedMessage = `📦 *ENCOMENDA EM PREPARAÇÃO & CONTROLO DE QUALIDADE*\n\n` +
          `📦 *Código:* #${orderId}\n` +
          `👤 *Cliente:* ${clientName} (${clientPhone})\n` +
          `🔍 *Estado:* Empacotamento anti-impacto e conferência técnica dos equipamentos em curso no centro de expedição.\n`;
        break;
      }

      case 'order_shipped': {
        formattedMessage = `🚚 *ENCOMENDA EM ROTA DE ENTREGA*\n\n` +
          `📦 *Código:* #${orderId}\n` +
          `👤 *Cliente:* ${clientName} (${clientPhone})\n` +
          (addressStr ? `📍 *Endereço de Destino:* ${addressStr}\n` : '') +
          `🛵 *Estado:* Viatura express / estafeta despachado com a encomenda para entrega prioritária.\n`;
        break;
      }

      case 'order_delivered': {
        formattedMessage = `🎉 *ENCOMENDA ENTREGUE COM SUCESSO*\n\n` +
          `📦 *Código:* #${orderId}\n` +
          `👤 *Cliente:* ${clientName}\n` +
          `✅ *Estado:* Entrega concluída com sucesso no endereço do cliente. Garantia oficial de 7 dias activada.\n`;
        break;
      }

      default: {
        formattedMessage = `ℹ️ *NOTIFICAÇÃO DE ENCOMENDA #${orderId}*\nCliente: ${clientName}\nEstado: ${eventType}\nTotal: ${totalKz} Kz`;
      }
    }

    const waLink = `https://wa.me/${COMPANY_WHATSAPP_NUMBER}?text=${encodeURIComponent(formattedMessage)}`;

    // =========================================================================
    // 5. ENVIO ATIVO VIA META WHATSAPP CLOUD API (Se credenciais configuradas)
    // =========================================================================
    if (whatsappToken && whatsappPhoneNumberId) {
      const metaBaseUrl = `https://graph.facebook.com/v21.0/${whatsappPhoneNumberId}/messages`;
      let mediaMetaId = null;
      let textMetaId = null;

      // 5.1 Se houver comprovativo PDF/Imagem, enviar como documento/imagem nativo diretamente anexado
      if (secureReceiptUrl && (isReceiptPdf || isReceiptImage)) {
        try {
          const mediaPayload = isReceiptPdf
            ? {
                messaging_product: 'whatsapp',
                to: COMPANY_WHATSAPP_NUMBER,
                type: 'document',
                document: {
                  link: secureReceiptUrl,
                  caption: `📄 Comprovativo da Encomenda #${orderId} — ${clientName} (${totalKz} Kz)`,
                  filename: receiptFileName
                }
              }
            : {
                messaging_product: 'whatsapp',
                to: COMPANY_WHATSAPP_NUMBER,
                type: 'image',
                image: {
                  link: secureReceiptUrl,
                  caption: `📷 Comprovativo da Encomenda #${orderId} — ${clientName} (${totalKz} Kz)`
                }
              };

          const mediaRes = await fetch(metaBaseUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${whatsappToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(mediaPayload)
          });

          const mediaJson = await mediaRes.json();
          if (mediaRes.ok && mediaJson.messages?.[0]?.id) {
            mediaMetaId = mediaJson.messages[0].id;
          }
        } catch (mediaErr: any) {
          console.warn('Aviso no envio do ficheiro de comprovativo via WhatsApp Cloud API:', mediaErr.message);
        }
      }

      // 5.2 Envio da mensagem de texto completa com detalhes e link de segurança
      const textPayload = {
        messaging_product: 'whatsapp',
        to: COMPANY_WHATSAPP_NUMBER,
        type: 'text',
        text: {
          preview_url: true,
          body: formattedMessage
        }
      };

      const textRes = await fetch(metaBaseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(textPayload)
      });

      const textJson = await textRes.json();
      if (textRes.ok && textJson.messages?.[0]?.id) {
        textMetaId = textJson.messages[0].id;
      }

      const isOverallSuccess = textRes.ok;

      // Gravação do log no PostgreSQL
      if (supabaseAdmin) {
        try {
          await supabaseAdmin.from('whatsapp_dispatch_logs').upsert([{
            event_type: eventType,
            order_code: orderId,
            recipient: COMPANY_WHATSAPP_NUMBER,
            status: isOverallSuccess ? 'SENT' : 'FAILED',
            message_type: secureReceiptUrl ? (isReceiptPdf ? 'document' : 'image') : 'text',
            meta_message_id: textMetaId || mediaMetaId,
            document_url: secureReceiptUrl || null,
            deduplication_key: finalKey,
            last_error: isOverallSuccess ? null : JSON.stringify(textJson),
            payload: { orderId, clientName, total: totalKz, eventType }
          }], { onConflict: 'deduplication_key' });
        } catch (_logErr) {}
      }

      if (!isOverallSuccess) {
        return new Response(
          JSON.stringify({
            success: false,
            apiUsed: true,
            configured: true,
            destination: `+${COMPANY_WHATSAPP_NUMBER}`,
            metaStatus: textRes.status,
            metaError: textJson,
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
          metaResponse: textJson,
          mediaSent: Boolean(mediaMetaId),
          message: 'Notificação enviada com sucesso para o WhatsApp da empresa via WhatsApp Cloud API.',
          formattedMessage,
          waLink
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 6. TRATAMENTO QUANDO AS CREDENCIAIS META AINDA ESTÃO PENDENTES
    // Registo de estado PENDING_CONFIG e devolução transparente do waLink
    // =========================================================================
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('whatsapp_dispatch_logs').upsert([{
          event_type: eventType,
          order_code: orderId,
          recipient: COMPANY_WHATSAPP_NUMBER,
          status: 'PENDING_CONFIG',
          message_type: secureReceiptUrl ? (isReceiptPdf ? 'document' : 'image') : 'text',
          document_url: secureReceiptUrl || null,
          deduplication_key: finalKey,
          last_error: 'Aguardando configuração de WHATSAPP_TOKEN e WHATSAPP_PHONE_NUMBER_ID nos secrets do Supabase.',
          payload: { orderId, clientName, total: totalKz, eventType }
        }], { onConflict: 'deduplication_key' });
      } catch (_logErr) {}
    }

    return new Response(
      JSON.stringify({
        success: false,
        apiUsed: false,
        configured: false,
        destination: `+${COMPANY_WHATSAPP_NUMBER}`,
        message: 'WhatsApp Business Cloud API aguarda configuração de credenciais no Supabase. Notificação formatada pronta para despacho manual ou automático.',
        formattedMessage,
        waLink,
        secureReceiptUrl: secureReceiptUrl || null
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
