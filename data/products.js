import { createSlug } from '../src/utils/slug.js';

// Helper function to create clean SVG data URIs for embedded HTML image fallback
const createSvgDataUri = (svgString) => {
  return "data:image/svg+xml;utf8," + encodeURIComponent(svgString);
};

export const PRODUCT_FALLBACK_IMAGES = {
  "boompop": "/product_boompop.jpg",
  "watchnova2": "/products/smartwatch.jpg",
  "nutrifry": "/product_nutrifry.jpg",
  "flexicooker": "/product_flexicooker.jpg",
  "thermogo": "/product_thermogo.jpg",
  "magpower": "/product_magpower.jpg",
  "opensnap": "/product_opensnap.jpg",
  "tv": "https://images.unsplash.com/photo-1593359677771-48288b3941a3?auto=format&fit=crop&w=800&q=80",
  "fridge": "/flyer_appliances.jpg",
  "charger": "/products/carregador-gan.jpg",
  "mouse": "https://images.unsplash.com/photo-1527698266440-12104e498b76?auto=format&fit=crop&w=800&q=80",
  "keyboard": "https://images.unsplash.com/photo-1587829741301-dc798b83dadc?auto=format&fit=crop&w=800&q=80",
  "webcam": "https://images.unsplash.com/photo-1588600102111-73602492160d?auto=format&fit=crop&w=800&q=80",
  "mic": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
  "cable": "https://images.unsplash.com/photo-1619190163414-04144b679116?auto=format&fit=crop&w=800&q=80",
  "hub": "https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&w=800&q=80",
  "stand": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80"
};

export const HERO_BANNER_FALLBACK = '/banners/banner_1.jpg';

export const HERO_COVER_IMAGES = [
  {
    url: '/banners/banner_1.jpg',
    tag: 'Operação Central Luanda',
    title: 'AQUI TEM ANGOLA',
    subtitle: 'Tecnologia Oficial e Eletrodomésticos com Pronta Entrega'
  },
  {
    url: '/banners/banner_2.jpg',
    tag: 'Distribuidor Autorizado',
    title: 'Linha Premium Oraimo',
    subtitle: 'Fones TWS, Smartwatches e Carregadores com Garantia Real'
  },
  {
    url: '/banners/banner_3.jpg',
    tag: 'Smart Home & Conforto',
    title: 'Casa Inteligente & Tech',
    subtitle: 'Câmaras Wi-Fi, Mini Projetores e Acessórios Selecionados'
  }
];

