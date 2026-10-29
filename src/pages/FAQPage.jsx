import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Truck,
  CreditCard,
  ShieldCheck,
  Package,
  ArrowRight,
  X
} from 'lucide-react';
import Layout from '../components/Layout';

const FAQ_DATA = [
  {
    category: '🚚 Entregas & Prazos',
    items: [
      {
        q: 'Quanto tempo demora a entrega em Luanda?',
        a: 'Para Luanda (Talatona, Kilamba, Maianga, Benfica, Viana, Cazenga, Ingombota, Cabolombo), as entregas são realizadas habitualmente entre 24h a 48h úteis. Em vários casos, é possível efetuar o agendamento para o mesmo dia.'
      },
      {
        q: 'Fazem entregas para outras províncias de Angola?',
        a: 'Sim! Entregamos em Benguela, Lobito, Huambo, Lubango, Namibe, Malanje, Cabinda, Uíge, Soyo e demais províncias de Angola através de agências e transportadoras parceiras credenciadas. O prazo médio varia entre 2 a 5 dias úteis.'
      },
      {
        q: 'Qual é o valor da taxa de entrega?',
        a: 'A taxa varia consoante o município e a distância em Luanda. Durante a confirmação do seu pedido pelo WhatsApp ou checkout, a nossa equipa informa o valor exato da entrega antes do envio.'
      },
      {
        q: 'Posso agendar o local e horário de recebimento?',
        a: 'Com certeza. Ao confirmar a encomenda com o nosso estafeta pelo WhatsApp (+244 950 752 933), pode indicar a sua residência, escritório ou ponto de referência de sua preferência.'
      }
    ]
  },
  {
    category: '💳 Pagamentos & Facturação',
    items: [
      {
        q: 'Quais são as formas de pagamento aceites?',
        a: 'Aceitamos Multicaixa Express e Transferência Bancária.'
      },
      {
        q: 'Posso pagar apenas no momento da entrega?',
        a: 'Todos os pedidos devem ser pagos via Multicaixa Express ou Transferência Bancária.'
      },
      {
        q: 'Há desconto para pagamento a pronto?',
        a: 'Sim, concedemos até 10% de desconto adicional para pagamentos a pronto.'
      },
      {
        q: 'Emitem Factura Pró-forma e Factura-Recibo com NIF?',
        a: 'Sim. Emitimos Factura Pró-forma para aprovação institucional e Factura-Recibo oficial com NIF para contabilidade de empresas e instituições em Angola.'
      }
    ]
  },
  {
    category: '🛡️ Garantia & Política de Trocas',
    items: [
      {
        q: 'Qual é o prazo de garantia dos produtos?',
        a: 'Todos os produtos possuem garantia oficial de fábrica. Além disso, a AQUI TEM oferece 7 dias de garantia para troca imediata caso o artigo apresente qualquer defeito de fabricação comprovado.'
      },
      {
        q: 'O que devo fazer se o produto apresentar alguma anomalia?',
        a: 'Basta entrar em contacto imediato com o nosso suporte pelo WhatsApp (+244 950 752 933) enviando uma foto/vídeo do defeito. A nossa equipa agenda a recolha e substituição imediata do equipamento.'
      },
      {
        q: 'Os produtos são testados antes do envio?',
        a: 'Sim, a pedido do cliente podemos efetuar a verificação técnica e envio de vídeo comprovativo pré-despacho mantendo os selos originais.'
      }
    ]
  },
  {
    category: '📦 Autenticidade & Produtos Oraimo',
    items: [
      {
        q: 'Os produtos Oraimo são 100% originais?',
        a: 'Sim, absolutamente! Trabalhamos com importação direta de lotes certificados da Oraimo. Todos os fones, smartwatches, powerbanks e cabos vêm lacrados na embalagem original com código de autenticação verificável no site oficial da marca.'
      },
      {
        q: 'Os produtos vêm selados de fábrica?',
        a: 'Sim. Todos os produtos são entregues estritamente selados na caixa com todos os acessórios de fábrica inclusos.'
      }
    ]
  },
  {
    category: '📱 Como Encomendar & Suporte',
    items: [
      {
        q: 'Preciso criar uma conta para comprar no site?',
        a: 'Não é obrigatório criar conta. Pode adicionar os artigos desejados ao carrinho e clicar em "Comprar no WhatsApp", ou falar diretamente com a nossa central de atendimento para um processo rápido e sem burocracia.'
      },
      {
        q: 'Como funciona a encomenda pelo WhatsApp?',
        a: 'Ao clicar no botão WhatsApp em qualquer produto, é gerada automaticamente uma mensagem com o nome e preço do item. A nossa equipa responde imediatamente, confirma o estoque e coordena a entrega no seu endereço.'
      }
    ]
  }
];

