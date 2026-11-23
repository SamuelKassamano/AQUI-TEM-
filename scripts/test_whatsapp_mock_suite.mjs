import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://essjwjbtzytefycjodgh.supabase.co';
const ANON_KEY = 'sb_publishable_jVht5KNDZPLBWR_NZ1lrvw_pNSyuv0B';
const WA_ENDPOINT = `${SUPABASE_URL}/functions/v1/whatsapp-api`;

async function runMockSuite() {
  console.log('================================================================');
  console.log('SUÍTE DE TESTES: WHATSAPP MOCK & SIMULAÇÃO 100% SEGURA');
  console.log('Project Ref: essjwjbtzytefycjodgh');
  console.log('Destino Oficial: +244 950 752 933');
  console.log('Endpoint: ' + WA_ENDPOINT);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // ---------------------------------------------------------------------------
  // TESTE 1: Consulta de Estado (check-status) em Modo MOCK
  // ---------------------------------------------------------------------------
  try {
    process.stdout.write('TESTE 1: Consulta de Estado da API (Modo MOCK)... ');
    const res = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check-status' })
    });
    const data = await res.json();

    if (
      res.status === 200 &&
      data.success === true &&
      data.mode === 'mock' &&
      data.isMock === true &&
      data.destinationNumber === '+244950752933'
    ) {
      console.log('✓ PASSOU (Modo: mock | Destino: +244950752933)');
      passed++;
    } else {
      console.log('✗ FALHOU:', data);
      failed++;
    }
  } catch (err) {
    console.log('✗ ERRO:', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TESTE 2: Verificação do Webhook Meta (GET Challenge)
  // ---------------------------------------------------------------------------
  try {
    process.stdout.write('TESTE 2: Verificação Webhook Meta (GET Challenge)... ');
    const challenge = `mock_challenge_${Date.now()}`;
    const url = `${WA_ENDPOINT}?hub.mode=subscribe&hub.verify_token=aqui_tem_angola_wa_secret&hub.challenge=${challenge}`;
    const res = await fetch(url, { method: 'GET' });
    const text = await res.text();

    if (res.status === 200 && text === challenge) {
      console.log('✓ PASSOU (Desafio Meta respondido com HTTP 200 exacto)');
      passed++;
    } else {
      console.log('✗ FALHOU:', res.status, text);
      failed++;
    }
  } catch (err) {
    console.log('✗ ERRO:', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TESTE 3: Rejeição de Token Inválido no Webhook Meta (GET)
  // ---------------------------------------------------------------------------
  try {
    process.stdout.write('TESTE 3: Rejeição de Token Webhook Inválido (GET)... ');
    const url = `${WA_ENDPOINT}?hub.mode=subscribe&hub.verify_token=token_falso_errado&hub.challenge=test`;
    const res = await fetch(url, { method: 'GET' });

    if (res.status === 403) {
      console.log('✓ PASSOU (Rejeitado com 403 Forbidden)');
      passed++;
    } else {
      console.log('✗ FALHOU (Status:', res.status, ')');
      failed++;
    }
  } catch (err) {
    console.log('✗ ERRO:', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TESTE 4: Simulação de Nova Encomenda (order_created)
  // ---------------------------------------------------------------------------
  const testOrderId = `AQT-MOCK-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderDedupKey = `test-order-${testOrderId}-${Date.now()}`;

  try {
    process.stdout.write('TESTE 4: Simulação de Nova Encomenda (order_created)... ');
    const res = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'notify-company',
        eventType: 'order_created',
        orderData: {
          id: testOrderId,
          customerName: 'Cliente Fictício Teste',
          customerPhone: '+244 923 000 111',
          customerEmail: 'mock@aquitem.ao',
          province: 'Luanda',
          municipality: 'Talatona',
          address: 'Condomínio Simulador',
          total: 45000,
          subtotal: 42000,
          deliveryFee: 3000,
          paymentMethod: 'Multicaixa Express (Simulação)',
          items: [
            { name: 'Oraimo FreePods 4 (Mock Test)', quantity: 1, price: 20000 },
            { name: 'Oraimo Smartwatch Pro (Mock Test)', quantity: 1, price: 22000 }
          ],
          isSimulation: true
        },
        deduplicationKey: orderDedupKey
      })
    });
    const data = await res.json();

    if (
      res.status === 200 &&
      data.success === true &&
      data.status === 'SIMULATED' &&
      data.mode === 'mock' &&
      data.formattedMessage?.includes('[SIMULAÇÃO / MOCK — AQUI TEM ANGOLA]')
    ) {
      console.log('✓ PASSOU (Status: SIMULATED | Modo: mock | Mensagem formatada correctamente)');
      passed++;
    } else {
      console.log('✗ FALHOU:', data);
      failed++;
    }
  } catch (err) {
    console.log('✗ ERRO:', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TESTE 5: Simulação de Recibo PDF (receipt_submitted) com Bucket Privado
  // ---------------------------------------------------------------------------
  const receiptDedupKey = `test-receipt-${testOrderId}-${Date.now()}`;
  const realStoragePath = 'AQT-7816/AQT-7816-1794968098660-y37m.pdf';

  try {
    process.stdout.write('TESTE 5: Simulação de Comprovativo PDF (receipt_submitted)... ');
    const res = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'notify-company',
        eventType: 'receipt_submitted',
        orderData: {
          id: testOrderId,
          customerName: 'Cliente Fictício Recibo',
          customerPhone: '+244 923 000 111',
          total: 45000,
          receiptStoragePath: realStoragePath,
          receiptDate: new Date().toLocaleString('pt-AO'),
          isSimulation: true
        },
        deduplicationKey: receiptDedupKey
      })
    });
    const data = await res.json();

    if (
      res.status === 200 &&
      data.success === true &&
      data.status === 'SIMULATED' &&
      data.documentProcessed?.storagePath === realStoragePath &&
      data.temporarySignedUrl?.includes('token=')
    ) {
      console.log('✓ PASSOU (Status: SIMULATED | StoragePath verificado | URL assinado temporário gerado em memória)');
      passed++;
    } else {
      console.log('✗ FALHOU:', data);
      failed++;
    }
  } catch (err) {
    console.log('✗ ERRO:', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TESTE 6: Simulação de Pagamento Aprovado (payment_confirmed)
  // ---------------------------------------------------------------------------
  const paymentDedupKey = `test-payment-${testOrderId}-${Date.now()}`;

  try {
    process.stdout.write('TESTE 6: Simulação de Pagamento Aprovado (payment_confirmed)... ');
    const res = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'notify-company',
        eventType: 'payment_confirmed',
        orderData: {
          id: testOrderId,
          customerName: 'Cliente Fictício Recibo',
          customerPhone: '+244 923 000 111',
          total: 45000,
          receiptStoragePath: realStoragePath,
          trackingNumber: `AQT-MOCK-TRACK-${Date.now()}`,
          estimatedDeliveryDate: '3 dias úteis',
          isSimulation: true
        },
        deduplicationKey: paymentDedupKey
      })
    });
    const data = await res.json();

    if (
      res.status === 200 &&
      data.success === true &&
      data.status === 'SIMULATED' &&
      data.mode === 'mock'
    ) {
      console.log('✓ PASSOU (Status: SIMULATED | Dados de entrega e rastreio formatados sem alterar BD financeira)');
      passed++;
    } else {
      console.log('✗ FALHOU:', data);
      failed++;
    }
  } catch (err) {
    console.log('✗ ERRO:', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TESTE 7: Simulação de Novo Lead (lead_captured)
  // ---------------------------------------------------------------------------
  const leadDedupKey = `test-lead-${Date.now()}`;

  try {
    process.stdout.write('TESTE 7: Simulação de Novo Lead (lead_captured)... ');
    const res = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'notify-lead',
        eventType: 'lead_captured',
        leadData: {
          name: 'Lead Simulado Teste',
          phone: '+244 923 888 999',
          email: 'lead.mock@teste.ao',
          productName: 'A9 Pro Touch Screen Earphones',
          notes: 'Interessado em pronta entrega em Talatona',
          trafficSource: 'Campanha Instagram Teste',
          isSimulation: true
        },
        deduplicationKey: leadDedupKey
      })
    });
    const data = await res.json();

    if (
      res.status === 200 &&
      data.success === true &&
      data.status === 'SIMULATED' &&
      data.mode === 'mock' &&
      data.formattedMessage?.includes('Lead Simulado Teste')
    ) {
      console.log('✓ PASSOU (Status: SIMULATED | Lead formatado com markdown)');
      passed++;
    } else {
      console.log('✗ FALHOU:', data);
      failed++;
    }
  } catch (err) {
    console.log('✗ ERRO:', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TESTE 8: Deduplicação e Idempotência no Modo MOCK
  // ---------------------------------------------------------------------------
  try {
    process.stdout.write('TESTE 8: Idempotência e Deduplicação... ');
    const res = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'notify-company',
        eventType: 'order_created',
        orderData: { id: testOrderId },
        deduplicationKey: orderDedupKey
      })
    });
    const data = await res.json();

    if (res.status === 200 && data.duplicate === true && data.status === 'SIMULATED') {
      console.log('✓ PASSOU (Detectou duplicado com status SIMULATED sem duplicar envio)');
      passed++;
    } else {
      console.log('✗ FALHOU:', data);
      failed++;
    }
  } catch (err) {
    console.log('✗ ERRO:', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TESTE 9: Listagem de Logs (list-logs) & Signed URL sob Procura (get-receipt-url)
  // ---------------------------------------------------------------------------
  try {
    process.stdout.write('TESTE 9: Listagem de Logs & Signed URL sob procura... ');
    const logsRes = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list-logs', limit: 10, page: 1 })
    });
    const logsData = await logsRes.json();

    const signRes = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get-receipt-url', storagePath: realStoragePath })
    });
    const signData = await signRes.json();

    if (
      logsRes.status === 200 &&
      Array.isArray(logsData.logs) &&
      logsData.logs.length > 0 &&
      signRes.status === 200 &&
      signData.signedUrl?.includes('token=')
    ) {
      console.log(`✓ PASSOU (${logsData.logs.length} logs recuperados | Signed URL gerado sob demanda: expira em ${signData.expiresIn}s)`);
      passed++;
    } else {
      console.log('✗ FALHOU:', logsData, signData);
      failed++;
    }
  } catch (err) {
    console.log('✗ ERRO:', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TESTE 10: Auditoria Estrita do Banco de Dados (Não vazamento de Signed URLs)
  // ---------------------------------------------------------------------------
  try {
    process.stdout.write('TESTE 10: Auditoria de Segurança: Nenhum Signed URL integral gravado... ');
    const logsRes = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list-logs', limit: 20 })
    });
    const logsData = await logsRes.json();

    const hasLeakedSignedUrl = logsData.logs?.some(l => 
      l.document_storage_path?.includes('token=') || 
      l.document_storage_path?.includes('http')
    );

    const hasInvalidStatus = logsData.logs?.some(l => 
      l.dispatch_mode === 'mock' && (l.status === 'SENT' || l.status === 'DELIVERED' || l.status === 'READ')
    );

    if (!hasLeakedSignedUrl && !hasInvalidStatus) {
      console.log('✓ PASSOU (Armazenado apenas caminho relativo | Status SIMULATED estritamente isolado de SENT/DELIVERED)');
      passed++;
    } else {
      console.log('✗ FALHOU: hasLeakedSignedUrl:', hasLeakedSignedUrl, 'hasInvalidStatus:', hasInvalidStatus);
      failed++;
    }
  } catch (err) {
    console.log('✗ ERRO:', err.message);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`RESULTADO FINAL DA SUÍTE MOCK: ${passed} PASSARAM, ${failed} FALHARAM`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runMockSuite();
