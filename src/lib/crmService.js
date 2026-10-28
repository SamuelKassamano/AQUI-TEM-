// ==============================================================================
// AQUI TEM - SERVIÇO DE CRM & GESTÃO DE LEADS COM SUPABASE
// ==============================================================================

import { supabase, isSupabaseConfigured, requireAdminSession } from './supabase.js';
import { getTrafficSource, getSessionDurationFormatted } from '../utils/crmTracker.js';

const LOCAL_WEBHOOK_KEY = 'aqui_tem_crm_webhook_url';
const LOCAL_LEADS_BACKUP_KEY = 'aqui_tem_crm_leads_backup';

/**
 * Verifica se um utilizador autenticado tem papel de administrador.
 * Consulta a tabela `public.admin_users` no Supabase.
 */
export async function checkUserIsAdmin(user) {
  if (!user || !user.id || !isSupabaseConfigured || !supabase) {
    return false;
  }
  // No AQUI TEM, qualquer utilizador autenticado pelo Supabase Auth é administrador autorizado da loja
  return true;
}

/**
 * Envia e-mail de recuperação de senha pelo Supabase Auth
 */
export async function sendAdminPasswordReset(email) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase não está configurado. Verifique se a variável VITE_SUPABASE_PUBLISHABLE_KEY está definida na Vercel.'
    );
  }

  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://loja.aqui-tem.vercel.app';
  const redirectTo = `${origin}/admin`;

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo
  });

  if (error) {
    throw error;
  }
  return true;
}

/**
 * Carrega todos os leads do Supabase (Acesso Exclusivo a Administradores Autenticados).
 */
export async function fetchLeadsFromSupabase() {
  await requireAdminSession();

  if (!isSupabaseConfigured || !supabase) {
    return { leads: [], error: 'Supabase não configurado.' };
  }

  try {
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Se a tabela ainda não existir no Supabase
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('A tabela public.crm_leads ainda não foi criada no Supabase.');
        return {
          leads: getLocalLeadsBackup(),
          tableMissing: true,
          error: 'Tabela public.crm_leads não encontrada no Supabase. Execute o script SQL no Supabase SQL Editor.'
        };
      }
      throw error;
    }

    // Normaliza leads do banco
    const normalized = (data || []).map(lead => ({
      id: lead.id,
      leadCode: lead.lead_code || `LEAD-${lead.id.slice(0, 8)}`,
      name: lead.name,
      phone: lead.phone,
      city: lead.city || 'Luanda',
      address: lead.address || 'Angola',
      productName: lead.product_name,
      productPrice: Number(lead.product_price) || 0,
      totalValue: Number(lead.total_value) || 0,
      status: lead.status || 'Novo Lead',
      trafficSource: lead.traffic_source || 'Direto',
      timeOnSite: lead.time_on_site || '0m 0s',
      pagesViewed: lead.pages_viewed || 1,
      notes: lead.notes || '',
      history: Array.isArray(lead.history) ? lead.history : [],
      createdAt: lead.created_at
    }));

    return { leads: normalized, tableMissing: false, error: null };
  } catch (err) {
    console.error('Erro ao carregar leads do Supabase:', err);
    return {
      leads: getLocalLeadsBackup(),
      tableMissing: false,
      error: err.message || 'Erro ao carregar leads do Supabase.'
    };
  }
}

/**
 * Insere um novo lead no Supabase (Pode ser chamado anonimamente ao finalizar compra no WhatsApp).
 * O RLS permite INSERT para anon/authenticated, mas proíbe SELECT de dados de terceiros.
 */
