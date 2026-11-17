import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cabeçalhos CORS padrão para permitir requisições e preflight seguros
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // 1. Resposta ao preflight CORS (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 2. Leitura segura do corpo do pedido (Tratamento robusto contra SyntaxError)
  // O teste de conexão não exige corpo. Caso venha vazio ou sem corpo,
  // nunca invocamos req.json() directamente, evitando 'Unexpected end of JSON input'.
  let _requestPayload: Record<string, unknown> | null = null;
  try {
    const rawBody = await req.text();
    if (rawBody && rawBody.trim().length > 0) {
      _requestPayload = JSON.parse(rawBody);
    }
  } catch (_parseErr) {
    // Se o corpo não for JSON válido, ignora com segurança sem interromper o fluxo
    _requestPayload = null;
  }

  try {
    // 3. Validação do Cabeçalho de Autorização (Bearer JWT)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({
          success: false,
          category: 'authentication',
          message: 'Acesso não autorizado: Cabeçalho de autorização (Bearer JWT) em falta ou inválido.'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 4. Verificação de Variáveis de Ambiente do Supabase (Apenas Servidor)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({
          success: false,
          category: 'configuration',
          message: 'Erro interno de configuração: Variáveis do Supabase não encontradas no servidor.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 5. Validação da Sessão do Utilizador (Supabase Auth)
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      },
      auth: {
        persistSession: false
      }
    });

    const {
      data: { user },
      error: userAuthError
    } = await supabaseUserClient.auth.getUser();

    if (userAuthError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          category: 'authentication',
          message: 'Acesso não autorizado: Sessão do utilizador inválida ou expirada.'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 6. Autorização Administrativa Segura (FAIL-CLOSED)
    // Validação estrita e exclusiva contra a tabela public.admin_users
    // Nunca concede acesso por email em hardcode, tabela vazia ou papel 'authenticated' genérico
    if (!supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({
          success: false,
          category: 'authorization',
          message: 'Acesso restrito: Chave de verificação administrativa não configurada no servidor.'
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });

    const { data: adminRecord, error: adminQueryError } = await adminClient
      .from('admin_users')
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle();

    // Se houver erro de consulta, registo não encontrado ou role inválida -> FAIL CLOSED (403)
    const allowedRoles = ['admin', 'super_admin', 'manager'];
    const isUserAdmin = !adminQueryError && adminRecord && allowedRoles.includes(adminRecord.role);

    if (!isUserAdmin) {
      return new Response(
        JSON.stringify({
          success: false,
          category: 'authorization',
          message: 'Acesso restrito: O utilizador não possui privilégios de administrador registados.'
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 7. Obtenção Segura de BREVO_API_KEY a partir dos Segredos do Supabase
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');

    if (!brevoApiKey || brevoApiKey.trim() === '') {
      return new Response(
        JSON.stringify({
          success: false,
          category: 'configuration',
          message: 'A chave BREVO_API_KEY não se encontra configurada nos Segredos do Supabase.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 8. Comunicação com a API Oficial do Brevo (Exclusiva no Servidor)
    // GET https://api.brevo.com/v3/account com cabeçalho api-key
    const brevoResponse = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey.trim()
      }
    });

    // 9. Tratamento de Erros da API do Brevo (Sem Exposição de Chaves ou Detalhes Internos)
    if (!brevoResponse.ok) {
      let clientMessage = 'Falha na comunicação com a API do Brevo.';

      if (brevoResponse.status === 401 || brevoResponse.status === 403) {
        clientMessage = 'Chave da API do Brevo inválida ou sem permissões necessárias.';
      } else if (brevoResponse.status === 429) {
        clientMessage = 'Limite de pedidos da API do Brevo temporariamente atingido.';
      } else if (brevoResponse.status >= 500) {
        clientMessage = 'O serviço da API do Brevo encontra-se temporariamente indisponível.';
      }

      return new Response(
        JSON.stringify({
          success: false,
          category: 'brevo_communication',
          statusCode: brevoResponse.status,
          message: clientMessage
        }),
        {
          status: brevoResponse.status >= 500 ? 502 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 10. Resposta Bem-Sucedida: Leitura Segura e Filtragem de Dados Não Sensíveis
    let accountData: Record<string, any> = {};
    try {
      const responseText = await brevoResponse.text();
      if (responseText && responseText.trim().length > 0) {
        accountData = JSON.parse(responseText);
      }
    } catch (_jsonErr) {
      accountData = {};
    }

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
        category: 'success',
        message: 'Ligação à API do Brevo estabelecida com sucesso.',
        account: safeAccountInfo
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (_error) {
    // 11. Tratamento Global de Excepções sem Fuga de Informação
    return new Response(
      JSON.stringify({
        success: false,
        category: 'internal_error',
        message: 'Ocorreu um erro interno ao processar a validação da ligação.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
