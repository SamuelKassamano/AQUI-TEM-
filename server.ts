
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.post('/api/chat', async (req, res) => {
  const { message, conversationHistory } = req.body;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const contents = [];
    if (Array.isArray(conversationHistory)) {
      conversationHistory.forEach(item => {
        contents.push({
          role: item.sender === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }]
        });
      });
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const stream = await ai.models.generateContentStream({
      model: "gemini-3.8-flash",
      contents: contents,
      config: {
        systemInstruction: `Você é o "AQUI TEM Assistente", o assistente virtual oficial e inteligente da loja online AQUI TEM em Angola (Luanda & Províncias).

INSTRUÇÕES E REGRAS DA LOJA:
1. ATENDIMENTO E TOM: Seja extremamente educado, atencioso, objetivo e rápido nas respostas em Português de Angola.
2. PREÇOS E CÁLCULO:
   - A fórmula oficial de preço da loja é: (Preço de Custo do Fornecedor + 4.000 Kz de Transporte) + 20% a 25% de Margem Comercial.
   - Sempre informe os preços reais do nosso catálogo em Kwanzas (Kz).
3. PRODUTOS EM DESTAQUE:
   - Fones TWS Bluetooth Oraimo FreePods Lite: ~20.000 Kz a 23.750 Kz (40h bateria, HavyBass, IPX4, AniFast)
   - Smartwatch Oraimo Watch Nova 2: ~29.500 Kz a 36.250 Kz (AMOLED 2.01", chamadas Bluetooth, IP68)
   - Câmara Wi-Fi de Segurança 360° PTZ Full HD: ~25.000 Kz a 30.000 Kz (Visão noturna, alertas no telemóvel, áudio 2 vias)
   - Smart Plug Wi-Fi 16A Tomada Inteligente: ~13.750 Kz a 17.500 Kz (Economia de energia, Tuya/Smart Life)
   - Carregador GaN 65W Multiportas com Visor: ~27.500 Kz (2x Type-C + USB-A, visor LCD)
   - Power Bank Oraimo Toast 10 10000mAh: ~20.000 Kz (AniFast, duplo USB)
   - Mini Projetor Smart LED HD Android Wi-Fi: ~48.750 Kz (1080p, YouTube/Netflix embutidos, 180° giratório)
   - Coluna Bluetooth Oraimo SoundPro: ~25.000 Kz (HavyBass, IPX5, bateria longa)
   - Mini Impressora Térmica 58mm Bluetooth: ~27.500 Kz (Sem tinta, para telemóvel)
   - Mini Rastreador GPS Magnético GF-07: ~22.500 Kz (Google Maps em tempo real, botão SOS, escuta)
4. PAGAMENTOS ACEITOS:
   - Pagamento por Multicaixa Express ou TPA na entrega (em Luanda)
   - Transferência Bancária prévia para envios a províncias
   - NÃO aceitamos cartões de crédito internacionais ou PayPal no site.
5. ENTREGAS:
   - Luanda: Entregas expressas em 24h a 48h com pagamento na entrega.
   - Províncias (Benguela, Huambo, Lubango, Cabinda, Malanje, etc.): Envio rápido via transportadora parceira.
6. CONTACTO DIRECTO VIA WHATSAPP:
   - Recomende o WhatsApp oficial: +244 950 752 933 (ou 950752933) para finalização de encomendas ou dúvidas específicas.`,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.write(`data: ${JSON.stringify({ text: 'Olá! Estou aqui para ajudar com qualquer dúvida sobre os produtos Oraimo, eletrodomésticos, preços ou entregas em Luanda. Como posso ajudar?' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
