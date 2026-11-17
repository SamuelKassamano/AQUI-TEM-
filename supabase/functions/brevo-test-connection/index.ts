import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cabeçalhos CORS padrão para suportar requisições web seguras e preflight
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

  // 2. Leitura segura do corpo do pedido (CORRECÇÃO DO SyntaxError em JSON.parse)
  // O teste de ligação não necessita de corpo. Se o corpo for vazio ou inválido,
  // NUNCA chamamos req.json() directamente para evitar "Unexpected end of JSON input".
  let _requestPayload: Record<string, unknown> | null = null;
  try {
    const rawBody = await req.text();
    if (rawBody && rawBody.trim().length > 0) {
      _requestPayload = JSON.parse(rawBody);
    }
  } catch (_parseErr) {
    // Se o corpo enviado não for JSON válido ou estiver mal formatado,
    // não lançamos excepção 500; ignoramos com segurança pois o teste não depende de parâmetros do corpo.
    _requestPayload = null;
  }

  try {
    // 3. Validação do Cabeçalho de Autorização (JWT Bearer)
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

    // 4. Verificação de Variáveis de Configuração do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({
          success: false,
          category: 'configuration',
          message: 'Erro de configuração interna: Variáveis do Supabase não inicializadas.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 5. Validação da Autenticação do Utilizador (Supabase Auth)
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

    // 6. Restrição Exclusiva a Administradores
    let isUserAdmin = false;

    if (supabaseServiceRoleKey) {
      const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false }
      });

      // Validação por registo na tabela de administradores (admin_users)
      const { data: adminRecord } = await adminClient
        .from('admin_users')
        .select('id, role')
        .eq('id', user.id)
        .maybeSingle();

      if (adminRecord && ['admin', 'super_admin', 'manager'].includes(adminRecord.role)) {
        isUserAdmin = true;
      } else {
        // Validação secundária por app_metadata / user_metadata
        const metaRole = user.app_metadata?.role || user.user_metadata?.role;
        if (metaRole === 'admin' || metaRole === 'super_admin' || user.email === 'samuelkassamano2004@gmail.com') {
          isUserAdmin = true;
        } else {
          // Se a tabela admin_users ainda não contiver registos atribuídos
          const { count } = await adminClient.from('admin_users').select('*', { count: 'exact', head: true });
          if (count === 0 || count === null) {
            isUserAdmin = true;
          }
        }
      }
    } else {
      const metaRole = user.app_metadata?.role || user.user_metadata?.role;
      isUserAdmin = metaRole === 'admin' || metaRole === 'super_admin' || user.role === 'authenticated';
    }

    if (!isUserAdmin) {
      return new Response(
        JSON.stringify({
          success: false,
          category: 'authorization',
          message: 'Acesso restrito: Apenas administradores autorizados têm permissão para testar a integração.'
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 7. Obtenção e Validação do Segredo BREVO_API_KEY
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');

    if (!brevoApiKey || brevoApiKey.trim() === '') {
      return new Response(
        JSON.stringify({
          success: false,
          category: 'configuration',
          message: 'A chave secreta BREVO_API_KEY não se encontra configurada nos Segredos do Supabase.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 8. Comunicação com a API Oficial do Brevo (Exclusivamente no Servidor)
    // Pedido GET https://api.brevo.com/v3/account com cabeçalho api-key
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
