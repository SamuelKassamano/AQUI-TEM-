-- ==============================================================================
-- AQUI TEM — ATUALIZAÇÃO OFICIAL DOS PRODUTOS NOVOS NO SUPABASE
-- Execute este script no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/essjwjbtzytefycjodgh/sql
-- ==============================================================================

-- 1. GARANTIR COLUNAS DE SEO NA TABELA public.products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS seo_title TEXT;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- 2. ATUALIZAR PREÇOS REAIS E SEO DOS 13 PRODUTOS NOVOS
-- Fórmula aplicada: Custo de Referência (em Kz) + 4.000 Kz (Transporte) + Margem (20% a 25%)

-- [1] Tomada Inteligente Wi-Fi Smart Plug
UPDATE public.products SET
  price = 14500,
  sale_price = 12750,
  seo_title = 'Tomada Inteligente Wi-Fi Smart Plug com Botão de Controlo | AQUI TEM ANGOLA',
  seo_description = 'Transforme eletrodomésticos em aparelhos inteligentes com a Tomada Wi-Fi Smart Plug na AQUI TEM Angola. Controlo por app e voz, temporizador e entrega rápida em Luanda.'
WHERE id = '6be401b8-4dc3-4564-9818-6593bc764422';

-- [2] Carregador Rápido de Parede BMX 70W com Visor LCD
UPDATE public.products SET
  price = 28000,
  sale_price = 25250,
  seo_title = 'Carregador Rápido de Parede BMX 70W GaN com Visor LCD | AQUI TEM ANGOLA',
  seo_description = 'Compre o Carregador Rápido BMX 70W com visor digital LCD em Angola na AQUI TEM. Carregamento ultra rápido para smartphones e portáteis com entrega em Luanda.'
WHERE id = '54afed87-d9a4-492c-922e-07819e34f07e';

-- [3] Bateria Externa Power Bank Oraimo 10000mAh
UPDATE public.products SET
  price = 20000,
  sale_price = 17750,
  seo_title = 'Bateria Externa Power Bank Oraimo 10000mAh Original | AQUI TEM ANGOLA',
  seo_description = 'Power Bank Oraimo 10000mAh original com carregamento rápido e dupla saída USB na AQUI TEM Angola. Garantia oficial e entrega ao domicílio em Luanda e províncias.'
WHERE id = '28ce7427-2e08-4ad4-a568-c9558641d5c7';

-- [4] Fones de Ouvido TWS Oraimo
UPDATE public.products SET
  price = 20000,
  sale_price = 17750,
  seo_title = 'Fones de Ouvido Sem Fio TWS Oraimo FreePods com Bluetooth | AQUI TEM ANGOLA',
  seo_description = 'Fones sem fio TWS Oraimo originais com som potente, graves HavyBass e cancelamento de ruído em chamadas na AQUI TEM Angola. Compre com entrega rápida em Luanda.'
WHERE id = '3a1373b1-f09f-491e-ae85-8695398ac32a';

-- [5] Carregador de Parede WiWU Fast Charger 45W
UPDATE public.products SET
  price = 23000,
  sale_price = 20125,
  seo_title = 'Carregador de Parede WiWU Fast Charger 45W GaN Dual Port | AQUI TEM ANGOLA',
  seo_description = 'Carregador rápido WiWU 45W com portas USB-C e USB-A na AQUI TEM Angola. Potência ideal para iPhone, Samsung e tablets com entrega rápida em Luanda.'
WHERE id = 'f18e3d33-95bf-4bfe-90bf-87969b094e32';

-- [6] Auscultadores Bluetooth (Oraimo BoomPop)
UPDATE public.products SET
  price = 44000,
  sale_price = 38500,
  seo_title = 'Auscultadores Bluetooth Oraimo BoomPop com Graves Potentes | AQUI TEM ANGOLA',
  seo_description = 'Auscultadores Bluetooth Oraimo BoomPop over-ear com cancelamento de ruído e até 40h de música na AQUI TEM Angola. Garantia oficial e entrega em Luanda.'
WHERE id = 'b1665cb5-f5fc-4ff4-8dbf-379aacc9794b';

