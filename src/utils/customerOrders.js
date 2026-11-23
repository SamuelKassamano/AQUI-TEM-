/**
 * Gestor de Encomendas, Área do Cliente, Rastreio e Recuperação de Carrinho — AQUI TEM Angola
 */

import { supabase } from '../lib/supabase.js';
import {
  syncBrevoContact,
  sendBrevoTransactionalEmail,
  trackBrevoCommerceEvent
} from '../lib/brevoService.js';
import { notifyCompanyWhatsApp } from '../lib/whatsappNotificationService.js';
import { calculateEstimatedDeliveryDate } from './angolaLocations.js';

const ORDERS_STORAGE_KEY = 'aquitem_customer_orders_v1';
const PROFILE_STORAGE_KEY = 'aquitem_customer_profile_v1';
const ABANDONED_CART_KEY = 'aquitem_abandoned_cart_v1';

// Gerador de Código de Encomenda Único (ex: AQT-8421)
export function generateOrderCode() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `AQT-${random}`;
}

// Gerador de Token Criptográfico de Autorização de Comprovativo (Anti-Enumeração & Prova de Posse)
export function generateReceiptToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `rtk_${crypto.randomUUID().replace(/-/g, '')}`;
  }
  const rand = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `rtk_${Date.now()}_${rand}`;
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
  } catch (e) { }
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

