-- ==============================================================================
-- AQUI TEM ANGOLA — SCRIPT DE ATUALIZAÇÃO MASSIVA DE PREÇOS E PRODUTOS
-- FÓRMULA: (CUSTO + 4000) * 1.25
-- TOTAL DE PRODUTOS: 28 (17 ANTIGOS + 11 NOVOS)
-- ==============================================================================

-- 1. Garante que a tabela existe com as colunas necessárias
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT,
  brand TEXT,
  category TEXT,
  description TEXT,
  price NUMERIC(14, 2),
  sale_price NUMERIC(14, 2),
  old_price NUMERIC(14, 2),
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  rating NUMERIC(3, 2) DEFAULT 4.9,
  reviews_count INTEGER DEFAULT 0,
  badge TEXT,
  specs JSONB DEFAULT '[]'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Função para UPSERT (Insere se não existir, atualiza se existir via SLUG)
-- Nota: Usamos o SLUG como chave de identificação única para sincronização segura.

INSERT INTO public.products (id, name, slug, sku, brand, category, price, sale_price, old_price, stock, image_url, badge, rating, reviews_count)
VALUES
-- [1] Fones TWS Oraimo FreePods Lite
('3a1373b1-f09f-491e-ae85-8695398ac32a', 'Fones de Ouvido TWS Bluetooth Oraimo FreePods Lite', 'fones-tws-bluetooth', 'AT-TWS-001', 'Oraimo', 'Áudio & Som', 28000, 23750, 28000, 20, '/products/fones-tws-bluetooth.jpg', 'MAIS VENDIDO', 4.9, 87),
-- [2] Smartwatch Oraimo Nova 2
('250bfc74-fc6b-4c1a-867e-984b33a0ab06', 'Smartwatch Inteligente com Ecrã AMOLED Curvo Oraimo Watch Nova 2', 'smartwatch', 'AT-SW-002', 'Oraimo', 'Smartwatches', 42000, 36250, 42000, 15, '/products/smartwatch.jpg', 'OFERTA', 4.8, 64),
-- [3] Câmara Wi-Fi 360
('9961e2e9-98c6-462b-8b6c-fd584f9b7a6d', 'Câmara Wi-Fi de Segurança 360° Inteligente Full HD Visão Noturna', 'camera-wifi-seguranca', 'AT-CAM-003', 'Defender / Tuya Smart', 'Acessórios & Casa', 35000, 30000, 35000, 12, '/products/camera-wifi-seguranca.jpg', 'SEGURANÇA', 4.7, 42),
-- [4] Smart Plug Wi-Fi
('6be401b8-4dc3-4564-9818-6593bc764422', 'Smart Plug Wi-Fi Tomada Inteligente 16A com Controlo Remoto', 'smart-plug-wifi', 'AT-SP-004', 'Tuya / Smart Life', 'Acessórios & Casa', 22000, 17500, 22000, 25, '/products/smart-plug-wifi.jpg', 'ECONOMIA', 4.6, 18),
-- [5] Carregador GaN 65W
('54afed87-d9a4-492c-922e-07819e34f07e', 'Carregador GaN 65W Rápido Multiportas USB-C e USB-A com Visor Digital', 'carregador-gan', 'AT-GAN-005', 'BMX / GaN Tech', 'Acessórios & Tech', 32000, 27500, 32000, 18, '/products/carregador-gan.jpg', 'ULTRA RÁPIDO', 4.9, 53),
-- [6] Power Bank Oraimo 10000mAh
('28ce7427-2e08-4ad4-a568-c9558641d5c7', 'Power Bank 10000mAh Bateria Externa Portátil Oraimo Toast 10', 'power-bank', 'AT-PB-006', 'Oraimo', 'Energia', 25000, 20000, 25000, 24, '/products/power-bank.jpg', 'INDISPENSÁVEL', 4.8, 120),
-- [7] Mini Projetor Smart LED
('7c8a4192-3110-4f25-88de-8ef7a1599a01', 'Mini Projetor Portátil Smart LED HD 1080p Android Wi-Fi', 'mini-projetor', 'AT-MP-007', 'Magcubic / Smart Cinema', 'TV & Vídeo', 55000, 48750, 55000, 10, '/products/mini-projetor.jpg', 'CINEMA EM CASA', 4.9, 95),
-- [8] Coluna Bluetooth HavyBass
('84f18b32-9cb4-482a-a9e3-2e78dc2361b2', 'Coluna Bluetooth Portátil com Graves HavyBass e Bateria de Longa Duração', 'coluna-bluetooth', 'AT-CB-008', 'Oraimo / SoundPro', 'Áudio & Som', 30000, 25000, 30000, 16, '/products/coluna-bluetooth.jpg', 'SOM POTENTE', 4.7, 31),
-- [9] Mini Impressora Térmica
('91dc572e-84a1-4322-9df7-e61a2578c909', 'Mini Impressora Térmica Portátil Bluetooth 58mm Sem Tinta para Telemóvel', 'mini-impressora-termica', 'AT-PRN-009', 'PeriPage / Phomemo', 'Acessórios & Tech', 32000, 27500, 32000, 14, '/products/mini-impressora-termica.jpg', 'ZERO TINTA', 4.5, 14),
-- [10] Rastreador GPS Magnético
('a083d917-7e23-4581-be99-0e7f7b321a10', 'Mini Rastreador GPS Magnético em Tempo Real com Botão SOS e Escuta', 'rastreador-gps', 'AT-GPS-010', 'Smart Tracker / GF-07', 'Acessórios & Tech', 28000, 22500, 28000, 22, '/products/rastreador-gps.jpg', 'PROTEÇÃO TOTAL', 4.8, 26),
-- [11] Oraimo BoomPop
('b1665cb5-f5fc-4ff4-8dbf-379aacc9794b', 'Auscultadores Bluetooth Oraimo BoomPop', 'auscultadores-bluetooth', 'BOOM-BLK', 'Oraimo', 'Áudio & Som', 38000, 32500, 38000, 10, '/product_boompop.jpg', 'BASS BOOST', 4.7, 110),
-- [12] WiWU 45W Charger
('f18e3d33-95bf-4bfe-90bf-87969b094e32', 'Carregador de Parede WiWU Fast Charger 45W', 'carregador-de-parede-wiwu-fast-charger-45w', 'WIWU-CH-45W-BLK', 'WIWU', 'Acessórios & Tech', 25000, 20000, 25000, 15, '/products/carregador-gan.jpg', 'DUAL PORT', 4.6, 22),
-- [13] SpaceBuds Lite
('9f9c71ca-5614-4385-8175-5e2e303a8709', 'Oraimo SpaceBuds Lite OTW-324', 'oraimo-spacebuds-lite-otw-324', 'OTW324-BLK', 'Oraimo', 'Áudio & Som', 28000, 22500, 28000, 12, '/products/fones-tws-bluetooth.jpg', 'FUTURISTA', 4.8, 45),
-- [14] OpenSnap Air
('ce68593d-3752-4dff-99a3-d28b4237d6a2', 'Oraimo OpenSnap Air OPN-371', 'oraimo-opensnap-air-opn-371', 'OPN371-BLK', 'Oraimo', 'Áudio & Som', 32000, 27500, 32000, 10, '/product_opensnap.jpg', 'OPEN-EAR', 4.7, 33),
-- [15] Necklace Lite
('8cfe6239-ef53-47d2-bd1d-8a849ab9e38d', 'Oraimo Necklace Lite', 'oraimo-necklace-lite', 'ORAIMO-OEB311-GOLD', 'Oraimo', 'Áudio & Som', 25000, 20000, 25000, 14, '/products/fones-tws-bluetooth.jpg', 'CONFORTO', 4.6, 28),
-- [16] X-WATCH PRISMA
('46e7034d-6a7f-41de-a4d8-e883040645a4', 'X-WATCH PRISMA — Smartwatch 1.4"', 'x-watch-prisma-smartwatch-1', 'AT-XW-PRISMA', 'X-Watch', 'Smartwatches', 32000, 27500, 32000, 8, '/products/smartwatch.jpg', 'COMPACTO', 4.5, 19),
-- [17] X-WATCH 1.8
('d8f54944-7134-4d66-907e-4b134a091afc', 'X-WATCH SMARTWATCH — 1.8" Bluetooth', 'x-watch-smartwatch-18-bluetooth', 'AT-XW-18', 'X-Watch', 'Smartwatches', 30000, 25000, 30000, 8, '/products/smartwatch.jpg', 'ECRÃ GRANDE', 4.4, 25),

