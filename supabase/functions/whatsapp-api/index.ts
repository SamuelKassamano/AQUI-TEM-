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
  action?: 'notify-company' | 'notify-customer' | 'notify-lead' | 'check-status' | 'list-logs' | 'get-receipt-url' | 'test-simulate' | 'diagnose-token' | 'controlled-test-send' | 'customer-opt-out';
  channel?: 'internal' | 'customer';
  customerConsent?: boolean;
  consentSource?: string;
  eventType?: 'order_created' | 'receipt_submitted' | 'payment_confirmed' | 'order_processing' | 'order_shipped' | 'order_delivered' | 'lead_captured' | 'external_meta' | 'customer_opt_out';
  phone?: string;
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
 * Comparação em tempo constante para protecção contra Timing Attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
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
    return timingSafeEqual(hashHex.toLowerCase(), expectedHash);
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
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const whatsappMode = (Deno.env.get('WHATSAPP_MODE') || 'mock').toLowerCase().trim();
  const whatsappToken = Deno.env.get('WHATSAPP_TOKEN') || Deno.env.get('WHATSAPP_API_TOKEN') || '';
  const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '';
  const whatsappBusinessAccountId = Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID') || '';
  const webhookVerifyToken = Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN') || DEFAULT_WEBHOOK_VERIFY_TOKEN;
  
  // Resolução robusta de META_APP_SECRET (casing insensível, espaços aparados, sinónimos)
  let metaAppSecret = (Deno.env.get('META_APP_SECRET') || Deno.env.get('WHATSAPP_APP_SECRET') || '').trim();
  if (!metaAppSecret) {
    try {
      const allEnv = Deno.env.toObject();
      for (const [k, v] of Object.entries(allEnv)) {
        const cleanK = k.trim().toUpperCase();
        if (cleanK === 'META_APP_SECRET' || cleanK === 'WHATSAPP_APP_SECRET' || cleanK === 'META_SECRET' || cleanK === 'APP_SECRET') {
          metaAppSecret = (v || '').trim();
          break;
        }
      }
    } catch (_e) { }
  }

  // Validador de sessão administrativa
  const verifyAdminSession = async (request: Request): Promise<boolean> => {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return false;
    if (supabaseServiceRoleKey && token === supabaseServiceRoleKey) return true;
    try {
      const client = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceRoleKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false }
      });
      const { data: { user }, error } = await client.auth.getUser();
      return Boolean(!error && user);
    } catch (_e) {
      return false;
    }
  };

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
      // 3.1 Validação de Assinatura Criptográfica HMAC da Meta Obrigatória (X-Hub-Signature-256)
      if (!metaAppSecret) {
        console.warn('Webhook Meta rejeitado: META_APP_SECRET não está configurado.');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'MISSING_META_APP_SECRET',
            message: 'Webhook rejeitado: Secret META_APP_SECRET não configurado no backend. Configure nas definições do Supabase.'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const sigHeader = req.headers.get('x-hub-signature-256');
      if (!sigHeader) {
        console.warn('Webhook Meta rejeitado: Cabeçalho X-Hub-Signature-256 ausente.');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'MISSING_SIGNATURE',
            message: 'Webhook rejeitado: Cabeçalho de assinatura X-Hub-Signature-256 ausente.'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const isSigValid = await verifyMetaHmac(rawBodyText, sigHeader, metaAppSecret);
      if (!isSigValid) {
        console.warn('Webhook Meta rejeitado: Assinatura HMAC inválida.');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'INVALID_SIGNATURE',
            message: 'Webhook rejeitado: Assinatura HMAC-SHA256 inválida.'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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

          // 3.2 Processamento de Mensagens Recebidas (Opt-Out / Cancelamento voluntário com "PARAR")
          const incomingMessages = change.value?.messages || [];
          for (const msg of incomingMessages) {
            const fromNum = (msg.from || '').replace(/\D/g, '');
            const textContent = (msg.text?.body || '').trim().toUpperCase();
            if (fromNum && (textContent === 'PARAR' || textContent === 'STOP' || textContent === 'CANCELAR')) {
              console.log(`[OPT-OUT] Comando ${textContent} recebido do número ${fromNum}`);
              if (supabaseAdmin) {
                try {
                  const nowIso = new Date().toISOString();
                  await supabaseAdmin
                    .from('crm_leads')
                    .update({
                      whatsapp_opt_out: true,
                      whatsapp_consent: false,
                      whatsapp_opt_out_at: nowIso
                    })
                    .or(`phone.ilike.%${fromNum}%,phone.ilike.%${fromNum.slice(-9)}%`);

                  await supabaseAdmin
                    .from('whatsapp_dispatch_logs')
                    .insert([{
                      event_type: 'customer_opt_out',
                      channel: 'customer',
                      recipient: fromNum,
                      status: 'BLOCKED_OPT_OUT',
                      dispatch_mode: 'external_meta',
                      message_type: 'text',
                      formatted_body: `🚫 Opt-out via WhatsApp Webhook: cliente enviou '${textContent}'. Notificações canceladas.`,
                      deduplication_key: `webhook-optout-${fromNum}-${Date.now()}`,
                      customer_consent: false,
                      consent_source: 'webhook_stop_keyword',
                      payload: { from: fromNum, message: textContent, raw: msg }
                    }]);
                } catch (optErr: any) {
                  console.warn('Erro ao processar opt-out no banco:', optErr.message);
                }
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
      channel: requestedChannel,
      customerConsent = false,
      consentSource = 'checkout_checkbox',
      eventType = 'order_created',
      orderData,
      leadData,
      deduplicationKey,
      storagePath,
      phone: directPhone,
      limit = 50,
      page = 1,
      statusFilter = 'all',
      originFilter = 'all'
    } = body as NotificationPayload;

    const channel: 'internal' | 'customer' = requestedChannel || (action === 'notify-customer' ? 'customer' : 'internal');

    // 4.0 Acção Administrativa / Programática de Opt-Out do Cliente (PARAR)
    if (action === 'customer-opt-out') {
      const phoneToOptOut = (directPhone || orderData?.customerPhone || '').replace(/\D/g, '');
      if (!phoneToOptOut || phoneToOptOut.length < 9) {
        return new Response(
          JSON.stringify({ success: false, message: 'Número de telefone inválido para registo de opt-out.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (supabaseAdmin) {
        try {
          const nowIso = new Date().toISOString();
          await supabaseAdmin
            .from('crm_leads')
            .update({
              whatsapp_opt_out: true,
              whatsapp_consent: false,
              whatsapp_opt_out_at: nowIso
            })
            .or(`phone.ilike.%${phoneToOptOut}%,phone.ilike.%${phoneToOptOut.slice(-9)}%`);

          await supabaseAdmin
            .from('whatsapp_dispatch_logs')
            .insert([{
              event_type: 'customer_opt_out',
              channel: 'customer',
              recipient: phoneToOptOut,
              status: 'BLOCKED_OPT_OUT',
              dispatch_mode: whatsappMode,
              message_type: 'text',
              formatted_body: `🚫 Opt-out de notificações WhatsApp registado com sucesso (PARAR) para +${phoneToOptOut}.`,
              deduplication_key: `opt-out-${phoneToOptOut}-${Date.now()}`,
              customer_consent: false,
              consent_source: 'opt_out_action',
              payload: { phone: phoneToOptOut, action: 'customer-opt-out', timestamp: nowIso }
            }]);
        } catch (dbErr: any) {
          console.warn('Aviso no registo de opt-out:', dbErr.message);
        }
      }
      return new Response(
        JSON.stringify({ success: true, message: `Opt-out registado com sucesso para +${phoneToOptOut}.` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
          envSecretKeysDetected: Object.keys(Deno.env.toObject()).map(k => k.trim()).filter(k => {
            const u = k.toUpperCase();
            return u.includes('META') || u.includes('SECRET') || u.includes('WHATSAPP');
          }),
          message: whatsappMode === 'mock'
            ? 'Sistema a operar em MODO SIMULAÇÃO (MOCK). Nenhuma mensagem real é enviada à Meta.'
            : (isConfigured
              ? 'WhatsApp Business Cloud API está activa e configurada em modo de produção.'
              : 'Modo cloud_api activo, mas credenciais Meta em falta nos secrets do Supabase.')
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4.1.0 Autoteste de Assinatura HMAC com o Secret Configurado (Sem Exposição de Credenciais)
    if (action === 'test-hmac-self') {
      if (!metaAppSecret) {
        return new Response(
          JSON.stringify({ success: false, error: 'MISSING_SECRET', message: 'META_APP_SECRET não está configurado.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const samplePayload = JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [{
          id: whatsappBusinessAccountId || '1230360799324390',
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '15551832801', phone_number_id: whatsappPhoneNumberId || '1527292017127020' },
              statuses: [{ id: `mock_status_${Date.now()}`, status: 'delivered', timestamp: `${Math.floor(Date.now() / 1000)}`, recipient_id: '244950752933' }]
            },
            field: 'messages'
          }]
        }]
      });

      const encoder = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(metaAppSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(samplePayload));
      const validHex = Array.from(new Uint8Array(sigBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      const validHeader = `sha256=${validHex}`;

      const checkValid = await verifyMetaHmac(samplePayload, validHeader, metaAppSecret);
      const checkInvalid = await verifyMetaHmac(samplePayload, 'sha256=invalidhash00000000000000000000000000000000000000000000000000000000', metaAppSecret);
      const checkMissing = await verifyMetaHmac(samplePayload, null, metaAppSecret);

      let liveHttpResult: any = null;
      try {
        const selfUrl = `${supabaseUrl}/functions/v1/whatsapp-api`;
        const liveRes = await fetch(selfUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Hub-Signature-256': validHeader
          },
          body: samplePayload
        });
        const liveText = await liveRes.text();
        liveHttpResult = {
          status: liveRes.status,
          responseBody: liveText.slice(0, 100),
          isSuccessHttp200: liveRes.status === 200
        };
      } catch (err: any) {
        liveHttpResult = { error: err.message };
      }

      return new Response(
        JSON.stringify({
          success: true,
          configured: true,
          hmacVerification: {
            validSignatureAccepted: checkValid,
            invalidSignatureRejected: !checkInvalid,
            missingSignatureRejected: !checkMissing,
            liveHttpWebhookTest: liveHttpResult
          },
          message: 'Autoteste de validação HMAC concluído com sucesso. O Secret configurado é válido e operacional.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4.1.1 Diagnóstico Autenticado do Token e Activos Meta (Sem Envio de Mensagens)
    // Permite auditar validade, permissões (scopes), WABA e Phone Number sem expor credenciais
    if (action === 'diagnose-token') {
      const isAdmin = Boolean(
        (body.adminSecret && webhookVerifyToken && body.adminSecret === webhookVerifyToken) ||
        (await verifyAdminSession(req))
      );
      if (!isAdmin) {
        return new Response(
          JSON.stringify({
            success: false,
            securityBlock: true,
            message: 'Acesso negado: apenas administradores autorizados podem executar o diagnóstico de credenciais.'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!whatsappToken) {
        return new Response(
          JSON.stringify({
            success: false,
            isValid: false,
            configured: false,
            message: 'Secret WHATSAPP_TOKEN não configurado no Supabase.'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const diagnosticResults: any = {
        success: false,
        timestamp: new Date().toISOString(),
        tokenInspection: null,
        phoneNumberInspection: null,
        wabaInspection: null,
        readiness: {
          tokenValid: false,
          hasMessagingPermission: false,
          hasManagementPermission: false,
          phoneNumberAccessible: false,
          wabaAccessible: false,
          phoneMatchesWaba: false,
          readyForSend: false
        }
      };

      // 1. Diagnóstico de Token via debug_token
      try {
        const debugRes = await fetch(
          `https://graph.facebook.com/v21.0/debug_token?input_token=${encodeURIComponent(whatsappToken)}&access_token=${encodeURIComponent(whatsappToken)}`
        );
        const debugJson = await debugRes.json();

        if (debugRes.ok && debugJson?.data) {
          const d = debugJson.data;
          const scopes: string[] = Array.isArray(d.scopes) ? d.scopes : [];
          const hasMessaging = scopes.includes('whatsapp_business_messaging');
          const hasManagement = scopes.includes('whatsapp_business_management');
          const isNeverExpiring = d.expires_at === 0 || !d.expires_at;
          const expiresAtIso = d.expires_at ? new Date(d.expires_at * 1000).toISOString() : null;
          const hoursRemaining = d.expires_at ? Math.max(0, Math.round(((d.expires_at * 1000) - Date.now()) / (1000 * 60 * 60) * 10) / 10) : null;

          diagnosticResults.tokenInspection = {
            isValid: Boolean(d.is_valid),
            appId: d.app_id || null,
            applicationName: d.application || null,
            type: d.type || null,
            isNeverExpiring,
            expiresAt: expiresAtIso,
            hoursRemaining,
            scopesDetected: scopes
          };

          diagnosticResults.readiness.tokenValid = Boolean(d.is_valid);
          diagnosticResults.readiness.hasMessagingPermission = hasMessaging;
          diagnosticResults.readiness.hasManagementPermission = hasManagement;
        } else {
          diagnosticResults.tokenInspection = {
            isValid: false,
            error: debugJson?.error || 'Token inválido ou não inspecionável'
          };
        }
      } catch (e: any) {
        diagnosticResults.tokenInspection = { isValid: false, error: e.message };
      }

      // 2. Diagnóstico do Phone Number ID
      if (whatsappPhoneNumberId) {
        try {
          const phoneRes = await fetch(
            `https://graph.facebook.com/v21.0/${whatsappPhoneNumberId}?fields=id,display_phone_number,verified_name,code_verification_status,quality_rating`,
            { headers: { 'Authorization': `Bearer ${whatsappToken}` } }
          );
          const phoneJson = await phoneRes.json();
          if (phoneRes.ok && phoneJson?.id) {
            diagnosticResults.phoneNumberInspection = {
              accessible: true,
              id: phoneJson.id,
              displayPhoneNumber: phoneJson.display_phone_number || null,
              verifiedName: phoneJson.verified_name || null,
              verificationStatus: phoneJson.code_verification_status || null,
              qualityRating: phoneJson.quality_rating || null
            };
            diagnosticResults.readiness.phoneNumberAccessible = true;
          } else {
            diagnosticResults.phoneNumberInspection = {
              accessible: false,
              id: whatsappPhoneNumberId,
              error: phoneJson?.error || 'Não acessível com este token'
            };
          }
        } catch (e: any) {
          diagnosticResults.phoneNumberInspection = { accessible: false, error: e.message };
        }
      }

      // 3. Diagnóstico do WABA ID e Correspondência com o Número
      if (whatsappBusinessAccountId) {
        try {
          const wabaRes = await fetch(
            `https://graph.facebook.com/v21.0/${whatsappBusinessAccountId}/phone_numbers?fields=id,display_phone_number`,
            { headers: { 'Authorization': `Bearer ${whatsappToken}` } }
          );
          const wabaJson = await wabaRes.json();
          if (wabaRes.ok && Array.isArray(wabaJson?.data)) {
            const numbers = wabaJson.data;
            const matchesPhone = numbers.some((n: any) => n.id === whatsappPhoneNumberId);
            diagnosticResults.wabaInspection = {
              accessible: true,
              wabaId: whatsappBusinessAccountId,
              phoneNumbersCount: numbers.length,
              matchesConfiguredPhoneId: matchesPhone
            };
            diagnosticResults.readiness.wabaAccessible = true;
            diagnosticResults.readiness.phoneMatchesWaba = matchesPhone;
          } else {
            diagnosticResults.wabaInspection = {
              accessible: false,
              wabaId: whatsappBusinessAccountId,
              error: wabaJson?.error || 'WABA não acessível com este token'
            };
          }
        } catch (e: any) {
          diagnosticResults.wabaInspection = { accessible: false, error: e.message };
        }
      }

      // Avaliação final de prontidão
      diagnosticResults.readiness.readyForSend = Boolean(
        diagnosticResults.readiness.tokenValid &&
        diagnosticResults.readiness.hasMessagingPermission &&
        diagnosticResults.readiness.phoneNumberAccessible
      );
      diagnosticResults.success = diagnosticResults.readiness.readyForSend;

      return new Response(JSON.stringify(diagnosticResults), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4.2 DISPARO DE TESTE REAL CONTROLADO (AUTORIZADO PELA ADMINISTRAÇÃO)
    // - Mantém WHATSAPP_MODE=mock globalmente
    // - Envia EXCLUSIVAMENTE para +244 950 752 933
    // - Exige autenticação administrativa
    // - Protegido por idempotência
    // - Não toca em encomendas, leads nem finanças
    if (action === 'controlled-test-send') {
      // 1. Verificação de Autenticação Administrativa
      const isAdmin = Boolean(
        (body.adminSecret && webhookVerifyToken && body.adminSecret === webhookVerifyToken) ||
        (await verifyAdminSession(req))
      );
      if (!isAdmin) {
        return new Response(
          JSON.stringify({
            success: false,
            securityBlock: true,
            message: 'Acesso negado: apenas administradores autorizados podem disparar o teste controlado.'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 2. Validação Restrita do Destinatário (+244 950 752 933)
      const requestedRecipient = String(body.recipient || COMPANY_WHATSAPP_NUMBER).replace(/\D/g, '');
      if (requestedRecipient !== COMPANY_WHATSAPP_NUMBER) {
        return new Response(
          JSON.stringify({
            success: false,
            securityBlock: true,
            message: `Destinatário '+${requestedRecipient}' não autorizado. O teste controlado é estritamente restrito ao número oficial +${COMPANY_WHATSAPP_NUMBER}.`
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 3. Validação das Credenciais
      if (!whatsappToken || !whatsappPhoneNumberId) {
        return new Response(
          JSON.stringify({
            success: false,
            configured: false,
            missingCredentials: [
              ...(!whatsappToken ? ['WHATSAPP_TOKEN'] : []),
              ...(!whatsappPhoneNumberId ? ['WHATSAPP_PHONE_NUMBER_ID'] : [])
            ],
            message: 'Credenciais Meta em falta para disparo do teste real.'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 4. Verificação de Idempotência
      const testDedupKey = body.deduplicationKey || `wa-controlled-test-homologation`;
      if (supabaseAdmin) {
        try {
          const { data: existingTestLog } = await supabaseAdmin
            .from('whatsapp_dispatch_logs')
            .select('id, status, meta_message_id, created_at')
            .eq('deduplication_key', testDedupKey)
            .maybeSingle();

          if (existingTestLog && (existingTestLog.status === 'SENT' || existingTestLog.status === 'DELIVERED')) {
            return new Response(
              JSON.stringify({
                success: true,
                duplicate: true,
                status: existingTestLog.status,
                metaMessageId: existingTestLog.meta_message_id,
                message: `Teste controlado (${testDedupKey}) já foi executado anteriormente com estado '${existingTestLog.status}'. Envios duplicados bloqueados por idempotência.`,
                existingLog: existingTestLog
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (_dedupErr) { }
      }

      // 5. Mensagem Oficial Autorizada
      const authorizedBody = 'AQUI TEM ANGOLA — Teste de homologação do WhatsApp Business API realizado com sucesso. Esta é uma mensagem de teste do sistema de notificações.';

      // 6. Chamada Exclusiva e Isolada à Meta Graph API
      const metaBaseUrl = `https://graph.facebook.com/v21.0/${whatsappPhoneNumberId}/messages`;
      try {
        const metaRes = await fetch(metaBaseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: COMPANY_WHATSAPP_NUMBER,
            type: 'text',
            text: { preview_url: false, body: authorizedBody }
          })
        });

        const metaJson = await metaRes.json();
        const metaMsgId = metaJson?.messages?.[0]?.id || null;
        const isSuccess = metaRes.ok && Boolean(metaMsgId);
        const metaStatus = isSuccess ? 'SENT' : 'FAILED';
        const timestamp = new Date().toISOString();

        // 7. Registo Completo de Auditoria em whatsapp_dispatch_logs
        if (supabaseAdmin) {
          try {
            await supabaseAdmin.from('whatsapp_dispatch_logs').upsert([{
              event_type: 'controlled_test',
              order_code: null,
              lead_id: null,
              recipient: COMPANY_WHATSAPP_NUMBER,
              status: metaStatus,
              dispatch_mode: 'controlled_test',
              message_type: 'text',
              meta_message_id: metaMsgId,
              deduplication_key: testDedupKey,
              formatted_body: authorizedBody,
              raw_meta_status: isSuccess ? 'sent' : 'failed',
              error_code: isSuccess ? null : String(metaJson?.error?.code || '190'),
              error_details: isSuccess ? null : String(metaJson?.error?.message || 'Authentication Error'),
              fbtrace_id: isSuccess ? null : String(metaJson?.error?.fbtrace_id || ''),
              last_error: isSuccess ? null : JSON.stringify(metaJson),
              payload: {
                testType: 'controlled_test_send',
                wabaId: whatsappBusinessAccountId || null,
                phoneNumberId: whatsappPhoneNumberId,
                recipient: COMPANY_WHATSAPP_NUMBER,
                metaResponse: metaJson
              },
              created_at: timestamp,
              updated_at: timestamp
            }], { onConflict: 'deduplication_key' });
          } catch (dbErr: any) {
            console.warn('Aviso ao registar auditoria de teste controlado:', dbErr.message);
          }
        }

        if (!isSuccess) {
          return new Response(
            JSON.stringify({
              success: false,
              mode: 'controlled_test',
              status: 'FAILED',
              metaError: metaJson,
              httpStatus: metaRes.status,
              message: 'Meta recusou o envio do teste controlado.',
              destination: `+${COMPANY_WHATSAPP_NUMBER}`
            }),
            { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            mode: 'controlled_test',
            status: 'SENT',
            metaMessageId: metaMsgId,
            destination: `+${COMPANY_WHATSAPP_NUMBER}`,
            timestamp,
            message: 'Envio real de teste aceite pela Meta com sucesso. Aguardando entrega (DELIVERED) no dispositivo.',
            metaResponse: metaJson
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (callErr: any) {
        return new Response(
          JSON.stringify({
            success: false,
            mode: 'controlled_test',
            status: 'FAILED',
            error: callErr.message,
            message: 'Falha na comunicação de rede com a Meta Graph API.'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 4.3 Listagem de Logs de Despacho (Para o Painel Administrativo)
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
        } catch (_dedupErr) { }
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
          } catch (_logErr) { }
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
    // 6. TRATAMENTO DE NOTIFICAÇÃO DE CICLO DE ENCOMENDA (MODELO A E MODELO B)
    // =========================================================================
    if (!orderData || !orderData.id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Dados da encomenda (orderData.id) são obrigatórios.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderId = orderData.id;
    const clientName = orderData.customerName || 'Cliente AQUI TEM';
    const clientEmail = orderData.customerEmail || 'Não informado';
    const totalKz = Number(orderData.total || 0).toLocaleString('pt-AO');
    const paymentMeth = orderData.paymentMethod || 'Transferência Bancária / Multicaixa Express';
    const addressStr = `${orderData.address || ''}, ${orderData.municipality || ''}, ${orderData.province || 'Luanda'}`.replace(/^[\s,]+|[\s,]+$/g, '');

    // 6.1 Regras de Isolamento e Validação por Canal
    let finalRecipient = COMPANY_WHATSAPP_NUMBER;
    let templateName: string | null = null;

    if (channel === 'customer') {
      // Regra 1: lead_captured é estritamente exclusivo do canal interno
      if (eventType === 'lead_captured') {
        return new Response(
          JSON.stringify({ success: false, message: 'Evento lead_captured é restrito ao canal interno da empresa.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Regra 2: Obter e validar o número de telemóvel do cliente sem fallback silencioso
      let cleanCustomerPhone = (orderData.customerPhone || '').replace(/\D/g, '');
      if (cleanCustomerPhone.startsWith('00')) cleanCustomerPhone = cleanCustomerPhone.slice(2);
      if (cleanCustomerPhone.length === 9 && cleanCustomerPhone.startsWith('9')) {
        cleanCustomerPhone = '244' + cleanCustomerPhone;
      }

      if (!cleanCustomerPhone || cleanCustomerPhone.length < 9) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'INVALID_CUSTOMER_PHONE',
            message: `Número de telefone do cliente inválido para notificações WhatsApp: '${orderData.customerPhone || ''}'. Sem fallback silencioso para a empresa.`
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      finalRecipient = cleanCustomerPhone;

      // Mapeamento de Templates Oficiais da Meta (UTILITY)
      const templateMap: Record<string, string> = {
        'order_created': 'aquitem_order_pending',
        'receipt_submitted': 'aquitem_receipt_received',
        'payment_confirmed': 'aquitem_payment_confirmed',
        'order_processing': 'aquitem_order_processing',
        'order_shipped': 'aquitem_order_shipped',
        'order_delivered': 'aquitem_order_delivered'
      };
      templateName = templateMap[eventType] || 'aquitem_order_pending';

      // Chave de Idempotência Independente para o Canal do Cliente
      const finalCustomerKey = deduplicationKey || `customer-${eventType}-${orderId}-${finalRecipient}`;

      // Regra 3: Regra Cronológica Obrigatória de Consentimento e Opt-Out
      // 1. Se whatsapp_opt_in_at for posterior a whatsapp_opt_out_at, permitir notificações.
      // 2. Se whatsapp_opt_out_at for posterior a whatsapp_opt_in_at, bloquear notificações.
      // 3. Sem consentimento válido, bloquear o envio.
      // 4. Uma nova encomenda não elimina um opt-out anterior sem nova autorização explícita (customerConsent === true).

      let isOptedOut = false;
      let hasValidConsent = Boolean(customerConsent);

      if (supabaseAdmin) {
        try {
          const { data: leadRecord } = await supabaseAdmin
            .from('crm_leads')
            .select('whatsapp_opt_out, whatsapp_consent, whatsapp_opt_in_at, whatsapp_opt_out_at')
            .or(`phone.ilike.%${finalRecipient.slice(-9)}%,lead_code.eq.${orderId}`)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (leadRecord) {
            const inTime = leadRecord.whatsapp_opt_in_at ? new Date(leadRecord.whatsapp_opt_in_at).getTime() : 0;
            const outTime = leadRecord.whatsapp_opt_out_at ? new Date(leadRecord.whatsapp_opt_out_at).getTime() : 0;

            if (outTime > inTime) {
              // Opt-out registado é mais recente que o opt-in histórico
              if (customerConsent === true) {
                // Reautorização Explícita na nova encomenda: cliente marcou novamente a caixa voluntária!
                const nowIso = new Date().toISOString();
                await supabaseAdmin
                  .from('crm_leads')
                  .update({
                    whatsapp_opt_out: false,
                    whatsapp_consent: true,
                    whatsapp_opt_in_at: nowIso,
                    whatsapp_consent_source: consentSource || 'checkout_re_opt_in'
                  })
                  .or(`phone.ilike.%${finalRecipient.slice(-9)}%,lead_code.eq.${orderId}`);

                isOptedOut = false;
                hasValidConsent = true;
              } else {
                // Não houve nova autorização explícita: mantém bloqueado pelo opt-out anterior!
                isOptedOut = true;
              }
            } else if (inTime > outTime) {
              // Opt-in é mais recente que o opt-out
              isOptedOut = false;
              if (customerConsent !== false) {
                hasValidConsent = true;
              }
            } else if (leadRecord.whatsapp_opt_out) {
              if (customerConsent === true) {
                const nowIso = new Date().toISOString();
                await supabaseAdmin
                  .from('crm_leads')
                  .update({
                    whatsapp_opt_out: false,
                    whatsapp_consent: true,
                    whatsapp_opt_in_at: nowIso,
                    whatsapp_consent_source: consentSource || 'checkout_re_opt_in'
                  })
                  .or(`phone.ilike.%${finalRecipient.slice(-9)}%,lead_code.eq.${orderId}`);
                isOptedOut = false;
                hasValidConsent = true;
              } else {
                isOptedOut = true;
              }
            }
          }
        } catch (_optErr) { }
      }

      if (isOptedOut) {
        if (supabaseAdmin) {
          try {
            await supabaseAdmin.from('whatsapp_dispatch_logs').upsert([{
              event_type: eventType,
              order_code: orderId,
              channel: 'customer',
              recipient: finalRecipient,
              status: 'BLOCKED_OPT_OUT',
              dispatch_mode: whatsappMode,
              message_type: 'template',
              meta_message_id: null,
              deduplication_key: finalCustomerKey,
              customer_consent: false,
              consent_source: consentSource,
              template_name: templateName,
              formatted_body: `[BLOQUEADO: OPT-OUT ACTIVO] Cliente solicitou PARAR notificações. Evento: ${eventType}`,
              payload: { orderId, clientName, total: totalKz, eventType, blockedReason: 'OPT_OUT', isSimulation: true }
            }], { onConflict: 'deduplication_key' });
          } catch (_e) { }
        }

        return new Response(
          JSON.stringify({
            success: false,
            blocked: true,
            channel: 'customer',
            reason: 'OPTED_OUT',
            message: 'Envio bloqueado: o cliente solicitou opt-out através da palavra PARAR.'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Regra 4: Verificação de Consentimento Voluntário do Cliente
      if (!hasValidConsent) {
        if (supabaseAdmin) {
          try {
            await supabaseAdmin.from('whatsapp_dispatch_logs').upsert([{
              event_type: eventType,
              order_code: orderId,
              channel: 'customer',
              recipient: finalRecipient,
              status: 'BLOCKED_NO_CONSENT',
              dispatch_mode: whatsappMode,
              message_type: 'template',
              meta_message_id: null,
              deduplication_key: finalCustomerKey,
              customer_consent: false,
              consent_source: consentSource,
              template_name: templateName,
              formatted_body: `[BLOQUEADO: SEM CONSENTIMENTO] Cliente não autorizou notificações WhatsApp no checkout. Evento: ${eventType}`,
              payload: { orderId, clientName, total: totalKz, eventType, blockedReason: 'NO_CONSENT', isSimulation: true }
            }], { onConflict: 'deduplication_key' });
          } catch (_e) { }
        }

        return new Response(
          JSON.stringify({
            success: false,
            blocked: true,
            channel: 'customer',
            reason: 'NO_CONSENT',
            message: 'Envio bloqueado: o cliente não autorizou voluntariamente notificações por WhatsApp no checkout.'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Canal Interno: Destinatário corporativo estrito
      finalRecipient = COMPANY_WHATSAPP_NUMBER;
    }

    // Chave de Idempotência Determinística Final por Canal
    const finalKey = deduplicationKey || (channel === 'internal'
      ? `internal-${eventType}-${orderId}`
      : `customer-${eventType}-${orderId}-${finalRecipient}`);

    // Deduplicação no banco de dados
    if (supabaseAdmin) {
      try {
        const { data: existingLog } = await supabaseAdmin
          .from('whatsapp_dispatch_logs')
          .select('id, status, meta_message_id, created_at, channel')
          .eq('deduplication_key', finalKey)
          .maybeSingle();

        if (existingLog && (existingLog.status === 'SENT' || existingLog.status === 'SIMULATED')) {
          return new Response(
            JSON.stringify({
              success: true,
              duplicate: true,
              channel,
              mode: isMockMode ? 'mock' : 'cloud_api',
              status: existingLog.status,
              message: `Notificação WhatsApp (${channel}) para ${orderId} (${eventType}) já foi registada com status '${existingLog.status}'.`,
              existingLog
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (_dedupErr) { }
    }

    // =========================================================================
    // 6.2 Resolução Segura de Comprovativo Bancário (EXCLUSIVO PARA CANAL INTERNO)
    // =========================================================================
    let receiptRelativePath: string | null = null;
    let isReceiptPdf = false;
    let isReceiptImage = false;
    let receiptFileName = `Recibo-${orderId}.pdf`;
    let receiptMimeType = 'application/pdf';
    let tempSignedUrlForMetaOrPreview = '';

    // Acesso ao Storage Privado estritamente restrito ao canal interno
    if (channel === 'internal') {
      receiptRelativePath = orderData.receiptStoragePath || null;
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
          } catch (_leadLookupErr) { }
        }

        if (receiptRelativePath) {
          const ext = receiptRelativePath.split('.').pop()?.toLowerCase() || '';
          isReceiptPdf = ext === 'pdf';
          isReceiptImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
          receiptMimeType = isReceiptPdf ? 'application/pdf' : (ext === 'png' ? 'image/png' : 'image/jpeg');
          receiptFileName = receiptRelativePath.split('/').pop() || `Recibo-${orderId}.${isReceiptPdf ? 'pdf' : 'jpg'}`;

          // Redução da validade da Signed URL ao mínimo operacional (30 minutos = 1800 segundos)
          // NUNCA gravada no banco de dados
          try {
            const { data: signedData } = await supabaseAdmin.storage
              .from('payment-receipts')
              .createSignedUrl(receiptRelativePath, 1800);

            if (signedData?.signedUrl) {
              tempSignedUrlForMetaOrPreview = signedData.signedUrl;
            }
          } catch (signErr: any) {
            console.warn('Aviso ao gerar URL assinado de comprovativo:', signErr.message);
          }
        }
      }
    }

    // =========================================================================
    // 6.3 Formatação da Mensagem Estruturada por Canal
    // =========================================================================
    const prefix = isMockMode ? `🧪 *[SIMULAÇÃO / MOCK — AQUI TEM ANGOLA]*\n` : '';
    let formattedMessage = '';

    if (channel === 'customer') {
      // -----------------------------------------------------------------------
      // MODELO B: Notificações Automáticas ao Cliente (Templates Oficiais)
      // -----------------------------------------------------------------------
      switch (eventType) {
        case 'order_created': {
          formattedMessage = `${prefix}🛍️ *AQUI TEM ANGOLA — Encomenda Registada*\n\n` +
            `Olá *${clientName}*, a sua encomenda *#${orderId}* foi registada com sucesso!\n` +
            `💰 *Valor Total:* ${totalKz} Kz\n` +
            `⏳ *Estado:* Aguardando Pagamento\n\n` +
            `Por favor, efectue a transferência bancária ou Multicaixa Express e anexe o comprovativo na sua Área de Cliente para agendarmos a entrega prioritária.\n\n` +
            `_Para deixar de receber notificações no WhatsApp, responda PARAR._`;
          break;
        }

        case 'receipt_submitted': {
          formattedMessage = `${prefix}📄 *AQUI TEM ANGOLA — Comprovativo Recebido*\n\n` +
            `Olá *${clientName}*, confirmamos a recepção do comprovativo da sua encomenda *#${orderId}*!\n` +
            `🔍 A nossa equipa de tesouraria está a validar a transacção bancária. Assim que confirmada, a sua encomenda será agendada para expedição.\n\n` +
            `_Para deixar de receber notificações no WhatsApp, responda PARAR._`;
          break;
        }

        case 'payment_confirmed': {
          formattedMessage = `${prefix}✅ *AQUI TEM ANGOLA — Pagamento Confirmado*\n\n` +
            `Olá *${clientName}*, o pagamento da sua encomenda *#${orderId}* (${totalKz} Kz) foi aprovado com sucesso!\n` +
            `📅 *Previsão de Entrega:* ${orderData.estimatedDeliveryDate || '3 dias úteis'}\n` +
            `📍 *Código de Rastreio:* ${orderData.trackingNumber || `AQT-EXP-${orderId}`}\n\n` +
            `_Para deixar de receber notificações no WhatsApp, responda PARAR._`;
          break;
        }

        case 'order_processing': {
          formattedMessage = `${prefix}📦 *AQUI TEM ANGOLA — Encomenda em Preparação*\n\n` +
            `Olá *${clientName}*, a sua encomenda *#${orderId}* está em processo de embalamento anti-impacto e conferência técnica no nosso centro de expedição.\n\n` +
            `_Para deixar de receber notificações no WhatsApp, responda PARAR._`;
          break;
        }

        case 'order_shipped': {
          formattedMessage = `${prefix}🚚 *AQUI TEM ANGOLA — Encomenda a Caminho*\n\n` +
            `Olá *${clientName}*, a sua encomenda *#${orderId}* já foi despachada para entrega prioritária!\n` +
            (addressStr ? `📍 *Destino:* ${addressStr}\n` : '') +
            (orderData.trackingNumber ? `🔍 *Código de Rastreio:* ${orderData.trackingNumber}\n\n` : '\n') +
            `_Para deixar de receber notificações no WhatsApp, responda PARAR._`;
          break;
        }

        case 'order_delivered': {
          formattedMessage = `${prefix}🎉 *AQUI TEM ANGOLA — Encomenda Entregue*\n\n` +
            `Olá *${clientName}*, a sua encomenda *#${orderId}* foi entregue com sucesso!\n` +
            `🛡️ A sua *Garantia Oficial de 7 Dias* da AQUI TEM ANGOLA está activa a partir de hoje.\n` +
            `Obrigado pela sua confiança!\n\n` +
            `_Para deixar de receber notificações no WhatsApp, responda PARAR._`;
          break;
        }

        default: {
          formattedMessage = `${prefix}ℹ️ *AQUI TEM ANGOLA — Encomenda #${orderId}*\nOlá ${clientName}, actualização sobre a sua encomenda: ${eventType}.`;
        }
      }
    } else {
      // -----------------------------------------------------------------------
      // MODELO A: Notificações Internas e Privadas (Equipa Operacional)
      // -----------------------------------------------------------------------
      switch (eventType) {
        case 'order_created': {
          formattedMessage = `${prefix}🔔 *NOVA ENCOMENDA REGISTADA — AQUI TEM ANGOLA*\n\n` +
            `📦 *Código:* #${orderId}\n` +
            `👤 *Cliente:* ${clientName}\n` +
            `📞 *Telefone:* ${orderData.customerPhone || 'Não informado'}\n` +
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
            `👤 *Cliente:* ${clientName} (${orderData.customerPhone || 'Não informado'})\n` +
            `💰 *Valor da Encomenda:* ${totalKz} Kz\n` +
            `🕒 *Data/Hora do Envio:* ${nowFormatted}\n\n` +
            `⚠️ *Estado:* PENDENTE DE VALIDAÇÃO FINANCEIRA\n` +
            `_Aviso de Segurança: O envio do comprovativo não confirma o pagamento automaticamente._\n\n` +
            (receiptRelativePath ? `📁 *Documento no Bucket Privado:* ${receiptRelativePath}\n` : '') +
            (tempSignedUrlForMetaOrPreview ? `🔐 *Ligação Segura Temporária (30 min - Painel Admin):*\n${tempSignedUrlForMetaOrPreview}\n\n` : '') +
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
            (tempSignedUrlForMetaOrPreview ? `🔐 *Recibo Anexado (Link Seguro 30 min):*\n${tempSignedUrlForMetaOrPreview}\n` : '') +
            (isMockMode
              ? `\n🧪 _[Simulação]: Aprovação financeira simulada. Auditoria real preservada._`
              : `\n🚀 _A administração confirmou a entrada financeira. Encomenda agendada para expedição._`);
          break;
        }

        case 'order_processing': {
          formattedMessage = `${prefix}📦 *ENCOMENDA EM PREPARAÇÃO & CONTROLO DE QUALIDADE*\n\n` +
            `📦 *Código:* #${orderId}\n` +
            `👤 *Cliente:* ${clientName} (${orderData.customerPhone || 'Não informado'})\n` +
            `🔍 *Estado:* Empacotamento anti-impacto e conferência técnica dos equipamentos em curso no centro de expedição.\n`;
          break;
        }

        case 'order_shipped': {
          formattedMessage = `${prefix}🚚 *ENCOMENDA EM ROTA DE ENTREGA*\n\n` +
            `📦 *Código:* #${orderId}\n` +
            `👤 *Cliente:* ${clientName} (${orderData.customerPhone || 'Não informado'})\n` +
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
          formattedMessage = `${prefix}ℹ️ *NOTIFICAÇÃO INTERNA #${orderId}*\nCliente: ${clientName}\nEstado: ${eventType}\nTotal: ${totalKz} Kz`;
        }
      }
    }

    const waLink = `https://wa.me/${finalRecipient}?text=${encodeURIComponent(formattedMessage)}`;

    // =========================================================================
    // 7. EXECUÇÃO EM MODO MOCK (SIMULAÇÃO)
    // =========================================================================
    if (isMockMode) {
      const mockMetaId = `mock_wamid_${channel}_${orderId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      if (supabaseAdmin) {
        try {
          await supabaseAdmin.from('whatsapp_dispatch_logs').upsert([{
            event_type: eventType,
            order_code: orderId,
            channel: channel,
            recipient: finalRecipient,
            status: 'SIMULATED',
            dispatch_mode: 'mock',
            message_type: channel === 'customer' ? 'template' : (receiptRelativePath ? (isReceiptPdf ? 'document' : 'image') : 'text'),
            meta_message_id: mockMetaId,
            document_storage_path: channel === 'internal' ? (receiptRelativePath || null) : null,
            document_filename: channel === 'internal' ? (receiptRelativePath ? receiptFileName : null) : null,
            document_mime_type: channel === 'internal' ? (receiptRelativePath ? receiptMimeType : null) : null,
            deduplication_key: finalKey,
            formatted_body: formattedMessage,
            customer_consent: channel === 'customer' ? customerConsent : true,
            consent_source: channel === 'customer' ? consentSource : 'internal_system',
            template_name: templateName,
            payload: { orderId, clientName, total: totalKz, eventType, channel, customerConsent, templateName, isSimulation: true }
          }], { onConflict: 'deduplication_key' });
        } catch (logErr: any) {
          console.warn('Aviso ao registar log de simulação WhatsApp:', logErr.message);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          channel,
          mode: 'mock',
          status: 'SIMULATED',
          simulated: true,
          apiUsed: false,
          configured: false,
          destination: `+${finalRecipient}`,
          templateName,
          metaMessageId: mockMetaId,
          documentProcessed: (channel === 'internal' && receiptRelativePath) ? {
            storagePath: receiptRelativePath,
            fileName: receiptFileName,
            mimeType: receiptMimeType,
            hasTemporarySignedUrl: Boolean(tempSignedUrlForMetaOrPreview)
          } : null,
          message: `Notificação #${orderId} (${eventType} - canal ${channel}) simulada com sucesso em modo MOCK. Registada com status SIMULATED.`,
          formattedMessage,
          waLink,
          temporarySignedUrl: (channel === 'internal' && tempSignedUrlForMetaOrPreview) ? tempSignedUrlForMetaOrPreview : null
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

    // 8.1 Envio de Comprovativo como Documento/Imagem Nativo (Apenas Canal Interno)
    if (channel === 'internal' && tempSignedUrlForMetaOrPreview && (isReceiptPdf || isReceiptImage)) {
      try {
        const mediaPayload = isReceiptPdf
          ? {
            messaging_product: 'whatsapp',
            to: finalRecipient,
            type: 'document',
            document: {
              link: tempSignedUrlForMetaOrPreview,
              caption: `📄 Comprovativo da Encomenda #${orderId} — ${clientName} (${totalKz} Kz)`,
              filename: receiptFileName
            }
          }
          : {
            messaging_product: 'whatsapp',
            to: finalRecipient,
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

    // 8.2 Envio da Mensagem (Template para Clientes, Texto Livre para Canal Interno)
    let outboundPayload: any = null;

    if (channel === 'customer' && templateName) {
      // Disparo com Template Oficial Meta (Categoria UTILITY)
      outboundPayload = {
        messaging_product: 'whatsapp',
        to: finalRecipient,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'pt_PT' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: clientName },
                { type: 'text', text: orderId },
                { type: 'text', text: totalKz }
              ]
            }
          ]
        }
      };
    } else {
      // Canal Interno: Texto livre estruturado
      outboundPayload = {
        messaging_product: 'whatsapp',
        to: finalRecipient,
        type: 'text',
        text: {
          preview_url: true,
          body: formattedMessage
        }
      };
    }

    const textRes = await fetch(metaBaseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(outboundPayload)
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
          channel: channel,
          recipient: finalRecipient,
          status: isOverallSuccess ? 'SENT' : 'FAILED',
          dispatch_mode: 'cloud_api',
          message_type: channel === 'customer' ? 'template' : (receiptRelativePath ? (isReceiptPdf ? 'document' : 'image') : 'text'),
          meta_message_id: textMetaId || mediaMetaId,
          document_storage_path: channel === 'internal' ? (receiptRelativePath || null) : null,
          document_filename: channel === 'internal' ? (receiptRelativePath ? receiptFileName : null) : null,
          document_mime_type: channel === 'internal' ? (receiptRelativePath ? receiptMimeType : null) : null,
          deduplication_key: finalKey,
          formatted_body: formattedMessage,
          customer_consent: channel === 'customer' ? customerConsent : true,
          consent_source: channel === 'customer' ? consentSource : 'internal_system',
          template_name: templateName,
          last_error: isOverallSuccess ? null : JSON.stringify(textJson),
          payload: { orderId, clientName, total: totalKz, eventType, channel, customerConsent, templateName }
        }], { onConflict: 'deduplication_key' });
      } catch (_logErr) { }
    }

    if (!isOverallSuccess) {
      return new Response(
        JSON.stringify({
          success: false,
          channel,
          mode: 'cloud_api',
          status: 'FAILED',
          apiUsed: true,
          configured: true,
          destination: `+${finalRecipient}`,
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
        channel,
        mode: 'cloud_api',
        status: 'SENT',
        apiUsed: true,
        configured: true,
        destination: `+${finalRecipient}`,
        templateName,
        metaResponse: textJson,
        mediaSent: Boolean(mediaMetaId),
        message: `Notificação enviada com sucesso para o WhatsApp (+${finalRecipient} - canal ${channel}) via Cloud API.`,
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
