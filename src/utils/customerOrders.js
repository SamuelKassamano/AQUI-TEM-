/**
 * Gestor de Encomendas, Área do Cliente, Rastreio e Recuperação de Carrinho — AQUI TEM Angola
 */

import { supabase } from '../lib/supabase';

const ORDERS_STORAGE_KEY = 'aquitem_customer_orders_v1';
const PROFILE_STORAGE_KEY = 'aquitem_customer_profile_v1';
const ABANDONED_CART_KEY = 'aquitem_abandoned_cart_v1';

// Gerador de Código de Encomenda Único (ex: AQT-8421)
export function generateOrderCode() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `AQT-${random}`;
}

// Obter perfil do cliente salvo
export function getSavedCustomerProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Salvar perfil do cliente
export function saveCustomerProfile(profile) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {}
}

// Obter todas as encomendas locais
export function getLocalOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Salvar nova encomenda
export async function createAndSaveOrder({
  customer,
  items,
  subtotal,
  deliveryZone,
  paymentMethod,
  notes
}) {
  const orderId = generateOrderCode();
  const deliveryFee = Number(deliveryZone?.fee ?? 2500);
  const total = Number(subtotal || 0) + deliveryFee;
  const now = new Date().toISOString();

  // Timeline inicial
  const timeline = [
    {
      step: 1,
      title: 'Pedido Registado no Sistema',
      description: 'Aguardando validação do comprovativo bancário via WhatsApp.',
      date: new Date().toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      completed: true
    },
    {
      step: 2,
      title: 'Pagamento & Reserva de Stock',
      description: 'Validação pelo departamento financeiro e reserva de artigos selados.',
      date: 'Pendente',
      completed: false
    },
    {
      step: 3,
      title: 'Embalagem & Controlo de Qualidade',
      description: 'Verificação dos selos de fábrica e empacotamento com proteção anti-impacto.',
      date: 'Pendente',
      completed: false
    },
    {
      step: 4,
      title: 'Em Rota de Entrega / Despacho',
      description: `Motorista dedicado em rota para ${customer.address || customer.city}.`,
      date: 'Pendente',
      completed: false
    },
    {
      step: 5,
      title: 'Entrega Concluída com Sucesso',
      description: 'Artigo recebido pelo cliente e ativação da garantia de troca de 7 dias.',
      date: 'Pendente',
      completed: false
    }
  ];

  const orderRecord = {
    id: orderId,
    trackingCode: orderId,
    createdAt: now,
    status: 'registado', // registado | pago | preparacao | rota | entregue
    statusLabel: 'Pedido Registado (Aguardando Comprovativo)',
    customer: {
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || 'Luanda',
      notes: notes || ''
    },
    items: items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: Number(item.quantity) || 1,
      image: item.image || item.image_url || '/logo.jpg'
    })),
    subtotal,
    deliveryZone: {
      id: deliveryZone?.id || 'luanda-central',
      name: deliveryZone?.name || 'Luanda',
      shortName: deliveryZone?.shortName || 'Luanda',
      estimatedTime: deliveryZone?.estimatedTime || '24h',
      fee: deliveryFee
    },
    deliveryFee,
    total,
    paymentMethod,
    timeline
  };

  // 1. Guardar localmente para o cliente consultar a qualquer momento
  try {
    const existing = getLocalOrders();
    const updated = [orderRecord, ...existing.filter(o => o.id !== orderId)];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

    // Salvar perfil do cliente para compras futuras
    saveCustomerProfile({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city
    });

    // Limpar carrinho abandonado já que a compra foi realizada
    clearAbandonedCart();
  } catch (e) {
    console.error('Erro ao guardar pedido localmente:', e);
  }

  // 2. Sincronizar com Supabase se disponível
  try {
    if (supabase) {
      await supabase.from('leads').insert([
        {
          name: customer.name,
          phone: customer.phone,
          city: `${customer.city} (${deliveryZone?.shortName || ''})`,
          address: customer.address,
          product_name: items.map(i => `${i.name} (x${i.quantity || 1})`).join(' + '),
          total_value: total,
          status: 'novo_pedido',
          notes: `Código: ${orderId} | Email: ${customer.email} | Frete: ${deliveryFee} Kz | Pagamento: ${paymentMethod}`
        }
      ]);
    }
  } catch (err) {
    console.warn('Aviso: Sincronização Supabase remota em fallback local:', err);
  }

  return orderRecord;
}