export default function FAQPage() {
  const [search, setSearch] = useState('');
  const [openItems, setOpenItems] = useState({});

  useEffect(() => {
    document.title = 'Perguntas Frequentes (FAQ) | AQUI TEM Angola';
  }, []);

  const toggleItem = (key) => {
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return FAQ_DATA;

    return FAQ_DATA.map(cat => ({
      ...cat,
      items: cat.items.filter(
        item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      )
    })).filter(cat => cat.items.length > 0);
  }, [search]);

  return (
    <Layout>
      {/* Page Hero Header */}
      <div className="page-hero">
        <div className="page-hero-container">
          <div className="page-breadcrumbs">
            <Link to="/">Início</Link>
            <span>/</span>
            <span className="active">Perguntas Frequentes</span>
          </div>
          <h1 className="page-hero-title">
            Perguntas <span>Frequentes</span> (FAQ)
          </h1>
          <p className="page-hero-sub">
            Encontre respostas rápidas para as principais dúvidas sobre pedidos, prazos de entrega em Angola, formas de pagamento, garantia oficial e autenticidade Oraimo.
          </p>
        </div>
      </div>

      <div className="page-content-wrapper">
        {/* Search Bar */}
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto 36px',
            position: 'relative'
          }}
        >
          <div className="search-input-wrapper" style={{ height: '46px', padding: '6px 18px', background: 'var(--bg-card)' }}>
            <Search size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Pesquisar dúvida (ex: entrega, multicaixa, garantia, oraimo)..."
              className="search-input"
              style={{ fontSize: '0.94rem' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Categories and Accordions */}
        {filteredCategories.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '50px 20px',
              background: 'var(--bg-card)',
              borderRadius: '16px',
              border: '1px solid var(--border-light)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            <HelpCircle size={44} style={{ opacity: 0.3, color: 'var(--primary-orange)', margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 6px' }}>Nenhuma resposta encontrada para "{search}"</h3>
            <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Nossa equipa de atendimento está disponível no WhatsApp para responder à sua questão agora mesmo.
            </p>
            <a
              href={`https://wa.me/244950752933?text=${encodeURIComponent(`Olá AQUI TEM! Gostaria de esclarecer uma dúvida: ${search}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-btn nav-btn-orange"
              style={{ display: 'inline-flex', textDecoration: 'none', gap: '8px' }}
            >
              <MessageCircle size={16} /> Tirar Dúvida no WhatsApp
            </a>
          </div>
        ) : (
          <div style={{ maxWidth: '860px', margin: '0 auto', display: 'grid', gap: '28px' }}>
            {filteredCategories.map((categoryGroup, catIdx) => (
              <div key={catIdx}>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    marginBottom: '14px',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {categoryGroup.category}
                </h3>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {categoryGroup.items.map((item, itemIdx) => {
                    const itemKey = `${catIdx}-${itemIdx}`;
                    const isOpen = Boolean(openItems[itemKey] || search);

                    return (
                      <div key={itemIdx} className="faq-accordion-item">
                        <div
                          className="faq-accordion-header"
                          onClick={() => toggleItem(itemKey)}
                        >
                          <span style={{ paddingRight: '12px' }}>{item.q}</span>
                          <span style={{ color: 'var(--primary-orange)', flexShrink: 0 }}>
                            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </span>
                        </div>

                        {isOpen && (
                          <div className="faq-accordion-body">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom WhatsApp CTA */}
        <div
          style={{
            maxWidth: '860px',
            margin: '48px auto 0',
            background: 'linear-gradient(135deg, rgba(255, 101, 0, 0.08), rgba(255, 101, 0, 0.02))',
            border: '1.5px solid var(--border-orange)',
            borderRadius: '18px',
            padding: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <div>
            <h4 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 800 }}>
              Ainda tem alguma dúvida específica?
            </h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Nossos consultores em Luanda respondem rapidamente no WhatsApp de Segunda a Sábado das 08h às 19h.
            </p>
          </div>

          <a
            href="https://wa.me/244950752933?text=Ol%C3%A1%20AQUI%20TEM!%20Ainda%20tenho%20uma%20d%C3%BAvida%20sobre%20as%20compras."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#25D366',
              color: '#FFF',
              padding: '12px 24px',
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: '0.92rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <MessageCircle size={18} /> Falar no WhatsApp (+244 950 752 933)
          </a>
        </div>
      </div>
    </Layout>
  );
}