export const PRODUCTS = [
  {
    "id": "3a1373b1-f09f-491e-ae85-8695398ac32a",
    "supabaseId": "3a1373b1-f09f-491e-ae85-8695398ac32a",
    "name": "Fones de Ouvido TWS Bluetooth Oraimo FreePods Lite",
    "slug": "fones-tws-bluetooth",
    "slugAliases": [
      "fones-de-ouvido-tws-oraimo",
      "fones-tws-bluetooth-oraimo",
      "oraimo-freepods-lite"
    ],
    "sku": "AT-TWS-001",
    "brand": "Oraimo",
    "category": "Áudio & Som",
    "stock": 20,
    "active": true,
    "price": 24000,
    "sale_price": 20000,
    "old_price": 24000,
    "rating": 4.9,
    "reviews_count": 32,
    "badge": "MAIS VENDIDO",
    "image_url": "/products/fones-tws-bluetooth.jpg",
    "image": "/products/fones-tws-bluetooth.jpg",
    "images": [
      "/products/fones-tws-bluetooth.jpg"
    ],
    "description": "Os Fones TWS Bluetooth Oraimo FreePods Lite são a escolha perfeita para quem procura liberdade sem fios, conforto anatómico e qualidade sonora superior em Angola. Desenvolvidos para estudantes, profissionais e desportistas, estes auscultadores oferecem graves potentes através do algoritmo HavyBass e chamadas telefónicas com redução de ruído ambiental (ENC) cristalina, ideais para o dia a dia e trânsito em Luanda. Com autonomia impressionante de até 40 horas somando os fones e o estojo compacto, você passa dias sem se preocupar em procurar uma tomada. O carregamento ultra rápido AniFast garante 2 horas de música com apenas 10 minutos na tomada Tipo-C.",
    "highlights": [
      "Bluetooth 5.3 com emparelhamento instantâneo e ultra-baixa latência",
      "Autonomia colossal de até 40 horas no total com o estojo portátil",
      "Carregamento ultra rápido AniFast: 10 minutos de carga = 120 minutos de som",
      "Graves potentes e nítidos calibrados pelo algoritmo exclusivo HavyBass",
      "Microfones duplos com cancelamento de ruído ambiental (ENC) para chamadas limpas",
      "Certificação IPX4 resistente a suor, salpicos e chuviscos"
    ],
    "features": [
      "Tecnologia TWS True Wireless Stereo com controles touch táteis",
      "Design ergonómico ultraleve que não cansa o ouvido",
      "Compatibilidade universal com Android, iPhone iOS, tablets e computadores",
      "Estojo de bolso fosco elegante que não risca facilmente"
    ],
    "specifications": {
      "Versão Bluetooth": "V5.3",
      "Alcance Sem Fio": "Até 10 metros sem barreiras",
      "Autonomia dos Fones": "Até 8 horas contínuas de reprodução",
      "Autonomia com Estojo": "Até 40 horas totais",
      "Capacidade da Bateria": "40mAh (cada fone) / 500mAh (estojo)",
      "Porta de Carregamento": "USB Tipo-C (AniFast)",
      "Proteção contra Água": "IPX4 Resistente a suor e salpicos",
      "Controles": "Toque inteligente (Play/Pause, Avançar, Volume, Chamadas)"
    },
    "packageContent": [
      "1 Par de fones TWS Oraimo FreePods Lite",
      "1 Estojo de carregamento inteligente",
      "1 Cabo de dados USB Tipo-C",
      "3 Pares de ponteiras auriculares de silicone (P, M, G)",
      "1 Guia do utilizador e certificado de garantia oficial"
    ],
    "seoTitle": "Fones TWS Bluetooth Oraimo FreePods Som HD e Graves Potentes | AQUI TEM ANGOLA",
    "seoDescription": "Compre Fones TWS Bluetooth Oraimo FreePods originais com cancelamento de ruído, 40h de bateria e entrega rápida na AQUI TEM Angola. Pague na entrega em Luanda.",
    "seoKeywords": "fones tws bluetooth, fones oraimo angola, freepods lite luanda, auscultadores sem fio, comprar fones luanda, aqui tem angola"
  },
  {
    "id": "250bfc74-fc6b-4c1a-867e-984b33a0ab06",
    "supabaseId": "250bfc74-fc6b-4c1a-867e-984b33a0ab06",
    "name": "Smartwatch Inteligente com Ecrã AMOLED Curvo Oraimo Watch Nova 2",
    "slug": "smartwatch",
    "slugAliases": [
      "watch-nova-2-smartwatch-inteligente-oraimo",
      "smartwatch-oraimo-nova-2",
      "osw-814"
    ],
    "sku": "AT-SW-002",
    "brand": "Oraimo",
    "category": "Smartwatches",
    "stock": 15,
    "active": true,
    "price": 34000,
    "sale_price": 29500,
    "old_price": 34000,
    "rating": 4.9,
    "reviews_count": 28,
    "badge": "OFERTA",
    "image_url": "/products/smartwatch.jpg",
    "image": "/products/smartwatch.jpg",
    "images": [
      "/products/smartwatch.jpg"
    ],
    "description": "O Smartwatch Oraimo Watch Nova 2 é o companheiro tecnológico ideal para quem valoriza elegância, produtividade e saúde no pulso em Angola. Equipado com um deslumbrante ecrã AMOLED curvo de 2.01 polegadas com alta taxa de atualização, ele permite atender e fazer chamadas telefónicas em alta definição via Bluetooth diretamente do relógio, além de ler mensagens do WhatsApp, SMS e e-mails sem tirar o telemóvel do bolso. Para os entusiastas de fitness, monitoriza com precisão batimentos cardíacos 24h, níveis de oxigénio no sangue SpO2, calorias gastas e passos diários em mais de 100 modalidades desportivas. A caixa em acabamento metálico com pulseira de silicone hipoalergénico e bateria com autonomia de até 10 dias garantem uma experiência de uso sem preocupações.",
    "highlights": [
      "Ecrã curvo AMOLED de 2.01 polegadas com cores vivas e Always-On Display",
      "Faz e atende chamadas telefónicas via Bluetooth com microfone e altifalante HD",
      "Monitorização contínua de frequência cardíaca 24/7, SpO2 e qualidade de sono",
      "Mais de 100 modos desportivos para corrida, caminhada, ginásio e futebol",
      "Bateria de longa duração: até 7 a 10 dias de uso normal sem carregar",
      "Proteção IP68 contra água e poeira para uso em qualquer clima"
    ],
    "features": [
      "Notificações instantâneas do WhatsApp, chamadas, SMS e redes sociais",
      "Coroa rotativa digital para navegação rápida pelos menus",
      "Centenas de mostradores de relógio (Watch Faces) personalizáveis pela aplicação",
      "Controlo remoto de reprodução de música e obturador da câmara do telemóvel"
    ],
    "specifications": {
      "Ecrã": "2.01 polegadas AMOLED Curvo (Resolução 410x502)",
      "Conectividade": "Bluetooth 5.2 (Chamadas e Dados)",
      "Capacidade da Bateria": "300mAh Li-Po com carregamento magnético",
      "Autonomia": "Até 7 a 10 dias de uso regular",
      "Sensores": "Cardíaco Óptico, Oxímetro SpO2, Acelerómetro 3 eixos",
      "Resistência à Água": "Classificação IP68",
      "Compatibilidade": "Android 6.0 ou superior / iOS 11.0 ou superior (App Oraimo Health)",
      "Material": "Liga metálica de zinco + Pulseira de silicone hipoalergénico"
    },
    "packageContent": [
      "1 Smartwatch Oraimo Watch Nova 2",
      "1 Pulseira de silicone preta ergonómica",
      "1 Cabo de carregamento USB magnético",
      "1 Manual de instruções completo em português",
      "1 Cartão de garantia oficial"
    ],
    "seoTitle": "Smartwatch Inteligente Ecrã AMOLED e Chamadas Bluetooth | AQUI TEM ANGOLA",
    "seoDescription": "Compre o Smartwatch Oraimo Watch Nova 2 com ecrã AMOLED curvo de 2.01\", chamadas Bluetooth e monitor de saúde na AQUI TEM Angola. Garantia e entrega rápida em Luanda.",
    "seoKeywords": "smartwatch angola, oraimo watch nova 2, relogio inteligente luanda, smartwatch amoled, comprar smartwatch angola, aqui tem angola"
  },
  {
    "id": "9961e2e9-98c6-462b-8b6c-fd584f9b7a6d",
    "supabaseId": "9961e2e9-98c6-462b-8b6c-fd584f9b7a6d",
    "name": "Câmara Wi-Fi de Segurança 360° Inteligente Full HD Visão Noturna",
    "slug": "camera-wifi-seguranca",
    "slugAliases": [
      "camera-de-seguranca-wi-fi-defender-ip8mcb1-pro",
      "camera-wifi-seguranca-360"
    ],
    "sku": "AT-CAM-003",
    "brand": "Defender / Tuya Smart",
    "category": "Acessórios & Casa",
    "stock": 12,
    "active": true,
    "price": 29500,
    "sale_price": 25000,
    "old_price": 29500,
    "rating": 4.8,
    "reviews_count": 24,
    "badge": "SEGURANÇA",
    "image_url": "/products/camera-wifi-seguranca.jpg",
    "image": "/products/camera-wifi-seguranca.jpg",
    "images": [
      "/products/camera-wifi-seguranca.jpg"
    ],
    "description": "A Câmara Wi-Fi de Segurança 360° Inteligente é a solução ideal para proteger a sua residência, escritório ou estabelecimento comercial em Luanda e em toda Angola. Com controlo total pelo telemóvel através da aplicação Smart Life ou Tuya, você pode rodar a câmara em qualquer direção remotamente (355° horizontal e 90° vertical), cobrindo todo o ambiente sem pontos cegos. A tecnologia de visão noturna por infravermelhos automáticos garante imagens nítidas mesmo na escuridão absoluta, enquanto o sensor de movimento envia notificações imediatas com foto sempre que detectar qualquer atividade no perímetro. Graças ao sistema de áudio bidirecional, é possível conversar com quem estiver no local ou advertir intrusos remotamente.",
    "highlights": [
      "Rotação panorâmica motorizada PTZ 355° horizontal e 90° vertical",
      "Resolução de imagem Full HD 1080p com lentes ópticas de alta fidelidade",
      "Visão noturna infravermelha automática com alcance de até 15 metros no escuro",
      "Deteção inteligente de movimento humano com envio de alertas no telemóvel",
      "Áudio bidirecional integrado: fale e ouça em tempo real pela aplicação",
      "Armazenamento flexível: suporta cartão MicroSD até 128GB ou gravação em nuvem"
    ],
    "features": [
      "Acesso simultâneo de múltiplos utilizadores (família ou equipa de segurança)",
      "Suporte para fixação em teto, parede ou sobreposta em bancadas e mesas",
      "Sirene de alarme integrada que pode ser acionada remotamente",
      "Conexão Wi-Fi estável com antenas duplas de alto ganho"
    ],
    "specifications": {
      "Resolução de Vídeo": "Full HD 1080p (1920 x 1080 pixels)",
      "Ângulo de Rotação": "355° Horizontal / 90° Vertical",
      "Conectividade": "Wi-Fi 2.4GHz IEEE 802.11 b/g/n",
      "Visão Noturna": "LEDs Infravermelhos IR-Cut automático até 15m",
      "Armazenamento": "Slot MicroSD até 128GB (Cartão não incluído) e Nuvem",
      "Áudio": "Microfone e alto-falante embutidos (Two-way audio)",
      "Alimentação": "Bivolt 100-240V via adaptador DC 5V/1.5A incluído",
      "Aplicação de Gestão": "Tuya Smart / Smart Life (Android e iOS)"
    },
    "packageContent": [
      "1 Câmara Wi-Fi de Segurança 360° PTZ",
      "1 Fonte de alimentação Bivolt com cabo USB",
      "1 Suporte de fixação para teto/parede",
      "1 Kit de buchas e parafusos de montagem",
      "1 Manual de instalação rápida em português"
    ],
    "seoTitle": "Câmara Wi-Fi de Segurança 360 Graus com Visão Noturna e Áudio | AQUI TEM ANGOLA",
    "seoDescription": "Proteja a sua família e negócio com a Câmara Wi-Fi de Segurança 360° Full HD na AQUI TEM Angola. Alertas no telemóvel, visão noturna e entrega rápida em Luanda.",
    "seoKeywords": "camera de seguranca luanda, camera wifi 360 angola, camera ip visão noturna, seguranca residencial angola, aqui tem angola"
  },
  {
    "id": "6be401b8-4dc3-4564-9818-6593bc764422",
    "supabaseId": "6be401b8-4dc3-4564-9818-6593bc764422",
    "name": "Smart Plug Wi-Fi Tomada Inteligente 16A com Controlo Remoto",
    "slug": "smart-plug-wifi",
    "slugAliases": [
      "tomada-inteligente-wi-fi-smart-plug-com-botao-de-controlo"
    ],
    "sku": "AT-SP-004",
    "brand": "Tuya / Smart Life",
    "category": "Acessórios & Casa",
    "stock": 25,
    "active": true,
    "price": 16500,
    "sale_price": 13750,
    "old_price": 16500,
    "rating": 4.9,
    "reviews_count": 26,
    "badge": "ECONOMIA",
    "image_url": "/products/smart-plug-wifi.jpg",
    "image": "/products/smart-plug-wifi.jpg",
    "images": [
      "/products/smart-plug-wifi.jpg"
    ],
    "description": "O Smart Plug Wi-Fi de 16A transforma qualquer aparelho elétrico comum em tecnologia inteligente conectada à internet. Ideal para poupar energia em Angola, permite programar o termoacumulador, ar condicionado, ventiladores ou luzes para ligarem e desligarem automaticamente nos horários que você definir. Esqueceu o ferro de passar ou aquecedor ligado? Verifique o estado e desligue o aparelho instantaneamente pelo smartphone, mesmo estando no trânsito ou no trabalho. A configuração é extremamente simples: basta espetar na tomada de parede, conectar à sua rede Wi-Fi e começar a controlar sem precisar de centrais complicadas.",
    "highlights": [
      "Liga e desliga aparelhos elétricos à distância de qualquer lugar pelo telemóvel",
      "Compatível com comandos de voz através da Amazon Alexa e Google Assistant",
      "Programação de temporizador, contagem regressiva e horários diários automáticos",
      "Capacidade robusta de 16A suporta aparelhos de alta potência até 3500W",
      "Fabricado em material anti-chamas V0 com proteção contra sobrecarga",
      "Botão físico liga/desliga com indicador luminoso LED de status"
    ],
    "features": [
      "Reduz custos na fatura de eletricidade da ENDE ao evitar desperdícios",
      "Padrão de pinos redondos 100% compatível com as tomadas de Angola",
      "Compartilhamento do controlo com outros membros da família",
      "Manutenção de estado após falhas de energia (liga/desliga conforme memória)"
    ],
    "specifications": {
      "Tensão Elétrica": "AC 100-240V 50/60Hz (Bivolt)",
      "Corrente Máxima": "16A (Carga resistiva até 3500W)",
      "Padrão Sem Fio": "Wi-Fi 2.4GHz 802.11 b/g/n",
      "Padrão de Ficha": "Padrão Europeu / Angolano de 2 pinos",
      "Segurança Elétrica": "Proteção contra sobretensão, sobrecarga e curto-circuito",
      "Material da Estrutura": "Policarbonato retardador de chama V0",
      "Aplicação de Controlo": "Smart Life / Tuya Smart (iOS e Android)"
    },
    "packageContent": [
      "1 Smart Plug Wi-Fi Tomada Inteligente 16A",
      "1 Manual do utilizador passo a passo em português"
    ],
    "seoTitle": "Smart Plug Wi-Fi Tomada Inteligente 16A com Controlo no Telemóvel | AQUI TEM ANGOLA",
    "seoDescription": "Automatize a sua casa com o Smart Plug Wi-Fi Tomada Inteligente 16A na AQUI TEM Angola. Temporizador, economia de energia e entrega expressa em Luanda.",
    "seoKeywords": "smart plug wifi angola, tomada inteligente luanda, automacao residencial angola, tuya smart plug, poupar energia angola, aqui tem angola"
  },
  {
    "id": "54afed87-d9a4-492c-922e-07819e34f07e",
    "supabaseId": "54afed87-d9a4-492c-922e-07819e34f07e",
    "name": "Carregador GaN 65W Rápido Multiportas USB-C e USB-A com Visor Digital",
    "slug": "carregador-gan",
    "slugAliases": [
      "carregador-rapido-de-parede-bmx-70w-com-visor-lcd",
      "carregador-gan-65w"
    ],
    "sku": "AT-GAN-005",
    "brand": "BMX / GaN Tech",
    "category": "Acessórios & Tech",
    "stock": 18,
    "active": true,
    "price": 30000,
    "sale_price": 25000,
    "old_price": 30000,
    "rating": 4.9,
    "reviews_count": 27,
    "badge": "ULTRA RÁPIDO",
    "image_url": "/products/carregador-gan.jpg",
    "image": "/products/carregador-gan.jpg",
    "images": [
      "/products/carregador-gan.jpg"
    ],
    "description": "O Carregador GaN 65W Multiportas é a evolução definitiva para quem precisa de velocidade e praticidade no carregamento de múltiplos dispositivos eletrónicos em Angola. Desenvolvido com semicondutores de Nitreto de Gálio (GaN), entrega impressionantes 65W de potência em um corpo ultra compacto que não aquece e cabe no bolso. O visor digital inteligente mostra em tempo real a voltagem e os watts fornecidos ao seu aparelho. Com duas portas USB-C Power Delivery e uma porta USB-A Quick Charge, você pode carregar o seu portátil de trabalho (MacBook, Dell, HP), smartphone e tablet simultaneamente com um único carregador de tomada de alta eficiência.",
    "highlights": [
      "Tecnologia semicondutora GaN: mais potência em corpo 50% menor e mais frio",
      "Potência de 65W: carrega portáteis e telemóveis em velocidade máxima",
      "Visor digital LED integrado com leitura em tempo real da potência de carga",
      "3 Portas de saída rápida: 2x USB-C Power Delivery 3.0 + 1x USB-A Quick Charge 3.0",
      "Alimenta simultaneamente até 3 dispositivos com distribuição dinâmica de energia",
      "Proteção inteligente em 8 níveis contra sobretensão, sobreaquecimento e curto-circuito"
    ],
    "features": [
      "Compatível com protocolos PD 3.0, QC 4.0+, PPS, SCP e AFC",
      "Carrega iPhone e Samsung Galaxy de 0% a 70% em cerca de 30 minutos",
      "Ficha de tomada compatível com as tomadas de parede de Angola",
      "Design preto fosco elegante resistente a riscos e marcas de dedos"
    ],
    "specifications": {
      "Potência Máxima": "65W RMS",
      "Tecnologia": "GaN III (Gallium Nitride)",
      "Entrada de Corrente": "AC 100-240V ~ 50/60Hz 1.5A",
      "Saída USB-C1": "5V/3A, 9V/3A, 12V/3A, 15V/3A, 20V/3.25A (65W Max)",
      "Saída USB-C2": "5V/3A, 9V/2.22A, 12V/1.67A (20W Max)",
      "Saída USB-A": "5V/3A, 9V/2A, 12V/1.5A (18W Max)",
      "Visor": "Ecrã digital LED embutido para monitorização",
      "Certificações": "CE, FCC, RoHS de segurança elétrica"
    },
    "packageContent": [
      "1 Carregador GaN Fast Charger 65W com Visor Digital",
      "1 Manual do utilizador e guia de segurança"
    ],
    "seoTitle": "Carregador GaN 65W Rápido Multiportas USB-C e USB-A com Visor | AQUI TEM ANGOLA",
    "seoDescription": "Carregador GaN 65W com visor digital para portáteis e telemóveis na AQUI TEM Angola. Carregamento ultra rápido, compacto e seguro com entrega em Luanda.",
    "seoKeywords": "carregador gan 65w angola, carregador macbook luanda, carregador rapido tipo c, carregador bmx 70w, acessorios celular luanda, aqui tem angola"
  },
  {
    "id": "28ce7427-2e08-4ad4-a568-c9558641d5c7",
    "supabaseId": "28ce7427-2e08-4ad4-a568-c9558641d5c7",
    "name": "Power Bank 10000mAh Bateria Externa Portátil Oraimo Toast 10",
    "slug": "power-bank",
    "slugAliases": [
      "bateria-externa-power-bank-oraimo-10000mah"
    ],
    "sku": "AT-PB-006",
    "brand": "Oraimo",
    "category": "Energia",
    "stock": 24,
    "active": true,
    "price": 22000,
    "sale_price": 18750,
    "old_price": 22000,
    "rating": 4.9,
    "reviews_count": 36,
    "badge": "INDISPENSÁVEL",
    "image_url": "/products/power-bank.jpg",
    "image": "/products/power-bank.jpg",
    "images": [
      "/products/power-bank.jpg"
    ],
    "description": "A Bateria Externa Power Bank Oraimo 10000mAh é um acessório indispensável para quem vive a rotina dinâmica de Angola. Seja em longas viagens pelas províncias ou na rotina de trabalho em Luanda, este power bank garante que a sua bateria nunca fique a zero. Com capacidade para recarregar até 3 vezes um smartphone moderno, possui saída dupla USB inteligente AniFast que alimenta dois aparelhos ao mesmo tempo com proteção de voltagem total. O seu acabamento em textura 3D fosca evita quedas e riscos, proporcionando um toque premium e ergonómico na palma da mão.",
    "highlights": [
      "Capacidade real de 10.000mAh com células de polímero de lítio de alta densidade",
      "Dupla saída USB 2.4A: carregue dois telemóveis simultaneamente",
      "Tecnologia exclusiva AniFast: detecta o aparelho e optimiza a corrente mais rápida",
      "Indicador LED inteligente de 4 pontos para visualização precisa da carga restante",
      "Espessura ultrafina de apenas 15.5mm com textura 3D antiderrapante",
      "Sistema de multi-proteção integrado contra sobrecarga, curto-circuito e calor"
    ],
    "features": [
      "Duas entradas de recarga: porta Micro-USB e porta USB Tipo-C",
      "Aprovado para transporte em bagagem de mão em voos nacionais e internacionais",
      "Compatível com todas as marcas: Samsung, iPhone, Xiaomi, Tecno, Infinix e fones TWS",
      "Construção durável com liga de policarbonato reforçado"
    ],
    "specifications": {
      "Capacidade da Bateria": "10.000mAh (37Wh)",
      "Tipo de Bateria": "Polímero de Lítio Classe A+",
      "Entrada 1 (Micro-USB)": "5V / 2A",
      "Entrada 2 (Tipo-C)": "5V / 2A",
      "Saída 1 (USB-A)": "5V / 2.4A (AniFast)",
      "Saída 2 (USB-A)": "5V / 2.1A",
      "Dimensões": "140 x 67 x 15.5 mm",
      "Peso": "225 gramas"
    },
    "packageContent": [
      "1 Bateria Externa Power Bank Oraimo 10.000mAh Original",
      "1 Cabo de carregamento USB",
      "1 Manual de instruções oficial com código de autenticidade"
    ],
    "seoTitle": "Power Bank 10000mAh Bateria Externa Portátil com Saída Dupla | AQUI TEM ANGOLA",
    "seoDescription": "Compre o Power Bank Oraimo 10000mAh original com tecnologia AniFast e saída dupla USB na AQUI TEM Angola. Garantia e entrega ao domicílio em Luanda.",
    "seoKeywords": "power bank oraimo angola, bateria externa 10000mah luanda, power bank original angola, comprar power bank luanda, aqui tem angola"
  },
  {
    "id": "7c8a4192-3110-4f25-88de-8ef7a1599a01",
    "supabaseId": "7c8a4192-3110-4f25-88de-8ef7a1599a01",
    "name": "Mini Projetor Portátil Smart LED HD 1080p Android Wi-Fi",
    "slug": "mini-projetor",
    "slugAliases": [
      "mini-projetor-smart-led",
      "projetor-portatil-android"
    ],
    "sku": "AT-MP-007",
    "brand": "Magcubic / Smart Cinema",
    "category": "TV & Vídeo",
    "stock": 10,
    "active": true,
    "price": 58000,
    "sale_price": 50000,
    "old_price": 58000,
    "rating": 4.9,
    "reviews_count": 22,
    "badge": "CINEMA EM CASA",
    "image_url": "/products/mini-projetor.jpg",
    "image": "/products/mini-projetor.jpg",
    "images": [
      "/products/mini-projetor.jpg"
    ],
    "description": "O Mini Projetor Portátil Smart LED é a revolução do entretenimento doméstico ao seu alcance em Angola. Com sistema operativo Android integrado e ligação Wi-Fi 6 de banda dupla, ele funciona como uma Smart TV portátil gigante: basta ligar à tomada e transmitir séries, futebol, filmes e vídeos sem fios, sem depender de cabos ou computadores. O seu inovador suporte articulado de 180 graus permite apontar a projeção diretamente para o teto do quarto, criando uma experiência de cinema relaxante na cama com imagens de até 130 polegadas. Compacto e leve, pode ser levado facilmente para a casa de amigos, quintal ou escritório para apresentações de negócios.",
    "highlights": [
      "Sistema operacional Android integrado com suporte a YouTube, Netflix e Prime Video",
      "Resolução óptica HD nativa compatível com conteúdos 1080p e 4K Ultra HD",
      "Suporte giratório em 180°: projete livremente na parede, tela ou direto no teto",
      "Tamanho de projeção gigante ajustável de 40 até 130 polegadas com foco manual",
      "Conexão sem fio Wi-Fi 6 de banda dupla ultrarrápida e Bluetooth 5.0 para colunas",
      "Altifalante estéreo Hi-Fi embutido e portas HDMI, USB e saída de áudio AUX"
    ],
    "features": [
      "Correção trapezoidal automática (Keystone) para imagem sempre alinhada",
      "Lâmpada LED com vida útil superior a 50.000 horas de entretenimento",
      "Transmissão de ecrã sem fios (Screen Mirroring) a partir do telemóvel Android ou iPhone",
      "Ultra silencioso com sistema de ventilação e arrefecimento eficiente"
    ],
    "specifications": {
      "Tecnologia de Imagem": "LCD LED 3.5 polegadas",
      "Luminosidade": "200 ANSI Lumens (Imagens vívidas em meia luz/escuro)",
      "Resolução Nativa": "1280 x 720p (Decodificação 1080p e 4K)",
      "Tamanho da Imagem": "40 a 130 polegadas (Distância de 1.2m a 4m)",
      "Sistema Operativo": "Android 11 com loja de aplicações",
      "Conectividade": "Wi-Fi 6 Dual Band (2.4G/5G) + Bluetooth 5.0",
      "Portas de Entrada": "1x HDMI, 1x USB 2.0, 1x Jack 3.5mm de áudio, 1x Entrada AC",
      "Som Integrado": "Altifalante de alta fidelidade 3W RMS"
    },
    "packageContent": [
      "1 Mini Projetor Portátil Smart LED com Suporte 180°",
      "1 Comando remoto infravermelho ergonómico",
      "1 Cabo de alimentação Bivolt",
      "1 Manual de instruções completo em português"
    ],
    "seoTitle": "Mini Projetor Portátil Smart LED com Wi-Fi e Android Integrado | AQUI TEM ANGOLA",
    "seoDescription": "Tenha um cinema em casa com o Mini Projetor Portátil Smart LED até 130 polegadas na AQUI TEM Angola. Wi-Fi, Android e entrega rápida em Luanda.",
    "seoKeywords": "mini projetor luanda, projetor portatil angola, projetor smart android, cinema em casa angola, comprar projetor luanda, aqui tem angola"
  },
  {
    "id": "84f18b32-9cb4-482a-a9e3-2e78dc2361b2",
    "supabaseId": "84f18b32-9cb4-482a-a9e3-2e78dc2361b2",
    "name": "Coluna Bluetooth Portátil com Graves HavyBass e Bateria de Longa Duração",
    "slug": "coluna-bluetooth",
    "slugAliases": [
      "coluna-bluetooth-portatil",
      "caixa-de-som-bluetooth-oraimo"
    ],
    "sku": "AT-CB-008",
    "brand": "Oraimo / SoundPro",
    "category": "Áudio & Som",
    "stock": 16,
    "active": true,
    "price": 26500,
    "sale_price": 22500,
    "old_price": 26500,
    "rating": 4.8,
    "reviews_count": 25,
    "badge": "SOM POTENTE",
    "image_url": "/products/coluna-bluetooth.jpg",
    "image": "/products/coluna-bluetooth.jpg",
    "images": [
      "/products/coluna-bluetooth.jpg"
    ],
    "description": "A Coluna Bluetooth Portátil foi criada para quem não dispensa música de alta qualidade em lugar nenhum em Angola. Seja num churrasco em família em Benfica ou no Talatona, na praia da Ilha de Luanda ou na tranquilidade de casa, os seus 10W de potência com radiador passivo de graves proporcionam um som surround limpo e encorpado que preenche o ambiente sem distorcer. A estrutura cilíndrica robusta com revestimento em tecido técnico e certificação IPX5 protege contra respingos de água e poeira, enquanto a bateria de longa duração garante mais de 10 a 12 horas contínuas de reprodução das suas músicas favoritas.",
    "highlights": [
      "Potência sonora de 10W RMS com radiador passivo de graves profundos HavyBass",
      "Bateria recarregável de lítio garante até 12 horas ininterruptas de música",
      "Proteção IPX5 resistente a salpicos de água e poeira para praia e piscina",
      "Múltiplas formas de reprodução: Bluetooth 5.1, Cartão MicroSD, Pen Drive USB e Cabo AUX",
      "Microfone de alta sensibilidade para atender chamadas telefónicas em mãos-livres",
      "Alça de transporte reforçada em silicone e tecido resistente de alta durabilidade"
    ],
    "features": [
      "Tecnologia TWS: emparelhe duas colunas sem fios para som estéreo amplificado",
      "Rádio FM integrado com sintonização automática de estações de Angola",
      "Botões físicos emborrachados de toque suave na parte superior",
      "Design cilíndrico compacto que cabe no porta-copos da viatura"
    ],
    "specifications": {
      "Potência de Áudio": "10W RMS (Graves HavyBass 360°)",
      "Versão do Bluetooth": "V5.1 com emparelhamento estável até 10m",
      "Capacidade da Bateria": "1800mAh Li-ion recarregável",
      "Tempo de Reprodução": "Até 12 horas (volume moderado)",
      "Portas e Entradas": "Bluetooth, MicroSD/TF, USB, AUX P2 3.5mm, Rádio FM",
      "Resistência a Água": "IPX5 Resistente a salpicos e chuva leve",
      "Tempo de Recarga": "Aproximadamente 2.5 horas via porta USB Tipo-C",
      "Dimensões": "120 x 85 x 85 mm"
    },
    "packageContent": [
      "1 Coluna Bluetooth Portátil com Alça de Transporte",
      "1 Cabo de carregamento USB Tipo-C",
      "1 Cabo de áudio auxiliar P2 3.5mm",
      "1 Manual de instruções oficial em português"
    ],
    "seoTitle": "Coluna Bluetooth Portátil com Graves Potentes e Bateria Longa | AQUI TEM ANGOLA",
    "seoDescription": "Compre a Coluna Bluetooth Portátil com graves HavyBass, 12h de autonomia e proteção IPX5 na AQUI TEM Angola. Som de alta qualidade com entrega expressa em Luanda.",
    "seoKeywords": "coluna bluetooth angola, caixa de som portatil luanda, oraimo soundpro luanda, coluna ipx5 a prova de agua, comprar coluna luanda, aqui tem angola"
  },
  {
    "id": "91dc572e-84a1-4322-9df7-e61a2578c909",
    "supabaseId": "91dc572e-84a1-4322-9df7-e61a2578c909",
    "name": "Mini Impressora Térmica Portátil Bluetooth 58mm Sem Tinta para Telemóvel",
    "slug": "mini-impressora-termica",
    "slugAliases": [
      "mini-impressora-termica-bluetooth",
      "impressora-termica-portatil"
    ],
    "sku": "AT-PRN-009",
    "brand": "PeriPage / Phomemo",
    "category": "Acessórios & Tech",
    "stock": 14,
    "active": true,
    "price": 29500,
    "sale_price": 25000,
    "old_price": 29500,
    "rating": 4.8,
    "reviews_count": 21,
    "badge": "ZERO TINTA",
    "image_url": "/products/mini-impressora-termica.jpg",
    "image": "/products/mini-impressora-termica.jpg",
    "images": [
      "/products/mini-impressora-termica.jpg"
    ],
    "description": "A Mini Impressora Térmica Portátil Bluetooth é o gadget indispensável para empreendedores, comerciantes, estudantes e profissionais autónomos em Angola. Graças ao cabeçote térmico de alta precisão, ela não usa tinta, toner ou fitas de impressão: o texto e imagens são gerados termicamente no papel com custo praticamente zero por folha. Conectada via Bluetooth ao telemóvel Android ou iPhone, imprime recibos imediatos de entregas, notas de venda para clientes, comprovativos de transferência, listas de tarefas diárias, lembretes de estudo e etiquetas autocolantes com total praticidade e rapidez.",
    "highlights": [
      "Tecnologia de impressão térmica direta: ZERO tinta, zero cartuchos e zero sujeira",
      "Conexão sem fios Bluetooth compatível com telemóveis Android e iPhones iOS",
      "Imprime recibos comerciais, comprovativos, etiquetas adesivas, notas e fotos P&B",
      "Resolução de impressão de 203 DPI nítida para códigos de barras e QR Codes",
      "Bateria recarregável integrada de 1000mAh com carregamento via porta USB Tipo-C",
      "Formato de bolso ultra leve de apenas 160g cabe na mão ou na mala de trabalho"
    ],
    "features": [
      "Aplicação gratuita para telemóvel com centenas de modelos prontos de etiquetas",
      "Compatível com rolos padrão de papel térmico de 57mm e 58mm comuns no mercado",
      "Impressão silenciosa e imediata em segundos",
      "Excelente para vendedores online, estafetas, pequenos comércios e estudantes"
    ],
    "specifications": {
      "Método de Impressão": "Térmica direta (Sem tinta/toner)",
      "Largura do Papel": "57mm / 58mm padrão comercial",
      "Diâmetro do Rolo": "Até 30mm",
      "Resolução de Impressão": "203 DPI",
      "Bateria": "1000mAh Lítio recarregável integrada",
      "Conectividade": "Bluetooth 4.0 BLE e porta USB Tipo-C",
      "Compatibilidade": "Android e iOS (Apps WalkPrint, FunPrint, Phomemo)",
      "Velocidade": "Até 10mm/s"
    },
    "packageContent": [
      "1 Mini Impressora Térmica Portátil Bluetooth",
      "1 Rolo de papel térmico branco inicial (58mm)",
      "1 Cabo de carregamento USB Tipo-C",
      "1 Manual do utilizador passo a passo em português"
    ],
    "seoTitle": "Mini Impressora Térmica Portátil Bluetooth Sem Tinta para Telemóvel | AQUI TEM ANGOLA",
    "seoDescription": "Imprima recibos e etiquetas onde estiver com a Mini Impressora Térmica Bluetooth na AQUI TEM Angola. Sem uso de tinta, econômica e com entrega rápida em Luanda.",
    "seoKeywords": "mini impressora termica angola, impressora bluetooth celular luanda, impressora recibos sem tinta, impressora portatil 58mm angola, aqui tem angola"
  },
  {
    "id": "a083d917-7e23-4581-be99-0e7f7b321a10",
    "supabaseId": "a083d917-7e23-4581-be99-0e7f7b321a10",
    "name": "Mini Rastreador GPS Magnético em Tempo Real com Botão SOS e Escuta",
    "slug": "rastreador-gps",
    "slugAliases": [
      "mini-rastreador-gps-magnetico",
      "rastreador-veicular-gps"
    ],
    "sku": "AT-GPS-010",
    "brand": "Smart Tracker / GF-07",
    "category": "Acessórios & Tech",
    "stock": 22,
    "active": true,
    "price": 24500,
    "sale_price": 20000,
    "old_price": 24500,
    "rating": 4.9,
    "reviews_count": 29,
    "badge": "PROTEÇÃO TOTAL",
    "image_url": "/products/rastreador-gps.jpg",
    "image": "/products/rastreador-gps.jpg",
    "images": [
      "/products/rastreador-gps.jpg"
    ],
    "description": "O Mini Rastreador GPS Magnético é o equipamento essencial para quem busca máxima segurança para viaturas, motorizadas, frotas comerciais e pertences valiosos em Angola. O seu tamanho reduzido e os potentes ímanes de neodímio permitem escondê-lo discretamente em qualquer parte do carro ou moto sem necessidade de cablagem elétrica. Funcionando com cartões SIM normais da Unitel ou Movicel, permite consultar a posição do veículo instantaneamente no Google Maps pelo telemóvel, receber alertas de movimento e ativar a escuta remota silenciosa para monitorizar o que se passa no interior do veículo.",
    "highlights": [
      "Localização precisa em tempo real via satélite GPS e triangulação de antenas LBS/GSM",
      "Fixação magnética ultra forte: adere firmemente ao chassi ou peças metálicas de viaturas",
      "Compatível com cartões SIM de operadoras de Angola (Unitel e Movicel)",
      "Função de escuta ambiental remota: ligue para o rastreador e ouça o áudio em tempo real",
      "Botão SOS de emergência para envio automático de alerta com coordenadas geográficas",
      "Alerta de cerca geográfica (Geofencing) e histórico de rotas percorridas"
    ],
    "features": [
      "Zero cabos ou instalações complexas: basta colocar no metal",
      "Modo de economia de energia com autonomia em standby de até 6 dias",
      "Dimensões microscópicas de apenas 4cm que o tornam totalmente indetetável",
      "Consulta de localização por link direto SMS para o Google Maps"
    ],
    "specifications": {
      "Rede e Frequências": "GSM/GPRS Quad-band (850/900/1800/1900MHz)",
      "Precisão de Localização": "GPS 5-10 metros / LBS 100-500 metros",
      "Bateria": "Bateria de íon de lítio 400mAh recarregável integrada",
      "Autonomia em Standby": "Até 4 a 6 dias contínuos",
      "Entradas": "Slot para Micro SIM Card e Cartão TF até 16GB",
      "Fixação": "2 Ímanes de neodímio embutidos de alta potência",
      "Dimensões": "4.2 x 2.5 x 1.5 cm",
      "Peso": "20 gramas"
    },
    "packageContent": [
      "1 Mini Rastreador GPS Magnético",
      "1 Cabo de carregamento USB",
      "1 Manual com comandos SMS em português e configuração fácil"
    ],
    "seoTitle": "Mini Rastreador GPS Magnético em Tempo Real para Viaturas e Objetos | AQUI TEM ANGOLA",
    "seoDescription": "Monitore o seu carro ou motorizada em tempo real com o Mini Rastreador GPS Magnético na AQUI TEM Angola. Alertas no telemóvel, botão SOS e entrega em Luanda.",
    "seoKeywords": "rastreador gps angola, rastreador veicular luanda, localizador gps moto luanda, rastreador magnetico gf-07, seguranca veicular angola, aqui tem angola"
  },
  {
    "id": "b1665cb5-f5fc-4ff4-8dbf-379aacc9794b",
    "supabaseId": "b1665cb5-f5fc-4ff4-8dbf-379aacc9794b",
    "name": "Auscultadores Bluetooth Oraimo BoomPop",
    "slug": "auscultadores-bluetooth",
    "sku": "BOOM-BLK",
    "brand": "Oraimo",
    "category": "Áudio & Som",
    "stock": 10,
    "active": true,
    "price": 44000,
    "sale_price": 38500,
    "old_price": 44000,
    "rating": 4.9,
    "reviews_count": 30,
    "badge": "BASS BOOST",
    "image_url": "/product_boompop.jpg",
    "image": "/product_boompop.jpg",
    "images": [
      "/product_boompop.jpg"
    ],
    "description": "Auscultadores over-ear Bluetooth Oraimo BoomPop com graves profundos HavyBass, cancelamento de ruído passivo e almofadas ergonómicas macias. Autonomia de até 40 horas contínuas de reprodução.",
    "highlights": [
      "Graves potentes HavyBass calibrados para música e gaming",
      "Bateria com até 40 horas de autonomia",
      "Almofadas de isolamento acústico confortáveis",
      "Entrada auxiliar P2 3.5mm e rádio FM integrado"
    ],
    "features": [
      "Design dobrável para transporte fácil",
      "Microfone embutido para chamadas telefónicas em mãos-livres"
    ],
    "specifications": {
      "Bluetooth": "V5.0",
      "Bateria": "500mAh",
      "Autonomia": "Até 40 horas",
      "Driver": "40mm dinâmico"
    },
    "packageContent": [
      "1 Auscultadores Oraimo BoomPop",
      "1 Cabo auxiliar 3.5mm",
      "1 Cabo de carregamento USB",
      "1 Manual do utilizador"
    ],
    "seoTitle": "Auscultadores Bluetooth Oraimo BoomPop com Graves Potentes | AQUI TEM ANGOLA",
    "seoDescription": "Auscultadores Bluetooth Oraimo BoomPop over-ear com cancelamento de ruído e até 40h de música na AQUI TEM Angola. Garantia oficial e entrega em Luanda.",
    "seoKeywords": "auscultadores oraimo boompop, headphones bluetooth angola, fones de ouvido luanda, aqui tem angola"
  },
  {
    "id": "f18e3d33-95bf-4bfe-90bf-87969b094e32",
    "supabaseId": "f18e3d33-95bf-4bfe-90bf-87969b094e32",
    "name": "Carregador de Parede WiWU Fast Charger 45W",
    "slug": "carregador-de-parede-wiwu-fast-charger-45w",
    "sku": "WIWU-CH-45W-BLK",
    "brand": "WIWU",
    "category": "Acessórios & Tech",
    "stock": 15,
    "active": true,
    "price": 23000,
    "sale_price": 20125,
    "old_price": 23000,
    "rating": 4.8,
    "reviews_count": 18,
    "badge": "DUAL PORT",
    "image_url": "/products/carregador-gan.jpg",
    "image": "/products/carregador-gan.jpg",
    "images": [
      "/products/carregador-gan.jpg"
    ],
    "description": "Carregador rápido WiWU de 45W com portas duplas USB-C e USB-A, ideal para carregar rapidamente smartphones modernos e tablets com proteção total contra sobrecarga.",
    "highlights": [
      "Potência de 45W Power Delivery",
      "Duas portas: USB-C e USB-A",
      "Compatível com iPhone, Samsung e tablets"
    ],
    "features": [
      "Proteção inteligente contra sobreaquecimento",
      "Compacto para viagens"
    ],
    "specifications": {
      "Potência": "45W",
      "Saídas": "1x USB-C PD, 1x USB-A QC"
    },
    "packageContent": [
      "1 Carregador WiWU 45W",
      "1 Manual"
    ],
    "seoTitle": "Carregador de Parede WiWU Fast Charger 45W GaN Dual Port | AQUI TEM ANGOLA",
    "seoDescription": "Carregador rápido WiWU 45W com portas USB-C e USB-A na AQUI TEM Angola. Potência ideal para iPhone, Samsung e tablets com entrega rápida em Luanda.",
    "seoKeywords": "carregador wiwu 45w angola, carregador tipo c luanda, aqui tem angola"
  },
  {
    "id": "ce68593d-3752-4dff-99a3-d28b4237d6a2",
    "supabaseId": "ce68593d-3752-4dff-99a3-d28b4237d6a2",
    "name": "Oraimo OpenSnap Air OPN-371",
    "slug": "oraimo-opensnap-air-opn-371",
    "sku": "OPN371-BLK",
    "brand": "Oraimo",
    "category": "Áudio & Som",
    "stock": 10,
    "active": true,
    "price": 29500,
    "sale_price": 25875,
    "old_price": 29500,
    "rating": 4.8,
    "reviews_count": 15,
    "badge": "OPEN-EAR",
    "image_url": "/product_opensnap.jpg",
    "image": "/product_opensnap.jpg",
    "images": [
      "/product_opensnap.jpg"
    ],
    "description": "Fones de ouvido abertos Oraimo OpenSnap Air com condução de ar que permitem ouvir música sem tapar o canal auditivo, ideais para segurança e desporto na rua.",
    "highlights": [
      "Design Open-Ear seguro para desporto ao ar livre",
      "Som panorâmico de alta fidelidade",
      "Conforto ergonómico sem pressão nos ouvidos"
    ],
    "features": [
      "Resistência IPX4 a suor",
      "Autonomia prolongada"
    ],
    "specifications": {
      "Bluetooth": "V5.3",
      "Tipo": "Open-Ear"
    },
    "packageContent": [
      "1 Par de fones OpenSnap",
      "1 Estojo",
      "1 Cabo USB"
    ],
    "seoTitle": "Fones de Ouvido Abertos Oraimo OpenSnap Air OPN-371 | AQUI TEM ANGOLA",
    "seoDescription": "Fones de ouvido abertos Oraimo OpenSnap Air OPN-371 com som panorâmico e máximo conforto na AQUI TEM Angola. Ideal para desporto e dia a dia em Luanda.",
    "seoKeywords": "oraimo opensnap angola, fones de ouvido abertos luanda, aqui tem angola"
  },
  {
    "id": "9f9c71ca-5614-4385-8175-5e2e303a8709",
    "supabaseId": "9f9c71ca-5614-4385-8175-5e2e303a8709",
    "name": "Oraimo SpaceBuds Lite OTW-324",
    "slug": "oraimo-spacebuds-lite-otw-324",
    "sku": "OTW324-BLK",
    "brand": "Oraimo",
    "category": "Áudio & Som",
    "stock": 12,
    "active": true,
    "price": 20000,
    "sale_price": 17750,
    "old_price": 20000,
    "rating": 4.8,
    "reviews_count": 19,
    "badge": "FUTURISTA",
    "image_url": "/products/fones-tws-bluetooth.jpg",
    "image": "/products/fones-tws-bluetooth.jpg",
    "images": [
      "/products/fones-tws-bluetooth.jpg"
    ],
    "description": "Fones TWS Bluetooth Oraimo SpaceBuds Lite com design espacial transparente moderno, graves potentes e chamadas limpas com redução de ruído.",
    "highlights": [
      "Design semi-transparente futurista",
      "Graves HavyBass potentes",
      "36 horas de bateria"
    ],
    "features": [
      "Microfone HD",
      "Controles de toque"
    ],
    "specifications": {
      "Bluetooth": "V5.3",
      "Bateria": "Até 36h"
    },
    "packageContent": [
      "1 Fones SpaceBuds",
      "1 Estojo",
      "1 Cabo USB"
    ],
    "seoTitle": "Fones Bluetooth Oraimo SpaceBuds Lite OTW-324 | AQUI TEM ANGOLA",
    "seoDescription": "Oraimo SpaceBuds Lite OTW-324 com design moderno, graves envolventes e bateria de longa duração na AQUI TEM Angola. 100% original com garantia e entrega rápida.",
    "seoKeywords": "spacebuds lite oraimo angola, fones transparentes luanda, aqui tem angola"
  },
  {
    "id": "8cfe6239-ef53-47d2-bd1d-8a849ab9e38d",
    "supabaseId": "8cfe6239-ef53-47d2-bd1d-8a849ab9e38d",
    "name": "Oraimo Necklace Lite",
    "slug": "oraimo-necklace-lite",
    "sku": "ORAIMO-OEB311-GOLD",
    "brand": "Oraimo",
    "category": "Áudio & Som",
    "stock": 14,
    "active": true,
    "price": 22000,
    "sale_price": 19000,
    "old_price": 22000,
    "rating": 4.8,
    "reviews_count": 22,
    "badge": "NECKBAND",
    "image_url": "/products/fones-tws-bluetooth.jpg",
    "image": "/products/fones-tws-bluetooth.jpg",
    "images": [
      "/products/fones-tws-bluetooth.jpg"
    ],
    "description": "Fones de ouvido neckband com suporte de pescoço Oraimo Necklace Lite. Até 30 horas de autonomia contínua, graves HavyBass e vibração para chamadas recebidas.",
    "highlights": [
      "30 horas de autonomia de reprodução",
      "Alerta vibratório no pescoço para chamadas",
      "Ponteiras magnéticas"
    ],
    "features": [
      "Encaixe seguro no pescoço",
      "Carregamento rápido"
    ],
    "specifications": {
      "Bluetooth": "V5.3",
      "Bateria": "30h"
    },
    "packageContent": [
      "1 Fones Necklace Lite",
      "1 Cabo USB",
      "1 Manual"
    ],
    "seoTitle": "Auscultadores de Pescoço Oraimo Necklace Lite OEB-E311 | AQUI TEM ANGOLA",
    "seoDescription": "Oraimo Necklace Lite OEB-E311 com autonomia até 30 horas, vibração de chamadas e graves profundos na AQUI TEM Angola. Compre com entrega rápida em Luanda.",
    "seoKeywords": "oraimo necklace lite angola, fones de pescoco luanda, aqui tem angola"
  },
  {
    "id": "46e7034d-6a7f-41de-a4d8-e883040645a4",
    "supabaseId": "46e7034d-6a7f-41de-a4d8-e883040645a4",
    "name": "X-WATCH PRISMA — Smartwatch 1.4\"",
    "slug": "x-watch-prisma-smartwatch-1",
    "sku": "AT-XW-PRISMA",
    "brand": "X-Watch",
    "category": "Smartwatches",
    "stock": 8,
    "active": true,
    "price": 26500,
    "sale_price": 22750,
    "old_price": 26500,
    "rating": 4.8,
    "reviews_count": 14,
    "badge": "COMPACTO",
    "image_url": "/products/smartwatch.jpg",
    "image": "/products/smartwatch.jpg",
    "images": [
      "/products/smartwatch.jpg"
    ],
    "description": "Smartwatch X-Watch Prisma com ecrã de 1.4 polegadas, design moderno curvo, monitorização de passos, batimentos cardíacos e notificações de mensagens no pulso.",
    "highlights": [
      "Design curvo elegante",
      "Monitor de passos e frequência cardíaca",
      "Notificações do telemóvel"
    ],
    "features": [
      "Leve e confortável",
      "Bateria até 5 dias"
    ],
    "specifications": {
      "Ecrã": "1.4 polegadas",
      "Conectividade": "Bluetooth"
    },
    "packageContent": [
      "1 Smartwatch X-Watch Prisma",
      "1 Cabo de carregamento",
      "1 Manual"
    ],
    "seoTitle": "Smartwatch X-Watch Prisma com Chamadas Bluetooth | AQUI TEM ANGOLA",
    "seoDescription": "Compre o relógio inteligente X-Watch Prisma com preço super competitivo em Angola na AQUI TEM. Chamadas Bluetooth, monitor de saúde e entrega rápida em Luanda.",
    "seoKeywords": "x-watch prisma angola, smartwatch economico luanda, aqui tem angola"
  },
  {
    "id": "d8f54944-7134-4d66-907e-4b134a091afc",
    "supabaseId": "d8f54944-7134-4d66-907e-4b134a091afc",
    "name": "X-WATCH SMARTWATCH — 1.8\" Bluetooth",
    "slug": "x-watch-smartwatch-18-bluetooth",
    "sku": "AT-XW-18",
    "brand": "X-Watch",
    "category": "Smartwatches",
    "stock": 8,
    "active": true,
    "price": 24500,
    "sale_price": 20875,
    "old_price": 24500,
    "rating": 4.8,
    "reviews_count": 16,
    "badge": "ECRÃ GRANDE",
    "image_url": "/products/smartwatch.jpg",
    "image": "/products/smartwatch.jpg",
    "images": [
      "/products/smartwatch.jpg"
    ],
    "description": "Smartwatch X-Watch com ecrã generoso de 1.8 polegadas, chamadas Bluetooth nítidas e monitorização diária de atividades físicas com bateria de longa duração.",
    "highlights": [
      "Ecrã amplo de 1.8 polegadas",
      "Chamadas telefónicas por Bluetooth",
      "Monitor de sono e passos"
    ],
    "features": [
      "Altifalante integrado",
      "Resistente ao suor"
    ],
    "specifications": {
      "Ecrã": "1.8 polegadas HD",
      "Conectividade": "Bluetooth"
    },
    "packageContent": [
      "1 Smartwatch X-Watch 1.8",
      "1 Cabo magnético",
      "1 Manual"
    ],
    "seoTitle": "Smartwatch X-Watch 1.8\" com Bluetooth e Notificações | AQUI TEM ANGOLA",
    "seoDescription": "Smartwatch X-Watch 1.8 polegadas com excelente relação qualidade-preço na AQUI TEM Angola. Faz chamadas Bluetooth e monitoriza desporto com entrega em Luanda.",
    "seoKeywords": "x-watch 1.8 angola, relogio bluetooth luanda, aqui tem angola"
  },
  {
    "id": "8a1e3b1c-7d6e-4f9a-8c2d-1b3a5f7e9d2b",
    "supabaseId": "8a1e3b1c-7d6e-4f9a-8c2d-1b3a5f7e9d2b",
    "name": "Rato Gaming Sem Fios Glorious Model O Wireless RGB",
    "slug": "rato-gaming-glorious-model-o-wireless",
    "slugAliases": [
      "rato-gaming-sem-fios-glorious-model-o-wireless-rgb",
      "glorious-model-o"
    ],
    "sku": "AT-GAM-011",
    "brand": "Glorious",
    "category": "Acessórios & Tech",
    "stock": 10,
    "active": true,
    "price": 48000,
    "sale_price": 40000,
    "old_price": 48000,
    "rating": 4.9,
    "reviews_count": 32,
    "badge": "GAMING",
    "image_url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    "image": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    "fallbackImage": "https://images.unsplash.com/photo-1527698266440-12104e498b76?auto=format&fit=crop&w=800&q=80",
    "description": "Rato gaming sem fios Glorious Model O Wireless RGB com sensor BAMF ultra preciso de 19.000 DPI, carcaça ultra leve tipo favo de mel (69g) e conexão sem fios sem latência de 2.4GHz.",
    "highlights": [
      "Ultra leve: apenas 69g para movimentos ultra rápidos",
      "Sensor BAMF de alta precisão 19.000 DPI",
      "Iluminação RGB expansiva e personalizável",
      "Autonomia de até 71 horas de jogo contínuo"
    ],
    "features": [
      "Deslizadores G-Skates de PTFE puro",
      "Cabo Ascend Paracord ultra flexível para carregamento durante o jogo"
    ],
    "specifications": {
      "Sensor": "BAMF 19000 DPI",
      "Peso": "69g",
      "Bateria": "Até 71h"
    },
    "packageContent": [
      "1 Rato Glorious Model O Wireless",
      "1 Receptor Nano USB 2.4GHz",
      "1 Cabo Ascend USB-C",
      "1 Adaptador extensor"
    ],
    "seoTitle": "Rato Gaming Sem Fios Glorious Model O Wireless RGB | AQUI TEM ANGOLA",
    "seoDescription": "Compre o Rato Gaming Sem Fios Glorious Model O Wireless RGB na AQUI TEM Angola. Sensor BAMF, ultra leve 69g e entrega rápida em Luanda."
  },
  {
    "id": "2c4e6f8a-0b2d-4f6a-8c0e-2d4f6a8c0e2d",
    "supabaseId": "2c4e6f8a-0b2d-4f6a-8c0e-2d4f6a8c0e2d",
    "name": "Teclado Bluetooth Sem Fios Kapbom",
    "slug": "teclado-bluetooth-kapbom",
    "slugAliases": [
      "teclado-bluetooth-sem-fios-kapbom"
    ],
    "sku": "AT-ACC-012",
    "brand": "Kapbom",
    "category": "Acessórios & Tech",
    "stock": 18,
    "active": true,
    "price": 22000,
    "sale_price": 17500,
    "old_price": 22000,
    "rating": 4.7,
    "reviews_count": 24,
    "badge": "SLIM",
    "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83dadc?auto=format&fit=crop&w=800&q=80",
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83dadc?auto=format&fit=crop&w=800&q=80",
    "fallbackImage": "https://images.unsplash.com/photo-1587829741301-dc798b83dadc?auto=format&fit=crop&w=800&q=80",
    "description": "Teclado Bluetooth Sem Fios Kapbom ultra fino, compacto e silencioso. Compatível com Android, iOS, Windows e Mac, ideal para tablets, smartphones e computadores.",
    "highlights": [
      "Conexão Bluetooth sem fios instantânea",
      "Teclas perfil baixo silenciosas",
      "Design ultra fino e fácil de transportar"
    ],
    "features": [
      "Bateria recarregável via USB",
      "Teclas de atalho multimédia"
    ],
    "specifications": {
      "Conectividade": "Bluetooth 3.0/5.0",
      "Alcance": "10 metros"
    },
    "packageContent": [
      "1 Teclado Bluetooth Kapbom",
      "1 Cabo de carregamento USB",
      "1 Manual"
    ],
    "seoTitle": "Teclado Bluetooth Sem Fios Kapbom | AQUI TEM ANGOLA",
    "seoDescription": "Teclado Bluetooth Sem Fios Kapbom ultra fino e silencioso para tablets e portáteis na AQUI TEM Angola. Entrega rápida em Luanda."
  },
  {
    "id": "f4a6e8c0-2d4f-6a8c-0e2d-4f6a8c0e2d4f",
    "supabaseId": "f4a6e8c0-2d4f-6a8c-0e2d-4f6a8c0e2d4f",
    "name": "Oraimo Smart Mouse P Sem Fios",
    "slug": "oraimo-smart-mouse-p",
    "slugAliases": [
      "oraimo-smart-mouse-p-sem-fios"
    ],
    "sku": "AT-ACC-013",
    "brand": "Oraimo",
    "category": "Acessórios & Tech",
    "stock": 22,
    "active": true,
    "price": 19000,
    "sale_price": 15000,
    "old_price": 19000,
    "rating": 4.8,
    "reviews_count": 29,
    "badge": "SILENCIOSO",
    "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    "fallbackImage": "https://images.unsplash.com/photo-1527698266440-12104e498b76?auto=format&fit=crop&w=800&q=80",
    "description": "Rato sem fios Oraimo Smart Mouse P com tecnologia de clique silencioso de 90%, sensor óptico de alta resolução de 1600 DPI e design ergonómico para destros e esquerdinos.",
    "highlights": [
      "Cliques 90% mais silenciosos",
      "Sensor óptico preciso de 1600 DPI",
      "Modo de poupança inteligente de energia"
    ],
    "features": [
      "Receptor Nano USB Plug & Play",
      "Textura fosca suave que previne marcas"
    ],
    "specifications": {
      "DPI": "1600",
      "Conexão": "2.4GHz Sem Fios"
    },
    "packageContent": [
      "1 Oraimo Smart Mouse P",
      "1 Receptor Nano USB",
      "1 Pilha AA"
    ],
    "seoTitle": "Oraimo Smart Mouse P Sem Fios Silencioso | AQUI TEM ANGOLA",
    "seoDescription": "Compre o Rato Sem Fios Oraimo Smart Mouse P com cliques silenciosos na AQUI TEM Angola. Entrega rápida em Luanda."
  },
  {
    "id": "a8c0e2d4-f6a8-c0e2-d4f6-a8c0e2d4f6a8",
    "supabaseId": "a8c0e2d4-f6a8-c0e2-d4f6-a8c0e2d4f6a8",
    "name": "Webcam Full HD Kapbom 1080p USB com Microfone",
    "slug": "webcam-full-hd-kapbom-1080p",
    "slugAliases": [
      "webcam-full-hd-kapbom-1080p-usb"
    ],
    "sku": "AT-ACC-014",
    "brand": "Kapbom",
    "category": "Acessórios & Tech",
    "stock": 14,
    "active": true,
    "price": 42000,
    "sale_price": 35000,
    "old_price": 42000,
    "rating": 4.6,
    "reviews_count": 19,
    "badge": "FULL HD",
    "image_url": "https://images.unsplash.com/photo-1588600102111-73602492160d?auto=format&fit=crop&w=800&q=80",
    "image": "https://images.unsplash.com/photo-1588600102111-73602492160d?auto=format&fit=crop&w=800&q=80",
    "fallbackImage": "https://images.unsplash.com/photo-1588600102111-73602492160d?auto=format&fit=crop&w=800&q=80",
    "description": "Webcam Full HD Kapbom 1080p USB com microfone duplo com redução de ruído, correção automática de luz fraca e clipe universal flexível para monitores e portáteis.",
    "highlights": [
      "Vídeo cristalino Full HD 1080p a 30fps",
      "Microfone estéreo com cancelamento de ruído",
      "Instalação automática Plug and Play via USB"
    ],
    "features": [
      "Ajuste automático de brilho e contraste",
      "Rotação de 360 graus"
    ],
    "specifications": {
      "Resolução": "1920x1080 Full HD",
      "Interface": "USB 2.0"
    },
    "packageContent": [
      "1 Webcam Kapbom 1080p USB",
      "1 Manual do utilizador"
    ],
    "seoTitle": "Webcam Full HD Kapbom 1080p USB | AQUI TEM ANGOLA",
    "seoDescription": "Webcam Full HD Kapbom 1080p com microfone integrado para videochamadas e aulas online na AQUI TEM Angola."
  },
  {
    "id": "e2d4f6a8-c0e2-d4f6-a8c0-e2d4f6a8c0e2",
    "supabaseId": "e2d4f6a8-c0e2-d4f6-a8c0-e2d4f6a8c0e2",
    "name": "Kit de Microfones Sem Fio Lapela — Duplo",
    "slug": "kit-microfones-sem-fio-duplo",
    "slugAliases": [
      "kit-de-microfones-sem-fio-duplo"
    ],
    "sku": "AT-ACC-015",
    "brand": "K8 / Kapbom",
    "category": "Áudio & Som",
    "stock": 15,
    "active": true,
    "price": 31000,
    "sale_price": 25000,
    "old_price": 31000,
    "rating": 4.9,
    "reviews_count": 41,
    "badge": "GRAVAÇÃO PRO",
    "image_url": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    "image": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    "fallbackImage": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    "description": "Kit de 2 Microfones Lapela Sem Fio com conector Type-C / Lightning para telemóveis. Captura omnidirecional de 360° com cancelamento inteligente de ruído para vídeos e entrevistas.",
    "highlights": [
      "2 Microfones transmissores incluídos no kit",
      "Redução inteligente de ruído exterior de fundo",
      "Conexão automática instantânea sem necessidade de app"
    ],
    "features": [
      "Alcance até 20 metros sem barreiras",
      "Autonomia de até 6 horas de gravação contínua"
    ],
    "specifications": {
      "Frequência": "2.4GHz",
      "Conexão": "USB-C / Lightning"
    },
    "packageContent": [
      "2 Transmissores Microfone Lapela",
      "1 Receptor para Telemóvel",
      "1 Cabo de carregamento USB"
    ],
    "seoTitle": "Kit de Microfones Sem Fio Lapela Duplo | AQUI TEM ANGOLA",
    "seoDescription": "Kit de Microfones Sem Fio Duplo para entrevistas e gravações no telemóvel na AQUI TEM Angola. Entrega rápida."
  },
  {
    "id": "6a8c0e2d-4f6a-8c0e-2d4f-6a8c0e2d4f6a",
    "supabaseId": "6a8c0e2d-4f6a-8c0e-2d4f-6a8c0e2d4f6a",
    "name": "Cabo Oraimo MagCable USB-C para Lightning — 1m",
    "slug": "cabo-oraimo-magcable-usb-c-lightning",
    "slugAliases": [
      "cabo-oraimo-magcable-usb-c-para-lightning-1m"
    ],
    "sku": "AT-ACC-016",
    "brand": "Oraimo",
    "category": "Acessórios & Tech",
    "stock": 30,
    "active": true,
    "price": 16000,
    "sale_price": 12500,
    "old_price": 16000,
    "rating": 4.9,
    "reviews_count": 55,
    "badge": "MAGNÉTICO",
    "image_url": "https://images.unsplash.com/photo-1619190163414-04144b679116?auto=format&fit=crop&w=800&q=80",
    "image": "https://images.unsplash.com/photo-1619190163414-04144b679116?auto=format&fit=crop&w=800&q=80",
    "fallbackImage": "https://images.unsplash.com/photo-1619190163414-04144b679116?auto=format&fit=crop&w=800&q=80",
    "description": "Cabo Oraimo MagCable USB-C para Lightning 1m com conector magnético removível e suporte a carregamento rápido Power Delivery PD 20W para iPhone e iPad.",
    "highlights": [
      "Conector magnético destacável com atração forte",
      "Carregamento PD 20W ultra rápido",
      "Revestimento em nylon trançado anti-dobra"
    ],
    "features": [
      "Luz LED indicadora de carregamento",
      "Transferência de dados a 480Mbps"
    ],
    "specifications": {
      "Comprimento": "1 Metro",
      "Potência": "20W PD"
    },
    "packageContent": [
      "1 Cabo MagCable Oraimo 1m",
      "1 Conector magnético Lightning"
    ],
    "seoTitle": "Cabo Oraimo MagCable USB-C para Lightning 1m | AQUI TEM ANGOLA",
    "seoDescription": "Cabo magnético rápido Oraimo MagCable USB-C para Lightning 1m para iPhone na AQUI TEM Angola."
  },
  {
    "id": "0e2d4f6a-8c0e-2d4f-6a8c-0e2d4f6a8c0e",
    "supabaseId": "0e2d4f6a-8c0e-2d4f-6a8c-0e2d4f6a8c0e",
    "name": "Cabo USB-A para USB-C Oraimo DuraLine 3 — 1m",
    "slug": "cabo-oraimo-duraline-3-usb-a-c",
    "slugAliases": [
      "cabo-usb-a-para-usb-c-oraimo-duraline-3-1m"
    ],
    "sku": "AT-ACC-017",
    "brand": "Oraimo",
    "category": "Acessórios & Tech",
    "stock": 35,
    "active": true,
    "price": 15000,
    "sale_price": 11250,
    "old_price": 15000,
    "rating": 4.8,
    "reviews_count": 62,
    "badge": "ULTRA RESISTENTE",
    "image_url": "https://images.unsplash.com/photo-1619190163414-04144b679116?auto=format&fit=crop&w=800&q=80",
    "image": "https://images.unsplash.com/photo-1619190163414-04144b679116?auto=format&fit=crop&w=800&q=80",
    "fallbackImage": "https://images.unsplash.com/photo-1619190163414-04144b679116?auto=format&fit=crop&w=800&q=80",
    "description": "Cabo de carregamento rápido e sincronização USB-A para USB-C Oraimo DuraLine 3. Construído com fibra de Kevlar à prova de dobras, testado em mais de 25.000 dobras.",
    "highlights": [
      "Suporta carregamento rápido de até 3A",
      "Reforçado com fibra de Kevlar ultra durável",
      "Comprimento perfeito de 1 metro"
    ],
    "features": [
      "Juntas de borracha flexíveis anti-quebra",
      "Compatibilidade universal USB-C"
    ],
    "specifications": {
      "Corrente": "3A Max",
      "Comprimento": "1 Metro"
    },
    "packageContent": [
      "1 Cabo Oraimo DuraLine 3 USB-C 1m"
    ],
    "seoTitle": "Cabo USB-A para USB-C Oraimo DuraLine 3 1m | AQUI TEM ANGOLA",
    "seoDescription": "Cabo ultra resistente Oraimo DuraLine 3 USB-A para USB-C 1m na AQUI TEM Angola."
  },
  {
    "id": "4f6a8c0e-2d4f-6a8c-0e2d-4f6a8c0e2d4f",
    "supabaseId": "4f6a8c0e-2d4f-6a8c-0e2d-4f6a8c0e2d4f",
    "name": "Rato Sem Fios Oraimo Smart Mouse F 1200 DPI",
    "slug": "oraimo-smart-mouse-f-wireless",
    "slugAliases": [
      "rato-sem-fios-oraimo-smart-mouse-f-1200-dpi"
    ],
    "sku": "AT-ACC-018",
    "brand": "Oraimo",
    "category": "Acessórios & Tech",
    "stock": 25,
    "active": true,
    "price": 18000,
    "sale_price": 13750,
    "old_price": 18000,
    "rating": 4.7,
    "reviews_count": 20,
    "badge": "PORTÁTIL",
    "image_url": "https://images.unsplash.com/photo-1527698266440-12104e498b76?auto=format&fit=crop&w=800&q=80",
    "image": "https://images.unsplash.com/photo-1527698266440-12104e498b76?auto=format&fit=crop&w=800&q=80",
    "fallbackImage": "https://images.unsplash.com/photo-1527698266440-12104e498b76?auto=format&fit=crop&w=800&q=80",
    "description": "Rato sem fios ergonómico Oraimo Smart Mouse F com sensor óptico de 1200 DPI, ligação estável 2.4GHz sem fios até 10 metros e pilhas de longa duração.",
    "highlights": [
      "Design ergonómico antiderrapante",
      "Sensor óptico preciso 1200 DPI",
      "Plug & Play automático sem drivers"
    ],
    "features": [
      "Compartimento interno para guardar o receptor USB",
      "Desligamento automático inteligente"
    ],
    "specifications": {
      "DPI": "1200",
      "Conexão": "2.4GHz USB"
    },
    "packageContent": [
      "1 Oraimo Smart Mouse F",
      "1 Receptor USB Nano"
    ],
    "seoTitle": "Rato Sem Fios Oraimo Smart Mouse F 1200 DPI | AQUI TEM ANGOLA",
    "seoDescription": "Rato sem fios Oraimo Smart Mouse F 1200 DPI na AQUI TEM Angola. Confortável e econômico."
  },
  {
    "id": "8c0e2d4f-6a8c-0e2d-4f6a-8c0e2d4f6a8c",
    "supabaseId": "8c0e2d4f-6a8c-0e2d-4f6a-8c0e2d4f6a8c",
    "name": "Hub USB-C Oraimo Smart 7 em 1 Multiportas HDMI e SD",
    "slug": "hub-usb-c-oraimo-smart-7-1",
    "slugAliases": [
      "hub-usb-c-oraimo-smart-7-em-1"
    ],
    "sku": "AT-ACC-019",
    "brand": "Oraimo",
    "category": "Acessórios & Tech",
    "stock": 16,
    "active": true,
    "price": 34000,
    "sale_price": 27500,
    "old_price": 34000,
    "rating": 4.9,
    "reviews_count": 38,
    "badge": "7 EM 1",
    "image_url": "https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&w=800&q=80",
    "image": "https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&w=800&q=80",
    "fallbackImage": "https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&w=800&q=80",
    "description": "Hub adaptador multiportas USB-C Oraimo Smart 7 em 1 com saída HDMI 4K UHD, 3x portas USB 3.0 de alta velocidade, leitores de cartão SD e TF e porta USB-C Power Delivery 100W.",
    "highlights": [
      "Saída de vídeo HDMI 4K a 30Hz para monitores e TVs",
      "3 Portas USB 3.0 super rápidas até 5Gbps",
      "Carregamento USB-C PD de alta potência até 100W"
    ],
    "features": [
      "Corpo em alumínio cinzento espacial com dissipação de calor eficiente",
      "Plug & Play compatível com Mac, Windows e iPad"
    ],
    "specifications": {
      "HDMI": "4K@30Hz",
      "USB": "3x USB 3.0",
      "Power Delivery": "100W PD"
    },
    "packageContent": [
      "1 Hub USB-C Oraimo 7 em 1",
      "1 Manual do utilizador"
    ],
    "seoTitle": "Hub USB-C Oraimo Smart 7 em 1 Multiportas | AQUI TEM ANGOLA",
    "seoDescription": "Hub USB-C Oraimo Smart 7 em 1 com saída HDMI 4K, leitor SD e portas USB 3.0 na AQUI TEM Angola."
  },
  {
    "id": "d4f6a8c0-e2d4-f6a8-c0e2-d4f6a8c0e2d4",
    "supabaseId": "d4f6a8c0-e2d4-f6a8-c0e2-d4f6a8c0e2d4",
    "name": "Suporte de Alumínio Articulado e Dobrável para Notebook",
    "slug": "suporte-aluminio-notebook-dobravel",
    "slugAliases": [
      "suporte-de-aluminio-articulado-e-dobravel-para-notebook"
    ],
    "sku": "AT-ACC-020",
    "brand": "ErgoTech",
    "category": "Acessórios & Tech",
    "stock": 20,
    "active": true,
    "price": 28000,
    "sale_price": 22500,
    "old_price": 28000,
    "rating": 4.8,
    "reviews_count": 45,
    "badge": "ERGONÓMICO",
    "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    "fallbackImage": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    "description": "Suporte ergonómico dobrável de liga de alumínio reforçada para portáteis de 10 a 17.3 polegadas. Ajustável em 6 ângulos de altura, previne dores no pescoço e melhora a ventilação do computador.",
    "highlights": [
      "Estrutura em liga de alumínio sólida e antiderrapante",
      "6 Níveis de ajuste de altura para ergonomia ideal",
      "Design aberto que melhora o arrefecimento do portátil em 40%"
    ],
    "features": [
      "Almofadas de silicone que protegem a carcaça do portátil contra riscos",
      "Totalmente dobrável e inclui bolsa de veludo para transporte"
    ],
    "specifications": {
      "Material": "Liga de Alumínio + Silicone",
      "Compatibilidade": "Notebooks de 10\" a 17.3\""
    },
    "packageContent": [
      "1 Suporte de Alumínio Dobrável",
      "1 Bolsa de veludo para transporte"
    ],
    "seoTitle": "Suporte de Alumínio Articulado e Dobrável para Notebook | AQUI TEM ANGOLA",
    "seoDescription": "Suporte ergonómico de alumínio dobrável para portátil na AQUI TEM Angola. Alivia dores no pescoço."
  },
  {
    "id": "1e2d3c4b-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
    "supabaseId": "1e2d3c4b-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
    "name": "Aparelho Tigre TV Box 4K Ultra HD Android",
    "slug": "aparelho-tigre-tv-box-4k",
    "slugAliases": [
      "aparelho-tigre-tv"
    ],
    "sku": "AT-TV-021",
    "brand": "Tigre TV",
    "category": "TV & Vídeo",
    "stock": 12,
    "active": true,
    "price": 55000,
    "sale_price": 45000,
    "old_price": 55000,
    "rating": 4.9,
    "reviews_count": 76,
    "badge": "OFICIAL 4K",
    "image_url": "https://images.unsplash.com/photo-1593359677771-48288b3941a3?auto=format&fit=crop&w=800&q=80",
    "image": "https://images.unsplash.com/photo-1593359677771-48288b3941a3?auto=format&fit=crop&w=800&q=80",
    "fallbackImage": "https://images.unsplash.com/photo-1593359677771-48288b3941a3?auto=format&fit=crop&w=800&q=80",
    "description": "O Aparelho Tigre TV Box 4K Ultra HD transforma qualquer televisão comum em uma Smart TV de alta performance em Angola. Com sistema Android fluido, Wi-Fi Dual Band de alta velocidade, processador quad-core e suporte para reprodução de conteúdos em resolução 4K Ultra HD com cores vivas e sem travamentos. Acompanha comando remoto intuitivo, porta HDMI e suporte para todos os principais aplicativos de streaming.",
    "highlights": [
      "Resolução de imagem 4K Ultra HD nítida e fluida",
      "Sistema Android rápido com loja de aplicativos",
      "Ligação Wi-Fi Dual Band 2.4GHz / 5GHz + porta de rede Ethernet RJ45",
      "Processador Quad-Core com resposta rápida sem travamentos",
      "Transforma qualquer TV comum com porta HDMI em Smart TV"
    ],
    "features": [
      "Portas USB para pen drives e discos externos",
      "Saída de áudio óptico SPDIF e AV",
      "Design compacto e moderno"
    ],
    "specifications": {
      "Resolução": "4K Ultra HD (3840 x 2160)",
      "Sistema": "Android",
      "Conectividade": "Wi-Fi Dual Band (2.4G/5G) + Ethernet RJ45",
      "Processador": "Quad-Core High Performance",
      "Entradas": "HDMI, 2x USB, Slot MicroSD, AV, RJ45"
    },
    "packageContent": [
      "1 Aparelho Tigre TV Box 4K",
      "1 Comando remoto infravermelho",
      "1 Cabo HDMI de alta velocidade",
      "1 Fonte de alimentação Bivolt",
      "1 Manual do utilizador em português"
    ],
    "seoTitle": "Aparelho Tigre TV Box 4K Ultra HD Android | AQUI TEM ANGOLA",
    "seoDescription": "Compre o Aparelho Tigre TV Box 4K Ultra HD com Android na AQUI TEM Angola. Canais e filmes em alta definição com entrega rápida em Luanda.",
    "seoKeywords": "aparelho tigre tv angola, tigre tv box 4k luanda, receptor tigre tv angola, smart tv box luanda, aqui tem angola"
  },
  {
    "id": "c1a7877b-a7f2-43d3-8dfe-b776b0c90075",
    "supabaseId": "c1a7877b-a7f2-43d3-8dfe-b776b0c90075",
    "created_at": "2026-10-29T15:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Auscultadores Bluetooth Sem Fio Philips TAH1108 com Microfone",
    "slug": "auscultadores-bluetooth-sem-fio-philips-tah1108",
    "slugAliases": [
      "headphone-philips-tah1108",
      "auscultadores-philips-bluetooth"
    ],
    "sku": "AT-PHI-TAH1108",
    "brand": "Philips",
    "category": "Áudio & Som",
    "stock": 15,
    "active": true,
    "price": 36000,
    "sale_price": 30000,
    "old_price": 36000,
    "rating": 4.9,
    "reviews_count": 42,
    "badge": "ORIGINAL PHILIPS",
    "image_url": "https://images.philips.com/is/image/philipsconsumer/7877ba7f23d34dfeb776b0c90075f902?$pnglarge$&wid=960",
    "image": "https://images.philips.com/is/image/philipsconsumer/7877ba7f23d34dfeb776b0c90075f902?$pnglarge$&wid=960",
    "fallbackImage": "https://images.philips.com/is/image/philipsconsumer/7877ba7f23d34dfeb776b0c90075f902?$pnglarge$&wid=960",
    "images": [
      "https://images.philips.com/is/image/philipsconsumer/7877ba7f23d34dfeb776b0c90075f902?$pnglarge$&wid=960"
    ],
    "description": "Os Auscultadores Bluetooth Sem Fio Philips TAH1108 oferecem qualidade sonora autêntica Philips com drivers acústicos de neodímio de 30mm, graves encorpados e isolamento acústico confortável. Com autonomia de até 15 horas de reprodução contínua, almofadas auriculares acolchoadas ultra macias e design dobrável compacto, são ideais para trabalho, estudo, viagens e lazer em Angola.",
    "highlights": [
      "Drivers acústicos de 30mm para som limpo e graves potentes",
      "Até 15 horas de reprodução contínua com carregamento rápido",
      "Almofadas auriculares macias e haste ajustável ultra leve",
      "Microfone integrado para chamadas telefónicas nítidas em mãos-livres",
      "Design dobrável plano e compacto que cabe facilmente na mochila"
    ],
    "features": [
      "Conexão Bluetooth 5.2 estável até 10 metros",
      "Botões integrados na concha para controle de música e chamadas"
    ],
    "specifications": {
      "Marca": "Philips (Modelo TAH1108BK/00)",
      "Drivers": "30 mm Neodímio",
      "Bluetooth": "V5.2",
      "Autonomia": "Até 15 horas",
      "Tempo de Carga": "2 horas via USB-C"
    },
    "packageContent": [
      "1 Auscultadores Bluetooth Philips TAH1108 Original",
      "1 Cabo de carregamento USB-C",
      "1 Guia rápido e certificado de garantia"
    ],
    "seoTitle": "Auscultadores Bluetooth Sem Fio Philips TAH1108 Original | AQUI TEM ANGOLA",
    "seoDescription": "Compre os Auscultadores Bluetooth Sem Fio Philips TAH1108 originais com graves potentes, almofadas macias e 15h de bateria na AQUI TEM Angola."
  },
  {
    "id": "c2b8988c-b8e3-44e4-9ef0-c887c1da1186",
    "supabaseId": "c2b8988c-b8e3-44e4-9ef0-c887c1da1186",
    "created_at": "2026-10-29T15:05:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Fones Bluetooth TWS A9 Pro com Ecrã Touch Inteligente LCD e ANC",
    "slug": "fones-bluetooth-tws-a9-pro-ecra-touch-anc",
    "slugAliases": [
      "fone-tws-a9-pro-tela-touch",
      "fones-com-ecra-touch-lcd"
    ],
    "sku": "AT-TWS-A9PRO",
    "brand": "Smart Audio Pro",
    "category": "Áudio & Som",
    "stock": 20,
    "active": true,
    "price": 22000,
    "sale_price": 17500,
    "old_price": 22000,
    "rating": 4.9,
    "reviews_count": 58,
    "badge": "ECRÃ TOUCH LCD",
    "image_url": "/products/fones-a9-pro-touch.png",
    "image": "/products/fones-a9-pro-touch.png",
    "fallbackImage": "https://tse3.mm.bing.net/th/id/OIP.Il4yvZk9VfklTeD3Um-UmQHaJ2?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    "images": [
      "/products/fones-a9-pro-touch.png",
      "https://tse3.mm.bing.net/th/id/OIP.Il4yvZk9VfklTeD3Um-UmQHaJ2?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
    ],
    "description": "Os Fones Bluetooth TWS A9 Pro revolucionam a experiência de áudio sem fios com o seu estojo inteligente equipado com Ecrã Touch LCD a cores. Controle músicas, volume, equalizador, modos de Cancelamento Ativo de Ruído (ANC) e Modo Transparência, temporizador e localizador dos fones diretamente na tela do estojo sem precisar tocar no telemóvel.",
    "highlights": [
      "Ecrã Touch LCD colorido inteligente integrado no estojo de carga",
      "Cancelamento Ativo de Ruído (ANC) + Redução de Ruído em Chamadas (ENC)",
      "Bluetooth 5.4 de última geração com conexão instantânea e zero atraso",
      "Controlo direto no ecrã: músicas, volume, equalizador, lanterna e câmara",
      "Autonomia total de até 32 horas com carregamento rápido USB Tipo-C"
    ],
    "features": [
      "Papéis de parede personalizáveis no ecrã do estojo",
      "Função 'Encontrar Fones' com emissão de som localizador"
    ],
    "specifications": {
      "Modelo": "A9 Pro ANC Smart Touch",
      "Versão Bluetooth": "V5.4",
      "Cancelamento de Ruído": "ANC Ativo + ENC Duplo Microfone",
      "Ecrã do Estojo": "Display Touch LCD Colorido",
      "Porta de Carga": "USB Tipo-C"
    },
    "packageContent": [
      "1 Par de Fones TWS A9 Pro ANC",
      "1 Estojo com Ecrã Touch LCD Inteligente",
      "1 Cabo de carregamento USB Tipo-C",
      "3 Pares de ponteiras de silicone (P, M, G)",
      "1 Manual do utilizador"
    ],
    "seoTitle": "Fones Bluetooth TWS A9 Pro com Ecrã Touch LCD e Cancelamento de Ruído ANC | AQUI TEM ANGOLA",
    "seoDescription": "Fones sem fios TWS A9 Pro com estojo inteligente de ecrã touch colorido LCD, cancelamento ativo de ruído ANC e Bluetooth 5.4 na AQUI TEM Angola."
  },
  {
    "id": "c3c9099d-c9f4-45f5-af01-d998d2eb2297",
    "supabaseId": "c3c9099d-c9f4-45f5-af01-d998d2eb2297",
    "created_at": "2026-10-29T15:10:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Fones de Ouvido Bluetooth TWS Philips TAT1207 True Wireless IPX4",
    "slug": "fones-bluetooth-tws-philips-tat1207-ipx4",
    "slugAliases": [
      "fone-philips-tat1207",
      "fones-tws-philips-tat1207"
    ],
    "sku": "AT-PHI-TAT1207",
    "brand": "Philips",
    "category": "Áudio & Som",
    "stock": 16,
    "active": true,
    "price": 33000,
    "sale_price": 27500,
    "old_price": 33000,
    "rating": 4.9,
    "reviews_count": 37,
    "badge": "PHILIPS TWS",
    "image_url": "https://static.hayapek.com.br/produtos/80054/2000/1.jpg",
    "image": "https://static.hayapek.com.br/produtos/80054/2000/1.jpg",
    "fallbackImage": "https://static.hayapek.com.br/produtos/80054/2000/1.jpg",
    "images": [
      "https://static.hayapek.com.br/produtos/80054/2000/1.jpg"
    ],
    "description": "Os Fones de Ouvido True Wireless Philips TAT1207 combinam som rico e nítido com um design ergonómico super compacto que se adapta com firmeza ao ouvido. Com proteção IPX4 contra respingos de água e suor, até 18 horas de reprodução total com o estojo de bolso e modo mono para chamadas, são perfeitos para o dia a dia e desporto em Luanda.",
    "highlights": [
      "Qualidade de som original Philips com drivers de neodímio de 6mm",
      "Até 18 horas de autonomia combinada (6h nos fones + 12h no estojo)",
      "Certificação IPX4 resistente a suor e salpicos de água",
      "Encaixe intra-auricular ergonómico seguro e ultraleve",
      "Modo Mono: utilize qualquer um dos fones individualmente em chamadas"
    ],
    "features": [
      "Emparelhamento automático inteligente ao abrir o estojo",
      "Controles integrados para música, chamadas e assistente de voz"
    ],
    "specifications": {
      "Marca": "Philips (Modelo TAT1207BK/00)",
      "Bluetooth": "V5.2",
      "Proteção contra Água": "IPX4",
      "Autonomia Total": "Até 18 horas",
      "Carregamento": "USB Tipo-C"
    },
    "packageContent": [
      "1 Par de Fones TWS Philips TAT1207 Original",
      "1 Estojo de carregamento compacto",
      "1 Cabo de carregamento USB-C",
      "3 Pares de ponteiras auriculares de silicone",
      "1 Manual e garantia oficial"
    ],
    "seoTitle": "Fones Bluetooth TWS Philips TAT1207 True Wireless IPX4 Original | AQUI TEM ANGOLA",
    "seoDescription": "Compre os Fones de Ouvido Bluetooth TWS Philips TAT1207 originais com proteção IPX4, 18h de bateria e som cristalino na AQUI TEM Angola."
  },
  {
    "id": "d1a1001a-1111-4001-a001-000000000038",
    "supabaseId": "d1a1001a-1111-4001-a001-000000000038",
    "created_at": "2026-11-09T17:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Suporte de Mesa Articulado e Dobrável para Telemóvel e Tablet",
    "slug": "suporte-mesa-articulado-dobravel-telemovel-tablet",
    "slugAliases": [
      "suporte-telemovel-mesa",
      "suporte-celular-dobravel"
    ],
    "sku": "AT-ACC-STAND-DESK",
    "brand": "ErgoStand",
    "category": "Acessórios & Tech",
    "stock": 35,
    "active": true,
    "price": 20000,
    "sale_price": 16500,
    "old_price": 20000,
    "rating": 4.8,
    "reviews_count": 52,
    "badge": "ERGONÓMICO",
    "image_url": "/products/suporte-mesa-telemovel.jpg",
    "image": "/products/suporte-mesa-telemovel.jpg",
    "fallbackImage": "https://cdn1.ozone.ru/s3/multimedia-1-c/c600/6959844552.jpg",
    "images": [
      "/products/suporte-mesa-telemovel.jpg",
      "https://cdn1.ozone.ru/s3/multimedia-1-c/c600/6959844552.jpg"
    ],
    "description": "Suporte de mesa articulado e dobrável compatível com telemóveis e tablets de todos os tamanhos. Possui ajuste multi-ângulo de inclinação e altura, base pesada com almofadas de silicone antiderrapante que previnem riscos e quedas, e design ultra compacto dobrável para levar no bolso ou mochila.",
    "highlights": [
      "Ajuste multi-ângulo ergonómico para postura correta",
      "Design dobrável ultra compacto e portátil",
      "Base reforçada e almofadas antiderrapantes em silicone",
      "Compatível com todos os smartphones e tablets até 11 polegadas",
      "Abertura inferior para carregar o telemóvel enquanto utiliza"
    ],
    "features": [
      "Estrutura em ABS resistente e liga de alumínio reforçada",
      "Rotação e inclinação suave de alta durabilidade"
    ],
    "specifications": {
      "Compatibilidade": "Smartphones e Tablets de 4 a 11 polegadas",
      "Material": "ABS Premium + Silicone Antiderrapante",
      "Ajuste": "Multi-ângulo articulado",
      "Peso": "Aprox. 180g"
    },
    "packageContent": [
      "1 Suporte de Mesa Articulado Dobrável",
      "1 Caixa de proteção e transporte"
    ],
    "seoTitle": "Suporte de Mesa Articulado e Dobrável para Telemóvel e Tablet | AQUI TEM ANGOLA",
    "seoDescription": "Suporte de mesa ergonómico e dobrável para telemóveis e tablets na AQUI TEM Angola. Ângulo ajustável e base antiderrapante com entrega rápida."
  },
  {
    "id": "d2a2002b-2222-4002-a002-000000000039",
    "supabaseId": "d2a2002b-2222-4002-a002-000000000039",
    "created_at": "2026-11-09T17:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Campainha Sem Fio Inteligente Wi-Fi com Câmera HD e Chime Sonoro",
    "slug": "campainha-sem-fio-inteligente-wifi-camera-chime",
    "slugAliases": [
      "campainha-wifi-camera",
      "smart-video-doorbell"
    ],
    "sku": "AT-CAM-DOORBELL-WIFI",
    "brand": "Tuya Smart",
    "category": "Acessórios & Casa",
    "stock": 20,
    "active": true,
    "price": 24000,
    "sale_price": 18400,
    "old_price": 24000,
    "rating": 4.9,
    "reviews_count": 38,
    "badge": "WI-FI HD",
    "image_url": "/products/campainha-wifi-camera.jpg",
    "image": "/products/campainha-wifi-camera.jpg",
    "fallbackImage": "https://m.media-amazon.com/images/I/415mveQYmIL._AC_SL1000_.jpg",
    "images": [
      "/products/campainha-wifi-camera.jpg",
      "https://m.media-amazon.com/images/I/415mveQYmIL._AC_SL1000_.jpg"
    ],
    "description": "Campainha inteligente sem fio Wi-Fi com câmera HD de alta resolução, áudio bidirecional em tempo real e visão noturna infravermelha. Receba notificações instantâneas no seu telemóvel quando alguém tocar à campainha e converse com as visitas através do aplicativo, esteja onde estiver. Acompanha chime sonoro para instalar no interior da residência.",
    "highlights": [
      "Vídeo HD com lente grande angular e visão noturna nítida",
      "Áudio bidirecional: converse com as visitas pelo smartphone",
      "Notificação e alerta em tempo real no aplicativo",
      "Inclui campainha interna sonora (Chime USB)",
      "Instalação sem fios rápida com fita 3M ou parafusos"
    ],
    "features": [
      "Compatível com redes Wi-Fi 2.4GHz",
      "Sensor de presença com detecção de movimento inteligente"
    ],
    "specifications": {
      "Resolução": "HD 720p / 1080p",
      "Conectividade": "Wi-Fi 2.4GHz",
      "Áudio": "Bidirecional com cancelamento de eco",
      "Visão Noturna": "Infravermelho até 5 metros",
      "Alimentação": "Bateria recarregável de longa duração"
    },
    "packageContent": [
      "1 Campainha Inteligente Wi-Fi com Câmera",
      "1 Chime Sonoro Interno",
      "1 Cabo de Carregamento USB",
      "1 Kit de Fixação (Adesivo 3M + Parafusos)",
      "1 Manual de Instruções"
    ],
    "seoTitle": "Campainha Sem Fio Inteligente Wi-Fi com Câmera e Chime | AQUI TEM ANGOLA",
    "seoDescription": "Atenda à porta pelo telemóvel com a Campainha Inteligente Wi-Fi com câmera HD e visão noturna na AQUI TEM Angola. Segurança residencial com entrega em Luanda."
  },
  {
    "id": "d3a3003c-3333-4003-a003-000000000040",
    "supabaseId": "d3a3003c-3333-4003-a003-000000000040",
    "created_at": "2026-11-09T17:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Fechadura Digital Inteligente Biométrica com Ecrã Touch e Cartão RFID",
    "slug": "fechadura-digital-inteligente-biometrica-touch-rfid",
    "slugAliases": [
      "fechadura-digital-biometrica",
      "fechadura-inteligente-porta"
    ],
    "sku": "AT-SEC-SMART-LOCK",
    "brand": "Smart Security",
    "category": "Acessórios & Casa",
    "stock": 12,
    "active": true,
    "price": 85000,
    "sale_price": 70000,
    "old_price": 85000,
    "rating": 4.9,
    "reviews_count": 27,
    "badge": "SEGURANÇA BIOMÉTRICA",
    "image_url": "/products/fechadura-digital-biometrica.jpg",
    "image": "/products/fechadura-digital-biometrica.jpg",
    "fallbackImage": "https://cdn.awsli.com.br/2500x2500/436/436580/produto/171761348/8dfb0e2b9b.jpg",
    "images": [
      "/products/fechadura-digital-biometrica.jpg",
      "https://cdn.awsli.com.br/2500x2500/436/436580/produto/171761348/8dfb0e2b9b.jpg"
    ],
    "description": "Fechadura eletrónica biométrica de alta segurança com múltiplos métodos de acesso: leitor de impressão digital ultra rápido, teclado tátil com senha numérica, cartões de aproximação RFID e chave mecânica de emergência. Ideal para portas de madeira ou metal de residências, apartamentos e escritórios comerciais.",
    "highlights": [
      "4 Modos de Abertura: Biometria, Senha Numérica Touch, Cartão RFID e Chave Física",
      "Leitor biométrico semicondutor de 0.5s de alta precisão",
      "Teclado touch retroiluminado com função de senha anti-espião",
      "Travamento automático e alarme de violação",
      "Entrada micro-USB de emergência para bateria descarregada"
    ],
    "features": [
      "Capacidade para até 100 impressões digitais e 100 senhas/cartões",
      "Design premium em liga de alumínio escovado de alta resistência"
    ],
    "specifications": {
      "Espessura de Porta": "35mm a 55mm",
      "Alimentação": "4 Pilhas AA (baixo consumo)",
      "Autonomia": "Até 12 meses",
      "Material": "Liga de Zinco e Alumínio Reforçado"
    },
    "packageContent": [
      "1 Conjunto de Fechadura Digital (Painel Frontal e Traseiro)",
      "1 Mecanismo de Trava de Embutir",
      "2 Cartões de Proximidade RFID",
      "2 Chaves Mecânicas de Emergência",
      "1 Kit de Parafusos e Gabarito de Instalação",
      "1 Manual"
    ],
    "seoTitle": "Fechadura Digital Inteligente Biométrica Touch e Cartão RFID | AQUI TEM ANGOLA",
    "seoDescription": "Aumente a segurança do seu lar ou escritório com a Fechadura Digital Biométrica inteligente na AQUI TEM Angola. Abertura por impressão digital, senha e cartão."
  },
  {
    "id": "d4a4004d-4444-4004-a004-000000000041",
    "supabaseId": "d4a4004d-4444-4004-a004-000000000041",
    "created_at": "2026-11-09T17:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Luz Noturna LED com Sensor de Movimento PIR Inteligente Recarregável USB",
    "slug": "luz-noturna-led-sensor-movimento-pir-recarregavel-usb",
    "slugAliases": [
      "luminaria-sensor-movimento",
      "luz-noturna-led-sensor"
    ],
    "sku": "AT-LGT-SENSOR-NIGHT",
    "brand": "Smart Life",
    "category": "Acessórios & Casa",
    "stock": 40,
    "active": true,
    "price": 22000,
    "sale_price": 18000,
    "old_price": 22000,
    "rating": 4.8,
    "reviews_count": 64,
    "badge": "SENSOR PIR",
    "image_url": "/products/luz-noturna-sensor-movimento.jpg",
    "image": "/products/luz-noturna-sensor-movimento.jpg",
    "fallbackImage": "https://tse1.mm.bing.net/th/id/OIP.AbdA6abxS0gw2PR2VwjH8gHaHa?r=0&w=900&h=900&rs=1&pid=ImgDetMain&o=7&rm=3",
    "images": [
      "/products/luz-noturna-sensor-movimento.jpg",
      "https://tse1.mm.bing.net/th/id/OIP.AbdA6abxS0gw2PR2VwjH8gHaHa?r=0&w=900&h=900&rs=1&pid=ImgDetMain&o=7&rm=3"
    ],
    "description": "Luz noturna LED inteligente com sensor de movimento infravermelho PIR e sensor crepuscular de luminosidade. Acende automaticamente ao detectar presença no escuro a até 3-5 metros e desliga após 20 segundos de inatividade. Possui fixação magnética e adesivo 3M para instalar facilmente em corredores, escadas, guarda-roupas, quartos e cozinhas sem fios.",
    "highlights": [
      "Sensor de movimento PIR de 120 graus com alcance até 5 metros",
      "Acendimento automático apenas no escuro para máxima economia",
      "Bateria interna de lítio recarregável via USB",
      "Fixação magnética prática: retire facilmente para recarregar",
      "Luz suave e agradável que não agride a visão à noite"
    ],
    "features": [
      "Modo Automático (Sensor) e Modo Ligado Constante",
      "Design circular elegante e ultrafino"
    ],
    "specifications": {
      "Tipo de Luz": "LED Branco Quente / Neutro",
      "Bateria": "Recarregável Lítio 500mAh USB",
      "Alcance do Sensor": "3 a 5 metros em 120°",
      "Fixação": "Base Magnética + Fita 3M"
    },
    "packageContent": [
      "1 Luminária LED com Sensor de Movimento",
      "1 Placa Metálica com Adesivo 3M",
      "1 Cabo de Carregamento USB",
      "1 Manual"
    ],
    "seoTitle": "Luz Noturna LED com Sensor de Movimento PIR Recarregável | AQUI TEM ANGOLA",
    "seoDescription": "Luminária noturna inteligente com sensor de movimento PIR e bateria recarregável USB na AQUI TEM Angola. Ideal para corredores, quartos e armários."
  },
  {
    "id": "d5a5005e-5555-4005-a005-000000000042",
    "supabaseId": "d5a5005e-5555-4005-a005-000000000042",
    "created_at": "2026-11-09T17:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Capa Protetora Magnética MagSafe Anti-Impacto para iPhone",
    "slug": "capa-protetora-magnetica-magsafe-anti-impacto-iphone",
    "slugAliases": [
      "capa-magsafe-iphone",
      "case-magsafe-anti-impacto"
    ],
    "sku": "AT-ACC-CASE-MAGSAFE",
    "brand": "MagSafe Shield",
    "category": "Acessórios & Tech",
    "stock": 50,
    "active": true,
    "price": 14000,
    "sale_price": 10000,
    "old_price": 14000,
    "rating": 4.9,
    "reviews_count": 85,
    "badge": "MAGSAFE COMPATÍVEL",
    "image_url": "/products/capa-magsafe-iphone.webp",
    "image": "/products/capa-magsafe-iphone.webp",
    "fallbackImage": "https://http2.mlstatic.com/D_NQ_NP_699897-MLB73530213366_122023-O.webp",
    "images": [
      "/products/capa-magsafe-iphone.webp",
      "https://http2.mlstatic.com/D_NQ_NP_699897-MLB73530213366_122023-O.webp"
    ],
    "description": "Capa protetora premium com anel magnético integrado MagSafe, compatível com carregadores por indução e suportes veiculares magnéticos. Estrutura híbrida com traseira rígida em policarbonato anti-amarelamento e bordas em TPU flexível com amortecimento militar nos cantos contra quedas e impactos acidentais.",
    "highlights": [
      "Anel magnético MagSafe com 38 ímãs de neodímio N52 fortes",
      "Proteção militar contra quedas com airbags nos 4 cantos",
      "Borda elevada para proteção da tela frontal e das lentes da câmera",
      "Traseira cristalina com tratamento anti-riscos e anti-amarelamento",
      "Botões metálicos com clique tátil macio e preciso"
    ],
    "features": [
      "Carregamento rápido por indução sem necessidade de remover a capa",
      "Design fino e elegante que mantém a estética original do aparelho"
    ],
    "specifications": {
      "Material": "TPU Flexível + Policarbonato de Alta Densidade",
      "Ímãs": "Alinhamento magnético forte MagSafe",
      "Proteção de Câmera": "Moldura em relevo reforçada"
    },
    "packageContent": [
      "1 Capa Protetora Magnética MagSafe Anti-Impacto"
    ],
    "seoTitle": "Capa Protetora Magnética MagSafe Anti-Impacto para iPhone | AQUI TEM ANGOLA",
    "seoDescription": "Proteja o seu iPhone com a Capa Magnética MagSafe Anti-Impacto com cantos reforçados na AQUI TEM Angola. Compatível com carregamento sem fios."
  },
  {
    "id": "d6a6006f-6666-4006-a006-000000000043",
    "supabaseId": "d6a6006f-6666-4006-a006-000000000043",
    "created_at": "2026-11-09T17:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Película de Vidro Temperado de Privacidade Anti-Spy para iPhone",
    "slug": "pelicula-vidro-temperado-privacidade-anti-spy-iphone",
    "slugAliases": [
      "pelicula-privacidade-iphone",
      "pelicula-anti-spy-vidro"
    ],
    "sku": "AT-ACC-GLASS-PRIVACY",
    "brand": "Glass Pro 9H",
    "category": "Acessórios & Tech",
    "stock": 60,
    "active": true,
    "price": 10000,
    "sale_price": 7600,
    "old_price": 10000,
    "rating": 4.8,
    "reviews_count": 92,
    "badge": "ANTI-ESPIÃO 9H",
    "image_url": "/products/pelicula-privacidade-iphone.jpg",
    "image": "/products/pelicula-privacidade-iphone.jpg",
    "fallbackImage": "https://tse1.mm.bing.net/th/id/OIP.QE2slN2t6Jsu7RCZHItvZwHaL0?r=0&w=679&h=1084&rs=1&pid=ImgDetMain&o=7&rm=3",
    "images": [
      "/products/pelicula-privacidade-iphone.jpg",
      "https://tse1.mm.bing.net/th/id/OIP.QE2slN2t6Jsu7RCZHItvZwHaL0?r=0&w=679&h=1084&rs=1&pid=ImgDetMain&o=7&rm=3"
    ],
    "description": "Película de vidro temperado de alta resistência 9H com filtro de privacidade anti-spy de 28 graus. Permite visualização nítida apenas para quem está de frente para o ecrã, escurecendo a tela para quem olha pelas laterais. Protege mensagens privadas, senhas bancárias e conversas contra curiosos em transportes públicos e locais movimentados.",
    "highlights": [
      "Tecnologia de micro-persianas: visão bloqueada a partir de 28 graus laterais",
      "Vidro temperado 9H ultra resistente contra riscos, choques e quedas",
      "Revestimento oleofóbico que repele marcas de dedos e gordura",
      "Sensibilidade ao toque 100% preservada com resposta rápida",
      "Fácil aplicação com alinhamento perfeito sem bolhas"
    ],
    "features": [
      "Bordas curvas 2.5D confortáveis ao deslizar os dedos",
      "Compatível com quase todas as capas de proteção do mercado"
    ],
    "specifications": {
      "Dureza": "Vidro Temperado 9H",
      "Ângulo de Privacidade": "28° lateral",
      "Espessura": "0.33mm ultra fino",
      "Revestimento": "Anti-impressão digital e anti-reflexo"
    },
    "packageContent": [
      "1 Película de Vidro Temperado de Privacidade",
      "1 Kit de Limpeza e Aplicação (Lenço com Álcool + Flanela + Adesivo tira-pó)"
    ],
    "seoTitle": "Película de Vidro Temperado Privacidade Anti-Spy para iPhone | AQUI TEM ANGOLA",
    "seoDescription": "Mantenha a sua privacidade com a Película de Vidro Temperado 9H Anti-Spy para iPhone na AQUI TEM Angola. Protege a tela contra riscos e olhares curiosos."
  },
  {
    "id": "d7a7007a-7777-4007-a007-000000000044",
    "supabaseId": "d7a7007a-7777-4007-a007-000000000044",
    "created_at": "2026-11-09T17:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Ring Light LED Profissional 26cm com Tripé Articulado e Comando Bluetooth",
    "slug": "ring-light-led-profissional-26cm-tripe-comando-bluetooth",
    "slugAliases": [
      "ring-light-com-tripe",
      "ring-light-led-26cm"
    ],
    "sku": "AT-FOTO-RINGLIGHT-26",
    "brand": "Studio Pro",
    "category": "Acessórios & Tech",
    "stock": 25,
    "active": true,
    "price": 22000,
    "sale_price": 17200,
    "old_price": 22000,
    "rating": 4.9,
    "reviews_count": 48,
    "badge": "ILUMINAÇÃO PRO",
    "image_url": "/products/ring-light-tripe.jpg",
    "image": "/products/ring-light-tripe.jpg",
    "fallbackImage": "https://m.media-amazon.com/images/I/61-947b9ZDL.jpg",
    "images": [
      "/products/ring-light-tripe.jpg",
      "https://m.media-amazon.com/images/I/61-947b9ZDL.jpg"
    ],
    "description": "Kit completo de iluminação profissional Ring Light LED de 26cm (10 polegadas) com tripé ajustável até 2.10m, suporte flexível para telemóvel e comando de controle Bluetooth. Oferece 3 temperaturas de cor (Branco Quente, Branco Frio e Neutro) e 10 níveis de intensidade de brilho para vídeos no TikTok, YouTube, transmissões ao vivo, fotografia e maquiagem.",
    "highlights": [
      "Anel de luz LED 26cm (10 polegadas) com iluminação uniforme sem sombras",
      "3 Modos de Cor (3200K - 6500K) e 10 níveis de regulação de brilho",
      "Tripé metálico telescópico ajustável e estável",
      "Suporte giratório 360° para telemóvel na vertical ou horizontal",
      "Alimentação USB universal (compatível com power bank, carregador ou portátil)"
    ],
    "features": [
      "Comando no cabo para ajuste fácil de cor e luminosidade",
      "Comando remoto Bluetooth disparador de fotos e vídeos"
    ],
    "specifications": {
      "Diâmetro do Aro": "26 cm (10\")",
      "Potência": "12W - 15W",
      "Temperaturas de Cor": "Quente, Fria e Mista",
      "Conexão": "Cabo USB com controlador embutido"
    },
    "packageContent": [
      "1 Anel de Luz Ring Light LED 26cm",
      "1 Tripé de Chão Ajustável",
      "1 Suporte Flexível de Telemóvel",
      "1 Cabeça Ballhead Articulada 360°",
      "1 Controle Remoto Bluetooth Disparador"
    ],
    "seoTitle": "Ring Light LED Profissional 26cm com Tripé e Comando | AQUI TEM ANGOLA",
    "seoDescription": "Iluminação profissional para vídeos, lives, maquiagem e fotos com o Ring Light LED 26cm com tripé e controle Bluetooth na AQUI TEM Angola."
  },
  {
    "id": "d8a8008b-8888-4008-a008-000000000045",
    "supabaseId": "d8a8008b-8888-4008-a008-000000000045",
    "created_at": "2026-11-09T17:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Mini Liquidificador Portátil Recarregável USB 6 Lâminas 400ml",
    "slug": "mini-liquidificador-portatil-recarregavel-usb-6-laminas",
    "slugAliases": [
      "mini-liquidificador-portatil",
      "garrafa-blender-portatil-usb"
    ],
    "sku": "AT-ELET-BLENDER-PORTABLE",
    "brand": "Juice Master",
    "category": "Eletrodomésticos",
    "stock": 30,
    "active": true,
    "price": 19000,
    "sale_price": 14800,
    "old_price": 19000,
    "rating": 4.8,
    "reviews_count": 56,
    "badge": "6 LÂMINAS AÇO",
    "image_url": "/products/mini-liquidificador-portatil.webp",
    "image": "/products/mini-liquidificador-portatil.webp",
    "fallbackImage": "https://imgaz.staticbg.com/thumb/view/oaupload/banggood/images/ED/AC/b14d6f88-7abd-447a-8f7d-378b716a2b3c.jpg.webp",
    "images": [
      "/products/mini-liquidificador-portatil.webp",
      "https://imgaz.staticbg.com/thumb/view/oaupload/banggood/images/ED/AC/b14d6f88-7abd-447a-8f7d-378b716a2b3c.jpg.webp"
    ],
    "description": "Mini liquidificador e garrafa portátil recarregável via USB com motor potente e 6 lâminas em aço inoxidável 304 serrilhado. Triture frutas, gelo fino, sementes e prepare sumos naturais, batidos proteicos, smoothies e papinhas de bebê em apenas 30 segundos, diretamente na garrafa pronta para beber.",
    "highlights": [
      "Potente sistema de 6 lâminas serrilhadas em aço inox 304",
      "Copo em material alimentar livre de BPA resistente a quedas",
      "Bateria interna recarregável por USB de longa autonomia (12-15 batidos)",
      "Sistema de segurança: só funciona com o copo totalmente travado",
      "Alça de transporte em silicone para levar à academia ou trabalho"
    ],
    "features": [
      "Lavagem fácil com função de auto-limpeza com água e sabão",
      "Tampa hermética anti-vazamento"
    ],
    "specifications": {
      "Capacidade": "380ml a 400ml",
      "Lâminas": "6 em Aço Inox 304",
      "Velocidade do Motor": "22.000 RPM",
      "Carregamento": "USB 5V"
    },
    "packageContent": [
      "1 Mini Liquidificador Portátil USB",
      "1 Cabo de Carregamento USB",
      "1 Manual de Instruções"
    ],
    "seoTitle": "Mini Liquidificador Portátil Recarregável USB 6 Lâminas | AQUI TEM ANGOLA",
    "seoDescription": "Prepare sumos naturais, batidos e shakes em qualquer lugar com o Mini Liquidificador Portátil USB de 6 lâminas na AQUI TEM Angola. Prático e recarregável."
  },
  {
    "id": "d9a9009c-9999-4009-a009-000000000046",
    "supabaseId": "d9a9009c-9999-4009-a009-000000000046",
    "created_at": "2026-11-09T17:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Máquina de Café Expresso Elétrica Portátil LEBURRY Cápsulas e Pó",
    "slug": "maquina-cafe-expresso-eletrica-portatil-leburry",
    "slugAliases": [
      "cafeteira-portatil-leburry",
      "maquina-cafe-portatil-capsula"
    ],
    "sku": "AT-ELET-COFFEE-LEBURRY",
    "brand": "LEBURRY",
    "category": "Eletrodomésticos",
    "stock": 14,
    "active": true,
    "price": 62000,
    "sale_price": 49600,
    "old_price": 62000,
    "rating": 4.9,
    "reviews_count": 34,
    "badge": "CAFÉ EXPRESSO PRO",
    "image_url": "/products/cafeteira-portatil-leburry.jpg",
    "image": "/products/cafeteira-portatil-leburry.jpg",
    "fallbackImage": "https://m.media-amazon.com/images/I/51gCCWShb6L.jpg",
    "images": [
      "/products/cafeteira-portatil-leburry.jpg",
      "https://m.media-amazon.com/images/I/51gCCWShb6L.jpg"
    ],
    "description": "Máquina de café expresso portátil LEBURRY de alta pressão para desfrutar de um expresso com crema perfeita em qualquer lugar. Sistema versátil 2 em 1 compatível com cápsulas Nespresso originais e café moído tradicional. Bateria recarregável integrada e bomba elétrica de extração constante com acionamento num único toque.",
    "highlights": [
      "Bomba de pressão constante que extrai creme rico e aveludado",
      "Sistema 2 em 1: adaptador para cápsulas tipo Nespresso e para pó moído",
      "Operação elétrica com um toque (sem necessidade de bombear manualmente)",
      "Compacta e leve: cabe no porta-copos do carro ou mochila",
      "Copo térmico integrado para beber diretamente"
    ],
    "features": [
      "Bateria recarregável via USB Tipo-C",
      "Fácil desmontagem e limpeza rápida"
    ],
    "specifications": {
      "Marca": "LEBURRY Portable Coffee",
      "Pressão": "Extração de alta pressão até 15-18 Bar",
      "Compatibilidade": "Cápsulas Nespresso + Café Moído",
      "Bateria": "Recarregável USB-C"
    },
    "packageContent": [
      "1 Máquina de Café Expresso Portátil LEBURRY",
      "1 Adaptador para Cápsulas Nespresso",
      "1 Adaptador e Filtro para Café Moído",
      "1 Colher Medidora / Compactador",
      "1 Cabo USB-C",
      "1 Manual de Utilização"
    ],
    "seoTitle": "Máquina de Café Expresso Elétrica Portátil LEBURRY | AQUI TEM ANGOLA",
    "seoDescription": "Tenha café expresso cremoso onde estiver com a Máquina de Café Portátil LEBURRY compatível com cápsulas Nespresso e café moído na AQUI TEM Angola."
  },
  {
    "id": "e0a0010d-0000-4010-a010-000000000047",
    "supabaseId": "e0a0010d-0000-4010-a010-000000000047",
    "created_at": "2026-11-09T17:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Vaporizador e Ferro de Passar Roupa a Vapor Portátil Bivolt",
    "slug": "vaporizador-ferro-passar-roupa-vapor-portatil-bivolt",
    "slugAliases": [
      "vaporizador-roupa-portatil",
      "ferro-a-vapor-portatil"
    ],
    "sku": "AT-ELET-STEAMER-PORTABLE",
    "brand": "SteamPro",
    "category": "Eletrodomésticos",
    "stock": 18,
    "active": true,
    "price": 29000,
    "sale_price": 23200,
    "old_price": 29000,
    "rating": 4.8,
    "reviews_count": 41,
    "badge": "VAPOR POTENTE",
    "image_url": "/products/vaporizador-roupas-portatil.jpg",
    "image": "/products/vaporizador-roupas-portatil.jpg",
    "fallbackImage": "https://product-hub-prd.madeiramadeira.com.br/909968332/images/9fbddc8b-86f8-4774-9c48-9106c28e149a6b76cad7b39c1134f416368ff6.jpg",
    "images": [
      "/products/vaporizador-roupas-portatil.jpg",
      "https://product-hub-prd.madeiramadeira.com.br/909968332/images/9fbddc8b-86f8-4774-9c48-9106c28e149a6b76cad7b39c1134f416368ff6.jpg"
    ],
    "description": "Vaporizador e ferro de passar roupas vertical e horizontal portátil de alto rendimento. Aquece em apenas 20 segundos liberando vapor contínuo de alta temperatura que desamassa tecidos delicados e pesados, higieniza cortinas e sofás e elimina até 99.9% de germes e bactérias sem queimar as roupas.",
    "highlights": [
      "Aquecimento ultra rápido pronto a usar em 20 segundos",
      "Uso vertical no cabide e horizontal na tábua sem pingar água",
      "Chapa metálica antiaderente suave para tecidos finos e grossos",
      "Elimina odores, ácaros e bactérias com vapor a alta temperatura",
      "Design ergonómico compacto com cabo articulado para guardar na mala"
    ],
    "features": [
      "Reservatório de água transparente de fácil reabastecimento",
      "Sistema de desligamento automático de segurança contra superaquecimento"
    ],
    "specifications": {
      "Potência": "1000W - 1200W",
      "Tensão": "Bivolt 110V - 220V",
      "Aquecimento": "20 a 30 segundos",
      "Reservatório": "120ml"
    },
    "packageContent": [
      "1 Vaporizador e Ferro de Passar Roupa Portátil",
      "1 Escova para tecidos com pelos",
      "1 Copo medidor de água",
      "1 Manual de Instruções"
    ],
    "seoTitle": "Vaporizador e Ferro de Passar Roupa a Vapor Portátil | AQUI TEM ANGOLA",
    "seoDescription": "Desamasse e higienize roupas rapidamente com o Vaporizador e Ferro a Vapor Portátil na AQUI TEM Angola. Perfeito para viagens e uso diário."
  },
  {
    "id": "e1a1011e-1111-4011-a011-000000000048",
    "supabaseId": "e1a1011e-1111-4011-a011-000000000048",
    "created_at": "2026-11-09T17:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "SSD Externo Portátil ADATA 512GB USB 3.2 Ultra Rápido",
    "slug": "ssd-externo-portatil-adata-512gb-usb-3-2",
    "slugAliases": [
      "ssd-externo-adata-512gb",
      "ssd-portatil-adata"
    ],
    "sku": "AT-INF-SSD-ADATA-512G",
    "brand": "ADATA",
    "category": "Acessórios & Tech",
    "stock": 15,
    "active": true,
    "price": 45000,
    "sale_price": 37600,
    "old_price": 45000,
    "rating": 4.9,
    "reviews_count": 53,
    "badge": "USB 3.2 GEN 2",
    "image_url": "/products/ssd-externo-adata.jpg",
    "image": "/products/ssd-externo-adata.jpg",
    "fallbackImage": "https://tse2.mm.bing.net/th/id/OIP.LqQGUTjj_uBUMdcaNbyrqAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    "images": [
      "/products/ssd-externo-adata.jpg",
      "https://tse2.mm.bing.net/th/id/OIP.LqQGUTjj_uBUMdcaNbyrqAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
    ],
    "description": "SSD externo portátil ADATA de 512GB com interface USB 3.2 Gen 2 para transferências de dados em alta velocidade até 550MB/s. Corpo em liga metálica ultrafino resistente a impactos, poeira e vibrações. Plug and Play compatível com Windows, Mac, Linux, Android, PS5 e Xbox.",
    "highlights": [
      "Velocidade de leitura e gravação até 550 MB/s (até 5x mais rápido que HDD comum)",
      "Capacidade real de 512GB para backups, jogos, filmes e projetos pesados",
      "Corpo metálico com acabamento escovado premium ultra resistente",
      "Compatibilidade universal com USB-C e USB-A",
      "Operação silenciosa com baixo aquecimento e consumo eficiente"
    ],
    "features": [
      "Indicador LED de transferência de dados",
      "Design compacto que cabe na palma da mão ou bolso"
    ],
    "specifications": {
      "Capacidade": "512GB",
      "Interface": "USB 3.2 Gen 2 Tipo-C",
      "Velocidade Máxima": "Até 550 MB/s",
      "Compatibilidade": "Windows, macOS, Android, Consolas"
    },
    "packageContent": [
      "1 SSD Externo Portátil ADATA 512GB",
      "1 Cabo USB-C para USB-A / USB-C",
      "1 Guia Rápido de Instalação"
    ],
    "seoTitle": "SSD Externo Portátil ADATA 512GB USB 3.2 Ultra Rápido | AQUI TEM ANGOLA",
    "seoDescription": "Transfira ficheiros com velocidade extrema com o SSD Externo Portátil ADATA 512GB USB 3.2 na AQUI TEM Angola. Compacto, metálico e resistente."
  },
  {
    "id": "e2a2012f-2222-4012-a012-000000000049",
    "supabaseId": "e2a2012f-2222-4012-a012-000000000049",
    "created_at": "2026-11-09T17:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Fones de Ouvido Sem Fio TWS Bluetooth Mini Macaron com Estojo Redondo",
    "slug": "fones-ouvido-sem-fio-tws-bluetooth-mini-macaron",
    "slugAliases": [
      "fones-tws-macaron",
      "fones-tws-mini-redondo"
    ],
    "sku": "AT-TWS-MINI-MACARON",
    "brand": "AudioStyle",
    "category": "Áudio & Som",
    "stock": 45,
    "active": true,
    "price": 16000,
    "sale_price": 12400,
    "old_price": 16000,
    "rating": 4.7,
    "reviews_count": 67,
    "badge": "DESIGN MACARON",
    "image_url": "/products/fones-tws-mini-macaron.jpg",
    "image": "/products/fones-tws-mini-macaron.jpg",
    "fallbackImage": "https://tse3.mm.bing.net/th/id/OIP.9SxEYdIpXfyLASKUSjoxagHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    "images": [
      "/products/fones-tws-mini-macaron.jpg",
      "https://tse3.mm.bing.net/th/id/OIP.9SxEYdIpXfyLASKUSjoxagHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
    ],
    "description": "Fones de ouvido sem fio TWS Bluetooth Mini Macaron com estojo redondo fosco de toque suave. Oferecem reprodução estéreo de alta fidelidade com graves marcantes, microfone integrado para chamadas cristalinas e encaixe ergonômico ultraleve ideal para caminhadas, trabalho e estudos.",
    "highlights": [
      "Estojo de carregamento redondo estilo macaron com acabamento fosco premium",
      "Bluetooth 5.3 com emparelhamento instantâneo e estável",
      "Som estéreo Hi-Fi balanceado com redução de ruído passiva",
      "Bateria duradoura com até 20 horas de reprodução total com o estojo",
      "Touch inteligente nos fones para pausar música e atender chamadas"
    ],
    "features": [
      "Resistência básica a suor e pingos de chuva",
      "Encaixe anatómico super confortável"
    ],
    "specifications": {
      "Versão Bluetooth": "V5.3",
      "Autonomia dos Fones": "4 a 5 horas contínuas",
      "Autonomia com Estojo": "Até 20 horas",
      "Conector": "USB Tipo-C"
    },
    "packageContent": [
      "1 Par de Fones Sem Fio Mini Macaron",
      "1 Estojo de Carregamento Redondo Macaron",
      "1 Cabo USB Tipo-C",
      "1 Manual"
    ],
    "seoTitle": "Fones de Ouvido Sem Fio TWS Bluetooth Mini Macaron | AQUI TEM ANGOLA",
    "seoDescription": "Fones sem fios TWS Bluetooth compactos com estojo redondo e som estéreo de alta fidelidade na AQUI TEM Angola. Design moderno e bateria duradoura."
  },
  {
    "id": "e3a3013a-3333-4013-a013-000000000050",
    "supabaseId": "e3a3013a-3333-4013-a013-000000000050",
    "created_at": "2026-11-09T17:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Smartwatch Xiaomi Redmi Watch 3 Active Ecrã 1.83\" Chamadas Bluetooth",
    "slug": "smartwatch-xiaomi-redmi-watch-3-active-1-83-bluetooth",
    "slugAliases": [
      "redmi-watch-3-active",
      "smartwatch-xiaomi-redmi-watch-3"
    ],
    "sku": "AT-SW-XIAOMI-REDMI-W3A",
    "brand": "Xiaomi",
    "category": "Smartwatches",
    "stock": 18,
    "active": true,
    "price": 50000,
    "sale_price": 42400,
    "old_price": 50000,
    "rating": 4.9,
    "reviews_count": 88,
    "badge": "ORIGINAL XIAOMI",
    "image_url": "/products/redmi-watch-3-active.png",
    "image": "/products/redmi-watch-3-active.png",
    "fallbackImage": "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-watch-3-active/pc/d85881ab842f063a1ca4cef8e5fc7f1a.png",
    "images": [
      "/products/redmi-watch-3-active.png",
      "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-watch-3-active/pc/d85881ab842f063a1ca4cef8e5fc7f1a.png"
    ],
    "description": "Smartwatch Xiaomi Redmi Watch 3 Active com ecrã ultra amplo de 1.83 polegadas com cores vivas e alta nitidez. Realize e atenda chamadas telefónicas via Bluetooth diretamente pelo pulso, monitore a frequência cardíaca 24 horas, oxigenação sanguínea (SpO2) e sono. Conta com mais de 100 modos desportivos, resistência à água 5 ATM e bateria de até 12 dias.",
    "highlights": [
      "Ecrã Ultra Grande de 1.83\" com vidro curvo 2.5D de alta resistência",
      "Atendimento e realização de chamadas Bluetooth com microfone e alto-falante",
      "Mais de 100 modos de treino desportivo profissionais",
      "Monitorização completa de saúde 24h: Ritmo Cardíaco, SpO2 e Sono",
      "Resistência à água 5 ATM (até 50 metros de profundidade)",
      "Autonomia impressionante de até 12 dias com uso normal"
    ],
    "features": [
      "Mais de 200 mostradores de relógio personalizáveis",
      "Controlo de reprodução de música e notificações do WhatsApp e SMS"
    ],
    "specifications": {
      "Ecrã": "1.83 polegadas LCD 240x280 pixels",
      "Bluetooth": "V5.3 BLE",
      "Resistência à Água": "5 ATM",
      "Bateria": "289 mAh (Até 12 dias)",
      "Compatibilidade": "Android 6.0+ ou iOS 12.0+"
    },
    "packageContent": [
      "1 Relógio Inteligente Xiaomi Redmi Watch 3 Active Original",
      "1 Pulseira de Silicone",
      "1 Cabo Magnético de Carregamento",
      "1 Manual do Utilizador"
    ],
    "seoTitle": "Smartwatch Xiaomi Redmi Watch 3 Active Ecrã 1.83\" Bluetooth | AQUI TEM ANGOLA",
    "seoDescription": "Compre o Smartwatch Xiaomi Redmi Watch 3 Active com ecrã ultra grande de 1.83\", chamadas Bluetooth e monitor de saúde 24h na AQUI TEM Angola."
  },
  {
    "id": "e4a4014b-4444-4014-a014-000000000051",
    "supabaseId": "e4a4014b-4444-4014-a014-000000000051",
    "created_at": "2026-11-09T17:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Headphone Sem Fio Bluetooth Basike Over-Ear com Isolamento Acústico",
    "slug": "headphone-sem-fio-bluetooth-basike-over-ear-isolamento",
    "slugAliases": [
      "headphone-basike-bluetooth",
      "fone-basike-over-ear"
    ],
    "sku": "AT-AUD-HEADPHONE-BASIKE",
    "brand": "Basike",
    "category": "Áudio & Som",
    "stock": 22,
    "active": true,
    "price": 32000,
    "sale_price": 25600,
    "old_price": 32000,
    "rating": 4.9,
    "reviews_count": 45,
    "badge": "GRAVES POTENTES",
    "image_url": "/products/headphone-basike-bluetooth.jpg",
    "image": "/products/headphone-basike-bluetooth.jpg",
    "fallbackImage": "https://m.media-amazon.com/images/I/514n0rnHIgL._AC_.jpg",
    "images": [
      "/products/headphone-basike-bluetooth.jpg",
      "https://m.media-amazon.com/images/I/514n0rnHIgL._AC_.jpg"
    ],
    "description": "Headphone Bluetooth Basike Over-Ear que envolve totalmente as orelhas proporcionando isolamento acústico passivo superior e conforto prolongado. Equipado com drivers de 40mm de alta fidelidade para graves potentes e médios nítidos. Possui microfone embutido para chamadas, entrada auxiliar P2 de 3.5mm e bateria para até 18 horas contínuas de música.",
    "highlights": [
      "Drivers dinâmicos de 40mm com graves potentes e som cristalino",
      "Almofadas circumaurais macias em couro sintético com isolamento de ruído",
      "Haste acolchoada ajustável e dobrável para fácil transporte",
      "Até 18 horas de autonomia de reprodução contínua",
      "Conexão dupla: Bluetooth 5.0 ou cabo auxiliar P2 de 3.5mm"
    ],
    "features": [
      "Botões multimídia laterais para volume, faixas e chamadas",
      "Microfone integrado com voz limpa e nítida"
    ],
    "specifications": {
      "Drivers": "40mm de Neodímio",
      "Versão Bluetooth": "V5.0",
      "Autonomia": "Até 18 horas",
      "Entradas": "Bluetooth, Cabo Auxiliar 3.5mm, Ranhura Micro SD"
    },
    "packageContent": [
      "1 Headphone Bluetooth Basike Over-Ear",
      "1 Cabo de Carregamento USB",
      "1 Cabo de Áudio P2 3.5mm",
      "1 Manual de Instruções"
    ],
    "seoTitle": "Headphone Sem Fio Bluetooth Basike Over-Ear com Isolamento | AQUI TEM ANGOLA",
    "seoDescription": "Auscultadores Bluetooth Basike Over-Ear com graves profundos, almofadas macias de isolamento acústico e bateria de longa duração na AQUI TEM Angola."
  },
  {
    "id": "f1a1001a-1111-5001-a001-000000000052",
    "supabaseId": "f1a1001a-1111-5001-a001-000000000052",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Fones de Ouvido Sem Fio Oraimo SpaceBuds Neo OTW-323 com BassUp",
    "slug": "fones-sem-fio-oraimo-spacebuds-neo-otw-323",
    "slugAliases": [
      "spacebuds-neo-otw-323",
      "oraimo-otw-323"
    ],
    "sku": "AT-ORA-OTW-323",
    "brand": "Oraimo",
    "category": "Áudio & Som",
    "stock": 25,
    "active": true,
    "price": 22000,
    "sale_price": 22000,
    "old_price": 28000,
    "rating": 4.8,
    "reviews_count": 36,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-spacebuds-neo-otw323.png",
    "image": "/products/oraimo-spacebuds-neo-otw323.png",
    "fallbackImage": "/products/oraimo-spacebuds-neo-otw323.png",
    "images": [
      "/products/oraimo-spacebuds-neo-otw323.png"
    ],
    "description": "Fones de Ouvido Sem Fio Oraimo SpaceBuds Neo OTW-323 com BassUp original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OTW-323",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Fones de Ouvido Sem Fio Oraimo SpaceBuds Neo OTW-323 com BassUp",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Fones Sem Fio Oraimo SpaceBuds Neo OTW-323 BassUp | AQUI TEM ANGOLA",
    "seoDescription": "Compre os Fones Sem Fio Oraimo SpaceBuds Neo OTW-323 com tecnologia BassUp e autonomia estendida na AQUI TEM Angola."
  },
  {
    "id": "f2a2002b-2222-5002-a002-000000000053",
    "supabaseId": "f2a2002b-2222-5002-a002-000000000053",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Carregador Rápido de Parede Oraimo Firefly 3 OCW-E66S com Cabo M53",
    "slug": "carregador-rapido-parede-oraimo-firefly-3-ocw-e66s",
    "slugAliases": [
      "carregador-oraimo-firefly-3",
      "oraimo-ocw-e66s"
    ],
    "sku": "AT-ORA-OCW-E66S",
    "brand": "Oraimo",
    "category": "Acessórios & Tech",
    "stock": 50,
    "active": true,
    "price": 9125,
    "sale_price": 9125,
    "old_price": 12000,
    "rating": 4.9,
    "reviews_count": 58,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-carregador-firefly-ocw-e66s.png",
    "image": "/products/oraimo-carregador-firefly-ocw-e66s.png",
    "fallbackImage": "/products/oraimo-carregador-firefly-ocw-e66s.png",
    "images": [
      "/products/oraimo-carregador-firefly-ocw-e66s.png"
    ],
    "description": "Carregador Rápido de Parede Oraimo Firefly 3 OCW-E66S com Cabo M53 original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OCW-E66S",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Carregador Rápido de Parede Oraimo Firefly 3 OCW-E66S com Cabo M53",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Carregador Rápido Oraimo Firefly 3 OCW-E66S com Cabo | AQUI TEM ANGOLA",
    "seoDescription": "Carregador de parede rápido Oraimo Firefly 3 com tecnologia AniFast e proteção contra sobretensão na AQUI TEM Angola."
  },
  {
    "id": "f3a3003c-3333-5003-a003-000000000054",
    "supabaseId": "f3a3003c-3333-5003-a003-000000000054",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Difusor de Aromas e Humidificador Inteligente Oraimo AromaGlow 2 OAD-213A com Luz Noturna",
    "slug": "difusor-aromas-humidificador-oraimo-oad-213a",
    "slugAliases": [
      "difusor-oraimo-oad-213a",
      "humidificador-oraimo"
    ],
    "sku": "AT-ORA-OAD-213A",
    "brand": "Oraimo",
    "category": "Acessórios & Casa",
    "stock": 20,
    "active": true,
    "price": 36750,
    "sale_price": 36750,
    "old_price": 44000,
    "rating": 4.9,
    "reviews_count": 42,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-difusor-aroma-oad-213a.png",
    "image": "/products/oraimo-difusor-aroma-oad-213a.png",
    "fallbackImage": "/products/oraimo-difusor-aroma-oad-213a.png",
    "images": [
      "/products/oraimo-difusor-aroma-oad-213a.png"
    ],
    "description": "Difusor de Aromas e Humidificador Inteligente Oraimo OAD-213A com Luz Noturna original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OAD-213A",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Difusor de Aromas e Humidificador Inteligente Oraimo OAD-213A com Luz Noturna",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Difusor de Aromas e Humidificador Oraimo OAD-213A | AQUI TEM ANGOLA",
    "seoDescription": "Melhore o ar e o bem-estar com o Difusor de Aromas e Humidificador Oraimo OAD-213A ultrassónico com iluminação relaxante na AQUI TEM Angola."
  },
  {
    "id": "f4a4004d-4444-5004-a004-000000000055",
    "supabaseId": "f4a4004d-4444-5004-a004-000000000055",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Fones de Ouvido Bluetooth de Pescoço Oraimo Necklace Neo OEB-E310 50h de Bateria",
    "slug": "fones-ouvido-bluetooth-pescoco-oraimo-necklace-neo",
    "slugAliases": [
      "oraimo-necklace-neo-oeb-310",
      "oraimo-oeb-310"
    ],
    "sku": "AT-ORA-OEB-E310",
    "brand": "Oraimo",
    "category": "Áudio & Som",
    "stock": 30,
    "active": true,
    "price": 13375,
    "sale_price": 13375,
    "old_price": 18000,
    "rating": 4.8,
    "reviews_count": 49,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-necklace-neo-oeb-310.png",
    "image": "/products/oraimo-necklace-neo-oeb-310.png",
    "fallbackImage": "/products/oraimo-necklace-neo-oeb-310.png",
    "images": [
      "/products/oraimo-necklace-neo-oeb-310.png"
    ],
    "description": "Fones de Ouvido Bluetooth de Pescoço Oraimo Necklace Neo OEB-E310 50h de Bateria original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OEB-E310",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Fones de Ouvido Bluetooth de Pescoço Oraimo Necklace Neo OEB-E310 50h de Bateria",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Fones Bluetooth de Pescoço Oraimo Necklace Neo OEB-E310 | AQUI TEM ANGOLA",
    "seoDescription": "Fones sem fio de pescoço Oraimo Necklace Neo com 50 horas de reprodução contínua e graves envolventes na AQUI TEM Angola."
  },
  {
    "id": "f5a5005e-5555-5005-a005-000000000056",
    "supabaseId": "f5a5005e-5555-5005-a005-000000000056",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Garrafa Térmica Isolada a Vácuo Oraimo QuickSip 620ml OHDW-001 Aço Inox",
    "slug": "garrafa-termica-quicksip-620ml-oraimo-ohdw-001",
    "slugAliases": [
      "garrafa-termica-oraimo-620ml",
      "oraimo-ohdw-001"
    ],
    "sku": "AT-ORA-OHDW-001",
    "brand": "Oraimo",
    "category": "Acessórios & Casa",
    "stock": 35,
    "active": true,
    "price": 23875,
    "sale_price": 23875,
    "old_price": 29000,
    "rating": 4.9,
    "reviews_count": 53,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-garrafa-termica-quicksip-620.png",
    "image": "/products/oraimo-garrafa-termica-quicksip-620.png",
    "fallbackImage": "/products/oraimo-garrafa-termica-quicksip-620.png",
    "images": [
      "/products/oraimo-garrafa-termica-quicksip-620.png"
    ],
    "description": "Garrafa Térmica Isolada a Vácuo Oraimo QuickSip 620ml OHDW-001 Aço Inox original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OHDW-001",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Garrafa Térmica Isolada a Vácuo Oraimo QuickSip 620ml OHDW-001 Aço Inox",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Garrafa Térmica Oraimo QuickSip 620ml Aço Inox | AQUI TEM ANGOLA",
    "seoDescription": "Mantenha bebidas frias por 24h ou quentes por 12h com a Garrafa Térmica Oraimo QuickSip 620ml em aço inoxidável na AQUI TEM Angola."
  },
  {
    "id": "f6a6006f-6666-5006-a006-000000000057",
    "supabaseId": "f6a6006f-6666-5006-a006-000000000057",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Câmara Wi-Fi de Segurança Oraimo Vigicam 3MP Ultra HD Visão Noturna OSH-015A",
    "slug": "camera-seguranca-wifi-oraimo-vigicam-3mp-osh-015a",
    "slugAliases": [
      "balanca-oraimo-osh-015a",
      "smart-scale-oraimo"
    ],
    "sku": "AT-ORA-OSH-015A",
    "brand": "Oraimo",
    "category": "Segurança & Câmaras",
    "stock": 22,
    "active": true,
    "price": 47750,
    "sale_price": 47750,
    "old_price": 58000,
    "rating": 4.9,
    "reviews_count": 38,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-camera-seguranca-vigicam-osh-015a.png",
    "image": "/products/oraimo-camera-seguranca-vigicam-osh-015a.png",
    "fallbackImage": "/products/oraimo-camera-seguranca-vigicam-osh-015a.png",
    "images": [
      "/products/oraimo-camera-seguranca-vigicam-osh-015a.png"
    ],
    "description": "Câmara de Segurança Wi-Fi Oraimo Vigicam 3MP Ultra HD OSH-015A original Oraimo com visão noturna infravermelha avançada, deteção inteligente de movimento com alertas instantâneos no telemóvel, áudio bidirecional e gravação segura. Ideal para vigilância da sua residência ou empresa em Angola.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OSH-015A",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Balança Digital Corporal Inteligente Oraimo Smart Body Scale OSH-015A com App",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Balança Digital Corporal Inteligente Oraimo OSH-015A | AQUI TEM ANGOLA",
    "seoDescription": "Monitore peso, gordura corporal, IMC e massa muscular com a Balança Inteligente Oraimo OSH-015A conectada via Bluetooth na AQUI TEM Angola."
  },
  {
    "id": "f7a7007a-7777-5007-a007-000000000058",
    "supabaseId": "f7a7007a-7777-5007-a007-000000000058",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Coluna de Som Portátil Bluetooth Oraimo SpaceBox Pro OBS-682 Graves Potentes 80W",
    "slug": "coluna-som-bluetooth-oraimo-spacebox-pro-obs-682",
    "slugAliases": [
      "oraimo-spacebox-pro-obs-682",
      "coluna-oraimo-obs-682"
    ],
    "sku": "AT-ORA-OBS-682",
    "brand": "Oraimo",
    "category": "Áudio & Som",
    "stock": 18,
    "active": true,
    "price": 134250,
    "sale_price": 134250,
    "old_price": 155000,
    "rating": 4.9,
    "reviews_count": 45,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-speaker-spacebox-pro-obs-682.png",
    "image": "/products/oraimo-speaker-spacebox-pro-obs-682.png",
    "fallbackImage": "/products/oraimo-speaker-spacebox-pro-obs-682.png",
    "images": [
      "/products/oraimo-speaker-spacebox-pro-obs-682.png"
    ],
    "description": "Coluna de Som Portátil Bluetooth Oraimo SpaceBox Pro OBS-682 Graves Potentes original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OBS-682",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Coluna de Som Portátil Bluetooth Oraimo SpaceBox Pro OBS-682 Graves Potentes",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Coluna de Som Bluetooth Oraimo SpaceBox Pro OBS-682 | AQUI TEM ANGOLA",
    "seoDescription": "Potência sonora e graves profundos com a Coluna Portátil Oraimo SpaceBox Pro OBS-682 na AQUI TEM Angola. À prova de respingos e bateria duradoura."
  },
  {
    "id": "f8a8008b-8888-5008-a008-000000000059",
    "supabaseId": "f8a8008b-8888-5008-a008-000000000059",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Smartwatch Oraimo Watch 5 Lite OSW-804 Ecrã HD 2.01\" Chamadas Bluetooth",
    "slug": "smartwatch-oraimo-watch-5-lite-osw-804-hd",
    "slugAliases": [
      "oraimo-watch-fit-508",
      "oraimo-osw-805n"
    ],
    "sku": "AT-ORA-OSW-805N",
    "brand": "Oraimo",
    "category": "Smartwatches",
    "stock": 25,
    "active": true,
    "price": 25125,
    "sale_price": 25125,
    "old_price": 32000,
    "rating": 4.8,
    "reviews_count": 51,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-smartwatch-watch-fit-508.png",
    "image": "/products/oraimo-smartwatch-watch-fit-508.png",
    "fallbackImage": "/products/oraimo-smartwatch-watch-fit-508.png",
    "images": [
      "/products/oraimo-smartwatch-watch-fit-508.png"
    ],
    "description": "Smartwatch Fitness Oraimo Watch Fit com Monitor de Saúde e Notificações original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OSW-805N",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Smartwatch Fitness Oraimo Watch Fit com Monitor de Saúde e Notificações",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Smartwatch Fitness Oraimo Watch Fit com Notificações | AQUI TEM ANGOLA",
    "seoDescription": "Acompanhe passos, batimentos cardíacos, sono e treinos com o relógio inteligente Oraimo Watch Fit na AQUI TEM Angola."
  },
  {
    "id": "f9a9009c-9999-5009-a009-000000000060",
    "supabaseId": "f9a9009c-9999-5009-a009-000000000060",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Fones de Ouvido Open-Ear Oraimo OpenAir OPN-670N Condução de Ar e Graves",
    "slug": "fones-ouvido-open-ear-oraimo-openair-opn-670n",
    "slugAliases": [
      "oraimo-openair-opn-670n",
      "oraimo-opn-670n"
    ],
    "sku": "AT-ORA-OPN-670N",
    "brand": "Oraimo",
    "category": "Áudio & Som",
    "stock": 20,
    "active": true,
    "price": 40250,
    "sale_price": 40250,
    "old_price": 48000,
    "rating": 4.9,
    "reviews_count": 37,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-openair-opn-670n.png",
    "image": "/products/oraimo-openair-opn-670n.png",
    "fallbackImage": "/products/oraimo-openair-opn-670n.png",
    "images": [
      "/products/oraimo-openair-opn-670n.png"
    ],
    "description": "Fones de Ouvido Open-Ear Oraimo OpenAir OPN-670N Condução de Ar e Graves original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OPN-670N",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Fones de Ouvido Open-Ear Oraimo OpenAir OPN-670N Condução de Ar e Graves",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Fones de Ouvido Open-Ear Oraimo OpenAir OPN-670N | AQUI TEM ANGOLA",
    "seoDescription": "Design aberto confortável e som potente sem tampar os ouvidos com o Oraimo OpenAir OPN-670N na AQUI TEM Angola."
  },
  {
    "id": "f0b0010d-0000-5010-b010-000000000061",
    "supabaseId": "f0b0010d-0000-5010-b010-000000000061",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Power Bank Oraimo Toast 10 OPB-1205N 10.000mAh Dupla Saída Rápida",
    "slug": "power-bank-oraimo-toast-10-opb-1205n-10000mah",
    "slugAliases": [
      "oraimo-powerbank-toast10",
      "oraimo-opb-1205n"
    ],
    "sku": "AT-ORA-OPB-1205N",
    "brand": "Oraimo",
    "category": "Energia",
    "stock": 45,
    "active": true,
    "price": 21500,
    "sale_price": 21500,
    "old_price": 26000,
    "rating": 4.9,
    "reviews_count": 62,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-powerbank-toast10-opb-1205n.png",
    "image": "/products/oraimo-powerbank-toast10-opb-1205n.png",
    "fallbackImage": "/products/oraimo-powerbank-toast10-opb-1205n.png",
    "images": [
      "/products/oraimo-powerbank-toast10-opb-1205n.png"
    ],
    "description": "Power Bank Oraimo Toast 10 OPB-1205N 10.000mAh Dupla Saída Rápida original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OPB-1205N",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Power Bank Oraimo Toast 10 OPB-1205N 10.000mAh Dupla Saída Rápida",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Power Bank Oraimo Toast 10 10000mAh Dupla Saída | AQUI TEM ANGOLA",
    "seoDescription": "Bateria externa ultrafina Oraimo Toast 10 com 10.000mAh e carregamento rápido para telemóveis na AQUI TEM Angola."
  },
  {
    "id": "f1b1011e-1111-5011-b011-000000000062",
    "supabaseId": "f1b1011e-1111-5011-b011-000000000062",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Jarro Elétrico Chaleira em Aço Inox Oraimo SmartKettle Byte OF-KK200N 1.8L Fervura Rápida",
    "slug": "jarro-eletrico-chaleira-inox-oraimo-of-kk200n-1-8l",
    "slugAliases": [
      "chaleira-eletrica-oraimo-of-kk200n",
      "jarro-oraimo-1-8l"
    ],
    "sku": "AT-ORA-OF-KK200N",
    "brand": "Oraimo",
    "category": "Eletrodomésticos",
    "stock": 24,
    "active": true,
    "price": 51125,
    "sale_price": 51125,
    "old_price": 62000,
    "rating": 4.8,
    "reviews_count": 39,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-jarro-eletrico-kettle-of-kk200n.png",
    "image": "/products/oraimo-jarro-eletrico-kettle-of-kk200n.png",
    "fallbackImage": "/products/oraimo-jarro-eletrico-kettle-of-kk200n.png",
    "images": [
      "/products/oraimo-jarro-eletrico-kettle-of-kk200n.png"
    ],
    "description": "Jarro Elétrico Chaleira em Aço Inox Oraimo OF-KK200N 1.8 Litros Fervura Rápida original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OF-KK200N",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Jarro Elétrico Chaleira em Aço Inox Oraimo OF-KK200N 1.8 Litros Fervura Rápida",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Jarro Elétrico Chaleira em Aço Inox Oraimo 1.8L | AQUI TEM ANGOLA",
    "seoDescription": "Ferva água em poucos minutos com segurança com a Chaleira Elétrica Oraimo em aço inoxidável de 1.8L na AQUI TEM Angola."
  },
  {
    "id": "f2b2012f-2222-5012-b012-000000000063",
    "supabaseId": "f2b2012f-2222-5012-b012-000000000063",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Smartwatch Oraimo Watch Nova 2R Lite OSW-824 Ecrã AMOLED 1.43\" com Chamadas Bluetooth",
    "slug": "smartwatch-oraimo-watch-4-plus-osw-824-hd-2-01",
    "slugAliases": [
      "oraimo-watch-4-plus",
      "oraimo-osw-824"
    ],
    "sku": "AT-ORA-OSW-824",
    "brand": "Oraimo",
    "category": "Smartwatches",
    "stock": 20,
    "active": true,
    "price": 40625,
    "sale_price": 40625,
    "old_price": 49000,
    "rating": 4.9,
    "reviews_count": 67,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-watch-4-plus-osw-824.png",
    "image": "/products/oraimo-watch-4-plus-osw-824.png",
    "fallbackImage": "/products/oraimo-watch-4-plus-osw-824.png",
    "images": [
      "/products/oraimo-watch-4-plus-osw-824.png"
    ],
    "description": "Smartwatch Oraimo Watch 4 Plus OSW-824 Ecrã HD 2.01\" com Chamadas Bluetooth original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OSW-824",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Smartwatch Oraimo Watch 4 Plus OSW-824 Ecrã HD 2.01\" com Chamadas Bluetooth",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Smartwatch Oraimo Watch 4 Plus OSW-824 Ecrã 2.01\" | AQUI TEM ANGOLA",
    "seoDescription": "Relógio inteligente Oraimo Watch 4 Plus com tela gigante de 2.01 polegadas, chamadas Bluetooth e monitor de saúde 24h na AQUI TEM Angola."
  },
  {
    "id": "f3b3013a-3333-5013-b013-000000000064",
    "supabaseId": "f3b3013a-3333-5013-b013-000000000064",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Relógio Inteligente Oraimo Watch Muse 2 OSW-833N Rose Gold com Display AMOLED",
    "slug": "relogio-inteligente-oraimo-watch-nova-osw-833n-rose-gold",
    "slugAliases": [
      "oraimo-watch-nova",
      "oraimo-osw-833n"
    ],
    "sku": "AT-ORA-OSW-833N",
    "brand": "Oraimo",
    "category": "Smartwatches",
    "stock": 16,
    "active": true,
    "price": 51750,
    "sale_price": 51750,
    "old_price": 62000,
    "rating": 4.9,
    "reviews_count": 44,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-watch-nova-osw-833n.png",
    "image": "/products/oraimo-watch-nova-osw-833n.png",
    "fallbackImage": "/products/oraimo-watch-nova-osw-833n.png",
    "images": [
      "/products/oraimo-watch-nova-osw-833n.png"
    ],
    "description": "Relógio Inteligente Oraimo Watch Nova OSW-833N Rose Gold com Display AMOLED original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OSW-833N",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Relógio Inteligente Oraimo Watch Nova OSW-833N Rose Gold com Display AMOLED",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Smartwatch Oraimo Watch Nova OSW-833N Rose Gold | AQUI TEM ANGOLA",
    "seoDescription": "Design elegante em tom Rose Gold com display AMOLED brilhante e chamadas Bluetooth no Oraimo Watch Nova na AQUI TEM Angola."
  },
  {
    "id": "f4b4014b-4444-5014-b014-000000000065",
    "supabaseId": "f4b4014b-4444-5014-b014-000000000065",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Smartwatch Redondo Oraimo Watch Nova 2 Air OSW-814S Display AMOLED Always-On",
    "slug": "smartwatch-redondo-oraimo-watch-er-osw-814s-amoled",
    "slugAliases": [
      "oraimo-watch-er",
      "oraimo-osw-814s"
    ],
    "sku": "AT-ORA-OSW-814S",
    "brand": "Oraimo",
    "category": "Smartwatches",
    "stock": 18,
    "active": true,
    "price": 54250,
    "sale_price": 54250,
    "old_price": 65000,
    "rating": 4.9,
    "reviews_count": 59,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-watch-er-osw-814s.png",
    "image": "/products/oraimo-watch-er-osw-814s.png",
    "fallbackImage": "/products/oraimo-watch-er-osw-814s.png",
    "images": [
      "/products/oraimo-watch-er-osw-814s.png"
    ],
    "description": "Smartwatch Redondo Oraimo Watch ER OSW-814S Display AMOLED Always-On original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OSW-814S",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Smartwatch Redondo Oraimo Watch ER OSW-814S Display AMOLED Always-On",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Smartwatch Redondo Oraimo Watch ER OSW-814S AMOLED | AQUI TEM ANGOLA",
    "seoDescription": "Mostrador circular clássico premium com ecrã AMOLED Always-On e acabamento metálico no Oraimo Watch ER na AQUI TEM Angola."
  },
  {
    "id": "f5b5015c-5555-5015-b015-000000000066",
    "supabaseId": "f5b5015c-5555-5015-b015-000000000066",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Secador de Cabelo Profissional Oraimo SwiftDry 2 OHD-210N com Tecnologia Iónica",
    "slug": "secador-cabelo-profissional-oraimo-swiftdry-2-ohd-210n",
    "slugAliases": [
      "oraimo-swiftdry-2",
      "oraimo-ohd-210n"
    ],
    "sku": "AT-ORA-OHD-210N",
    "brand": "Oraimo",
    "category": "Eletrodomésticos",
    "stock": 20,
    "active": true,
    "price": 28625,
    "sale_price": 28625,
    "old_price": 35000,
    "rating": 4.9,
    "reviews_count": 48,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-secador-swiftdry-2-ohd-210n.png",
    "image": "/products/oraimo-secador-swiftdry-2-ohd-210n.png",
    "fallbackImage": "/products/oraimo-secador-swiftdry-2-ohd-210n.png",
    "images": [
      "/products/oraimo-secador-swiftdry-2-ohd-210n.png"
    ],
    "description": "Secador de Cabelo Profissional Oraimo SwiftDry 2 OHD-210N com Tecnologia Iónica original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OHD-210N",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Secador de Cabelo Profissional Oraimo SwiftDry 2 OHD-210N com Tecnologia Iónica",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Secador de Cabelo Oraimo SwiftDry 2 OHD-210N Iónico | AQUI TEM ANGOLA",
    "seoDescription": "Secagem ultra rápida com proteção térmica e emissão de iões negativos para cabelos sem frizz com o Oraimo SwiftDry 2 na AQUI TEM Angola."
  },
  {
    "id": "f6b6016d-6666-5016-b016-000000000067",
    "supabaseId": "f6b6016d-6666-5016-b016-000000000067",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Máquina de Cortar Cabelo Profissional Oraimo SmartClipper 2 OPC-CL30C Bateria 150min",
    "slug": "maquina-cortar-cabelo-oraimo-smartclipper-2-opc-cl30c",
    "slugAliases": [
      "oraimo-smartclipper-2",
      "oraimo-opc-cl30c"
    ],
    "sku": "AT-ORA-OPC-CL30C",
    "brand": "Oraimo",
    "category": "Acessórios & Casa",
    "stock": 28,
    "active": true,
    "price": 29625,
    "sale_price": 29625,
    "old_price": 36000,
    "rating": 4.8,
    "reviews_count": 41,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-maquina-cortar-cabelo-opc-cl30c.png",
    "image": "/products/oraimo-maquina-cortar-cabelo-opc-cl30c.png",
    "fallbackImage": "/products/oraimo-maquina-cortar-cabelo-opc-cl30c.png",
    "images": [
      "/products/oraimo-maquina-cortar-cabelo-opc-cl30c.png"
    ],
    "description": "Máquina de Cortar Cabelo Profissional Oraimo SmartClipper 2 OPC-CL30C Bateria 150min original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OPC-CL30C",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Máquina de Cortar Cabelo Profissional Oraimo SmartClipper 2 OPC-CL30C Bateria 150min",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Máquina de Cortar Cabelo Oraimo SmartClipper 2 | AQUI TEM ANGOLA",
    "seoDescription": "Lâminas auto-afiáveis em aço inoxidável e bateria de 150 minutos na Máquina de Cortar Cabelo Oraimo SmartClipper 2 na AQUI TEM Angola."
  },
  {
    "id": "f7b7017e-7777-5017-b017-000000000068",
    "supabaseId": "f7b7017e-7777-5017-b017-000000000068",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Roteador Wi-Fi Dual Band Oraimo Falcon AC OF-WR205N AC1200 com 4 Antenas 5dBi",
    "slug": "roteador-wifi-dual-band-oraimo-falcon-ac-of-wr205n",
    "slugAliases": [
      "oraimo-roteador-falcon-ac",
      "oraimo-of-wr205n"
    ],
    "sku": "AT-ORA-OF-WR205N",
    "brand": "Oraimo",
    "category": "Acessórios & Tech",
    "stock": 22,
    "active": true,
    "price": 65750,
    "sale_price": 65750,
    "old_price": 78000,
    "rating": 4.9,
    "reviews_count": 35,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-roteador-wifi-falcon-of-wr205n.png",
    "image": "/products/oraimo-roteador-wifi-falcon-of-wr205n.png",
    "fallbackImage": "/products/oraimo-roteador-wifi-falcon-of-wr205n.png",
    "images": [
      "/products/oraimo-roteador-wifi-falcon-of-wr205n.png"
    ],
    "description": "Roteador Wi-Fi Dual Band Oraimo Falcon AC OF-WR205N AC1200 com 4 Antenas 5dBi original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OF-WR205N",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Roteador Wi-Fi Dual Band Oraimo Falcon AC OF-WR205N AC1200 com 4 Antenas 5dBi",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Roteador Wi-Fi Dual Band Oraimo Falcon AC AC1200 | AQUI TEM ANGOLA",
    "seoDescription": "Conexão estável de alta velocidade com 4 antenas de longo alcance no Roteador Wi-Fi Oraimo Falcon AC OF-WR205N na AQUI TEM Angola."
  },
  {
    "id": "f8b8018f-8888-5018-b018-000000000069",
    "supabaseId": "f8b8018f-8888-5018-b018-000000000069",
    "created_at": "2026-11-09T22:00:00.000Z",
    "isNewAddition": true,
    "whiteBg": true,
    "name": "Coluna Bluetooth 360° Oraimo SpaceBox Active OBS-680 com Show de Luzes RGB e Graves",
    "slug": "coluna-bluetooth-360-oraimo-soundflow-obs-680-rgb",
    "slugAliases": [
      "oraimo-soundflow-obs-680",
      "coluna-oraimo-soundflow"
    ],
    "sku": "AT-ORA-OBS-680",
    "brand": "Oraimo",
    "category": "Áudio & Som",
    "stock": 16,
    "active": true,
    "price": 57875,
    "sale_price": 57875,
    "old_price": 68000,
    "rating": 4.9,
    "reviews_count": 52,
    "badge": "ORAIMO ORIGINAL",
    "image_url": "/products/oraimo-soundflow-obs-680-black.png",
    "image": "/products/oraimo-soundflow-obs-680-black.png",
    "fallbackImage": "/products/oraimo-soundflow-obs-680-black.png",
    "images": [
      "/products/oraimo-soundflow-obs-680-black.png"
    ],
    "description": "Coluna Bluetooth 360° Oraimo SoundFlow OBS-680 com Show de Luzes RGB e Graves original Oraimo, com garantia oficial, qualidade premium e entrega rápida em Luanda. Desenvolvido com os mais altos padrões de durabilidade, desempenho e eficiência energética.",
    "highlights": [
      "Garantia oficial e autenticidade 100% comprovada Oraimo",
      "Desempenho de alta eficiência e acabamento premium",
      "Compatibilidade universal e alta durabilidade no uso diário",
      "Entrega rápida e segura em Luanda e províncias"
    ],
    "features": [
      "Tecnologia inteligente desenvolvida para máxima longevidade",
      "Proteção contra sobretensão e aquecimento"
    ],
    "specifications": {
      "Marca": "Oraimo",
      "Modelo": "AT-ORA-OBS-680",
      "Garantia": "12 Meses Oficial",
      "Origem": "Distribuição Autorizada Oficial"
    },
    "packageContent": [
      "1 Coluna Bluetooth 360° Oraimo SoundFlow OBS-680 com Show de Luzes RGB e Graves",
      "1 Manual do Usuário e Certificado de Garantia Oraimo"
    ],
    "seoTitle": "Coluna Bluetooth 360° Oraimo SoundFlow OBS-680 RGB | AQUI TEM ANGOLA",
    "seoDescription": "Experiência imersiva de áudio 360 graus com iluminação dinâmica colorida RGB na Coluna Oraimo SoundFlow OBS-680 na AQUI TEM Angola."
  }
];

export const DEACTIVATED_LEGACY_PRODUCTS = [];

export const CATEGORIES = [
  'Todos',
  'Áudio & Som',
  'Smartwatches',
  'Acessórios & Tech',
  'Acessórios & Casa',
  'Segurança & Câmaras',
  'Energia',
  'TV & Vídeo',
  'Eletrodomésticos',
  'Celular',
  'Outros'
];

export const ADVANTAGES = [
  {
    icon: 'Truck',
    title: 'Entregas Rápidas',
    subtitle: 'Em Luanda e províncias de Angola'
  },
  {
    icon: 'ShieldCheck',
    title: 'Garantia de Qualidade',
    subtitle: '100% selado na caixa original'
  },
  {
    icon: 'CreditCard',
    title: 'Pagamento Seguro',
    subtitle: 'TPA Multicaixa na entrega ou transferência'
  },
  {
    icon: 'MessageCircle',
    title: 'Suporte Humanizado',
    subtitle: 'Atendimento contínuo via WhatsApp'
  }
];

export default PRODUCTS;
