import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { LanguageProvider } from './src/context/LanguageContext';
import { CRMProvider } from './src/context/CRMContext';
import { StoreProvider } from './src/context/StoreContext';

import Home from './src/pages/Home.jsx';
import ProductsPage from './src/pages/ProductsPage.jsx';
import AboutPage from './src/pages/AboutPage.jsx';
import SolutionsPage from './src/pages/SolutionsPage.jsx';
import HowItWorksPage from './src/pages/HowItWorksPage.jsx';
import ContactPage from './src/pages/ContactPage.jsx';
import FAQPage from './src/pages/FAQPage.jsx';
import ProductPage from './src/pages/ProductPage.jsx';
import AdminPage from './src/pages/AdminPage.jsx';
import CustomerAreaPage from './src/pages/CustomerAreaPage.jsx';

// Error Boundary to prevent white screen crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#090d16', color: '#ffffff', padding: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>A carregar a AQUI TEM Angola...</h2>
          <p style={{ color: '#cbd5e1', marginBottom: '20px', maxWidth: '460px' }}>Ocorreu uma pequena instabilidade ao carregar a interface. Clique abaixo para atualizar.</p>
          <button
            onClick={() => window.location.href = '/'}
            style={{ background: '#ff6500', color: '#ffffff', border: 'none', padding: '12px 28px', borderRadius: '9999px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Recarregar Página Inicial
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <CRMProvider>
            <StoreProvider>
              <Routes>
                {/* 1. Início */}
                <Route path="/" element={<Home />} />

                {/* 2. Sobre Nós */}
                <Route path="/sobre" element={<AboutPage />} />
                <Route path="/sobre-nos" element={<AboutPage />} />

                {/* 3. Produtos (Catálogo Geral e Filtros) */}
                <Route path="/produtos" element={<ProductsPage />} />

                {/* 4. Soluções (B2B, Atacado & Brindes Corporativos) */}
                <Route path="/solucoes" element={<SolutionsPage />} />

                {/* 5. Como Funciona (Passo a Passo de Compra & Entregas) */}
                <Route path="/como-funciona" element={<HowItWorksPage />} />

                {/* 6. Contactos (Canais Oficiais, WhatsApp & Localização) */}
                <Route path="/contactos" element={<ContactPage />} />

                {/* 7. Perguntas Frequentes (FAQ & Dúvidas) */}
                <Route path="/perguntas-frequentes" element={<FAQPage />} />

                {/* 8. Área do Cliente & Rastreamento de Encomendas */}
                <Route path="/cliente" element={<CustomerAreaPage />} />
                <Route path="/minha-conta" element={<CustomerAreaPage />} />
                <Route path="/rastreio" element={<CustomerAreaPage />} />
                <Route path="/consultar-pedido" element={<CustomerAreaPage />} />

                {/* Páginas Individuais de Produtos */}
                <Route path="/produto/:slug" element={<ProductPage />} />

                {/* Área Administrativa & CRM Restrito */}
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/*" element={<AdminPage />} />
                <Route path="/crm" element={<AdminPage defaultTab="crm" />} />

                {/* Rota Fallback */}
                <Route path="*" element={<Home />} />
              </Routes>
            </StoreProvider>
          </CRMProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);