// Salvar nova encomenda (com suporte a comprovativo na hora da compra)
export async function createAndSaveOrder({
  customer,
  items,
  subtotal,
  deliveryZone,
  paymentMethod,
  notes,
  receiptFile = null
}) {
  const orderId = generateOrderCode();
  const receiptToken = generateReceiptToken();
  // Regra Estrita: A taxa mínima de transporte deve ser obrigatoriamente 3.000 Kz
  const deliveryFee = Math.max(Number(deliveryZone?.fee ?? 3000), 3000);
  const total = Number(subtotal || 0) + deliveryFee;
  const now = new Date().toISOString();
  const formattedDate = new Date().toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Se o cliente anexou comprovativo (PDF ou Imagem) na hora da compra, realiza o upload prévio
  let uploadRes = null;
  if (receiptFile) {
    try {
      uploadRes = await uploadReceiptDocument(receiptFile, orderId, receiptToken);
    } catch (uploadErr) {
      console.warn('Aviso no upload inicial do comprovativo na hora da compra:', uploadErr);
    }
  }

  const hasReceiptOnPurchase = Boolean(uploadRes?.storagePath);

  // Fluxo oficial de 7 estados:
  // 1. Aguardando Pagamento
  // 2. Comprovativo Recebido
  // 3. Pendente de Confirmação (Validação Financeira)
  // 4. Encomenda Agendada (Confirmação Administrativa & Agendamento)
  // 5. Em Preparação (Embalagem & Controlo de Qualidade)
  // 6. Em Rota (Distribuição com Estafeta)
  // 7. Entregue (Activação da Garantia de 7 Dias)
  const timeline = [
    {
      step: 1,
      title: 'Aguardando Pagamento',
      description: `Pedido #${orderId} registado. Aguardando transferência bancária ou envio Express.`,
      date: formattedDate,
      completed: true
    },
    {
      step: 2,
      title: 'Comprovativo Recebido',
      description: hasReceiptOnPurchase
        ? `Comprovativo de pagamento (${uploadRes.fileName}) anexado na hora da compra. Aguardando validação financeira.`
        : 'Comprovativo de pagamento submetido com sucesso pelo cliente.',
      date: hasReceiptOnPurchase ? formattedDate : 'Pendente',
      completed: hasReceiptOnPurchase
    },
    {
      step: 3,
      title: 'Pendente de Confirmação',
      description: 'Validação e conferência financeira em curso pela tesouraria.',
      date: 'Pendente',
      completed: false
    },
    {
      step: 4,
      title: 'Encomenda Agendada',
      description: 'Pagamento conferido pela administração e data de entrega agendada.',
      date: 'Pendente',
      completed: false
    },
    {
      step: 5,
      title: 'Em Preparação',
      description: 'Verificação técnica de fábrica, empacotamento anti-impacto e controlo de qualidade.',
      date: 'Pendente',
      completed: false
    },
    {
      step: 6,
      title: 'Em Rota de Entrega',
      description: `Motorista/estafeta despachado para entrega no endereço em ${customer.province || customer.city || 'Luanda'}.`,
      date: 'Pendente',
      completed: false
    },
    {
      step: 7,
      title: 'Entregue com Sucesso',
      description: 'Entrega finalizada ao cliente e activação formal da garantia oficial AQUI TEM de 7 dias.',
      date: 'Pendente',
      completed: false
    }
  ];

  const orderRecord = {
    id: orderId,
    trackingCode: orderId,
    trackingNumber: `AQT-TRK-${orderId}`,
    receiptToken,
    createdAt: now,
    status: hasReceiptOnPurchase ? 'Comprovativo Recebido' : 'Aguardando Pagamento',
    statusLabel: hasReceiptOnPurchase ? 'Comprovativo Recebido (Pendente de Validação Financeira)' : 'Aguardando Pagamento',
    receiptAttached: hasReceiptOnPurchase,
    receiptStoragePath: uploadRes?.storagePath || null,
    receiptFileName: uploadRes?.fileName || null,
    receiptUrl: uploadRes?.url || null,
    receiptDate: hasReceiptOnPurchase ? now : null,
    estimatedDeliveryDate: '3 dias úteis após validação do pagamento',
    customer: {
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      province: customer.province || 'Luanda',
      municipality: customer.municipality || 'Luanda',
      address: customer.address || '',
      city: customer.city || `${customer.province || 'Luanda'} — ${customer.municipality || 'Luanda'}`,
      notes: notes || '',
      marketingConsent: Boolean(customer.marketingConsent)
    },
    items: items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || item.category || '',
      price: item.price,
      quantity: Number(item.quantity) || 1,
      image: item.image || item.image_url || '/logo.jpg'
    })),
    subtotal: Number(subtotal || 0),
    deliveryZone: {
      id: deliveryZone?.id || 'delivery-zone',
      name: deliveryZone?.name || `${customer.province || 'Luanda'} (${customer.municipality || 'Centro'})`,
      shortName: deliveryZone?.shortName || customer.province || 'Luanda',
      estimatedTime: deliveryZone?.estimatedTime || '3 dias úteis',
      fee: deliveryFee
    },
    deliveryFee,
    total,
    paymentMethod: paymentMethod || 'Transferência Bancária (Banco BFA)',
    timeline
  };

  // 1. Guardar localmente para consulta imediata do cliente
  try {
    const existing = getLocalOrders();
    const updated = [orderRecord, ...existing.filter(o => o.id !== orderId)];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

    // Salvar perfil do cliente para compras futuras
    saveCustomerProfile({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      province: customer.province,
      municipality: customer.municipality,
      address: customer.address,
      city: customer.city || `${customer.province || 'Luanda'} — ${customer.municipality || 'Luanda'}`
    });

    // Limpar carrinho abandonado já que a compra foi realizada
    clearAbandonedCart();
  } catch (e) {
    console.error('Erro ao guardar pedido localmente:', e);
  }

  // 2. Sincronizar com Supabase (Tabela oficial crm_leads)
  try {
    if (supabase) {
      const orderPayload = {
        lead_code: orderId,
        receipt_token: receiptToken,
        name: customer.name,
        phone: customer.phone,
        city: `${customer.province || 'Luanda'}${customer.municipality ? ` — ${customer.municipality}` : ''}`,
        address: customer.address || 'Angola',
        product_name: items.map(i => `${i.name} (x${i.quantity || 1})`).join(' + '),
        total_value: total,
        status: hasReceiptOnPurchase ? 'Comprovativo Recebido' : 'Novo Lead',
        receipt_storage_path: uploadRes?.storagePath || null,
        receipt_uploaded_at: hasReceiptOnPurchase ? now : null,
        payment_method: paymentMethod || 'Transferência Bancária (Banco BFA)',
        tracking_number: `AQT-TRK-${orderId}`,
        estimated_delivery_date: '3 dias úteis após validação do pagamento',
        traffic_source: 'Loja Online (Novo Checkout)',
        notes: `Código: ${orderId} | Email: ${customer.email} | Telefone: ${customer.phone} | Província: ${customer.province || 'Luanda'} | Município: ${customer.municipality || 'Luanda'} | Frete: ${deliveryFee} Kz | Pagamento: ${paymentMethod}${hasReceiptOnPurchase ? ` | Comprovativo: ${uploadRes.fileName}` : ''}${notes ? ` | Obs: ${notes}` : ''}`,
        history: [
          {
            date: now,
            action: 'Pedido Registado no Checkout',
            details: `Código: #${orderId} | Total: ${total.toLocaleString('pt-AO')} Kz | Método: ${paymentMethod} | Status: ${hasReceiptOnPurchase ? 'Comprovativo Recebido' : 'Aguardando Pagamento'}`
          },
          ...(hasReceiptOnPurchase ? [{
            date: now,
            action: 'Comprovativo de Pagamento Anexado na Compra',
            details: `Ficheiro: ${uploadRes.fileName} no bucket privado payment-receipts`
          }] : [])
        ]
      };

      const { error: crmErr } = await supabase.from('crm_leads').insert([orderPayload]);
      if (crmErr) {
        try {
          await supabase.from('leads').insert([orderPayload]);
        } catch (_leadErr) { }
        console.warn('Aviso ao gravar em crm_leads:', crmErr.message);
      }
    }
  } catch (err) {
    console.warn('Aviso: Sincronização Supabase em modo local:', err);
  }

  // Se o cliente anexou o comprovativo na compra e tem e-mail, enviar notificação de recepção
  if (hasReceiptOnPurchase && customer.email && customer.email.includes('@')) {
    setTimeout(async () => {
      try {
        await sendBrevoTransactionalEmail({
          templateType: 'receipt_submitted',
          to: customer.email,
          recipientName: customer.name || 'Cliente AQUI TEM',
          orderData: {
            id: orderId,
            total,
            statusLabel: 'Comprovativo Recebido (Em Validação Financeira)'
          }
        });
      } catch (_e) { }
    }, 1500);
  }

  // 3. Sincronização Segura e Não-Bloqueante com o Brevo (Fail-Safe)
  // 3. Sincronização Segura com o Brevo (E-mail de Encomenda Criada)
  if (customer.email && customer.email.includes('@')) {
    setTimeout(async () => {
      try {
        // Sincronizar dados do contacto
        await syncBrevoContact({
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          city: customer.city,
          city: `${customer.province || 'Luanda'} - ${customer.municipality || ''}`,
          address: customer.address,
          marketingConsent: Boolean(customer.marketingConsent)
        });

        // Enviar E-mail Transaccional de Confirmação de Encomenda
        await sendBrevoTransactionalEmail({
          templateType: 'order_confirmation',
          to: customer.email,
          recipientName: customer.name,
          orderData: {
            id: orderId,
            orderDate: formattedDate,
            total,
            items: items.map(i => ({ name: i.name, quantity: Number(i.quantity) || 1 })),
            deliveryZone: deliveryZone?.name || 'Luanda',
            subtotal: Number(subtotal || 0),
            deliveryFee,
            items: items.map(i => ({
              name: i.name,
              description: i.description || i.category || '',
              price: i.price,
              quantity: Number(i.quantity) || 1
            })),
            customerPhone: customer.phone,
            customerEmail: customer.email,
            province: customer.province || 'Luanda',
            municipality: customer.municipality || 'Luanda',
            deliveryZone: deliveryZone?.name || customer.province || 'Luanda',
            address: customer.address,
            city: customer.city || customer.province,
            paymentMethod,
            paymentStatus: 'Aguardando Pagamento',
            trackingNumber: `AQT-TRK-${orderId}`,
            estimatedDeliveryDate: '3 dias úteis após validação do pagamento'
          },
          deduplicationKey: `order_confirmation-${orderId}`
        });

        // Registar evento de comércio electrónico no Brevo
        await trackBrevoCommerceEvent({
          eventName: 'order_created',
          email: customer.email,
          eventId: `order_created-${orderId}`,
          properties: {
            orderId,
            total,
            itemsCount: items.length
          }
        });
      } catch (brevoErr) {
        console.warn('Aviso: Falha não-bloqueante no envio Brevo:', brevoErr);
      }
    }, 10);
  }

  // Notificação WhatsApp para a Empresa (+244 950 752 933): Nova Encomenda
  setTimeout(() => {
    notifyCompanyWhatsApp({
      eventType: 'order_created',
      orderData: {
        id: orderId,
        orderDate: formattedDate,
        total,
        subtotal: Number(subtotal || 0),
        deliveryFee,
        items: items.map(i => ({
          name: i.name,
          quantity: Number(i.quantity) || 1,
          price: i.price
        })),
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        province: customer.province || 'Luanda',
        municipality: customer.municipality || 'Luanda',
        address: customer.address,
        paymentMethod,
        paymentStatus: hasReceiptOnPurchase ? 'Comprovativo Recebido na Compra' : 'Aguardando Pagamento'
      },
      deduplicationKey: `company-wa-created-${orderId}`
    }).catch(waErr => console.warn('Aviso: Notificação WhatsApp empresa:', waErr));

    // Se o cliente anexou o comprovativo PDF/Imagem na compra, notifica também com o documento
    if (hasReceiptOnPurchase && uploadRes?.storagePath) {
      notifyCompanyWhatsApp({
        eventType: 'receipt_submitted',
        orderData: {
          id: orderId,
          total,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          receiptStoragePath: uploadRes.storagePath,
          receiptToken,
          receiptDate: new Date().toLocaleString('pt-AO'),
          paymentStatus: 'Comprovativo Recebido na Compra (Pendente de Validação)'
        },
        deduplicationKey: `company-wa-receipt-${orderId}`
      }).catch(waErr => console.warn('Aviso: Notificação WhatsApp comprovativo compra:', waErr));
    }
  }, 15);

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

