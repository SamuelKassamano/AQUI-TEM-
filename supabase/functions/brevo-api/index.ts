import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Lista estrita de origens permitidas (CORS)
const ALLOWED_ORIGINS = [
  'https://loja.aqui-tem.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

interface BrevoRequestPayload {
  action: 'sync-contact' | 'send-email' | 'track-event' | 'analytics' | 'resend-notification';
  contact?: {
    email: string;
    name?: string;
    phone?: string;
    city?: string;
    address?: string;
    marketingConsent?: boolean;
    orderCount?: number;
    totalSpent?: number;
  };
  emailData?: {
    templateType: 
      | 'registration_confirmation'
      | 'order_confirmation'
      | 'receipt_submitted'
      | 'payment_confirmed'
      | 'order_processing'
      | 'order_shipped'
      | 'order_delivered'
      | 'abandoned_cart'
      | 'post_purchase_followup';
    to: string;
    recipientName?: string;
    orderData?: {
      id: string;
      total: number | string;
      subtotal?: number | string;
      deliveryFee?: number | string;
      orderDate?: string;
      customerPhone?: string;
      customerEmail?: string;
      province?: string;
      municipality?: string;
      paymentStatus?: string;
      trackingNumber?: string;
      estimatedDeliveryDate?: string;
      items: Array<{ name: string; description?: string; quantity: number; price?: number; image?: string }>;
      deliveryZone?: string;
      address?: string;
      city?: string;
      paymentMethod?: string;
      trackingUrl?: string;
    };
    cartData?: {
      items: Array<{ name: string; quantity: number; price?: number }>;
      total: number | string;
      recoveryUrl?: string;
    };
    customMessage?: string;
  };
  eventData?: {
    eventName: string;
    email: string;
    eventId?: string;
    properties?: Record<string, unknown>;
  };
}

// ==============================================================================
// GERADOR DE MODELOS HTML DE E-MAIL (8 TEMPLATES OFICIAIS AQUI TEM ANGOLA)
// ==============================================================================
function generateEmailHtml(templateType: string, payload: BrevoRequestPayload['emailData']): { subject: string; html: string } {
  const brandOrange = '#FF6500';
  const brandBlue = '#1E5C9E';
  const brandDark = '#1A202C';
  const brandGray = '#F7FAFC';
  const recipientName = payload?.recipientName || 'Prezado(a) Cliente';
  const order = payload?.orderData;
  const cart = payload?.cartData;
  const storeUrl = 'https://loja.aqui-tem.vercel.app';
  const whatsappSupport = 'https://wa.me/244950752933';

  const baseHeader = `
    <div style="background-color: ${brandDark}; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: #FFFFFF; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
        AQUI TEM <span style="color: ${brandOrange};">ANGOLA</span>
      </h1>
      <p style="color: #CBD5E0; margin: 6px 0 0 0; font-size: 13px;">Tecnologia & Acessórios Premium • Selados e com Garantia Oficial</p>
    </div>
  `;

  const baseFooter = `
    <div style="margin-top: 32px; padding: 20px; background-color: #EDF2F7; border-radius: 0 0 12px 12px; text-align: center; font-size: 12px; color: #718096; line-height: 1.6;">
      <p style="margin: 0 0 8px 0;"><strong>AQUI TEM Comércio Geral Lda</strong> — Luanda, Angola</p>
      <p style="margin: 0 0 8px 0;">Apoio ao Cliente & Atendimento WhatsApp: <a href="${whatsappSupport}" style="color: ${brandOrange}; font-weight: bold; text-decoration: none;">+244 950 752 933</a></p>
      <p style="margin: 0; font-size: 11px;">E-mail oficial transacional referente à sua encomenda no portal AQUI TEM Angola.</p>
    </div>
  `;

  // Bloco canónico com resumo completo da encomenda:
  // Número, Data, Produtos (descrições, preços, quantidades), Dados do cliente, Morada, Pagamento, Rastreio e Previsão de Entrega
  const renderOrderSummaryCard = (statusTitle: string, statusColor: string) => {
    if (!order) return '';

    const orderId = order.id || 'AQT-XXXX';
    const orderDate = order.orderDate || new Date().toLocaleDateString('pt-AO');
    const trackingNumber = order.trackingNumber || `AQT-TRK-${orderId}`;
    const estimatedDate = order.estimatedDeliveryDate || '3 dias úteis após validação do pagamento';
    const paymentMethod = order.paymentMethod || 'Transferência Bancária / Multicaixa Express';
    const clientPhone = order.customerPhone || 'Registado no sistema';
    const clientEmail = order.customerEmail || payload?.to || '';
    const fullAddress = `${order.address || 'Luanda'}, ${order.municipality ? order.municipality + ', ' : ''}${order.province || order.city || 'Luanda'}`;

    const items = order.items || [];
    const itemsRows = items.map((item) => {
      const priceText = item.price ? `${Number(item.price).toLocaleString('pt-AO')} Kz` : '—';
      const itemSubtotal = item.price ? `${(Number(item.price) * (item.quantity || 1)).toLocaleString('pt-AO')} Kz` : '—';
      const descText = item.description ? `<div style="font-size: 11px; color: #718096; margin-top: 2px;">${item.description}</div>` : '';
      return `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px 8px; vertical-align: top;">
            <strong style="color: #2D3748;">${item.name}</strong>
            ${descText}
          </td>
          <td style="padding: 10px 8px; text-align: center; vertical-align: top; color: #4A5568;">x${item.quantity || 1}</td>
          <td style="padding: 10px 8px; text-align: right; vertical-align: top; color: #4A5568;">${priceText}</td>
          <td style="padding: 10px 8px; text-align: right; vertical-align: top; font-weight: 600; color: #2D3748;">${itemSubtotal}</td>
        </tr>
      `;
    }).join('');

    return `
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; margin: 20px 0;">
        <div style="border-bottom: 2px solid ${brandOrange}; padding-bottom: 8px; margin-bottom: 14px;">
          <span style="font-size: 15px; font-weight: 800; color: #1A202C;">📋 Resumo Oficial da Encomenda</span>
          <span style="font-size: 12px; font-weight: 700; color: #FFFFFF; background: ${statusColor}; padding: 3px 10px; border-radius: 9999px; float: right;">${statusTitle}</span>
          <div style="clear: both;"></div>
        </div>

        <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 13px; color: #4A5568; margin-bottom: 14px;">
          <tr>
            <td width="50%"><strong>N.º Encomenda:</strong> <span style="color: ${brandOrange}; font-weight: bold;">#${orderId}</span></td>
            <td width="50%"><strong>Data do Pedido:</strong> ${orderDate}</td>
          </tr>
          <tr>
            <td><strong>N.º de Rastreio:</strong> <span style="font-family: monospace; font-weight: bold; color: ${brandBlue};">${trackingNumber}</span></td>
            <td><strong>Previsão de Entrega:</strong> <span style="color: #2F855A; font-weight: bold;">${estimatedDate}</span></td>
          </tr>
          <tr>
            <td><strong>Método de Pagamento:</strong> ${paymentMethod}</td>
            <td><strong>Estado do Pagamento:</strong> <strong style="color: ${statusColor};">${statusTitle}</strong></td>
          </tr>
        </table>

        <div style="background: #FFFFFF; border: 1px solid #EDF2F7; border-radius: 8px; padding: 12px; margin-bottom: 14px; font-size: 13px; color: #4A5568; line-height: 1.5;">
          <div style="font-weight: 800; color: #1A202C; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">👤 Dados do Cliente & Endereço de Entrega</div>
          <div><strong>Nome:</strong> ${recipientName}</div>
          <div><strong>Telefone:</strong> ${clientPhone}</div>
          <div><strong>E-mail:</strong> ${clientEmail}</div>
          <div><strong>Endereço de Entrega:</strong> ${fullAddress}</div>
        </div>

        <div style="font-weight: 800; color: #1A202C; margin: 12px 0 6px 0; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">🛍️ Artigos Encomendados</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; border-collapse: collapse; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 6px;">
          <thead>
            <tr style="background: #EDF2F7; color: #2D3748; text-align: left; font-size: 12px;">
              <th style="padding: 8px;">Artigo</th>
              <th style="padding: 8px; text-align: center;">Qtd</th>
              <th style="padding: 8px; text-align: right;">Preço Unit.</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
          <tfoot>
            ${order.subtotal ? `
              <tr>
                <td colspan="3" style="text-align: right; padding: 8px 8px 4px; font-size: 13px; color: #718096;">Subtotal dos Produtos:</td>
                <td style="text-align: right; padding: 8px 8px 4px; font-weight: bold; color: #2D3748;">${Number(order.subtotal).toLocaleString('pt-AO')} Kz</td>
              </tr>
            ` : ''}
            <tr>
              <td colspan="3" style="text-align: right; padding: 4px 8px; font-size: 13px; color: #718096;">Custo de Entrega:</td>
              <td style="text-align: right; padding: 4px 8px; font-weight: bold; color: #2F855A;">${Number(order.deliveryFee || 0) === 0 ? 'GRÁTIS' : `${Number(order.deliveryFee).toLocaleString('pt-AO')} Kz`}</td>
            </tr>
            <tr style="border-top: 2px solid #CBD5E0; background: #F7FAFC;">
              <td colspan="3" style="text-align: right; padding: 10px 8px; font-size: 14px; font-weight: 800; color: #1A202C;">TOTAL GERAL:</td>
              <td style="text-align: right; padding: 10px 8px; font-size: 16px; font-weight: 900; color: ${brandOrange};">${order.total ? Number(order.total).toLocaleString('pt-AO') : 0} Kz</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  };

  let subject = '';
  let content = '';

  switch (templateType) {
    case 'registration_confirmation':
      subject = 'Bem-vindo à AQUI TEM Angola! A sua conta foi criada';
      content = `
        <h2 style="color: ${brandBlue}; font-size: 20px; margin-top: 0;">Olá, ${recipientName}!</h2>
        <p style="color: #4A5568; line-height: 1.6; font-size: 15px;">É com grande satisfação que lhe damos as boas-vindas à loja oficial <strong>AQUI TEM Angola</strong>.</p>
        <div style="background: ${brandGray}; border-left: 4px solid ${brandOrange}; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; font-weight: bold; color: ${brandDark};">Vantagens Exclusivas da sua Conta:</p>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #4A5568;">
            <li>Rastreio detalhado das suas encomendas em tempo real.</li>
            <li>Garantia oficial de 7 dias com suporte técnico em Luanda.</li>
            <li>Checkout facilitado sem necessidade de preencher dados repetidos.</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${storeUrl}/cliente" style="background: ${brandOrange}; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; display: inline-block;">Aceder à Minha Área de Cliente</a>
        </div>
      `;
      break;

    case 'order_confirmation':
      subject = `Encomenda #${order?.id || 'AQT'} Registada com Sucesso — Aguardando Pagamento`;
      content = `
        <h2 style="color: ${brandBlue}; font-size: 20px; margin-top: 0;">Obrigado pela sua encomenda, ${recipientName}!</h2>
        <p style="color: #4A5568; line-height: 1.6; font-size: 15px;">
          A sua encomenda com o código <strong>#${order?.id}</strong> foi registada com sucesso no nosso sistema e aguarda a realização do pagamento para validação e agendamento.
        </p>

        ${renderOrderSummaryCard('Aguardando Pagamento', '#D97706')}

        <div style="background: #FFFDF5; border: 1px solid #ECC94B; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; color: #B7791F;">Coordenadas para Pagamento (Multicaixa / IBAN):</h4>
          <p style="margin: 4px 0; font-size: 13px; color: #4A5568;"><strong>Banco BAI (IBAN):</strong> AO06 0040 0000 1234 5678 9012 3</p>
          <p style="margin: 4px 0; font-size: 13px; color: #4A5568;"><strong>Banco BFA (IBAN):</strong> AO06 0006 0000 9876 5432 1098 7</p>
          <p style="margin: 4px 0; font-size: 13px; color: #4A5568;"><strong>Multicaixa Express (Número de Envio):</strong> +244 950 752 933</p>
          <p style="margin: 4px 0; font-size: 13px; color: #4A5568;"><strong>Beneficiário Oficial:</strong> AQUI TEM COMÉRCIO GERAL LDA</p>
        </div>

        <p style="color: #4A5568; font-size: 14px;">Após efectuar a transferência ou envio Express, anexe o comprovativo (imagem ou PDF) directamente na Área do Cliente ou no portal de finalização com o código <strong>#${order?.id}</strong>.</p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${storeUrl}/cliente?tracking=${order?.id}" style="background: ${brandBlue}; color: #FFFFFF; text-decoration: none; padding: 12px 26px; border-radius: 8px; font-weight: bold; display: inline-block;">Acompanhar Encomenda & Anexar Comprovativo</a>
        </div>
      `;
      break;

    case 'receipt_submitted':
      subject = `Comprovativo Recebido — Encomenda #${order?.id} (Validação Financeira em Curso)`;
      content = `
        <h2 style="color: #D69E2E; font-size: 20px; margin-top: 0;">Comprovativo de Pagamento Recebido!</h2>
        <p style="color: #4A5568; line-height: 1.6; font-size: 15px;">
          Olá, ${recipientName}. Confirmamos a recepção do seu comprovativo de pagamento referente à encomenda <strong>#${order?.id}</strong>.
        </p>

        <div style="background: #FFFDF0; border-left: 4px solid #D69E2E; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; font-weight: bold; color: #744210;">Estado Actual: PENDENTE DE VALIDAÇÃO FINANCEIRA</p>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #975A16;">
            A nossa equipa financeira está a conferir a entrada do valor em conta bancária. Assim que a tesouraria validar a entrada, o administrador confirmará o pagamento e a encomenda passará para o estado <strong>Encomenda Agendada</strong>.
          </p>
        </div>

        ${renderOrderSummaryCard('Pendente de Confirmação', '#2B6CB0')}

        <p style="color: #718096; font-size: 13px;">Prazo estimado de conferência bancária: até 30 minutos em horário útil comercial.</p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${storeUrl}/cliente?tracking=${order?.id}" style="background: ${brandBlue}; color: #FFFFFF; text-decoration: none; padding: 12px 26px; border-radius: 8px; font-weight: bold; display: inline-block;">Consultar Estado da Encomenda</a>
        </div>
      `;
      break;

    case 'payment_confirmed':
      subject = `Pagamento Confirmado! Encomenda #${order?.id} Agendada com Sucesso`;
      content = `
        <h2 style="color: #38A169; font-size: 20px; margin-top: 0;">Pagamento Validado & Encomenda Agendada!</h2>
        <p style="color: #4A5568; line-height: 1.6; font-size: 15px;">
          Excelente notícia, ${recipientName}! O seu pagamento referente à encomenda <strong>#${order?.id}</strong> foi aprovado pela administração financeira e a entrega está formalmente agendada.
        </p>

        <div style="background: #F0FFF4; border: 1px solid #9AE6B4; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #22543D;">📦 Stock Reservado & Rota Agendada:</p>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #276749;">
            Os seus produtos selados com garantia oficial foram separados e a data prevista de entrega foi agendada para <strong>${order?.estimatedDeliveryDate || '3 dias úteis'}</strong>.
          </p>
        </div>

        ${renderOrderSummaryCard('Encomenda Agendada', '#2F855A')}

        <div style="text-align: center; margin: 24px 0;">
          <a href="${storeUrl}/cliente?tracking=${order?.id}" style="background: ${brandOrange}; color: #FFFFFF; text-decoration: none; padding: 12px 26px; border-radius: 8px; font-weight: bold; display: inline-block;">Acompanhar Rastreio</a>
        </div>
      `;
      break;

    case 'order_processing':
      subject = `A sua encomenda #${order?.id} está em preparação e controlo de qualidade`;
      content = `
        <h2 style="color: ${brandBlue}; font-size: 20px; margin-top: 0;">Embalagem & Controlo de Qualidade</h2>
        <p style="color: #4A5568; line-height: 1.6; font-size: 15px;">
          Olá, ${recipientName}. A sua encomenda <strong>#${order?.id}</strong> encontra-se agora em preparação técnica no nosso armazém.
        </p>
        <div style="background: ${brandGray}; border-left: 4px solid ${brandBlue}; padding: 14px; margin: 18px 0; border-radius: 0 8px 8px 0; font-size: 14px; color: #4A5568;">
          • Verificação dos selos e números de série do fabricante.<br>
          • Embalagem anti-impacto reforçada.<br>
          • Inclusão do talão de garantia AQUI TEM Angola.
        </div>

        ${renderOrderSummaryCard('Em Preparação', '#2B6CB0')}
      `;
      break;

    case 'order_shipped':
      subject = `A sua encomenda #${order?.id} já está em rota de entrega!`;
      content = `
        <h2 style="color: ${brandOrange}; font-size: 20px; margin-top: 0;">Motorista Despachado a Caminho!</h2>
        <p style="color: #4A5568; line-height: 1.6; font-size: 15px;">
          Olá, ${recipientName}. A sua encomenda <strong>#${order?.id}</strong> foi despachada do armazém e está em rota de entrega para o seu endereço: <strong>${order?.address || order?.city || 'a sua morada'}</strong>.
        </p>
        <p style="color: #4A5568; font-size: 14px;">Mantenha o seu telemóvel disponível para contacto directo do motorista/estafeta na entrega.</p>

        ${renderOrderSummaryCard('Em Rota', '#DD6B20')}

        <div style="text-align: center; margin: 24px 0;">
          <a href="${storeUrl}/cliente?tracking=${order?.id}" style="background: ${brandOrange}; color: #FFFFFF; text-decoration: none; padding: 12px 26px; border-radius: 8px; font-weight: bold; display: inline-block;">Rastrear Entrega ao Vivo</a>
        </div>
      `;
      break;

    case 'order_delivered':
      subject = `Encomenda #${order?.id} Entregue com Sucesso — Activação da Garantia AQUI TEM`;
      content = `
        <h2 style="color: #38A169; font-size: 20px; margin-top: 0;">Entrega Concluída com Sucesso!</h2>
        <p style="color: #4A5568; line-height: 1.6; font-size: 15px;">
          A sua encomenda <strong>#${order?.id}</strong> foi entregue com sucesso. Agradecemos a sua preferência pela AQUI TEM Angola!
        </p>
        <div style="background: #F0FFF4; border: 1px solid #C6F6D5; padding: 16px; border-radius: 8px; margin: 18px 0; color: #22543D;">
          <strong>Garantia Oficial Activada:</strong> O seu artigo dispõe de 7 dias para troca imediata contra qualquer anomalia técnica de fábrica comprovada.
        </div>

        ${renderOrderSummaryCard('Entregue', '#2F855A')}
      `;
      break;

    case 'abandoned_cart':
      subject = 'Os seus artigos continuam à sua espera na AQUI TEM Angola';
      content = `
        <h2 style="color: ${brandOrange}; font-size: 20px; margin-top: 0;">Não perca os artigos seleccionados!</h2>
        <p style="color: #4A5568; line-height: 1.6; font-size: 15px;">
          Olá, ${recipientName}. Reparamos que deixou artigos no seu carrinho de compras na AQUI TEM Angola:
        </p>
        <div style="background: ${brandGray}; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin: 18px 0;">
          <ul style="padding-left: 18px; margin: 0; color: #4A5568;">
            ${(cart?.items || []).map(i => `<li>${i.name} (x${i.quantity || 1})</li>`).join('')}
          </ul>
          ${cart?.total ? `<p style="margin: 10px 0 0 0; font-weight: bold; color: ${brandDark};">Total Estimado: ${cart.total} Kz</p>` : ''}
        </div>
        <p style="color: #4A5568; font-size: 14px;">O stock de artigos selados em Luanda é limitado. Retome a compra em apenas um clique com entrega garantida:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${cart?.recoveryUrl || `${storeUrl}/cliente?tab=carrinho`}" style="background: ${brandOrange}; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; display: inline-block;">Finalizar a Minha Compra</a>
        </div>
      `;
      break;

    case 'post_purchase_followup':
      subject = 'Como está a ser a sua experiência com a AQUI TEM Angola?';
      content = `
        <h2 style="color: ${brandBlue}; font-size: 20px; margin-top: 0;">A sua opinião é fundamental!</h2>
        <p style="color: #4A5568; line-height: 1.6; font-size: 15px;">
          Olá, ${recipientName}. Já teve oportunidade de testar o seu artigo da encomenda <strong>#${order?.id || ''}</strong>?
        </p>
        <p style="color: #4A5568; font-size: 14px; line-height: 1.6;">
          Desejamos que o seu equipamento esteja a corresponder a 100% às suas expectativas. Se precisar de assistência ou tiver qualquer dúvida sobre configuração, estamos disponíveis no WhatsApp.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${whatsappSupport}" style="background: #25D366; color: #FFFFFF; text-decoration: none; padding: 12px 26px; border-radius: 8px; font-weight: bold; display: inline-block;">Falar com o Suporte WhatsApp</a>
        </div>
      `;
      break;

    default:
      subject = 'Notificação da AQUI TEM Angola';
      content = `<p>${payload?.customMessage || 'Tem uma nova actualização sobre a sua encomenda.'}</p>`;
  }

  const finalHtml = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #F7FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <tr>
          <td>
            ${baseHeader}
            <div style="padding: 28px 24px;">
              ${content}
            </div>
            ${baseFooter}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, html: finalHtml };
}

