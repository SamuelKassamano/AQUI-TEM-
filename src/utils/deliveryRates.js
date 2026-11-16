/**
 * Tabela Oficial de Zonas e Cálculo Automático de Entrega — AQUI TEM Angola
 * Valores em Kwanzas (AOA) com base nas rotas logísticas de Luanda e Províncias.
 */

export const DELIVERY_ZONES = [
  // --- ZONAS DE LUANDA ---
  {
    id: 'luanda-central',
    name: 'Luanda — Zonas Centrais (Maianga, Ingombota, Rangel, Sambizanga, Miramar)',
    shortName: 'Luanda Central',
    region: 'Luanda',
    fee: 2000,
    estimatedTime: '24 horas',
    description: 'Entrega rápida em rota prioritária em Luanda.'
  },
  {
    id: 'luanda-sul',
    name: 'Luanda — Sul / Talatona (Benfica, Talatona, Morro Bento, Belas, Samba, Ilha)',
    shortName: 'Luanda Sul / Talatona',
    region: 'Luanda',
    fee: 2500,
    estimatedTime: '24 horas',
    description: 'Despacho direto a partir do nosso centro operacional no Benfica.'
  },
  {
    id: 'luanda-expansao',
    name: 'Luanda — Expansão (Kilamba, Viana, Cacuaco, Camama, Zango, Vila Alice)',
    shortName: 'Luanda Expansão',
    region: 'Luanda',
    fee: 3500,
    estimatedTime: '24 a 48 horas',
    description: 'Rota diária programada para zonas residenciais de expansão.'
  },
  {
    id: 'luanda-periferia',
    name: 'Luanda — Periferia (Icolo e Bengo, Catete, Barra do Dande, Sequele)',
    shortName: 'Luanda Periferia',
    region: 'Luanda',
    fee: 4500,
    estimatedTime: '48 horas',
    description: 'Despacho agendado para municípios periféricos de Luanda.'
  },

  // --- 17 PROVÍNCIAS DE ANGOLA ---
  {
    id: 'prov-benguela',
    name: 'Província de Benguela (Benguela / Lobito / Baía Farta)',
    shortName: 'Benguela / Lobito',
    region: 'Províncias',
    fee: 5500,
    estimatedTime: '48 a 72 horas',
    description: 'Envio seguro via transportadora parceira com guia de remessa.'
  },
  {
    id: 'prov-huambo',
    name: 'Província do Huambo (Cidade do Huambo e arredores)',
    shortName: 'Huambo',
    region: 'Províncias',
    fee: 5500,
    estimatedTime: '48 a 72 horas',
    description: 'Expedição rodoviária monitorada até à agência local.'
  },
  {
    id: 'prov-huila',
    name: 'Província da Huíla (Lubango)',
    shortName: 'Huíla (Lubango)',
    region: 'Províncias',
    fee: 6000,
    estimatedTime: '48 a 72 horas',
    description: 'Despacho expresso rodoviário ou aéreo.'
  },
  {
    id: 'prov-cabinda',
    name: 'Província de Cabinda (Cabinda Centro)',
    shortName: 'Cabinda',
    region: 'Províncias',
    fee: 7000,
    estimatedTime: '48 a 72 horas',
    description: 'Envio aéreo com embalagem reforçada de fábrica.'
  },
  {
    id: 'prov-malanje-uige',
    name: 'Províncias Norte/Leste (Malanje, Uíge, Zaire, Cuanza Norte)',
    shortName: 'Malanje / Uíge / Zaire',
    region: 'Províncias',
    fee: 6000,
    estimatedTime: '3 a 5 dias úteis',
    description: 'Expedição com rastreamento de transportadora.'
  },
  {
    id: 'prov-leste-sul',
    name: 'Outras Províncias (Bié, Moxico, Namibe, Lunda Norte/Sul, Cunene, Cuando Cubango)',
    shortName: 'Outras Províncias',
    region: 'Províncias',
    fee: 6500,
    estimatedTime: '3 a 5 dias úteis',
    description: 'Expedição nacional para todo o território angolano.'
  },

  // --- LEVANTAMENTO EM LOJA ---
  {
    id: 'pickup-benfica',
    name: 'Levantamento no Centro Operacional (Benfica — Zona Verde, Luanda) — GRÁTIS',
    shortName: 'Levantamento no Benfica (Grátis)',
    region: 'Levantamento',
    fee: 0,
    estimatedTime: 'No próprio dia (08h–19h)',
    description: 'Levante o seu pedido com comodidade na nossa base central.'
  }
];

export function getDeliveryZoneById(id) {
  return DELIVERY_ZONES.find(z => z.id === id) || DELIVERY_ZONES[0];
}

export function calculateDeliveryFee(zoneId) {
  const zone = getDeliveryZoneById(zoneId);
  return zone ? zone.fee : 2500;
}
