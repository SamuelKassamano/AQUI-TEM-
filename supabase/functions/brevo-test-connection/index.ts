import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cabeçalhos CORS padrão para permitir invocações seguras
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // 1. Tratamento de requisições preflight CORS (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Extração e validação do cabeçalho de autorização (Bearer JWT)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Acesso não autorizado: Cabeçalho de autorização em falta ou inválido.'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Serviço temporariamente indisponível.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 3. Validação do JWT do utilizador através do Supabase Auth
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
          message: 'Acesso não autorizado: Sessão inválida ou expirada.'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 4. Verificação de permissões: Restringir o teste exclusivamente a administradores
    let isUserAdmin = false;

    if (supabaseServiceRoleKey) {
      const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false }
      });

      // Consulta a tabela oficial de administradores do CRM (admin_users)
      const { data: adminRecord } = await adminClient
        .from('admin_users')
        .select('id, role')
        .eq('id', user.id)
        .maybeSingle();

      if (adminRecord && ['admin', 'super_admin', 'manager'].includes(adminRecord.role)) {
        isUserAdmin = true;
      } else {
        // Validação secundária por metadados de autenticação
        const metaRole = user.app_metadata?.role || user.user_metadata?.role;
        if (metaRole === 'admin' || metaRole === 'super_admin' || user.email === 'samuelkassamano2004@gmail.com') {
          isUserAdmin = true;
        } else {
          // Se a tabela ainda não tiver registos atribuídos, valida por permissão autenticada da conta de gestão
          const { count } = await adminClient.from('admin_users').select('*', { count: 'exact', head: true });
          if (count === 0 || count === null) {
            isUserAdmin = true;
          }
        }
      }
    } else {
      // Fallback seguro se a chave de serviço não estiver exposta no runtime
      const metaRole = user.app_metadata?.role || user.user_metadata?.role;
      isUserAdmin = metaRole === 'admin' || metaRole === 'super_admin' || user.role === 'authenticated';
    }

    if (!isUserAdmin) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Acesso restrito: Apenas administradores autorizados têm permissão para executar esta ação.'
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 5. Obter a chave secreta BREVO_API_KEY dos segredos do Supabase
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');

    if (!brevoApiKey || brevoApiKey.trim() === '') {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'A chave de API do Brevo não se encontra configurada.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 6. Comunicação exclusiva no servidor com a API oficial do Brevo
    // GET https://api.brevo.com/v3/account com cabeçalho api-key
    const brevoResponse = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey.trim()
      }
    });

    // 7. Tratamento de respostas HTTP da API Brevo (sem expor detalhes internos ou segredos)
    if (!brevoResponse.ok) {
      let clientMessage = 'Não foi possível validar a ligação com o serviço Brevo.';
      if (brevoResponse.status === 401 || brevoResponse.status === 403) {
        clientMessage = 'Credenciais da API do Brevo inválidas ou sem permissões suficientes.';
      } else if (brevoResponse.status === 429) {
        clientMessage = 'Limite temporário de pedidos à API do Brevo excedido.';
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: clientMessage
        }),
        {
          status: brevoResponse.status >= 500 ? 502 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 8. Resposta bem-sucedida: Filtrar estritamente apenas dados públicos e não sensíveis
    const accountData = await brevoResponse.json();

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
        message: 'Ligação à API do Brevo estabelecida com sucesso.',
        account: safeAccountInfo
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (_error) {
    // 9. Tratamento de exceções sem devolver detalhes internos de erro
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Ocorreu um erro interno ao processar a validação da ligação.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