// Consultar encomenda online de forma segura via Edge Function (receipt-access: track-order)
export async function trackOrderOnline(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('Código de rastreio ou encomenda inválido.');
  }

  const cleanQuery = query.trim();

  try {
    if (supabase?.functions) {
      const { data, error } = await supabase.functions.invoke('receipt-access', {
        body: {
          action: 'track-order',
          code: cleanQuery
        }
      });

      if (!error && data?.success && data?.order) {
        const remote = data.order;
        const local = findOrder(cleanQuery) || {};

        const mergedOrder = {
          ...local,
          id: remote.orderCode || local.id || cleanQuery,
          trackingCode: remote.orderCode || local.id || cleanQuery,
          trackingNumber: remote.trackingNumber || local.trackingNumber || `AQT-TRK-${remote.orderCode}`,
          status: remote.status || local.status || 'Aguardando Pagamento',
          statusLabel: remote.status || local.status || 'Aguardando Pagamento',
          createdAt: remote.orderDate || local.createdAt || new Date().toISOString(),
          paymentConfirmedAt: remote.paymentConfirmedAt || local.paymentConfirmedAt || null,
          estimatedDeliveryDate: remote.estimatedDeliveryDate || local.estimatedDeliveryDate || '3 dias úteis',
          timeline: (remote.history && remote.history.length > 0)
            ? remote.history.map((h, i) => ({
              step: i + 1,
              title: h.action,
              description: h.details,
              date: h.date ? new Date(h.date).toLocaleDateString('pt-AO') : 'Concluído',
              completed: true
            }))
            : (local.timeline || []),
          customer: {
            name: remote.customer?.name || local.customer?.name || 'Cliente AQUI TEM',
            phone: local.customer?.phone || '',
            email: local.customer?.email || '',
            address: local.customer?.address || remote.customer?.location || 'Luanda',
            city: remote.customer?.location || local.customer?.city || 'Luanda'
          },
          items: local.items || [
            {
              name: remote.product || 'Artigo AQUI TEM',
              price: Number(remote.totalValue || 0) > 3000 ? (Number(remote.totalValue) - 3000) : Number(remote.totalValue || 0),
              quantity: 1,
              image: '/logo.jpg'
            }
          ],
          subtotal: Number(local.subtotal || (Number(remote.totalValue || 0) > 3000 ? (Number(remote.totalValue) - 3000) : Number(remote.totalValue || 0))),
          deliveryFee: Math.max(Number(local.deliveryFee || 3000), 3000),
          total: Number(remote.totalValue || local.total || 0),
          paymentMethod: local.paymentMethod || 'Transferência Bancária / Multicaixa Express'
        };

        // Salvar / atualizar no cache local para persistência de navegação
        const currentOrders = getLocalOrders();
        const existingIdx = currentOrders.findIndex(o => o.id === mergedOrder.id || o.trackingCode === mergedOrder.id);
        if (existingIdx >= 0) {
          currentOrders[existingIdx] = { ...currentOrders[existingIdx], ...mergedOrder };
        } else {
          currentOrders.unshift(mergedOrder);
        }
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(currentOrders));

        return mergedOrder;
      }
    }
  } catch (err) {
    console.warn('Consulta remota falhou, a recorrer ao histórico local:', err);
  }

  const localFound = findOrder(cleanQuery);
  if (localFound) return localFound;

  throw new Error(`Nenhuma encomenda encontrada com "${cleanQuery}". Verifique o código recebido no WhatsApp ou e-mail.`);
}

