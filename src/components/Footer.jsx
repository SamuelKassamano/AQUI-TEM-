import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import OriginalLogoImage from './OriginalLogoImage';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Linha 1: Logo Branca sem fundo + Slogan + WhatsApp */}
        <div className="footer-line-main">
          <Link to="/" className="footer-logo-link" title="AQUI TEM Angola - Início">
            <OriginalLogoImage src="logo.jpg" alt="AQUI TEM" height={24} white={true} className="footer-logo-white" />
          </Link>
          <span className="footer-slogan-text">{t('siteSlogan') || 'Tecnologia, Gadgets e Eletrodomésticos em Angola'}</span>
          <span className="footer-dot">•</span>
          <a
            href="https://wa.me/244950752933?text=Ol%C3%A1%20AQUI%20TEM!"
            target="_blank"
            rel="noreferrer"
            className="footer-wa-inline"
          >
            <MessageCircle size={13} /> WhatsApp: +244 950 752 933
          </a>
        </div>

        {/* Linha 2: Links essenciais compactos */}
        <div className="footer-line-links">
          <Link to="/" className="footer-link-item">
            Início
          </Link>
          <span className="footer-dot">•</span>
          <Link to="/produtos" className="footer-link-item">
            Produtos
          </Link>
          <span className="footer-dot">•</span>
          <Link to="/sobre-nos" className="footer-link-item">
            Sobre Nós
          </Link>
          <span className="footer-dot">•</span>
          <Link to="/solucoes" className="footer-link-item">
            Soluções
          </Link>
          <span className="footer-dot">•</span>
          <Link to="/como-funciona" className="footer-link-item">
            Como Funciona
          </Link>
          <span className="footer-dot">•</span>
          <Link to="/contactos" className="footer-link-item">
            Contactos
          </Link>
          <span className="footer-dot">•</span>
          <Link to="/perguntas-frequentes" className="footer-link-item">
            FAQ
          </Link>
          <span className="footer-dot">•</span>
          <Link to="/cliente" className="footer-link-item" style={{ color: '#ff6500', fontWeight: 700 }}>
            Área do Cliente & Rastreio
          </Link>
        </div>

        {/* Linha 3: Informações operacionais e direitos reservados */}
        <div className="footer-line-bottom">
          <span>
            © {new Date().getFullYear()} AQUI TEM Angola • Produtos 100% Originais com Garantia Oficial • Multicaixa Express / BFA • Luanda, Angola
          </span>
        </div>
      </div>
    </footer>
  );
}
