// ==============================================================================
// TESTE DE CONECTIVIDADE: BREVO + SUPABASE EDGE FUNCTION (COM VALIDAÇÃO JWT)
// ==============================================================================

const SUPABASE_FUNCTION_URL = 'https://essjwjbtzytefycjodgh.supabase.co/functions/v1/brevo-test-connection';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_jVht5KNDZPLBWR_NZ1lrvw_pNSyuv0B';
const ADMIN_JWT = process.env.ADMIN_JWT || process.env.SUPABASE_AUTH_TOKEN;

async function testConnection() {
  console.log('================================================================');
  console.log('TESTE DE COMUNICAÇÃO BREVO VIA SUPABASE EDGE FUNCTION');
  console.log('================================================================');
  console.log('URL da Função:', SUPABASE_FUNCTION_URL);
  console.log('Validação JWT Ativa:', true);
  console.log('Token de Administrador Fornecido:', ADMIN_JWT ? 'SIM (Bearer JWT)' : 'NÃO (A testar bloqueio de segurança com Anon Key)');
  console.log('Data/Hora:', new Date().toISOString());
  console.log('----------------------------------------------------------------');

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${ADMIN_JWT || SUPABASE_ANON_KEY}`
  };

  try {
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers
    });

    console.log(`Status HTTP: ${response.status} ${response.statusText}`);
    const data = await response.json();

    console.log('Resposta JSON da Edge Function:');
    console.log(JSON.stringify(data, null, 2));
    console.log('----------------------------------------------------------------');

    if (data.success) {
      console.log('>> [RESULTADO: SUCESSO] A Edge Function validou o JWT de administrador e comunicou com o Brevo!');
      if (data.account) {
        console.log('>> Conta Brevo Identificada:', data.account.email || data.account.companyName);
      }
    } else {
      console.log('>> [RESULTADO:', response.status === 401 || response.status === 403 ? 'PROTEÇÃO DE ACESSO ATIVA' : 'RESPOSTA DE ERRO', ']');
      console.log('>> Mensagem:', data.message);
    }
  } catch (err) {
    console.error('>> [ERRO DE REDE/EXECUÇÃO]:', err.message);
  }
  console.log('================================================================\n');
}

testConnection();
