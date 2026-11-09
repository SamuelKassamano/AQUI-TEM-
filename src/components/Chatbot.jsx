import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  PhoneCall,
  ShoppingCart,
  ExternalLink,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { createSlug } from '../utils/slug';

// Normalize text for accent-insensitive matching
function normalizeText(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export default function Chatbot() {
  const navigate = useNavigate();
  const {
    activeProducts = [],
    products = [],
    getEffectivePrice,
    formatPriceKz,
    addToCart
  } = useStore();

  const catalog = useMemo(
    () => (activeProducts.length > 0 ? activeProducts : products),
    [activeProducts, products]
  );

  const initialGreeting = {
    text: 'Olá! 👋 Sou a Assistente Inteligente da **AQUI TEM Angola**. Tenho acesso em tempo real a todo o nosso stock, preços atualizados, entregas e garantias.\n\nComo posso ajudar hoje?',
    sender: 'bot',
    products: []
  };

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialGreeting]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const messagesEndRef = useRef(null);

  const quickSuggestions = [
    '🎧 Preços dos Fones Oraimo',
    '⌚ Ver Smartwatches',
    '🍳 Air Fryer e Eletrodomésticos',
    '🔋 Power Bank e Carregadores',
    '🚚 Como funciona a entrega?',
    '💳 Formas de pagamento'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Intelligent, instant local assistant engine with real-time catalog knowledge
  const generateSmartResponse = (rawQuery) => {
    const q = normalizeText(rawQuery);

    // 1. Greetings
    if (/^(ola|oi|bom dia|boa tarde|boa noite|epa|alô|alo|hey|hello)\b/.test(q) && q.length < 22) {
      return {
        text: 'Olá! Tudo bem? 😊 Estou pronta para ajudar! Pode perguntar-me o **preço de qualquer produto**, pedir recomendações (ex: *fones, smartwatch, air fryer, projetor, carregador, câmara Wi-Fi*), ou tirar dúvidas sobre **entregas em Luanda** e **pagamentos**.',
        products: catalog.slice(0, 3)
      };
    }

    // 2. Delivery / Shipping questions
    if (
      q.includes('entrega') ||
      q.includes('entregar') ||
      q.includes('frete') ||
      q.includes('envio') ||
      q.includes('enviar') ||
      q.includes('domicilio') ||
      q.includes('provincia') ||
      (q.includes('luanda') && (q.includes('como') || q.includes('quanto') || q.includes('tempo') || q.includes('prazo')))
    ) {
      return {
        text:
          '🚚 **Entregas Rápidas AQUI TEM Angola:**\n\n' +
          '• **Luanda (Ao Domicílio ou Escritório):** Entrega rápida em **24h a 48h** (ou no mesmo dia mediante agendamento).\n' +
          '• **Taxa em Luanda:** Taxa fixa de **3.000 Kz** (e **Entrega Grátis** em compras acima de 150.000 Kz!).\n' +
          '• **18 Províncias de Angola:** Enviamos com segurança via transportadora ou carga aérea com entrega entre **2 a 5 dias úteis**.\n' +
          '• **Pagamento na Entrega:** Em Luanda, pode conferir o produto na hora e pagar diretamente ao estafeta!',
        products: []
      };
    }

    // 3. Payment / Discount / Coupon questions
    if (
      q.includes('pagamento') ||
      q.includes('pagar') ||
      q.includes('multicaixa') ||
      q.includes('tpa') ||
      q.includes('transferencia') ||
      q.includes('iban') ||
      q.includes('express') ||
      q.includes('cupom') ||
      q.includes('desconto') ||
      q.includes('prestacao') ||
      q.includes('parcela')
    ) {
      return {
        text:
          '💳 **Formas de Pagamento Seguras:**\n\n' +
          '1. **TPA Multicaixa na Entrega** (levamos o terminal até si em Luanda).\n' +
          '2. **Multicaixa Express** no ato da recepção.\n' +
          '3. **Transferência Bancária Imediata (IBAN)** ou depósito.\n' +
          '4. **Numerário (Kwanzas)** na entrega.\n\n' +
          '🎁 **Dica Especial:** Utilize o cupom **`AQUITEM10`** no carrinho ou escolha pagamento a pronto no checkout para ganhar **10% de desconto**!',
        products: []
      };
    }

    // 4. Warranty / Authenticity / Returns
    if (
      q.includes('garantia') ||
      q.includes('original') ||
      q.includes('originais') ||
      q.includes('troca') ||
      q.includes('devolucao') ||
      q.includes('defeito') ||
      q.includes('confiavel') ||
      q.includes('seguro')
    ) {
      return {
        text:
          '🛡️ **Garantia & Autenticidade Oficial:**\n\n' +
          '• **100% Originais e Selados:** Trabalhamos diretamente com distribuidores oficiais (Oraimo, Tuya, Defender, BMX, Kapbom).\n' +
          '• **Garantia de Troca Direta:** Todos os artigos contam com **7 dias de garantia para troca imediata** em caso de qualquer defeito de fabrico.\n' +
          '• **Verificação na Entrega:** Em Luanda, pode abrir e verificar o seu equipamento no momento da entrega com total transparência.',
        products: []
      };
    }

    // 5. Location / Contact / WhatsApp / Hours
    if (
      q.includes('whatsapp') ||
      q.includes('contacto') ||
      q.includes('contato') ||
      q.includes('telefone') ||
      q.includes('numero') ||
      q.includes('onde fica') ||
      q.includes('localizacao') ||
      q.includes('endereco') ||
      q.includes('morada') ||
      q.includes('horario') ||
      q.includes('benfica')
    ) {
      return {
        text:
          '📍 **Localização & Atendimento AQUI TEM:**\n\n' +
          '• **Base Operacional:** Luanda — Benfica (Zona Verde), Angola.\n' +
          '• **WhatsApp Direto:** **+244 950 752 933** (Atendimento rápido humano).\n' +
          '• **E-mail:** `contacto@aquitem.ao`\n' +
          '• **Horário:** Segunda a Sábado, das **08h00 às 19h00**.',
        products: []
      };
    }

    // 6. Category & Keyword Product Matching
    const categoryMatchers = [
      {
        keywords: ['fone', 'fones', 'auricular', 'auscultador', 'tws', 'freepods', 'opensnap', 'spacebuds', 'necklace', 'boompop', 'boom pop', 'headphone', 'audio', 'coluna', 'caixa de som', 'microfone'],
        label: 'Áudio, Fones & Colunas Bluetooth',
        filter: (p) => {
          const text = normalizeText(`${p.name} ${p.category} ${p.slug}`);
          return (
            text.includes('fone') ||
            text.includes('tws') ||
            text.includes('boom') ||
            text.includes('opensnap') ||
            text.includes('spacebuds') ||
            text.includes('necklace') ||
            text.includes('coluna') ||
            text.includes('microfone') ||
            text.includes('audio')
          );
        }
      },
      {
        keywords: ['smartwatch', 'relogio', 'watch', 'nova 2', 'prisma', 'x-watch', 'pulso'],
        label: 'Smartwatches & Relógios Inteligentes',
        filter: (p) => {
          const text = normalizeText(`${p.name} ${p.category} ${p.slug}`);
          return text.includes('smartwatch') || text.includes('watch') || text.includes('relogio');
        }
      },
      {
        keywords: ['air fryer', 'airfryer', 'fritadeira', 'nutrifry', 'fogao', 'inducao', 'flexicooker', 'eletrodomestico', 'copo termico', 'thermogo', 'cozinha'],
        label: 'Eletrodomésticos & Casa Moderna Oraimo',
        filter: (p) => {
          const text = normalizeText(`${p.name} ${p.category} ${p.slug}`);
          return (
            text.includes('nutrifry') ||
            text.includes('fritadeira') ||
            text.includes('flexicooker') ||
            text.includes('inducao') ||
            text.includes('thermogo') ||
            text.includes('eletrodomestico')
          );
        }
      },
      {
        keywords: ['carregador', 'power bank', 'powerbank', 'bateria', 'magpower', 'toast', 'gan', '65w', '70w', '45w', '22.5w', 'cabo', 'duraline', 'magcable', 'energia'],
        label: 'Carregadores Rápidos, Power Banks & Cabos',
        filter: (p) => {
          const text = normalizeText(`${p.name} ${p.category} ${p.slug}`);
          return (
            text.includes('carregador') ||
            text.includes('power') ||
            text.includes('magpower') ||
            text.includes('cabo') ||
            text.includes('duraline') ||
            text.includes('magcable') ||
            text.includes('energia')
          );
        }
      },
      {
        keywords: ['camera', 'camara', 'seguranca', 'defender', 'rastreador', 'gps', 'tomada', 'smart plug'],
        label: 'Segurança, Câmaras Wi-Fi, GPS & Casa Inteligente',
        filter: (p) => {
          const text = normalizeText(`${p.name} ${p.category} ${p.slug}`);
          return (
            text.includes('camera') ||
            text.includes('camara') ||
            text.includes('rastreador') ||
            text.includes('gps') ||
            text.includes('smart plug') ||
            text.includes('tomada')
          );
        }
      },
      {
        keywords: ['projetor', 'tv box', 'tigre', 'cinema', 'televisao', 'video'],
        label: 'Projetores Smart & TV Box 4K',
        filter: (p) => {
          const text = normalizeText(`${p.name} ${p.category} ${p.slug}`);
          return text.includes('projetor') || text.includes('tigre') || text.includes('tv');
        }
      },
      {
        keywords: ['rato', 'mouse', 'teclado', 'webcam', 'hub', 'suporte', 'notebook', 'portatil', 'gaming', 'glorious', 'kapbom'],
        label: 'Informática, Gaming & Escritório',
        filter: (p) => {
          const text = normalizeText(`${p.name} ${p.category} ${p.slug}`);
          return (
            text.includes('rato') ||
            text.includes('mouse') ||
            text.includes('teclado') ||
            text.includes('webcam') ||
            text.includes('hub') ||
            text.includes('suporte')
          );
        }
      }
    ];

    // Direct token search across products first
    const stopWords = new Set([
      'qual', 'quais', 'preco', 'precos', 'valor', 'custa', 'quanto', 'tem', 'tens',
      'quero', 'ver', 'mostrar', 'mostra', 'comprar', 'sobre', 'para', 'com', 'dos',
      'das', 'nos', 'nas', 'uma', 'uns', 'umas', 'este', 'esse', 'loja', 'aqui'
    ]);
    const queryTokens = q
      .split(/[^a-z0-9.]+/)
      .filter(tok => tok.length >= 3 && !stopWords.has(tok));

    const scoredProducts = catalog
      .map(p => {
        const hay = normalizeText(`${p.name} ${p.brand} ${p.category} ${p.sku} ${p.slug}`);
        let score = 0;
        for (const tok of queryTokens) {
          if (hay.includes(tok)) {
            score += normalizeText(p.name).includes(tok) ? 3 : 1;
          }
        }
        return { product: p, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    // Check if a category group matches
    const matchedCategory = categoryMatchers.find(group =>
      group.keywords.some(kw => q.includes(normalizeText(kw)))
    );

    if (scoredProducts.length > 0 && scoredProducts[0].score >= 3) {
      const topMatches = scoredProducts.slice(0, 4).map(x => x.product);
      if (topMatches.length === 1) {
        const p = topMatches[0];
        const priceStr = formatPriceKz(getEffectivePrice(p));
        return {
          text:
            `✅ **${p.name}** está disponível para pronta entrega!\n\n` +
            `• **Preço Oficial:** **${priceStr}**\n` +
            `• **Marca:** ${p.brand || 'Original'} • **Stock:** ${p.stock} unidades\n` +
            `• **Entrega em Luanda:** 24h–48h (Pagamento por TPA na entrega disponível).\n\n` +
            `Pode abrir a página do produto ou adicioná-lo diretamente ao carrinho abaixo:`,
          products: [p]
        };
      }

      const listLines = topMatches
        .map(p => `• **${p.name}** — **${formatPriceKz(getEffectivePrice(p))}**`)
        .join('\n');

      return {
        text: `Aqui estão os produtos e preços atualizados que encontrei para si:\n\n${listLines}\n\nTodos com stock disponível em Luanda e garantia oficial:`,
        products: topMatches
      };
    }

    if (matchedCategory) {
      const matches = catalog.filter(matchedCategory.filter).slice(0, 4);
      if (matches.length > 0) {
        const listLines = matches
          .map(p => `• **${p.name}** — **${formatPriceKz(getEffectivePrice(p))}**`)
          .join('\n');
        return {
          text: `✨ **${matchedCategory.label}:**\n\n${listLines}\n\nClique em qualquer produto abaixo para ver detalhes ou adicionar ao carrinho:`,
          products: matches
        };
      }
    }

    // 7. Cheap / Promo / All products query
    if (
      q.includes('barato') ||
      q.includes('promocao') ||
      q.includes('oferta') ||
      q.includes('catalogo') ||
      q.includes('todos os produtos') ||
      q.includes('preco') ||
      q.includes('precos') ||
      q.includes('oraimo')
    ) {
      const sorted = [...catalog]
        .filter(p => (q.includes('oraimo') ? normalizeText(p.brand).includes('oraimo') || normalizeText(p.name).includes('oraimo') : true))
        .sort((a, b) =>
          q.includes('barato')
            ? getEffectivePrice(a) - getEffectivePrice(b)
            : (b.reviews_count || 0) - (a.reviews_count || 0)
        )
        .slice(0, 4);

      const listLines = sorted
        .map(p => `• **${p.name}** — **${formatPriceKz(getEffectivePrice(p))}**`)
        .join('\n');

      return {
        text:
          `🔥 **Destaques do Catálogo AQUI TEM Angola:**\n\n${listLines}\n\n` +
          `Temos ${catalog.length} produtos disponíveis com entrega rápida em Luanda. Qual categoria prefere explorar?`,
        products: sorted
      };
    }

    // 8. Default helpful response with featured items
    const featured = catalog.slice(0, 3);
    return {
      text:
        'Posso ajudar imediatamente com:\n' +
        '• **Preços e Stock:** Fones TWS Oraimo, Smartwatches, Air Fryer 6L, Fogão de Indução, Mini Projetor, Câmaras Wi-Fi, Power Banks e Acessórios.\n' +
        '• **Entregas:** 24h–48h em Luanda (3.000 Kz) e envio para todas as províncias.\n' +
        '• **Pagamentos:** TPA Multicaixa na entrega, Express ou Transferência.\n\n' +
        'Veja alguns dos nossos campeões de vendas abaixo ou diga-me qual produto procura:',
      products: featured
    };
  };

  const sendMessageText = async (textToSend) => {
    const userText = (textToSend !== undefined ? textToSend : input).trim();
    if (!userText || isLoading) return;

    if (textToSend === undefined) setInput('');

    const userMessage = { text: userText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Fast, natural response (< 150ms) using real-time catalog intelligence
    setTimeout(() => {
      const reply = generateSmartResponse(userText);
      setMessages(prev => [
        ...prev,
        {
          text: reply.text,
          sender: 'bot',
          products: reply.products || []
        }
      ]);
      setIsLoading(false);
    }, 140);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessageText();
    }
  };

  const handleResetChat = () => {
    setMessages([initialGreeting]);
  };

  // Render simple markdown (**bold** and line breaks) cleanly
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = String(text).split('\n');
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
      return (
        <React.Fragment key={lineIdx}>
          {parts.map((part, partIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code
                  key={partIdx}
                  style={{
                    background: 'rgba(255,101,0,0.12)',
                    color: '#EA580C',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '0.82rem'
                  }}
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            return <span key={partIdx}>{part}</span>;
          })}
          {lineIdx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 3000 }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #FF6500, #F37021)',
            color: '#FFF',
            padding: '14px 20px',
            borderRadius: '30px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(255, 101, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 800,
            fontSize: '0.95rem',
            transition: 'transform 0.2s ease, boxShadow 0.2s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <MessageCircle size={22} />
          <span>Assistente IA</span>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#4ADE80',
              boxShadow: '0 0 0 3px rgba(74, 222, 128, 0.3)'
            }}
          />
        </button>
      ) : (
        <div
          style={{
            width: '385px',
            maxWidth: 'calc(100vw - 28px)',
            height: '560px',
            maxHeight: 'calc(100vh - 90px)',
            background: 'var(--bg-card, #FFFFFF)',
            color: 'var(--text-main, #1F2937)',
            borderRadius: '20px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid var(--border-light, #E5E7EB)'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #FF6500 100%)',
              color: '#FFF',
              padding: '14px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <Bot size={20} color="#FFF" />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '1px',
                    right: '1px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#4ADE80',
                    border: '1.5px solid #0F172A'
                  }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.94rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Assistente AQUI TEM
                  <Sparkles size={14} color="#FBBF24" />
                </div>
                <div style={{ fontSize: '0.73rem', opacity: 0.9 }}>
                  Online • Resposta Instantânea ({catalog.length} produtos)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={handleResetChat}
                title="Reiniciar conversa"
                style={{
                  background: 'rgba(255,255,255,0.16)',
                  border: 'none',
                  color: '#FFF',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Fechar"
                style={{
                  background: 'rgba(255,255,255,0.16)',
                  border: 'none',
                  color: '#FFF',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}
                >
                  {m.sender === 'bot' && (
                    <div
                      style={{
                        background: 'rgba(255,101,0,0.12)',
                        color: '#FF6500',
                        borderRadius: '50%',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      <Bot size={14} />
                    </div>
                  )}

                  <div
                    style={{
                      maxWidth: '84%',
                      background:
                        m.sender === 'user'
                          ? 'linear-gradient(135deg, #FF6500, #F37021)'
                          : 'var(--bg-body, #F3F4F6)',
                      color: m.sender === 'user' ? '#FFF' : 'var(--text-main, #1F2937)',
                      padding: '10px 14px',
                      borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      fontSize: '0.86rem',
                      lineHeight: '1.48',
                      wordBreak: 'break-word',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      border: m.sender === 'bot' ? '1px solid var(--border-light, #E5E7EB)' : 'none'
                    }}
                  >
                    {renderFormattedText(m.text)}
                  </div>

                  {m.sender === 'user' && (
                    <div
                      style={{
                        background: 'var(--border-light, #E5E7EB)',
                        borderRadius: '50%',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      <User size={14} color="#6B7280" />
                    </div>
                  )}
                </div>

                {/* Interactive Product Cards inside Bot Replies */}
                {m.sender === 'bot' && Array.isArray(m.products) && m.products.length > 0 && (
                  <div
                    style={{
                      paddingLeft: '32px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    {m.products.map(prod => {
                      const prodSlug = prod.slug || createSlug(prod.name);
                      const isJustAdded = addedId === prod.id;
                      return (
                        <div
                          key={prod.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'var(--bg-card, #FFF)',
                            border: '1px solid var(--border-light, #E5E7EB)',
                            borderRadius: '12px',
                            padding: '8px 10px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                          }}
                        >
                          <img
                            src={prod.image_url || prod.image || '/product_boompop.jpg'}
                            alt={prod.name}
                            onError={e => {
                              e.currentTarget.src = '/product_boompop.jpg';
                            }}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              background: '#F8FAFC',
                              flexShrink: 0
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: 'var(--text-main)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                              title={prod.name}
                            >
                              {prod.name}
                            </div>
                            <div
                              style={{
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                color: '#FF6500',
                                fontVariantNumeric: 'tabular-nums',
                                marginTop: '2px'
                              }}
                            >
                              {formatPriceKz(getEffectivePrice(prod))}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '5px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  navigate(`/produto/${prodSlug}`);
                                  setIsOpen(false);
                                }}
                                style={{
                                  background: 'var(--bg-body, #F1F5F9)',
                                  color: 'var(--text-main)',
                                  border: '1px solid var(--border-light)',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <ExternalLink size={11} /> Ver
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  addToCart(prod);
                                  setAddedId(prod.id);
                                  setTimeout(() => setAddedId(null), 1800);
                                }}
                                style={{
                                  background: isJustAdded ? '#16A34A' : '#FF6500',
                                  color: '#FFF',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                {isJustAdded ? (
                                  <>
                                    <CheckCircle2 size={11} /> Adicionado
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart size={11} /> + Carrinho
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Quick Suggestion Chips */}
            <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {quickSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessageText(sug)}
                  style={{
                    background: 'rgba(255, 101, 0, 0.08)',
                    border: '1px solid rgba(255, 101, 0, 0.25)',
                    color: 'var(--text-main)',
                    borderRadius: '16px',
                    padding: '5px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 101, 0, 0.16)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 101, 0, 0.08)')}
                >
                  {sug}
                </button>
              ))}
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* Quick WhatsApp bar */}
          <div
            style={{
              padding: '6px 12px',
              background: 'rgba(37, 211, 102, 0.08)',
              borderTop: '1px solid var(--border-light, #E5E7EB)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.76rem'
            }}
          >
            <span style={{ color: '#15803D', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <PhoneCall size={12} /> WhatsApp: +244 950 752 933
            </span>
            <a
              href="https://wa.me/244950752933?text=Ol%C3%A1%20AQUI%20TEM!%20Gostaria%20de%20atendimento%20humano."
              target="_blank"
              rel="noreferrer"
              style={{ color: '#15803D', fontWeight: 800, textDecoration: 'underline' }}
            >
              Falar com Especialista
            </a>
          </div>

          {/* Input Area */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderTop: '1px solid var(--border-light, #E5E7EB)',
              background: 'var(--bg-card, #FFF)',
              gap: '8px'
            }}
          >
            <input
              type="text"
              placeholder="Pergunte sobre preços, produtos, entrega..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid var(--border-light, #D1D5DB)',
                borderRadius: '24px',
                fontSize: '0.86rem',
                outline: 'none',
                background: 'var(--bg-body, #F9FAFB)',
                color: 'var(--text-main, #1F2937)'
              }}
            />
            <button
              type="button"
              onClick={() => sendMessageText()}
              disabled={isLoading || !input.trim()}
              style={{
                background: isLoading || !input.trim() ? '#E5E7EB' : 'linear-gradient(135deg, #FF6500, #F37021)',
                color: isLoading || !input.trim() ? '#9CA3AF' : '#FFF',
                border: 'none',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s ease',
                flexShrink: 0
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