// Gestor de Carrinho Abandonado (Recuperação de Carrinho)
export function saveAbandonedCart(cartItems, customerInfo = null) {
  if (!cartItems || cartItems.length === 0) {
    clearAbandonedCart();
    return;
  }
  try {
    const cust = customerInfo || getSavedCustomerProfile() || {};
    const data = {
      savedAt: new Date().toISOString(),
      items: cartItems,
      customer: cust
    };
    localStorage.setItem(ABANDONED_CART_KEY, JSON.stringify(data));

    // Recuperação de carrinhos abandonados, respeitando o consentimento aplicável
    if (cust.email && cust.email.includes('@') && Boolean(cust.marketingConsent)) {
      setTimeout(async () => {
        try {
          const totalVal = cartItems.reduce((acc, it) => acc + (Number(it.price || 0) * (Number(it.quantity) || 1)), 0);
          await trackBrevoCommerceEvent({
            eventName: 'cart_abandoned',
            email: cust.email,
            eventId: `cart_abandoned-${cust.email}-${new Date().toISOString().slice(0, 10)}`,
            properties: {
              itemsCount: cartItems.length,
              totalValue: totalVal
            }
          });
        } catch (_e) { }
      }, 500);
    }
  } catch (e) { }
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
  } catch (e) { }
}

