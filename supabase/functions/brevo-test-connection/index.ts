import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Cabeçalhos CORS padrão para permitir chamadas seguras
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // 1. Tratamento de requisições de preflight CORS (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Proteção contra acessos não autorizados
    // Exige que a chamada inclua o cabeçalho de autenticação do Supabase (apikey ou Bearer token)
    const authHeader = req.headers.get('Authorization') || req.headers.get('apikey');
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Acesso não autorizado: Cabeçalho de autorização em falta.'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 3. Obter a chave secreta BREVO_API_KEY configurada nas variáveis de ambiente do Supabase
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');

    if (!brevoApiKey || brevoApiKey.trim() === '') {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'A variável secreta BREVO_API_KEY não está configurada no Supabase Edge Runtime.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 4. Comunicação exclusiva no servidor com a API oficial do Brevo
    // GET https://api.brevo.com/v3/account com cabeçalho api-key
    const brevoResponse = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey.trim()
      }
    });

    // 5. Tratamento de erros HTTP da API do Brevo
    if (!brevoResponse.ok) {
      let errorDetail = 'Erro desconhecido da API Brevo';
      try {
        const errorJson = await brevoResponse.json();
        errorDetail = errorJson.message || errorJson.code || `HTTP ${brevoResponse.status}`;
      } catch {
        errorDetail = `HTTP ${brevoResponse.status} ${brevoResponse.statusText}`;
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: `Falha na comunicação com o Brevo: ${errorDetail}`,
          status: brevoResponse.status
        }),
        {
          status: brevoResponse.status >= 500 ? 502 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 6. Resposta bem-sucedida da API do Brevo
    const accountData = await brevoResponse.json();

    // 7. Filtragem estrita: Devolver apenas informações não sensíveis da conta
    // Nunca incluir chaves, segredos ou tokens
    const safeAccountInfo = {
      email: accountData.email || null,
      firstName: accountData.firstName || null,
      lastName: accountData.lastName || null,
      companyName: accountData.companyName || null,
      plan: Array.isArray(accountData.plan)
        ? accountData.plan.map((p: any) => ({
            type: p.type,
            creditsType: p.creditsType,
            credits: p.credits
          }))
        : []
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ligação à API do Brevo estabelecida com sucesso!',
        account: safeAccountInfo
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    // 8. Tratamento de exceções e erros de rede (sem expor segredos)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Erro interno ou falha de rede ao contactar a API do Brevo.',
        error: error?.message || 'Exceção não tratada'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
