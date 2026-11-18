/**
 * Províncias, Municípios de Angola e Cálculo de Prazos de Entrega — AQUI TEM Angola
 */

export const ANGOLA_PROVINCES = [
  {
    name: 'Luanda',
    capital: 'Luanda',
    municipalities: [
      'Luanda',
      'Talatona',
      'Belas',
      'Kilamba Kiaxi',
      'Cazenga',
      'Viana',
      'Cacuaco',
      'Icolo e Bengo',
      'Quissama'
    ],
    defaultDeliveryFee: 3000
  },
  {
    name: 'Bengo',
    capital: 'Caxito',
    municipalities: ['Dande (Caxito)', 'Ambriz', 'Bula Atumba', 'Nambuangongo', 'Pango Aluquém'],
    defaultDeliveryFee: 4500
  },
  {
    name: 'Benguela',
    capital: 'Benguela',
    municipalities: ['Benguela', 'Lobito', 'Catumbela', 'Baía Farta', 'Bocoio', 'Balombo', 'Caimbambo', 'Cubal', 'Ganda'],
    defaultDeliveryFee: 5500
  },
  {
    name: 'Huambo',
    capital: 'Huambo',
    municipalities: ['Huambo', 'Caála', 'Bailundo', 'Catchiungo', 'Chicala-Choloanga', 'Chinjenje', 'Ecunha', 'Londuimbali', 'Longonjo', 'Mungo', 'Ucuma'],
    defaultDeliveryFee: 5500
  },
  {
    name: 'Huíla',
    capital: 'Lubango',
    municipalities: ['Lubango', 'Caconda', 'Caluquembe', 'Chibia', 'Chicomba', 'Chipindo', 'Cuvango', 'Humpata', 'Jamba', 'Matala', 'Quilengues', 'Quipungo'],
    defaultDeliveryFee: 6000
  },
  {
    name: 'Cabinda',
    capital: 'Cabinda',
    municipalities: ['Cabinda', 'Cacongo', 'Buco-Zau', 'Belize'],
    defaultDeliveryFee: 7000
  },
  {
    name: 'Cuanza Sul',
    capital: 'Sumbe',
    municipalities: ['Sumbe', 'Porto Amboim', 'Amboim (Gabela)', 'Cassongue', 'Cela (Waku Kungo)', 'Conda', 'Ebo', 'Libolo', 'Mussende', 'Quibala', 'Quilenda', 'Seles'],
    defaultDeliveryFee: 5500
  },
  {
    name: 'Cuanza Norte',
    capital: 'Ndalatando',
    municipalities: ['Cazengo (Ndalatando)', 'Ambaca', 'Banga', 'Bolongongo', 'Cambambe (Dondo)', 'Golungo Alto', 'Gonguembo', 'Lucala', 'Quiculungo', 'Samba Caju'],
    defaultDeliveryFee: 5500
  },
  {
    name: 'Malanje',
    capital: 'Malanje',
    municipalities: ['Malanje', 'Cacuso', 'Calandula', 'Cambundi-Catembo', 'Cangandala', 'Caombo', 'Cunda-dia-Baze', 'Luquembo', 'Marimba', 'Massango', 'Mucari', 'Quela', 'Quirima'],
    defaultDeliveryFee: 6000
  },
  {
    name: 'Uíge',
    capital: 'Uíge',
    municipalities: ['Uíge', 'Ambuíla', 'Bembe', 'Buengas', 'Bungo', 'Damba', 'Milunga', 'Mucaba', 'Negage', 'Puri', 'Quimbele', 'Quitexe', 'Sanza Pombo', 'Songo', 'Zombo'],
    defaultDeliveryFee: 6000
  },
  {
    name: 'Zaire',
    capital: 'Mbanza Kongo',
    municipalities: ['Mbanza Kongo', 'Soyo', 'Cuimba', 'Noqui', 'Nzeto', 'Tomboco'],
    defaultDeliveryFee: 6500
  },
  {
    name: 'Bié',
    capital: 'Cuito',
    municipalities: ['Cuito', 'Andulo', 'Camacupa', 'Catabola', 'Chinguar', 'Chitembo', 'Cuemba', 'Cunhinga', 'Nharêa'],
    defaultDeliveryFee: 6500
  },
  {
    name: 'Namibe',
    capital: 'Moçâmedes',
    municipalities: ['Moçâmedes', 'Bibala', 'Camucuio', 'Tômbwa', 'Virei'],
    defaultDeliveryFee: 6500
  },
  {
    name: 'Cunene',
    capital: 'Ondjiva',
    municipalities: ['Cuanhama (Ondjiva)', 'Curoca', 'Cuvelai', 'Namacunde', 'Ombadja'],
    defaultDeliveryFee: 6500
  },
  {
    name: 'Lunda Norte',
    capital: 'Dundo',
    municipalities: ['Chitato (Dundo)', 'Cambulo', 'Capenda-Camulemba', 'Caungula', 'Cuango', 'Cuílo', 'Lubalo', 'Lucapa', 'Xá-Muteba'],
    defaultDeliveryFee: 7000
  },
  {
    name: 'Lunda Sul',
    capital: 'Saurimo',
    municipalities: ['Saurimo', 'Cacolo', 'Dala', 'Muconda'],
    defaultDeliveryFee: 7000
  },
  {
    name: 'Moxico',
    capital: 'Luena',
    municipalities: ['Moxico (Luena)', 'Alto Zambeze', 'Bundas', 'Camanongue', 'Léua', 'Luacano', 'Luau', 'Luchazes'],
    defaultDeliveryFee: 7000
  },
  {
    name: 'Cuando Cubango',
    capital: 'Menongue',
    municipalities: ['Menongue', 'Cuangar', 'Cuchi', 'Cuito Cuanavale', 'Dirico', 'Mavinga', 'Nancova', 'Rivungo'],
    defaultDeliveryFee: 7000
  }
];