// Anexar Comprovativo de Pagamento e Notificar Validação
// Anexar Comprovativo de Pagamento e Notificar Validação Financeira
// REGRA RESTRITA: O envio do comprovativo NUNCA confirma automaticamente o pagamento!
export function attachPaymentReceipt(orderId, receiptData) {
  try {
    const orders = getLocalOrders();
    let targetOrder = null;
    const nowStr = new Date().toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        const newTimeline = (ord.timeline || []).map(step => {
          if (step.step === 2) {
            return {
              ...step,
              completed: true,
              date: nowStr,
              description: 'Comprovativo de pagamento submetido com sucesso. Aguardando validação pela tesouraria.'
            };
          }
          return step;
        });

        const isReceiptObj = typeof receiptData === 'object' && receiptData !== null;
        const receiptNote = isReceiptObj
          ? `Comprovativo anexado: ${receiptData.fileName || 'documento'} (${receiptData.source || 'portal'})`
          : (receiptData || 'Comprovativo enviado');

        targetOrder = {
          ...ord,
          status: 'Comprovativo Recebido',
          statusLabel: 'Comprovativo Recebido (Pendente de Validação Financeira)',
          receiptAttached: true,
          receiptData: receiptNote,
          receiptUrl: isReceiptObj ? (receiptData.url || null) : null,
          receiptStoragePath: isReceiptObj ? (receiptData.storagePath || null) : null,
          receiptFileName: isReceiptObj ? (receiptData.fileName || null) : null,
          receiptDate: new Date().toISOString(),
          timeline: newTimeline
        };
        return targetOrder;
      }
      return ord;
    });

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

    // Atualizar status e caminho do comprovativo no Supabase crm_leads de forma segura
    if (supabase && targetOrder) {
      const nowIso = new Date().toISOString();
      const updatePayload = {
        status: 'Em Atendimento',
        receipt_uploaded_at: nowIso
      };
      if (targetOrder.receiptStoragePath) {
        updatePayload.receipt_storage_path = targetOrder.receiptStoragePath;
      }
      supabase.from('crm_leads').update(updatePayload).eq('lead_code', orderId).then(() => { }).catch(() => { });

      // Invocação com privilégios de backend via Edge Function para contornar RLS do cliente
      if (supabase.functions && targetOrder.receiptStoragePath) {
        supabase.functions.invoke('receipt-access', {
          body: {
            action: 'register-receipt',
            orderCode: orderId,
            receiptToken: targetOrder.receiptToken,
            storagePath: targetOrder.receiptStoragePath
          }
        }).catch(() => { });
      }
    }

    // Regra Fundamental: Enviar e-mail de confirmação da recepção do comprovativo
    // O pagamento permanece PENDENTE até validação manual do administrador
    const resolvedEmail = targetOrder?.customer?.email ||
      (targetOrder?.notes ? (targetOrder.notes.match(/Email:\s*([^\s|]+@[^\s|]+)/i) || targetOrder.notes.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/))?.[1] : '') ||
      getSavedCustomerProfile()?.email || '';

    if (resolvedEmail && resolvedEmail.includes('@')) {
      setTimeout(async () => {
        try {
          await sendBrevoTransactionalEmail({
            templateType: 'receipt_submitted',
            to: resolvedEmail,
            recipientName: targetOrder.customer?.name || 'Cliente AQUI TEM',
            orderData: {
              id: targetOrder.id,
              orderDate: targetOrder.createdAt ? new Date(targetOrder.createdAt).toLocaleDateString('pt-AO') : new Date().toLocaleDateString('pt-AO'),
              total: targetOrder.total,
              subtotal: targetOrder.subtotal,
              deliveryFee: targetOrder.deliveryFee,
              items: targetOrder.items,
              customerPhone: targetOrder.customer?.phone,
              customerEmail: resolvedEmail,
              province: targetOrder.customer?.province,
              municipality: targetOrder.customer?.municipality,
              deliveryZone: targetOrder.deliveryZone?.name || 'Luanda',
              address: targetOrder.customer?.address,
              city: targetOrder.customer?.city,
              paymentMethod: targetOrder.paymentMethod,
              paymentStatus: 'Comprovativo Recebido (Pendente de Validação)',
              trackingNumber: targetOrder.trackingNumber || `AQT-TRK-${orderId}`,
              estimatedDeliveryDate: targetOrder.estimatedDeliveryDate || '3 dias úteis após validação do pagamento'
            },
            deduplicationKey: `receipt_submitted-${orderId}`
          });

          await trackBrevoCommerceEvent({
            eventName: 'receipt_submitted',
            email: resolvedEmail,
            eventId: `receipt_submitted-${orderId}`,
            properties: {
              orderId,
              status: 'Comprovativo Recebido',
              total: targetOrder.total
            }
          });
        } catch (e) {
          console.warn('Aviso: Falha ao despachar notificação Brevo de comprovativo:', e);
        }
      }, 10);
    }

    // Notificação WhatsApp para a Empresa (+244 950 752 933): Comprovativo Recebido
    if (targetOrder) {
      setTimeout(() => {
        notifyCompanyWhatsApp({
          eventType: 'receipt_submitted',
          orderData: {
            id: targetOrder.id,
            total: targetOrder.total,
            customerName: targetOrder.customer?.name,
            customerPhone: targetOrder.customer?.phone,
            customerEmail: targetOrder.customer?.email,
            receiptStoragePath: targetOrder.receiptStoragePath,
            receiptToken: targetOrder.receiptToken,
            receiptDate: new Date().toLocaleString('pt-AO'),
            paymentStatus: 'Comprovativo Recebido (Pendente de Validação)'
          },
          deduplicationKey: `company-wa-receipt-${orderId}`
        }).catch(waErr => console.warn('Aviso: Notificação WhatsApp comprovativo empresa:', waErr));
      }, 15);
    }

    return targetOrder;
  } catch (e) {
    return null;
  }
}

