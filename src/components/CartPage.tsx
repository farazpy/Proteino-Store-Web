import React from 'react';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { CartItem } from '../types/store';

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, size: string, quantity: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onProceedToCheckout: () => void;
  onGoHome: () => void;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => boolean;
  onRemoveCoupon: () => void;
  discountAmount: number;
}

export const CartPage: React.FC<CartPageProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onGoHome,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  discountAmount,
}) => {
  const [couponInput, setCouponInput] = React.useState('');
  const [couponError, setCouponError] = React.useState<string | null>(null);

  const subtotal = items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const FREE_SHIPPING_THRESHOLD = 499;
  const progressToFreeShipping = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0 ? 0 : 70;
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponInput.trim()) return;
    const ok = onApplyCoupon(couponInput.trim().toUpperCase());
    if (!ok) {
      setCouponError('Invalid coupon code. Try PROTEIN15 or FREESHAKER');
    } else {
      setCouponInput('');
    }
  };

  return (
    <div className="bg-[#fbf7f0] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#e6dbc8]">
          <div>
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00632d] hover:underline mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </button>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#14361e] flex items-center gap-3">
              <span>Your Shopping Bag</span>
              <span className="text-base font-mono text-[#00632d] bg-[#eaf4ec] px-3 py-1 rounded-full font-bold">
                {items.reduce((acc, it) => acc + it.quantity, 0)} Items
              </span>
            </h1>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#e4d6c0] p-8 max-w-lg mx-auto shadow-sm">
            <div className="w-20 h-20 rounded-full bg-[#f4ecdf] flex items-center justify-center text-4xl mx-auto mb-4">
              🥜
            </div>
            <h2 className="font-display text-2xl font-bold text-[#1a221b] mb-2">
              Your Bag is Empty
            </h2>
            <p className="text-xs sm:text-sm text-[#786b59] mb-8 leading-relaxed">
              Explore our slow-roasted peanut butter, 26g cold brew protein powders, and high-protein masala oats.
            </p>
            <button
              onClick={onGoHome}
              className="px-8 py-3.5 bg-[#00632d] hover:bg-[#004d23] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Explore Best Sellers →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Shipping Progress Card */}
              <div className="bg-white rounded-2xl border border-[#e4d6c0] p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-[#1a221b] mb-2">
                  <span>
                    {amountNeededForFreeShipping === 0 ? (
                      <span className="text-[#00632d] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#8ee000]" />
                        <span>Congratulations! You've unlocked FREE Express Shipping!</span>
                      </span>
                    ) : (
                      <span>Add ₹{amountNeededForFreeShipping} more to get FREE Shipping!</span>
                    )}
                  </span>
                  <span className="font-mono text-[#00632d]">₹{FREE_SHIPPING_THRESHOLD} Target</span>
                </div>
                <div className="w-full h-2.5 bg-[#f0e8dc] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8ee000] to-[#00632d] transition-all duration-500 rounded-full"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-3xl border border-[#e4d6c0] overflow-hidden shadow-sm divide-y divide-[#f0e7d8]">
                {items.map((it) => (
                  <div key={`${it.product.id}-${it.selectedSize}`} className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-center">
                    <img
                      src={it.product.image}
                      alt={it.product.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-[#faf5ec] border border-[#e8ddcb] shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-[#00632d] uppercase tracking-wider">
                            {it.product.category}
                          </span>
                          <h3 className="font-display text-sm sm:text-base font-bold text-[#1a221b] truncate mt-0.5">
                            {it.product.name}
                          </h3>
                          <div className="text-xs text-[#7d705d] mt-1 flex items-center gap-2">
                            <span className="bg-[#faf5ec] px-2 py-0.5 rounded border border-[#e8ddcb] font-semibold text-[11px]">
                              Size: {it.selectedSize}
                            </span>
                            {it.selectedFlavor && (
                              <span className="bg-[#faf5ec] px-2 py-0.5 rounded border border-[#e8ddcb] font-semibold text-[11px]">
                                Flavor: {it.selectedFlavor}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveItem(it.product.id, it.selectedSize)}
                          className="p-1.5 text-[#9e907d] hover:text-[#d90429] hover:bg-[#fff0f2] rounded-lg transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-[#d6c7b0] rounded-xl overflow-hidden bg-[#faf5ec]">
                          <button
                            onClick={() => onUpdateQuantity(it.product.id, it.selectedSize, it.quantity - 1)}
                            className="p-1.5 sm:p-2 hover:bg-[#ede2d1] text-[#332a1f] transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold text-[#1a221b]">
                            {it.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(it.product.id, it.selectedSize, it.quantity + 1)}
                            className="p-1.5 sm:p-2 hover:bg-[#ede2d1] text-[#332a1f] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-base sm:text-lg font-bold text-[#00632d] font-mono tabular-nums">
                            ₹{(it.unitPrice * it.quantity).toLocaleString()}
                          </div>
                          {it.quantity > 1 && (
                            <div className="text-[10px] text-[#8a7b68] font-mono">
                              (₹{it.unitPrice} each)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Order Summary & Coupon */}
            <div className="lg:col-span-4 space-y-4">
              {/* Coupon Box */}
              <div className="bg-white rounded-3xl border border-[#e4d6c0] p-5 shadow-sm">
                <h3 className="font-display text-sm font-bold text-[#1a221b] mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#00632d]" />
                  <span>Promo / Discount Code</span>
                </h3>

                {appliedCoupon ? (
                  <div className="p-3 bg-[#e8f5e9] border border-[#a5d6a7] rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#00632d]">
                        Coupon "{appliedCoupon}" Applied!
                      </div>
                      <div className="text-[11px] text-[#2e7d32]">
                        You saved ₹{discountAmount.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. PROTEIN15"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] focus:outline-none uppercase font-mono font-bold"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#00632d] text-white text-xs font-bold rounded-xl hover:bg-[#004d23] transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-red-600">{couponError}</p>
                    )}
                    <p className="text-[10px] text-[#8a7b68]">
                      Use code <strong className="text-[#00632d]">PROTEIN15</strong> for 15% off cart total.
                    </p>
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-white rounded-3xl border border-[#e4d6c0] p-6 shadow-sm space-y-3">
                <h3 className="font-display text-base font-bold text-[#1a221b] pb-2 border-b border-[#f0e7d8]">
                  Order Summary
                </h3>

                <div className="flex justify-between text-xs text-[#544837]">
                  <span>Bag Subtotal</span>
                  <span className="font-mono font-bold text-[#1a221b]">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-[#00632d]">
                    <span>Coupon Discount</span>
                    <span className="font-mono font-bold">
                      -₹{discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-[#544837]">
                  <span>Estimated Delivery</span>
                  <span className="font-mono font-bold text-[#1a221b]">
                    {shipping === 0 ? (
                      <span className="text-[#00632d]">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#f0e7d8] flex justify-between items-baseline">
                  <div>
                    <div className="font-display text-base font-bold text-[#1a221b]">
                      Grand Total
                    </div>
                    <div className="text-[10px] text-[#8a7b68]">Inclusive of all taxes</div>
                  </div>
                  <div className="text-xl font-black text-[#00632d] font-mono tabular-nums">
                    ₹{total.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={onProceedToCheckout}
                  className="w-full mt-4 py-3.5 bg-[#00632d] hover:bg-[#004d23] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#786b59]">
                  <ShieldCheck className="w-4 h-4 text-[#00632d]" />
                  <span>100% Secure Checkout · UPI, Cards & NetBanking</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