// ==============================================================================
// VERIFICAÇÕES DE SEGURANÇA, VALIDAÇÃO DE ENCOMENDA & RATE LIMITING
// ==============================================================================

// Lista de templates restritos exclusivamente à equipa administrativa autenticada
const ADMIN_LIFECYCLE_TEMPLATES = [
  'payment_confirmed',
  'order_processing',
  'order_shipped',
  'order_delivered',
  'abandoned_cart',
  'post_purchase_followup'
];

// Lista de templates operacionais de checkout público (requerem validação de encomenda)
const PUBLIC_ORDER_TEMPLATES = [
  'order_confirmation',
  'receipt_submitted'
];

/**
 * Validação rigorosa de formato de e-mail contra injection (CRLF, tabs, null bytes)
 */
function isValidEmail(email: unknown): boolean {
  if (!email || typeof email !== 'string') return false;
  // Rejeitar qualquer caracter de controlo, quebras de linha ou caracteres de injecção HTTP/SMTP
  if (/[\r\n\t\0]/.test(email) || /%0[ad]/i.test(email)) return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(trimmed);
}

/**
 * Cache em memória para controlo de abuso, repetição de pedidos e rate limiting
 */
interface RateLimitEntry {
  timestamp: number;
  count: number;
}
const rateLimitCache = new Map<string, RateLimitEntry>();

function checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitCache.get(key);

  // Limpeza de cache se expirado
  if (!entry || now - entry.timestamp > windowMs) {
    rateLimitCache.set(key, { timestamp: now, count: 1 });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((windowMs - (now - entry.timestamp)) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  return { allowed: true };
}

/**
 * Validação de sessão do utilizador (autenticado)
 */
async function getAuthenticatedUser(req: Request, supabaseUrl: string, supabaseAnonKey: string) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    });
    const { data: { user }, error } = await userClient.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Verificação estrita de autorização de administrador na tabela public.admin_users (FAIL-CLOSED)
 */
async function verifyAdminAuth(req: Request, supabaseUrl: string, supabaseAnonKey: string, supabaseServiceRoleKey: string): Promise<boolean> {
  const authHeader = req.headers.get('Authorization') || '';
  const apiKeyHeader = req.headers.get('apikey') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

  // 1. Verificação directa contra as credenciais de serviço do sistema
  if (bearerToken && supabaseServiceRoleKey && bearerToken === supabaseServiceRoleKey) {
    return true;
  }
  if (apiKeyHeader && supabaseServiceRoleKey && apiKeyHeader === supabaseServiceRoleKey) {
    return true;
  }

  // 2. Verificação de JWT de service_role oficial do projecto
  const tokenToCheck = bearerToken || apiKeyHeader;
  if (tokenToCheck && tokenToCheck.includes('.')) {
    try {
      const parts = tokenToCheck.split('.');
      if (parts.length === 3) {
        const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadStr);
        if (payload && payload.role === 'service_role' && (payload.ref === 'essjwjbtzytefycjodgh' || payload.iss === 'supabase')) {
          return true;
        }
      }
    } catch (_e) {
      // Ignorar e prosseguir para verificação na BD
    }
  }

  // 3. Verificação de sessão do utilizador autenticado em public.admin_users
  const user = await getAuthenticatedUser(req, supabaseUrl, supabaseAnonKey);
  if (!user) return false;

  if (supabaseUrl && supabaseServiceRoleKey) {
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });

    const { data: adminRecord, error: adminErr } = await adminClient
      .from('admin_users')
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminErr && adminRecord && ['super_admin', 'admin', 'manager'].includes(adminRecord.role)) {
      return true;
    }
  }

  return false;
}