// Atualizar Status da Encomenda com Cálculo de 3 Dias Úteis e Disparo de Notificações
export function updateOrderStatus(orderId, newStatus, driverInfo = null, customTracking = null, customDeliveryDate = null) {
  try {
    const orders = getLocalOrders();
    const nowStr = new Date().toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    let targetOrder = null;

    // Padronização dos 7 estados oficiais:
    // Aguardando Pagamento | Comprovativo Recebido | Pendente de Confirmação | Encomenda Agendada | Em Preparação | Em Rota | Entregue
    let canonicalStatus = newStatus;
    if (newStatus === 'pago' || newStatus === 'Venda Realizada') canonicalStatus = 'Encomenda Agendada';
    if (newStatus === 'preparacao') canonicalStatus = 'Em Preparação';
    if (newStatus === 'rota') canonicalStatus = 'Em Rota';
    if (newStatus === 'entregue') canonicalStatus = 'Entregue';

    // Cálculo automático da Previsão de Entrega: 3 DIAS ÚTEIS após confirmação do pagamento
    const deliveryCalc = calculateEstimatedDeliveryDate(new Date(), 3);
    const estimatedDate = customDeliveryDate || deliveryCalc.formattedDate;

    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        let statusLabel = ord.statusLabel;
        const trackingNum = customTracking || ord.trackingNumber || `AQT-TRK-${orderId}`;

        const newTimeline = (ord.timeline || []).map(step => {
          if (canonicalStatus === 'Aguardando Pagamento') {
            return {
              ...step,
              completed: step.step === 1,
              date: step.step === 1 ? (step.date || nowStr) : 'Pendente'
            };
          }
          if (canonicalStatus === 'Comprovativo Recebido') {
            return {
              ...step,
              completed: step.step <= 2,
              date: step.step <= 2 ? (step.date === 'Pendente' ? nowStr : step.date) : 'Pendente'
            };
          }
          if (canonicalStatus === 'Pendente de Confirmação') {
            return {
              ...step,
              completed: step.step <= 3,
              date: step.step <= 3 ? (step.date === 'Pendente' ? nowStr : step.date) : 'Pendente'
            };
          }
          if (canonicalStatus === 'Encomenda Agendada') {
            return {
              ...step,
              completed: step.step <= 4,
              date: step.step <= 4 ? (step.date === 'Pendente' ? nowStr : step.date) : 'Pendente',
              description: step.step === 4
                ? `Pagamento validado e aprovado pela administração. Entrega agendada para ${estimatedDate}.`
                : step.description
            };
          }
          if (canonicalStatus === 'Em Preparação') {
            return {
              ...step,
              completed: step.step <= 5,
              date: step.step <= 5 ? (step.date === 'Pendente' ? nowStr : step.date) : 'Pendente',
              description: step.step === 4
                ? `Pagamento validado e aprovado pela administração. Entrega agendada para ${estimatedDate}.`
                : step.description
            };
          }
          if (canonicalStatus === 'Em Rota') {
            return {
              ...step,
              completed: step.step <= 6,
              date: step.step <= 6 ? (step.date === 'Pendente' ? nowStr : step.date) : 'Pendente',
              description: step.step === 6
                ? (driverInfo
                  ? `Motorista ${driverInfo.driverName} (${driverInfo.driverPhone}) em trânsito com ${driverInfo.vehicle}.`
                  : step.description)
                : step.description
            };
          }
          if (canonicalStatus === 'Entregue') {
            return {
              ...step,
              completed: true,
              date: step.date === 'Pendente' ? nowStr : step.date
            };
          }
          return step;
        });

        if (canonicalStatus === 'Aguardando Pagamento') statusLabel = 'Aguardando Pagamento';
        if (canonicalStatus === 'Comprovativo Recebido') statusLabel = 'Comprovativo Recebido (Pendente de Validação)';
        if (canonicalStatus === 'Pendente de Confirmação') statusLabel = 'Pendente de Confirmação Financeira';
        if (canonicalStatus === 'Encomenda Agendada') statusLabel = 'Encomenda Agendada (Pagamento Confirmado)';
        if (canonicalStatus === 'Em Preparação') statusLabel = 'Em Preparação & Controlo de Qualidade';
        if (canonicalStatus === 'Em Rota') statusLabel = '🚚 Em Rota — Motorista a Caminho!';
        if (canonicalStatus === 'Entregue') statusLabel = '✅ Entregue com Sucesso';

        targetOrder = {
          ...ord,
          status: canonicalStatus,
          statusLabel,
          trackingNumber: trackingNum,
          estimatedDeliveryDate: estimatedDate,
          driver: driverInfo || ord.driver || {
            driverName: 'Mateus Domingos',
            driverPhone: '+244 924 812 345',
            vehicle: 'Viatura Express Toyota (LD-44-82-AO)',
            estimatedArrival: estimatedDate
          },
          timeline: newTimeline
        };
        return targetOrder;
      }
      return ord;
    });

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

    // Notificações automáticas Brevo nas alterações de estado das encomendas
    const resolvedEmail = targetOrder?.customer?.email ||
      (targetOrder?.notes ? (targetOrder.notes.match(/Email:\s*([^\s|]+@[^\s|]+)/i) || targetOrder.notes.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/))?.[1] : '') ||
      getSavedCustomerProfile()?.email || '';

    if (resolvedEmail && resolvedEmail.includes('@')) {
      const templateMap = {
        'Encomenda Agendada': 'payment_confirmed',
        'Em Preparação': 'order_processing',
        'Em Rota': 'order_shipped',
        'Entregue': 'order_delivered'
      };

      const templateType = templateMap[canonicalStatus];
      if (templateType) {
        setTimeout(async () => {
          try {
            await sendBrevoTransactionalEmail({
              templateType,
              to: resolvedEmail,
              recipientName: targetOrder.customer?.name || 'Cliente AQUI TEM',
              orderData: {
                id: targetOrder.id,
                orderDate: targetOrder.createdAt ? new Date(targetOrder.createdAt).toLocaleDateString('pt-AO') : new Date().toLocaleDateString('pt-AO'),
                total: targetOrder.total,
                subtotal: targetOrder.subtotal,
                deliveryFee: targetOrder.deliveryFee,
                items: targetOrder.items,
                customerPhone: targetOrder.customer?.phone,
                customerEmail: resolvedEmail,
                province: targetOrder.customer?.province,
                municipality: targetOrder.customer?.municipality,
                deliveryZone: targetOrder.deliveryZone?.name || 'Luanda',
                address: targetOrder.customer?.address,
                city: targetOrder.customer?.city,
                paymentMethod: targetOrder.paymentMethod,
                paymentStatus: canonicalStatus,
                trackingNumber: targetOrder.trackingNumber || `AQT-TRK-${orderId}`,
                estimatedDeliveryDate: targetOrder.estimatedDeliveryDate || estimatedDate
              },
              deduplicationKey: `${templateType}-${orderId}`
            });

            await trackBrevoCommerceEvent({
              eventName: `order_${canonicalStatus.toLowerCase().replace(/\s+/g, '_')}`,
              email: resolvedEmail,
              eventId: `order_${canonicalStatus}-${orderId}`,
              properties: { orderId, status: canonicalStatus }
            });
          } catch (e) {
            console.warn('Aviso: Falha ao despachar notificação Brevo de estado:', e);
          }
        }, 10);
      }
    }

    // Notificação WhatsApp para a Empresa (+244 950 752 933) nas alterações de estado
    if (targetOrder) {
      const waEventMap = {
        'Encomenda Agendada': 'payment_confirmed',
        'Em Preparação': 'order_processing',
        'Em Rota': 'order_shipped',
        'Entregue': 'order_delivered'
      };
      const waEvent = waEventMap[canonicalStatus];
      if (waEvent) {
        setTimeout(() => {
          notifyCompanyWhatsApp({
            eventType: waEvent,
            orderData: {
              id: targetOrder.id,
              total: targetOrder.total,
              customerName: targetOrder.customer?.name,
              customerPhone: targetOrder.customer?.phone,
              customerEmail: targetOrder.customer?.email,
              province: targetOrder.customer?.province,
              municipality: targetOrder.customer?.municipality,
              address: targetOrder.customer?.address,
              trackingNumber: targetOrder.trackingNumber || `AQT-TRK-${orderId}`,
              estimatedDeliveryDate: targetOrder.estimatedDeliveryDate || estimatedDate,
              paymentStatus: canonicalStatus
            },
            deduplicationKey: `company-wa-${canonicalStatus}-${orderId}`
          }).catch(err => console.warn('Aviso no envio WhatsApp empresa:', err));
        }, 15);
      }
    }

    return targetOrder;
  } catch (e) {
    return null;
  }
}