// Procurar encomenda por Código, Telefone ou Email
export function findOrder(query) {
  if (!query) return null;
  const clean = query.trim().toLowerCase();
  const orders = getLocalOrders();

  return orders.find(o => {
    const matchId = (o.id || '').toLowerCase() === clean;
    const matchTracking = (o.trackingCode || '').toLowerCase() === clean;
    const matchPhone = (o.customer?.phone || '').replace(/\D/g, '').includes(clean.replace(/\D/g, ''));
    const matchEmail = (o.customer?.email || '').toLowerCase() === clean;
    return matchId || matchTracking || (clean.length > 4 && (matchPhone || matchEmail));
  }) || null;
}

// Gestor de Carrinho Abandonado (Recuperação de Carrinho)
export function saveAbandonedCart(cartItems, customerInfo = null) {
  if (!cartItems || cartItems.length === 0) {
    clearAbandonedCart();
    return;
  }
  try {
    const data = {
      savedAt: new Date().toISOString(),
      items: cartItems,
      customer: customerInfo || getSavedCustomerProfile() || {}
    };
    localStorage.setItem(ABANDONED_CART_KEY, JSON.stringify(data));
  } catch (e) {}
}

export function getAbandonedCart() {
  try {
    const raw = localStorage.getItem(ABANDONED_CART_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearAbandonedCart() {
  try {
    localStorage.removeItem(ABANDONED_CART_KEY);
  } catch (e) {}
}

// Anexar Comprovativo de Pagamento e Notificar Validação
export function attachPaymentReceipt(orderId, receiptData) {
  try {
    const orders = getLocalOrders();
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        const nowStr = new Date().toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        const newTimeline = ord.timeline.map(step => {
          if (step.step === 2) {
            return {
              ...step,
              completed: true,
              date: nowStr,
              description: 'Comprovativo enviado via WhatsApp / Portal. Em validação financeira imediata.'
            };
          }
          return step;
        });

        return {
          ...ord,
          status: 'comprovativo_enviado',
          statusLabel: 'Comprovativo Enviado (Em Validação Financeira)',
          receiptAttached: true,
          receiptData: receiptData || 'Comprovativo enviado pelo WhatsApp',
          receiptDate: new Date().toISOString(),
          timeline: newTimeline
        };
      }
      return ord;
    });

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    return updated.find(o => o.id === orderId);
  } catch (e) {
    return null;
  }
}

// Atualizar Status da Encomenda (Desbloqueio de Rota / Entrega)
export function updateOrderStatus(orderId, newStatus, driverInfo = null) {
  try {
    const orders = getLocalOrders();
    const nowStr = new Date().toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        let statusLabel = ord.statusLabel;
        const newTimeline = ord.timeline.map(step => {
          if (newStatus === 'pago' && step.step <= 2) {
            return { ...step, completed: true, date: step.date === 'Pendente' ? nowStr : step.date };
          }
          if (newStatus === 'preparacao' && step.step <= 3) {
            return { ...step, completed: true, date: step.date === 'Pendente' ? nowStr : step.date };
          }
          if (newStatus === 'rota' && step.step <= 4) {
            return {
              ...step,
              completed: true,
              date: step.date === 'Pendente' ? nowStr : step.date,
              description: driverInfo
                ? `Motorista ${driverInfo.driverName} (${driverInfo.driverPhone}) em trânsito com ${driverInfo.vehicle}. Previsão: ${driverInfo.estimatedArrival || 'Hoje'}.`
                : step.description
            };
          }
          if (newStatus === 'entregue') {
            return { ...step, completed: true, date: nowStr };
          }
          return step;
        });

        if (newStatus === 'pago') statusLabel = 'Pagamento Confirmado & Stock Reservado';
        if (newStatus === 'preparacao') statusLabel = 'Em Preparação & Controlo de Qualidade';
        if (newStatus === 'rota') statusLabel = '🚚 ROTA DESBLOQUEADA — Motorista a Caminho!';
        if (newStatus === 'entregue') statusLabel = '✅ Entregue com Sucesso';

        return {
          ...ord,
          status: newStatus,
          statusLabel,
          driver: driverInfo || ord.driver || {
            driverName: 'Mateus Domingos',
            driverPhone: '+244 924 812 345',
            vehicle: 'Viatura Express Toyota (LD-44-82-AO)',
            estimatedArrival: 'Hoje entre 14h00 e 17h00'
          },
          timeline: newTimeline
        };
      }
      return ord;
    });

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    return updated.find(o => o.id === orderId);
  } catch (e) {
    return null;
  }
}
