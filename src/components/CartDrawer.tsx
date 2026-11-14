import { CheckCircle2, Minus, Plus, ShoppingBag, Tag, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PROMO_CODES } from '../data/campaigns';
import type { CartItem, Product } from '../types/aem';
import { ResilientImage } from './ResilientImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  products: Product[];
  activePromoCode: string;
  onApplyPromoCode: (code: string) => void;
  onUpdateQuantity: (productId: string, variantId: string, delta: number) => void;
  onRemoveItem: (productId: string, variantId: string) => void;
  onClearCart: () => void;
}

const FREE_SHIPPING_THRESHOLD = 250;

export function CartDrawer({
  isOpen,
  onClose,
  items,
  products,
  activePromoCode,
  onApplyPromoCode,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [promoInput, setPromoInput] = useState(activePromoCode);
  const [promoFeedback, setPromoFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');
  const [orderNumber, setOrderNumber] = useState('');

  // Checkout form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setPromoInput(activePromoCode);
  }, [activePromoCode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const enrichedItems = useMemo(() => {
    return items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product ? { ...item, product } : null;
      })
      .filter((x): x is CartItem & { product: Product } => x !== null);
  }, [items, products]);

  const subtotal = enrichedItems.reduce(
    (sum, item) => sum + item.product.salePrice * item.quantity,
    0
  );

  const matchedRule = PROMO_CODES.find(
    (r) => r.code.toUpperCase() === activePromoCode.trim().toUpperCase()
  );
  const isPromoEligible =
    matchedRule && subtotal >= matchedRule.minSubtotal && enrichedItems.length > 0;

  const promoDiscount = isPromoEligible
    ? Math.round((subtotal * matchedRule.discountPercent) / 100)
    : 0;
  const discountedSubtotal = Math.max(0, subtotal - promoDiscount);
  const shippingCost =
    enrichedItems.length === 0 || discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 18;
  const total = discountedSubtotal + shippingCost;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal);

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = promoInput.trim().toUpperCase();
    if (!normalized) {
      onApplyPromoCode('');
      setPromoFeedback(null);
      return;
    }
    const rule = PROMO_CODES.find((r) => r.code === normalized);
    if (!rule) {
      setPromoFeedback({
        type: 'error',
        message: 'Code not recognized. Try SOLSTICE20, ACOUSTIC15, or ARCHIVE30.',
      });
      return;
    }
    if (subtotal < rule.minSubtotal) {
      setPromoFeedback({
        type: 'error',
        message: `Requires a minimum subtotal of $${rule.minSubtotal}.`,
      });
      return;
    }
    onApplyPromoCode(rule.code);
    setPromoFeedback({
      type: 'success',
      message: `${rule.code} applied (${rule.discountPercent}% seasonal offer).`,
    });
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address for order confirmation.');
      return;
    }
    if (address.trim().length < 5) {
      setFormError('Please enter a complete street delivery address.');
      return;
    }
    if (postalCode.trim().length < 3) {
      setFormError('Please enter a valid postal or ZIP code.');
      return;
    }

    setFormError('');
    const generatedId = `KS-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderNumber(generatedId);
    setCheckoutStep('confirmed');
    onClearCart();
  };

  const handleCloseDrawer = () => {
    if (checkoutStep === 'confirmed') {
      setCheckoutStep('cart');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag and Checkout"
      onClick={handleCloseDrawer}
    >
      <div
        className="w-full max-w-md bg-[#FFFFFF] border-l border-[#E4E4DF] h-full flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E4E4DF] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-[#141413]" aria-hidden="true" />
            <h2 className="font-display text-xl font-medium text-[#141413]">
              {checkoutStep === 'cart' && `Shopping Bag (${enrichedItems.reduce((a, b) => a + b.quantity, 0)})`}
              {checkoutStep === 'checkout' && 'Express Checkout'}
              {checkoutStep === 'confirmed' && 'Order Confirmed'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCloseDrawer}
            aria-label="Close bag"
            className="p-2 -mr-2 text-[#5A5A56] hover:text-[#141413] hover:bg-[#F2F2EE] rounded-md transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {checkoutStep === 'confirmed' ? (
            <div className="py-8 space-y-6">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#14532D]">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#15803D]" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">
                    Order #{orderNumber} Confirmed — Preparing Shipment
                  </p>
                  <p className="text-xs mt-1 text-[#166534]">
                    Confirmation dispatched to {email}. Estimated dispatch within 24 hours.
                  </p>
                </div>
              </div>

              <div className="border border-[#E4E4DF] rounded-lg p-5 space-y-3 text-xs">
                <p className="font-semibold text-[#141413] text-sm">Delivery Summary</p>
                <div className="flex justify-between gap-4 text-[#4A4A46]">
                  <span>Recipient</span>
                  <span className="font-medium text-[#141413]">{fullName}</span>
                </div>
                <div className="flex justify-between gap-4 text-[#4A4A46]">
                  <span>Address</span>
                  <span className="font-medium text-[#141413] text-right">
                    {address}, {postalCode}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-[#4A4A46]">
                  <span>Payment Method</span>
                  <span className="font-medium text-[#141413]">
                    {paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Studio Card Payment'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCheckoutStep('cart');
                  onClose();
                }}
                className="w-full py-3 bg-[#141413] hover:bg-[#2E2E2B] text-white text-sm font-semibold rounded-md transition-colors cursor-pointer min-h-[44px]"
              >
                Continue Browsing Campaigns
              </button>
            </div>
          ) : enrichedItems.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <p className="font-display text-xl text-[#141413]">Your bag is empty</p>
              <p className="text-sm text-[#5A5A56] max-w-xs mx-auto">
                Add lighting, acoustic hardware, or seasonal bundle editions to preview promotional pricing.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-[#141413] text-white text-xs font-semibold rounded-md hover:bg-[#2E2E2B] transition-colors cursor-pointer min-h-[40px]"
              >
                Explore Collection
              </button>
            </div>
          ) : checkoutStep === 'cart' ? (
            <div className="space-y-6">
              {/* Free Shipping Meter */}
              <div className="p-3.5 bg-[#F7F7F5] border border-[#E4E4DF] rounded-md">
                <p className="text-xs text-[#363633] mb-2 tabular-nums">
                  {remainingForFreeShipping === 0
                    ? 'Complimentary insured courier shipping unlocked.'
                    : `Add $${remainingForFreeShipping} more for complimentary 2-day courier shipping.`}
                </p>
                <div className="h-1.5 w-full bg-[#E4E4DF] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1D4ED8] transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Cart Items */}
              <ul className="divide-y divide-[#ECECE7]">
                {enrichedItems.map(({ product, variantId, variantLabel, quantity }) => (
                  <li key={`${product.id}-${variantId}`} className="py-4 flex gap-4">
                    <div className="w-20 h-16 rounded-md overflow-hidden bg-[#F2F2EE] border border-[#E4E4DF] shrink-0">
                      <ResilientImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        fallbackTitle={product.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-[#141413] truncate">
                          {product.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(product.id, variantId)}
                          aria-label={`Remove ${product.name}`}
                          className="p-1 text-[#787872] hover:text-[#B91C1C] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="text-xs text-[#5A5A56] mt-0.5">{variantLabel}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex items-center border border-[#DCDCD5] rounded-md bg-[#F7F7F5]">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, variantId, -1)}
                            aria-label="Decrease quantity"
                            className="p-1.5 text-[#363633] hover:text-[#141413] cursor-pointer min-w-[30px] min-h-[30px] flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" aria-hidden="true" />
                          </button>
                          <span className="px-2.5 text-xs font-medium tabular-nums">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, variantId, 1)}
                            aria-label="Increase quantity"
                            className="p-1.5 text-[#363633] hover:text-[#141413] cursor-pointer min-w-[30px] min-h-[30px] flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-semibold text-[#141413] tabular-nums">
                            ${product.salePrice * quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Promo Code Input */}
              <form onSubmit={handleApplyCode} className="pt-2 space-y-2">
                <label
                  htmlFor="promo-code-input"
                  className="block text-xs font-medium text-[#363633]"
                >
                  Promotional Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag
                      className="w-3.5 h-3.5 text-[#787872] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="promo-code-input"
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="SOLSTICE20"
                      className="w-full pl-8 pr-3 py-2 text-xs font-mono uppercase bg-[#F7F7F5] border border-[#DCDCD5] rounded-md text-[#141413] min-h-[40px]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#141413] hover:bg-[#2E2E2B] text-white text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
                  >
                    Apply
                  </button>
                </div>
                {promoFeedback && (
                  <p
                    className={`text-xs ${
                      promoFeedback.type === 'success' ? 'text-[#15803D]' : 'text-[#B91C1C]'
                    }`}
                  >
                    {promoFeedback.message}
                  </p>
                )}
              </form>
            </div>
          ) : (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setCheckoutStep('cart')}
                className="text-xs font-medium text-[#1D4ED8] hover:underline cursor-pointer mb-2"
              >
                ← Back to Bag Review
              </button>

              <div>
                <label htmlFor="chk-name" className="block text-xs font-medium text-[#363633] mb-1">
                  Full Name
                </label>
                <input
                  id="chk-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Lindqvist"
                  className="w-full px-3 py-2.5 text-sm bg-[#F7F7F5] border border-[#DCDCD5] rounded-md text-[#141413]"
                />
              </div>

              <div>
                <label htmlFor="chk-email" className="block text-xs font-medium text-[#363633] mb-1">
                  Email Address
                </label>
                <input
                  id="chk-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@studio.com"
                  className="w-full px-3 py-2.5 text-sm bg-[#F7F7F5] border border-[#DCDCD5] rounded-md text-[#141413]"
                />
              </div>

              <div>
                <label htmlFor="chk-address" className="block text-xs font-medium text-[#363633] mb-1">
                  Delivery Address
                </label>
                <input
                  id="chk-address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="742 Bredgade, Studio 4B"
                  className="w-full px-3 py-2.5 text-sm bg-[#F7F7F5] border border-[#DCDCD5] rounded-md text-[#141413]"
                />
              </div>

              <div>
                <label htmlFor="chk-postal" className="block text-xs font-medium text-[#363633] mb-1">
                  Postal Code
                </label>
                <input
                  id="chk-postal"
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="1260"
                  className="w-full px-3 py-2.5 text-sm font-mono bg-[#F7F7F5] border border-[#DCDCD5] rounded-md text-[#141413]"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-[#363633] mb-2">Payment Terms</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-md border cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-[#141413] bg-[#F7F7F5] text-[#141413]'
                        : 'border-[#DCDCD5] bg-[#FFFFFF] text-[#5A5A56]'
                    }`}
                  >
                    Card Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-md border cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-[#141413] bg-[#F7F7F5] text-[#141413]'
                        : 'border-[#DCDCD5] bg-[#FFFFFF] text-[#5A5A56]'
                    }`}
                  >
                    Cash on Delivery
                  </button>
                </div>
              </div>

              {formError && (
                <p className="text-xs font-medium text-[#B91C1C]" role="alert">
                  {formError}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Footer Totals */}
        {enrichedItems.length > 0 && checkoutStep !== 'confirmed' && (
          <div className="px-6 py-5 border-t border-[#E4E4DF] bg-[#F7F7F5] space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#4A4A46]">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-[#141413]">${subtotal}</span>
              </div>
              {promoDiscount > 0 && matchedRule && (
                <div className="flex justify-between text-[#15803D] font-medium">
                  <span>Promo ({matchedRule.code} · -{matchedRule.discountPercent}%)</span>
                  <span className="font-mono tabular-nums">-${promoDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-[#4A4A46]">
                <span>Courier Shipping</span>
                <span className="font-mono tabular-nums text-[#141413]">
                  {shippingCost === 0 ? 'Complimentary' : `$${shippingCost}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#141413] pt-2 border-t border-[#DCDCD5]">
                <span>Total</span>
                <span className="font-mono tabular-nums">${total}</span>
              </div>
            </div>

            {checkoutStep === 'cart' ? (
              <button
                type="button"
                onClick={() => setCheckoutStep('checkout')}
                className="w-full py-3.5 px-6 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-md transition-colors cursor-pointer min-h-[44px]"
              >
                Proceed to Checkout · ${total}
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                className="w-full py-3.5 px-6 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-md transition-colors cursor-pointer min-h-[44px]"
              >
                Confirm Order · ${total}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
