import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Gift,
  Building2,
  Tv,
  CheckCircle,
  MessageCircle,
  TrendingDown,
  Clock,
  Send,
  ShieldCheck,
  Package
} from 'lucide-react';
import Layout from '../components/Layout';
import { useCRM } from '../context/CRMContext';
import { useStore } from '../context/StoreContext';

export default function SolutionsPage() {
  const { captureLead } = useCRM();
  const { showToast } = useStore();

  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    solutionType: 'Brindes Corporativos',
    quantity: '10 a 50 unidades',
    description: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Soluções Corporativas & Atacado B2B | AQUI TEM Angola';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim() || !form.phone.trim()) {
      showToast('Por favor, preencha o nome da empresa e o telefone de contacto.');
      return;
    }

    setSubmitting(true);
    try {
      await captureLead({
        name: `${form.companyName} (${form.contactName || 'Responsável'})`,
        phone: form.phone,
        city: 'Luanda',
        productName: `B2B: ${form.solutionType} - ${form.quantity}`,
        notes: `E-mail: ${form.email} | Detalhes: ${form.description || 'Cotação solicitada na página Soluções'}`
      });

      setSuccess(true);
      showToast('Solicitação de cotação enviada com sucesso!');

      // Envia também para o WhatsApp da AQUI TEM
      const msg = encodeURIComponent(
        `Olá AQUI TEM! Solicito cotação corporativa B2B:\n\n*Empresa:* ${form.companyName}\n*Contacto:* ${form.contactName}\n*Telefone:* ${form.phone}\n*Solução:* ${form.solutionType}\n*Quantidade estimada:* ${form.quantity}\n*Detalhes:* ${form.description}`
      );
      window.open(`https://wa.me/244950752933?text=${msg}`, '_blank');
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
            <span className="active">Soluções</span>
          </div>
          <h1 className="page-hero-title">
            Soluções Corporativas & <span>Atacado B2B</span>
          </h1>
          <p className="page-hero-sub">
            Fornecimento especializado de tecnologia, eletrônicos, brindes corporativos e equipamentos para empresas, escritórios e revendedores em Luanda e em todas as províncias de Angola.
          </p>
        </div>
      </div>

      <div className="page-content-wrapper">
        {/* 4 B2B Pillars */}
        <div className="feature-grid-3" style={{ marginBottom: '40px' }}>
          <div className="feature-card">
            <div className="feature-card-icon">
              <Gift size={24} />
            </div>
            <h4 style={{ margin: '0 0 10px', fontSize: '1.15rem', fontWeight: 800 }}>
              Brindes Tecnológicos Corporativos
            </h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Surpreenda clientes, parceiros e colaboradores em datas comemorativas, eventos e convenções com fones sem fio Oraimo, powerbanks de alta capacidade e copos térmicos ThermoGo de alta durabilidade.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon" style={{ background: 'rgba(30, 92, 158, 0.1)', color: '#1E5C9E' }}>
              <Tv size={24} />
            </div>
            <h4 style={{ margin: '0 0 10px', fontSize: '1.15rem', fontWeight: 800 }}>
              Equipamento para Escritórios & Salas
            </h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Equipamos salas de reunião com Smart TVs 55" 4K Crystal UHD, sistemas de som potentes e soluções de energia inteligente para manter a sua empresa sempre conectada e produtiva.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16A34A' }}>
              <TrendingDown size={24} />
            </div>
            <h4 style={{ margin: '0 0 10px', fontSize: '1.15rem', fontWeight: 800 }}>
              Compras por Grosso com Desconto
            </h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Preços diferenciados e margens atrativas para revendedores autorizados e lojistas em Benguela, Huambo, Huíla, Cabinda, Namibe e demais províncias de Angola com despacho seguro.
            </p>
          </div>
        </div>

        {/* Informações de Facturação e Processo */}
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '36px',
            borderRadius: '20px',
            border: '1px solid var(--border-light)',
            marginBottom: '40px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1E5C9E', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', background: 'rgba(30, 92, 158, 0.08)', padding: '4px 12px', borderRadius: '16px', marginBottom: '8px' }}>
                <FileText size={15} /> Facturação Oficial
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 14px' }}>
                Processo Formal com Factura Pró-forma e Recibo com NIF
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '14px' }}>
                Sabemos da importância da conformidade fiscal para a sua empresa em Angola. Emitimos rapidamente:
              </p>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.8, margin: '0 0 20px' }}>
                <li>Factura Pró-forma válida para autorização de despesas e aprovação interna.</li>
                <li>Factura Recibo oficial com NIF da empresa para contabilidade e dedução fiscal.</li>
                <li>Pagamento flexível via transferência bancária IBAN com comprovativo.</li>
                <li>Termo de garantia de fábrica e guia de entrega com conferência de lote.</li>
              </ul>
            </div>

            {/* Formulário de Pedido de Cotação */}
            <div style={{ background: 'var(--bg-body)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 800 }}>
                Solicitar Cotação Corporativa
              </h4>
              <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                Receba uma proposta comercial detalhada em menos de 2 horas úteis.
              </p>

              {success && (
                <div style={{ padding: '12px', background: '#e6f4ea', color: '#137333', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <CheckCircle size={18} style={{ flexShrink: 0 }} />
                  <span>Pedido enviado! A nossa equipa entrará em contacto pelo WhatsApp.</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Nome da Empresa / Instituição *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sonangol / Banco BAI / Consultoria Lda"
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={form.companyName}
                    onChange={e => setForm({ ...form, companyName: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Pessoa de Contacto</label>
                    <input
                      type="text"
                      placeholder="Ex: Dra. Teresa"
                      className="form-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      value={form.contactName}
                      onChange={e => setForm({ ...form, contactName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>WhatsApp / Telefone *</label>
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
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Tipo de Solução</label>
                    <select
                      className="form-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      value={form.solutionType}
                      onChange={e => setForm({ ...form, solutionType: e.target.value })}
                    >
                      <option value="Brindes Corporativos">Brindes Corporativos</option>
                      <option value="Equipamento Escritório">Equipamento Escritório</option>
                      <option value="Compra por Grosso / Revenda">Compra por Grosso / Revenda</option>
                      <option value="Outro Fornecimento">Outro Fornecimento</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Volume Estimado</label>
                    <select
                      className="form-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      value={form.quantity}
                      onChange={e => setForm({ ...form, quantity: e.target.value })}
                    >
                      <option value="5 a 15 unidades">5 a 15 unidades</option>
                      <option value="16 a 50 unidades">16 a 50 unidades</option>
                      <option value="51 a 200 unidades">51 a 200 unidades</option>
                      <option value="Mais de 200 unidades">Mais de 200 unidades</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Produtos de Interesse / Observações</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Precisamos de 30 fones Oraimo BoomPop e 15 Smartwatches para brinde de fim de ano."
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="nav-btn nav-btn-orange"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.92rem' }}
                >
                  <Send size={16} /> {submitting ? 'Enviando Pedido...' : 'Pedir Cotação Imediata'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
