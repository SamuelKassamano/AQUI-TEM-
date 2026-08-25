import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { LanguageProvider } from './src/context/LanguageContext'
import { CRMProvider } from './src/context/CRMContext'
import Home from './src/pages/Home.jsx'
import ProductPage from './src/pages/ProductPage.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <CRMProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/produto/:slug" element={<ProductPage />} />
          </Routes>
        </CRMProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
)