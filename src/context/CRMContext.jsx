import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredLeads,
  captureLead as captureLeadUtil,
  updateLeadStatus as updateLeadStatusUtil,
  getAnalyticsData,
  getWebhookUrl as getWebhookUrlUtil,
  setWebhookUrl as setWebhookUrlUtil,
  initSessionTracker
} from '../utils/crmTracker';

const CRMContext = createContext();

export function CRMProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState({ totalVisits: 1, totalLeads: 0, productViews: {}, sources: {} });
  const [webhookUrl, setWebhookUrlState] = useState('');
  const [isCrmOpen, setIsCrmOpen] = useState(false);

  useEffect(() => {
    // Initialize session tracker on app mount
    initSessionTracker();
    refreshCRMData();
  }, []);

  const refreshCRMData = () => {
    setLeads(getStoredLeads());
    setAnalytics(getAnalyticsData());
    setWebhookUrlState(getWebhookUrlUtil());
  };

  const captureLead = (leadData) => {
    const created = captureLeadUtil(leadData);
    refreshCRMData();
    return created;
  };

  const updateLeadStatus = (leadId, newStatus, note = '') => {
    const updatedLeads = updateLeadStatusUtil(leadId, newStatus, note);
    setLeads(updatedLeads);
    refreshCRMData();
  };

  const saveWebhookUrl = (url) => {
    setWebhookUrlUtil(url);
    setWebhookUrlState(url);
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
        openCRM,
        closeCRM,
        captureLead,
        updateLeadStatus,
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
