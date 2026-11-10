import fs from 'fs';
import path from 'path';

// 1. Definições oficiais dos 18 produtos Oraimo com preços reais de ao.oraimo.com + 25% + 4000 Kz
const ORAIMO_PRICE_UPDATES = [
  {
    id: 'f1a1001a-1111-5001-a001-000000000052',
    slug: 'fones-sem-fio-oraimo-spacebuds-neo-otw-323',
    name: 'Fones de Ouvido Sem Fio Oraimo SpaceBuds Neo OTW-323 com BassUp',
    supplierCost: 14400,
    margin25: 3600,
    logistics: 4000,
    salePrice: 22000,
    regularPrice: 28000
  },
  {
    id: 'f2a2002b-2222-5002-a002-000000000053',
    slug: 'carregador-rapido-parede-oraimo-firefly-3-ocw-e66s',
    name: 'Carregador Rápido de Parede Oraimo Firefly 3 OCW-E66S com Cabo M53',
    supplierCost: 4100,
    margin25: 1025,
    logistics: 4000,
    salePrice: 9125,
    regularPrice: 12000
  },
  {
    id: 'f3a3003c-3333-5003-a003-000000000054',
    slug: 'difusor-aromas-humidificador-oraimo-oad-213a',
    name: 'Difusor de Aromas e Humidificador Inteligente Oraimo OAD-213A com Luz Noturna',
    supplierCost: 26200,
    margin25: 6550,
    logistics: 4000,
    salePrice: 36750,
    regularPrice: 44000
  },
  {
    id: 'f4a4004d-4444-5004-a004-000000000055',
    slug: 'fones-ouvido-bluetooth-pescoco-oraimo-necklace-neo',
    name: 'Fones de Ouvido Bluetooth de Pescoço Oraimo Necklace Neo OEB-E310 50h de Bateria',
    supplierCost: 7500,
    margin25: 1875,
    logistics: 4000,
    salePrice: 13375,
    regularPrice: 18000
  },
  {
    id: 'f5a5005e-5555-5005-a005-000000000056',
    slug: 'garrafa-termica-quicksip-620ml-oraimo-ohdw-001',
    name: 'Garrafa Térmica Isolada a Vácuo Oraimo QuickSip 620ml OHDW-001 Aço Inox',
    supplierCost: 15900,
    margin25: 3975,
    logistics: 4000,
    salePrice: 23875,
    regularPrice: 29000
  },
  {
    id: 'f6a6006f-6666-5006-a006-000000000057',
    slug: 'camera-seguranca-wifi-oraimo-vigicam-3mp-osh-015a',
    name: 'Câmara Wi-Fi de Segurança Oraimo Vigicam 3MP Ultra HD Visão Noturna OSH-015A',
    supplierCost: 35000,
    margin25: 8750,
    logistics: 4000,
    salePrice: 47750,
    regularPrice: 58000
  },
  {
    id: 'f7a7007a-7777-5007-a007-000000000058',
    slug: 'coluna-som-bluetooth-oraimo-spacebox-pro-obs-682',
    name: 'Coluna de Som Portátil Bluetooth Oraimo SpaceBox Pro OBS-682 Graves Potentes 80W',
    supplierCost: 104200,
    margin25: 26050,
    logistics: 4000,
    salePrice: 134250,
    regularPrice: 155000
  },
  {
    id: 'f8a8008b-8888-5008-a008-000000000059',
    slug: 'smartwatch-oraimo-watch-5-lite-osw-804-hd',
    name: 'Smartwatch Oraimo Watch 5 Lite OSW-804 Ecrã HD 2.01" Chamadas Bluetooth',
    supplierCost: 16900,
    margin25: 4225,
    logistics: 4000,
    salePrice: 25125,
    regularPrice: 32000
  },
  {
    id: 'f9a9009c-9999-5009-a009-000000000060',
    slug: 'fones-ouvido-open-ear-oraimo-openair-opn-670n',
    name: 'Fones de Ouvido Open-Ear Oraimo OpenAir OPN-670N Condução de Ar e Graves',
    supplierCost: 29000,
    margin25: 7250,
    logistics: 4000,
    salePrice: 40250,
    regularPrice: 48000
  },
  {
    id: 'f0b0010d-0000-5010-b010-000000000061',
    slug: 'power-bank-oraimo-toast-10-opb-1205n-10000mah',
    name: 'Power Bank Oraimo Toast 10 OPB-1205N 10.000mAh Dupla Saída Rápida',
    supplierCost: 14000,
    margin25: 3500,
    logistics: 4000,
    salePrice: 21500,
    regularPrice: 26000
  },
  {
    id: 'f1b1011e-1111-5011-b011-000000000062',
    slug: 'jarro-eletrico-chaleira-inox-oraimo-of-kk200n-1-8l',
    name: 'Jarro Elétrico Chaleira em Aço Inox Oraimo OF-KK200N 1.8 Litros Fervura Rápida',
    supplierCost: 37700,
    margin25: 9425,
    logistics: 4000,
    salePrice: 51125,
    regularPrice: 62000
  },
  {
    id: 'f2b2012f-2222-5012-b012-000000000063',
    slug: 'smartwatch-oraimo-watch-4-plus-osw-824-hd-2-01',
    name: 'Smartwatch Oraimo Watch 4 Plus OSW-824 Ecrã HD 2.01" com Chamadas Bluetooth',
    supplierCost: 29300,
    margin25: 7325,
    logistics: 4000,
    salePrice: 40625,
    regularPrice: 49000
  },
  {
    id: 'f3b3013a-3333-5013-b013-000000000064',
    slug: 'relogio-inteligente-oraimo-watch-nova-osw-833n-rose-gold',
    name: 'Relógio Inteligente Oraimo Watch Nova OSW-833N Rose Gold com Display AMOLED',
    supplierCost: 38200,
    margin25: 9550,
    logistics: 4000,
    salePrice: 51750,
    regularPrice: 62000
  },
  {
    id: 'f4b4014b-4444-5014-b014-000000000065',
    slug: 'smartwatch-redondo-oraimo-watch-er-osw-814s-amoled',
    name: 'Smartwatch Redondo Oraimo Watch ER OSW-814S Display AMOLED Always-On',
    supplierCost: 40200,
    margin25: 10050,
    logistics: 4000,
    salePrice: 54250,
    regularPrice: 65000
  },
  {
    id: 'f5b5015c-5555-5015-b015-000000000066',
    slug: 'secador-cabelo-profissional-oraimo-swiftdry-2-ohd-210n',
    name: 'Secador de Cabelo Profissional Oraimo SwiftDry 2 OHD-210N com Tecnologia Iónica',
    supplierCost: 19700,
    margin25: 4925,
    logistics: 4000,
    salePrice: 28625,
    regularPrice: 35000
  },
  {
    id: 'f6b6016d-6666-5016-b016-000000000067',
    slug: 'maquina-cortar-cabelo-oraimo-smartclipper-2-opc-cl30c',
    name: 'Máquina de Cortar Cabelo Profissional Oraimo SmartClipper 2 OPC-CL30C Bateria 150min',
    supplierCost: 20500,
    margin25: 5125,
    logistics: 4000,
    salePrice: 29625,
    regularPrice: 36000
  },
  {
    id: 'f7b7017e-7777-5017-b017-000000000068',
    slug: 'roteador-wifi-dual-band-oraimo-falcon-ac-of-wr205n',
    name: 'Roteador Wi-Fi Dual Band Oraimo Falcon AC OF-WR205N AC1200 com 4 Antenas 5dBi',
    supplierCost: 49400,
    margin25: 12350,
    logistics: 4000,
    salePrice: 65750,
    regularPrice: 78000
  },
  {
    id: 'f8b8018f-8888-5018-b018-000000000069',
    slug: 'coluna-bluetooth-360-oraimo-soundflow-obs-680-rgb',
    name: 'Coluna Bluetooth 360° Oraimo SoundFlow OBS-680 com Show de Luzes RGB e Graves',
    supplierCost: 43100,
    margin25: 10775,
    logistics: 4000,
    salePrice: 57875,
    regularPrice: 68000
  }
];

