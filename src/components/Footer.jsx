import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ShieldCheck, MapPin, Phone, Mail, Clock } from 'lucide-react';
import OriginalLogoImage from './OriginalLogoImage';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Line 1: Logo + Slogan + Direct WhatsApp */}
        <div className="footer-line-main">
          <Link to="/" className="footer-logo-link">
            <OriginalLogoImage src="/logo.jpg" alt="AQUI TEM" height={24} white={true} className="footer-logo-png" />
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

        {/* Line 2: Links para as 7 páginas independentes */}
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
            Perguntas Frequentes
          </Link>
        </div>

        {/* Line 3: Informações operacionais, localização e pagamento */}
        <div className="footer-line-bottom">
          <span>
            © {new Date().getFullYear()} AQUI TEM Angola • Todos os direitos reservados • Produtos 100% Originais e Selados com Garantia • Multicaixa Express / TPA / Dinheiro / Pagamento na Entrega • Avenida Fidel de Castro, Benfica - Zona Verde, Município Cabolombo, Luanda - Angola
          </span>
        </div>
      </div>
    </footer>
  );
}
