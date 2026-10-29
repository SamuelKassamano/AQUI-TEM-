-- ==============================================================================
-- AQUI TEM — ATUALIZAÇÃO FINAL DE PREÇOS (SUPABASE)
-- Fórmula aplicada: (Custo de Referência + 4.000 Kz Transporte) * 1.25 (Margem)
-- Execute este script no SQL Editor do Supabase para garantir sincronização total.
-- ==============================================================================

-- [1] Fones de Ouvido TWS Bluetooth Oraimo FreePods Lite
UPDATE public.products SET price = 28000, sale_price = 23750, old_price = 28000 WHERE id = '3a1373b1-f09f-491e-ae85-8695398ac32a';

-- [2] Smartwatch Inteligente Oraimo Watch Nova 2
UPDATE public.products SET price = 42000, sale_price = 36250, old_price = 42000 WHERE id = '250bfc74-fc6b-4c1a-867e-984b33a0ab06';

-- [3] Câmara Wi-Fi de Segurança 360°
UPDATE public.products SET price = 35000, sale_price = 30000, old_price = 35000 WHERE id = '9961e2e9-98c6-462b-8b6c-fd584f9b7a6d';

-- [4] Smart Plug Wi-Fi Tomada Inteligente 16A
UPDATE public.products SET price = 22000, sale_price = 17500, old_price = 22000 WHERE id = '6be401b8-4dc3-4564-9818-6593bc764422';

-- [5] Carregador GaN 65W Rápido
UPDATE public.products SET price = 32000, sale_price = 27500, old_price = 32000 WHERE id = '54afed87-d9a4-492c-922e-07819e34f07e';

-- [6] Power Bank 10000mAh Oraimo Toast 10
UPDATE public.products SET price = 25000, sale_price = 20000, old_price = 25000 WHERE id = '28ce7427-2e08-4ad4-a568-c9558641d5c7';

-- [7] Mini Projetor Portátil Smart LED
UPDATE public.products SET price = 55000, sale_price = 48750, old_price = 55000 WHERE id = '7c8a4192-3110-4f25-88de-8ef7a1599a01';

-- [8] Coluna Bluetooth Portátil
UPDATE public.products SET price = 30000, sale_price = 25000, old_price = 30000 WHERE id = '84f18b32-9cb4-482a-a9e3-2e78dc2361b2';

-- [9] Mini Impressora Térmica Bluetooth
UPDATE public.products SET price = 32000, sale_price = 27500, old_price = 32000 WHERE id = '91dc572e-84a1-4322-9df7-e61a2578c909';

-- [10] Mini Rastreador GPS Magnético
UPDATE public.products SET price = 28000, sale_price = 22500, old_price = 28000 WHERE id = 'a083d917-7e23-4581-be99-0e7f7b321a10';

-- [11] Auscultadores Bluetooth Oraimo BoomPop
UPDATE public.products SET price = 38000, sale_price = 32500, old_price = 38000 WHERE id = 'b1665cb5-f5fc-4ff4-8dbf-379aacc9794b';

-- [12] Carregador de Parede WiWU 45W
UPDATE public.products SET price = 25000, sale_price = 20000, old_price = 25000 WHERE id = 'f18e3d33-95bf-4bfe-90bf-87969b094e32';

-- [13] Oraimo OpenSnap Air OPN-371
UPDATE public.products SET price = 32000, sale_price = 27500, old_price = 32000 WHERE id = 'ce68593d-3752-4dff-99a3-d28b4237d6a2';

-- [14] Oraimo SpaceBuds Lite OTW-324
UPDATE public.products SET price = 28000, sale_price = 22500, old_price = 28000 WHERE id = '9f9c71ca-5614-4385-8175-5e2e303a8709';

-- [15] Oraimo Necklace Lite
UPDATE public.products SET price = 25000, sale_price = 20000, old_price = 25000 WHERE id = '8cfe6239-ef53-47d2-bd1d-8a849ab9e38d';

-- [16] X-WATCH PRISMA — Smartwatch 1.4"
UPDATE public.products SET price = 32000, sale_price = 27500, old_price = 32000 WHERE id = '46e7034d-6a7f-41de-a4d8-e883040645a4';

-- [17] X-WATCH SMARTWATCH — 1.8" Bluetooth
UPDATE public.products SET price = 30000, sale_price = 25000, old_price = 30000 WHERE id = 'd8f54944-7134-4d66-907e-4b134a091afc';