// Update data/products.js
const productsPath = path.resolve('data/products.js');
let productsContent = fs.readFileSync(productsPath, 'utf8');

for (const upd of ORAIMO_PRICE_UPDATES) {
  // Replace price and original_price for this product in data/products.js
  const idRegex = new RegExp(`id:\\s*'${upd.id}'[\\s\\S]*?original_price:\\s*\\d+`, 'm');
  const match = productsContent.match(idRegex);
  if (match) {
    let block = match[0];
    block = block.replace(/price:\s*\d+/, `price: ${upd.salePrice}`);
    block = block.replace(/original_price:\s*\d+/, `original_price: ${upd.regularPrice}`);
    if (upd.id === 'f6a6006f-6666-5006-a006-000000000057') {
      block = block.replace(/name:\s*'[^']+'/, `name: '${upd.name}'`);
      block = block.replace(/slug:\s*'[^']+'/, `slug: '${upd.slug}'`);
    }
    productsContent = productsContent.replace(match[0], block);
    console.log(`Updated data/products.js for ${upd.slug} -> ${upd.salePrice} Kz`);
  } else {
    console.warn(`Could not find id ${upd.id} in data/products.js`);
  }
}

fs.writeFileSync(productsPath, productsContent, 'utf8');
console.log('Successfully updated data/products.js!');
