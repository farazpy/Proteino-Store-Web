import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Tag, Gift, Check } from 'lucide-react';
import { CartItem } from '../types/store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, size: string, quantity: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onProceedToCheckout: () => void;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => boolean;
  onRemoveCoupon: () => void;
  discountAmount: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  discountAmount,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const FREE_SHIPPING_THRESHOLD = 499;
  const FREE_SHAKER_THRESHOLD = 1499;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const isFreeShaker = subtotal >= FREE_SHAKER_THRESHOLD;
  const shipping = isFreeShipping || items.length === 0 ? 0 : 70;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = onApplyCoupon(couponInput.trim().toUpperCase());
    if (success) {
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon. Try "PROTEIN15" or "FREESHAKER"');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#fbf7f0] border-l border-[#e5d8c3] shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#e5d8c3] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#00632d]" />
              <h2 className="font-display text-lg font-bold text-[#1a221b]">
                Your Shopping Bag ({items.reduce((sum, item) => sum + item.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#6d604e] hover:text-[#1a221b] hover:bg-[#f1e8d8] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress to Free Shipping & Shaker */}
          <div className="bg-[#f2ecde] px-5 py-3 border-b border-[#e4d6c0] text-xs">
            {!isFreeShipping ? (
              <div className="text-[#3b3121] mb-1.5">
                Add{' '}
                <span className="font-bold text-[#00632d]">
                  ₹{FREE_SHIPPING_THRESHOLD - subtotal}
                </span>{' '}
                more to unlock <span className="font-bold">FREE Express Delivery</span>!
              </div>
            ) : !isFreeShaker ? (
              <div className="text-[#3b3121] mb-1.5">
                🎉 FREE Delivery unlocked! Add{' '}
                <span className="font-bold text-[#00632d]">
                  ₹{FREE_SHAKER_THRESHOLD - subtotal}
                </span>{' '}
                more for a <span className="font-bold">FREE Gym Shaker</span>!
              </div>
            ) : (
              <div className="text-[#00632d] font-bold flex items-center gap-1.5 mb-1.5">
                <Gift className="w-4 h-4 text-[#8ee000]" />
                <span>You unlocked FREE Delivery & FREE Gym Shaker! 🎁</span>
              </div>
            )}

            {/* Progress bar */}
            <div className="w-full bg-[#dfd2be] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#00632d] h-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    (subtotal / FREE_SHAKER_THRESHOLD) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#ece2cf]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-[#f0e7d7] flex items-center justify-center text-3xl mb-4">
                  🥜
                </div>
                <h3 className="font-display text-lg font-bold text-[#1a221b] mb-1">
                  Your bag is empty
                </h3>
                <p className="text-xs text-[#716452] max-w-xs mb-6">
                  Fill it with pure roasted peanut power, high-protein oats, and super bars!
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#00632d] text-white text-xs font-bold rounded-xl hover:bg-[#004d23] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.product.id}-${item.selectedSize}`} className="py-4 flex gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-xl object-cover border border-[#e6dbc8] bg-white shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display text-xs sm:text-sm font-bold text-[#1a221b] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                          className="text-[#9a8a76] hover:text-[#e63946] transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-[11px] text-[#716452] mt-0.5">
                        Size: <span className="font-semibold text-[#1a221b]">{item.selectedSize}</span>
                        {item.selectedFlavor && (
                          <span> · Flavor: <span className="font-semibold text-[#1a221b]">{item.selectedFlavor}</span></span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#d6c7b0] rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.product.id,
                              item.selectedSize,
                              item.quantity - 1
                            )
                          }
                          className="p-1 px-2 text-[#5a4c3a] hover:bg-[#f1e8d8] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-bold font-mono text-[#1a221b]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.product.id,
                              item.selectedSize,
                              item.quantity + 1
                            )
                          }
                          className="p-1 px-2 text-[#5a4c3a] hover:bg-[#f1e8d8] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-[#00632d] font-mono tabular-nums">
                          ₹{(item.unitPrice * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="p-5 bg-white border-t border-[#e5d8c3] shadow-lg">
              {/* Promo Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-[#e8f5e9] border border-[#a5d6a7] rounded-xl text-xs">
                    <div className="flex items-center gap-2 text-[#00632d] font-bold">
                      <Tag className="w-4 h-4" />
                      <span>Code "{appliedCoupon}" applied (-₹{discountAmount})</span>
                    </div>
                    <button
                      type="button"
                      onClick={onRemoveCoupon}
                      className="text-xs font-bold text-[#c62828] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Discount code (e.g. PROTEIN15)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-[#fbf7f0] border border-[#d6c7b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00632d] uppercase font-mono text-[#1a221b]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#2c2417] hover:bg-[#00632d] text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium">{couponError}</p>
                    )}
                  </div>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#5f5240] mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-[#1a221b]">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#00632d] font-semibold">
                    <span>Discount</span>
                    <span className="font-mono tabular-nums">-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono tabular-nums">
                    {shipping === 0 ? (
                      <span className="text-[#00632d] font-bold">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#1a221b] pt-2 border-t border-[#f0e7d8]">
                  <span>Total</span>
                  <span className="text-[#00632d] font-mono tabular-nums">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 bg-[#00632d] hover:bg-[#004d23] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#786b59] mt-3">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00632d]" />
                <span>100% Safe & Encrypted Checkout · Cash on Delivery Available</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
