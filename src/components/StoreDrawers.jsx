import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  CheckCircle,
  Send,
  MessageCircle,
  Heart,
  ExternalLink,
  Mail,
  Truck,
  MapPin,
  ShieldCheck,
  CreditCard,
  Building,
  Copy,
  Check,
  Upload
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useCRM } from '../context/CRMContext';
import { getTranslatedProduct } from '../utils/productTranslations';
import { createSlug } from '../utils/slug';
import { ANGOLA_PROVINCES, getDeliveryFeeForLocation, calculateEstimatedDeliveryDate } from '../utils/angolaLocations';
import { createAndSaveOrder, getSavedCustomerProfile, saveAbandonedCart, attachPaymentReceipt } from '../utils/customerOrders';
import { addNotificationToFeed } from '../utils/notificationSystem';
import { incrementAnalyticsCounter } from '../utils/crmTracker';
import { uploadReceiptDocument } from '../lib/supabase';


export default function StoreDrawers() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const { captureLead } = useCRM();
  const {
    cart,
    clearCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    directCheckoutItem,
    setDirectCheckoutItem,
    wishlistProducts,
    toggleWishlist,
    coupon,
    setCoupon,
    appliedDiscount,
    handleApplyCoupon,
    subtotal,
    discountAmount,
    shippingFee,
    finalTotal,
    toastMessage,
    showToast,
    getEffectivePrice,
    formatPriceKz
  } = useStore();

  const savedProfile = getSavedCustomerProfile() || {};

  const [checkoutForm, setCheckoutForm] = useState({
    name: savedProfile.name || '',
    phone: savedProfile.phone || '',
    email: savedProfile.email || '',
    province: savedProfile.province || 'Luanda',
    municipality: savedProfile.municipality || 'Luanda',
    address: savedProfile.address || '',
    paymentMethod: 'Transferência Bancária',
    notes: ''
  });

  const [createdOrderModal, setCreatedOrderModal] = useState(null);
  const [receiptFileModal, setReceiptFileModal] = useState(null);
  const [uploadingReceiptModal, setUploadingReceiptModal] = useState(false);
  const [receiptUploadedModal, setReceiptUploadedModal] = useState(false);
  const [copiedKeyModal, setCopiedKeyModal] = useState('');
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);

  // Salvar carrinho automaticamente para recuperação
  useEffect(() => {
    if (cart.length > 0) {
      saveAbandonedCart(cart, checkoutForm);
    }
  }, [cart, checkoutForm]);

  const checkoutItems = directCheckoutItem ? [directCheckoutItem] : cart;
  const isSingle = Boolean(directCheckoutItem) && checkoutItems.length === 1;

  // Cálculo automático de taxa de entrega com base na província e município (Mínimo de 3.000 Kz)
  const deliveryFee = Math.max(getDeliveryFeeForLocation(checkoutForm.province, checkoutForm.municipality), 3000);
  const itemsSubtotal = isSingle
    ? getEffectivePrice(checkoutItems[0]) * (Number(checkoutItems[0].quantity) || 1)
    : finalTotal;
  const grandTotal = itemsSubtotal + deliveryFee;

  // Previsão de Entrega de 3 DIAS ÚTEIS
  const deliveryEstimate = calculateEstimatedDeliveryDate(new Date(), 3);

  const selectedProvinceData = ANGOLA_PROVINCES.find(
    p => p.name.toLowerCase() === checkoutForm.province.toLowerCase()
  ) || ANGOLA_PROVINCES[0];

  const handleProvinceChange = (newProv) => {
    const provObj = ANGOLA_PROVINCES.find(p => p.name === newProv) || ANGOLA_PROVINCES[0];
    setCheckoutForm(prev => ({
      ...prev,
      province: newProv,
      municipality: provObj.municipalities[0] || 'Centro'
    }));
  };

  const handleCopyModal = (text, key) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKeyModal(key);
      showToast('Copiado para a área de transferência!');
      setTimeout(() => setCopiedKeyModal(''), 3000);
    }
  };

  const handleInStoreCheckoutSubmit = async (e) => {
    e.preventDefault();

    if (!checkoutForm.name.trim() || !checkoutForm.phone.trim() || !checkoutForm.address.trim()) {
      showToast('Por favor, preencha todos os campos obrigatórios de entrega.');
      return;
    }

    if (!checkoutForm.email.trim() || !checkoutForm.email.includes('@')) {
      showToast('Por favor, insira o seu e-mail para rastreio e confirmação da encomenda.');
      return;
    }

    const itemsToOrder = checkoutItems.length > 0 ? checkoutItems : cart;
    if (itemsToOrder.length === 0) {
      showToast('O seu carrinho está vazio.');
      return;
    }

    setIsSubmittingModal(true);
    try {
      const orderRecord = await createAndSaveOrder({
        customer: {
          name: checkoutForm.name.trim(),
          phone: checkoutForm.phone.trim(),
          email: checkoutForm.email.trim(),
          province: checkoutForm.province,
          municipality: checkoutForm.municipality,
          address: checkoutForm.address.trim(),
          city: `${checkoutForm.province} — ${checkoutForm.municipality}`
        },
        items: itemsToOrder,
        subtotal: itemsSubtotal,
        deliveryZone: {
          name: `${checkoutForm.province} (${checkoutForm.municipality})`,
          shortName: checkoutForm.province,
          fee: deliveryFee
        },
        paymentMethod: checkoutForm.paymentMethod,
        notes: checkoutForm.notes.trim()
      });

      // Adicionar notificação in-app
      addNotificationToFeed({
        type: 'order',
        title: `📦 Encomenda #${orderRecord.id} Registada!`,
        message: `A sua encomenda de ${Number(grandTotal).toLocaleString('pt-AO')} Kz foi registada com sucesso. Previsão: ${deliveryEstimate.formattedDate}.`,
        link: `/cliente?tracking=${orderRecord.id}`
      });

      setCreatedOrderModal(orderRecord);
      if (clearCart && !directCheckoutItem) {
        clearCart();
      }
      showToast(`Encomenda #${orderRecord.id} registada com sucesso!`);
    } catch (err) {
      showToast(`Erro ao registar encomenda: ${err.message}`);
    } finally {
      setIsSubmittingModal(false);
    }
  };

  // Upload do Comprovativo Bancário a partir do Modal
  const handleModalUploadReceipt = async () => {
    if (!receiptFileModal || !createdOrderModal) return;

    setUploadingReceiptModal(true);
    try {
      const uploadRes = await uploadReceiptDocument(
        receiptFileModal,
        createdOrderModal.id,
        createdOrderModal.receiptToken
      );

      const updated = attachPaymentReceipt(createdOrderModal.id, {
        fileName: uploadRes.fileName,
        storagePath: uploadRes.storagePath,
        url: uploadRes.url,
        source: 'modal-checkout'
      });

      if (updated) {
        setCreatedOrderModal(updated);
        setReceiptUploadedModal(true);
        showToast('Comprovativo submetido com sucesso! Em conferência financeira.');
      }
    } catch (err) {
      showToast(`Erro no envio: ${err.message || 'Falha no ficheiro'}`);
    } finally {
      setUploadingReceiptModal(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #F37021, #D95D12)',
            color: '#FFF',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(243, 112, 33, 0.4)',
            zIndex: 2500,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '700',
            fontSize: '0.95rem'
          }}
        >
          <CheckCircle size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Favorites / Wishlist Modal */}
      {isWishlistOpen && (
        <div className="modal-overlay" onClick={() => setIsWishlistOpen(false)} style={{ zIndex: 1300 }}>
          <div
            className="modal-content"
            style={{ maxWidth: '640px', width: '95%', maxHeight: '88vh', overflowY: 'auto', padding: '24px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Heart size={22} color="#F37021" fill="#F37021" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  {t('favoritesTitle')} ({wishlistProducts.length})
                </h3>
              </div>
              <button onClick={() => setIsWishlistOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {wishlistProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <Heart size={48} color="var(--text-light)" style={{ marginBottom: '12px' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{t('favoritesEmpty')}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {t('favoritesEmptySub')}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {wishlistProducts.map(rawProd => {
                  const prod = getTranslatedProduct(rawProd, lang);
                  const effectivePrice = getEffectivePrice(prod);
                  const outOfStock = Number(prod.stock) <= 0;
                  const slug = prod.slug || createSlug(prod.name);

                  return (
                    <div
                      key={prod.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '12px',
                        borderRadius: '14px',
                        border: '1px solid var(--border-light)',
                        background: 'var(--bg-body)',
                        flexWrap: 'wrap'
                      }}
                    >
                      <img
                        key={prod.image_url || prod.image}
                        src={prod.image_url || prod.image}
                        alt={prod.name}
                        style={{
                          width: '68px',
                          height: '68px',
                          objectFit: 'contain',
                          background: '#FFF',
                          borderRadius: '10px',
                          padding: '4px',
                          border: '1px solid var(--border-light)'
                        }}
                        onError={(e) => {
                          if (prod.fallbackImage && e.currentTarget.src !== prod.fallbackImage) {
                            e.currentTarget.src = prod.fallbackImage;
                          } else if (prod.svgFallbackImage) {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = prod.svgFallbackImage;
                          } else {
                            e.currentTarget.onerror = null;
                          }
                        }}
                      />

                      <div style={{ flex: 1, minWidth: '160px' }}>
                        <Link
                          to={`/produto/${slug}`}
                          onClick={() => setIsWishlistOpen(false)}
                          style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', textDecoration: 'none', display: 'block' }}
                        >
                          {prod.name}
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span style={{ color: 'var(--primary-orange)', fontWeight: 800, fontSize: '0.95rem' }}>
                            {formatPriceKz(effectivePrice, lang)}
                          </span>
                          {outOfStock && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#DC2626', background: '#FEE2E2', padding: '2px 7px', borderRadius: '6px' }}>
                              {t('outOfStock')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {outOfStock ? (
                          <a
                            href={`https://wa.me/244950752933?text=${encodeURIComponent(
                              `Olá AQUI TEM! Gostaria de consultar a reposição/importação do produto "${prod.name}".`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nav-btn"
                            style={{ padding: '8px 12px', fontSize: '0.78rem', background: '#25D366', color: '#FFF', textDecoration: 'none', border: 'none' }}
                          >
                            <MessageCircle size={14} /> {t('askRestockWhatsApp')}
                          </a>
                        ) : (
                          <button
                            className="nav-btn nav-btn-orange"
                            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                            onClick={() => {
                              addToCart(prod);
                            }}
                          >
                            <Plus size={14} /> {t('addToCart')}
                          </button>
                        )}

                        <Link
                          to={`/produto/${slug}`}
                          onClick={() => setIsWishlistOpen(false)}
                          className="nav-btn nav-btn-icon"
                          title={t('openProductPage')}
                        >
                          <ExternalLink size={15} />
                        </Link>

                        <button
                          className="nav-btn nav-btn-icon"
                          onClick={() => toggleWishlist(prod.id)}
                          title={t('removeFavorite')}
                          style={{ color: '#DC2626' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag size={22} color="var(--primary-orange)" />
                <h3 style={{ fontSize: '1.2rem' }}>{t('cart')}</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="cart-body">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto' }}>
                  <ShoppingBag size={56} color="var(--text-light)" style={{ marginBottom: '12px' }} />
                  <h4>{t('cartEmpty')}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                    {t('cartEmptySub')}
                  </p>
                </div>
              ) : (
                <>
                  {cart.map(rawItem => {
                    const item = getTranslatedProduct(rawItem, lang);
                    const itemPrice = getEffectivePrice(item);
                    return (
                      <div key={item.id} className="cart-item">
                        <img
                          key={item.image_url || item.image}
                          src={item.image_url || item.image}
                          alt={item.name}
                          className="cart-item-img"
                          onError={(e) => {
                            if (item.fallbackImage && e.currentTarget.src !== item.fallbackImage) {
                              e.currentTarget.src = item.fallbackImage;
                            } else if (item.svgFallbackImage) {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = item.svgFallbackImage;
                            } else {
                              e.currentTarget.onerror = null;
                            }
                          }}
                        />
                        <div className="cart-item-details">
                          <div className="cart-item-title">{item.name}</div>
                          <div className="cart-item-price">
                            {formatPriceKz(itemPrice * (item.quantity || 1), lang)}
                          </div>
                          <div className="qty-controls">
                            <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>
                              <Minus size={14} />
                            </button>
                            <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{item.quantity}</span>
                            <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--text-light)' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}

                  {/* Cupom de Desconto */}
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input
                      type="text"
                      placeholder={t('couponPlaceholder')}
                      className="form-input"
                      value={coupon}
                      onChange={e => setCoupon(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="nav-btn" style={{ padding: '8px 16px' }}>
                      {t('apply')}
                    </button>
                  </form>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-summary-row">
                  <span>{t('subtotal')}:</span>
                  <span>{formatPriceKz(subtotal, lang)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="cart-summary-row" style={{ color: 'var(--accent-green)' }}>
                    <span>{t('couponDiscount')}:</span>
                    <span>-{formatPriceKz(discountAmount, lang)}</span>
                  </div>
                )}
                <div className="cart-summary-row">
                  <span>{t('delivery')}:</span>
                  <span>
                    {shippingFee === 0 ? (
                      <strong style={{ color: 'var(--accent-green)' }}>{t('free')}</strong>
                    ) : (
                      formatPriceKz(shippingFee, lang)
                    )}
                  </span>
                </div>
                <div className="cart-summary-total">
                  <span>Total:</span>
                  <span>{formatPriceKz(finalTotal, lang)}</span>
                </div>

                <button
                  className="nav-btn nav-btn-orange"
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    fontWeight: 800,
                    justifyContent: 'center',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(255, 101, 0, 0.35)'
                  }}
                  onClick={() => {
                    setIsCartOpen(false);
                    setDirectCheckoutItem(null);
                    navigate('/checkout');
                  }}
                >
                  <ShoppingBag size={20} /> Finalizar Compra
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* In-Store Checkout Modal */}
      {isCheckoutOpen && (
        <div
          className="modal-overlay"
          onClick={() => {
            setIsCheckoutOpen(false);
            setDirectCheckoutItem(null);
            setCreatedOrderModal(null);
          }}
          style={{ zIndex: 1400 }}
        >
          <div
            className="modal-content"
            style={{ maxWidth: '580px', padding: '28px', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="btn-close-modal"
              onClick={() => {
                setIsCheckoutOpen(false);
                setDirectCheckoutItem(null);
                setCreatedOrderModal(null);
              }}
            >
              <X size={20} />
            </button>

            {createdOrderModal ? (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: '#10B981',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px'
                    }}
                  >
                    <CheckCircle size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-main)' }}>
                    Encomenda #{createdOrderModal.id} Criada!
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: 0 }}>
                    Estado: <strong style={{ color: '#D97706' }}>{createdOrderModal.statusLabel || createdOrderModal.status}</strong>
                  </p>
                </div>

                {/* Coordenadas de Pagamento */}
                <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <CreditCard size={18} color="var(--primary-orange)" />
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>Coordenadas Bancárias Oficiais:</strong>
                  </div>

                  <div style={{ display: 'grid', gap: '8px', fontSize: '0.84rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MULTICAIXA EXPRESS / PAYPAY</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#1E5C9E', fontSize: '0.98rem' }}>931396515</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyModal('931396515', 'mcx-m')}
                        className="nav-btn"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        {copiedKeyModal === 'mcx-m' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>BANCO BFA (IBAN)</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.88rem' }}>AO06.0006.0000.9803.5265.3011.9</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyModal('AO06000600009803526530119', 'bfa-m')}
                        className="nav-btn"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        {copiedKeyModal === 'bfa-m' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TITULAR DA CONTA</div>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.82rem' }}>SAMUEL JOÃO AGOSTINHO KASSAMANO</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyModal('SAMUEL JOÃO AGOSTINHO KASSAMANO', 'titular-m')}
                        className="nav-btn"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        {copiedKeyModal === 'titular-m' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TOTAL A TRANSFERIR</div>
                        <div style={{ fontWeight: 900, color: 'var(--primary-orange)', fontSize: '1rem' }}>
                          {Number(createdOrderModal.total || grandTotal).toLocaleString('pt-AO')} Kz
                        </div>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700 }}>{deliveryEstimate.formattedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Upload de Comprovativo */}
                <div style={{ border: '1px dashed var(--border-light)', borderRadius: '12px', padding: '16px', marginBottom: '20px', background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Upload size={18} color="var(--primary-orange)" />
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>Anexar Comprovativo (Imagem / PDF):</strong>
                  </div>

                  {receiptUploadedModal ? (
                    <div style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={18} />
                      <span>Comprovativo anexado! A aguardar conferência financeira pelo administrador.</span>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={e => setReceiptFileModal(e.target.files?.[0] || null)}
                        style={{ fontSize: '0.82rem', marginBottom: '10px', width: '100%' }}
                      />
                      <button
                        type="button"
                        onClick={handleModalUploadReceipt}
                        disabled={!receiptFileModal || uploadingReceiptModal}
                        className="nav-btn nav-btn-orange"
                        style={{ width: '100%', padding: '10px', justifyContent: 'center', fontWeight: 800, fontSize: '0.88rem' }}
                      >
                        <Upload size={16} />
                        <span>{uploadingReceiptModal ? 'A Enviar Documento...' : 'ENVIAR COMPROVATIVO'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <Link
                    to={`/cliente?tracking=${createdOrderModal.id}`}
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setCreatedOrderModal(null);
                    }}
                    className="nav-btn nav-btn-orange"
                    style={{ textDecoration: 'none', padding: '10px 18px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>Ver Área do Cliente</span>
                    <ExternalLink size={14} />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setCreatedOrderModal(null);
                    }}
                    className="nav-btn"
                    style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                  <div
                    style={{
                      background: 'var(--primary-orange)',
                      color: '#FFF',
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <ShoppingBag size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>
                      Finalizar Encomenda
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      AQUI TEM Angola — Checkout Oficial
                    </p>
                  </div>
                </div>

                <form onSubmit={handleInStoreCheckoutSubmit}>
                  <div className="form-group">
                    <label className="form-label">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Manuel António Domingos"
                      className="form-input"
                      value={checkoutForm.name}
                      onChange={e => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Telemóvel *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+244 923 000 000"
                        className="form-input"
                        value={checkoutForm.phone}
                        onChange={e => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">E-mail *</label>
                      <input
                        type="email"
                        required
                        placeholder="seuemail@gmail.com"
                        className="form-input"
                        value={checkoutForm.email}
                        onChange={e => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Província & Município */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Província *</label>
                      <select
                        className="form-input"
                        value={checkoutForm.province}
                        onChange={e => handleProvinceChange(e.target.value)}
                      >
                        {ANGOLA_PROVINCES.map(prov => (
                          <option key={prov.name} value={prov.name}>
                            {prov.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Município *</label>
                      <select
                        className="form-input"
                        value={checkoutForm.municipality}
                        onChange={e => setCheckoutForm({ ...checkoutForm, municipality: e.target.value })}
                      >
                        {selectedProvinceData.municipalities.map(muni => (
                          <option key={muni} value={muni}>
                            {muni}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Endereço Completo de Entrega *</label>
                    <input
                      type="text"
                      required
                      placeholder="Bairro, Rua, Ponto de Referência"
                      className="form-input"
                      value={checkoutForm.address}
                      onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Método de Pagamento</label>
                    <select
                      className="form-input"
                      value={checkoutForm.paymentMethod}
                      onChange={e => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value })}
                    >
                      <option value="Transferência Bancária">Transferência Bancária (Banco BFA)</option>
                      <option value="Multicaixa Express">Multicaixa Express / PayPay (931396515)</option>
                    </select>
                  </div>

                  {/* Resumo da Encomenda (Sem linha de subtotal conforme directiva) */}
                  <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '12px', margin: '14px 0', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: 'var(--primary-orange)', fontWeight: 600, marginBottom: '6px' }}>
                      <span>Taxa de Transporte ({checkoutForm.province}):</span>
                      <strong>{deliveryFee.toLocaleString('pt-AO')} Kz</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#10B981', marginBottom: '8px' }}>
                      <span>Previsão de Entrega (3 Dias Úteis):</span>
                      <strong>{deliveryEstimate.formattedDate}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
                      <span>TOTAL A PAGAR:</span>
                      <span style={{ color: 'var(--primary-orange)' }}>{Number(grandTotal).toLocaleString('pt-AO')} Kz</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingModal || itemsToOrder.length === 0}
                    className="nav-btn nav-btn-orange"
                    style={{ width: '100%', padding: '12px', justifyContent: 'center', fontWeight: 900, fontSize: '0.95rem' }}
                  >
                    <CheckCircle size={18} />
                    <span>{isSubmittingModal ? 'A Registar...' : 'CONFIRMAR ENCOMENDA'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