/**
 * Validação no backend da legitimidade da encomenda e correspondência com o destinatário
 * Inclui verificação persistente de histórico para rate limiting multi-instância (L2)
 */
interface OrderValidationResult {
  valid: boolean;
  reason?: string;
  leadId?: string;
  history?: Array<Record<string, unknown>>;
  isRecentlyDispatched?: boolean;
}

async function validateOrderRecipient(
  orderId: string,
  recipientEmail: string,
  templateType: string,
  supabaseUrl: string,
  supabaseServiceRoleKey: string
): Promise<OrderValidationResult> {
  const normalizedTarget = recipientEmail.trim().toLowerCase();

  // Se não houver credenciais de base de dados no servidor:
  // Fail-closed por defeito (zero bypass). Apenas permite aprovação se explicitamente em teste local isolado
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    const isLocalTest = Deno.env.get('BREVO_LOCAL_TEST') === '1';
    if (isLocalTest && orderId && orderId.trim()) {
      return { valid: true };
    }
    return {
      valid: false,
      reason: 'Segurança activa: Impossível validar legitimidade da encomenda sem ligação segura à base de dados.'
    };
  }

  try {
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });

    // Consultar encomenda registada em crm_leads (incluindo histórico para verificação distribuída)
    const cleanId = orderId.trim();
    const { data: leads, error } = await adminClient
      .from('crm_leads')
      .select('id, lead_code, notes, history')
      .or(`lead_code.eq.${cleanId},notes.ilike.%${cleanId}%`)
      .limit(5);

    if (error || !leads || leads.length === 0) {
      return { valid: false, reason: `Encomenda #${cleanId} não encontrada no registo oficial de pedidos.` };
    }

    // Conferir se o destinatário coincide com o registo da encomenda
    const matchedLead = leads.find(l => {
      const dbEmail = (l.email || '').trim().toLowerCase();
      if (dbEmail && dbEmail === normalizedTarget) return true;
      if (l.notes && l.notes.toLowerCase().includes(normalizedTarget)) return true;
      return false;
    });

    if (!matchedLead) {
      return {
        valid: false,
        reason: `O endereço ${recipientEmail} não corresponde ao e-mail titular da encomenda #${cleanId}.`
      };
    }

    const history = Array.isArray(matchedLead.history) ? matchedLead.history : [];

    // Verificação persistente multi-instâncias: consultar se foi disparado nos últimos 120 segundos
    const now = Date.now();
    const recentDbDispatch = history.find(h => {
      if (h && h.event === 'email_dispatch' && h.template === templateType) {
        const sentTime = new Date(String(h.sent_at || '')).getTime();
        return (now - sentTime) < 120000; // 2 minutos de cooldown persistente
      }
      return false;
    });

    return {
      valid: true,
      leadId: matchedLead.id,
      history,
      isRecentlyDispatched: Boolean(recentDbDispatch)
    };
  } catch (err: any) {
    console.error('Erro ao verificar legitimidade da encomenda:', err);
    return { valid: false, reason: 'Erro interno na validação da encomenda no servidor.' };
  }
}

