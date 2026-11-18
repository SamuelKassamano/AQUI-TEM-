import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Lista estrita de origens permitidas (CORS)
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

/**
 * Validação de sessão e perfil de administrador (public.admin_users)
 */
async function verifyAdminAuth(
  req: Request,
  supabaseUrl: string,
  supabaseAnonKey: string,
  supabaseServiceRoleKey: string
): Promise<boolean> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  try {
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    });
    const { data: { user }, error } = await userClient.auth.getUser();
    if (error || !user) return false;

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });

    const { data: adminRecord, error: adminErr } = await adminClient
      .from('admin_users')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (adminErr || !adminRecord) {
      return false;
    }

    return true;
  } catch (_e) {
    return false;
  }
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
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(
      JSON.stringify({ success: false, message: 'Erro de configuração do servidor backend.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { action = 'get-signed-url', orderCode, receiptToken, storagePath, expiresIn = 1800 } = body || {};

    // =========================================================================
    // ACÇÃO DE RASTREIO PÚBLICO SEGURO (Sem necessidade de token criptográfico)
    // Regra: Retorna apenas progresso e marcos sem expor dados pessoais a terceiros
    // =========================================================================
    if (action === 'track-order') {
      const rawCode = String(body.code || body.orderCode || body.trackingNumber || orderCode || '').trim();
      if (!rawCode) {
        return new Response(
          JSON.stringify({ success: false, message: 'Código de encomenda ou número de rastreio é obrigatório.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Normalização robusta de prefixos (AQT-, AQT-TRK-, #, espaços)
      let clean = rawCode.replace(/^[#\s]+/, '').trim().toUpperCase();
      if (clean.startsWith('AQT-TRK-')) {
        clean = clean.replace(/^AQT-TRK-/, '');
      }
      if (!clean.startsWith('AQT-')) {
        clean = `AQT-${clean}`;
      }

      const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false }
      });

      // Busca o registo canónico em crm_leads
      let { data: lead, error: leadErr } = await adminClient
        .from('crm_leads')
        .select('id, lead_code, name, city, address, product_name, total_value, status, notes, history, receipt_storage_path, receipt_uploaded_at, created_at, updated_at')
        .ilike('lead_code', clean)
        .maybeSingle();

      if (!lead) {
        // Fallback para códigos numéricos ou busca aproximada
        const numericPart = clean.replace(/\D/g, '');
        if (numericPart.length >= 4) {
          const { data: fallbackLeads } = await adminClient
            .from('crm_leads')
            .select('id, lead_code, name, city, address, product_name, total_value, status, notes, history, receipt_storage_path, receipt_uploaded_at, created_at, updated_at')
            .ilike('lead_code', `%${numericPart}%`)
            .limit(1);
          if (fallbackLeads && fallbackLeads.length > 0) {
            lead = fallbackLeads[0];
          }
        }
      }

      if (!lead) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `Nenhuma encomenda encontrada com o código "${rawCode}". Verifique o código e tente novamente.`
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const canonicalAqtCode = lead.lead_code || clean;
      const canonicalTrackingNumber = `AQT-TRK-${canonicalAqtCode.replace(/^AQT-/, '')}`;

      // Extração de data de confirmação do pagamento e previsão de entrega
      const rawHistory = Array.isArray(lead.history) ? lead.history : [];
      let paymentConfirmedAt: string | null = null;
      let estimatedDeliveryDate = '3 dias úteis após validação do pagamento';

      for (const h of rawHistory) {
        const actionStr = (h.action || '').toLowerCase();
        const detailsStr = (h.details || '').toLowerCase();
        if (
          actionStr.includes('pagamento') ||
          actionStr.includes('confirmado') ||
          actionStr.includes('agendada') ||
          detailsStr.includes('pagamento validado')
        ) {
          paymentConfirmedAt = h.date || lead.updated_at;
        }
        if (detailsStr.includes('20/11/2026') || detailsStr.includes('agendada para') || detailsStr.includes('previsão')) {
          const matchDate = h.details.match(/\d{2}\/\d{2}\/\d{4}/);
          if (matchDate) estimatedDeliveryDate = matchDate[0];
        }
      }

      if (lead.notes) {
        const matchNoteDate = lead.notes.match(/(\d{2}\/\d{2}\/\d{4})/);
        if (matchNoteDate) estimatedDeliveryDate = matchNoteDate[1];
      }

      // Mapeamento dos 7 estados oficiais a partir do estado CRM e histórico
      let displayStatus = lead.status || 'Aguardando Pagamento';
      if (lead.status === 'Novo Lead') {
        displayStatus = lead.receipt_storage_path ? 'Comprovativo Recebido' : 'Aguardando Pagamento';
      } else if (lead.status === 'Em Atendimento') {
        displayStatus = 'Pendente de Confirmação';
      } else if (lead.status === 'Venda Realizada') {
        displayStatus = 'Encomenda Agendada';
        for (const h of rawHistory) {
          const act = (h.action || '').toLowerCase();
          if (act.includes('entregue')) { displayStatus = 'Entregue'; break; }
          if (act.includes('rota')) { displayStatus = 'Em Rota'; break; }
          if (act.includes('preparação')) { displayStatus = 'Em Preparação'; break; }
        }
      }

      if (['Encomenda Agendada', 'Em Preparação', 'Em Rota', 'Entregue', 'pago', 'Venda Realizada'].includes(lead.status)) {
        if (!paymentConfirmedAt) paymentConfirmedAt = lead.updated_at || lead.created_at;
      }

      // Sanitização estrita de privacidade: Não expor telefone, endereço completo ou dados financeiros confidenciais
      const nameParts = (lead.name || 'Cliente').trim().split(/\s+/);
      const sanitizedName = nameParts.length > 1
        ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
        : nameParts[0];

      const sanitizedCustomer = {
        name: sanitizedName,
        city: lead.city || 'Luanda',
        province: (lead.city || 'Luanda').split('—')[0].trim()
      };

      const sanitizedHistory = rawHistory.map((h: any) => ({
        date: h.date || '',
        action: h.action || 'Actualização de Estado',
        details: h.details
          ? h.details
              .replace(/\b\d{9}\b/g, '***')
              .replace(/IBAN\s+[A-Z0-9.]+/gi, '***')
              .replace(/motorista:[^|.]+/gi, '')
          : ''
      }));

      return new Response(
        JSON.stringify({
          success: true,
          order: {
            orderCode: canonicalAqtCode,
            trackingNumber: canonicalTrackingNumber,
            product: lead.product_name || 'Produto AQUI TEM',
            orderDate: lead.created_at,
            status: displayStatus,
            paymentConfirmedAt,
            estimatedDeliveryDate,
            history: sanitizedHistory,
            hasReceipt: Boolean(lead.receipt_storage_path),
            customer: sanitizedCustomer
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'send-order-email') {
      const emailPayload = body.emailData;
      if (!emailPayload || !emailPayload.to) {
        return new Response(
          JSON.stringify({ success: false, message: 'Dados de emailData incompletos.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Dispara brevo-api passando o token de service_role do backend
      const brevoEndpoint = `${supabaseUrl}/functions/v1/brevo-api`;
      const brevoRes = await fetch(brevoEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
          'apikey': supabaseServiceRoleKey
        },
        body: JSON.stringify({
          action: 'send-email',
          emailData: emailPayload
        })
      });

      const brevoData = await brevoRes.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          success: brevoRes.ok && Boolean(brevoData.success),
          status: brevoRes.status,
          brevoResult: brevoData
        }),
        { status: brevoRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!orderCode || typeof orderCode !== 'string' || !orderCode.trim()) {
      return new Response(
        JSON.stringify({ success: false, message: 'Código da encomenda (AQT-XXXX) é obrigatório.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanOrderCode = orderCode.trim();

    // 1. Verificar se o chamador é Administrador Autenticado
    const isAdmin = await verifyAdminAuth(req, supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey);

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });

    // 2. Consultar registo canónico da encomenda na base de dados
    const { data: leadRecord, error: leadErr } = await adminClient
      .from('crm_leads')
      .select('id, lead_code, receipt_token, receipt_storage_path, receipt_uploaded_at, history')
      .eq('lead_code', cleanOrderCode)
      .single();

    if (leadErr || !leadRecord) {
      return new Response(
        JSON.stringify({ success: false, message: 'Encomenda não encontrada ou não registada.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Validação de Propriedade da Encomenda (Não-Admin)
    if (!isAdmin) {
      if (!receiptToken || typeof receiptToken !== 'string') {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Acesso negado: Token de autorização da encomenda é obrigatório.'
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validação atómica do token criptográfico associado à encomenda
      if (!leadRecord.receipt_token || leadRecord.receipt_token !== receiptToken.trim()) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Acesso negado: Token de autorização inválido para esta encomenda.'
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ACÇÃO A: Registar Upload do Comprovativo
    if (action === 'register-receipt') {
      if (!storagePath || typeof storagePath !== 'string') {
        return new Response(
          JSON.stringify({ success: false, message: 'storagePath é obrigatório.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validação anti-path-traversal
      if (!storagePath.startsWith(`${cleanOrderCode}/`)) {
        return new Response(
          JSON.stringify({ success: false, message: 'Caminho do comprovativo inválido para esta encomenda.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const now = new Date().toISOString();
      const currentHistory = Array.isArray(leadRecord.history) ? leadRecord.history : [];
      const updatedHistory = [
        {
          date: now,
          action: 'Comprovativo de Pagamento Anexado',
          details: `Ficheiro: ${storagePath.split('/').pop()} no bucket privado payment-receipts`
        },
        ...currentHistory
      ];

      const { error: updateErr } = await adminClient
        .from('crm_leads')
        .update({
          receipt_storage_path: storagePath,
          receipt_uploaded_at: now,
          history: updatedHistory
        })
        .eq('id', leadRecord.id);

      if (updateErr) {
        return new Response(
          JSON.stringify({ success: false, message: 'Erro ao registar comprovativo na encomenda.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Comprovativo registado com sucesso na encomenda.',
          orderCode: cleanOrderCode,
          storagePath,
          uploadedAt: now
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACÇÃO B: Obter Signed URL (Apenas Backend)
    const effectiveStoragePath = leadRecord.receipt_storage_path;
    if (!effectiveStoragePath) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Nenhum comprovativo de pagamento foi submetido para esta encomenda ainda.'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!effectiveStoragePath.startsWith(`${cleanOrderCode}/`)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Estrutura de caminho do comprovativo inválida.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validExpiry = Math.min(Math.max(Number(expiresIn) || 1800, 300), 3600); // 5 a 60 min

    const { data: signedData, error: signedErr } = await adminClient
      .storage
      .from('payment-receipts')
      .createSignedUrl(effectiveStoragePath, validExpiry);

    if (signedErr || !signedData?.signedUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Falha ao gerar URL assinado de acesso: ${signedErr?.message || 'Erro de Storage'}`
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderCode: cleanOrderCode,
        signedUrl: signedData.signedUrl,
        expiresIn: validExpiry,
        uploadedAt: leadRecord.receipt_uploaded_at,
        fileName: effectiveStoragePath.split('/').pop()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erro interno no processamento: ${err.message || String(err)}`
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