-- [7] Câmera de Segurança Wi-Fi Defender IP8MCB1 Pro
UPDATE public.products SET
  price = 92000,
  sale_price = 81160,
  seo_title = 'Câmera de Segurança Wi-Fi Defender IP8MCB1 Pro 4K AI | AQUI TEM ANGOLA',
  seo_description = 'Proteja a sua casa ou empresa com a Câmera de Segurança Wi-Fi Defender IP8MCB1 Pro 4K na AQUI TEM Angola. Visão noturna, alertas no telemóvel e entrega em Luanda.'
WHERE id = '9961e2e9-98c6-462b-8b6c-fd584f9b7a6d';

-- [8] Oraimo SpaceBuds Lite OTW-324
UPDATE public.products SET
  price = 20000,
  sale_price = 17750,
  seo_title = 'Fones Bluetooth Oraimo SpaceBuds Lite OTW-324 | AQUI TEM ANGOLA',
  seo_description = 'Oraimo SpaceBuds Lite OTW-324 com design moderno, graves envolventes e bateria de longa duração na AQUI TEM Angola. 100% original com garantia e entrega rápida.'
WHERE id = '9f9c71ca-5614-4385-8175-5e2e303a8709';

-- [9] Oraimo OpenSnap Air OPN-371
UPDATE public.products SET
  price = 29500,
  sale_price = 25875,
  seo_title = 'Fones de Ouvido Abertos Oraimo OpenSnap Air OPN-371 | AQUI TEM ANGOLA',
  seo_description = 'Fones de ouvido abertos Oraimo OpenSnap Air OPN-371 com som panorâmico e máximo conforto na AQUI TEM Angola. Ideal para desporto e dia a dia em Luanda.'
WHERE id = 'ce68593d-3752-4dff-99a3-d28b4237d6a2';

-- [10] Oraimo Necklace Lite
UPDATE public.products SET
  price = 22000,
  sale_price = 19000,
  seo_title = 'Auscultadores de Pescoço Oraimo Necklace Lite OEB-E311 | AQUI TEM ANGOLA',
  seo_description = 'Oraimo Necklace Lite OEB-E311 com autonomia até 30 horas, vibração de chamadas e graves profundos na AQUI TEM Angola. Compre com entrega rápida em Luanda.'
WHERE id = '8cfe6239-ef53-47d2-bd1d-8a849ab9e38d';

-- [11] X-WATCH PRISMA — Smartwatch 1.4"
UPDATE public.products SET
  price = 26500,
  sale_price = 22750,
  seo_title = 'Smartwatch X-Watch Prisma Tela Curva com Chamadas Bluetooth | AQUI TEM ANGOLA',
  seo_description = 'Relógio inteligente X-Watch Prisma com ecrã de alta definição, monitor de saúde e chamadas Bluetooth na AQUI TEM Angola. Compre online com entrega em Luanda.'
WHERE id = '46e7034d-6a7f-41de-a4d8-e883040645a4';

-- [12] X-WATCH SMARTWATCH — 1.8" Bluetooth
UPDATE public.products SET
  price = 24500,
  sale_price = 20875,
  seo_title = 'Smartwatch X-Watch 1.8" com Chamadas Bluetooth e Notificações | AQUI TEM ANGOLA',
  seo_description = 'Smartwatch X-Watch 1.8 polegadas com Bluetooth 5.3, faz e recebe chamadas e monitoriza atividades na AQUI TEM Angola. Entrega rápida em Luanda e províncias.'
WHERE id = 'd8f54944-7134-4d66-907e-4b134a091afc';

-- [13] WATCH NOVA 2 — Smartwatch Inteligente Oraimo
UPDATE public.products SET
  price = 33500,
  sale_price = 28875,
  seo_title = 'Smartwatch Oraimo Watch Nova 2 OSW-814 com Tela AMOLED 2.01" | AQUI TEM ANGOLA',
  seo_description = 'Compre o smartwatch Oraimo Watch Nova 2 OSW-814 com tela AMOLED curva de 2.01 polegadas, chamadas Bluetooth e proteção IP68 na AQUI TEM Angola. Entrega rápida em Luanda.'
WHERE id = '250bfc74-fc6b-4c1a-867e-984b33a0ab06';
