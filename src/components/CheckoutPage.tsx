import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, CheckCircle2, Truck, CreditCard, QrCode, Banknote, Building2, Check, User, MapPin } from 'lucide-react';
import { CartItem, ShippingAddress, OrderDetails } from '../types/store';
import { useAuth } from '../context/AuthContext';

interface CheckoutPageProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  total: number;
  onOrderComplete: (order: OrderDetails) => void;
  onGoToCart: () => void;
  onGoHome: () => void;
  onOpenAuthModal: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  subtotal,
  discount,
  couponCode,
  shipping,
  total,
  onOrderComplete,
  onGoToCart,
  onGoHome,
  onOpenAuthModal,
}) => {
  const { user, profile, addresses, saveAddress } = useAuth();
  const [step, setStep] = useState<'address' | 'payment' | 'confirmed'>('address');

  // Address state
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: profile?.displayName || 'Rohan Varma',
    email: user?.email || profile?.email || 'rohan.varma@example.com',
    phone: profile?.phone || '9876543210',
    addressLine1: 'Flat 402, Green Meadows, MG Road',
    addressLine2: 'Near Central Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
  });

  // Pre-fill if user has saved addresses in MySQL
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      setAddress(addresses[0]);
    } else if (user?.email) {
      setAddress((prev) => ({
        ...prev,
        email: user.email || prev.email,
        fullName: profile?.displayName || user.displayName || prev.fullName,
      }));
    }
  }, [addresses, user, profile]);

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('rohan@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);

  const handlePincodeChange = (pin: string) => {
    setAddress((prev) => ({ ...prev, postalCode: pin }));
    if (pin.length === 6) {
      if (pin.startsWith('400')) setAddress((prev) => ({ ...prev, city: 'Mumbai', state: 'Maharashtra' }));
      else if (pin.startsWith('110')) setAddress((prev) => ({ ...prev, city: 'New Delhi', state: 'Delhi' }));
      else if (pin.startsWith('560')) setAddress((prev) => ({ ...prev, city: 'Bengaluru', state: 'Karnataka' }));
      else if (pin.startsWith('380')) setAddress((prev) => ({ ...prev, city: 'Ahmedabad', state: 'Gujarat' }));
      else if (pin.startsWith('500')) setAddress((prev) => ({ ...prev, city: 'Hyderabad', state: 'Telangana' }));
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.addressLine1 || !address.postalCode) {
      return;
    }
    // Automatically save address to MySQL database for logged in user
    if (user) {
      await saveAddress(address);
    }
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    const orderNumber = `PROT-${Math.floor(100000 + Math.random() * 900000)}`;
    const createdOrder: OrderDetails = {
      orderId: orderNumber,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      items,
      subtotal,
      discount,
      couponCode,
      shipping,
      total,
      paymentMethod,
      shippingAddress: address,
      estimatedDelivery: '3-4 Business Days',
    };

    // Store order into MySQL backend
    try {
      await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createdOrder.orderId,
          firebaseUid: user?.uid || null,
          customerName: address.fullName,
          customerEmail: address.email,
          customerPhone: address.phone,
          totalAmount: total,
          discountAmount: discount,
          shippingFee: shipping,
          paymentMethod,
          shippingAddress: address,
          items,
        }),
      });
    } catch (err) {
      console.warn('MySQL order dispatch notice:', err);
    }

    setTimeout(() => {
      setIsProcessing(false);
      setConfirmedOrder(createdOrder);
      setStep('confirmed');
      onOrderComplete(createdOrder);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  if (step === 'confirmed' && confirmedOrder) {
    return (
      <div className="bg-[#fbf7f0] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#e4d6c0] p-6 sm:p-10 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-[#e8f5e9] text-[#00632d] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#14361e] mb-2">
            Order Confirmed!
          </h2>
          <p className="text-xs sm:text-sm text-[#665946] mb-6">
            Thank you for ordering with Theproteino! Your fresh batch is being packed at our Gujarat roastery.
          </p>

          <div className="p-4 bg-[#faf5ec] rounded-2xl border border-[#e8ddcb] text-left mb-6 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#786b59]">Order ID:</span>
              <span className="font-mono font-bold text-[#00632d]">{confirmedOrder.orderId}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#786b59]">Delivery To:</span>
              <span className="font-bold text-[#1a221b]">
                {confirmedOrder.shippingAddress.fullName}, {confirmedOrder.shippingAddress.city} ({confirmedOrder.shippingAddress.postalCode})
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#786b59]">Payment Method:</span>
              <span className="font-bold text-[#1a221b]">{confirmedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-xs pt-2 border-t border-[#e8ddcb]">
              <span className="font-bold text-[#1a221b]">Total Paid:</span>
              <span className="font-mono font-bold text-base text-[#00632d]">
                ₹{confirmedOrder.total.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={onGoHome}
            className="w-full py-3.5 bg-[#00632d] hover:bg-[#004d23] text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Back to Storefront
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fbf7f0] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#e6dbc8]">
          <div>
            <button
              onClick={onGoToCart}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00632d] hover:underline mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Shopping Bag</span>
            </button>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#14361e]">
              Secure Checkout
            </h1>
          </div>

          {/* User Auth banner */}
          {!user ? (
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-[#e4d6c0] shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#eaf4ec] text-[#00632d] flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-[#1a221b]">Have an account?</div>
                <div className="text-[#786b59]">Sign in to use saved addresses</div>
              </div>
              <button
                onClick={onOpenAuthModal}
                className="ml-2 px-3 py-1.5 bg-[#00632d] text-white text-xs font-bold rounded-lg hover:bg-[#004d23] cursor-pointer"
              >
                Sign In
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#eaf4ec] px-4 py-2 rounded-2xl border border-[#c8e6c9]">
              <span className="text-xs font-bold text-[#00632d]">
                Signed in as {profile?.displayName || user.email} (MySQL Connected)
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Area */}
          <div className="lg:col-span-8">
            {step === 'address' ? (
              <form onSubmit={handleAddressSubmit} className="bg-white rounded-3xl border border-[#e4d6c0] p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#f0e7d8] pb-4">
                  <h2 className="font-display text-xl font-bold text-[#14361e] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#00632d]" />
                    <span>1. Shipping & Contact Information</span>
                  </h2>
                  <span className="text-xs font-bold text-[#00632d] bg-[#eaf4ec] px-2.5 py-1 rounded-full">
                    Step 1 of 2
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#3d3121] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3d3121] mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#3d3121] mb-1">
                      Email Address * (For order invoices & tracking)
                    </label>
                    <input
                      type="email"
                      required
                      value={address.email}
                      onChange={(e) => setAddress({ ...address, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#3d3121] mb-1">
                      Address Line 1 (Flat, House no., Building, Apartment) *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.addressLine1}
                      onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#3d3121] mb-1">
                      Address Line 2 (Area, Street, Sector, Landmark)
                    </label>
                    <input
                      type="text"
                      value={address.addressLine2 || ''}
                      onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3d3121] mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={address.postalCode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b] font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3d3121] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#3d3121] mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#f0e7d8] flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-[#00632d] hover:bg-[#004d23] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Continue to Payment →
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-3xl border border-[#e4d6c0] p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#f0e7d8] pb-4">
                  <h2 className="font-display text-xl font-bold text-[#14361e] flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#00632d]" />
                    <span>2. Select Payment Method</span>
                  </h2>
                  <button
                    onClick={() => setStep('address')}
                    className="text-xs font-bold text-[#00632d] hover:underline cursor-pointer"
                  >
                    Edit Address
                  </button>
                </div>

                {/* Delivery Preview */}
                <div className="p-4 bg-[#faf5ec] rounded-2xl border border-[#eae0ce] text-xs text-[#524434]">
                  <span className="font-bold text-[#1a221b]">Shipping to: </span>
                  {address.fullName}, {address.addressLine1}, {address.city}, {address.state} - {address.postalCode} ({address.phone})
                </div>

                {/* Payment Selection Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'UPI', label: 'Instant UPI', icon: QrCode },
                    { id: 'Card', label: 'Debit/Credit', icon: CreditCard },
                    { id: 'NetBanking', label: 'NetBanking', icon: Building2 },
                    { id: 'COD', label: 'Cash on Del.', icon: Banknote },
                  ].map((p) => {
                    const Icon = p.icon;
                    const isSelected = paymentMethod === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPaymentMethod(p.id as any)}
                        className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#eaf4ec] border-[#00632d] text-[#00632d] font-bold shadow-sm'
                            : 'bg-white border-[#d6c7b0] text-[#544737] hover:bg-[#faf5ec]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{p.label}</span>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === 'UPI' && (
                  <div className="p-4 bg-[#faf5ec] rounded-2xl border border-[#eae0ce] space-y-3">
                    <label className="block text-xs font-bold text-[#3d3121]">
                      Enter UPI ID (Google Pay / PhonePe / Paytm / BHIM)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="mobile@upi"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#d6c7b0] rounded-xl focus:ring-2 focus:ring-[#00632d] text-[#1a221b] font-mono font-bold"
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-[#f0e7d8] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('address')}
                    className="text-xs font-bold text-[#786b59] hover:underline cursor-pointer"
                  >
                    ← Back to Address
                  </button>

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="px-8 py-3.5 bg-[#00632d] hover:bg-[#004d23] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <span>Securing Order in MySQL...</span>
                    ) : (
                      <span>Place Order · ₹{total.toLocaleString()}</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Items Summary */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-[#e4d6c0] p-6 shadow-sm space-y-4">
            <h3 className="font-display text-base font-bold text-[#14361e] pb-2 border-b border-[#f0e7d8]">
              Your Order ({items.reduce((acc, it) => acc + it.quantity, 0)} Items)
            </h3>

            <div className="divide-y divide-[#f0e7d8] max-h-80 overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={`${it.product.id}-${it.selectedSize}`} className="py-3 flex gap-3 items-center">
                  <img
                    src={it.product.image}
                    alt={it.product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-[#faf5ec] border border-[#e4d6c0] shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="font-bold text-[#1a221b] truncate">{it.product.name}</div>
                    <div className="text-[11px] text-[#786b59]">
                      {it.selectedSize} · Qty: {it.quantity}
                    </div>
                  </div>
                  <div className="text-xs font-bold font-mono text-[#00632d]">
                    ₹{(it.unitPrice * it.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#f0e7d8] space-y-2 text-xs">
              <div className="flex justify-between text-[#665744]">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-[#1a221b]">₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#00632d]">
                  <span>Discount</span>
                  <span className="font-mono font-bold">-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[#665744]">
                <span>Shipping</span>
                <span className="font-mono font-bold text-[#00632d]">
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              <div className="pt-2 border-t border-[#f0e7d8] flex justify-between items-baseline">
                <span className="font-bold text-[#1a221b] text-sm">Total</span>
                <span className="font-bold font-mono text-lg text-[#00632d]">
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#7d705c]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00632d]" />
              <span>Verified SSL 256-bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
