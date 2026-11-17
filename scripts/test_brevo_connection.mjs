// ==============================================================================
// TESTE DE CONECTIVIDADE: BREVO + SUPABASE EDGE FUNCTION (COM JWT & ADMIN ROLE)
// ==============================================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://essjwjbtzytefycjodgh.supabase.co';
const SUPABASE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/brevo-test-connection`;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_jVht5KNDZPLBWR_NZ1lrvw_pNSyuv0B';

async function testConnection() {
  console.log('================================================================');
  console.log('TESTE DE COMUNICAÇÃO BREVO VIA SUPABASE EDGE FUNCTION');
  console.log('================================================================');
  console.log('URL da Função:', SUPABASE_FUNCTION_URL);
  console.log('Validação Nativa de JWT Supabase: ATIVA (verify_jwt = true)');
  console.log('Restrição de Acesso: EXCLUSIVO A ADMINISTRADORES');
  console.log('Data/Hora:', new Date().toISOString());
  console.log('----------------------------------------------------------------');

  let adminJwt = process.env.ADMIN_JWT || process.env.SUPABASE_AUTH_TOKEN;

  // Se foram fornecidas credenciais de administrador (ADMIN_EMAIL e ADMIN_PASSWORD), autenticar via Supabase Auth
  if (!adminJwt && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    console.log(`A autenticar utilizador ${process.env.ADMIN_EMAIL} no Supabase Auth...`);
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    });

    if (authError || !authData?.session?.access_token) {
      console.error('>> [FALHA DE AUTENTICAÇÃO SUPABASE]:', authError?.message || 'Não foi possível obter sessão');
      return;
    }

    console.log('>> Autenticação bem-sucedida! Sessão de administrador obtida.');
    adminJwt = authData.session.access_token;
  }

  const tokenToUse = adminJwt || SUPABASE_ANON_KEY;
  const isRealJwt = Boolean(adminJwt);

  console.log('Token em uso no cabeçalho Authorization:', isRealJwt ? 'JWT de Administrador Autenticado' : 'Chave Pública Anon (Simulação de Acesso Não-Admin)');
  console.log('----------------------------------------------------------------');

  try {
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${tokenToUse}`
      }
    });

    console.log(`Status HTTP: ${response.status} ${response.statusText}`);
    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw: rawText };
    }

    console.log('Resposta da Edge Function:');
    console.log(JSON.stringify(data, null, 2));
    console.log('----------------------------------------------------------------');

    if (response.status === 200 && data.success) {
      console.log('>> [RESULTADO: SUCESSO COMPLETO]');
      console.log('>> 1. JWT validado pelo Supabase Gateway e pela Edge Function.');
      console.log('>> 2. Permissão de administrador confirmada.');
      console.log('>> 3. Comunicação com a API oficial do Brevo efetuada com sucesso!');
      if (data.account) {
        console.log('>> 4. Conta Brevo conectada:', data.account.email || data.account.companyName);
      }
    } else if (response.status === 401) {
      console.log('>> [BLOQUEIO DE SEGURANÇA CORRETO: HTTP 401]');
      console.log('>> A verificação JWT do Supabase está ativa e rejeitou o acesso sem JWT válido.');
    } else if (response.status === 403) {
      console.log('>> [BLOQUEIO DE SEGURANÇA CORRETO: HTTP 403]');
      console.log('>> O utilizador autenticado não possui papel de administrador.');
    } else {
      console.log('>> [RESPOSTA DA EDGE FUNCTION]:', data.message || data.raw);
    }
  } catch (err) {
    console.error('>> [ERRO DE REDE/EXECUÇÃO]:', err.message);
  }
  console.log('================================================================\n');
}

testConnection();
