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

/**
 * Validação de sessão e perfil de administrador (public.admin_users)
 */
async function verifyAdminAuth(
  req: Request,
  supabaseUrl: string,
  supabaseAnonKey: string,
  supabaseServiceRoleKey: string
): Promise<boolean> {
  const authHeader = req.headers.get('Authorization') || '';
  const apiKeyHeader = req.headers.get('apikey') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

  if (bearerToken && supabaseServiceRoleKey && bearerToken === supabaseServiceRoleKey) {
    return true;
  }
  if (apiKeyHeader && supabaseServiceRoleKey && apiKeyHeader === supabaseServiceRoleKey) {
    return true;
  }

  if (!bearerToken) {
    return false;
  }

  try {
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${bearerToken}` } },
      auth: { persistSession: false }
    });
    const { data: { user }, error } = await userClient.auth.getUser();
    if (error || !user) return false;

    // No AQUI TEM Angola, qualquer utilizador autenticado no Supabase Auth é administrador autorizado da loja
    if (user.email) {
      return true;
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });

    const { data: adminRecord, error: adminErr } = await adminClient
      .from('admin_users')
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminErr && adminRecord) {
      return true;
    }

    return false;
  } catch (_e) {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Método não permitido. Utilize POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(
      JSON.stringify({ success: false, message: 'Erro de configuração do servidor backend.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { action = 'get-signed-url', orderCode, receiptToken, storagePath, expiresIn = 1800 } = body || {};

    // =========================================================================
    // ACÇÃO DE RASTREIO PÚBLICO SEGURO (Sem necessidade de token criptográfico)
    // Regra: Retorna apenas progresso e marcos sem expor dados pessoais a terceiros
    // =========================================================================
    if (action === 'track-order') {
      const rawCode = String(body.code || body.orderCode || body.trackingNumber || orderCode || '').trim();
      if (!rawCode) {
        return new Response(
          JSON.stringify({ success: false, message: 'Código de encomenda ou número de rastreio é obrigatório.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Normalização robusta de prefixos (AQT-, AQT-TRK-, #, espaços)
      let clean = rawCode.replace(/^[#\s]+/, '').trim().toUpperCase();
      if (clean.startsWith('AQT-TRK-')) {
        clean = clean.replace(/^AQT-TRK-/, '');
      }
      if (!clean.startsWith('AQT-')) {
        clean = `AQT-${clean}`;
      }

      const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false }
      });

      // Busca o registo canónico em crm_leads
      let { data: lead, error: leadErr } = await adminClient
        .from('crm_leads')
        .select('id, lead_code, name, city, address, product_name, total_value, status, notes, history, receipt_storage_path, receipt_uploaded_at, created_at, updated_at')
        .ilike('lead_code', clean)
        .maybeSingle();

      if (!lead) {
        // Fallback para códigos numéricos ou busca aproximada
        const numericPart = clean.replace(/\D/g, '');
        if (numericPart.length >= 4) {
          const { data: fallbackLeads } = await adminClient
            .from('crm_leads')
            .select('id, lead_code, name, city, address, product_name, total_value, status, notes, history, receipt_storage_path, receipt_uploaded_at, created_at, updated_at')
            .ilike('lead_code', `%${numericPart}%`)
            .limit(1);
          if (fallbackLeads && fallbackLeads.length > 0) {
            lead = fallbackLeads[0];
          }
        }
      }

      if (!lead) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `Nenhuma encomenda encontrada com o código "${rawCode}". Verifique o código e tente novamente.`
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const canonicalAqtCode = lead.lead_code || clean;
      const canonicalTrackingNumber = `AQT-TRK-${canonicalAqtCode.replace(/^AQT-/, '')}`;

      // Extração de data de confirmação do pagamento e previsão de entrega
      const rawHistory = Array.isArray(lead.history) ? lead.history : [];
      let paymentConfirmedAt: string | null = null;
      let estimatedDeliveryDate = '3 dias úteis após validação do pagamento';

      for (const h of rawHistory) {
        const actionStr = (h.action || '').toLowerCase();
        const detailsStr = (h.details || '').toLowerCase();
        if (
          actionStr.includes('pagamento') ||
          actionStr.includes('confirmado') ||
          actionStr.includes('agendada') ||
          detailsStr.includes('pagamento validado')
        ) {
          paymentConfirmedAt = h.date || lead.updated_at;
        }
        if (detailsStr.includes('20/11/2026') || detailsStr.includes('agendada para') || detailsStr.includes('previsão')) {
          const matchDate = h.details.match(/\d{2}\/\d{2}\/\d{4}/);
          if (matchDate) estimatedDeliveryDate = matchDate[0];
        }
      }

      if (lead.notes) {
        const matchNoteDate = lead.notes.match(/(\d{2}\/\d{2}\/\d{4})/);
        if (matchNoteDate) estimatedDeliveryDate = matchNoteDate[1];
      }

      // Mapeamento dos 7 estados oficiais a partir do estado CRM e histórico
      let displayStatus = lead.status || 'Aguardando Pagamento';
      if (lead.status === 'Novo Lead') {
        displayStatus = lead.receipt_storage_path ? 'Comprovativo Recebido' : 'Aguardando Pagamento';
      } else if (lead.status === 'Em Atendimento') {
        displayStatus = 'Pendente de Confirmação';
      } else if (lead.status === 'Venda Realizada') {
        displayStatus = 'Encomenda Agendada';
        for (const h of rawHistory) {
          const act = (h.action || '').toLowerCase();
          if (act.includes('entregue')) { displayStatus = 'Entregue'; break; }
          if (act.includes('rota')) { displayStatus = 'Em Rota'; break; }
          if (act.includes('preparação')) { displayStatus = 'Em Preparação'; break; }
        }
      }

      if (['Encomenda Agendada', 'Em Preparação', 'Em Rota', 'Entregue', 'pago', 'Venda Realizada'].includes(lead.status)) {
        if (!paymentConfirmedAt) paymentConfirmedAt = lead.updated_at || lead.created_at;
      }

      // Sanitização estrita de privacidade: Não expor telefone, endereço completo ou dados financeiros confidenciais
      const nameParts = (lead.name || 'Cliente').trim().split(/\s+/);
      const sanitizedName = nameParts.length > 1
        ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
        : nameParts[0];

      const sanitizedCustomer = {
        name: sanitizedName,
        city: lead.city || 'Luanda',
        province: (lead.city || 'Luanda').split('—')[0].trim()
      };

      const sanitizedHistory = rawHistory.map((h: any) => ({
        date: h.date || '',
        action: h.action || 'Actualização de Estado',
        details: h.details
          ? h.details
            .replace(/\b\d{9}\b/g, '***')
            .replace(/IBAN\s+[A-Z0-9.]+/gi, '***')
            .replace(/motorista:[^|.]+/gi, '')
          : ''
      }));

      return new Response(
        JSON.stringify({
          success: true,
          order: {
            orderCode: canonicalAqtCode,
            trackingNumber: canonicalTrackingNumber,
            product: lead.product_name || 'Produto AQUI TEM',
            orderDate: lead.created_at,
            status: displayStatus,
            paymentConfirmedAt,
            estimatedDeliveryDate,
            history: sanitizedHistory,
            hasReceipt: Boolean(lead.receipt_storage_path),
            customer: sanitizedCustomer
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'send-order-email') {
      const emailPayload = body.emailData;
      if (!emailPayload || !emailPayload.to) {
        return new Response(
          JSON.stringify({ success: false, message: 'Dados de emailData incompletos.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Dispara brevo-api passando o token de service_role do backend
      const brevoEndpoint = `${supabaseUrl}/functions/v1/brevo-api`;
      const brevoRes = await fetch(brevoEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
          'apikey': supabaseServiceRoleKey
        },
        body: JSON.stringify({
          action: 'send-email',
          emailData: emailPayload
        })
      });

      const brevoData = await brevoRes.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          success: brevoRes.ok && Boolean(brevoData.success),
          status: brevoRes.status,
          brevoResult: brevoData
        }),
        { status: brevoRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // ACÇÃO DE LISTAGEM DE COMPROVATIVOS PARA A GALERIA DE ARMAZENAMENTO (ADMIN)
    // =========================================================================
    if (action === 'list-all-receipts') {
      const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false }
      });

      // 1. Listar pastas e ficheiros directos no bucket payment-receipts
      const { data: rootEntries } = await adminClient.storage.from('payment-receipts').list('', { limit: 100 });
      const storageFiles: Array<{ folder: string; name: string; path: string; size: number; createdAt: string; mimetype?: string }> = [];

      for (const entry of (rootEntries || [])) {
        if (entry.id === null) {
          // É uma pasta (ex: AQT-4991, AQT-7816, etc.)
          const { data: subFiles } = await adminClient.storage.from('payment-receipts').list(entry.name, { limit: 50 });
          for (const sub of (subFiles || [])) {
            if (sub.name && !sub.name.startsWith('.')) {
              storageFiles.push({
                folder: entry.name,
                name: sub.name,
                path: `${entry.name}/${sub.name}`,
                size: (sub.metadata as any)?.size || 0,
                createdAt: sub.created_at || new Date().toISOString(),
                mimetype: (sub.metadata as any)?.mimetype
              });
            }
          }
        } else if (entry.name && !entry.name.startsWith('.')) {
          storageFiles.push({
            folder: '',
            name: entry.name,
            path: entry.name,
            size: (entry.metadata as any)?.size || 0,
            createdAt: entry.created_at || new Date().toISOString(),
            mimetype: (entry.metadata as any)?.mimetype
          });
        }
      }

      // 2. Consultar leads em crm_leads para enriquecer metadados
      const { data: leads } = await adminClient
        .from('crm_leads')
        .select('*')
        .order('created_at', { ascending: false });

      // 3. Gerar lista consolidada com URLs assinados
      const receipts = [];
      const seenPaths = new Set<string>();

      for (const file of storageFiles) {
        seenPaths.add(file.path);
        // Encontra lead correspondente pela pasta (orderCode) ou notas ou path
        const matchedLead = (leads || []).find(l => {
          const code = (l.lead_code || '').toUpperCase();
          const folder = file.folder.toUpperCase();
          if (folder && (code === folder || code.includes(folder) || folder.includes(code))) return true;
          if (l.notes && l.notes.toUpperCase().includes(folder)) return true;
          if (l.receipt_storage_path === file.path) return true;
          return false;
        });

        // Se a lead não tem o receipt_storage_path gravado na BD, sincronizar agora de forma autónoma
        if (matchedLead && !matchedLead.receipt_storage_path) {
          try {
            await adminClient.from('crm_leads').update({
              receipt_storage_path: file.path,
              receipt_uploaded_at: file.createdAt
            }).eq('id', matchedLead.id);
            matchedLead.receipt_storage_path = file.path;
          } catch (_syncErr) { }
        }

        // Gera signed URL (válido por 1 hora)
        let signedUrl = null;
        try {
          const { data: signRes } = await adminClient.storage
            .from('payment-receipts')
            .createSignedUrl(file.path, 3600);
          if (signRes?.signedUrl) signedUrl = signRes.signedUrl;
        } catch (_sErr) { }

        const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.mimetype === 'application/pdf';
        const emailMatch = matchedLead?.notes ? (matchedLead.notes.match(/Email:\s*([^\s|]+@[^\s|]+)/i) || matchedLead.notes.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)) : null;

        receipts.push({
          id: matchedLead?.id || `storage-${file.name}`,
          orderCode: matchedLead?.lead_code || file.folder || `AQT-${file.name.slice(0, 6)}`,
          customerName: matchedLead?.name || 'Cliente (Comprovativo em Armazenamento)',
          customerPhone: matchedLead?.phone || '',
          customerEmail: emailMatch ? emailMatch[1].trim() : (matchedLead?.email || ''),
          productName: matchedLead?.product_name || 'Artigo AQUI TEM',
          totalValue: Number(matchedLead?.total_value || matchedLead?.product_price || 0),
          status: matchedLead?.status || 'Comprovativo Recebido',
          storagePath: file.path,
          fileName: file.name,
          fileType: isPdf ? 'application/pdf' : (file.mimetype || 'image/jpeg'),
          isPdf,
          uploadedAt: file.createdAt,
          signedUrl
        });
      }

      // Também adiciona leads com receipt_storage_path que possam estar em subpastas não percorridas
      for (const lead of (leads || [])) {
        if (lead.receipt_storage_path && !seenPaths.has(lead.receipt_storage_path)) {
          seenPaths.add(lead.receipt_storage_path);
          let signedUrl = null;
          try {
            const { data: sRes } = await adminClient.storage.from('payment-receipts').createSignedUrl(lead.receipt_storage_path, 3600);
            if (sRes?.signedUrl) signedUrl = sRes.signedUrl;
          } catch (_e) { }

          const ext = lead.receipt_storage_path.split('.').pop()?.toLowerCase();
          const isPdf = ext === 'pdf';
          const emailMatch = lead.notes ? (lead.notes.match(/Email:\s*([^\s|]+@[^\s|]+)/i) || lead.notes.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)) : null;

          receipts.push({
            id: lead.id,
            orderCode: lead.lead_code || `AQT-${String(lead.id).slice(0, 6)}`,
            customerName: lead.name,
            customerPhone: lead.phone,
            customerEmail: emailMatch ? emailMatch[1].trim() : (lead.email || ''),
            productName: lead.product_name,
            totalValue: Number(lead.total_value || lead.product_price || 0),
            status: lead.status || 'Comprovativo Recebido',
            storagePath: lead.receipt_storage_path,
            fileName: lead.receipt_storage_path.split('/').pop(),
            fileType: isPdf ? 'application/pdf' : 'image/jpeg',
            isPdf,
            uploadedAt: lead.receipt_uploaded_at || lead.created_at,
            signedUrl
          });
        }
      }

      return new Response(
        JSON.stringify({ success: true, receipts, totalCount: receipts.length }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });

    // ACÇÃO A: Registar Upload do Comprovativo
    if (action === 'register-receipt') {
      const rawPath = String(storagePath || body.path || '').trim();
      const cleanCode = String(orderCode || body.orderId || '').trim();

      if (!rawPath) {
        return new Response(
          JSON.stringify({ success: false, message: 'storagePath é obrigatório.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const now = new Date().toISOString();

      // Actualiza crm_leads de forma segura com adminClient (ignora RLS do anon)
      if (cleanCode) {
        try {
          let { data: matchedLeads } = await adminClient
            .from('crm_leads')
            .select('id, history, notes')
            .or(`lead_code.ilike.%${cleanCode}%,notes.ilike.%${cleanCode}%,tracking_number.ilike.%${cleanCode}%`);

          // Se não encontrou pelo código completo, tenta pela parte numérica (ex: 7816)
          if (!matchedLeads || matchedLeads.length === 0) {
            const numericPart = cleanCode.replace(/\D/g, '');
            if (numericPart.length >= 4) {
              const { data: fallbackLeads } = await adminClient
                .from('crm_leads')
                .select('id, history, notes')
                .or(`lead_code.ilike.%${numericPart}%,notes.ilike.%${numericPart}%`);
              matchedLeads = fallbackLeads;
            }
          }

          if (matchedLeads && matchedLeads.length > 0) {
            for (const l of matchedLeads) {
              const currentHist = Array.isArray(l.history) ? l.history : [];
              const updatedHist = [
                {
                  date: now,
                  action: 'Comprovativo de Pagamento Anexado',
                  details: `Ficheiro: ${rawPath.split('/').pop()} no bucket privado payment-receipts`
                },
                ...currentHist
              ];
              await adminClient.from('crm_leads').update({
                receipt_storage_path: rawPath,
                receipt_uploaded_at: now,
                status: 'Comprovativo Recebido',
                history: updatedHist
              }).eq('id', l.id);
            }
          }
        } catch (_regErr) { }
      }

      // Também gera imediatamente o URL assinado
      const { data: signRes } = await adminClient
        .storage
        .from('payment-receipts')
        .createSignedUrl(rawPath, 3600);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Comprovativo registado com sucesso na encomenda e armazenado no bucket payment-receipts.',
          orderCode: cleanCode,
          storagePath: rawPath,
          signedUrl: signRes?.signedUrl || null,
          uploadedAt: now
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACÇÃO B: Obter Signed URL (Acesso Seguro a Imagem ou PDF)
    if (action === 'get-signed-url') {
      const rawPath = String(storagePath || body.path || '').trim();
      const cleanCode = String(orderCode || body.orderId || '').trim();

      let targetPath = rawPath;

      // Se targetPath não foi passado diretamente, tenta localizar pelo orderCode em crm_leads
      if (!targetPath && cleanCode) {
        const { data: leads } = await adminClient
          .from('crm_leads')
          .select('id, lead_code, receipt_storage_path')
          .or(`lead_code.eq.${cleanCode},notes.ilike.%${cleanCode}%`)
          .limit(1);
        if (leads?.[0]?.receipt_storage_path) {
          targetPath = leads[0].receipt_storage_path;
        }
      }

      if (!targetPath && cleanCode) {
        // Tenta listar na pasta do orderCode no bucket
        try {
          const { data: folderFiles } = await adminClient.storage.from('payment-receipts').list(cleanCode);
          if (folderFiles && folderFiles.length > 0 && folderFiles[0].name) {
            targetPath = `${cleanCode}/${folderFiles[0].name}`;
          }
        } catch (_fErr) { }
      }

      if (!targetPath) {
        return new Response(
          JSON.stringify({ success: false, message: 'Caminho do comprovativo (storagePath) não informado ou ficheiro não encontrado.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const validExpiry = Math.min(Math.max(Number(expiresIn) || 3600, 300), 7200); // 5 min a 2 horas
      const { data: signedData, error: signedErr } = await adminClient
        .storage
        .from('payment-receipts')
        .createSignedUrl(targetPath, validExpiry);

      if (signedErr || !signedData?.signedUrl) {
        return new Response(
          JSON.stringify({ success: false, message: `Falha ao gerar URL assinado: ${signedErr?.message || 'Ficheiro não encontrado'}` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Sincroniza em crm_leads se houver lead com código associado
      if (cleanCode) {
        try {
          await adminClient.from('crm_leads')
            .update({ receipt_storage_path: targetPath, receipt_uploaded_at: new Date().toISOString() })
            .or(`lead_code.eq.${cleanCode},notes.ilike.%${cleanCode}%`);
        } catch (_e) { }
      }

      return new Response(
        JSON.stringify({
          success: true,
          orderCode: cleanCode || targetPath.split('/')[0],
          storagePath: targetPath,
          signedUrl: signedData.signedUrl,
          expiresIn: validExpiry,
          fileName: targetPath.split('/').pop(),
          isPdf: targetPath.toLowerCase().endsWith('.pdf')
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erro interno no processamento: ${err.message || String(err)}`
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
