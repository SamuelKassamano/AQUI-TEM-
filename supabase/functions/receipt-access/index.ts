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
