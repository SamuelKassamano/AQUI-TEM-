import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MessageCircle,
  Truck,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  Clock,
  MapPin,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import Layout from '../components/Layout';

export default function HowItWorksPage() {
  useEffect(() => {
    document.title = 'Como Funciona — Compras & Entregas | AQUI TEM Angola';
  }, []);

  const steps = [
    {
      num: 1,
      title: '1. Escolha o Produto Desejado',
      desc: 'Navegue pelo nosso catálogo online com especificações técnicas completas, fotos reais, preços transparentes em Kwanzas (Kz) e avaliações de clientes.',
      icon: Search,
      highlight: 'Catálogo sempre atualizado com estoque em Luanda.'
    },
    {
      num: 2,
      title: '2. Confirme o Pedido pelo WhatsApp',
      desc: 'Pode adicionar ao carrinho ou clicar diretamente no botão "Comprar no WhatsApp". Um consultor da AQUI TEM confirma a disponibilidade imediata e agenda o envio.',
      icon: MessageCircle,
      highlight: 'Atendimento ágil pelo WhatsApp: +244 950 752 933.'
    },
    {
      num: 3,
      title: '3. Despacho Rápido e Seguro',
      desc: 'Preparamos o seu equipamento selado na caixa original e enviamos via estafeta próprio para Luanda ou transportadora parceira para as províncias.',
      icon: Truck,
      highlight: 'Entregas em Luanda em 24h a 48h úteis.'
    },
    {
      num: 4,
      title: '4. Pagamento Seguro e Sem Complicação',
      desc: 'Oferecemos flexibilidade de pagamento: pague por Multicaixa Express ou transferência bancária.',
      icon: CreditCard,
      highlight: '10% de desconto adicional para pagamentos a pronto.'
    },
    {
      num: 5,
      title: '5. Verificação & Garantia Oficial',
      desc: 'Receba a encomenda, verifique o selo intacto de fábrica e aproveite a tranquilidade da garantia oficial com suporte pós-venda direto.',
      icon: ShieldCheck,
      highlight: '7 dias para troca imediata em caso de defeito de fabricação.'
    }
  ];

  return (
    <Layout>
      {/* Page Hero Header */}
      <div className="page-hero">
        <div className="page-hero-container">
          <div className="page-breadcrumbs">
            <Link to="/">Início</Link>
            <span>/</span>
            <span className="active">Como Funciona</span>
          </div>
          <h1 className="page-hero-title">
            Como <span>Funciona</span> a AQUI TEM?
          </h1>
          <p className="page-hero-sub">
            Descubra o passo a passo simples, seguro e transparente para encomendar tecnologia original e receber com comodidade em sua casa ou escritório em Angola.
          </p>
        </div>
      </div>

      <div className="page-content-wrapper">
        {/* 5 Steps Grid */}
        <div style={{ display: 'grid', gap: '24px', marginBottom: '48px' }}>
          {steps.map(step => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="step-card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: '24px',
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div className="step-number-badge">{step.num}</div>

                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'rgba(255, 101, 0, 0.1)',
                    color: 'var(--primary-orange)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon size={28} />
                </div>

                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 800 }}>
                    {step.title}
                  </h3>
                  <p style={{ margin: '0 0 8px', color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                  <div style={{ fontSize: '0.82rem', color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CheckCircle size={14} /> {step.highlight}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabela de Prazos de Entrega */}
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '32px',
            borderRadius: '20px',
            border: '1px solid var(--border-light)',
            marginBottom: '40px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '8px' }}>
            <Clock size={16} /> Prazos e Destinos
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 16px' }}>
            Prazos Estimados de Entrega em Angola
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: 'var(--primary-orange)', fontSize: '1.05rem', marginBottom: '6px' }}>
                <MapPin size={18} /> Luanda (Zona Urbana & Periferia)
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>
                Talatona, Kilamba, Maianga, Ingombota, Alvalade, Viana, Cazenga, Benfica, Cacuaco, Cabolombo.
              </p>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#16A34A' }}>
                ⚡ Prazo: 24h a 48h úteis (Agendamento no mesmo dia disponível)
              </div>
            </div>

            <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#1E5C9E', fontSize: '1.05rem', marginBottom: '6px' }}>
                <Truck size={18} /> Províncias de Angola
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>
                Benguela, Lobito, Huambo, Lubango, Namibe, Malanje, Cabinda, Uíge, Soyo e demais capitais provinciais.
              </p>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E5C9E' }}>
                📦 Prazo: 2 a 5 dias úteis via agência/transportadora
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div style={{ textAlign: 'center', padding: '30px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '1.3rem', fontWeight: 800 }}>Pronto para Fazer o Seu Pedido?</h4>
          <p style={{ margin: '0 0 20px', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Consulte os produtos em promoção e receba no conforto da sua casa.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/produtos" className="nav-btn nav-btn-orange" style={{ textDecoration: 'none', padding: '12px 24px' }}>
              Ir para o Catálogo de Produtos <ArrowRight size={16} />
            </Link>
            <Link to="/perguntas-frequentes" className="nav-btn" style={{ textDecoration: 'none', padding: '12px 24px' }}>
              <HelpCircle size={16} /> Perguntas Frequentes
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
