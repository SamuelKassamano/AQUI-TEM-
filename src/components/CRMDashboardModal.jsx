import React, { useState } from 'react';
import { X, Users, BarChart3, Settings, RefreshCw, Save } from 'lucide-react';
import { useCRM } from '../context/CRMContext';

export default function CRMDashboardModal() {
  const {
    leads,
    analytics,
    webhookUrl,
    isCrmOpen,
    closeCRM,
    updateLeadStatus,
    saveWebhookUrl,
    refreshCRMData
  } = useCRM();

  const [activeTab, setActiveTab] = useState('leads');
  const [webhook, setWebhook] = useState(webhookUrl || '');

  if (!isCrmOpen) return null;

  const handleSaveWebhook = () => {
    saveWebhookUrl(webhook.trim());
  };

  const statuses = [
    'Novo Lead',
    'Em Atendimento',
    'Venda Realizada',
    'Perdido',
    'Nutrição'
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '90vh',
          overflow: 'auto',
          background: '#fff',
          borderRadius: '18px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        <div
          style={{
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #eee'
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>CRM & Gestão de Leads</h2>
            <p style={{ margin: '5px 0 0', color: '#777' }}>
              AQUI TEM — Painel de gestão
            </p>
          </div>

          <button
            onClick={closeCRM}
            style={{
              border: 0,
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '15px 20px',
            borderBottom: '1px solid #eee',
            flexWrap: 'wrap'
          }}
        >
          <button onClick={() => setActiveTab('leads')}>
            <Users size={16} /> Leads
          </button>

          <button onClick={() => setActiveTab('analytics')}>
            <BarChart3 size={16} /> Analytics
          </button>

          <button onClick={() => setActiveTab('settings')}>
            <Settings size={16} /> Configuração
          </button>

          <button onClick={refreshCRMData}>
            <RefreshCw size={16} /> Atualizar
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {activeTab === 'leads' && (
            <div>
              <h3>Leads ({leads.length})</h3>

              {leads.length === 0 ? (
                <p>Nenhum lead capturado ainda.</p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      style={{
                        border: '1px solid #ddd',
                        borderRadius: '12px',
                        padding: '15px'
                      }}
                    >
                      <strong>{lead.name}</strong>

                      <div style={{ marginTop: '8px' }}>
                        Telefone: {lead.phone}
                      </div>

                      <div>
                        Cidade: {lead.city}
                      </div>

                      <div>
                        Produto: {lead.productName}
                      </div>

                      <div>
                        Valor: {lead.totalValue} Kz
                      </div>

                      <div>
                        Origem: {lead.trafficSource}
                      </div>

                      <div>
                        Tempo no site: {lead.timeOnSite}
                      </div>

                      <div style={{ marginTop: '10px' }}>
                        <label>Status: </label>

                        <select
                          value={lead.status}
                          onChange={(e) =>
                            updateLeadStatus(
                              lead.id,
                              e.target.value,
                              'Atualizado pelo painel CRM'
                            )
                          }
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h3>Analytics</h3>

              <p>
                <strong>Visitas:</strong> {analytics.totalVisits}
              </p>

              <p>
                <strong>Leads:</strong> {analytics.totalLeads}
              </p>

              <h4>Origem dos leads</h4>

              {Object.entries(analytics.sources || {}).map(
                ([source, value]) => (
                  <p key={source}>
                    {source}: {value}
                  </p>
                )
              )}

              <h4>Produtos</h4>

              {Object.entries(analytics.productViews || {}).map(
                ([product, value]) => (
                  <p key={product}>
                    {product}: {value}
                  </p>
                )
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3>Webhook / Automação</h3>

              <p style={{ color: '#666' }}>
                Este endereço será usado pelo CRM para enviar novos leads
                para uma automação externa.
              </p>

              <input
                value={webhook}
                onChange={(e) => setWebhook(e.target.value)}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />

              <button
                onClick={handleSaveWebhook}
                style={{
                  marginTop: '10px',
                  padding: '10px 16px',
                  cursor: 'pointer'
                }}
              >
                <Save size={16} /> Salvar Webhook
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   