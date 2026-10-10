import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useCRM } from '../context/CRMContext';
import { getTranslatedProduct } from '../utils/productTranslations';
import { createSlug } from '../utils/slug';

export default function StoreDrawers() {
  const { lang, t } = useLanguage();
  const { captureLead } = useCRM();
  const {
    cart,
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

  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Luanda',
    paymentMethod: 'Pagamento na entrega',
    notes: ''
  });

  const checkoutItems = directCheckoutItem ? [directCheckoutItem] : cart;

  const handleWhatsAppCheckoutSubmit = (e) => {
    e.preventDefault();

    if (!checkoutForm.name.trim() || !checkoutForm.address.trim()) {
      showToast(
        lang === 'en'
          ? 'Please fill in your full name and delivery address in Angola.'
          : 'Por favor, preencha o seu nome completo e endereço de entrega.'
      );
      return;
    }

    const itemsToOrder = checkoutItems.length > 0 ? checkoutItems : cart;
    if (itemsToOrder.length === 0) {
      showToast(lang === 'en' ? 'Your cart is empty.' : 'O seu carrinho está vazio.');
      return;
    }

    let message = '';
    const isSingle = itemsToOrder.length === 1;

    if (isSingle) {
      const single = getTranslatedProduct(itemsToOrder[0], lang);
      const unitPrice = getEffectivePrice(single);
      const qty = Number(single.quantity) || 1;
      const itemTotal = unitPrice * qty;

      message = `Olá AQUI TEM!\n\n`;
      message += `Quero fazer um pedido:\n\n`;
      message += `Produto:\n${single.name}\n\n`;
      message += `Quantidade:\n${qty}\n\n`;
      message += `Preço:\n${formatPriceKz(itemTotal, lang)}\n\n`;
      message += `Nome:\n${checkoutForm.name.trim()}\n\n`;
      message += `Telefone:\n${checkoutForm.phone.trim() || '+244 950 752 933'}\n\n`;
      message += `Endereço:\n${checkoutForm.address.trim()}\n\n`;
      message += `Província:\n${checkoutForm.city.trim() || 'Luanda'}\n\n`;
      message += `Método de pagamento:\n${checkoutForm.paymentMethod}`;
      if (checkoutForm.notes.trim()) {
        message += `\n\nObservações:\n${checkoutForm.notes.trim()}`;
      }
    } else {
      message = `Olá AQUI TEM!\n\n`;
      message += `Quero fazer este pedido:\n\n`;

      itemsToOrder.forEach((rawItem, idx) => {
        const item = getTranslatedProduct(rawItem, lang);
        const unitPrice = getEffectivePrice(item);
        const qty = Number(item.quantity) || 1;
        message += `${idx + 1}. ${item.name}\n`;
        message += `Quantidade: ${qty}\n`;
        message += `Preço: ${formatPriceKz(unitPrice * qty, lang)}\n\n`;
      });

      message += `TOTAL: ${formatPriceKz(finalTotal, lang)}\n\n`;
      message += `Nome:\n${checkoutForm.name.trim()}\n\n`;
      message += `Telefone:\n${checkoutForm.phone.trim() || '+244 950 752 933'}\n\n`;
      message += `Endereço:\n${checkoutForm.address.trim()}\n\n`;
      message += `Província:\n${checkoutForm.city.trim() || 'Luanda'}\n\n`;
      message += `Pagamento:\n${checkoutForm.paymentMethod}`;
      if (checkoutForm.notes.trim()) {
        message += `\n\nObservações:\n${checkoutForm.notes.trim()}`;
      }
    }

    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = '244950752933';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    const computedTotal = isSingle
      ? getEffectivePrice(itemsToOrder[0]) * (Number(itemsToOrder[0].quantity) || 1)
      : finalTotal;

    captureLead({
      name: checkoutForm.name.trim(),
      phone: checkoutForm.phone.trim() || '950752933',
      city: checkoutForm.city.trim() || 'Luanda',
      address: checkoutForm.address.trim() || 'Angola',
      productName: itemsToOrder.map(i => i.name).join(', ') || 'Pedido AQUI TEM',
      totalValue: computedTotal,
      notes: `Pagamento: ${checkoutForm.paymentMethod}${checkoutForm.notes ? ` | Obs: ${checkoutForm.notes}` : ''}`
    });

    const a = document.createElement('a');
    a.href = whatsappUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setIsCheckoutOpen(false);
    setDirectCheckoutItem(null);
    setIsCartOpen(false);
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
                        src={prod.image_url || prod.image}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
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
                          e.currentTarget.onerror = null;
                          if (prod.fallbackImage) e.currentTarget.src = prod.fallbackImage;
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
                          src={item.image_url || item.image}
                          alt={item.name}
                          className="cart-item-img"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            if (item.fallbackImage) e.currentTarget.src = item.fallbackImage;
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
                  className="btn-whatsapp-checkout"
                  onClick={() => {
                    setDirectCheckoutItem(null);
                    setIsCheckoutOpen(true);
                  }}
                >
                  <Send size={20} /> {t('checkoutWhatsApp')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WhatsApp Checkout Form Modal */}
      {isCheckoutOpen && (
        <div
          className="modal-overlay"
          onClick={() => {
            setIsCheckoutOpen(false);
            setDirectCheckoutItem(null);
          }}
          style={{ zIndex: 1400 }}
        >
          <div
            className="modal-content"
            style={{ maxWidth: '520px', padding: '28px', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="btn-close-modal"
              onClick={() => {
                setIsCheckoutOpen(false);
                setDirectCheckoutItem(null);
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div
                style={{
                  background: '#25D366',
                  color: '#FFF',
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{t('checkoutTitle')}</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  AQUI TEM — {t('siteSlogan')}
                </p>
              </div>
            </div>

            <form onSubmit={handleWhatsAppCheckoutSubmit}>
              <div className="form-group">
                <label className="form-label">{t('fullName')} *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manuel Kassamano"
                  className="form-input"
                  value={checkoutForm.name}
                  onChange={e => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('phoneWhatsApp')} *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: +244 923 000 000"
                  className="form-input"
                  value={checkoutForm.phone}
                  onChange={e => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('deliveryAddress')} *</label>
                <input
                  type="text"
                  required
                  placeholder={
                    lang === 'en'
                      ? 'Neighborhood, Street, Reference Point'
                      : 'Bairro, Rua ou Ponto de Referência'
                  }
                  className="form-input"
                  value={checkoutForm.address}
                  onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('provinceCity')} *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Luanda"
                  className="form-input"
                  value={checkoutForm.city}
                  onChange={e => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('paymentMethod')}</label>
                <select
                  className="form-input"
                  value={checkoutForm.paymentMethod}
                  onChange={e => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value })}
                >
                  <option value="Pagamento na entrega">{t('payOnDelivery')}</option>
                  <option value="Multicaixa">{t('multicaixaOpt')}</option>
                  <option value="Dinheiro/Cash">{t('cashOpt')}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('notesLabel')}</label>
                <textarea
                  rows={2}
                  placeholder={t('notesPlaceholder')}
                  className="form-input"
                  style={{ resize: 'vertical' }}
                  value={checkoutForm.notes}
                  onChange={e => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-whatsapp-checkout" style={{ marginTop: '18px' }}>
                <Send size={20} /> {t('sendOrderWhatsApp')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
