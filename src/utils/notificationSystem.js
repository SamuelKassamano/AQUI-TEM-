/**
 * Sistema de Notificações, Rastreamento de Visitantes & Alertas — AQUI TEM Angola
 * Suporta Notificações do Navegador (Web Notifications API) e Central de Notificações In-App.
 */

import { supabase } from '../lib/supabase.js';

const NOTIFS_PREFS_KEY = 'aquitem_notification_prefs_v1';
const NOTIFS_FEED_KEY = 'aquitem_notification_feed_v1';
const SUBSCRIBED_LEADS_KEY = 'aquitem_subscribed_leads_v1';

// Notificações Padrão de Catálogo (Novos Produtos, Promoções & Stock Limitado)
export const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-stock-1',
    type: 'stock',
    title: '⚠️ Stock Limitado: Oraimo FreePods Lite',
    message: 'Restam apenas 4 unidades com cancelamento de ruído e 40h de autonomia.',
    date: 'Hoje',
    link: '/produtos?q=freepods',
    isUnread: true
  },
  {
    id: 'notif-promo-1',
    type: 'promo',
    title: '⚡ Oferta Especial: Smartwatch Oraimo Watch Nova 2',
    message: 'Ecrã AMOLED 2.01" e chamadas Bluetooth com desconto imediato para Luanda.',
    date: 'Ontem',
    link: '/produtos?q=nova',
    isUnread: true
  },
  {
    id: 'notif-new-1',
    type: 'new_product',
    title: '🔥 Chegada ao Catálogo: Câmara Wi-Fi 360° PTZ Full HD',
    message: 'Visão noturna colorida, áudio bidirecional e monitoramento direto no telemóvel.',
    date: 'Há 2 dias',
    link: '/produtos?q=camara',
    isUnread: false
  },
  {
    id: 'notif-order-help',
    type: 'order',
    title: '📦 Acompanhe a sua Encomenda em Tempo Real',
    message: 'Consulte o estado de preparação, agendamento e rota de entrega na Área do Cliente.',
    date: 'Ativo',
    link: '/cliente',
    isUnread: false
  }
];

// Obter preferências de notificações
export function getNotificationPrefs() {
  try {
    const raw = localStorage.getItem(NOTIFS_PREFS_KEY);
    return raw ? JSON.parse(raw) : {
      browserPush: false,
      orderUpdates: true,
      newProducts: true,
      promotions: true,
      stockAlerts: true
    };
  } catch (e) {
    return { browserPush: false, orderUpdates: true, newProducts: true, promotions: true, stockAlerts: true };
  }
}

// Salvar preferências
export function saveNotificationPrefs(prefs) {
  try {
    localStorage.setItem(NOTIFS_PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {}
}

// Pedir autorização de Notificações do Navegador
export async function requestBrowserNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { supported: false, granted: false };
  }

  try {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    const current = getNotificationPrefs();
    saveNotificationPrefs({ ...current, browserPush: granted });

    if (granted) {
      sendBrowserNotification(
        '🔔 Notificações Ativadas — AQUI TEM Angola',
        'Receberá alertas em tempo real sobre o estado das suas encomendas e novidades tecnológicas!'
      );
    }

    return { supported: true, granted };
  } catch (e) {
    return { supported: true, granted: false };
  }
}

// Enviar Notificação do Navegador
export function sendBrowserNotification(title, body, url = '/') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notif = new Notification(title, {
      body,
      icon: '/logo.jpg',
      badge: '/logo.jpg',
      tag: 'aquitem-notification'
    });

    notif.onclick = () => {
      window.focus();
      if (url && typeof window !== 'undefined') {
        window.location.href = url;
      }
      notif.close();
    };
  } catch (e) {}
}

// Obter feed de notificações
export function getNotificationFeed() {
  try {
    const raw = localStorage.getItem(NOTIFS_FEED_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFS_FEED_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_NOTIFICATIONS;
  }
}

// Adicionar notificação ao feed
export function addNotificationToFeed(notif) {
  try {
    const current = getNotificationFeed();
    const newNotif = {
      id: `notif-${Date.now()}`,
      date: 'Agora mesmo',
      isUnread: true,
      ...notif
    };
    const updated = [newNotif, ...current.slice(0, 19)];
    localStorage.setItem(NOTIFS_FEED_KEY, JSON.stringify(updated));

    // Também dispara no navegador se permitido
    sendBrowserNotification(newNotif.title, newNotif.message, newNotif.link || '/cliente');

    return updated;
  } catch (e) {
    return [];
  }
}

// Rastrear visitante / subscrição de Notificações e Leads (Email + Telefone)
export async function trackAndSubscribeVisitor({ name, email, phone, source = 'site_notification' }) {
  if (!email && !phone) return;

  const leadData = {
    name: name || 'Visitante Rastreio',
    email: email || '',
    phone: phone || '',
    source,
    subscribedAt: new Date().toISOString()
  };

  // 1. Guardar localmente
  try {
    const raw = localStorage.getItem(SUBSCRIBED_LEADS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    localStorage.setItem(SUBSCRIBED_LEADS_KEY, JSON.stringify([leadData, ...list]));
  } catch (e) {}

  // 2. Registar no Supabase se disponível
  try {
    if (supabase) {
      await supabase.from('leads').insert([
        {
          name: leadData.name,
          phone: leadData.phone || 'Sem telefone',
          city: 'Angola',
          address: 'Subscrição Notificações / Área do Cliente',
          product_name: 'Lead Rastreamento & Notificações Ativas',
          status: 'novo',
          notes: `Email: ${leadData.email} | Origem: ${source} | Notificações Ativadas: Sim`
        }
      ]);
    }
  } catch (err) {
    console.warn('Sincronização de lead de notificações:', err);
  }

  // Notificar cliente da confirmação
  addNotificationToFeed({
    type: 'promo',
    title: '🎉 Bem-vindo ao Clube VIP AQUI TEM!',
    message: `Inscrição confirmada para ${email || phone}. Receberá em primeira mão alertas de stock e promoções.`,
    link: '/produtos'
  });
}
