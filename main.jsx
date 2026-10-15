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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <CRMProvider>
          <StoreProvider>
            <Routes>
              {/* 1. Início */}
              <Route path="/" element={<Home />} />

              {/* 2. Sobre Nós */}
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
  </React.StrictMode>,
);