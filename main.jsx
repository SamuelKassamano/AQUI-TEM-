import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { LanguageProvider } from './src/context/LanguageContext'
import { CRMProvider } from './src/context/CRMContext'
import { StoreProvider } from './src/context/StoreContext'
import Home from './src/pages/Home.jsx'
import ProductPage from './src/pages/ProductPage.jsx'
import AdminPage from './src/pages/AdminPage.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <CRMProvider>
          <StoreProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/produto/:slug" element={<ProductPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/*" element={<AdminPage />} />
            </Routes>
          </StoreProvider>
        </CRMProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
)