export async function captureLeadInSupabase(leadPayload) {
  const source = getTrafficSource();
  const timeSpent = getSessionDurationFormatted();
  const pages = Number(sessionStorage.getItem('session_page_views') || '1');
  const leadCode = `LEAD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;

  const leadRow = {
    lead_code: leadCode,
    name: leadPayload.name || 'Cliente Sem Nome',
    phone: leadPayload.phone || '',
    city: leadPayload.city || 'Luanda',
    address: leadPayload.address || 'Angola',
    product_name: leadPayload.productName || 'Consulta Geral',
    product_price: Number(leadPayload.productPrice) || 0,
    total_value: Number(leadPayload.totalValue || leadPayload.productPrice) || 0,
    status: 'Novo Lead',
    traffic_source: `${source.name} (${source.type})`,
    time_on_site: timeSpent,
    pages_viewed: pages,
    notes: leadPayload.notes || 'Capturado via intenção de compra WhatsApp / Site.',
    history: [
      {
        date: new Date().toISOString(),
        action: 'Lead Capturado no Site',
        details: `Produto: ${leadPayload.productName || 'Geral'} | Origem: ${source.name}`
      }
    ]
  };

  let savedLead = null;

  if (isSupabaseConfigured && supabase) {
    try {
      // Inserção compatível com RLS anônimo (não executa .select() para evitar violação de RLS em visitantes)
      const { error } = await supabase
        .from('crm_leads')
        .insert([leadRow]);

      if (!error) {
        savedLead = {
          id: `lead-${Date.now()}`,
          leadCode: leadRow.lead_code,
          name: leadRow.name,
          phone: leadRow.phone,
          city: leadRow.city,
          address: leadRow.address,
          productName: leadRow.product_name,
          productPrice: Number(leadRow.product_price) || 0,
          totalValue: Number(leadRow.total_value) || 0,
          status: leadRow.status,
          trafficSource: leadRow.traffic_source,
          timeOnSite: leadRow.time_on_site,
          pagesViewed: leadRow.pages_viewed,
          notes: leadRow.notes,
          history: leadRow.history,
          createdAt: new Date().toISOString()
        };
      } else {
        console.warn('Erro ao inserir lead no Supabase (será enviado via Webhook):', error.message);
      }
    } catch (e) {
      console.warn('Exceção ao inserir lead no Supabase:', e);
    }
  }

  const finalLead = savedLead || {
    id: `local-${Date.now()}`,
    leadCode,
    name: leadRow.name,
    phone: leadRow.phone,
    city: leadRow.city,
    address: leadRow.address,
    productName: leadRow.product_name,
    productPrice: leadRow.product_price,
    totalValue: leadRow.total_value,
    status: leadRow.status,
    trafficSource: leadRow.traffic_source,
    timeOnSite: leadRow.time_on_site,
    pagesViewed: leadRow.pages_viewed,
    notes: leadRow.notes,
    history: leadRow.history,
    createdAt: new Date().toISOString()
  };

  // Salva no backup local temporário
  saveLocalLeadBackup(finalLead);

  // Dispara automação webhook se configurada
  dispatchWebhookToExternalService(finalLead);

  return finalLead;
}

/**
 * Atualiza o status e notas de um lead no Supabase.
 */
export async function updateLeadStatusInSupabase(leadId, newStatus, note = '') {
  await requireAdminSession();

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado.');
  }

  // 1. Busca histórico atual
  const { data: currentLead, error: fetchErr } = await supabase
    .from('crm_leads')
    .select('history')
    .eq('id', leadId)
    .single();

  if (fetchErr && fetchErr.code !== '42P01') {
    throw fetchErr;
  }

  const currentHistory = Array.isArray(currentLead?.history) ? currentLead.history : [];
  const newHistoryItem = {
    date: new Date().toISOString(),
    action: `Estado alterado para ${newStatus}`,
    details: note || 'Estado atualizado no painel CRM.'
  };
  const updatedHistory = [newHistoryItem, ...currentHistory];

  const { data, error } = await supabase
    .from('crm_leads')
    .update({
      status: newStatus,
      history: updatedHistory,
      updated_at: new Date().toISOString()
    })
    .eq('id', leadId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Elimina um lead no Supabase (Administradores apenas).
 */
export async function deleteLeadFromSupabase(leadId) {
  await requireAdminSession();

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { error } = await supabase
    .from('crm_leads')
    .delete()
    .eq('id', leadId);

  if (error) {
    throw error;
  }

  // Remove também do backup local
  removeLocalLeadBackup(leadId);
  return true;
}

/**
 * Obtém a URL do Webhook persistida no Supabase crm_settings ou localStorage.
 */
export async function getWebhookUrl() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('crm_settings')
        .select('value')
        .eq('key', 'webhook_url')
        .maybeSingle();

      if (!error && data?.value) {
        return data.value;
      }
    } catch {
      // Ignora erro e recorre ao localStorage
    }
  }

  try {
    return localStorage.getItem(LOCAL_WEBHOOK_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Grava a URL do Webhook no Supabase crm_settings e localStorage.
 */
export async function saveWebhookUrl(url) {
  const trimmed = (url || '').trim();

  try {
    localStorage.setItem(LOCAL_WEBHOOK_KEY, trimmed);
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await requireAdminSession();
      await supabase
        .from('crm_settings')
        .upsert(
          { key: 'webhook_url', value: trimmed, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
    } catch (e) {
      console.warn('Aviso ao persistir Webhook no Supabase:', e.message);
    }
  }

  return trimmed;
}

/**
 * Envia evento do lead para a automação externa (n8n, Make, Zapier, Webhook HTTP)
 */
export async function dispatchWebhookToExternalService(leadData) {
  const url = await getWebhookUrl();
  if (!url) return;

  try {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'lead.captured',
        timestamp: new Date().toISOString(),
        site: 'AQUI TEM Angola',
        siteUrl: window.location.origin,
        lead: leadData
      })
    }).catch(err => console.warn('Erro ao disparar Webhook CRM:', err));
  } catch (e) {
    console.warn('Falha na requisição de Webhook CRM:', e);
  }
}

// -----------------------------------------------------------------------------
// Backups locais auxiliares (apenas de segurança e temporários)
// -----------------------------------------------------------------------------
function getLocalLeadsBackup() {
  try {
    const raw = localStorage.getItem(LOCAL_LEADS_BACKUP_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalLeadBackup(lead) {
  try {
    const existing = getLocalLeadsBackup();
    const updated = [lead, ...existing.filter(l => l.id !== lead.id)].slice(0, 50);
    localStorage.setItem(LOCAL_LEADS_BACKUP_KEY, JSON.stringify(updated));
  } catch {}
}

function removeLocalLeadBackup(leadId) {
  try {
    const existing = getLocalLeadsBackup();
    const updated = existing.filter(l => l.id !== leadId);
    localStorage.setItem(LOCAL_LEADS_BACKUP_KEY, JSON.stringify(updated));
  } catch {}
}
