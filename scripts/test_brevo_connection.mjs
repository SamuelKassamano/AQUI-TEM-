// ==============================================================================
// TESTE DE CONECTIVIDADE: BREVO + SUPABASE EDGE FUNCTION
// ==============================================================================

const SUPABASE_FUNCTION_URL = 'https://essjwjbtzytefycjodgh.supabase.co/functions/v1/brevo-test-connection';
const SUPABASE_ANON_KEY = 'sb_publishable_jVht5KNDZPLBWR_NZ1lrvw_pNSyuv0B';

async function testConnection() {
  console.log('================================================================');
  console.log('TESTE DE COMUNICAÇÃO BREVO VIA SUPABASE EDGE FUNCTION');
  console.log('================================================================');
  console.log('URL da Função:', SUPABASE_FUNCTION_URL);
  console.log('Data/Hora:', new Date().toISOString());
  console.log('----------------------------------------------------------------');

  try {
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    console.log(`Status HTTP: ${response.status} ${response.statusText}`);
    const data = await response.json();

    console.log('Resposta JSON da Edge Function:');
    console.log(JSON.stringify(data, null, 2));
    console.log('----------------------------------------------------------------');

    if (data.success) {
      console.log('>> [RESULTADO: SUCESSO] A Edge Function comunicou com sucesso com a API Brevo!');
      if (data.account) {
        console.log('>> Conta Brevo Conectada:', data.account.email || data.account.companyName);
      }
    } else {
      console.log('>> [RESULTADO: PENDENTE/FALHA]');
      console.log('>> Mensagem:', data.message);
    }
  } catch (err) {
    console.error('>> [ERRO DE EXECUÇÃO]:', err.message);
  }
  console.log('================================================================\n');
}

testConnection();