/**
 * Solicita exclusivamente ao backend (Edge Function receipt-access) um URL assinado temporário.
 * Regra de Segurança Estrita:
 * - O backend valida o par (orderCode, receiptToken) contra a base de dados oficial crm_leads.
 * - Administradores autenticados podem aceder sem token específico.
 * - NENHUMA permissão directa de leitura é concedida ao bucket no frontend.
 */
export async function fetchReceiptSignedUrl({ orderCode, receiptToken, expiresIn = 1800 }) {
  if (!orderCode) throw new Error('Código da encomenda é obrigatório.');

  if (supabase?.functions) {
    try {
      const { data, error } = await supabase.functions.invoke('receipt-access', {
        body: {
          action: 'get-signed-url',
          orderCode,
          receiptToken,
          expiresIn
        }
      });

      if (error) {
        throw new Error(error.message || 'Falha na comunicação com o serviço de segurança.');
      }
      if (!data?.success) {
        throw new Error(data?.message || 'Acesso não autorizado ao comprovativo.');
      }
      return data;
    } catch (err) {
      console.warn('Aviso ao solicitar Signed URL:', err.message);
      throw err;
    }
  }

  throw new Error('Serviço de segurança Supabase indisponível no momento.');
}

/**
 * Regista o comprovativo no backend atómico associando-o ao registo canónico em crm_leads.
 */
export async function registerReceiptWithBackend({ orderCode, receiptToken, storagePath }) {
  if (!orderCode || !storagePath) throw new Error('Código da encomenda e caminho do ficheiro são obrigatórios.');

  if (supabase?.functions) {
    try {
      const { data, error } = await supabase.functions.invoke('receipt-access', {
        body: {
          action: 'register-receipt',
          orderCode,
          receiptToken,
          storagePath
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Aviso ao registar comprovativo no backend:', err.message);
      return null;
    }
  }
  return null;
}
