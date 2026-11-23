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
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hub-signature-256',
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
  action?: 'notify-company' | 'notify-lead' | 'check-status' | 'list-logs' | 'get-receipt-url' | 'test-simulate';
  eventType?: 'order_created' | 'receipt_submitted' | 'payment_confirmed' | 'order_processing' | 'order_shipped' | 'order_delivered' | 'lead_captured' | 'external_meta';
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
    isSimulation?: boolean;
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
    isSimulation?: boolean;
  };
  deduplicationKey?: string;
  storagePath?: string;
  limit?: number;
  page?: number;
  statusFilter?: string;
  originFilter?: string;
}

/**
 * Validação criptográfica da assinatura HMAC-SHA256 da Meta (X-Hub-Signature-256)
 */
async function verifyMetaHmac(rawBody: string, signatureHeader: string | null, secret: string): Promise<boolean> {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }
  const expectedHash = signatureHeader.substring(7).trim().toLowerCase();
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(rawBody)
    );
    const hashHex = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex.toLowerCase() === expectedHash;
  } catch (err: any) {
    console.warn('Erro ao calcular HMAC da Meta:', err.message);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // 1. Tratamento de Preflight CORS (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const whatsappMode = (Deno.env.get('WHATSAPP_MODE') || 'mock').toLowerCase().trim();
  const whatsappToken = Deno.env.get('WHATSAPP_TOKEN') || Deno.env.get('WHATSAPP_API_TOKEN') || '';
  const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '';
  const webhookVerifyToken = Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN') || DEFAULT_WEBHOOK_VERIFY_TOKEN;
  const metaAppSecret = Deno.env.get('META_APP_SECRET') || Deno.env.get('WHATSAPP_APP_SECRET') || '';

  // Inicializar cliente administrativo Supabase com service_role
  let supabaseAdmin: any = null;
  if (supabaseUrl && supabaseServiceRoleKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });
  }

  // =========================================================================
  // 2. META WEBHOOK VERIFICATION (GET Challenge)
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
    const rawBodyText = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBodyText);
    } catch (_e) {
      return new Response(JSON.stringify({ success: false, message: 'JSON inválido.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // =========================================================================
    // 3. META WEBHOOK STATUS RECEIVER (POST da Meta com status de entrega)
    // Suporta mensagens internas e eventos externos (ex: testes directos na Meta)
    // =========================================================================
    if (body.object === 'whatsapp_business_account') {
      // 3.1 Validação de Assinatura Criptográfica HMAC da Meta se o Secret estiver configurado
      if (metaAppSecret) {
        const sigHeader = req.headers.get('x-hub-signature-256');
        const isSigValid = await verifyMetaHmac(rawBodyText, sigHeader, metaAppSecret);
        if (!isSigValid) {
          console.warn('Webhook Meta rejeitado: Assinatura HMAC inválida.');
          return new Response('Assinatura Meta inválida.', {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
          });
        }
      }

      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const statuses = change.value?.statuses || [];
          for (const st of statuses) {
            const metaId = st.id;
            const metaStatus = (st.status || '').toUpperCase(); // SENT, DELIVERED, READ, FAILED
            const timestamp = st.timestamp ? new Date(Number(st.timestamp) * 1000).toISOString() : new Date().toISOString();
            const recipientId = st.recipient_id || '';
            const errors = st.errors || null;
            const firstErr = Array.isArray(errors) && errors.length > 0 ? errors[0] : null;
            const errorCode = firstErr?.code ? String(firstErr.code) : null;
            const errorTitle = firstErr?.title || firstErr?.message || null;
            const errorDetails = firstErr?.error_data?.details || null;
            const fbtraceId = firstErr?.fbtrace_id || null;
            const fullErrorText = errors ? JSON.stringify(errors) : null;

            if (supabaseAdmin && metaId) {
              try {
                // A) Verificar se a mensagem já existe no sistema
                const { data: existingMsg } = await supabaseAdmin
                  .from('whatsapp_dispatch_logs')
                  .select('id, status, dispatch_mode')
                  .eq('meta_message_id', metaId)
                  .maybeSingle();

                if (existingMsg) {
                  // Se existir e não for SIMULATED, atualizar o ciclo de entrega real
                  if (existingMsg.status !== 'SIMULATED') {
                    await supabaseAdmin
                      .from('whatsapp_dispatch_logs')
                      .update({
                        status: metaStatus === 'FAILED' ? 'FAILED' : (metaStatus === 'DELIVERED' ? 'DELIVERED' : (metaStatus === 'READ' ? 'READ' : 'SENT')),
                        raw_meta_status: st.status,
                        last_error: fullErrorText,
                        error_code: errorCode,
                        error_details: errorDetails,
                        fbtrace_id: fbtraceId,
                        updated_at: timestamp
                      })
                      .eq('id', existingMsg.id);
                  }
                } else {
                  // B) Não existe registo prévio: persistir como EVENTO EXTERNO META
                  const extDedupKey = `meta-ext-${metaId}-${st.status}`;
                  const formattedNotice = `📡 *[EVENTO EXTERNO META]*\n\n` +
                    `🆔 *WAMID:* ${metaId}\n` +
                    `📱 *Destinatário:* +${recipientId || COMPANY_WHATSAPP_NUMBER}\n` +
                    `📊 *Estado Meta:* ${metaStatus}\n` +
                    `🕒 *Data/Hora:* ${new Date(timestamp).toLocaleString('pt-AO')}\n` +
                    (errorCode ? `\n⚠️ *Código de Erro:* ${errorCode}${errorTitle ? ` (${errorTitle})` : ''}\n` : '') +
                    (errorDetails ? `📝 *Detalhes:* ${errorDetails}\n` : '') +
                    (fbtraceId ? `🔍 *FB Trace ID:* ${fbtraceId}\n` : '');

                  await supabaseAdmin
                    .from('whatsapp_dispatch_logs')
                    .upsert([{
                      event_type: 'external_meta',
                      order_code: null,
                      lead_id: null,
                      recipient: recipientId || COMPANY_WHATSAPP_NUMBER,
                      status: metaStatus === 'FAILED' ? 'FAILED' : (metaStatus === 'DELIVERED' ? 'DELIVERED' : (metaStatus === 'READ' ? 'READ' : 'SENT')),
                      dispatch_mode: 'external_meta',
                      message_type: 'status_update',
                      meta_message_id: metaId,
                      deduplication_key: extDedupKey,
                      raw_meta_status: st.status,
                      error_code: errorCode,
                      error_details: errorDetails,
                      fbtrace_id: fbtraceId,
                      last_error: fullErrorText,
                      formatted_body: formattedNotice,
                      payload: {
                        source: 'external_meta',
                        recipientId,
                        timestamp,
                        rawStatus: st
                      },
                      created_at: timestamp,
                      updated_at: timestamp
                    }], { onConflict: 'deduplication_key' });
                }
              } catch (e: any) {
                console.warn('Aviso ao processar status de webhook Meta:', e.message);
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
    const {
      action = 'notify-company',
      eventType = 'order_created',
      orderData,
      leadData,
      deduplicationKey,
      storagePath,
      limit = 50,
      page = 1,
      statusFilter = 'all',
      originFilter = 'all'
    } = body as NotificationPayload;

    // 4.1 Verificação de Estado da Configuração
    if (action === 'check-status') {
      const isConfigured = Boolean(whatsappToken && whatsappPhoneNumberId);
      return new Response(
        JSON.stringify({
          success: true,
          mode: whatsappMode,
          isMock: whatsappMode === 'mock',
          configured: isConfigured,
          destinationNumber: `+${COMPANY_WHATSAPP_NUMBER}`,
          missingCredentials: [
            ...(!whatsappToken ? ['WHATSAPP_TOKEN'] : []),
            ...(!whatsappPhoneNumberId ? ['WHATSAPP_PHONE_NUMBER_ID'] : [])
          ],
          hasAppSecretConfigured: Boolean(metaAppSecret),
          message: whatsappMode === 'mock'
            ? 'Sistema a operar em MODO SIMULAÇÃO (MOCK). Nenhuma mensagem real é enviada à Meta.'
            : (isConfigured
                ? 'WhatsApp Business Cloud API está activa e configurada em modo de produção.'
                : 'Modo cloud_api activo, mas credenciais Meta em falta nos secrets do Supabase.')
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4.2 Listagem de Logs de Despacho (Para o Painel Administrativo)
    if (action === 'list-logs') {
      if (!supabaseAdmin) {
        return new Response(
          JSON.stringify({ success: false, message: 'Cliente Supabase não inicializado.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
      const safePage = Math.max(Number(page) || 1, 1);
      const from = (safePage - 1) * safeLimit;
      const to = from + safeLimit - 1;

      let query = supabaseAdmin
        .from('whatsapp_dispatch_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (originFilter && originFilter !== 'all') {
        query = query.eq('dispatch_mode', originFilter);
      }

      const { data: logs, count, error: fetchErr } = await query;

      if (fetchErr) {
        return new Response(
          JSON.stringify({ success: false, error: fetchErr.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          mode: whatsappMode,
          logs: logs || [],
          totalCount: count || 0,
          page: safePage,
          limit: safeLimit
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4.3 Obtenção de Signed URL Temporário sob Procura (Para visualização no Painel)
    if (action === 'get-receipt-url') {
      if (!storagePath) {
        return new Response(
          JSON.stringify({ success: false, message: 'storagePath obrigatório.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!supabaseAdmin) {
        return new Response(
          JSON.stringify({ success: false, message: 'Cliente Supabase indisponível.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Signed URL válido por 30 minutos (1800s)
      const { data: signedData, error: signErr } = await supabaseAdmin.storage
        .from('payment-receipts')
        .createSignedUrl(storagePath, 1800);

      if (signErr || !signedData?.signedUrl) {
        return new Response(
          JSON.stringify({ success: false, message: signErr?.message || 'Ficheiro não encontrado no bucket privado.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, signedUrl: signedData.signedUrl, expiresIn: 1800 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4.4 Validação Estrita do Modo de Operação
    const isMockMode = whatsappMode === 'mock';

    if (!isMockMode && whatsappMode === 'cloud_api') {
      if (!whatsappToken || !whatsappPhoneNumberId) {
        const missing = [
          ...(!whatsappToken ? ['WHATSAPP_TOKEN'] : []),
          ...(!whatsappPhoneNumberId ? ['WHATSAPP_PHONE_NUMBER_ID'] : [])
        ];
        return new Response(
          JSON.stringify({
            success: false,
            configured: false,
            mode: 'cloud_api',
            error: `Modo cloud_api activo, mas faltam credenciais obrigatórias da Meta: ${missing.join(', ')}. Não é permitida simulação implícita no modo de produção.`,
            missingCredentials: missing
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (!isMockMode) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Configuração inválida de WHATSAPP_MODE='${whatsappMode}'. Use 'mock' ou 'cloud_api'.`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 5. TRATAMENTO DE NOTIFICAÇÃO DE NOVO LEAD
    // =========================================================================
    if (action === 'notify-lead' || eventType === 'lead_captured') {
      const lead = leadData || orderData || {};
      const leadName = lead.customerName || lead.name || 'Novo Contacto';
      const leadPhone = lead.customerPhone || lead.phone || 'Não informado';
      const leadEmail = lead.customerEmail || lead.email || 'Não informado';
      const leadProduct = lead.productName || 'Consulta Geral';
      const leadNotes = lead.notes || '';
      const leadSource = lead.trafficSource || 'Loja Online';

      const prefix = isMockMode ? `🧪 *[SIMULAÇÃO / MOCK — AQUI TEM ANGOLA]*\n` : '';
      const leadMsg = `${prefix}🌟 *NOVO LEAD CAPTADO — AQUI TEM ANGOLA*\n\n` +
        `👤 *Nome:* ${leadName}\n` +
        `📞 *Telefone:* ${leadPhone}\n` +
        `✉️ *E-mail:* ${leadEmail}\n` +
        `🛍️ *Artigo / Interesse:* ${leadProduct}\n` +
        `🌐 *Origem:* ${leadSource}\n` +
        (leadNotes ? `📝 *Observações:* ${leadNotes}\n` : '') +
        (isMockMode ? `\n⚠️ _Registo gerado em ambiente de simulação. Nenhuma mensagem real foi enviada pela Meta._\n` : `\n👉 _Contacto registado no CRM para atendimento pela equipa comercial._`);

      const leadWaLink = `https://wa.me/${COMPANY_WHATSAPP_NUMBER}?text=${encodeURIComponent(leadMsg)}`;
      const finalDeduplicationKey = deduplicationKey || `lead-${leadPhone || leadEmail}-${leadProduct}`;

      // Deduplicação
      if (supabaseAdmin) {
        try {
          const { data: existingLeadLog } = await supabaseAdmin
            .from('whatsapp_dispatch_logs')
            .select('id, status, meta_message_id, created_at')
            .eq('deduplication_key', finalDeduplicationKey)
            .maybeSingle();

          if (existingLeadLog && (existingLeadLog.status === 'SENT' || existingLeadLog.status === 'SIMULATED')) {
            return new Response(
              JSON.stringify({
                success: true,
                duplicate: true,
                mode: isMockMode ? 'mock' : 'cloud_api',
                status: existingLeadLog.status,
                message: `Notificação de lead (${finalDeduplicationKey}) já registada anteriormente (${existingLeadLog.status}).`,
                existingLog: existingLeadLog
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (_dedupErr) {}
      }

      // MODO MOCK
      if (isMockMode) {
        const mockMetaId = `mock_wamid_lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        if (supabaseAdmin) {
          try {
            await supabaseAdmin.from('whatsapp_dispatch_logs').upsert([{
              event_type: 'lead_captured',
              order_code: null,
              recipient: COMPANY_WHATSAPP_NUMBER,
              status: 'SIMULATED',
              dispatch_mode: 'mock',
              message_type: 'text',
              meta_message_id: mockMetaId,
              deduplication_key: finalDeduplicationKey,
              formatted_body: leadMsg,
              payload: { leadName, leadPhone, leadProduct, source: leadSource, isSimulation: true }
            }], { onConflict: 'deduplication_key' });
          } catch (logErr: any) {
            console.warn('Aviso ao registar log de simulação de lead:', logErr.message);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          mode: 'mock',
          status: 'SIMULATED',
          simulated: true,
          apiUsed: false,
          configured: false,
          metaMessageId: mockMetaId,
          destination: `+${COMPANY_WHATSAPP_NUMBER}`,
          message: 'Lead simulado com sucesso em modo MOCK. Registado na base de dados com status SIMULATED.',
          formattedMessage: leadMsg,
          waLink: leadWaLink
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // MODO CLOUD API REAL
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
            await supabaseAdmin.from('whatsapp_dispatch_logs').upsert([{
              event_type: 'lead_captured',
              order_code: null,
              recipient: COMPANY_WHATSAPP_NUMBER,
              status: metaRes.ok ? 'SENT' : 'FAILED',
              dispatch_mode: 'cloud_api',
              message_type: 'text',
              meta_message_id: metaMsgId,
              deduplication_key: finalDeduplicationKey,
              formatted_body: leadMsg,
              last_error: metaRes.ok ? null : JSON.stringify(metaJson),
              payload: { leadName, leadPhone, leadProduct, source: leadSource }
            }], { onConflict: 'deduplication_key' });
          } catch (_logErr) {}
        }

        return new Response(JSON.stringify({
          success: metaRes.ok,
          mode: 'cloud_api',
          status: metaRes.ok ? 'SENT' : 'FAILED',
          apiUsed: true,
          configured: true,
          metaResponse: metaJson,
          formattedMessage: leadMsg,
          waLink: leadWaLink
        }), { status: metaRes.ok ? 200 : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (apiErr: any) {
        return new Response(JSON.stringify({
          success: false,
          mode: 'cloud_api',
          status: 'FAILED',
          apiUsed: true,
          configured: true,
          error: apiErr.message,
          formattedMessage: leadMsg,
          waLink: leadWaLink
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // =========================================================================
    // 6. TRATAMENTO DE NOTIFICAÇÃO DE CICLO DE ENCOMENDA
    // =========================================================================
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

        if (existingLog && (existingLog.status === 'SENT' || existingLog.status === 'SIMULATED')) {
          return new Response(
            JSON.stringify({
              success: true,
              duplicate: true,
              mode: isMockMode ? 'mock' : 'cloud_api',
              status: existingLog.status,
              message: `Notificação WhatsApp para ${orderId} (${eventType}) já foi registada com status '${existingLog.status}'.`,
              existingLog
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (_dedupErr) {}
    }

    // Resolução do Comprovativo Bancário (Storage Privado)
    let receiptRelativePath: string | null = orderData.receiptStoragePath || null;
    let isReceiptPdf = false;
    let isReceiptImage = false;
    let receiptFileName = `Recibo-${orderId}.pdf`;
    let receiptMimeType = 'application/pdf';
    let tempSignedUrlForMetaOrPreview = '';

    if ((eventType === 'receipt_submitted' || eventType === 'payment_confirmed') && supabaseAdmin) {
      if (!receiptRelativePath) {
        try {
          const { data: lead } = await supabaseAdmin
            .from('crm_leads')
            .select('receipt_storage_path')
            .or(`lead_code.eq.${orderId},notes.ilike.%${orderId}%`)
            .maybeSingle();
          if (lead?.receipt_storage_path) {
            receiptRelativePath = lead.receipt_storage_path;
          }
        } catch (_leadLookupErr) {}
      }

      if (receiptRelativePath) {
        const ext = receiptRelativePath.split('.').pop()?.toLowerCase() || '';
        isReceiptPdf = ext === 'pdf';
        isReceiptImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
        receiptMimeType = isReceiptPdf ? 'application/pdf' : (ext === 'png' ? 'image/png' : 'image/jpeg');
        receiptFileName = receiptRelativePath.split('/').pop() || `Recibo-${orderId}.${isReceiptPdf ? 'pdf' : 'jpg'}`;

        // Gerar URL assinado temporário em memória (NUNCA gravado no banco)
        try {
          const { data: signedData } = await supabaseAdmin.storage
            .from('payment-receipts')
            .createSignedUrl(receiptRelativePath, 86400); // 24h

          if (signedData?.signedUrl) {
            tempSignedUrlForMetaOrPreview = signedData.signedUrl;
          }
        } catch (signErr: any) {
          console.warn('Aviso ao gerar URL assinado de comprovativo:', signErr.message);
        }
      }
    }

    // Formatação da Mensagem Estruturada
    const prefix = isMockMode ? `🧪 *[SIMULAÇÃO / MOCK — AQUI TEM ANGOLA]*\n` : '';
    let formattedMessage = '';

    switch (eventType) {
      case 'order_created': {
        formattedMessage = `${prefix}🔔 *NOVA ENCOMENDA REGISTADA — AQUI TEM ANGOLA*\n\n` +
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
          (isMockMode
            ? `⚠️ _[Simulação]: Notificação fictícia de teste de encomenda gerada no sistema._`
            : `⚠️ _Aguardando realização da transferência ou anexo de comprovativo._`);
        break;
      }

      case 'receipt_submitted': {
        const nowFormatted = orderData.receiptDate || new Date().toLocaleString('pt-AO');
        formattedMessage = `${prefix}📄 *NOVO COMPROVATIVO RECEBIDO — AQUI TEM ANGOLA*\n\n` +
          `📦 *Código da Encomenda:* #${orderId}\n` +
          `👤 *Cliente:* ${clientName} (${clientPhone})\n` +
          `💰 *Valor da Encomenda:* ${totalKz} Kz\n` +
          `🕒 *Data/Hora do Envio:* ${nowFormatted}\n\n` +
          `⚠️ *Estado:* PENDENTE DE VALIDAÇÃO FINANCEIRA\n` +
          `_Aviso de Segurança: O envio do comprovativo não confirma o pagamento automaticamente._\n\n` +
          (receiptRelativePath ? `📁 *Documento no Bucket Privado:* ${receiptRelativePath}\n` : '') +
          (tempSignedUrlForMetaOrPreview ? `🔐 *Ligação Segura Temporária (Painel Admin):*\n${tempSignedUrlForMetaOrPreview}\n\n` : '') +
          (isMockMode
            ? `🧪 _[Simulação]: Teste de recepção de comprovativo processado com sucesso._`
            : `👉 _Aceda ao Painel Administrativo para validar a entrada bancária e aprovar a entrega._`);
        break;
      }

      case 'payment_confirmed': {
        formattedMessage = `${prefix}✅ *PAGAMENTO APROVADO & ENCOMENDA AGENDADA*\n\n` +
          `📦 *Código:* #${orderId}\n` +
          `👤 *Cliente:* ${clientName}\n` +
          `💰 *Valor Confirmado:* ${totalKz} Kz\n` +
          (orderData.estimatedDeliveryDate ? `📅 *Previsão de Entrega (3 dias úteis):* ${orderData.estimatedDeliveryDate}\n` : '') +
          (orderData.trackingNumber ? `📍 *Código de Rastreio Oficial:* ${orderData.trackingNumber}\n` : '') +
          (receiptRelativePath ? `\n📁 *Recibo no Storage:* ${receiptRelativePath}\n` : '') +
          (tempSignedUrlForMetaOrPreview ? `🔐 *Recibo Anexado (Link Seguro 24h):*\n${tempSignedUrlForMetaOrPreview}\n` : '') +
          (isMockMode
            ? `\n🧪 _[Simulação]: Aprovação financeira simulada. Auditoria real preservada._`
            : `\n🚀 _A administração confirmou a entrada financeira. Encomenda agendada para expedição._`);
        break;
      }

      case 'order_processing': {
        formattedMessage = `${prefix}📦 *ENCOMENDA EM PREPARAÇÃO & CONTROLO DE QUALIDADE*\n\n` +
          `📦 *Código:* #${orderId}\n` +
          `👤 *Cliente:* ${clientName} (${clientPhone})\n` +
          `🔍 *Estado:* Empacotamento anti-impacto e conferência técnica dos equipamentos em curso no centro de expedição.\n`;
        break;
      }

      case 'order_shipped': {
        formattedMessage = `${prefix}🚚 *ENCOMENDA EM ROTA DE ENTREGA*\n\n` +
          `📦 *Código:* #${orderId}\n` +
          `👤 *Cliente:* ${clientName} (${clientPhone})\n` +
          (addressStr ? `📍 *Endereço de Destino:* ${addressStr}\n` : '') +
          `🛵 *Estado:* Viatura express / estafeta despachado com a encomenda para entrega prioritária.\n`;
        break;
      }

      case 'order_delivered': {
        formattedMessage = `${prefix}🎉 *ENCOMENDA ENTREGUE COM SUCESSO*\n\n` +
          `📦 *Código:* #${orderId}\n` +
          `👤 *Cliente:* ${clientName}\n` +
          `✅ *Estado:* Entrega concluída com sucesso no endereço do cliente. Garantia oficial de 7 dias activada.\n`;
        break;
      }

      default: {
        formattedMessage = `${prefix}ℹ️ *NOTIFICAÇÃO DE ENCOMENDA #${orderId}*\nCliente: ${clientName}\nEstado: ${eventType}\nTotal: ${totalKz} Kz`;
      }
    }

    const waLink = `https://wa.me/${COMPANY_WHATSAPP_NUMBER}?text=${encodeURIComponent(formattedMessage)}`;

    // =========================================================================
    // 7. EXECUÇÃO EM MODO MOCK (SIMULAÇÃO)
    // =========================================================================
    if (isMockMode) {
      const mockMetaId = `mock_wamid_${orderId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      if (supabaseAdmin) {
        try {
          await supabaseAdmin.from('whatsapp_dispatch_logs').upsert([{
            event_type: eventType,
            order_code: orderId,
            recipient: COMPANY_WHATSAPP_NUMBER,
            status: 'SIMULATED',
            dispatch_mode: 'mock',
            message_type: receiptRelativePath ? (isReceiptPdf ? 'document' : 'image') : 'text',
            meta_message_id: mockMetaId,
            document_storage_path: receiptRelativePath || null,
            document_filename: receiptRelativePath ? receiptFileName : null,
            document_mime_type: receiptRelativePath ? receiptMimeType : null,
            deduplication_key: finalKey,
            formatted_body: formattedMessage,
            payload: { orderId, clientName, total: totalKz, eventType, isSimulation: true }
          }], { onConflict: 'deduplication_key' });
        } catch (logErr: any) {
          console.warn('Aviso ao registar log de simulação WhatsApp:', logErr.message);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          mode: 'mock',
          status: 'SIMULATED',
          simulated: true,
          apiUsed: false,
          configured: false,
          destination: `+${COMPANY_WHATSAPP_NUMBER}`,
          metaMessageId: mockMetaId,
          documentProcessed: receiptRelativePath ? {
            storagePath: receiptRelativePath,
            fileName: receiptFileName,
            mimeType: receiptMimeType,
            hasTemporarySignedUrl: Boolean(tempSignedUrlForMetaOrPreview)
          } : null,
          message: `Notificação #${orderId} (${eventType}) simulada com sucesso em modo MOCK. Registada com status SIMULATED.`,
          formattedMessage,
          waLink,
          temporarySignedUrl: tempSignedUrlForMetaOrPreview || null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 8. EXECUÇÃO EM MODO CLOUD API REAL (Meta Graph API)
    // =========================================================================
    const metaBaseUrl = `https://graph.facebook.com/v21.0/${whatsappPhoneNumberId}/messages`;
    let mediaMetaId = null;
    let textMetaId = null;

    // 8.1 Envio de Comprovativo como Documento/Imagem Nativo
    if (tempSignedUrlForMetaOrPreview && (isReceiptPdf || isReceiptImage)) {
      try {
        const mediaPayload = isReceiptPdf
          ? {
              messaging_product: 'whatsapp',
              to: COMPANY_WHATSAPP_NUMBER,
              type: 'document',
              document: {
                link: tempSignedUrlForMetaOrPreview,
                caption: `📄 Comprovativo da Encomenda #${orderId} — ${clientName} (${totalKz} Kz)`,
                filename: receiptFileName
              }
            }
          : {
              messaging_product: 'whatsapp',
              to: COMPANY_WHATSAPP_NUMBER,
              type: 'image',
              image: {
                link: tempSignedUrlForMetaOrPreview,
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
        console.warn('Aviso no envio do comprovativo via WhatsApp Cloud API:', mediaErr.message);
      }
    }

    // 8.2 Envio da Mensagem de Texto
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

    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('whatsapp_dispatch_logs').upsert([{
          event_type: eventType,
          order_code: orderId,
          recipient: COMPANY_WHATSAPP_NUMBER,
          status: isOverallSuccess ? 'SENT' : 'FAILED',
          dispatch_mode: 'cloud_api',
          message_type: receiptRelativePath ? (isReceiptPdf ? 'document' : 'image') : 'text',
          meta_message_id: textMetaId || mediaMetaId,
          document_storage_path: receiptRelativePath || null,
          document_filename: receiptRelativePath ? receiptFileName : null,
          document_mime_type: receiptRelativePath ? receiptMimeType : null,
          deduplication_key: finalKey,
          formatted_body: formattedMessage,
          last_error: isOverallSuccess ? null : JSON.stringify(textJson),
          payload: { orderId, clientName, total: totalKz, eventType }
        }], { onConflict: 'deduplication_key' });
      } catch (_logErr) {}
    }

    if (!isOverallSuccess) {
      return new Response(
        JSON.stringify({
          success: false,
          mode: 'cloud_api',
          status: 'FAILED',
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
        mode: 'cloud_api',
        status: 'SENT',
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
