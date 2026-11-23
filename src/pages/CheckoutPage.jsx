import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  Clock,
  ShieldCheck,
  CreditCard,
  Building,
  Copy,
  Check,
  Upload,
  FileText,
  AlertCircle,
  Truck,
  MapPin,
  ExternalLink,
  ChevronRight,
  Info,
  X
} from 'lucide-react';

import Layout from '../components/Layout';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { ANGOLA_PROVINCES, getDeliveryFeeForLocation, calculateEstimatedDeliveryDate } from '../utils/angolaLocations';
import { createAndSaveOrder, getSavedCustomerProfile, attachPaymentReceipt } from '../utils/customerOrders';
import { uploadReceiptDocument } from '../lib/supabase';

export default function CheckoutPage() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const {
    cart,
    clearCart,
    subtotal,
    appliedDiscount,
    discountAmount,
    finalTotal,
    getEffectivePrice,
    formatPriceKz,
    directCheckoutItem,
    setDirectCheckoutItem,
    showToast
  } = useStore();

  const savedProfile = getSavedCustomerProfile() || {};

  // Form State
  const [formData, setFormData] = useState({
    name: savedProfile.name || '',
    phone: savedProfile.phone || '',
    email: savedProfile.email || '',
    province: savedProfile.province || 'Luanda',
    municipality: savedProfile.municipality || 'Luanda',
    address: savedProfile.address || '',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('Transferência Bancária');
  const [copiedKey, setCopiedKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Upload de Comprovativo State
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [receiptError, setReceiptError] = useState('');

  // Artigos a encomendar (item direto ou carrinho completo)
  const itemsToCheckout = directCheckoutItem ? [directCheckoutItem] : cart;
  const isSingle = Boolean(directCheckoutItem) && itemsToCheckout.length === 1;

  // Cálculo da Taxa de Entrega (Regra Estrita: Mínimo obrigatório de 3.000 Kz)
  const deliveryFee = Math.max(getDeliveryFeeForLocation(formData.province, formData.municipality), 3000);
  const itemsSubtotal = isSingle
    ? getEffectivePrice(itemsToCheckout[0]) * (Number(itemsToCheckout[0].quantity) || 1)
    : Math.max(0, subtotal - discountAmount);
  const grandTotal = itemsSubtotal + deliveryFee;

  // Previsão de Entrega (3 DIAS ÚTEIS)
  const deliveryEstimate = calculateEstimatedDeliveryDate(new Date(), 3);

  // Lista de Municípios da Província selecionada
  const selectedProvinceData = ANGOLA_PROVINCES.find(
    p => p.name.toLowerCase() === formData.province.toLowerCase()
  ) || ANGOLA_PROVINCES[0];

  useEffect(() => {
    document.title = 'Finalizar Encomenda | AQUI TEM Angola';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Se trocar de província, redefine o município padrão
  const handleProvinceChange = (newProv) => {
    const provObj = ANGOLA_PROVINCES.find(p => p.name === newProv) || ANGOLA_PROVINCES[0];
    setFormData(prev => ({
      ...prev,
      province: newProv,
      municipality: provObj.municipalities[0] || 'Centro'
    }));
  };

  // Função para copiar dados bancários
  const handleCopy = (text, key) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast('Copiado para a área de transferência!');
      setTimeout(() => setCopiedKey(''), 3000);
    }
  };

  // Submissão da Encomenda no Sistema
  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      showToast('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      showToast('Insira um e-mail válido para receber a confirmação e faturas.');
      return;
    }

    if (itemsToCheckout.length === 0) {
      showToast('O seu carrinho está vazio.');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createAndSaveOrder({
        customer: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          province: formData.province,
          municipality: formData.municipality,
          address: formData.address.trim(),
          city: `${formData.province} — ${formData.municipality}`
        },
        items: itemsToCheckout,
        subtotal: itemsSubtotal,
        deliveryZone: {
          name: `${formData.province} (${formData.municipality})`,
          shortName: formData.province,
          fee: deliveryFee
        },
        paymentMethod,
        notes: formData.notes.trim(),
        receiptFile: receiptFile || null
      });

      setCreatedOrder(order);
      if (order?.receiptAttached) {
        setReceiptUploaded(true);
      }
      if (clearCart && !directCheckoutItem) {
        clearCart();
      }
      setDirectCheckoutItem(null);
      showToast(`Encomenda #${order.id} criada com sucesso!`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showToast(`Erro ao criar encomenda: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload do Comprovativo Bancário (Imagem / PDF)
  const handleUploadReceipt = async (explicitFile = null) => {
    const fileToUpload = explicitFile && explicitFile.target ? explicitFile.target.files?.[0] : (explicitFile || receiptFile);
    if (!fileToUpload || !createdOrder) return;

    setUploadingReceipt(true);
    setReceiptError('');

    try {
      const uploadRes = await uploadReceiptDocument(
        fileToUpload,
        createdOrder.id,
        createdOrder.receiptToken
      );

      const updated = attachPaymentReceipt(createdOrder.id, {
        fileName: uploadRes.fileName,
        storagePath: uploadRes.storagePath,
        url: uploadRes.url,
        source: 'checkout-portal'
      });

      if (updated) {
        setCreatedOrder(updated);
        setReceiptUploaded(true);
        showToast('Comprovativo submetido com sucesso! Em validação pela tesouraria.');
      }
    } catch (err) {
      setReceiptError(err.message || 'Falha no envio do comprovativo.');
    } finally {
      setUploadingReceipt(false);
    }
  };

  return (
    <Layout>
      <div style={{ background: 'var(--bg-main)', minHeight: '85vh', padding: '24px 16px 64px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>

          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            <Link to="/" style={{ color: 'var(--primary-orange)', textDecoration: 'none', fontWeight: 700 }}>Início</Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Finalizar Compra</span>
          </nav>

          {/* Título Principal */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
              Finalização da Encomenda
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
              Complete os seus dados de entrega e confirme o pagamento oficial com selo de garantia AQUI TEM Angola.
            </p>
          </div>

          {/* ============================================================== */}
          {/* TELA DE SUCESSO / ENVIO DE COMPROVATIVO APÓS CRIAÇÃO DO PEDIDO */}
          {/* ============================================================== */}
          {createdOrder ? (
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: '18px',
                border: '1px solid var(--border-light)',
                padding: '32px 24px',
                boxShadow: 'var(--shadow-md)',
                maxWidth: '780px',
                margin: '0 auto'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#10B981',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <CheckCircle size={36} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
                  Encomenda #{createdOrder.id} Registada!
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
                  Enviámos um e-mail de confirmação com os detalhes da encomenda para <strong>{formData.email}</strong>.
                </p>
              </div>

              {/* Card de Estado do Pedido */}
              <div
                style={{
                  background: 'rgba(255, 101, 0, 0.05)',
                  border: '1px solid rgba(255, 101, 0, 0.2)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--primary-orange)' }}>
                    ESTADO ATUAL
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                    {createdOrder.statusLabel || createdOrder.status}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, color: '#10B981' }}>
                    PREVISÃO DE ENTREGA (3 DIAS ÚTEIS)
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10B981', marginTop: '2px' }}>
                    {deliveryEstimate.formattedDate}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)' }}>
                    TOTAL A PAGAR
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-orange)', marginTop: '2px' }}>
                    {Number(createdOrder.total || grandTotal).toLocaleString('pt-AO')} Kz
                  </div>
                </div>
              </div>

              {/* Secção de Pagamento & Envio do Comprovativo */}
              <div
                style={{
                  background: 'var(--bg-main)',
                  borderRadius: '14px',
                  border: '1px solid var(--border-light)',
                  padding: '24px',
                  marginBottom: '24px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <CreditCard size={20} color="var(--primary-orange)" />
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Coordenadas para Pagamento Oficial
                  </h3>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 16px 0' }}>
                  Efectue a transferência bancária ou envio Multicaixa Express utilizando os dados abaixo e anexe o comprovativo em seguida.
                </p>

                <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                  {/* MULTICAIXA EXPRESS / PAYPAY */}
                  <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MULTICAIXA EXPRESS / PAYPAY</div>
                      <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem', color: '#1E5C9E' }}>
                        931396515
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('931396515', 'mcx')}
                      className="nav-btn"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {copiedKey === 'mcx' ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                      <span>{copiedKey === 'mcx' ? 'Copiado!' : 'Copiar Número'}</span>
                    </button>
                  </div>

                  {/* BFA */}
                  <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>BANCO BFA (IBAN)</div>
                      <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        AO06.0006.0000.9803.5265.3011.9
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('AO06000600009803526530119', 'bfa')}
                      className="nav-btn"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {copiedKey === 'bfa' ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                      <span>{copiedKey === 'bfa' ? 'Copiado!' : 'Copiar IBAN'}</span>
                    </button>
                  </div>

                  {/* BENEFICIÁRIO */}
                  <div style={{ background: 'var(--bg-card)', padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TITULAR DA CONTA</div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                        SAMUEL JOÃO AGOSTINHO KASSAMANO
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('SAMUEL JOÃO AGOSTINHO KASSAMANO', 'titular')}
                      className="nav-btn"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {copiedKey === 'titular' ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                      <span>{copiedKey === 'titular' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* ÁREA DE ENVIO DO COMPROVATIVO */}
                <div
                  style={{
                    borderTop: '1px dashed var(--border-light)',
                    paddingTop: '20px',
                    marginTop: '20px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Upload size={18} color="var(--primary-orange)" />
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                      Anexar Comprovativo de Pagamento
                    </h4>
                  </div>

                  {receiptUploaded ? (
                    <div
                      style={{
                        background: '#ECFDF5',
                        border: '1px solid #10B981',
                        borderRadius: '10px',
                        padding: '16px',
                        color: '#065F46',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <CheckCircle size={24} style={{ flexShrink: 0 }} />
                      <div>
                        <strong>Comprovativo enviado com sucesso!</strong>
                        <div style={{ fontSize: '0.84rem', marginTop: '2px' }}>
                          O seu documento foi guardado no servidor seguro. A equipa de tesouraria está a validar a entrada bancária para aprovar a entrega.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Selecione a fotografia ou documento digital PDF do comprovativo (máx. 10 MB):
                      </p>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                          type="file"
                          id="receipt-file-input"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setReceiptFile(f);
                              handleUploadReceipt(f);
                            }
                          }}
                          style={{ fontSize: '0.85rem' }}
                        />

                        <button
                          type="button"
                          onClick={() => handleUploadReceipt()}
                          disabled={!receiptFile || uploadingReceipt}
                          className="nav-btn nav-btn-orange"
                          style={{
                            padding: '10px 20px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            opacity: (!receiptFile || uploadingReceipt) ? 0.6 : 1
                          }}
                        >
                          <Upload size={16} />
                          <span>{uploadingReceipt ? 'A Enviar Documento...' : 'ENVIAR COMPROVATIVO'}</span>
                        </button>
                      </div>

                      {receiptFile && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                          Ficheiro selecionado: <strong>{receiptFile.name}</strong> ({(receiptFile.size / 1024).toFixed(1)} KB)
                        </div>
                      )}

                      {receiptError && (
                        <div style={{ color: '#DC2626', fontSize: '0.84rem', marginTop: '8px' }}>
                          {receiptError}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Botões Finais de Navegação */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  to={`/cliente?tracking=${createdOrder.id}`}
                  className="nav-btn nav-btn-orange"
                  style={{ textDecoration: 'none', padding: '12px 24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span>Acompanhar na Área do Cliente</span>
                  <ExternalLink size={16} />
                </Link>

                <Link
                  to="/"
                  className="nav-btn"
                  style={{ textDecoration: 'none', padding: '12px 20px', fontWeight: 700 }}
                >
                  Voltar à Loja
                </Link>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* FORMULÁRIO COMPLETO DE CHECKOUT (PASSO A PASSO)                 */
            /* ============================================================== */
            <form onSubmit={handleCreateOrder}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '24px'
                }}
              >
                {/* COLUNA ESQUERDA: DADOS DO CLIENTE & ENTREGA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: '16px',
                      border: '1px solid var(--border-light)',
                      padding: '24px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                      <MapPin size={20} color="var(--primary-orange)" />
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                        1. Dados do Cliente & Entrega em Angola
                      </h2>
                    </div>

                    <div style={{ display: 'grid', gap: '14px' }}>
                      {/* Nome Completo */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Manuel António Domingos"
                          className="form-input"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      {/* Telefone & E-mail */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                            Telemóvel / WhatsApp *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+244 923 000 000"
                            className="form-input"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                            E-mail (Rastreio & Fatura) *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="seuemail@gmail.com"
                            className="form-input"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Província & Município */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                            Província *
                          </label>
                          <select
                            className="form-input"
                            value={formData.province}
                            onChange={e => handleProvinceChange(e.target.value)}
                          >
                            {ANGOLA_PROVINCES.map(prov => (
                              <option key={prov.name} value={prov.name}>
                                {prov.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                            Município *
                          </label>
                          <select
                            className="form-input"
                            value={formData.municipality}
                            onChange={e => setFormData({ ...formData, municipality: e.target.value })}
                          >
                            {selectedProvinceData.municipalities.map(muni => (
                              <option key={muni} value={muni}>
                                {muni}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Endereço Completo */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                          Endereço Completo de Entrega *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Bairro, Rua, Número da Residência / Ponto de Referência"
                          className="form-input"
                          value={formData.address}
                          onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>

                      {/* Notas Adicionais */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                          Observações para a Entrega (Opcional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Ex: Entregar após as 14h00 / Prédio ao lado da farmácia"
                          className="form-input"
                          style={{ resize: 'vertical' }}
                          value={formData.notes}
                          onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SELEÇÃO DO MÉTODO DE PAGAMENTO */}
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: '16px',
                      border: '1px solid var(--border-light)',
                      padding: '24px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                      <CreditCard size={20} color="var(--primary-orange)" />
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                        2. Método de Pagamento
                      </h2>
                    </div>

                    <div style={{ display: 'grid', gap: '12px' }}>
                      {/* Opção 1: Transferência Bancária */}
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '14px 16px',
                          borderRadius: '12px',
                          border: paymentMethod === 'Transferência Bancária' ? '2px solid var(--primary-orange)' : '1px solid var(--border-light)',
                          background: paymentMethod === 'Transferência Bancária' ? 'rgba(255, 101, 0, 0.04)' : 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Transferência Bancária"
                          checked={paymentMethod === 'Transferência Bancária'}
                          onChange={() => setPaymentMethod('Transferência Bancária')}
                          style={{ marginTop: '3px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                            Transferência Bancária (Banco BFA)
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Coordenadas bancárias BFA com botões de cópia rápida e anexo de comprovativo.
                          </div>
                        </div>
                      </label>

                      {/* Opção 2: Multicaixa Express / PayPay */}
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '14px 16px',
                          borderRadius: '12px',
                          border: paymentMethod === 'Multicaixa Express' ? '2px solid var(--primary-orange)' : '1px solid var(--border-light)',
                          background: paymentMethod === 'Multicaixa Express' ? 'rgba(255, 101, 0, 0.04)' : 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Multicaixa Express"
                          checked={paymentMethod === 'Multicaixa Express'}
                          onChange={() => setPaymentMethod('Multicaixa Express')}
                          style={{ marginTop: '3px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                            Multicaixa Express / PayPay (931396515)
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Envio direto via aplicativo Multicaixa Express ou PayPay para o número oficial 931396515.
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Coordenadas Oficiais para Pagamento Imediato */}
                    <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary-orange)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CreditCard size={15} /> Coordenadas Oficiais de Pagamento
                      </div>

                      <div style={{ display: 'grid', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '6px' }}>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>EXPRESS / PAYPAY:</span>
                            <span style={{ fontWeight: 800, color: '#1E5C9E', fontFamily: 'monospace', fontSize: '0.95rem' }}>931396515</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy('931396515', 'mcx-chk')}
                            className="nav-btn"
                            style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                          >
                            {copiedKey === 'mcx-chk' ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '6px' }}>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>BANCO BFA (IBAN):</span>
                            <span style={{ fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace', fontSize: '0.82rem' }}>AO06.0006.0000.9803.5265.3011.9</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy('AO06000600009803526530119', 'bfa-chk')}
                            className="nav-btn"
                            style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                          >
                            {copiedKey === 'bfa-chk' ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>

                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Titular: <strong>SAMUEL JOÃO AGOSTINHO KASSAMANO</strong>
                        </div>
                      </div>
                    </div>

                    {/* Caixa de Upload do Comprovativo na Hora da Compra */}
                    <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', background: 'rgba(255, 101, 0, 0.03)', border: '1px dashed var(--primary-orange)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Upload size={18} color="var(--primary-orange)" />
                        <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                          Anexar Comprovativo Bancário (PDF ou Foto) — Na hora da compra
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                        Se já fez o envio por Multicaixa Express ou transferência BFA, selecione o ficheiro PDF ou fotografia do recibo. Será armazenado com segurança no painel administrativo e validado pela tesouraria.
                      </p>

                      {receiptFile ? (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid #10B981', padding: '12px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {receiptFile.name.toLowerCase().endsWith('.pdf') ? (
                              <FileText size={24} color="#EF4444" />
                            ) : (
                              <CheckCircle size={24} color="#10B981" />
                            )}
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                {receiptFile.name}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {receiptFile.name.toLowerCase().endsWith('.pdf') ? 'Documento PDF' : 'Imagem'} • {(receiptFile.size / 1024).toFixed(1)} KB • Pronto para submeter com a encomenda
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReceiptFile(null)}
                            className="nav-btn"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#DC2626', borderColor: 'rgba(220, 38, 38, 0.3)' }}
                          >
                            <X size={13} /> Remover
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            id="checkout-direct-receipt-input"
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (f) setReceiptFile(f);
                            }}
                            style={{ fontSize: '0.82rem', width: '100%' }}
                          />
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Formatos suportados: PDF, JPG, PNG, WEBP (máx. 10 MB).
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '10px 14px', borderRadius: '8px' }}>
                      <ShieldCheck size={16} color="#10B981" style={{ flexShrink: 0 }} />
                      <span>Todas as transações são conferidas manualmente pela administração antes do agendamento da entrega.</span>
                    </div>
                  </div>
                </div>

                {/* COLUNA DIREITA: RESUMO DA ENCOMENDA & FINALIZAÇÃO */}
                <div>
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: '16px',
                      border: '1px solid var(--border-light)',
                      padding: '24px',
                      boxShadow: 'var(--shadow-sm)',
                      position: 'sticky',
                      top: '24px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                      <ShoppingBag size={20} color="var(--primary-orange)" />
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                        Resumo da Encomenda ({itemsToCheckout.length} {itemsToCheckout.length === 1 ? 'artigo' : 'artigos'})
                      </h2>
                    </div>

                    {/* Lista de Artigos */}
                    <div style={{ display: 'grid', gap: '14px', marginBottom: '18px', maxHeight: '280px', overflowY: 'auto' }}>
                      {itemsToCheckout.map(item => {
                        const effectivePrice = getEffectivePrice(item);
                        const qty = Number(item.quantity) || 1;
                        return (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              paddingBottom: '12px',
                              borderBottom: '1px solid var(--border-light)'
                            }}
                          >
                            <img
                              src={item.image_url || item.image || '/logo.jpg'}
                              alt={item.name}
                              style={{
                                width: '52px',
                                height: '52px',
                                borderRadius: '10px',
                                objectFit: 'cover',
                                background: '#FFFFFF',
                                border: '1px solid var(--border-light)',
                                flexShrink: 0
                              }}
                              onError={(e) => { e.currentTarget.src = '/product_boompop.jpg'; }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {item.description || item.category || 'Selado na caixa'}
                              </div>
                              <div style={{ fontSize: '0.82rem', marginTop: '2px', color: 'var(--text-muted)' }}>
                                {qty}x {Number(effectivePrice).toLocaleString('pt-AO')} Kz
                              </div>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                              {(effectivePrice * qty).toLocaleString('pt-AO')} Kz
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Detalhamento de Valores */}
                    <div style={{ display: 'grid', gap: '8px', fontSize: '0.88rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Subtotal dos Produtos:</span>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.92rem' }}>
                          {Number(itemsSubtotal).toLocaleString('pt-AO')} Kz
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Taxa de Transporte ({formData.province}):</span>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.92rem' }}>
                          {deliveryFee.toLocaleString('pt-AO')} Kz
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#10B981' }}>
                        <span>Previsão de Entrega (3 Dias Úteis):</span>
                        <strong>{deliveryEstimate.formattedDate}</strong>
                      </div>
                    </div>

                    {/* Total Geral */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>TOTAL A PAGAR:</span>
                      <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--primary-orange)' }}>
                        {Number(grandTotal).toLocaleString('pt-AO')} Kz
                      </span>
                    </div>

                    {/* Botão de Finalização */}
                    <button
                      type="submit"
                      disabled={isSubmitting || itemsToCheckout.length === 0}
                      className="nav-btn nav-btn-orange"
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        fontSize: '1rem',
                        fontWeight: 900,
                        justifyContent: 'center',
                        borderRadius: '12px',
                        boxShadow: '0 8px 20px rgba(255, 101, 0, 0.35)',
                        opacity: isSubmitting ? 0.7 : 1
                      }}
                    >
                      <CheckCircle size={20} />
                      <span>{isSubmitting ? 'A Registar Encomenda...' : 'CONFIRMAR E GERAR ENCOMENDA'}</span>
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        🔒 Dados protegidos. O pagamento só é confirmado após validação de comprovativo.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>
    </Layout>
  );
}
