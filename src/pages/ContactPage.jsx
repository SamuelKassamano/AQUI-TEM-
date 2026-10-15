import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  HelpCircle,
  Building,
  ShieldCheck
} from 'lucide-react';
import Layout from '../components/Layout';
import { useCRM } from '../context/CRMContext';
import { useStore } from '../context/StoreContext';

export default function ContactPage() {
  const { captureLead } = useCRM();
  const { showToast } = useStore();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Dúvida sobre Produto',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Contactos & Atendimento ao Cliente | AQUI TEM Angola';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      showToast('Preencha seu nome e telefone.');
      return;
    }

    setSubmitting(true);
    try {
      await captureLead({
        name: form.name.trim(),
        phone: form.phone.trim(),
        city: 'Luanda',
        productName: `Contacto: ${form.subject}`,
        notes: `E-mail: ${form.email} | Mensagem: ${form.message}`
      });

      setSentSuccess(true);
      showToast('Mensagem enviada com sucesso!');

      // Redireciona também para o WhatsApp para atendimento em tempo real
      const text = encodeURIComponent(
        `Olá AQUI TEM! Meu nome é *${form.name}*.\n*Assunto:* ${form.subject}\n*Telefone:* ${form.phone}\n*E-mail:* ${form.email || 'Não informado'}\n\n*Mensagem:* ${form.message || 'Gostaria de falar com o suporte da loja.'}`
      );
      window.open(`https://wa.me/244950752933?text=${text}`, '_blank');
    } catch (err) {
      showToast(`Erro ao enviar: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Page Hero Header */}
      <div className="page-hero">
        <div className="page-hero-container">
          <div className="page-breadcrumbs">
            <Link to="/">Início</Link>
            <span>/</span>
            <span className="active">Contactos</span>
          </div>
          <h1 className="page-hero-title">
            Fale com a <span>AQUI TEM</span> Angola
          </h1>
          <p className="page-hero-sub">
            Estamos prontos para esclarecer as suas dúvidas sobre produtos, encomendas, entregas em Luanda e províncias, garantias e cotações.
          </p>
        </div>
      </div>

      <div className="page-content-wrapper">
        {/* Contact Cards Grid */}
        <div className="feature-grid-3" style={{ marginBottom: '40px' }}>
          <div className="feature-card">
            <div className="feature-card-icon" style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25D366' }}>
              <MessageCircle size={24} />
            </div>
            <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 800 }}>Atendimento WhatsApp</h4>
            <p style={{ margin: '0 0 14px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Nosso canal mais rápido para encomendas, fotos reais dos produtos e agendamento.
            </p>
            <a
              href="https://wa.me/244950752933?text=Ol%C3%A1%20AQUI%20TEM!"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#25D366',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.92rem'
              }}
            >
              +244 950 752 933 <Send size={14} />
            </a>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon" style={{ background: 'rgba(243, 112, 33, 0.1)', color: '#F37021' }}>
              <Phone size={24} />
            </div>
            <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 800 }}>Linha Telefónica Direta</h4>
            <p style={{ margin: '0 0 14px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Ligue diretamente para a nossa central de atendimento em Luanda.
            </p>
            <a
              href="tel:+244950752933"
              style={{
                color: '#F37021',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.92rem'
              }}
            >
              +244 950 752 933
            </a>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon" style={{ background: 'rgba(30, 92, 158, 0.1)', color: '#1E5C9E' }}>
              <Mail size={24} />
            </div>
            <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 800 }}>Correio Eletrónico</h4>
            <p style={{ margin: '0 0 14px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Envie propostas formais, solicitações B2B ou pedidos de suporte.
            </p>
            <a
              href="mailto:contacto@aquitem.ao"
              style={{
                color: '#1E5C9E',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.92rem'
              }}
            >
              contacto@aquitem.ao
            </a>
          </div>
        </div>

        {/* Form and Location Details */}
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '36px',
            borderRadius: '20px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px' }}>
            {/* Interactive Form */}
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.4rem', fontWeight: 900 }}>
                Envie-nos uma Mensagem
              </h3>
              <p style={{ margin: '0 0 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Preencha o formulário abaixo para atendimento prioritário por e-mail ou WhatsApp.
              </p>

              {sentSuccess && (
                <div style={{ padding: '12px 16px', background: '#e6f4ea', color: '#137333', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '18px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <CheckCircle size={18} style={{ flexShrink: 0 }} />
                  <span>Mensagem registada! Um especialista responderá brevemente.</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>Telefone / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 950752933"
                      className="form-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>E-mail (Opcional)</label>
                    <input
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      className="form-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>Assunto</label>
                  <select
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                  >
                    <option value="Dúvida sobre Produto">Dúvida sobre Produto ou Especificação</option>
                    <option value="Estado da Encomenda">Estado de Encomenda / Rastreio</option>
                    <option value="Cotação Corporativa B2B">Cotação Corporativa B2B / Factura Pró-forma</option>
                    <option value="Garantia e Assistência">Garantia, Troca ou Assistência Técnica</option>
                    <option value="Outro Assunto">Outro Assunto</option>
                  </select>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>Mensagem *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Escreva a sua dúvida, produto de interesse ou endereço para entrega..."
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="nav-btn nav-btn-orange"
                  style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem' }}
                >
                  <Send size={16} /> {submitting ? 'Enviando...' : 'Enviar Mensagem Agora'}
                </button>
              </form>
            </div>

            {/* Location & Working Hours Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'var(--bg-body)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <MapPin size={16} /> Localização em Luanda
                </div>
                <h4 style={{ margin: '0 0 10px', fontSize: '1.15rem', fontWeight: 800 }}>
                  Base Operacional & Ponto de Apoio
                </h4>
                <p style={{ margin: '0 0 12px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  Avenida Fidel de Castro, Benfica - Zona Verde, Município Cabolombo, Província de Luanda - Angola.
                </p>
                <div style={{ fontSize: '0.84rem', color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={14} /> Atendimento presencial sob agendamento prévio.
                </div>
              </div>

              <div style={{ background: 'var(--bg-body)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E5C9E', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Clock size={16} /> Horário de Funcionamento
                </div>
                <div style={{ display: 'grid', gap: '8px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                    <span>Segunda a Sexta-feira:</span>
                    <strong>08h00 às 19h00</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                    <span>Sábado:</span>
                    <strong>08h30 às 17h00</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Domingos e Feriados:</span>
                    <strong style={{ color: 'var(--primary-orange)' }}>Plantão WhatsApp sob agendamento</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(37, 211, 102, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(37, 211, 102, 0.25)', display: 'flex', gap: '14px', alignItems: 'center' }}>
                <MessageCircle size={32} color="#25D366" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: '#137333' }}>Prefere Falar Agora?</strong>
                  <span style={{ fontSize: '0.82rem', color: '#2b5329' }}>Clique no botão do WhatsApp e inicie conversa direta com a nossa equipa.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