// Feriados Nacionais Oficiais de Angola (Fixos Mês-Dia)
export const ANGOLA_HOLIDAYS_FIXED = [
  '01-01', // Ano Novo
  '02-04', // Dia do Início da Luta Armada
  '03-08', // Dia Internacional da Mulher
  '04-04', // Dia da Paz e Reconciliação Nacional
  '05-01', // Dia Mundial do Trabalhador
  '09-17', // Dia do Fundador da Nação e do Herói Nacional (Agostinho Neto)
  '11-02', // Dia dos Finados
  '11-11', // Dia da Independência Nacional
  '12-25'  // Natal e Dia da Família
];

/**
 * Calcula a taxa de entrega em Kwanzas com base na província e município.
 * Regra Estrita: A taxa mínima de transporte deve ser obrigatoriamente 3.000 Kz em todo o território nacional.
 */
export function getDeliveryFeeForLocation(provinceName, municipalityName) {
  const prov = ANGOLA_PROVINCES.find(p => p.name.toLowerCase() === (provinceName || '').toLowerCase());
  let fee = 3000;

  if (prov && prov.name === 'Luanda') {
    const muni = (municipalityName || '').toLowerCase();
    if (muni.includes('talatona') || muni.includes('belas') || muni.includes('kilamba')) fee = 3500;
    else if (muni.includes('viana') || muni.includes('cacuaco') || muni.includes('cazenga')) fee = 3500;
    else if (muni.includes('icolo') || muni.includes('quissama')) fee = 4500;
    else fee = 3000; // Luanda Central (Ingombota, Maianga, etc.)
  } else if (prov) {
    fee = prov.defaultDeliveryFee || 5500;
  }

  // Regra Estrita: Nenhuma encomenda pode apresentar transporte inferior a 3.000 Kz
  return Math.max(Number(fee) || 3000, 3000);
}

/**
 * Calcula a previsão de entrega de 3 DIAS ÚTEIS após confirmação do pagamento,
 * excluindo rigorosamente sábados, domingos e feriados nacionais de Angola.
 * 
 * @param {Date|string} fromDate Data de partida (normalmente confirmação do pagamento)
 * @param {number} targetWorkingDays Número de dias úteis (defeito: 3 dias úteis)
 * @returns {{ date: Date, formattedDate: string, daysAdded: number }}
 */
export function calculateEstimatedDeliveryDate(fromDate = new Date(), targetWorkingDays = 3) {
  const current = new Date(fromDate);
  if (isNaN(current.getTime())) {
    return {
      date: new Date(),
      formattedDate: '3 dias úteis após confirmação',
      daysAdded: 3
    };
  }

  let workingDaysCount = 0;
  let safetyCounter = 0;

  while (workingDaysCount < targetWorkingDays && safetyCounter < 30) {
    safetyCounter++;
    current.setDate(current.getDate() + 1);

    const dayOfWeek = current.getDay(); // 0 = Domingo, 6 = Sábado
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const monthDay = `${month}-${day}`;

    // Excluir fins-de-semana (Sábado e Domingo)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }

    // Excluir feriados nacionais de Angola
    if (ANGOLA_HOLIDAYS_FIXED.includes(monthDay)) {
      continue;
    }

    workingDaysCount++;
  }

  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };

  let formatted = current.toLocaleDateString('pt-AO', options);
  // Capitalizar primeira letra
  if (formatted) {
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  return {
    date: current,
    formattedDate: formatted,
    isoDate: current.toISOString().slice(0, 10),
    daysAdded: targetWorkingDays
  };
}