-- NOVOS PRODUTOS (11 ITENS)
-- [18] Glorious Model O
('8a1e3b1c-7d6e-4f9a-8c2d-1b3a5f7e9d2b', 'Rato Gaming Sem Fios Glorious Model O Wireless RGB', 'rato-gaming-glorious-model-o-wireless', 'AT-GAM-011', 'Glorious', 'Acessórios & Tech', 110000, 86250, 110000, 10, '/products/mouse-glorious.jpg', 'PRO GAMER', 5.0, 38),
-- [19] Teclado Kapbom
('2c4e6f8a-0b2d-4f6a-8c0e-2d4f6a8c0e2d', 'Teclado Bluetooth Sem Fios Kapbom', 'teclado-bluetooth-kapbom', 'AT-ACC-012', 'Kapbom', 'Acessórios & Tech', 30000, 23750, 30000, 20, '/products/teclado-kapbom.jpg', 'ULTRA SLIM', 4.5, 12),
-- [20] Oraimo Mouse P
('f4a6e8c0-2d4f-6a8c-0e2d-4f6a8c0e2d4f', 'Oraimo Smart Mouse P Sem Fios', 'oraimo-smart-mouse-p', 'AT-ACC-013', 'Oraimo', 'Acessórios & Tech', 20000, 15000, 20000, 25, '/products/mouse-oraimo-p.jpg', 'CONFORTÁVEL', 4.7, 56),
-- [21] Webcam Kapbom
('a8c0e2d4-f6a8-c0e2-d4f6-a8c0e2d4f6a8', 'Webcam Full HD Kapbom 1080p USB', 'webcam-full-hd-kapbom-1080p', 'AT-ACC-014', 'Kapbom', 'Acessórios & Tech', 28000, 20000, 28000, 15, '/products/webcam-kapbom.jpg', 'FULL HD', 4.3, 9),
-- [22] Kit Microfones
('e2d4f6a8-c0e2-d4f6-a8c0-e2d4f6a8c0e2', 'Kit de Microfones Sem Fio — Duplo', 'kit-microfones-sem-fio-duplo', 'AT-ACC-015', 'Generic', 'Áudio & Som', 45000, 36250, 45000, 12, '/products/kit-microfones.jpg', 'CONTEÚDO', 4.9, 41),
-- [23] MagCable
('6a8c0e2d-4f6a-8c0e-2d4f-6a8c0e2d4f6a', 'Cabo Oraimo MagCable USB-C para Lightning — 1m', 'cabo-oraimo-magcable-usb-c-lightning', 'AT-ACC-016', 'Oraimo', 'Acessórios & Tech', 20000, 15000, 20000, 30, '/products/cabo-oraimo-mag.jpg', 'MAGNÉTICO', 4.8, 72),
-- [24] DuraLine 3
('0e2d4f6a-8c0e-2d4f-6a8c-0e2d4f6a8c0e', 'Cabo USB-A para USB-C Oraimo DuraLine 3 — 1m', 'cabo-oraimo-duraline-3-usb-a-c', 'AT-ACC-017', 'Oraimo', 'Acessórios & Tech', 15000, 11250, 15000, 50, '/products/cabo-oraimo-duraline.jpg', 'DURÁVEL', 4.9, 145),
-- [25] Oraimo Mouse F
('4f6a8c0e-2d4f-6a8c-0e2d-4f6a8c0e2d4f', 'Rato Sem Fios Oraimo Smart Mouse F 1200 DPI', 'oraimo-smart-mouse-f-wireless', 'AT-ACC-018', 'Oraimo', 'Acessórios & Tech', 20000, 15000, 20000, 25, '/products/mouse-oraimo-f.jpg', 'COMPACTO', 4.6, 34),
-- [26] Hub 7 in 1
('8c0e2d4f-6a8c-0e2d-4f6a-8c0e2d4f6a8c', 'Hub USB-C Oraimo Smart 7 em 1', 'hub-usb-c-oraimo-smart-7-1', 'AT-ACC-019', 'Oraimo', 'Acessórios & Tech', 55000, 40000, 55000, 15, '/products/hub-oraimo.jpg', 'PRODUTIVIDADE', 4.8, 29),
-- [27] Suporte Alumínio
('d4f6a8c0-e2d4-f6a8-c0e2-d4f6a8c0e2d4', 'Suporte de Alumínio Articulado e Dobrável para Notebook', 'suporte-aluminio-notebook-dobravel', 'AT-ACC-020', 'Generic', 'Acessórios & Tech', 28000, 20000, 28000, 20, '/products/suporte-notebook.jpg', 'ERGONOMIA', 4.7, 88),
-- [28] Tigre TV
('1e2d3c4b-5a6b-7c8d-9e0f-1a2b3c4d5e6f', 'Aparelho Tigre TV Box 4K', 'aparelho-tigre-tv-box-4k', 'AT-TV-021', 'Tigre', 'TV & Vídeo', 160000, 130000, 160000, 8, '/products/tigre-tv.jpg', 'PREMIUM TV', 4.9, 112)

ON CONFLICT (slug) 
DO UPDATE SET 
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  old_price = EXCLUDED.old_price,
  sku = EXCLUDED.sku,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  badge = EXCLUDED.badge,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  updated_at = NOW();

-- 3. Notifica o administrador (opcional - via logs)
-- SELECT 'Sincronização de 28 produtos concluída com sucesso!' as status;
