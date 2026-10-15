// ==========================================================================
// AQUI TEM - CRM & LEAD TRACKING ENGINE
// Tracks: UTM sources, Referrers, Page Time, Product Clicks & Lead Capture
// ==========================================================================

const STORAGE_KEY_LEADS = 'aqui_tem_crm_leads';
const STORAGE_KEY_ANALYTICS = 'aqui_tem_crm_analytics';
const STORAGE_KEY_WEBHOOK = 'aqui_tem_crm_webhook_url';

// Extract UTM and Traffic Source from URL / Referrer
export function getTrafficSource() {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  const utmMedium = params.get('utm_medium');
  const utmCampaign = params.get('utm_campaign');
  const referrer = document.referrer;

  if (utmSource) {
    return {
      type: 'UTM Campaign',
      name: utmSource,
      details: `Medium: ${utmMedium || 'none'} | Campaign: ${utmCampaign || 'none'}`
    };
  }

  if (referrer) {
    if (referrer.includes('google.com')) return { type: 'Organic Search', name: 'Google', details: referrer };
    if (referrer.includes('facebook.com') || referrer.includes('fb.com')) return { type: 'Social Media', name: 'Facebook', details: referrer };
    if (referrer.includes('instagram.com')) return { type: 'Social Media', name: 'Instagram', details: referrer };
    if (referrer.includes('t.co') || referrer.includes('twitter.com')) return { type: 'Social Media', name: 'Twitter/X', details: referrer };
    if (referrer.includes('whatsapp.com')) return { type: 'Messaging', name: 'WhatsApp', details: referrer };
    return { type: 'Referral', name: new URL(referrer).hostname, details: referrer };
  }

  return { type: 'Direct Visit', name: 'Direto / Bookmark', details: 'Acesso Direto' };
}

// Track Session Metrics (Time on Site, Pages Viewed)
export function initSessionTracker() {
  const sessionStartTime = Date.now();
  sessionStorage.setItem('session_start_time', String(sessionStartTime));

  let currentViewCount = Number(sessionStorage.getItem('session_page_views') || '0') + 1;
  sessionStorage.setItem('session_page_views', String(currentViewCount));

  // Log page view in analytics counter
  incrementAnalyticsCounter('totalVisits');
}

export function getSessionDurationFormatted() {
  const start = Number(sessionStorage.getItem('session_start_time') || Date.now());
  const elapsedSeconds = Math.floor((Date.now() - start) / 1000);
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  return `${mins}m ${secs}s`;
}

// Analytics Counters (Persisted in localStorage)
export function getAnalyticsData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ANALYTICS);
    if (!raw) return { totalVisits: 1, totalLeads: 0, productViews: {}, sources: {} };
    return JSON.parse(raw);
  } catch (e) {
    return { totalVisits: 1, totalLeads: 0, productViews: {}, sources: {} };
  }
}

export function incrementAnalyticsCounter(key, subKey = null) {
  const data = getAnalyticsData();
  if (subKey) {
    if (!data[key]) data[key] = {};
    data[key][subKey] = (data[key][subKey] || 0) + 1;
  } else {
    data[key] = (data[key] || 0) + 1;
  }
  localStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(data));
}

// Lead Management API (Protegido: dados confidenciais nunca são salvos em texto claro no localStorage de visitantes)
export function getStoredLeads() {
  // Limpa registros legados do localStorage por segurança
  try {
    localStorage.removeItem(STORAGE_KEY_LEADS);
  } catch {}
  return [];
}

export function captureLead(leadPayload) {
  const source = getTrafficSource();
  const timeSpent = getSessionDurationFormatted();

  const newLead = {
    id: `LEAD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: leadPayload.name || 'Cliente Sem Nome',
    phone: leadPayload.phone || '950752933',
    city: leadPayload.city || 'Luanda',
    address: leadPayload.address || 'Angola',
    productName: leadPayload.productName || 'Consulta Geral',
    productPrice: leadPayload.productPrice || 0,
    totalValue: leadPayload.totalValue || leadPayload.productPrice || 0,
    status: 'Novo Lead',
    trafficSource: `${source.name} (${source.type})`,
    timeOnSite: timeSpent,
    pagesViewed: Number(sessionStorage.getItem('session_page_views') || '1'),
    createdAt: new Date().toISOString(),
    notes: leadPayload.notes || 'Capturado via intenção de compra WhatsApp / Site.',
    history: [
      {
        date: new Date().toISOString(),
        action: 'Lead Capturado no Site',
        details: `Produto: ${leadPayload.productName || 'Geral'} | Origem: ${source.name}`
      }
    ]
  };

  // Increment metrics
  incrementAnalyticsCounter('totalLeads');
  incrementAnalyticsCounter('sources', source.name);
  if (leadPayload.productName) {
    incrementAnalyticsCounter('productViews', leadPayload.productName);
  }

  // Dispatch Webhook if configured
  dispatchWebhook(newLead);

  return newLead;
}

export function updateLeadStatus(leadId, newStatus, note = '') {
  const leads = getStoredLeads();
  const updated = leads.map(lead => {
    if (lead.id === leadId) {
      const historyItem = {
        date: new Date().toISOString(),
        action: `Estado alterado para ${newStatus}`,
        details: note || `Estado atualizado no CRM.`
      };
      return {
        ...lead,
        status: newStatus,
        history: [historyItem, ...(lead.history || [])]
      };
    }
    return lead;
  });
  localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(updated));
  return updated;
}

// Webhook Automation Integration (N8N / Make / Zapier / Google Sheets)
export function getWebhookUrl() {
  return localStorage.getItem(STORAGE_KEY_WEBHOOK) || '';
}

export function setWebhookUrl(url) {
  localStorage.setItem(STORAGE_KEY_WEBHOOK, url);
}

export function dispatchWebhook(leadData) {
  const url = getWebhookUrl();
  if (!url) return;

  try {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'lead.captured',
        timestamp: new Date().toISOString(),
        lead: leadData,
        site: 'AQUI TEM Angola',
        siteUrl: 'https://aqui-tem29.vercel.app/'
      })
    }).catch(err => console.warn('Erro no envio de Webhook CRM:', err));
  } catch (e) {
    console.warn('Erro ao disparar Webhook CRM:', e);
  }
}
