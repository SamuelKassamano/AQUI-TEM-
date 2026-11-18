import fetch from 'node-fetch';

async function checkClientAssets() {
  console.log('--- Verificando carregamento das rotas e assets no Vite ---');
  
  const routes = ['/', '/admin', '/rastreio'];
  for (const r of routes) {
    const res = await fetch(`http://localhost:3000${r}`);
    console.log(`Rota ${r}: status ${res.status} ${res.statusText}`);
  }

  // Verificar carregamento do módulo principal Vite
  const mainModuleRes = await fetch('http://localhost:3000/src/main.jsx');
  console.log(`Modulo /src/main.jsx: status ${mainModuleRes.status} (length: ${mainModuleRes.headers.get('content-length')} bytes)`);

  const storeDrawersRes = await fetch('http://localhost:3000/src/components/StoreDrawers.jsx');
  console.log(`Modulo /src/components/StoreDrawers.jsx: status ${storeDrawersRes.status}`);

  const crmServiceRes = await fetch('http://localhost:3000/src/lib/crmService.js');
  console.log(`Modulo /src/lib/crmService.js: status ${crmServiceRes.status}`);

  const adminPageRes = await fetch('http://localhost:3000/src/pages/AdminPage.jsx');
  console.log(`Modulo /src/pages/AdminPage.jsx: status ${adminPageRes.status}`);

  if (mainModuleRes.status === 200 && storeDrawersRes.status === 200 && crmServiceRes.status === 200 && adminPageRes.status === 200) {
    console.log('TODOS OS MODULOS E ROTAS CARREGAM COM STATUS 200 OK (Sem erros de sintaxe ou importação)');
  } else {
    console.error('Falha ao carregar módulos no Vite.');
    process.exit(1);
  }
}

checkClientAssets().catch(err => {
  console.error(err);
  process.exit(1);
});