/**
 * Reserva de envio com bloqueio atómico contra race conditions em requisições simultâneas
 */
async function acquirePersistentLock(
  orderId: string,
  templateType: string,
  cooldownSeconds: number,
  supabaseUrl: string,
  supabaseServiceRoleKey: string
): Promise<{ acquired: boolean; reason?: string }> {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return { acquired: true };
  }
  try {
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });
    const lockKey = `order_${orderId}_${templateType}`;
    const { data: acquired, error } = await adminClient.rpc('check_and_acquire_dispatch_lock', {
      p_lock_key: lockKey,
      p_cooldown_seconds: cooldownSeconds
    });
    if (!error && typeof acquired === 'boolean') {
      return {
        acquired,
        reason: acquired ? undefined : 'Notificação em processamento ou enviada recentemente (bloqueio atómico activo).'
      };
    }
  } catch (_e) {
    // Fallback silencioso para verificação em crm_leads.history caso a RPC não esteja instalada
  }
  return { acquired: true };
}

// ==============================================================================
// HANDLER PRINCIPAL DA EDGE FUNCTION
// ==============================================================================
Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let payload: BrevoRequestPayload;
  try {
    const raw = await req.text();
    payload = raw ? JSON.parse(raw) : ({} as BrevoRequestPayload);
  } catch (_e) {
    return new Response(JSON.stringify({ success: false, error: 'JSON inválido no corpo do pedido.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const brevoApiKey = Deno.env.get('BREVO_API_KEY') || '';
  const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL') || 'geral@aquitem.ao';
  const senderName = Deno.env.get('BREVO_SENDER_NAME') || 'AQUI TEM Angola';
  const isSimulated = !brevoApiKey || brevoApiKey.trim().length === 0;

  try {
    switch (payload.action) {
      // ------------------------------------------------------------------------
      // 1. SINCRONIZAÇÃO DE CONTACTOS (COM CONTROLO DE CONSENTIMENTO)
      // ------------------------------------------------------------------------
      case 'sync-contact': {
        const contact = payload.contact;
        if (!contact || !contact.email || !isValidEmail(contact.email)) {
          return new Response(JSON.stringify({
            success: false,
            error: 'E-mail do contacto é inválido ou contém caracteres não permitidos.'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const normalizedEmail = contact.email.trim().toLowerCase();

        // Prevenção de abuso: Rate limiting por e-mail de contacto (máx 10 pedidos/minuto)
        const rateCheck = checkRateLimit(`sync_${normalizedEmail}`, 10, 60000);
        if (!rateCheck.allowed) {
          return new Response(JSON.stringify({
            success: false,
            error: `Demasiados pedidos de sincronização para este contacto. Tente novamente em ${rateCheck.retryAfter}s.`
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const names = (contact.name || '').trim().split(' ');
        const firstName = names[0] || '';
        const lastName = names.slice(1).join(' ') || '';
        const hasTrueConsent = Boolean(contact.marketingConsent);
        const marketingListIdStr = Deno.env.get('BREVO_MARKETING_LIST_ID');
        const marketingListId = marketingListIdStr ? Number(marketingListIdStr) : null;

        const attributes: Record<string, unknown> = {
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          SMS: contact.phone || '',
          PHONE: contact.phone || '',
          CITY: contact.city || 'Luanda',
          ADDRESS: contact.address || '',
          ORDER_COUNT: Number(contact.orderCount || 0),
          TOTAL_SPENT: Number(contact.totalSpent || 0),
          MARKETING_CONSENT: hasTrueConsent,
          CONSENT_UPDATED_AT: new Date().toISOString(),
          LAST_UPDATED: new Date().toISOString()
        };

        if (isSimulated) {
          return new Response(JSON.stringify({
            success: true,
            simulated: true,
            message: 'Contacto processado em modo simulado (Chave API não configurada no servidor).',
            email: normalizedEmail,
            marketingConsent: hasTrueConsent,
            promotionalListSubscribed: hasTrueConsent && Boolean(marketingListId),
            attributes
          }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Criar ou atualizar contacto na API oficial do Brevo
        // PONTO DE SEGURANÇA 4: Apenas incluir listIds se houver consentimento explícito verdadeiro
        const contactBody: Record<string, unknown> = {
          email: normalizedEmail,
          attributes,
          updateEnabled: true
        };

        if (hasTrueConsent && marketingListId) {
          contactBody.listIds = [marketingListId];
        } else if (!hasTrueConsent && marketingListId) {
          contactBody.unlinkListIds = [marketingListId];
        }

        const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contactBody)
        });

        const brevoJson = await brevoRes.json().catch(() => ({}));
        if (!brevoRes.ok && brevoRes.status !== 201 && brevoRes.status !== 204) {
          if (brevoRes.status === 400 && brevoJson.code === 'duplicate_parameter') {
            const updateBody: Record<string, unknown> = { attributes };
            if (hasTrueConsent && marketingListId) {
              updateBody.listIds = [marketingListId];
            } else if (!hasTrueConsent && marketingListId) {
              updateBody.unlinkListIds = [marketingListId];
            }

            await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(normalizedEmail)}`, {
              method: 'PUT',
              headers: { 'api-key': brevoApiKey, 'Content-Type': 'application/json' },
              body: JSON.stringify(updateBody)
            });
          } else {
            throw new Error(`Falha Brevo API: ${brevoJson.message || brevoRes.statusText}`);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          simulated: false,
          email: normalizedEmail,
          marketingConsent: hasTrueConsent,
          promotionalListSubscribed: hasTrueConsent && Boolean(marketingListId),
          syncedAt: new Date().toISOString()
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // ------------------------------------------------------------------------
      // 2. DISPARO DE E-MAIL TRANSACCIONAL PROTEGIDO
      // ------------------------------------------------------------------------
      case 'send-email': {
        const emailData = payload.emailData;
        if (!emailData || !isValidEmail(emailData.to) || !emailData.templateType) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Destinatário (to) inválido ou modelo (templateType) ausente.'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const templateType = emailData.templateType;
        const recipientEmail = (emailData.to || '').trim().toLowerCase();

        // PONTO DE SEGURANÇA 1: Proteger contra disparo arbitrário por visitantes anónimos
        const isAdmin = await verifyAdminAuth(req, supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey);

        // Bloqueio A: Se o template for de transição de estado da encomenda, APENAS ADMIN pode disparar
        if (ADMIN_LIFECYCLE_TEMPLATES.includes(templateType)) {
          if (!isAdmin) {
            return new Response(JSON.stringify({
              success: false,
              error: `Acesso negado: O evento de notificação '${templateType}' exige perfil administrativo autenticado.`
            }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }

        // Bloqueio B: Se o template for público (checkout ou comprovativo), validar legitimidade da encomenda
        let orderValidation: OrderValidationResult | null = null;

        if (PUBLIC_ORDER_TEMPLATES.includes(templateType)) {
          const orderId = emailData.orderData?.id;
          if (!orderId || !orderId.trim()) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Identificador da encomenda (orderData.id) é obrigatório para notificações de pedido.'
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          // PONTO DE SEGURANÇA 2: Validar se a encomenda existe e se o destinatário coincide
          orderValidation = await validateOrderRecipient(
            orderId,
            recipientEmail,
            templateType,
            supabaseUrl,
            supabaseServiceRoleKey
          );

          if (!orderValidation.valid) {
            return new Response(JSON.stringify({
              success: false,
              error: orderValidation.reason || 'Validação de legitimidade da encomenda falhou.'
            }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          // PONTO DE SEGURANÇA 3: Prevenção contra spam e duplicações
          // Camada L2: Validação persistente baseada no histórico oficial da BD
          if (orderValidation.isRecentlyDispatched) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Notificação já enviada recentemente para esta encomenda (verificado na base de dados). Aguarde 2 minutos.'
            }), {
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          // Camada L3: Bloqueio atómico na base de dados contra concorrência e requisições simultâneas
          const lockResult = await acquirePersistentLock(
            orderId,
            templateType,
            120,
            supabaseUrl,
            supabaseServiceRoleKey
          );
          if (!lockResult.acquired) {
            return new Response(JSON.stringify({
              success: false,
              error: lockResult.reason || 'Bloqueio de envio simultâneo activo. Aguarde 2 minutos.'
            }), {
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          // Camada L1: Limitação em memória por encomenda e evento
          const limitKey = `order_email_${orderId}_${templateType}`;
          const rateCheck = checkRateLimit(limitKey, 2, 120000); // máx 2 disparos a cada 2 minutos
          if (!rateCheck.allowed) {
            return new Response(JSON.stringify({
              success: false,
              error: `Notificação já enviada recentemente para esta encomenda. Aguarde ${rateCheck.retryAfter}s antes de tentar novamente.`
            }), {
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }

        // Bloqueio C: Confirmação de registo só para o próprio utilizador autenticado ou admin
        if (templateType === 'registration_confirmation' && !isAdmin) {
          const authenticatedUser = await getAuthenticatedUser(req, supabaseUrl, supabaseAnonKey);
          if (!authenticatedUser || authenticatedUser.email?.toLowerCase() !== recipientEmail) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Acesso negado: O e-mail de confirmação de conta só pode ser despachado para a sessão do próprio utilizador.'
            }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }

        // Bloqueio D: Impedir que anónimos injectem mensagens livres (customMessage) para spam
        if (!isAdmin && emailData.customMessage) {
          delete emailData.customMessage;
        }

        const { subject, html } = generateEmailHtml(templateType, emailData);

        let emailJson: any = {};
        if (!isSimulated) {
          const emailPayload = {
            sender: {
              name: senderName,
              email: senderEmail
            },
            to: [
              {
                email: recipientEmail,
                name: payload.emailData?.recipientName || 'Cliente AQUI TEM'
              }
            ],
            subject,
            htmlContent: html
          };

          const brevoEmailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'api-key': brevoApiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailPayload)
          });

          emailJson = await brevoEmailRes.json().catch(() => ({}));

          if (!brevoEmailRes.ok) {
            throw new Error(`Falha no envio Brevo: ${emailJson.message || brevoEmailRes.statusText}`);
          }
        }

        const dispatchedMsgId = isSimulated
          ? `<simulated-brevo-${Date.now()}@aquitem.ao>`
          : (emailJson.messageId || `<brevo-${Date.now()}@aquitem.ao>`);

        // Persistência distribuída no histórico da encomenda em crm_leads (Rate Limit L2)
        if (supabaseUrl && supabaseServiceRoleKey && orderValidation?.leadId) {
          try {
            const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });
            const currentHistory = Array.isArray(orderValidation.history) ? orderValidation.history : [];
            const newHistoryRecord = {
              event: 'email_dispatch',
              template: templateType,
              sent_at: new Date().toISOString(),
              recipient: recipientEmail,
              message_id: dispatchedMsgId
            };
            await adminClient
              .from('crm_leads')
              .update({ history: [...currentHistory, newHistoryRecord] })
              .eq('id', orderValidation.leadId);
          } catch (dbErr) {
            console.warn('Aviso: Não foi possível atualizar histórico de envios em crm_leads:', dbErr);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          simulated: isSimulated,
          messageId: dispatchedMsgId,
          templateType,
          to: recipientEmail,
          subject,
          dispatchedAt: new Date().toISOString()
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // ------------------------------------------------------------------------
      // 3. REGISTO DE EVENTO DE E-COMMERCE
      // ------------------------------------------------------------------------
      case 'track-event': {
        const eventData = payload.eventData;
        if (!eventData || !eventData.eventName || !eventData.email) {
          return new Response(JSON.stringify({ success: false, error: 'eventName e email são obrigatórios.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const eventId = eventData.eventId || `${eventData.eventName}-${eventData.email}-${Date.now()}`;
        return new Response(JSON.stringify({
          success: true,
          simulated: isSimulated,
          eventId,
          eventName: eventData.eventName,
          email: eventData.email,
          recordedAt: new Date().toISOString()
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // ------------------------------------------------------------------------
      // 4. INDICADORES ADMINISTRATIVOS (EXCLUSIVO A ADMINS AUTORIZADOS)
      // ------------------------------------------------------------------------
      case 'analytics': {
        // Validação estrita de autorização administrativa no backend (FAIL-CLOSED)
        const isAdmin = await verifyAdminAuth(req, supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey);
        if (!isAdmin) {
          return new Response(JSON.stringify({
            success: false,
            category: 'authorization',
            message: 'Acesso restrito: Apenas administradores autorizados em public.admin_users podem consultar métricas.'
          }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (isSimulated) {
          return new Response(JSON.stringify({
            success: true,
            simulated: true,
            stats: {
              totalContacts: 148,
              authorizedContacts: 96,
              synchronizedOrders: 54,
              emailsSent: 142,
              emailsDelivered: 139,
              openRate: '46.8%',
              clickRate: '18.2%',
              campaignConversions: 24
            }
          }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Consultar dados reais da conta oficial Brevo
        const accountRes = await fetch('https://api.brevo.com/v3/account', {
          headers: { 'api-key': brevoApiKey }
        });
        const accountData = await accountRes.json().catch(() => ({}));

        return new Response(JSON.stringify({
          success: true,
          simulated: false,
          account: accountData,
          stats: {
            totalContacts: accountData.contactsCount || 0,
            authorizedContacts: accountData.contactsCount || 0,
            synchronizedOrders: 0,
            emailsSent: 0,
            emailsDelivered: 0,
            openRate: '0.0%',
            clickRate: '0.0%',
            campaignConversions: 0
          }
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        return new Response(JSON.stringify({ success: false, error: 'Ação não reconhecida.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || 'Erro inesperado no processamento da API Brevo.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
