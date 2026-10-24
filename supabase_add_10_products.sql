-- ==============================================================================
-- AQUI TEM ANGOLA — SCRIPT SQL PARA ATUALIZAÇÃO DOS 10 PRODUTOS OFICIAIS
-- Executar no SQL Editor do Supabase para atualizar a tabela public.products
-- ==============================================================================

-- 1. Fones TWS Bluetooth
INSERT INTO public.products (
  id, name, slug, brand, category, sku, stock, active, price, sale_price, old_price, rating, reviews_count, badge, image_url, description
) VALUES (
  '3a1373b1-f09f-491e-ae85-8695398ac32a',
  'Fones de Ouvido TWS Bluetooth Oraimo FreePods Lite',
  'fones-tws-bluetooth',
  'Oraimo',
  'Áudio & Som',
  'AT-TWS-001',
  20,
  true,
  24000,
  20000,
  24000,
  4.9,
  32,
  'MAIS VENDIDO',
  '/products/fones-tws-bluetooth.jpg',
  'Os Fones TWS Bluetooth Oraimo FreePods Lite são a escolha perfeita para quem procura liberdade sem fios, conforto anatómico e qualidade sonora superior em Angola. Desenvolvidos para estudantes, profissionais e desportistas, estes auscultadores oferecem graves potentes através do algoritmo HavyBass e chamadas telefónicas com redução de ruído ambiental (ENC) cristalina.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  sku = EXCLUDED.sku,
  stock = EXCLUDED.stock,
  active = EXCLUDED.active,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  old_price = EXCLUDED.old_price,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  badge = EXCLUDED.badge,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description;

-- 2. Smartwatch
INSERT INTO public.products (
  id, name, slug, brand, category, sku, stock, active, price, sale_price, old_price, rating, reviews_count, badge, image_url, description
) VALUES (
  '250bfc74-fc6b-4c1a-867e-984b33a0ab06',
  'Smartwatch Inteligente com Ecrã AMOLED Curvo Oraimo Watch Nova 2',
  'smartwatch',
  'Oraimo',
  'Smartwatches',
  'AT-SW-002',
  15,
  true,
  34000,
  29500,
  34000,
  4.9,
  28,
  'OFERTA',
  '/products/smartwatch.jpg',
  'O Smartwatch Oraimo Watch Nova 2 é o companheiro tecnológico ideal para quem valoriza elegância, produtividade e saúde no pulso em Angola. Equipado com um deslumbrante ecrã AMOLED curvo de 2.01 polegadas, ele permite atender e fazer chamadas telefónicas em alta definição via Bluetooth diretamente do relógio.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  sku = EXCLUDED.sku,
  stock = EXCLUDED.stock,
  active = EXCLUDED.active,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  old_price = EXCLUDED.old_price,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  badge = EXCLUDED.badge,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description;

-- 3. Câmara Wi-Fi de Segurança
INSERT INTO public.products (
  id, name, slug, brand, category, sku, stock, active, price, sale_price, old_price, rating, reviews_count, badge, image_url, description
) VALUES (
  '9961e2e9-98c6-462b-8b6c-fd584f9b7a6d',
  'Câmara Wi-Fi de Segurança 360° Inteligente Full HD Visão Noturna',
  'camera-wifi-seguranca',
  'Defender / Tuya Smart',
  'Acessórios & Casa',
  'AT-CAM-003',
  12,
  true,
  29500,
  25000,
  29500,
  4.8,
  24,
  'SEGURANÇA',
  '/products/camera-wifi-seguranca.jpg',
  'A Câmara Wi-Fi de Segurança 360° Inteligente é a solução ideal para proteger a sua residência, escritório ou estabelecimento comercial em Luanda e em toda Angola. Com controlo total pelo telemóvel através da aplicação Smart Life ou Tuya, roda em 360 graus cobrindo todo o ambiente.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  sku = EXCLUDED.sku,
  stock = EXCLUDED.stock,
  active = EXCLUDED.active,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  old_price = EXCLUDED.old_price,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  badge = EXCLUDED.badge,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description;

-- 4. Smart Plug Wi-Fi
INSERT INTO public.products (
  id, name, slug, brand, category, sku, stock, active, price, sale_price, old_price, rating, reviews_count, badge, image_url, description
) VALUES (
  '6be401b8-4dc3-4564-9818-6593bc764422',
  'Smart Plug Wi-Fi Tomada Inteligente 16A com Controlo Remoto',
  'smart-plug-wifi',
  'Tuya / Smart Life',
  'Acessórios & Casa',
  'AT-SP-004',
  25,
  true,
  16500,
  13750,
  16500,
  4.9,
  26,
  'ECONOMIA',
  '/products/smart-plug-wifi.jpg',
  'O Smart Plug Wi-Fi de 16A transforma qualquer aparelho elétrico comum em tecnologia inteligente conectada à internet. Ideal para poupar energia em Angola, permite programar o termoacumulador, ar condicionado ou luzes para ligarem e desligarem automaticamente.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  sku = EXCLUDED.sku,
  stock = EXCLUDED.stock,
  active = EXCLUDED.active,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  old_price = EXCLUDED.old_price,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  badge = EXCLUDED.badge,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description;

-- 5. Carregador GaN
INSERT INTO public.products (
  id, name, slug, brand, category, sku, stock, active, price, sale_price, old_price, rating, reviews_count, badge, image_url, description
) VALUES (
  '54afed87-d9a4-492c-922e-07819e34f07e',
  'Carregador GaN 65W Rápido Multiportas USB-C e USB-A com Visor Digital',
  'carregador-gan',
  'BMX / GaN Tech',
  'Acessórios & Tech',
  'AT-GAN-005',
  18,
  true,
  30000,
  25000,
  30000,
  4.9,
  27,
  'ULTRA RÁPIDO',
  '/products/carregador-gan.jpg',
  'O Carregador GaN 65W Multiportas é a evolução definitiva para quem precisa de velocidade e praticidade no carregamento de múltiplos dispositivos eletrónicos em Angola. Desenvolvido com tecnologia GaN, entrega 65W em um corpo compacto que não aquece.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  sku = EXCLUDED.sku,
  stock = EXCLUDED.stock,
  active = EXCLUDED.active,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  old_price = EXCLUDED.old_price,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  badge = EXCLUDED.badge,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description;

-- 6. Power Bank
INSERT INTO public.products (
  id, name, slug, brand, category, sku, stock, active, price, sale_price, old_price, rating, reviews_count, badge, image_url, description
) VALUES (
  '28ce7427-2e08-4ad4-a568-c9558641d5c7',
  'Power Bank 10000mAh Bateria Externa Portátil Oraimo Toast 10',
  'power-bank',
  'Oraimo',
  'Energia',
  'AT-PB-006',
  24,
  true,
  22000,
  18750,
  22000,
  4.9,
  36,
  'INDISPENSÁVEL',
  '/products/power-bank.jpg',
  'A Bateria Externa Power Bank Oraimo 10000mAh é um acessório indispensável para quem vive a rotina dinâmica de Angola. Seja em longas viagens pelas províncias ou na rotina de trabalho em Luanda, este power bank garante que a sua bateria nunca fique a zero.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  sku = EXCLUDED.sku,
  stock = EXCLUDED.stock,
  active = EXCLUDED.active,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  old_price = EXCLUDED.old_price,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  badge = EXCLUDED.badge,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description;

-- 7. Mini Projetor
INSERT INTO public.products (
  id, name, slug, brand, category, sku, stock, active, price, sale_price, old_price, rating, reviews_count, badge, image_url, description
) VALUES (
  '7c8a4192-3110-4f25-88de-8ef7a1599a01',
  'Mini Projetor Portátil Smart LED HD 1080p Android Wi-Fi',
  'mini-projetor',
  'Magcubic / Smart Cinema',
  'TV & Vídeo',
  'AT-MP-007',
  10,
  true,
  58000,
  50000,
  58000,
  4.9,
  22,
  'CINEMA EM CASA',
  '/products/mini-projetor.jpg',
  'O Mini Projetor Portátil Smart LED é a revolução do entretenimento doméstico ao seu alcance em Angola. Com sistema operativo Android integrado e ligação Wi-Fi 6 de banda dupla, funciona como uma Smart TV portátil gigante até 130 polegadas.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  sku = EXCLUDED.sku,
  stock = EXCLUDED.stock,
  active = EXCLUDED.active,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  old_price = EXCLUDED.old_price,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  badge = EXCLUDED.badge,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description;

-- 8. Coluna Bluetooth Portátil
INSERT INTO public.products (
  id, name, slug, brand, category, sku, stock, active, price, sale_price, old_price, rating, reviews_count, badge, image_url, description
) VALUES (
  '84f18b32-9cb4-482a-a9e3-2e78dc2361b2',
  'Coluna Bluetooth Portátil com Graves HavyBass e Bateria de Longa Duração',
  'coluna-bluetooth',
  'Oraimo / SoundPro',
  'Áudio & Som',
  'AT-CB-008',
  16,
  true,
  26500,
  22500,
  26500,
  4.8,
  25,
  'SOM POTENTE',
  '/products/coluna-bluetooth.jpg',
  'A Coluna Bluetooth Portátil foi criada para quem não dispensa música de alta qualidade em lugar nenhum em Angola. Os seus 10W de potência com radiador passivo de graves proporcionam um som surround limpo e encorpado sem distorcer.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  sku = EXCLUDED.sku,
  stock = EXCLUDED.stock,
  active = EXCLUDED.active,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  old_price = EXCLUDED.old_price,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  badge = EXCLUDED.badge,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description;

-- 9. Mini Impressora Térmica Bluetooth
INSERT INTO public.products (
  id, name, slug, brand, category, sku, stock, active, price, sale_price, old_price, rating, reviews_count, badge, image_url, description
) VALUES (
  '91dc572e-84a1-4322-9df7-e61a2578c909',
  'Mini Impressora Térmica Portátil Bluetooth 58mm Sem Tinta para Telemóvel',
  'mini-impressora-termica',
  'PeriPage / Phomemo',
  'Acessórios & Tech',
  'AT-PRN-009',
  14,
  true,
  29500,
  25000,
  29500,
  4.8,
  21,
  'ZERO TINTA',
  '/products/mini-impressora-termica.jpg',
  'A Mini Impressora Térmica Portátil Bluetooth é o gadget indispensável para empreendedores, comerciantes, estudantes e profissionais autónomos em Angola. Não usa tinta nem toner, imprimindo recibos, etiquetas e notas direto do telemóvel.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  sku = EXCLUDED.sku,
  stock = EXCLUDED.stock,
  active = EXCLUDED.active,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  old_price = EXCLUDED.old_price,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  badge = EXCLUDED.badge,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description;

-- 10. Rastreador GPS
INSERT INTO public.products (
  id, name, slug, brand, category, sku, stock, active, price, sale_price, old_price, rating, reviews_count, badge, image_url, description
) VALUES (
  'a083d917-7e23-4581-be99-0e7f7b321a10',
  'Mini Rastreador GPS Magnético em Tempo Real com Botão SOS e Escuta',
  'rastreador-gps',
  'Smart Tracker / GF-07',
  'Acessórios & Tech',
  'AT-GPS-010',
  22,
  true,
  24500,
  20000,
  24500,
  4.9,
  29,
  'PROTEÇÃO TOTAL',
  '/products/rastreador-gps.jpg',
  'O Mini Rastreador GPS Magnético é o equipamento essencial para quem busca máxima segurança para viaturas, motorizadas, frotas comerciais e pertences valiosos em Angola. Ímanes de neodímio fortes e localização em tempo real no Google Maps.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  sku = EXCLUDED.sku,
  stock = EXCLUDED.stock,
  active = EXCLUDED.active,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  old_price = EXCLUDED.old_price,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  badge = EXCLUDED.badge,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description;
