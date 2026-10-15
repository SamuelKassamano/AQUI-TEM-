import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchLeadsFromSupabase,
  captureLeadInSupabase,
  updateLeadStatusInSupabase,
  deleteLeadFromSupabase,
  getWebhookUrl as getWebhookUrlService,
  saveWebhookUrl as saveWebhookUrlService
} from '../lib/crmService';
import {
  initSessionTracker,
  getAnalyticsData,
  incrementAnalyticsCounter
} from '../utils/crmTracker';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const CRMContext = createContext();

export function CRMProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState({ totalVisits: 1, totalLeads: 0, productViews: {}, sources: {} });
  const [webhookUrl, setWebhookUrlState] = useState('');
  const [isCrmOpen, setIsCrmOpen] = useState(false);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [leadsError, setLeadsError] = useState(null);
  const [tableMissingWarning, setTableMissingWarning] = useState(false);

  // Initialize session tracking on mount for visitor metrics
  useEffect(() => {
    initSessionTracker();
    setAnalytics(getAnalyticsData());

    // Carrega a URL do webhook
    getWebhookUrlService().then(url => {
      if (url) setWebhookUrlState(url);
    });
  }, []);

  // Recarrega os dados do CRM do Supabase quando solicitado por um administrador
  const refreshCRMData = useCallback(async () => {
    setIsLoadingLeads(true);
    setLeadsError(null);

    try {
      const { leads: remoteLeads, tableMissing, error } = await fetchLeadsFromSupabase();

      if (tableMissing) {
        setTableMissingWarning(true);
      } else {
        setTableMissingWarning(false);
      }

      if (error) {
        setLeadsError(error);
      }

      setLeads(remoteLeads || []);
    } catch (err) {
      console.warn('Erro ao carregar dados do CRM:', err.message);
      setLeadsError(err.message || 'Falha na autenticação do CRM.');
    } finally {
      setIsLoadingLeads(false);
    }
  }, []);

  // Captura de lead (Chamada pelo checkout do cliente ou formulário da loja)
  // O lead é gravado com segurança no Supabase sem expor nenhum dado de outros clientes
  const captureLead = async (leadData) => {
    try {
      const savedLead = await captureLeadInSupabase(leadData);

      // Incrementa contadores analíticos locais
      incrementAnalyticsCounter('totalLeads');
      setAnalytics(getAnalyticsData());

      // Se houver uma sessão administrativa ativa com leads carregados, atualiza a lista
      setLeads(prev => {
        if (!prev || prev.length === 0) return [savedLead];
        return [savedLead, ...prev.filter(l => l.id !== savedLead.id)];
      });

      return savedLead;
    } catch (err) {
      console.error('Erro na captura do lead:', err);
      return null;
    }
  };

  // Atualização de status do lead pelo administrador
  const updateLeadStatus = async (leadId, newStatus, note = '') => {
    try {
      await updateLeadStatusInSupabase(leadId, newStatus, note);

      // Atualiza o estado em memória imediatamente
      setLeads(prev =>
        prev.map(lead => {
          if (lead.id === leadId) {
            const newHistoryItem = {
              date: new Date().toISOString(),
              action: `Estado alterado para ${newStatus}`,
              details: note || 'Estado atualizado no CRM.'
            };
            return {
              ...lead,
              status: newStatus,
              history: [newHistoryItem, ...(lead.history || [])]
            };
          }
          return lead;
        })
      );
    } catch (err) {
      console.error('Erro ao atualizar status do lead:', err);
      throw err;
    }
  };

  // Exclusão de lead pelo administrador
  const deleteLead = async (leadId) => {
    try {
      await deleteLeadFromSupabase(leadId);
      setLeads(prev => prev.filter(l => l.id !== leadId));
    } catch (err) {
      console.error('Erro ao excluir lead:', err);
      throw err;
    }
  };

  // Salvar Webhook no Supabase
  const saveWebhookUrl = async (url) => {
    try {
      const saved = await saveWebhookUrlService(url);
      setWebhookUrlState(saved);
      return saved;
    } catch (err) {
      console.error('Erro ao salvar Webhook:', err);
      throw err;
    }
  };

  const openCRM = () => setIsCrmOpen(true);
  const closeCRM = () => setIsCrmOpen(false);

  return (
    <CRMContext.Provider
      value={{
        leads,
        analytics,
        webhookUrl,
        isCrmOpen,
        isLoadingLeads,
        leadsError,
        tableMissingWarning,
        openCRM,
        closeCRM,
        captureLead,
        updateLeadStatus,
        deleteLead,
        saveWebhookUrl,
        refreshCRMData
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM deve ser utilizado dentro de um CRMProvider');
  }
  return context;
}
